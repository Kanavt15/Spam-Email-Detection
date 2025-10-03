@echo off
echo ==========================================
echo      Spam Detection System Backend
echo ==========================================
echo.

cd /d "%~dp0backend"

echo Checking Python installation...
python --version
if errorlevel 1 (
    echo Error: Python is not installed or not in PATH
    echo Please install Python 3.7+ and try again
    pause
    exit /b 1
)

echo.
echo Installing required packages...
pip install -r requirements.txt

echo.
echo Starting Flask backend server...
echo Backend will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the server
echo ==========================================
echo.

python app.py

pause