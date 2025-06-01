# TechFlix WSL2 Setup for Windows

## The Issue
WSL2 uses a virtual network adapter that changes IP on every restart. Windows can't access WSL2 services via localhost by default.

## Quick Solution

### Option 1: Use Windows Terminal/PowerShell (Run as Administrator)
```powershell
# Get WSL IP
wsl hostname -I

# Add port forwarding (replace WSL_IP with the IP from above)
netsh interface portproxy add v4tov4 listenport=5173 listenaddress=0.0.0.0 connectport=5173 connectaddress=WSL_IP
```

Then access: http://localhost:5173

### Option 2: Use VS Code
1. Open VS Code
2. Install "Remote - WSL" extension
3. Open terminal in VS Code and run: `code .` from the project directory
4. VS Code will handle port forwarding automatically
5. Look for the "Ports" tab in VS Code terminal panel

### Option 3: Edit Windows hosts file
1. Run notepad as Administrator
2. Open: C:\Windows\System32\drivers\etc\hosts
3. Add: `172.31.46.60 techflix.local`
4. Access: http://techflix.local:5173

### Option 4: Use WSL2 localhost forwarding (Windows 11)
In WSL2 terminal:
```bash
# Check if enabled
cat /etc/wsl.conf

# If not, create it:
sudo tee /etc/wsl.conf > /dev/null <<EOF
[network]
hostname = techflix
[boot]
systemd = true
EOF
```

Then in Windows, create `.wslconfig` in your user folder:
```
[wsl2]
localhostForwarding=true
```

Restart WSL: `wsl --shutdown` then start again.

## Permanent Solution

Create this batch file `start-techflix.bat` on Windows Desktop:
```batch
@echo off
echo Starting TechFlix...
wsl -e bash -c "cd /home/deepak/src/qsLab/techflix && npm run dev"
```

This will start the server and Windows should handle the networking.