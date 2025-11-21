# Docker Commands Reference Guide

Complete reference for deploying and maintaining the School Management System with Docker.

---

## 🚀 Initial Setup & Deployment

### First Time Setup
```powershell
# Navigate to project directory
cd "D:\Mr. Lyheng\Project\school-management-system"

# Build and start all containers
docker-compose up -d --build

# Wait for database to be ready, then run migrations
docker-compose exec backend npm run migrate

# (Optional) Seed database with sample data
docker-compose exec backend npm run seed
```

### Quick Start (After Initial Setup)
```powershell
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# Restart all services
docker-compose restart
```

---

## 📦 Container Management

### Start/Stop Containers
```powershell
# Start all containers in detached mode
docker-compose up -d

# Start specific service
docker-compose up -d db
docker-compose up -d backend
docker-compose up -d frontend

# Stop all containers
docker-compose down

# Stop containers without removing volumes
docker-compose stop

# Start stopped containers
docker-compose start

# Restart all containers
docker-compose restart

# Restart specific service
docker-compose restart backend
```

### View Container Status
```powershell
# List all containers and their status
docker-compose ps

# View detailed container information
docker ps -a

# Check if specific container is running
docker-compose ps backend
```

---

## 📊 Monitoring & Logs

### View Logs
```powershell
# View logs from all services (follow mode)
docker-compose logs -f

# View logs from specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db

# View last 100 lines of logs
docker-compose logs --tail=100 backend

# View logs with timestamps
docker-compose logs -f -t backend

# View logs from specific time period
docker-compose logs --since 30m backend
docker-compose logs --since 2024-01-01T00:00:00 backend
```

### Container Statistics
```powershell
# Real-time stats for all containers
docker stats

# Stats for specific container
docker stats school-management-backend

# View container resource usage
docker-compose top
```

---

## 🔧 Database Operations

### Database Access
```powershell
# Connect to MySQL database
docker-compose exec db mysql -u root -p
# Password: rootpassword (or check .env file)

# Connect with specific user
docker-compose exec db mysql -u school_user -p school_management
# Password: school_password (or check .env file)

# Execute SQL command directly
docker-compose exec -T db mysql -u root -prootpassword -e "SHOW DATABASES;"
```

### Database Migrations
```powershell
# Run all pending migrations
docker-compose exec backend npm run migrate

# Rollback last migration
docker-compose exec backend npx sequelize-cli db:migrate:undo

# Rollback all migrations
docker-compose exec backend npx sequelize-cli db:migrate:undo:all

# Check migration status
docker-compose exec backend npx sequelize-cli db:migrate:status
```

### Database Seeding
```powershell
# Seed database with sample data
docker-compose exec backend npm run seed

# Run specific seeder
docker-compose exec backend npx sequelize-cli db:seed --seed 20240101000001-seed-admin.js

# Undo all seeders
docker-compose exec backend npx sequelize-cli db:seed:undo:all
```

### Database Backup & Restore
```powershell
# Backup database
docker-compose exec db mysqldump -u root -prootpassword school_management > backup.sql

# Restore database
docker-compose exec -T db mysql -u root -prootpassword school_management < backup.sql

# Backup with timestamp
docker-compose exec db mysqldump -u root -prootpassword school_management > backup_$(Get-Date -Format "yyyyMMdd_HHmmss").sql
```

---

## 🛠️ Building & Rebuilding

### Build Commands
```powershell
# Build all services
docker-compose build

# Build specific service
docker-compose build backend
docker-compose build frontend

# Build without cache (clean build)
docker-compose build --no-cache

# Build and start
docker-compose up -d --build

# Force rebuild specific service
docker-compose build --no-cache backend
```

---

## 🧹 Cleanup & Maintenance

### Remove Containers
```powershell
# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove containers + volumes (⚠️ DELETES DATABASE)
docker-compose down -v

# Remove containers + volumes + images
docker-compose down -v --rmi all

# Remove only stopped containers
docker-compose rm
```

### Clean Docker System
```powershell
# Remove unused containers, networks, images
docker system prune

# Remove everything including volumes (⚠️ DANGEROUS)
docker system prune -a --volumes

# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# List all volumes
docker volume ls

# Remove specific volume
docker volume rm school-management-system_db_data
```

### View Disk Usage
```powershell
# Check Docker disk usage
docker system df

# Detailed disk usage
docker system df -v
```

---

## 🔍 Inspection & Debugging

### Container Inspection
```powershell
# Inspect container configuration
docker inspect school-management-backend

# View container environment variables
docker-compose exec backend env

# View container network
docker network inspect school-management-system_school-network

# View container logs
docker logs school-management-backend

# View container processes
docker-compose top backend
```

