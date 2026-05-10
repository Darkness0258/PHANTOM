@echo off
title PHANTOM Installer v1.0
color 0B
echo.
echo  ??????? ???  ??? ?????? ????   ???????????? ??????? ????   ????
echo  ???????????  ????????????????  ?????????????????????????? ?????
echo  ?????????????????????????????? ???   ???   ???   ??????????????
echo  ??????? ??????????????????????????   ???   ???   ??????????????
echo  ???     ???  ??????  ?????? ??????   ???   ???????????? ??? ???
echo  ???     ???  ??????  ??????  ?????   ???    ??????? ???     ???
echo.
echo                    PHANTOM Installer v1.0
echo              You don't own devices. You own an empire.
echo.
echo ================================================================
echo  Checking requirements...
echo ================================================================

:: Check Rust
where cargo >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Rust not found. Installing...
    winget install Rustlang.Rust.MSVC
) else (
    echo [OK] Rust found
)

:: Check Node
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js not found. Installing...
    winget install OpenJS.NodeJS
) else (
    echo [OK] Node.js found
)

:: Check Python
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python not found. Installing...
    winget install Python.Python.3.11
) else (
    echo [OK] Python found
)

echo.
echo ================================================================
echo  Building PHANTOM Core...
echo ================================================================
cd C:\workstation\Apps\Phantom\services\phantom-core
cargo build --release
if %errorlevel% neq 0 (
    echo [ERROR] phantom-core build failed
    pause
    exit /b 1
)
echo [OK] phantom-core built

echo.
echo ================================================================
echo  Building PHANTOM Agent...
echo ================================================================
cd C:\workstation\Apps\Phantom\services\phantom-agent
cargo build --release
if %errorlevel% neq 0 (
    echo [ERROR] phantom-agent build failed
    pause
    exit /b 1
)
echo [OK] phantom-agent built

echo.
echo ================================================================
echo  Setting up PHANTOM AI...
echo ================================================================
cd C:\workstation\Apps\Phantom\services\phantom-ai
python -m venv venv
call venv\Scripts\activate
pip install -r requirements.txt -q
echo [OK] phantom-ai ready

echo.
echo ================================================================
echo  Setting up Admin Dashboard...
echo ================================================================
cd C:\workstation\Apps\Phantom\apps\phantom-admin-desktop
npm install --silent
echo [OK] Admin dashboard ready

echo.
echo ================================================================
echo  Creating shortcuts...
echo ================================================================
powershell -Command "=New-Object -COM WScript.Shell; =.CreateShortcut('%USERPROFILE%\Desktop\PHANTOM.lnk'); .TargetPath='C:\workstation\Apps\Phantom\PHANTOM-START.bat'; .IconLocation='C:\workstation\Apps\Phantom\PHANTOM-START.bat'; .Save()"
echo [OK] Desktop shortcut created

echo.
echo ================================================================
echo  PHANTOM INSTALLED SUCCESSFULLY
echo.
echo  Desktop shortcut: PHANTOM.lnk
echo  Start manually:   C:\workstation\Apps\Phantom\PHANTOM-START.bat
echo  Dashboard:        http://localhost:5173
echo  Core API:         http://localhost:8000
echo  AI Service:       http://localhost:8001
echo ================================================================
echo.
pause
