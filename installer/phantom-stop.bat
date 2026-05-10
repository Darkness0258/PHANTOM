@echo off
title PHANTOM - Stopping Services
echo Stopping PHANTOM services...
net stop phantom-core >nul 2>&1
net stop phantom-agent >nul 2>&1
echo Done. All PHANTOM services stopped.
timeout /t 2 >nul
