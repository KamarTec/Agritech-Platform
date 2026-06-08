@echo off
echo Starting FarmLink Development Servers...
echo.

echo Installing dependencies if needed...
call pnpm install

echo.
echo Starting dev servers on:
echo   - Frontend: http://localhost:3000
echo   - Backend: http://localhost:3001
echo.
echo Press Ctrl+C to stop.
echo.

call pnpm dev
