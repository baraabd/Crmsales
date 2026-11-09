@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Install Node.js 24 LTS, then run this file again.
  pause
  exit /b 1
)
call npm install --include=dev
if errorlevel 1 (
  echo Dependency installation failed. Read the npm error above.
  pause
  exit /b 1
)
call npm run dev
if errorlevel 1 pause
