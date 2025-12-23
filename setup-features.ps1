# Installation Script for Attachments & Configuration Features
# Run this script after pulling the code

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Asset Manager - Setup Script" -ForegroundColor Cyan
Write-Host "Attachments & Configuration Features" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Install Dependencies
Write-Host "Step 1: Installing npm dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing dependencies. Please check npm output." -ForegroundColor Red
    exit 1
}
Write-Host "✓ Dependencies installed successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Create upload directories
Write-Host "Step 2: Creating upload directories..." -ForegroundColor Yellow
$uploadsDir = Join-Path $PSScriptRoot "uploads"
$assetsDir = Join-Path $uploadsDir "assets"
$expensesDir = Join-Path $uploadsDir "expenses"
$logosDir = Join-Path $uploadsDir "logos"

if (!(Test-Path $uploadsDir)) {
    New-Item -ItemType Directory -Path $uploadsDir | Out-Null
    Write-Host "✓ Created uploads directory" -ForegroundColor Green
}

if (!(Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Path $assetsDir | Out-Null
    Write-Host "✓ Created uploads/assets directory" -ForegroundColor Green
}

if (!(Test-Path $expensesDir)) {
    New-Item -ItemType Directory -Path $expensesDir | Out-Null
    Write-Host "✓ Created uploads/expenses directory" -ForegroundColor Green
}

if (!(Test-Path $logosDir)) {
    New-Item -ItemType Directory -Path $logosDir | Out-Null
    Write-Host "✓ Created uploads/logos directory" -ForegroundColor Green
}
Write-Host ""

# Step 3: Build TypeScript
Write-Host "Step 3: Building TypeScript files..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error building TypeScript. Please check compiler output." -ForegroundColor Red
    exit 1
}
Write-Host "✓ TypeScript build completed" -ForegroundColor Green
Write-Host ""

# Step 4: Database Migration
Write-Host "Step 4: Database Migration" -ForegroundColor Yellow
Write-Host "You need to run the database migration manually." -ForegroundColor White
Write-Host ""
Write-Host "Command:" -ForegroundColor Cyan
Write-Host "  psql -U your_username -d your_database -f db_queries/attachments_and_config.sql" -ForegroundColor White
Write-Host ""
$runMigration = Read-Host "Do you want to run it now? (y/n)"

if ($runMigration -eq 'y' -or $runMigration -eq 'Y') {
    $dbUser = Read-Host "Enter PostgreSQL username"
    $dbName = Read-Host "Enter database name"
    
    Write-Host "Running migration..." -ForegroundColor Yellow
    $migrationFile = Join-Path $PSScriptRoot "db_queries\attachments_and_config.sql"
    
    psql -U $dbUser -d $dbName -f $migrationFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Database migration completed" -ForegroundColor Green
    } else {
        Write-Host "✗ Database migration failed. Please run manually." -ForegroundColor Red
    }
} else {
    Write-Host "⚠ Remember to run the database migration before starting the server!" -ForegroundColor Yellow
}
Write-Host ""

# Step 5: Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Ensure database migration is complete" -ForegroundColor White
Write-Host "2. Start the server: npm start (or npm run dev)" -ForegroundColor White
Write-Host "3. Log in as Admin" -ForegroundColor White
Write-Host "4. Navigate to Settings > System Configuration" -ForegroundColor White
Write-Host "5. Configure your application name, logo, and storage" -ForegroundColor White
Write-Host ""
Write-Host "Documentation:" -ForegroundColor Yellow
Write-Host "  - IMPLEMENTATION_SUMMARY.md - Complete implementation details" -ForegroundColor White
Write-Host "  - ATTACHMENTS_CONFIGURATION_GUIDE.md - User guide" -ForegroundColor White
Write-Host ""
Write-Host "Happy Managing! " -ForegroundColor Cyan
