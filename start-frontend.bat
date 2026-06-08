@echo off
echo.
echo ========================================
echo    FarmLink - Next.js Frontend
echo ========================================
echo.
echo Installing dependencies (if needed)...
cd apps\web
call npm install

echo.
echo Starting development server...
echo.
echo Open your browser to: http://localhost:3000
echo Press Ctrl+C to stop.
echo.

call npm run dev
