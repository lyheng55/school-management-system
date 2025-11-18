# Docker Setup Guide

This guide explains how to run the School Management System using Docker.

## Prerequisites

- Docker Engine 20.10+ 
- Docker Compose 2.0+

## Quick Start

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update environment variables:**
   Edit `.env` file and update the following:
   - Database passwords
   - JWT secrets (IMPORTANT: Change these!)
   - Frontend URL for CORS
   - Other service-specific configurations

3. **Build and start all services:**
   ```bash
   docker-compose up -d --build
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend npm run migrate
   ```

5. **Seed the database (optional):**
   ```bash
   docker-compose exec backend npm run seed
   ```

## Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/health

## Services

### Database (MySQL)
- Port: 3306 (default)
- Data persisted in Docker volume: `db_data`
- Root password: Set in `.env` file

### Backend API
- Port: 5000 (default)
- Environment: Production
- Uploads directory: Mounted from `./backend/uploads`

### Frontend
- Port: 3000 (default)
- Served via Nginx
- API requests proxied to backend

## Useful Commands

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f db
```

### Stop services
```bash
docker-compose down
```

### Stop and remove volumes (WARNING: Deletes database data)
```bash
docker-compose down -v
```

### Rebuild specific service
```bash
docker-compose build backend
docker-compose build frontend
```

### Execute commands in containers
```bash
# Backend shell
docker-compose exec backend sh

# Database shell
docker-compose exec db mysql -u root -p

# Run migrations
docker-compose exec backend npm run migrate

# Run seeds
docker-compose exec backend npm run seed
```

### Restart services
```bash
docker-compose restart
```

## Production Deployment

For production deployment:

1. **Update environment variables:**
   - Use strong passwords
   - Change JWT secrets
   - Set proper FRONTEND_URL
   - Configure email/Telegram settings

2. **Use Docker secrets or environment files:**
   - Never commit `.env` file
   - Use Docker secrets or external secret management

3. **Configure reverse proxy:**
   - Use Nginx or Traefik as reverse proxy
   - Set up SSL/TLS certificates
   - Configure proper domain names

4. **Set resource limits:**
   Add to `docker-compose.yml`:
   ```yaml
   services:
     backend:
       deploy:
         resources:
           limits:
             cpus: '1'
             memory: 512M
   ```

5. **Enable health checks:**
   Health checks are already configured in Dockerfiles

## Troubleshooting

### Database connection issues
- Check if database container is healthy: `docker-compose ps`
- Verify database credentials in `.env`
- Check database logs: `docker-compose logs db`

### Frontend can't connect to backend
- Verify backend is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`
- Verify CORS settings in backend
- Check nginx proxy configuration in frontend container

### Port conflicts
- Change ports in `.env` file
- Or modify `docker-compose.yml` port mappings

### Build failures
- Clear Docker cache: `docker-compose build --no-cache`
- Check Dockerfile syntax
- Verify all dependencies are listed in package.json

## Network

All services are connected via `school-network` bridge network. Services can communicate using service names:
- Backend → Database: `db:3306`
- Frontend → Backend: `backend:5000`

