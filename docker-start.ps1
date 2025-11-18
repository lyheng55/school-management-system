# Docker Start Script for School Management System (PowerShell)

Write-Host "🚀 Starting School Management System with Docker..." -ForegroundColor Cyan

# Check if .env file exists
if (-not (Test-Path .env)) {
    Write-Host "⚠️  .env file not found. Creating from .env.example..." -ForegroundColor Yellow
    if (Test-Path .env.example) {
        Copy-Item .env.example .env
        Write-Host "✅ Created .env file. Please update it with your configuration." -ForegroundColor Green
    } else {
        Write-Host "❌ .env.example not found. Please create .env file manually." -ForegroundColor Red
        exit 1
    }
}

# Build and start containers
Write-Host "📦 Building and starting containers..." -ForegroundColor Cyan
docker-compose up -d --build

# Wait for database to be ready
Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Check if database is healthy
Write-Host "🔍 Checking database health..." -ForegroundColor Cyan
$maxAttempts = 30
$attempt = 0
$dbReady = $false

while ($attempt -lt $maxAttempts -and -not $dbReady) {
    try {
        $result = docker-compose exec -T db mysqladmin ping -h localhost 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dbReady = $true
        }
    } catch {
        # Continue waiting
    }
    
    if (-not $dbReady) {
        Write-Host "⏳ Waiting for database... ($attempt/$maxAttempts)" -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        $attempt++
    }
}

if ($dbReady) {
    Write-Host "✅ Database is ready!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database may not be ready. Continuing anyway..." -ForegroundColor Yellow
}

# Run migrations
Write-Host "🔄 Running database migrations..." -ForegroundColor Cyan
docker-compose exec -T backend npm run migrate

# Ask if user wants to seed database
$seed = Read-Host "Do you want to seed the database? (y/n)"
if ($seed -eq 'y' -or $seed -eq 'Y') {
    Write-Host "🌱 Seeding database..." -ForegroundColor Cyan
    docker-compose exec -T backend npm run seed
}

Write-Host ""
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📍 Access the application:" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000"
Write-Host "   Backend API: http://localhost:5000/api"
Write-Host "   Health Check: http://localhost:5000/health"
Write-Host ""
Write-Host "📋 Useful commands:" -ForegroundColor Cyan
Write-Host "   View logs: docker-compose logs -f"
Write-Host "   Stop: docker-compose down"
Write-Host "   Restart: docker-compose restart"

