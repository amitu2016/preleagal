$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot)
docker compose up --build -d
Write-Host "Prelegal is running at http://localhost:8000"
