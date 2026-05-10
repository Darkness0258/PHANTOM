# PHANTOM DuckDNS Auto-Updater
# Runs every 5 minutes via Windows Task Scheduler

$domain = "phantom-darkness"
$token  = "98493448-eb06-4eb8-bd8e-66ed82719515"
$logFile = "C:\workstation\Apps\Phantom\logs\duckdns.log"

$url = "https://www.duckdns.org/update?domains=$domain&token=$token&ip="

try {
    $response = (Invoke-WebRequest -Uri $url -UseBasicParsing).Content.Trim()
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $currentIP = (Invoke-WebRequest -Uri "https://api.ipify.org" -UseBasicParsing).Content.Trim()
    
    "$timestamp | IP: $currentIP | DuckDNS: $response" | Add-Content $logFile
    
    if ($response -eq "OK") {
        Write-Host "DuckDNS updated successfully. IP: $currentIP"
    } else {
        Write-Host "DuckDNS update failed: $response"
    }
} catch {
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$timestamp | ERROR: $_" | Add-Content $logFile
}
