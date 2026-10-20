# run-all.ps1 - Start both HepaTwin Backend and Frontend together
$root = $PSScriptRoot
Set-Location $root

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Starting HepaTwin Full-Stack System   " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. Clear any stuck instances on default ports
$ports = 8000, 5175
$procs = Get-NetTCPConnection -LocalPort $ports -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
if ($procs) {
    foreach ($p in $procs) {
        Stop-Process -Id $p -Force -ErrorAction SilentlyContinue
    }
}

# 2. Launch Backend in a dedicated window
Write-Host "[1/2] Launching Python FastAPI Backend on http://localhost:8000..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root\backend'; pip install -r requirements.txt; uvicorn main:app --reload --port 8000"

# Wait for backend to spin up
Start-Sleep -Seconds 3

# 3. Launch Frontend in a dedicated window and open browser
Write-Host "[2/2] Launching React Vite Frontend on http://localhost:5175..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$root'; if (!(Test-Path 'node_modules')) { npm install }; npm run dev"

# Wait for frontend server
Start-Sleep -Seconds 3

# Open default browser
Start-Process "http://localhost:5175"

Write-Host "`nAll services initiated successfully!" -ForegroundColor Cyan
Write-Host "Backend API Docs: http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "Frontend App:     http://localhost:5175" -ForegroundColor Yellow