### Execute Commands in Containers
```powershell
# Open shell in backend container
docker-compose exec backend sh

# Open shell in database container
docker-compose exec db bash

# Execute single command
docker-compose exec backend npm --version
docker-compose exec backend node --version

# Execute command as root
docker-compose exec --user root backend sh
```

---

## 🌐 Network Management

### Network Commands
```powershell
# List all networks
docker network ls

# Inspect network
docker network inspect school-management-system_school-network

# Create custom network
docker network create my-network

# Remove network
docker network rm my-network
```

---

## 📁 Volume Management

### Volume Commands
```powershell
# List all volumes
docker volume ls

# Inspect volume
docker volume inspect school-management-system_db_data

# Create volume
docker volume create my-volume

# Remove volume (⚠️ DELETES DATA)
docker volume rm school-management-system_db_data

# Backup volume data
docker run --rm -v school-management-system_db_data:/data -v ${PWD}:/backup alpine tar czf /backup/db_backup.tar.gz /data
```

---

## 🔄 Updates & Upgrades

### Update Containers
```powershell
# Pull latest images
docker-compose pull

# Rebuild and restart with latest images
docker-compose up -d --build --force-recreate

# Update specific service
docker-compose pull backend
docker-compose up -d --build backend
```

### Update Application Code
```powershell
# After code changes, rebuild and restart
docker-compose up -d --build backend

# Or restart without rebuild (if no code changes)
docker-compose restart backend
```

---

## 🚨 Troubleshooting Commands

### Health Checks
```powershell
# Check container health
docker-compose ps

# Check backend health endpoint
curl http://localhost:5000/health

# Check database connection
docker-compose exec db mysqladmin ping -h localhost -u root -prootpassword
```

### Debugging Issues
```powershell
# View all container logs
docker-compose logs

# Check container resource limits
docker stats --no-stream

# View container events
docker events

# Check Docker daemon status
docker info

# Test Docker installation
docker run hello-world
```

### Common Issues
```powershell
# If containers won't start, check logs
docker-compose logs

# If port conflicts, check what's using the port
netstat -ano | findstr :5000
netstat -ano | findstr :3000
netstat -ano | findstr :3307

# Force remove stuck container
docker rm -f school-management-backend

# Restart Docker Desktop (Windows)
# Right-click Docker Desktop icon → Restart
```

---

## 📝 Environment & Configuration

### Environment Variables
```powershell
# View environment variables in container
docker-compose exec backend env | grep DB_

# Update .env file and restart
# Edit .env file, then:
docker-compose down
docker-compose up -d
```

### Configuration Files
```powershell
# Validate docker-compose.yml
docker-compose config

# View resolved configuration
docker-compose config --services
docker-compose config --volumes
```

---

## 🎯 Quick Reference Cheat Sheet

### Most Used Commands
```powershell
# Start everything
docker-compose up -d

# Stop everything
docker-compose down

# View logs
docker-compose logs -f

# Restart backend
docker-compose restart backend

# Run migrations
docker-compose exec backend npm run migrate

# Access database
docker-compose exec db mysql -u root -p

# Rebuild after code changes
docker-compose up -d --build backend
```

### Emergency Commands
```powershell
# Stop everything immediately
docker-compose down

# Reset everything (⚠️ DELETES DATA)
docker-compose down -v
docker-compose up -d --build

# Clean Docker system
docker system prune -a
```

---

## 📚 Additional Resources

### Docker Documentation
- Official Docker Docs: https://docs.docker.com/
- Docker Compose Docs: https://docs.docker.com/compose/

### Project-Specific
- See `DOCKER_SETUP.md` for detailed setup instructions
- See `README.md` for project overview

---

## 💡 Tips & Best Practices

1. **Always backup database before major changes**
   ```powershell
   docker-compose exec db mysqldump -u root -prootpassword school_management > backup.sql
   ```

2. **Use `-d` flag for detached mode** (runs in background)

3. **Check logs first when troubleshooting**
   ```powershell
   docker-compose logs -f backend
   ```

4. **Use `--build` flag after code changes**
   ```powershell
   docker-compose up -d --build backend
   ```

5. **Regular cleanup to save disk space**
   ```powershell
   docker system prune
   ```

6. **Monitor resource usage**
   ```powershell
   docker stats
   ```

7. **Keep .env file secure** - Never commit it to version control

8. **Use health checks** - Containers have health checks configured

---

## 🔐 Security Notes

- Change default passwords in `.env` file for production
- Use strong JWT secrets
- Regularly update Docker images: `docker-compose pull`
- Review container logs for security issues
- Limit container resource usage in production

---

**Last Updated:** 2024-11-19

