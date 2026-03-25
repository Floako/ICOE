@echo off
REM ICOE Backend Launcher

cd /d "%~dp0backend"
echo Starting ICOE Backend on localhost:5000...
npm start
pause
