# Run this ONCE as Administrator to set up the auto-update task

$scriptPath = "C:\workstation\Apps\Phantom\scripts\duckdns-update.ps1"

# Create scheduled task - runs every 5 minutes
$action  = New-ScheduledTaskAction -Execute "PowerShell.exe" -Argument "-NonInteractive -WindowStyle Hidden -File `"$scriptPath`""
$trigger = New-ScheduledTaskTrigger -RepetitionInterval (New-TimeSpan -Minutes 5) -Once -At (Get-Date)
$settings = New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 1) -RunOnlyIfNetworkAvailable
$principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel Highest

Register-ScheduledTask `
    -TaskName "PHANTOM-DuckDNS" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "PHANTOM DuckDNS IP auto-updater" `
    -Force

# Run it immediately
Start-ScheduledTask -TaskName "PHANTOM-DuckDNS"
Write-Host "DuckDNS auto-update task created and started!"
