# INTEGRITY — Secure Examination Management & Academic Integrity Platform

> A full-stack, AI-powered platform for managing online examinations with real-time cheating detection using Graph Neural Networks (GNNs).

---

## Overview

**INTEGRITY** is a multi-portal examination platform built for academic institutions. It supports the full examination lifecycle — from exam creation and student registration, to live proctoring, GNN-based integrity prediction, and post-exam analytics.

### Core Portals

| Portal | Audience | Purpose |
|---|---|---|
| **Examiner Portal** | Lecturers / Faculty | Create and manage exams, view scores, run AI integrity checks |
| **Student Examination Portal** | Students | Write exams securely with anti-cheat enforcement |
| **Invigilator Portal** | Exam Supervisors | Monitor sessions, file reports, track countdowns |

---

## Key Features

- **Multi-format Question Engine** — MCQ, True/False, Fill-in-the-Blank (including multi-blank equations)
- **Live Session Monitoring** — tab switching, paste detection, USB detection, multi-device login, window blur
- **AI Integrity Prediction** — GNN-based cheating prediction per venue using Vanilla GCN, H2GCN, FAGCN, GraphSAGE
- **Auto-Save & Session Recovery** — survives browser crashes, network drops, and power outages
- **Student Relocation** — seamlessly move a student to a new computer mid-exam
- **Analytics & Reporting** — gender/program/course-level stats, grade boundaries, score scaling
- **Institution Branding** — logo and profile customization per institution

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js / Next.js, Tailwind CSS, ShadCN UI, Redux Toolkit / Zustand |
| Backend | Node.js + Express.js OR Django + DRF |
| Database | PostgreSQL (primary), Redis (sessions + auto-save) |
| Auth | JWT + Refresh Tokens + RBAC |
| Real-time | Socket.IO + WebSockets |
| ML Service | Python FastAPI + PyTorch Geometric |
| File Storage | AWS S3 / Cloudinary |
| Deployment | Vercel (frontend), Railway / Render / AWS EC2 (backend), Docker |

---

## Repository Structure

```
integrity/
├── frontend/               # React/Next.js app
├── backend/                # Node.js or Django API
├── ml-service/             # Python FastAPI + GNN models
├── docs/                   # Documentation
│   ├── SYSTEM_ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── API_DOCUMENTATION.md
│   ├── ML_PIPELINE.md
│   ├── LIVE_MONITORING.md
│   └── DEPLOYMENT_GUIDE.md
└── README.md
```

---

## Development Phases

| Phase | Focus |
|---|---|
| 1 | Authentication + Database setup |
| 2 | Exam creation system |
| 3 | Question engine |
| 4 | Student portal |
| 5 | Auto-save + session recovery |
| 6 | Live session monitoring |
| 7 | GNN integration |
| 8 | Analytics + reporting |
| 9 | Optimization + deployment |

---

## User Roles

- **Examiner** — Creates and manages exams, views results, triggers AI predictions
- **Student** — Registers, logs in, writes exams
- **Invigilator** — Supervises venues, files reports, monitors timers
- **Admin** *(optional)* — Global system management

---

## Supported Institutions (Branding Examples)

- Kwame Nkrumah University of Science and Technology (KNUST)
- University of Cape Coast (UCC)
- University of Education, Winneba (UEW)

---

## Getting Started

> Setup instructions are in [DEPLOYMENT_GUIDE.md](./docs/DEPLOYMENT_GUIDE.md).

```bash
# Clone the repository
git clone https://github.com/your-org/integrity.git
cd integrity

# Install frontend dependencies
cd frontend && npm install

# Install backend dependencies
cd ../backend && npm install

# Start ML service
cd ../ml-service && pip install -r requirements.txt && uvicorn app:app --reload
```

---

## License

MIT License — see `LICENSE` for details.
