@echo off
REM ICON Backend Launcher

cd /d "%~dp0backend"
echo Starting ICON Backend on localhost:5000...
npm start
pause
