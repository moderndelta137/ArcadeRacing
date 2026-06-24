@echo off
setlocal
cd /d "%~dp0"

set "PYTHON_CMD=python"
where python >nul 2>nul
if errorlevel 1 (
  where py >nul 2>nul
  if errorlevel 1 (
    echo Python is required to serve the game and live CSV data.
    pause
    exit /b 1
  )
  set "PYTHON_CMD=py"
)

echo Arcade Racing: http://127.0.0.1:4173/arcade_racing.html
echo Keep this window open while playing. Press Ctrl+C to stop.
start "" "http://127.0.0.1:4173/arcade_racing.html"
%PYTHON_CMD% -m http.server 4173 --bind 127.0.0.1
