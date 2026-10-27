# 📘 SOFTWARE INSTALLATION AND OPERATIONAL MANUAL
**System Title:** Design and Implementation of a Web-Based Health Education and Medical Consultation Platform (HEMC)  
**Target Environment:** Localhost Demonstration & Production Deployment  
**Institution:** Department of Computer Science, University of Nigeria, Nsukka (UNN)

---

## 4.0 Procedure for Installing and Using the Software

This section gives the step-by-step procedure for installing and using the software. It is divided into two parts: **Part A: Installation and Environment Configuration**, which guides the system engineer through setting up the server, database, and client dependencies; and **Part B: System Operational and Usage Guide**, which outlines the day-to-day clinical, student, and administrative workflows.

---

### A. Installation and Environment Configuration

#### 1. Software Prerequisites
Ensure the target host computer has the following runtime environments and dependencies installed:
* **Python 3.10+ (or Python 3.11 / 3.12 / 3.14):** Including `pip` (Python Package Manager) and `venv` (Virtual Environment module). Verify with `python3 --version`.
* **Node.js (v18.0.0+ or v20.x LTS) & npm:** Node runtime for compiling the Next.js frontend application. Verify with `node -v` and `npm -v`.
* **PostgreSQL Database Server (v14+ or v15+):** Either installed natively as a local system service or provisioned via **Docker & Docker Compose** (recommended for cross-platform isolation).
* **Git:** Version control client for cloning the repository codebase.

---

#### 2. Database and User Provisioning
Launch the PostgreSQL interactive terminal (`psql`) as the administrative `postgres` user and execute the following SQL commands to create the dedicated database instance and assign secure user privileges:

```sql
-- 1. Create a dedicated database user with password encryption
CREATE USER hemc_user WITH ENCRYPTED PASSWORD 'hemc_password';

-- 2. Create the empty relational database for the platform
CREATE DATABASE hemc_db OWNER hemc_user;

-- 3. Grant schema and execution permissions to the application user
GRANT ALL PRIVILEGES ON DATABASE hemc_db TO hemc_user;
```

*(Alternatively, if running via Docker Compose in the project root, simply execute `docker compose up -d` to automatically spin up a dedicated PostgreSQL 15 container on host port `5433` alongside an Adminer Web Database GUI on port `8080`).*

---

#### 3. Environment Configuration File Setup
Clone or extract the project folder to the host computer:
```bash
git clone https://github.com/moses-Dera/HEMC.git
cd HEMC
```

Navigate to the `backend/` directory. Duplicate the environment template `.env.example` to create the production settings file named `.env`:
```bash
cd backend
cp .env.example .env
```

Open `backend/.env` in any standard text editor and populate the key-value configuration pairs:
```env
# Platform Identification
PROJECT_NAME="HEMC"
ENVIRONMENT="development"

# Cryptographic Token Authentication
SECRET_KEY="supersecretkey_change_me_in_production_jwt_signing_token"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Database Connection URI (PostgreSQL)
# Format: postgresql://<username>:<password>@<host>:<port>/<database_name>
DATABASE_URL="postgresql://hemc_user:hemc_password@localhost:5433/hemc_db"

# Automated Emergency & Appointment Notification Configuration
EMAIL_FROM="official.hemc.unn@gmail.com"
GOOGLE_CLIENT_ID="your_google_oauth_client_id.apps.googleusercontent.com"
GOOGLE_CLIENT_SECRET="your_google_oauth_client_secret"
GMAIL_REFRESH_TOKEN="your_oauth2_refresh_token"

# Hybrid AI / LLM Inference Service (NVIDIA NIM / Llama-3.2)
OPENAI_API_KEY="your_api_key_here"
OPENAI_BASE_URL="https://integrate.api.nvidia.com/v1"
OPENAI_MODEL_NAME="meta/llama-3.2-11b-vision-instruct"
```

---

#### 4. Python Virtual Environment and Dependency Installation
Within the `backend/` directory, create an isolated Python virtual environment to prevent package version conflicts with the operating system, activate it, and install all required modules listed in `requirements.txt`:

```bash
# Create the virtual environment
python3 -m venv venv

# Activate the virtual environment
# On Linux / macOS:
source venv/bin/activate
# On Windows (Command Prompt / PowerShell):
venv\Scripts\activate

# Upgrade pip to latest version
pip install --upgrade pip

# Install all backend dependencies (FastAPI, SQLAlchemy, Alembic, Scikit-learn, etc.)
pip install -r requirements.txt
```

---

#### 5. Database Migration, Initial Knowledge Base Seeding, and NLP Classifier Training
Execute the setup sequence to build all relational tables, populate the baseline medical education content, seed administrative and doctor accounts, and train the offline intent classification model:

##### a. Apply Database Migrations (Builds All 15 Relational Tables):
Run the Alembic migration command to compile the database schema:
```bash
alembic upgrade head
```
*Outcome:* Builds the relational schema across `users`, `doctors`, `duty_shifts`, `appointments`, `knowledge_base`, `triage_rules`, `symptom_checks`, `patient_assignments`, `patient_handovers`, `notifications`, `chat_sessions`, `chat_messages`, `reminders`, `interaction_logs`, and `revoked_tokens`.

