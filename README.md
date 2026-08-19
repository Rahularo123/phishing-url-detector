# AI-Powered Phishing URL Detector

A full-stack web app that analyzes a submitted URL in real time and predicts
how likely it is to be a phishing link — using a trained ML model, not a
static blocklist. Built as a Software Engineering group project.

## Team
- **Rahul Arora** — Backend, Machine Learning, project integration
- **[Teammate 1 name]** — Frontend
- **[Teammate 2 name]** — Documentation, testing, dashboard support

## Tech Stack
- **Frontend:** React, Context API, REST calls
- **Backend:** Express.js (Node)
- **Machine Learning:** Python, scikit-learn, pandas
- **Database:** MongoDB Atlas (via Mongoose)

## Folder Structure
```
/frontend     → React app (UI)
/backend      → Express server + API routes
/ml           → Python scripts: dataset, feature extraction, model training
/docs         → API_CONTRACT.md, PPT, report, notes
```

## Getting Started

### Frontend
```
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` by default.

### Backend
```
cd backend
npm install
node server.js
```
Runs on `http://localhost:5000`. Requires a `.env` file (see `.env.example`)
with a `MONGO_URI` value — ask Rahul for the real connection string, never
commit real credentials to GitHub.

### ML (Python)
```
cd ml
pip install -r requirements.txt
python train_model.py
```

## API Contract
All endpoints, request/response shapes, and field definitions are documented
in [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md). The frontend is built
against this contract using mock data — read it before building or changing
any screen that talks to the backend.

## Git Workflow (read this before pushing anything)
- Never commit directly to `main`.
- Create a branch for whatever you're working on: `git checkout -b your-branch-name`
- Commit small, often, with clear messages.
- Push your branch and open a Pull Request into `main` when ready for review.
- Pull the latest `main` before starting new work each session:
  `git checkout main && git pull origin main`

Full step-by-step instructions are in [`docs/SETUP_STEPS.md`](./docs/SETUP_STEPS.md).

## Status
🚧 In development — see `docs/API_CONTRACT.md` for the current planned scope.
