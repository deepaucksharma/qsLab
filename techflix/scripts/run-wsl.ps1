# PowerShell script to run on Windows (save and run as Administrator)
# This sets up port forwarding from Windows to WSL2

$wslIp = wsl hostname -I | ForEach-Object { $_.Trim() }
$wslIp = $wslIp -split ' ' | Select-Object -First 1

Write-Host "WSL IP: $wslIp"
Write-Host "Setting up port forwarding..."

# Remove any existing port proxy
netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=localhost

# Add new port proxy
netsh interface portproxy add v4tov4 listenport=8081 listenaddress=localhost connectport=8081 connectaddress=$wslIp

Write-Host "Port forwarding set up successfully!"
Write-Host "You can now access TechFlix at: http://localhost:8081"
Write-Host ""
Write-Host "To remove port forwarding later, run:"
Write-Host "netsh interface portproxy delete v4tov4 listenport=8081 listenaddress=localhost"