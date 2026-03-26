# Stephens Wellness Website Startup Script
# Run this script AS ADMINISTRATOR

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Stephens Wellness Website Setup" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Start MySQL Service
Write-Host "[1/4] Starting MySQL service..." -ForegroundColor Yellow
try {
    Start-Service MySQL80
    Write-Host "      SUCCESS - MySQL service started!`n" -ForegroundColor Green
} catch {
    Write-Host "      ERROR - Could not start MySQL service." -ForegroundColor Red
    Write-Host "      Make sure you're running PowerShell AS ADMINISTRATOR`n" -ForegroundColor Red
    exit 1
}

# Wait a moment for MySQL to fully start
Start-Sleep -Seconds 2

# Step 2: Check MySQL connection
Write-Host "[2/4] Testing MySQL connection..." -ForegroundColor Yellow
$testResult = & mysql -u root -p4592 -e "SELECT 'Connected!' as status;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "      SUCCESS - MySQL is running!`n" -ForegroundColor Green
} else {
    Write-Host "      ERROR - Cannot connect to MySQL." -ForegroundColor Red
    Write-Host "      Check if password '4592' is correct in .env file`n" -ForegroundColor Red
    exit 1
}

# Step 3: Set up database
Write-Host "[3/4] Setting up database..." -ForegroundColor Yellow

# Create database if not exists
Write-Host "      Creating database..." -ForegroundColor Gray
& mysql -u root -p4592 -e "CREATE DATABASE IF NOT EXISTS stephens_wellness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1 | Out-Null

# Import schema
Write-Host "      Importing schema..." -ForegroundColor Gray
Get-Content "db/schema.sql" | & mysql -u root -p4592 stephens_wellness 2>&1 | Out-Null

# Import seed data
Write-Host "      Importing seed data..." -ForegroundColor Gray
Get-Content "db/seed.sql" | & mysql -u root -p4592 stephens_wellness 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "      SUCCESS - Database setup complete!`n" -ForegroundColor Green
} else {
    Write-Host "      WARNING - There may have been database setup issues`n" -ForegroundColor Yellow
}

# Step 4: Check Node modules
Write-Host "[4/4] Checking Node.js dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "      Dependencies already installed!`n" -ForegroundColor Green
} else {
    Write-Host "      Installing dependencies (this may take a minute)..." -ForegroundColor Gray
    npm install
    Write-Host "      SUCCESS - Dependencies installed!`n" -ForegroundColor Green
}

# Final instructions
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "   SETUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "To start the website, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host "`nThen open your browser to:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000" -ForegroundColor White
Write-Host "`nDefault login credentials:" -ForegroundColor Cyan
Write-Host "  Email: admin@stephens.edu" -ForegroundColor White
Write-Host "  Password: password123" -ForegroundColor White
Write-Host "`n========================================`n" -ForegroundColor Green
