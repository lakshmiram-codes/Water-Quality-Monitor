# WaterWatch — Real-Time Water Quality Monitor

WaterWatch is a collaborative, real-time water safety platform for citizens, NGOs, and
authorities. It combines government water-quality data, citizen pollution reports, and
rule-based + statistical alerting into one dashboard.

Built per the original project brief's four modules:

- **Module A** — User & Report Management (JWT auth, roles, report submission/moderation)
- **Module B** — Real-Time Water Data & Maps (station map, external API adapters)
- **Module C** — Alerts & Collaboration Tools (auto + manual alerts, NGO project registry)
- **Module D** — Analytics & Predictive Insights (historical trend charts, risk scoring)

## Tech stack

| Layer     | Technology                     |
|-----------|---------------------------------|
| Frontend  | React.js + Tailwind CSS (Vite) |
| Backend   | FastAPI (Python)                |
| Database  | PostgreSQL + SQLAlchemy/Alembic |
| Auth      | JWT (access + refresh tokens)   |

## Project structure

```
waterwatch/
├── backend/            FastAPI app, models, routers, services, tests, migrations
├── frontend/            React + Tailwind SPA
├── docker-compose.yml    One-command local stack (Postgres + backend + frontend)
├── README.md             This file
└── DEVELOPMENT_GUIDE.md   Full setup, API reference, and deployment notes
```

## Quick start (Docker — recommended)

```bash
docker compose up --build
```

This starts Postgres, runs migrations, seeds demo data, and starts both the API
(`http://localhost:8000`) and the frontend (`http://localhost:5173`).

Demo logins (password for all: `password123`):

| Role      | Email                  |
|-----------|-------------------------|
| Citizen   | citizen@example.com    |
| NGO       | ngo@example.com         |
| Authority | authority@example.com  |
| Admin     | admin@example.com      |

See **DEVELOPMENT_GUIDE.md** for full setup without Docker, the API reference,
how the external water-data adapters and predictive model work, testing, and
deployment guidance.
