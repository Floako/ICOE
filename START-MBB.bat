@echo off
REM ICON Launch Script for Windows

echo Starting ICON (In Case Of Need)...
echo.

echo [1/2] Starting Backend Server on Port 5000...
start cmd /k "cd backend && npm install && npm start"

timeout /t 3

echo [2/2] Starting Frontend on Port 3000...
start cmd /k "cd frontend && npm install && npm start"

echo.
echo ICON is starting!
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Note: First run will take a few minutes for npm to install dependencies.
pause
