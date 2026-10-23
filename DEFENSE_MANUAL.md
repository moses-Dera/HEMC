# 🎓 2025/2026 BSc Final Project Defense Manual & Presentation Guide
**System Name:** Health Education & Medical Consultation Platform (HEMC)  
**Target Defense Dates:** Wednesday (28/10/2026) – Thursday (29/10/2026)  
**Strict Defense Time:** 20 Minutes (5 min Slides, 10 min Code Demo, 5 min Q&A / Scoring)  
**Grading Mode:** **Individual Scoring Only** (No collective group marks)

---

## 📌 Table of Contents
1. [The 20-Minute Defense Battleplan](#1-the-20-minute-defense-battleplan)
2. [Hallway & Laptop Pre-Setup Checklist (Crucial)](#2-hallway--laptop-pre-setup-checklist-crucial)
3. [PowerPoint Slides: Word-for-Word Content & Order](#3-powerpoint-slides-word-for-word-content--order)
   - [Slide 1: Title & Group Details](#slide-1-title--group-details)
   - [Slide 2: Abstract](#slide-2-abstract)
   - [Slide 3: Objectives of the Study](#slide-3-objectives-of-the-study)
   - [Slide 4: Level-1 / Level-2 Data Flow Diagram (DFD)](#slide-4-level-1--level-2-data-flow-diagram-dfd)
   - [Slide 5: Input Design Specifications (No Screenshots)](#slide-5-input-design-specifications-no-screenshots)
   - [Slide 6: Output Design Specifications (No Screenshots)](#slide-6-output-design-specifications-no-screenshots)
4. [Member 1 Live Demo Script: Database Design & Ingestion](#4-member-1-live-demo-script-database-design--ingestion)
   - [Database Table Inventory (15 Tables)](#database-table-inventory-15-tables)
   - [Live Form-to-Database Ingestion Steps](#live-form-to-database-ingestion-steps)
   - [Member 1 Examiner Questions & Rehearsed Answers](#member-1-examiner-questions--rehearsed-answers)
5. [Member 2 Live Demo Script: Objectives Verification](#5-member-2-live-demo-script-objectives-verification)
   - [Objective-by-Objective Live Run-Through](#objective-by-objective-live-run-through)
   - [Member 2 Examiner Questions & Rehearsed Answers](#member-2-examiner-questions--rehearsed-answers)
6. [Member 3 Live Demo Script: Code Architecture & Modules](#6-member-3-live-demo-script-code-architecture--modules)
   - [Unit Modules vs. Integrated Subsystems](#unit-modules-vs-integrated-subsystems)
   - [Member 3 Examiner Questions & Rehearsed Answers](#member-3-examiner-questions--rehearsed-answers)
7. [Post-Defense Submission Checklist & CD Requirements](#7-post-defense-submission-checklist--cd-requirements)

---

## 1. The 20-Minute Defense Battleplan

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        20-MINUTE DEFENSE TIMETABLE                                     │
├───────────────────────┬───────────────────────────────────┬────────────────────────────┤
│ Phase 1: Presentation │ Phase 2: Live Localhost Demo      │ Phase 3: Defense Q&A       │
│ (00:00 - 05:00)       │ (05:00 - 15:00)                   │ (15:00 - 20:00)            │
│ All 3 Members         │ 3 mins 20 secs per Member         │ Individual Defense         │
└───────────────────────┴───────────────────────────────────┴────────────────────────────┘
```

> [!IMPORTANT]
> **No collective group scoring is awarded.** Each member must speak and demonstrate their specific task. If one member runs over their time, other members lose their demonstration opportunity. Keep transitions crisp and practiced.

---

## 2. Hallway & Laptop Pre-Setup Checklist (Crucial)

> [!CAUTION]
> **NEVER run `docker compose up`, `pip install`, or `npm install` inside the defense hall.** Everything must already be booted and running on the laptop before stepping in.

### 20 Minutes Before Entering Hall (In the Waiting Area):
1. **Power & Screen:**
   - Plug laptop into wall power (or ensure 100% battery with High Performance plan).
   - Set screen sleep timeout to **"Never"**.
2. **Start Docker DB & Web Adminer:**
   ```bash
   cd ~/Desktop/HEMC
   docker compose up -d
   ```
   *Verify container health:* `docker ps` (Both `hemc_postgres` and `hemc_adminer` should be "Up").
3. **Run Migrations & Seed Data:**
   ```bash
   cd backend
   source venv/bin/activate
   alembic upgrade head
   python seed.py
   ```
4. **Start Backend Server:**
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```
5. **Start Frontend Server (in a second terminal):**
   ```bash
   cd ~/Desktop/HEMC/frontend
   npm run dev
   ```
6. **Pre-Open Browser Tabs (Google Chrome / Brave):**
   - **Tab 1:** `http://localhost:3000` (Student Portal / `/chat`)
   - **Tab 2 (Incognito):** `http://localhost:3000/doctor/dashboard` (Doctor Portal)
   - **Tab 3:** `http://localhost:8080` (Adminer Graphical Database Viewer)
     - *Login parameters:* System: `PostgreSQL`, Server: `db`, Username: `hemc_user`, Password: `hemc_password`, Database: `hemc_db`.
7. **PowerPoint Ready:**
   - Open `.pptx` presentation in **Slide Show Mode (F5)** on Slide 1.

---

## 3. PowerPoint Slides: Word-for-Word Content & Order

The department strictly enforces the following slide sequence.

### Slide 1: Title & Group Details
- **Project Title:** DESIGN AND IMPLEMENTATION OF A WEB-BASED HEALTH EDUCATION AND MEDICAL CONSULTATION PLATFORM (HEMC)
- **Case Study:** University Medical Centre / Student Health Services
- **Department:** Department of Computer Science
- **Presented by:** Group Members (Names & Registration Numbers)
- **Project Supervisor:** [Supervisor's Name]
- **Date:** October 2026

---

### Slide 2: Abstract
> **Abstract Text:**  
> Access to timely clinical guidance, confidential triage, and structured medical consultation remains a significant operational challenge in university campus health centres. Students frequently encounter long physical consultation queues, self-medicate due to medical misinformation, or experience delays in emergency escalation. This project designed and implemented the **Health Education and Medical Consultation Platform (HEMC)**—a secure, responsive web-based system providing automated AI-driven symptom triage, intelligent knowledge discovery, appointment scheduling with on-duty physicians, and clinical patient case handover.  
> 
> The system is architected using a modern decoupled paradigm: a **Next.js (TypeScript)** frontend adhering to the Backend-For-Frontend (BFF) pattern, a **FastAPI (Python)** REST backend powered by **SQLAlchemy ORM** and **PostgreSQL**, a hybrid **TF-IDF/LLM NLP pipeline** for clinical guidance, and asynchronous **Gmail REST API v1** for automated email alerts. Automated test suites validate future-date bookings, multi-session chat isolation, and queue transitions with 100% pass rates. The deployed platform demonstrates significant reduction in clinic waiting latency, eliminates clinical scheduling conflicts, and provides administrators with real-time surveillance over urgent student medical cases.

---

### Slide 3: Objectives of the Study

**General Objective:**  
To design and implement a web-based, AI-assisted health education and medical consultation platform that automates triage, doctor scheduling, and emergency management for university community healthcare.

**Specific Objectives:**
1. **Automated AI Clinical Triage:** To implement an intelligent conversational triage engine capable of evaluating patient symptoms, isolating red flags, and categorizing urgency levels (Emergency vs. Routine).
2. **Doctor-Specific Appointment Scheduling:** To develop a scheduling subsystem allowing students to book consultations with available on-duty physicians while strictly enforcing future-date validations.
3. **Physician Queue & Clinical Handover:** To design a doctor dashboard featuring real-time patient queue visualization, consultation conclusion (diagnosis/prescription), and inter-physician clinical case handover.
4. **Administrative Oversight & Notification Dispatch:** To provide administrators with real-time surveillance of urgent medical cases and deliver automated notification dispatch via asynchronous email alerts.

---

### Slide 4: Level-1 / Level-2 Data Flow Diagram (DFD)

```
                       ┌─────────────────────────────────────────┐
                       │          EXTERNAL ENTITIES              │
                       │  [Student/Patient]  [Doctor]  [Admin]   │
                       └───────────────────┬─────────────────────┘
                                           │ Credentials, Symptoms,
                                           │ Booking Requests, Consultations
                                           ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              HEMC PROCESSES (Level-1 DFD)                              │
├─────────────────────────┬─────────────────────────┬────────────────────────────────────┤
│ Process 1.0:            │ Process 2.0:            │ Process 3.0:                       │
│ User Authentication &   │ AI Clinical Triage &    │ Appointment Scheduling &           │
│ Demographic Profiling   │ Red-Flag Detection      │ Roster Availability Routing        │
├─────────────────────────┼─────────────────────────┼────────────────────────────────────┤
│ Process 4.0:            │ Process 5.0:            │ Process 6.0:                       │
│ Clinical Consultation & │ Automated Emergency &   │ Administrative Queue &             │
│ Physician Case Handover │ Status Notifications    │ Triage Rule Auditing               │
└─────────────────────────┴───────────┬─────────────┴────────────────────────────────────┘
                                      │
                                      ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                         DATA STORES (PostgreSQL Database)                              │
├─────────────────────────────────────┬──────────────────────────────────────────────────┤
│ D1: Users & Auth Store              │ D2: AI Chat & Triage Store                       │
│     (users, password_reset_tokens)  │     (chat_sessions, chat_messages, symptom_checks)│
├─────────────────────────────────────┼──────────────────────────────────────────────────┤
│ D3: Clinical Queue Store            │ D4: Knowledge & Operational Store                │
│     (doctors, duty_shifts,          │     (knowledge_base, triage_rules,               │
│      appointments, patient_handover)│      notifications, interaction_logs)            │
└─────────────────────────────────────┴──────────────────────────────────────────────────┘
```

#### DFD Component Explanation for Examiners:
1. **External Entities:**
   - **Student/Patient:** Initiates symptom checks, books consultations, reviews prescriptions.
   - **Medical Doctor:** Reviews assigned patient queue, confirms bookings, documents diagnoses, executes clinical case handover.
   - **Health Centre Administrator:** Audits system urgent cases, manages physician duty shifts, maintains triage rules and knowledge base.
2. **Data-Flows:**
   - `Student Credentials` $\rightarrow$ Process 1.0 $\rightarrow$ JWT Token.
   - `Symptom Query` $\rightarrow$ Process 2.0 $\rightarrow$ Urgency Level & Red-Flag Warnings.
   - `Appointment Payload` $\rightarrow$ Process 3.0 $\rightarrow$ Assigned Doctor Queue.
   - `Handover Reason & Notes` $\rightarrow$ Process 4.0 $\rightarrow$ Colleague Doctor Assignment.
   - `Status Trigger` $\rightarrow$ Process 5.0 $\rightarrow$ Student/Doctor Email Notification.
3. **Data-Stores:** `D1` (Users), `D2` (Chat & Triage), `D3` (Appointments & Queue), `D4` (Knowledge & Logs).

---

### Slide 5: Input Design Specifications (No Screenshots)
*Examiners require the structural input design rather than raw UI screenshots.*

| Form / Input Module | Input Fields & Controls | Data Type & Format | Validation Rules / Constraints |
| :--- | :--- | :--- | :--- |
| **Student Registration Form** | Full Name, UNN Email, Password, Reg Number, Department, Level, Hostel | Text, Email, Varchar(100), Int | Valid email format, unique email constraint, minimum 8-character password |
| **Medical Profile Input Form** | Blood Group, Genotype, Known Allergies, Emergency Contact Phone | Dropdown (A+, O+, etc.), Text, Tel | Valid phone number regex, standard blood group/genotype domain |
| **AI Symptom Check Form** | Natural Language Query, Primary Symptom, Duration of Fever | Multiline Text, Dropdown | Max 2000 chars, non-empty text, duration in days |
| **Appointment Booking Modal** | Appointment Date & Time, Doctor Selection, Clinical Reason | DateTime-Local, Dropdown (Foreign Key), Text | **Strict Future-Date rule** (`Date >= Current UTC`), doctor must be `is_available = True` |
| **Doctor Handover Form** | Colleague Doctor, Referral Reason, Clinical Observations/Notes | Dropdown (`doctor_id`), Enum (`shift_end`, `specialist_review`), Textarea | Valid assignment ID, active destination doctor, non-empty reason |

---

### Slide 6: Output Design Specifications (No Screenshots)
*Shows how the system formats and presents results back to the entities.*

| Output Document / Interface | Key Output Fields & Indicators | Output Format / Destination | Business Logic Trigger |
| :--- | :--- | :--- | :--- |
| **AI Triage Assessment Card** | Urgency Badge (`Urgent / Emergency` vs `Routine`), Summary, Clinical Red Flags, Recommended Action | Colored Metric Card + Natural Language Guidance in `/chat` | Computed by hybrid Scikit-Learn TF-IDF keyword & rule matching |
| **Appointment Booking Slip** | Appointment ID, Doctor Name, Specialization, Date/Time, Booking Status (`pending`, `confirmed`) | Responsive Visual Card (`/dashboard`) + Automated Email Slip | Triggered on appointment creation; updates on doctor confirmation |
| **Doctor Patient Queue Row** | Patient Name, Reg No, Department, Triage Urgency, Fever Duration, AI Chat Digest | Interactive Table Row in `/doctor/dashboard` | Filtered by `doctor_id` from `patient_assignments` table |
| **Urgent Cases Alert Board** | Student Name, Flagged Emergency Keywords, Check Timestamp, Direct Contact Action | High-priority Red Card in `/admin/dashboard` | Triggered whenever `SymptomCheck.outcome == 'urgent'` |

---

## 4. Member 1 Live Demo Script: Database Design & Ingestion

**Member 1 Role:** Database Architect & Data Ingestion Specialist  
**Time Allotted:** 3 minutes 20 seconds

### Member 1 Step-by-Step Speech & Actions:
1. **Open Adminer DB Viewer:** Switch to the browser tab `http://localhost:8080`.
2. **State to Examiners:**
   > *"Good day, distinguished panel of examiners. I am [Name], the first speaker. I will demonstrate how our conceptual database design agreed with the implemented relational database in PostgreSQL, and show live data ingestion through our system's forms."*
3. **Show Table Inventory:** Point to the left sidebar of Adminer:
   > *"Our system implements exactly 15 relational tables managed via SQLAlchemy ORM with foreign key integrity and audit timestamps:"*

#### Database Table Inventory (15 Tables)
| Table Name | Primary Key | Foreign Keys | Clinical / Operational Purpose |
| :--- | :--- | :--- | :--- |
| `users` | `id` | None | Stores students, doctors, and admins with hashed credentials and bio-data |
| `password_reset_tokens` | `id` | `user_id` $\rightarrow$ `users.id` | Secure one-time tokens for password recovery |
| `doctors` | `doctor_id` | `user_id` $\rightarrow$ `users.id` | Physician specializations, availability flags, and clinic profiles |
| `duty_shifts` | `shift_id` | `doctor_id` $\rightarrow$ `doctors.doctor_id` | Roster calendar tracking day/night on-duty shifts |
| `appointments` | `appointment_id`| `user_id`, `doctor_id` | Scheduled medical consultations with timestamps and status |
| `patient_assignments` | `assignment_id` | `appointment_id`, `doctor_id` | Routes patient case to a specific doctor's clinical consultation queue |
| `patient_handovers` | `handover_id` | `assignment_id`, `from_doctor_id`, `to_doctor_id` | Audit trail of case transfers between doctors (shift end / referral) |
| `chat_sessions` | `session_id` | `user_id` $\rightarrow$ `users.id` | Isolated AI conversation sessions with 2-hour inactivity auto-segmentation |
| `chat_messages` | `message_id` | `session_id` $\rightarrow$ `chat_sessions.session_id` | Individual conversational exchanges with role (`user` vs `assistant`) |
| `symptom_checks` | `check_id` | `user_id` $\rightarrow$ `users.id` | Patient triage queries, duration, fever, and urgency classification |
| `triage_rules` | `rule_id` | None | Emergency keyword patterns, red-flag triggers, and urgency weights |
| `knowledge_base` | `article_id` | None | Validated health education articles (Malaria, Typhoid, Sexual Health) |
| `notifications` | `notification_id`| `user_id` $\rightarrow$ `users.id` | In-app alerts for appointment updates and system reminders |
| `reminders` | `id` | `user_id` $\rightarrow$ `users.id` | Patient medication and follow-up appointment alerts |
| `interaction_logs` | `log_id` | None | Audit log tracking user actions and system errors |

---

### Live Form-to-Database Ingestion Steps:
1. In Adminer, click on the **`appointments`** table $\rightarrow$ click **"Select data"**. Show the current total row count (e.g. 2 rows).
2. Switch to the frontend tab (`http://localhost:3000`).
3. Click **"Book Appointment"**:
   - Choose Doctor: **Dr. Chikaodinaka Nwosu**
   - Choose Date: **Select a future date** (e.g. tomorrow 10:00 AM)
   - Click **"Confirm Appointment"**.
4. Switch immediately back to Adminer and click **"Refresh" (or F5)**.
5. **Show the Examiners:**
   - Point to the newly created row.
   - Point to `user_id` matching the logged-in student.
   - Point to `doctor_id = 1`.
   - Point to `status = 'pending'`.
   - Point to the timestamp `created_at`.
6. Conclude:
   > *"As demonstrated, the input supplied by the student through the user interface was validated and ingested in real time into our PostgreSQL database with full referential integrity. I now hand over to Member 2 to demonstrate how the study objectives were achieved."*

---

### Member 1 Examiner Questions & Rehearsed Answers

* **Q: Why did you use PostgreSQL instead of MySQL?**
  * **Answer:** *"PostgreSQL offers native support for JSONB data types (used in our `chat_sessions.flow_state` column to maintain conversational triage state), strict ACID compliance, and seamless compatibility with SQLAlchemy ORM and Alembic migrations."*
* **Q: How do you enforce security for stored passwords?**
  * **Answer:** *"Passwords are never stored in plaintext. They are salted and hashed using the `Bcrypt` cryptographic algorithm through Python's `passlib` library before insertion into the `users` table."*
* **Q: What happens to child records if a User is deleted?**
  * **Answer:** *"We defined foreign key constraints with appropriate cascade or restrict rules to ensure database integrity and avoid orphaned records."*

---

## 5. Member 2 Live Demo Script: Objectives Verification

**Member 2 Role:** Functional Objectives & Systems Validation Specialist  
**Time Allotted:** 3 minutes 20 seconds

### Member 2 Step-by-Step Speech & Actions:
1. **State to Examiners:**
   > *"Good day, examiners. I am [Name], the second speaker. I will demonstrate how each of our four specific objectives was successfully implemented and achieved by the running platform."*

---

### Objective-by-Objective Live Run-Through:

#### Objective 1: Automated AI Clinical Triage & Guidance
- **Action:** Open `http://localhost:3000/chat`.
- **Input:** Type: *"I have been having high fever for 4 days with severe neck stiffness and vomiting."*
- **Output:** Show the AI response:
  - System identifies **severe fever + neck stiffness (meningitis red flags)**.
  - Generates a prominent **Urgent / Emergency** clinical warning.
  - Automatically logs the assessment into the `symptom_checks` database table.

#### Objective 2: Doctor-Specific Appointment Booking with Validation
- **Action:** Open booking modal on `http://localhost:3000`.
- **Negative Test (Boundary Validation):** Pick a past date $\rightarrow$ System immediately blocks submission with an HTTP 400 error: *"Appointment date cannot be in the past"*.
- **Positive Test:** Select an on-duty doctor $\rightarrow$ Select a valid future date $\rightarrow$ Booking is created with status `'pending'`. Show that the doctor's name and specialization are displayed on the student's dashboard.

#### Objective 3: Physician Dashboard, Consultation & Case Handover
- **Action:** Switch to the Incognito tab logged in as **Dr. Chikaodinaka Nwosu** at `http://localhost:3000/doctor/dashboard`.
- **Show Queue:** Show the student's booking appearing in Dr. Nwosu's queue with clinical triage summary and recent AI chat digest.
- **Consultation Action:** Click **"Confirm"** $\rightarrow$ Status transitions to `'confirmed'`.
- **Clinical Handover Action:**
  - Click **"Refer / Handover Case"**.
  - Select colleague: **Dr. Emeka Ogbuefi**.
  - Select reason: **"Duty Shift Concluded / Handover to Next Roster"**.
  - Add notes: *"Patient examined, suspected uncomplicated malaria. Transferred to Dr. Ogbuefi for observation."*
  - Click **Submit Handover**.
  - Show that Dr. Nwosu's queue removes the patient, and an automated referral email was dispatched.

#### Objective 4: Administrative Oversight & Urgent Cases Surveillance
- **Action:** Switch to `http://localhost:3000/admin/dashboard`.
- **Show Alert Queue:** Point out the **Urgent Cases Queue**, where students flagged by the AI triage engine appear highlighted in red for immediate clinic intervention.
- Conclude:
  > *"All four specific objectives of our study have been practically verified on the live system. I now invite Member 3 to explain our unit modules and software architecture."*

---

### Member 2 Examiner Questions & Rehearsed Answers

* **Q: Can a student book two doctors at the exact same hour?**
  * **Answer:** *"The appointment service validates overlapping time windows and restricts appointment duplication for the same student on the same day."*
* **Q: What happens if a doctor goes off-duty?**
  * **Answer:** *"Our `doctors` table contains an `is_available` Boolean toggle and a `duty_shifts` roster table. The student booking interface dynamically queries `GET /doctors/` and only renders doctors currently on duty."*

---

## 6. Member 3 Live Demo Script: Code Architecture & Modules

**Member 3 Role:** Software Architecture & Unit Modules Specialist  
**Time Allotted:** 3 minutes 20 seconds

### Member 3 Step-by-Step Speech & Actions:
1. **State to Examiners:**
   > *"Good day, examiners. I am [Name], the third speaker. I will explain the underlying software architecture, unit functions, and integrated modules that make our platform robust, maintainable, and secure."*
2. **Open Visual Studio Code / IDE:** Have the project open in split view.

---

### Unit Modules vs. Integrated Subsystems

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SOFTWARE ARCHITECTURE                           │
├───────────────────────────────────┬────────────────────────────────────┤
│ Frontend (Next.js 16 + React 19)  │ Backend (FastAPI + Python 3.14)    │
│ - TypeScript Server Actions (BFF) │ - Modular Domain Routers & DTOs    │
│ - Tailwind CSS & Lucide UI        │ - SQLAlchemy ORM Repository Pattern│
│ - HttpOnly Cookie Authentication  │ - Scikit-Learn TF-IDF Triage Engine│
└───────────────────────────────────┴────────────────────────────────────┘
```

#### 1. Core Unit Modules (Functions with Single Responsibilities)
Show these exact files in the code editor:
- **`app/modules/appointments/service.py` (`validate_appointment_date`)**:
  - Unit logic ensuring `appointment_date > datetime.now(timezone.utc)`. Raises `ValueError` for past timestamps.
- **`app/modules/chat/repository.py` (`get_or_create_active_session`)**:
  - Implements **2-hour inactivity auto-segmentation**. If a student has been inactive for $>120$ minutes, the unit function automatically archives the previous session and generates a clean `session_id`.
- **`app/core/security.py` (`get_password_hash` & `verify_password`)**:
  - Secure Bcrypt hashing unit module with configurable salt rounds.
- **`app/modules/triage_rules/service.py` (`evaluate_symptoms`)**:
  - Rule-based parser mapping patient keyword tokens to emergency clinical thresholds.

#### 2. Integrated Modules (Multi-Component Subsystems)
- **Backend-For-Frontend (BFF) Auth Module (`app/core/deps.py` & `app/modules/auth/dependencies.py`)**:
  - Implements the BFF security paradigm. Checks for `access_token` in **HttpOnly Cookies** (protecting students against XSS attacks) and falls back to standard `Authorization: Bearer` headers for automated API test clients.
- **Hybrid AI Triage Engine (`app/modules/chat/service.py`)**:
  - Combines offline Scikit-Learn TF-IDF vectorization with LLM completion APIs. If external internet drops, the local classifier still performs emergency triage safely.
- **Asynchronous Notification Subsystem (`app/modules/notifications/service.py`)**:
  - Integrates FastAPI background tasks with the **Google Gmail REST API v1** via OAuth2 refresh tokens, dispatching responsive HTML appointment receipts and referral slips without blocking HTTP response times.

---

### Member 3 Examiner Questions & Rehearsed Answers

* **Q: Why did you choose FastAPI over Django or Flask?**
  * **Answer:** *"FastAPI is built on ASGI (Starlette) and Pydantic, providing asynchronous execution, high throughput, automated OpenAPI Swagger documentation, and native type-safety matching our TypeScript frontend."*
* **Q: How did you test your code to ensure no bugs?**
  * **Answer:** *"We authored comprehensive automated unit and integration tests using `pytest`. All 17 automated tests pass with 100% success across auth, appointments, multi-session chat isolation, and case handover."*

---

## 7. Post-Defense Submission Checklist & CD Requirements

Follow these exact steps immediately after completing the defense:

### Step 1: Immediately After Defense (Within 24 Hours)
1. **Retrieve Soft-Bound Copies:** Collect your soft-bound copies directly from the defense panel examiners.
2. **Review Corrections:** Read all notes made by the examiners.
3. **Meet Supervisor:** Meet your project supervisor within **24 hours** to review every required correction.
4. **Effect Corrections (Max 3 Days):** Make all text, diagram, and code corrections within 3 days. No supervisor score will be awarded after 3 days!

### Step 2: Hard-Binding Specifications
Once your supervisor approves all corrections:
- **Quantity:** Produce exactly **4 hard-bound copies**.
- **Colour:** **Black** hard-cover binding with embossed gold lettering.
- **Signatures:** Duly signed by your Supervisor and Head of Department (HOD).

### Step 3: CD Preparation (2 CDs Total)
Attach **two (2) CDs** using strong cellotape inside the back cover of **ONE** of the hard-bound copies.

**Each CD must be labeled with CD marker and contain:**
1. `01_Report/`: The softcopy of your complete written project report (`.pdf` and `.docx`) from Cover Page to References and Appendices.
2. `02_Source_Code/`: The complete backend and frontend source code, database migration files, and SQL dump.
3. `03_Screenshots/`: High-resolution screenshots of all major system inputs, outputs, dashboards, and test results.
4. `04_Presentation/`: The `.pptx` PowerPoint presentation slides used during defense.

### Step 4: Submission Routing (On or Before Wednesday, Nov 4, 2026)
- **Copy 1 (with 2 CDs attached):** Submit to **Mr. Iyke in the General Office** for official recording.
- **Copy 2:** Submit to **Mr. Iyke in the General Office** (second office copy).
- **Copy 3:** Submit to your **Project Supervisor** for final scoring.
- **Copy 4:** Retained by the **Project Group** for personal reference and NYSC documentation.
