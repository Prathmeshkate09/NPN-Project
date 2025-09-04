import os
import logging
import pandas as pd
import psycopg2
from psycopg2.extras import RealDictCursor
from contextlib import contextmanager
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import sqlite3

# Load environment variables
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class CibilDatabase:
    def __init__(self):
        self.database_url = os.getenv('DATABASE_URL')
        if not self.database_url:
            raise ValueError("DATABASE_URL environment variable not set.")

        self.is_sqlite = self.database_url.startswith('sqlite')

    @contextmanager
    def get_connection(self):
        """Provides a database connection."""
        conn = None
        try:
            if self.is_sqlite:
                conn = sqlite3.connect(self.database_url.replace('sqlite///', ''))
                conn.row_factory = sqlite3.Row
            else:
                conn = psycopg2.connect(self.database_url)
            yield conn
        except Exception as e:
            logger.error(f"Database connection error: {e}")
            raise
        finally:
            if conn:
                conn.close()

    def init_db(self):
        """Creates the cibil_scores table if it doesn't exist."""
        if self.is_sqlite:
            create_table_query = """
            CREATE TABLE IF NOT EXISTS cibil_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                cibil_id TEXT UNIQUE NOT NULL,
                cibil_score INTEGER NOT NULL CHECK (cibil_score >= 300 AND cibil_score <= 900),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
            """
        else:  # PostgreSQL
            create_table_query = """
            CREATE TABLE IF NOT EXISTS cibil_scores (
                id SERIAL PRIMARY KEY,
                cibil_id VARCHAR(20) UNIQUE NOT NULL,
                cibil_score INT NOT NULL CHECK (cibil_score >= 300 AND cibil_score <= 900),
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            """
        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(create_table_query)
                    conn.commit()
            logger.info("Database initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing database: {e}")
            raise

    def load_csv_to_database(self, csv_file_path: str = 'cibil_database.csv'):
        """Loads data from a CSV file into the cibil_scores table."""
        if not os.path.exists(csv_file_path):
            logger.warning(f"CSV file not found at {csv_file_path}. Skipping data load.")
            return

        df = pd.read_csv(csv_file_path)
        logger.info(f"Loaded {len(df)} records from {csv_file_path}")

        insert_query = "INSERT INTO cibil_scores (cibil_id, cibil_score) VALUES (%s, %s) ON CONFLICT (cibil_id) DO NOTHING;"
        if self.is_sqlite:
            insert_query = "INSERT OR IGNORE INTO cibil_scores (cibil_id, cibil_score) VALUES (?, ?);"

        data_tuples = [(str(row['CIBIL ID']), int(row['CIBIL Score'])) for _, row in df.iterrows()]

        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    # Clear existing data for a fresh start
                    cur.execute("DELETE FROM cibil_scores;")
                    cur.executemany(insert_query, data_tuples)
                    conn.commit()
            logger.info(f"Successfully inserted {len(data_tuples)} records into the database.")
        except Exception as e:
            logger.error(f"Error loading CSV to database: {e}")
            raise

    def get_cibil_score(self, cibil_id: str) -> Optional[int]:
        """Retrieves the CIBIL score for a given CIBIL ID."""
        query = "SELECT cibil_score FROM cibil_scores WHERE cibil_id = %s;"
        params = (cibil_id,)
        if self.is_sqlite:
            query = "SELECT cibil_score FROM cibil_scores WHERE cibil_id = ?;"

        try:
            with self.get_connection() as conn:
                with conn.cursor() as cur:
                    cur.execute(query, params)
                    result = cur.fetchone()
            return result[0] if result else None
        except Exception as e:
            logger.error(f"Error retrieving CIBIL score for ID {cibil_id}: {e}")
            return None

    def get_cibil_stats(self) -> Dict[str, Any]:
        """Returns statistics about the CIBIL data in the database."""
        query = """
        SELECT
            COUNT(*) as total_records,
            MIN(cibil_score) as min_score,
            MAX(cibil_score) as max_score,
            AVG(cibil_score) as avg_score
        FROM cibil_scores;
        """
        try:
            with self.get_connection() as conn:
                # Use RealDictCursor for PostgreSQL to get dict-like results
                cursor_factory = RealDictCursor if not self.is_sqlite else None
                with conn.cursor(cursor_factory=cursor_factory) as cur:
                    cur.execute(query)
                    stats = dict(cur.fetchone())
                    if stats.get('avg_score') and not self.is_sqlite:
                        stats['avg_score'] = round(float(stats['avg_score']), 2)
                    elif self.is_sqlite and stats.get('avg_score'):
                        stats['avg_score'] = round(stats['avg_score'], 2)
                    return stats
        except Exception as e:
            logger.error(f"Error getting CIBIL stats: {e}")
            return {}


# Global database instance
cibil_db = CibilDatabase()