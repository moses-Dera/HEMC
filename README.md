# HEMC (Health Education & Medical Consultation)

A comprehensive, robust medical consultation platform featuring AI-assisted knowledge querying, doctor/patient scheduling, and robust in-app notifications.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS, TypeScript, Sonner (Toasts), Lucide Icons
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic, Passlib (Bcrypt), Python-Jose (JWT)
- **AI/NLP**: `scikit-learn` TF-IDF Classifier (Fallback) & OpenAI/NVIDIA LLM API (Rewording)
- **Emails**: Google API Client (`gmail v1`) & SMTP

---

## 🚀 Setup & Local Development Guide

### 1. Database Setup (PostgreSQL)
Ensure you have PostgreSQL installed and running locally, or use a hosted solution like Supabase or Neon.

1. Create the database user and database:
   ```sql
   CREATE USER hemc_user WITH PASSWORD 'hemc_password';
   CREATE DATABASE hemc_db;
   GRANT ALL PRIVILEGES ON DATABASE hemc_db TO hemc_user;
   ```

2. Update your `backend/.env` file:
   ```env
   DATABASE_URL="postgresql://hemc_user:hemc_password@localhost:5432/hemc_db"
   SECRET_KEY="supersecretkey_change_me_in_production"
   ```

### 2. Backend Setup
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run Database Migrations (This creates the tables):
   ```bash
   alembic upgrade head
   ```
5. **Seed the Database** (This creates the default Admin and Doctor users, plus default knowledge base topics):
   ```bash
   python seed.py
   ```
6. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload
   ```
   *The backend will be running at http://127.0.0.1:8000*

### 3. Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Ensure you have a `.env` file in the frontend (optional, defaults to localhost):
   ```env
   NEXT_PUBLIC_API_URL="http://127.0.0.1:8000/api/v1"
   ```
4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   *The frontend will be running at http://localhost:3000*

---

## 🛠 Adding a New Database (Migrations Workflow)
If you ever change your PostgreSQL provider (e.g., deploying to production) or drop your local database, you need to recreate the tables and data.

**Steps to initialize a new Database:**
1. Update `DATABASE_URL` in `backend/.env`.
2. Run `alembic upgrade head` from the `backend` folder to instantly rebuild all tables.
3. Run `python seed.py` to populate it with the default Administrator and Knowledge Base data.

*Note: The `seed.py` script is **idempotent**. You can run it multiple times safely without creating duplicate data.*

---

## ☁️ Deployment Guide (Render)

### Deploying the Backend (FastAPI)
1. In Render, create a new **Web Service**.
2. Connect your GitHub repository.
3. Set the Root Directory to `backend`.
4. Set the Environment to **Python**.
5. Set the Build Command:
   ```bash
   pip install -r requirements.txt && alembic upgrade head && python seed.py
   ```
6. Set the Start Command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
7. Add Environment Variables:
   - `DATABASE_URL`: Add your production PostgreSQL URL (e.g., from Supabase).
   - `SECRET_KEY`: A strong randomized string.

### Deploying the Frontend (Next.js)
1. In Render (or Vercel), create a new **Web Service**.
2. Set the Root Directory to `frontend`.
3. Build Command: `npm run build`
4. Start Command: `npm run start`
5. Add Environment Variables:
   - `NEXT_PUBLIC_API_URL`: The URL of your deployed Render FastAPI service (e.g., `https://hemc-backend.onrender.com/api/v1`).
