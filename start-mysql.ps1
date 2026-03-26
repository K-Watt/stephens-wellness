# Quick Start Script - Run this in PowerShell AS ADMINISTRATOR

Write-Host "Starting MySQL service..." -ForegroundColor Yellow
Start-Service MySQL80

Write-Host "`nMySQL service started!" -ForegroundColor Green
Write-Host "`nNow testing connection..." -ForegroundColor Cyan

# Test connection
mysql -u root -ppassword123 -e "SELECT 'MySQL is working!' as status;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSUCCESS! MySQL is connected." -ForegroundColor Green
    Write-Host "`nNow run these commands to set up the database:" -ForegroundColor Cyan
    Write-Host "cd 'C:\Users\kodiw\OneDrive - Southeast Missouri State University\CS499 - Capstone Experience\Pursley, Matthew's files - Capstone\stephens-wellness'" -ForegroundColor White
    Write-Host "mysql -u root -ppassword123 -e 'CREATE DATABASE stephens_wellness CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;'" -ForegroundColor White
    Write-Host "mysql -u root -ppassword123 stephens_wellness < db/schema.sql" -ForegroundColor White
    Write-Host "mysql -u root -ppassword123 stephens_wellness < db/seed.sql" -ForegroundColor White
    Write-Host "npm install" -ForegroundColor White
    Write-Host "npm run dev" -ForegroundColor White
} else {
    Write-Host "`nPassword might be wrong. Try these:" -ForegroundColor Yellow
    Write-Host "mysql -u root -e 'SELECT 1;'  # No password" -ForegroundColor White
    Write-Host "mysql -u root -proot -e 'SELECT 1;'  # Password: root" -ForegroundColor White
}