##### b. Load Initial Knowledge Base, Clinical Triage Rules, and Seed Accounts:
Execute the database seeding script:
```bash
python seed.py
```
*Outcome:* 
* Populates authoritative WHO and NCDC health education records for Malaria and Typhoid (symptoms, transmission causes, and preventive sanitation).
* Inserts clinical emergency red-flag triage thresholds into the `triage_rules` table.
* Seeds default accounts:
  * **Student Account:** `okonkwomoses158@gmail.com` (Password: `password123`)
  * **Medical Staff / Doctors:** `chika.nwosu@unn.edu.ng`, `emeka.ogbuefi@unn.edu.ng`, `nneka.ibe@unn.edu.ng` (Password: `password123`)
  * **System Administrator:** `admin@example.com` (Password: `adminpass`)

##### c. Train the Machine Learning Intent Classifier:
Train and serialize the Scikit-Learn Natural Language Processing (NLP) pipeline:
```bash
python -m app.nlp.train
```
*Outcome:* Reads `app/nlp/data/intents.csv`, fits the TF-IDF Vectorizer with n-grams and balanced Logistic Regression, and serializes the trained offline model to `app/nlp/artifacts/model.joblib`.

---

#### 6. Start the Backend API Server
Launch the asynchronous FastAPI server using the Uvicorn ASGI engine with live reload enabled:
```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* **Active Backend Gateway:** `http://127.0.0.1:8000`
* **Automated Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
* **Health Check & Redoc Documentation:** `http://127.0.0.1:8000/redoc`

---

#### 7. Frontend Dependency Installation and Execution
Open a second terminal window, navigate to the `frontend/` directory, install all Node.js package dependencies, and start the Next.js development server:

```bash
cd frontend

# Install package dependencies
npm install

# Start the Next.js development server
npm run dev
```

---

#### 8. Access the Software Interface
Launch any standard modern web browser (Google Chrome, Mozilla Firefox, Microsoft Edge, or Brave) and navigate to:
```
http://localhost:3000
```
The HEMC homepage and portal interface will be displayed.

---

### B. System Operational and Usage Guide

Once installation is verified, users interact with the system according to their assigned institutional role:

#### 1. Student / Patient Workflow
1. **Authentication:**
   * Navigate to `http://localhost:3000/login` or `http://localhost:3000/register`.
   * New students register with their Full Name, Email (`@unn.edu.ng`), Department, Academic Level, and Matriculation/Reg Number.
2. **Health Education Inquiries:**
   * Open the **Interactive Chat** (`/chat`).
   * Enter natural language questions regarding disease etiology, symptoms, or prevention (e.g., *"What are the symptoms of typhoid?"*, *"How does malaria spread?"*).
   * The system routes the query through the TF-IDF intent classifier, matches authoritative WHO/NCDC knowledge base entries, and returns cited guidance.
3. **Symptom Triage Assessment:**
   * Select **"Symptom Checker"** from the portal menu.
   * Respond to structured clinical prompts regarding fever duration and red-flag symptoms (e.g., persistent vomiting, severe dehydration, difficulty breathing, convulsions).
   * If emergency red flags are identified, the system immediately tags the session as **URGENT**, alerts clinic staff, and instructs the student to proceed to the UNN Medical Centre immediately.
4. **Clinical Appointment Booking:**
   * Select **"Book Appointment"** (`/appointments/book`).
   * Select a clinical department or available on-duty doctor, choose a preferred date and hour window, enter reason for visit, and submit.
   * The student receives immediate confirmation, and an automated background reminder is scheduled for dispatch 24 hours prior to the consultation.

#### 2. Medical Officer / Doctor Workspace Workflow
1. **Doctor Login:**
   * Medical officers log in using their clinic credentials (e.g., `chika.nwosu@unn.edu.ng` / `password123`) at `http://localhost:3000/login`.
   * The platform redirects automatically to the **Doctor Clinical Dashboard** (`/doctor/dashboard`).
2. **Reviewing Patient Consultations:**
   * View the daily patient roster, appointment status, and assigned consultation desks.
   * Click on any patient record to inspect their reported symptom duration, AI triage severity rating, and past Medical Centre consultations.
3. **Conducting Consultations & Clinical Notes:**
   * Click **"Attend to Patient"** to record clinical observations, diagnosis summary, and recommended prescription or lab test orders.
   * Mark appointment status as **"Completed"**.
4. **Shift Handover Protocol:**
   * When concluding a clinical duty rotation, click **"Initiate Handover"** to transfer active or pending clinic cases to the incoming on-duty doctor.

#### 3. System Administrator Workflow
1. **Administrative Governance Login:**
   * Administrators log in at `http://localhost:3000/login` using administrative credentials (e.g., `okonkwomoses158@gmail.com` or `admin@example.com`).
   * Access the **Administrative Governance Dashboard** (`/admin/dashboard`).
2. **Emergency Cases Surveillance Queue:**
   * Monitor the **Urgent Queue** tab to track critical student triage escalations in real time.
   * Mark escalated cases as **"Reviewed"** or **"Contacted"** once clinical emergency staff reach out to the patient.
3. **Doctor Duty Roster Scheduling:**
   * Open the **Duty Roster** tab to view coverage schedules across Morning (08:00–14:00), Afternoon (14:00–20:00), and Night (20:00–08:00) shifts.
   * Assign doctors to upcoming dates or modify shift coverage to prevent clinic staffing gaps.
4. **User & Role Management:**
   * Navigate to the **Users & Roles** tab to view all platform accounts.
   * Click **"Add New User"** to provision new medical officers by specifying their clinical specialization (e.g., *Pediatrics*, *General Medicine*).
   * Update credentials, search user directories, or modify account permissions with automated protection against accidental admin self-demotion.
5. **Clinical Triage Rules Configuration:**
   * Open the **Triage Rules** tab to update or add red-flag criteria and fever duration thresholds without writing code or redeploying the backend.
