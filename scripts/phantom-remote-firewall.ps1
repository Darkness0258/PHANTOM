# Run as Administrator - opens PHANTOM ports for remote access

# Allow phantom-core from internet
netsh advfirewall firewall add rule name="PHANTOM-Core-Remote" dir=in action=allow protocol=TCP localport=8000

# Allow phantom-ai from internet  
netsh advfirewall firewall add rule name="PHANTOM-AI-Remote" dir=in action=allow protocol=TCP localport=8001

Write-Host "Firewall rules added for remote access."
Write-Host ""
Write-Host "PHANTOM Remote Access URLs:"
Write-Host "  Core API : http://phantom-darkness.duckdns.org:8000"
Write-Host "  AI Chat  : http://phantom-darkness.duckdns.org:8001"
Write-Host "  Health   : http://phantom-darkness.duckdns.org:8000/health"
