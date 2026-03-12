@echo off
setlocal enabledelayedexpansion

echo ============================================
echo    Connect Your Local Database
echo ============================================
echo.

REM Scan for databases
echo 🔍 Scanning for databases...
echo.

set FOUND_3306=0
set FOUND_5432=0
set FOUND_1433=0
set FOUND_27017=0

netstat -an 2>nul | findstr ":3306 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Found database on port 3306 (MySQL/MariaDB^)
    set FOUND_3306=1
)

netstat -an 2>nul | findstr ":5432 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Found database on port 5432 (PostgreSQL^)
    set FOUND_5432=1
)

netstat -an 2>nul | findstr ":1433 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Found database on port 1433 (SQL Server^)
    set FOUND_1433=1
)

netstat -an 2>nul | findstr ":27017 " | findstr "LISTENING" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo   ✅ Found database on port 27017 (MongoDB^)
    set FOUND_27017=1
)

echo.
echo 📋 Please select which database to expose:
echo.
echo 1^) MySQL/MariaDB (port 3306^)
echo 2^) PostgreSQL (port 5432^)
echo 3^) SQL Server (port 1433^)
echo 4^) MongoDB (port 27017^)
echo 5^) Custom port
echo.
set /p "choice=Choice (1-5): "

if "%choice%"=="1" (
    set DB_TYPE=MySQL/MariaDB
    set DB_PORT=3306
) else if "%choice%"=="2" (
    set DB_TYPE=PostgreSQL
    set DB_PORT=5432
) else if "%choice%"=="3" (
    set DB_TYPE=SQL Server
    set DB_PORT=1433
) else if "%choice%"=="4" (
    set DB_TYPE=MongoDB
    set DB_PORT=27017
) else if "%choice%"=="5" (
    set /p "DB_PORT=Enter port number: "
    set DB_TYPE=Custom
) else (
    echo ❌ Invalid choice!
    pause
    exit /b 1
)

echo.
echo 📦 Selected: %DB_TYPE%
echo 🔌 Port: %DB_PORT%
echo.

REM Check if Node.js installed
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Node.js...
    winget install OpenJS.NodeJS --silent

    REM Refresh PATH
    call refreshenv >nul 2>&1
)

REM Install localtunnel
where lt >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing localtunnel...
    npm install -g localtunnel
)

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo   🚀 Starting Tunnel...
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
echo ⚠️  IMPORTANT: Keep this window OPEN!
echo.

REM Start localtunnel
lt --port %DB_PORT%