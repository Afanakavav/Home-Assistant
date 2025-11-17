# Deploy script for Home Assistant
# This script builds the project and deploys it to apheron.io/home-assistant

Write-Host "🚀 Starting deployment process..." -ForegroundColor Green

# Step 1: Build the project
Write-Host "📦 Building project..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build completed!" -ForegroundColor Green

# Step 2: Copy files to apheron-homepage
Write-Host "📋 Copying files to apheron-homepage..." -ForegroundColor Yellow
$sourceDir = "dist"
$targetDir = "..\apheron-homepage\public\home-assistant"

if (Test-Path $targetDir) {
    Remove-Item -Path $targetDir -Recurse -Force
}

New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
Copy-Item -Path "$sourceDir\*" -Destination $targetDir -Recurse -Force

Write-Host "✅ Files copied!" -ForegroundColor Green

# Step 3: Deploy from apheron-homepage
Write-Host "🌐 Deploying to Firebase..." -ForegroundColor Yellow
Set-Location ..\apheron-homepage
firebase deploy --only hosting

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Deploy failed!" -ForegroundColor Red
    Set-Location ..\home-assistant
    exit 1
}

Set-Location ..\peronciolillo-home-assistant

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "🌍 Site available at: https://apheron.io/home-assistant/" -ForegroundColor Cyan

