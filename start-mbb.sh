#!/bin/bash
# ICON Launch Script for Mac/Linux

echo "Starting ICON (In Case Of Need)..."
echo ""

echo "[1/2] Starting Backend Server on Port 5000..."
cd backend && npm install && npm start &
BACKEND_PID=$!

sleep 3

echo "[2/2] Starting Frontend on Port 3000..."
cd ../frontend && npm install && npm start

echo ""
echo "ICON is running!"
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
