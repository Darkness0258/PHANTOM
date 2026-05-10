@echo off
title PHANTOM Network Guardian
echo Starting PHANTOM services...
net start phantom-core >nul 2>&1
net start phantom-agent >nul 2>&1
echo.
echo PHANTOM Core:  http://localhost:8000
echo PHANTOM AI:    http://localhost:8001
echo.
echo Opening dashboard...
start http://localhost:5173
echo.
echo PHANTOM is running. Press any key to close this window.
pause >nul
