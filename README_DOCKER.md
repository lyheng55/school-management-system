# Docker Quick Start

## Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine + Docker Compose (Linux)
- At least 4GB RAM available for Docker

## Quick Start (3 Steps)

### 1. Create Environment File
```bash
# Copy the example file (if .env.example exists)
# Or create .env manually with these variables:
DB_ROOT_PASSWORD=rootpassword
DB_NAME=school_management
DB_USER=school_user
DB_PASSWORD=school_password
JWT_SECRET=change-this-secret-key
JWT_REFRESH_SECRET=change-this-refresh-secret-key
FRONTEND_URL=http://localhost:3000
```

### 2. Build and Start
```bash
# Windows PowerShell
.\docker-start.ps1

# Linux/Mac
chmod +x docker-start.sh
./docker-start.sh

# Or manually:
docker-compose up -d --build
```

### 3. Run Migrations
```bash
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed  # Optional
```

## Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

## Common Commands

```bash
# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Restart services
docker-compose restart

# Rebuild after code changes
docker-compose up -d --build

# Access backend shell
docker-compose exec backend sh

# Access database
docker-compose exec db mysql -u root -p
```

## Troubleshooting

**Port already in use?**
- Change ports in `.env` file or `docker-compose.yml`

**Database connection errors?**
- Wait a bit longer (database takes ~30 seconds to initialize)
- Check logs: `docker-compose logs db`

**Frontend can't connect to backend?**
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

For detailed documentation, see [DOCKER_SETUP.md](./DOCKER_SETUP.md)

