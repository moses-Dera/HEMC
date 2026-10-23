# HEMC (Health Education & Medical Consultation Platform)

A comprehensive, robust medical consultation and clinical triage platform featuring AI-assisted knowledge querying, doctor/patient scheduling, emergency red-flag triage, and automated multi-channel notifications.

> 🎓 **For Final BSc Project Defense (October 2026):**  
> Please see the complete [DEFENSE_MANUAL.md](file:///home/moze/Desktop/HEMC/DEFENSE_MANUAL.md) for the exact 20-minute presentation guide, verbatim PowerPoint slides (Abstract, Objectives, Level-1/2 DFD, Input/Output designs), individual demonstration scripts for Member 1, Member 2, and Member 3, and the post-defense CD submission protocol.

---

## ⚡ Tech Stack
- **Frontend**: Next.js 16 (App Router, Server Actions, React 19), Tailwind CSS, TypeScript, Sonner Toasts, Lucide Icons
- **Backend**: FastAPI, SQLAlchemy ORM, PostgreSQL, Alembic, Passlib (Bcrypt), Python-Jose (JWT)
- **Database & Viewer**: PostgreSQL 15 + Adminer Web Database GUI (via Docker Compose)
- **AI/NLP Pipeline**: Scikit-Learn TF-IDF Triage Classifier (Offline resilient) & NVIDIA LLM API (Inference)
- **Notifications**: Google Gmail REST API v1 (OAuth2 Refresh Token)

---

## 🚀 Quickstart Localhost Setup (Recommended for Defense)

Running with Docker ensures you have an isolated, offline-resilient PostgreSQL database and a visual database GUI running on your laptop with zero host OS configuration.

### 1. Start the Database & Graphical DB Viewer (Docker)
In the project root directory, run:
```bash
docker compose up -d
```
This spins up:
* **PostgreSQL Database:** Running locally on port `5433` (container port `5432`).
* **Adminer Web Database Viewer:** Running in your browser at `http://localhost:8080`.

To log into Adminer:
- **System:** `PostgreSQL`
- **Server:** `db`
- **Username:** `hemc_user`
- **Password:** `hemc_password`
- **Database:** `hemc_db`

---

### 2. Backend Setup (FastAPI)
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate       # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure your `backend/.env` file:
   ```env
   PROJECT_NAME="HEMC"
   SECRET_KEY="supersecretkey_change_me_in_production"
   ALGORITHM="HS256"
   ACCESS_TOKEN_EXPIRE_MINUTES=10080
   DATABASE_URL="postgresql://hemc_user:hemc_password@localhost:5433/hemc_db"
   ```
5. Apply database migrations (builds all 15 relational tables):
   ```bash
   alembic upgrade head
   ```
6. Seed the database with default accounts, doctors, and triage rules:
   ```bash
   python seed.py
   ```
7. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
   *Backend API & Interactive Swagger Docs:* `http://127.0.0.1:8000/docs`

---

### 3. Frontend Setup (Next.js)
1. Open a second terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *Frontend Application:* `http://localhost:3000`

---

## 👥 Pre-Configured Demo Accounts (Ready for Defense)

All accounts are pre-seeded via `python seed.py` with default password: **`password123`**

| Role | Name / Specialization | Email | Password | Primary Interface |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Moses Okonkwo (Comp Sci, 400L) | `okonkwomoses158@gmail.com` | `password123` | `http://localhost:3000` |
| **Doctor 1** | Dr. Chikaodinaka Nwosu (*Tropical Health*) | `chika.nwosu@unn.edu.ng` | `password123` | `http://localhost:3000/doctor/dashboard` |
| **Doctor 2** | Dr. Emeka Ogbuefi (*Infectious Diseases*) | `emeka.ogbuefi@unn.edu.ng` | `password123` | `http://localhost:3000/doctor/dashboard` |
| **Doctor 3** | Dr. Nneka Ibe (*Emergency Care*) | `nneka.ibe@unn.edu.ng` | `password123` | `http://localhost:3000/doctor/dashboard` |
| **Admin** | University Health Centre Administrator | `admin@example.com` | `adminpass` | `http://localhost:3000/admin/dashboard` |

---

## 🧪 Automated Test Suite

The backend includes comprehensive automated integration test suites covering auth, appointments, multi-session chat isolation, and clinical case handover:

```bash
cd backend
./venv/bin/pytest
```
*Expected Result:* **17 passed, 0 failed (100% Green)**.

---

## 🛠 Database Management & Migrations

If you need to reset or rebuild the database at any time:
1. Ensure Docker is running: `docker compose up -d`
2. Run migrations: `alembic upgrade head`
3. Seed default data: `python seed.py`
4. Inspect tables graphically at `http://localhost:8080`.

---

## ☁️ Production Deployment Guide (Render)

### Deploying the Backend (FastAPI)
1. In Render, create a new **Web Service**.
2. Connect your GitHub repository and set Root Directory to `backend`.
3. Build Command: `pip install -r requirements.txt && alembic upgrade head && python seed.py`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Environment Variables:
   - `DATABASE_URL`: Hosted PostgreSQL connection string (e.g. Supabase).
   - `SECRET_KEY`: Secure secret string.

### Deploying the Frontend (Next.js)
1. In Vercel or Render, create a new Web Service pointing to `frontend`.
2. Build Command: `npm run build`
3. Start Command: `npm run start`
4. Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://hemc-backend.onrender.com/api/v1`).
