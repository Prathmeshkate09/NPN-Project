#!/bin/bash

# CogniML API Server Startup Script
echo "=== Starting CogniML Loan Recommendation API ==="

# Check if Python 3 is available
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
elif command -v python &> /dev/null; then
    PYTHON_CMD="python"
else
    echo "Error: Python not found"
    exit 1
fi

echo "Using Python: $PYTHON_CMD"

# Install dependencies if needed
echo "Checking and installing dependencies..."
$PYTHON_CMD -m pip install -r Requirements.txt

# Start the server
echo "Starting server..."
$PYTHON_CMD main.py