# Smart Exam Scheduler

University exam scheduling platform with:
- Node.js/Express backend
- React admin frontend
- Python scheduling engine (CSP + Hybrid CSP/GA)
- MongoDB persistence

## Features
- Admin authentication with JWT
- Student/subject/hall/teacher management
- Exam schedule generation with:
  - `csp` mode (fast baseline)
  - `hybrid-ga` mode (GA-optimized ordering + CSP placement)
- Dashboard with system stats and recent exam preview
- CSV export for generated schedules

## Local Development

### Backend
```bash
cp backend/config.env.example backend/config.env
npm --prefix backend install
npm --prefix backend run start
```

### Frontend
```bash
cp frontend/.env.example frontend/.env
npm --prefix frontend install
npm --prefix frontend run start
```

## First Login
- Open `http://localhost:3000/login`
- On first run, create the initial admin account
- Subsequent runs require login with that account

## Deployment
- Docker setup and production notes are in:
  - `docs/DEPLOYMENT.md`
