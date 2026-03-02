# Deployment Guide

## Option 1: Docker Compose (recommended)

### Prerequisites
- Docker Desktop (or Docker Engine + Compose plugin)

### Run
```bash
docker compose up --build -d
```

### Services
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000`
- Health: `http://localhost:5000/health`
- MongoDB: `mongodb://localhost:27017/exam_scheduler`

### Stop
```bash
docker compose down
```

### Reset database volume
```bash
docker compose down -v
```

## Option 2: Manual deploy (Node process + MongoDB)

### Backend
1. Copy environment file:
```bash
cp backend/config.env.example backend/config.env
```
2. Update secrets (`JWT_SECRET`) and DB URI.
3. Install and start:
```bash
npm --prefix backend install
npm --prefix backend run start
```

### Frontend
1. Copy environment file:
```bash
cp frontend/.env.example frontend/.env
```
2. Set `REACT_APP_API_URL` to your backend URL.
3. Build:
```bash
npm --prefix frontend install
npm --prefix frontend run build
```
4. Serve `frontend/build` with Nginx, Caddy, or any static host.

## Production notes
- Use HTTPS in production.
- Rotate `JWT_SECRET` and avoid default values.
- Restrict CORS to your frontend domain.
- Back up MongoDB volume/snapshots.
