@echo off
echo.
echo ========================================
echo    FarmLink - Dev Server Test
echo ========================================
echo.

echo Checking if Next.js is installed...
cd apps\web
if exist "node_modules\next" (
    echo ✓ Next.js found!
    echo.
    echo Starting frontend dev server...
    echo Open http://localhost:3000 in your browser
    echo.
    call npm run dev
) else (
    echo ✗ Next.js not found. Installation still in progress...
    echo Please try again in a few moments.
    cd ..\..
)
