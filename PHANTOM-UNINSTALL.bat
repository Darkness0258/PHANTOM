@echo off
title PHANTOM Uninstaller
echo Stopping all PHANTOM services...
taskkill /IM phantom-core.exe /F >nul 2>&1
taskkill /IM phantom-agent.exe /F >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo Removing startup entry...
del "%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\PHANTOM.lnk" >nul 2>&1

echo Removing desktop shortcut...
del "%USERPROFILE%\Desktop\PHANTOM.lnk" >nul 2>&1

echo PHANTOM uninstalled successfully.
pause
