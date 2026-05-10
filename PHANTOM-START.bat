@echo off
title PHANTOM Network Guardian
color 0A
echo.
echo  ██████╗ ██╗  ██╗ █████╗ ███╗   ██╗████████╗ ██████╗ ███╗   ███╗
echo  ██╔══██╗██║  ██║██╔══██╗████╗  ██║╚══██╔══╝██╔═══██╗████╗ ████║
echo  ██████╔╝███████║███████║██╔██╗ ██║   ██║   ██║   ██║██╔████╔██║
echo  ██╔═══╝ ██╔══██║██╔══██║██║╚██╗██║   ██║   ██║   ██║██║╚██╔╝██║
echo  ██║     ██║  ██║██║  ██║██║ ╚████║   ██║   ╚██████╔╝██║ ╚═╝ ██║
echo  ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═══╝   ╚═╝    ╚═════╝ ╚═╝     ╚═╝
echo.
echo  Starting PHANTOM ecosystem...
echo.

:: Start phantom-core
echo [1/3] Starting phantom-core...
start "PHANTOM Core" cmd /k "cd /d C:\workstation\Apps\Phantom\services\phantom-core && cargo run --bin phantom-core"
timeout /t 5 /nobreak >nul

:: Start phantom-agent
echo [2/3] Starting phantom-agent...
start "PHANTOM Agent" cmd /k "cd /d C:\workstation\Apps\Phantom\services\phantom-agent && set PHANTOM_CORE_URL=http://localhost:8000 && cargo run --bin phantom-agent"
timeout /t 3 /nobreak >nul

:: Start phantom-ai
echo [3/3] Starting phantom-ai...
start "PHANTOM AI" cmd /k "cd /d C:\workstation\Apps\Phantom\services\phantom-ai && venv\Scripts\activate && python server.py"
timeout /t 5 /nobreak >nul

:: Start desktop dashboard
echo [4/4] Starting dashboard...
start "PHANTOM Dashboard" cmd /k "cd /d C:\workstation\Apps\Phantom\apps\phantom-admin-desktop && npx vite"
timeout /t 3 /nobreak >nul

:: Open browser
echo.
echo  Opening PHANTOM dashboard...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo  PHANTOM is running!
echo  Dashboard : http://localhost:5173
echo  Core API  : http://localhost:8000
echo  AI Chat   : http://localhost:8001
echo.
echo  Press any key to close this window (services keep running)
pause >nul
