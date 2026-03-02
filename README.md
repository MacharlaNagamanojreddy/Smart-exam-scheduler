# 🎓 Smart Exam Scheduler
<img width="2560" height="1440" alt="downloaded-image" src="https://github.com/user-attachments/assets/750023dd-9ef0-492d-afdf-788d19c42a99" />


A full-stack university exam scheduling platform that generates conflict-free exam timetables using intelligent algorithms (CSP + Hybrid GA).  
Built with a modern React admin interface, a scalable Node.js backend, and a Python scheduling engine.

<p align="center">
  <img src="https://img.shields.io/badge/Frontend-React-blue?style=flat-square" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS-38bdf8?style=flat-square" />
  <img src="https://img.shields.io/badge/Backend-Node.js-green?style=flat-square" />
  <img src="https://img.shields.io/badge/API-Express.js-black?style=flat-square" />
  <img src="https://img.shields.io/badge/Database-MongoDB-brightgreen?style=flat-square" />
  <img src="https://img.shields.io/badge/Scheduler-Python-yellow?style=flat-square" />
  <img src="https://img.shields.io/badge/Algorithms-CSP%20|%20GA-orange?style=flat-square" />
  <img src="https://img.shields.io/badge/Deployment-Docker-blue?style=flat-square" />
</p>

---
<img width="1710" height="864" alt="Screenshot 2026-03-02 at 10 39 20 PM" src="https://github.com/user-attachments/assets/5c364739-532d-4b17-a5c9-d1965abb6add" />

---

## 🚀 Features

### 💼 Admin Portal
- JWT-based authentication  
- Manage Students  
- Manage Subjects  
- Manage Teachers  
- Manage Halls  

### 🤖 Smart Scheduling Engine
- **CSP Mode**  
  - Fast baseline solver  
  - Ensures no student exam clashes  
  - Assigns halls based on capacity  
- **Hybrid GA Mode**  
  - Genetic Algorithm orders subjects  
  - CSP places them smartly in the timetable  
  - Produces optimized, balanced schedules  

### 📊 Dashboard
- System statistics  
- Quick metrics  
- Recent exam schedule preview  
- CSV export for schedules  

---

## 🧠 Tech Stack

### Frontend
- React  
- React Router  
- Tailwind CSS  
- Axios  

### Backend
- Node.js  
- Express.js  
- MongoDB (Mongoose)  
- JWT Authentication  

### Scheduler
- Python  
- CSP Solver  
- Hybrid GA Optimization  

---

## 🗂 Folder Structure

```
smart-exam-scheduler/
│
├── backend/        # Node.js + Express API
│   ├── src/
│   ├── server.js
│   └── config.env.example
│
├── frontend/       # React Admin UI
│   ├── src/
│   ├── App.jsx
│   └── .env.example
│
└── scheduler/      # Python CSP/GA Engine
```

---

## 🔧 Local Development Setup

### 1. Backend Setup
```
cp backend/config.env.example backend/config.env
npm --prefix backend install
npm --prefix backend run start
```

### 2. Frontend Setup
```
cp frontend/.env.example frontend/.env
npm --prefix frontend install
npm --prefix frontend run start
```

### Running URLs
- Frontend: http://localhost:3000  
- Backend:  http://localhost:5000  

---

## 🔐 First Login

1. Navigate to:  
   **http://localhost:3000/login**
2. Create the **initial admin account**  
3. Use the same credentials for future logins  

---

## 📅 How Scheduling Works

### Inputs:
- Students  
- Subjects  
- Halls  
- Teacher list  

### Outputs:
- Clean, conflict-free exam timetable  
- Optimized slot assignment  
- CSV export  

### Algorithm Pipeline:

```mermaid
flowchart LR

A[React Admin UI] -->|REST API| B[Node.js + Express Backend]
B -->|Queries| C[(MongoDB Database)]

B -->|Invoke| D[Python Scheduler Engine]
D -->|Returns Timetable| B

subgraph Scheduling Engine
D1[CSP Solver]
D2[Hybrid GA Optimizer]
D1 --> D2
end

B -->|Sends Data| A
A -->|CSV Export| E[User Download]
```

---

## 📦 Deployment

Docker and production configuration:  
```
docs/DEPLOYMENT.md
```

Supports:
- Docker Compose  
- Cloud deployment  
- Nginx reverse proxy  
- Railway / Render / VPS  

---

## 👨‍💻 Author

**Macharla Naga Manoj Reddy**  
Smart Exam Scheduler — Prototype Release  

If you found this project helpful, please ⭐ the repo!
