@echo off
TITLE ATM Transaction Analytics Data Mart Launcher
COLOR 0B

echo ====================================================================
echo      ATM TRANSACTION ANALYTICS DATA MART - LOCAL LAUNCHER
echo ====================================================================
echo.
echo Starting FastAPI Backend on http://localhost:8000 ...
start "ATM Analytics Backend (FastAPI)" cmd /k "cd /d "%~dp0" && python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload"

echo Starting React Frontend on http://localhost:5173 ...
start "ATM Analytics Frontend (React)" cmd /k "cd /d "%~dp0frontend" && npm run dev -- --host 127.0.0.1 --port 5173"

echo.
echo Both servers are launching in separate windows!
echo.
echo Opening browser to: http://localhost:5173
timeout /t 3 >nul
start http://localhost:5173

echo ====================================================================
echo Dashboard: http://localhost:5173
echo API Docs : http://localhost:8000/docs
echo ====================================================================
pause
