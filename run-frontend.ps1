# Get the directory where this script is located
$ScriptPath = $PSScriptRoot

# Start a new PowerShell terminal process
# -NoExit keeps the window open after command finishes
# -Command runs the initialization and start commands
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ScriptPath'; if (-not (Test-Path 'node_modules')) { Write-Host 'Installing dependencies...' -ForegroundColor Yellow; npm install }; Write-Host 'Starting Frontend (Expo)...' -ForegroundColor Green; npm start"
