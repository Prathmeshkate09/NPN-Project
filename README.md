# FinTrust — ML‑Powered Lending (Frontend + Backend)

This repository contains two parts:
- Backend API (FastAPI + ML models) in `backend/`
- Frontend (Next.js) in a separate folder `..\Fintrust-Frontend-main` (included alongside this repo)

This README explains what each part does, how Docker is used, how the SQLite database works, and quick local and deployment instructions for Windows (PowerShell).
Link - https://fintrust-frontend.vercel.app
---

## Project overview

- Backend: FastAPI application that loads pre-trained ML models (pkl files) and exposes endpoints for loan eligibility, product, amount, tenure, rate recommendations. Uses SQLite (`backend/cibil_database.db`) for simple persistent storage.
- Frontend: Next.js app (TypeScript) that calls the backend API (configured to use `NEXT_PUBLIC_API_URL`).
- Docker: `docker-compose.yml` orchestrates backend and frontend locally for development. `render.yaml` is supplied for cloud deployment (Render). Frontend can be deployed separately (Vercel or similar).

---

## Repo structure (relevant)
- backend/
  - main.py, Database.py, ml.py, Requirements.txt
  - trained models: `eligibility_model.pkl`, `product_model.pkl`, `amount_model.pkl`, `tenure_model.pkl`, `rate_model.pkl`
  - label encoders: `label_encoders.pkl`
  - DB file: `cibil_database.db` (SQLite)
  - Dockerfile
- Fintrust-Frontend-main/
  - Next.js app under `src/`
  - env.example, next.config.ts, package.json

---

## Key concepts (beginner friendly)

- Docker image: a packaged application (OS libs, runtime, code). Built from a Dockerfile.
- Container: a running instance of an image.
- docker-compose: a tool to run multiple containers together and configure networking, volumes, env vars.
- CORS (CORSMiddleware): in `backend/main.py` the FastAPI middleware allows the frontend (different origin) to call the backend from the browser. In development the project uses permissive CORS; restrict in production.

---

## Database details

- Type: SQLite (file-based, embedded). File: `backend/cibil_database.db`.
- Purpose: store persistent data (submissions, logs, history) so data survives restarts.
- Access: backend code uses Python `sqlite3` (or an ORM) to read/write the DB.
- Persistence with Docker: `docker-compose.yml` mounts the backend folder into the container, so `cibil_database.db` sits on your host and persists.
- Notes:
  - SQLite is suitable for development and low-concurrency use. For production use Postgres/MySQL and update `DATABASE_URL`.
  - To inspect DB locally, use Python or sqlite3 CLI:
    - Python quick check:
      ```python
      import sqlite3
      conn = sqlite3.connect("backend/cibil_database.db")
      cur = conn.cursor()
      cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
      print(cur.fetchall())
      conn.close()
      ```

---

## Environment variables

Backend (common)
- DATABASE_URL — default is `sqlite:///cibil_database.db`. Change to a proper DB URL for production.
- ALLOWED_ORIGINS — optional, used to restrict CORS origins (e.g., `http://localhost:3000`).

Frontend
- NEXT_PUBLIC_API_URL — URL of backend API (default `http://localhost:8000` for local dev). Set in env or Docker.

See `Fintrust-Frontend-main/env.example` for frontend env examples.

---

## Run locally with Docker (recommended)

Pre-requisites:
- Docker Desktop (Windows) running (WSL2 recommended).
- PowerShell or terminal.

From the root of this repository (where docker-compose.yml lives):
PowerShell:
```powershell
cd D:\NPN_Praject\FinTrust-ML-Powered-Lending-Revolution-main
docker-compose up --build
# or detached:
docker-compose up -d --build
```

What this does:
- Builds backend image from `backend/Dockerfile`.
- Builds frontend image from `Fintrust-Frontend-main` (configured in compose).
- Starts backend on host port 8000 and frontend on port 3000.
- Backend healthcheck ensures frontend waits until API is ready.

Stop and remove:
```powershell
docker-compose down
```

View backend logs:
```powershell
docker-compose logs -f backend
```

---

## Run locally without Docker (manual)

Backend:
1. Create a virtual environment and install requirements:
   ```powershell
   cd D:\NPN_Praject\FinTrust-ML-Powered-Lending-Revolution-main\backend
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   pip install -r Requirements.txt
   ```
2. Start the API:
   ```powershell
   python main.py
   ```
3. Ensure the models and `label_encoders.pkl` are present in the backend folder.

Frontend:
1. Open a new terminal:
   ```powershell
   cd D:\NPN_Praject\Fintrust-Frontend-main
   npm install
   # or
   pnpm install
   ```
2. Set the backend URL in `.env` or environment:
   ```powershell
   $env:NEXT_PUBLIC_API_URL="http://localhost:8000"
   npm run dev
   ```
3. Open http://localhost:3000

---

## Deployment hints

- Backend: `render.yaml` is provided for deploying the backend on Render. It sets build and start commands and environment variables. For production, replace SQLite with a managed DB and set `DATABASE_URL`.
- Frontend: The frontend project contains `vercel.json` and is ready for Vercel deployments. Set `NEXT_PUBLIC_API_URL` in the Vercel project settings.

Security notes:
- Do not use `allow_origins: ["*"]` with cookies/credentials in production.
- Do not commit secrets into the repo. Use environment variables in deployment.

---

## Troubleshooting

- Port in use: change port bindings in `docker-compose.yml`.
- Models not found: verify the .pkl files exist in `backend/`.
- CORS errors in browser: ensure backend `ALLOWED_ORIGINS` includes frontend origin or use proper CORS settings.
- DB locked errors (SQLite): avoid multiple processes writing concurrently; consider moving to Postgres for production.

---

## Useful commands (Windows PowerShell)

- Build and run:
  ```powershell
  docker-compose up --build
  ```
- Rebuild and recreate:
  ```powershell
  docker-compose up -d --build --force-recreate
  ```
- Stop:
  ```powershell
  docker-compose down
  ```
- Check containers:
  ```powershell
  docker ps
  ```

---

If you want, I can:
- Create a more detailed CONTRIBUTING.md or DEV_SETUP.md with step-by-step debugging commands.
- Insert a secure CORS configuration into `backend/main.py` and update `docker-compose.yml` / `render.yaml` with ALLOWED_ORIGINS.  
Which do you prefer?
