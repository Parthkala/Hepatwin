# run-backend.ps1 – start the HepaTwin Python backend
# Run from the project root: .\backend\run-backend.ps1

$ErrorActionPreference = 'Stop'
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

Write-Host "==> Installing Python dependencies..." -ForegroundColor Cyan
pip install -r requirements.txt --quiet

Write-Host "==> Starting HepaTwin backend on http://localhost:8000" -ForegroundColor Green
Write-Host "    Swagger UI : http://localhost:8000/docs" -ForegroundColor Yellow
Write-Host "    ReDoc       : http://localhost:8000/redoc" -ForegroundColor Yellow
Write-Host ""

uvicorn main:app --reload --host 0.0.0.0 --port 8000
