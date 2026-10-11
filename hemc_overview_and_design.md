# Product Requirements Document

## UNN Health Education & Management Chatbot (Malaria/Typhoid Focus)

**Source:** Derived from the client's BSc project report (Mgbo, Mike-Obiesie, Morah — UNN CS Dept, Supervisor Dr. Caroline N. Asogwa) and rewritten as an implementable engineering spec.

**Revision note (v6 — complete):** Backend is **Python (FastAPI) + PostgreSQL + a locally-trained scikit-learn intent classifier**; frontend is **Next.js/React** consuming the backend as a REST API. Two stack deviations from the report (frontend, database) plus a set of additions and field-level schema changes are all catalogued in **Appendix A (Report Conformance Matrix)** so nothing is hidden. **v6 addition:** doctor duty scheduling, patient-doctor assignment, and patient handover — a hospital-operations feature set not present in the source report, added by client request. See §7, §9, §13, §14, §21.

**Delivery context:** this is delivered as a **demo/simulation on localhost** (permitted by the client), not a production deployment. The design is still built to production-grade structure (modular, secured, documented), but two consequences follow: (1) it must run with a single command on a client's own machine (§20), and (2) clinical content (triage rules, KB text) is illustrative, since the source report never specifies it — the *procedure and structure* are what must match the report, and they do (Appendix A).

---

## 1. Executive Summary

A web-based conversational system for the UNN Medical Centre community (students + staff) that does two things, and explicitly only two things:

1. **Health education** — answers questions about malaria and typhoid (symptoms, causes, prevention) using content sourced only from WHO/NCDC, never generated freely.
2. **Health management** — lets a user check symptom urgency (not diagnose), book appointments, and get reminders.

The single most important constraint in the whole document, and the one the original report is most explicit about: **this is not a diagnostic tool**. That constraint drives almost every architecture decision below — especially the NLP design (§7) and the triage engine (§10).

---

## 2. Goals / Non-Goals

**Goals**

- Give accurate, sourced (WHO/NCDC) education on malaria & typhoid, 24/7, in plain conversational text.
- Let a user self-assess urgency ("should I go to the Medical Centre now, or can this wait?") via structured questioning, not free-text diagnosis.
- Let a user book/manage a Medical Centre appointment and receive reminders.
- Keep an auditable interaction log for admin oversight and system monitoring.
- Give admins a way to maintain the knowledge base without touching code.

**Non-Goals**

- No diagnosis, no medication/dosage advice, no differentiation "you have malaria vs typhoid."
- No free-form generation of medical claims. Every educational answer must trace back to a KB row with a WHO/NCDC source field.
- No voice interface (explicitly out of scope per the source doc).
- No EHR integration, no clinical record-keeping beyond appointment status.

---

## 3. Users

| Role | Description | Key actions |
| --- | --- | --- |
| **Student/Staff (User)** | Primary end user, UNN-affiliated | Register/login, chat, ask health questions, run symptom check, book/cancel appointment, receive reminders |
| **Doctor** | Medical Centre physician | View duty roster, see assigned patients, initiate/accept patient handovers, view patient triage history |
| **Admin** | Medical Centre staff / project maintainer | CRUD knowledge base entries, manage duty shifts and doctor profiles, view/manage appointments, view interaction logs, manage user accounts |
| **(Future) Health worker** | Not in current scope | Would extend doctor role with case management beyond reviewed/contacted — flagged as a v2 candidate |

---

## 4. Scope Boundary (in vs. out)

**In scope**

- Text chat over a web browser.
- Malaria + typhoid education content only (extensible schema, content restricted to these two at launch).
- Urgency-only symptom triage (red flag → "go now", amber → "book appointment soon", green → "self-care + educational content").
- Appointment booking with doctor assignment — appointments are booked against the Medical Centre, then assigned to an on-duty doctor by an admin (or auto-assigned to the next available doctor).
- Doctor duty scheduling — admin manages shift rosters; doctors see their shifts and currently assigned patients.
- Patient handover — when a doctor's shift ends (or for clinical reasons), a patient's active assignment transfers to another on-duty doctor with a documented reason and acknowledgement.
- Reminders tied to appointments.
- Role-based auth: student, staff, doctor, admin.

**Out of scope (v1)**

- Payments, insurance, EHR.
- Multi-language / Igbo-language support (a good v2 differentiator, but confirm with client before adding).
- Push notifications / SMS — the source doc says "reminder," not delivery channel. **Open question for the client** (§21): email, SMS, or in-app? Assumed email unless told otherwise.

---

## 5. Functional Requirements

### 5.1 Authentication & Accounts

- FR-1: Register with full name, university email, password, role (student/staff — admin is provisioned, not self-registered).
- FR-2: Passwords **hashed** with bcrypt (the source doc says "encrypted" — that's the wrong primitive for passwords; flagged as a correction to the client).
- FR-3: JWT-based session (access + refresh token), issued by the FastAPI backend, stored/used by the Next.js frontend.
- FR-4: Role-based route/API guards (student/staff vs admin).
- FR-25: Password reset via a time-limited, single-use emailed link — not specified anywhere in the source report, but required for any real login system. Reuses the same SMTP infrastructure as reminders.

### 5.2 Conversational Interface

- FR-5: Persistent chat UI (Next.js), message history scoped to the logged-in user.
- FR-6: Every user message is classified into one of a fixed intent set (§7) before any response is generated — no intent, no free response.
- FR-7: Unrecognized/low-confidence intent → fallback message with an explicit menu ("I can help with malaria/typhoid education, symptom urgency checks, or booking an appointment"). Never guess.

### 5.3 Health Education (Knowledge Base)

- FR-8: KB entries keyed by `(disease, category)` where disease ∈ {malaria, typhoid}, category ∈ {symptom, cause, prevention, general}.
- FR-9: Every KB entry carries a `source` (WHO/NCDC) and `source_url`/citation — the chatbot must be able to say "according to WHO" when it answers.
- FR-10: Chatbot response for an education intent = KB content directly, optionally passed through a light templating layer for phrasing variety. No generative model involved (§7) — nothing is invented.

### 5.4 Symptom Triage (urgency only)

- FR-11: Structured question flow (not free text) collecting: duration of fever, presence of red-flag symptoms (persistent vomiting, severe dehydration, confusion, difficulty breathing, seizure, high unremitting fever >3 days).
- FR-12: Output is one of: **Urgent — go to the Medical Centre now**, **Book an appointment soon**, **Self-care + educational content**, always with a disclaimer that this is not a diagnosis.
- FR-13: Urgent outcomes trigger an **immediate notification** (email) to a designated Medical Centre staff address — not just a passive log entry — and are logged with a flag admins can filter on.
- FR-26: Triage rules (red-flag symptoms, duration thresholds, and their outcomes) are stored in the `triage_rules` table and editable by an admin without a code change or redeploy — same pattern as the knowledge base.

### 5.5 Appointment Scheduling

- FR-14: User can request an appointment (date; time slot if the Medical Centre exposes slots — confirm with client, source schema only has a date).
- FR-15: Status lifecycle: `pending → confirmed → cancelled → completed → no_show`.
- FR-16: User can view/cancel their own upcoming appointments.
- FR-17: Admin can confirm/cancel any appointment.

### 5.6 Doctor Duty Scheduling & Patient Assignment

- FR-27: Admin can register a user as a doctor (creating a doctor profile with specialization) and manage doctor profiles.
- FR-28: Admin can create, edit, and delete duty shifts for doctors. Each shift has a date, start time, end time, and status (`scheduled → on_duty → completed | absent`).
- FR-29: A doctor can view their own upcoming and current shifts on a dedicated dashboard.
- FR-30: When an admin confirms an appointment (FR-17), they assign it to an on-duty doctor. Alternatively, the system can auto-assign to the next available on-duty doctor with the fewest current assignments.
- FR-31: A doctor can view their currently assigned patients (active `patient_assignments` linked to confirmed appointments), including each patient's triage history if a `symptom_check` preceded the booking.
- FR-32: Users can see the name of the doctor assigned to their confirmed appointment on their `/appointments` page.

### 5.7 Patient Handover

- FR-33: Handover can be automatic or manual. At the end of a shift (or if a doctor is marked `absent`), the system automatically transfers their active patient assignments to the next available on-duty doctor (preferably matching specialization).
- FR-34: A doctor (or admin) can also initiate a manual handover specifying a reason (`emergency`, `specialization`, `other`) and optional notes.
- FR-35: The receiving doctor sees a pending handover notification on their dashboard. For automatic handovers, the transfer is immediate and recorded; for manual, they must acknowledge receipt.
- FR-36: Handover history is fully auditable — every handover records `from_doctor`, `to_doctor`, `reason` (including `auto_shift_end`), `notes`, `handover_at`, and `acknowledged_at` (auto-populated for automatic transfers).
- FR-37: Admin can view all handover records across the system for oversight, filterable by doctor, date, and reason.

### 5.8 Reminders

- FR-18: On appointment confirmation, a reminder record is created with a `scheduled_time` and message content.
- FR-19: A scheduled job sends the reminder at `scheduled_time` via the chosen channel (email assumed for v1).

### 5.9 Interaction Logging

- FR-20: Every user action (intent, timestamp) is logged for admin monitoring and the project's evaluation chapter.
- FR-21: Store the classified intent + structured triage answers, not raw free text, to minimize sensitive-data footprint (§11).

### 5.10 Admin

- FR-22: Admin dashboard: KB CRUD, duty roster management, doctor profiles, appointment list/status management with doctor assignment, interaction log viewer/filter (e.g., by urgent-flag), handover audit log, basic usage stats (queries/day, top intents, doctors on duty).

### 5.11 Urgent Escalation (active, not passive)

- FR-23: An urgent triage outcome sends an immediate email to a configured Medical Centre staff address, in addition to being logged — the flag must reach a human, not just sit in a filterable table.
- FR-24: Each urgent `symptom_check` record carries a `reviewed`/`contacted` status an admin can update, so there's a record of follow-up rather than just a record of occurrence.

---

## 6. Non-Functional Requirements

- **Security**: TLS everywhere, hashed passwords, short-lived JWTs, rate limiting on auth and chat endpoints, input validation on every field (this is a health app — treat it like one).
- **Privacy**: Health-adjacent data (symptom answers, appointment reasons) is sensitive under Nigeria's Data Protection Act (NDPR). Minimize retention, encrypt at rest, restrict admin access, get explicit consent at registration.
- **Accuracy**: Zero tolerance for the bot inventing medical facts — enforced by design here, since the classifier can only route to stored KB content, not generate.
- **Availability**: Single-region deployment is fine at campus scale; target simple uptime (99%+), don't over-engineer.
- **Accessibility**: Text-only per scope, but should still meet basic WCAG (contrast, keyboard nav, screen-reader labels).
- **Performance**: Sub-second classification + KB lookup — trivial at this scale for a classical ML classifier.

---

## 7. NLP / Intent Recognition Design — locally-trained classifier (final choice)

The source report never names a specific framework — it only ever says "an NLP framework for intent recognition" (§1.5, §2.1.2, §3.2.2). This decision fills that gap.

**Chosen approach: TF-IDF + a linear classifier (logistic regression or linear SVM), via scikit-learn.**

Not a transformer/deep-learning model — with a small, fixed intent set (\~14 intents: 8 education intents \[2 diseases × 4 categories\], symptom-check start, book appointment, cancel appointment, reminder query, greeting, fallback — full list in Appendix B) classical ML is enough, trains in seconds on CPU, and is far easier to explain and defend in a viva than "we fine-tuned a transformer."

**Pipeline:**

1. User message → TF-IDF vectorization → classifier → `(intent, confidence)`.
2. Confidence below threshold → fallback menu, never a guess.
3. Education intents → direct lookup of the matching `knowledge_base` row(s) by `(disease, category)`. Response is the stored content, optionally passed through a small templating layer for natural phrasing variety — no generation, no LLM.
4. Symptom-check/appointment/reminder intents → deterministic flows, unrelated to the classifier once intent is known.
5. Simple keyword/rule matching handles entity extraction (which disease, which category) — full NER is unnecessary given the fixed vocabulary.

**The real work this creates, and it's non-trivial:** a labeled training set of 20–50 example phrasings per intent, deliberately including the local phrasing patterns the report itself flags as a known weakness in prior systems (Nigerian English/Pidgin variants of "fever," "hot body," "belle dey pain," etc.). Budget real time for this — it's the actual engineering effort here, not a config setting.

**What this buys you:** zero ongoing inference cost, fully deterministic and offline-capable (no internet dependency at runtime, which also solves any demo/viva connectivity risk), no hallucination or prompt-injection risk category at all — it can only route to stored content, never invent anything. It also matches exactly what the report's methodology chapter can defend.

**Trade-off accepted:** less tolerant of messy/unexpected phrasing than an LLM would be, and you own retraining/versioning the model yourself as intents evolve.

---

## 8. Optional: LLM Enhancement Layer (not required, additive only)

Everything in §7 works standalone with zero LLM involvement. This section describes an **optional layer that can be added on top later** — it never replaces the classifier and never becomes a dependency the core system needs to function. Flagged as optional throughout the rest of this document (§9, §16, §17, §19) so it doesn't get treated as part of the required build.

**Where an LLM could plug in, each with a different risk profile:**

1. **Rewording layer (low risk, worth doing early if pursued at all).** Classifier picks the intent → KB lookup retrieves the fact → an LLM call rewords *only* that retrieved text conversationally. System prompt hard-forbids adding anything not present in the passed-in content. The LLM never sees the raw question and never decides what's true — it only reformats something already vetted from the KB.
2. **Disambiguation layer (medium risk, real value, bigger lift).** When classifier confidence is low, call the LLM with a forced structured choice: "given this message and these \~14 possible intents, which one, or none?" Still constrained to the fixed intent set — not a free response. Turns some "I don't understand" fallbacks into correct routing.
3. **Never: open-ended answering.** Triage, booking, and reminders stay fully deterministic regardless of whether this layer is added — no LLM in those paths, ever. The LLM never answers a health question from its own knowledge, only ever reformats content already retrieved from the KB.

**What adding this costs, if pursued:**

- Internet dependency returns, but only for LLM-touched turns — triage, booking, and high-confidence classifications stay fully offline.
- Real but bounded per-request cost (short, tightly-scoped calls, not open-ended generation).
- Needs a scoped eval suite checking that reworded replies don't drift from their source KB row — smaller in scope than a full RAG eval, but still a real requirement before shipping this layer.

**Recommendation:** treat tier 1 (rewording) as the only one worth prioritizing if this gets built at all — cheap, low-risk, real quality gain, and doubles as a nice demo-polish improvement. Tier 2 (disambiguation) is a stretch goal given its eval burden relative to its marginal gain. Neither is required for launch.

**Also worth doing regardless of this section:** KB content and phrasing variants can be *authored* with an LLM once, offline, during content prep — draft facts, generate a few natural phrasings, human-verify against WHO/NCDC sources, store the vetted text. This improves runtime response quality with zero runtime LLM dependency and no architectural change at all — see §18 build plan, phase 2.

---

## 9. System Architecture

```
[Browser: Next.js (React) — chat, appointments, reminders, profile, admin/*]
        │  HTTPS/REST (JSON) — calls FastAPI directly
[FastAPI backend — modular: controller / dto / spec / service / repository]
        │
 ┌──────┴────────────────────────────────────────────────────┐
 │  auth (JWT)    users    admin API                          │
 │                                                            │
 │  chat (orchestrator) ──► nlp/ (scikit-learn classifier,    │
 │      │                       loaded once at startup)       │
 │      │  intent + confidence                                │
 │      ├─► knowledge_base lookup ──► reply (+ WHO/NCDC cite) │
 │      │      └─ [optional §8: LLM reword of retrieved text] │
 │      ├─► symptom_check ◄── triage_rules (DB, admin-editable)│
 │      │      └─ urgent ► notifications (staff email)        │
 │      ├─► appointments ──► reminders                        │
 │      └─► interaction_logs (every exchange)                 │
 └───────────────┬───────────────────────────┬────────────────┘
                 │                           │
   [PostgreSQL via SQLAlchemy]      [APScheduler jobs → notifications:
    users, knowledge_base,           reminder emails, urgent alerts,
    appointments, reminders,         password-reset emails → SMTP]
    interaction_logs, symptom_checks,
    triage_rules, chat_sessions,
    chat_messages, password_reset_tokens]
```

Two deployed processes (Next.js frontend, FastAPI backend), one shared PostgreSQL database. This matches the report's three-module breakdown (User Interaction, Chatbot Intelligence, Health Management) with the classifier→KB/Triage split and the async reminder job made explicit — both are implied but never actually specified in the original report.

**On running two processes ("without stress"):** this is genuinely light infrastructure, not a burden.

- **Locally**: two terminal tabs — `uvicorn main:app --reload` (FastAPI, port 8000) and `npm run dev` (Next.js, port 3000). Next.js calls `http://localhost:8000` for the API. No Docker required, though Docker Compose is worth it for PostgreSQL specifically given the 3-person team (avoids each person installing/configuring Postgres separately).
- **Resource footprint**: the classifier is a small scikit-learn model (a few KB to low MB on disk), loads into memory once at startup, near-instant inference — no GPU, no meaningful RAM/CPU pressure. This is not comparable to running an LLM locally.
- **In production**: one VPS running both processes behind nginx (nginx routes `/api/*` → FastAPI, everything else → Next.js) is the simplest setup — one server, one bill, one thing to SSH into. Splitting hosting (Next.js on Vercel, FastAPI on Railway/Render) also works if preferred, just adds a second provider and CORS config between them.

---

## 10. Symptom Triage Engine — logic sketch

Structured, not free-text (avoids the "ambiguous query → misclassification" weakness the source doc itself names in its Limitations section):

1. Ask: fever duration (buttons: \<24h / 1–3 days / >3 days).
2. Ask: any red-flag symptom present? (checklist: severe/persistent vomiting, inability to keep fluids down, confusion/drowsiness, difficulty breathing, seizure, severe abdominal pain, signs of dehydration).
3. Decision table:
   - Any red flag checked → **Urgent: go to Medical Centre now.**
   - Fever >3 days, no red flag → **Book an appointment soon** + relevant malaria/typhoid education.
   - Fever \<3 days, no red flag → **Self-care + education**, with an explicit "if symptoms worsen or persist beyond 3 days, book an appointment" nudge.
4. Every path ends with the standard disclaimer: *"This is not a diagnosis. If in doubt, visit the Medical Centre."*

**Note on the report vs. this logic:** the source report defines symptom triage only conceptually (it names the `Symptom Checker` class and confirms urgency-flagging behavior) — it contains no actual red-flag list or thresholds anywhere. The table above is illustrative content built to operationalize their concept, not something derived from the report or a validated clinical source. Fine for a demo (it correctly implements the report's *described procedure*); would need real sign-off before any production use.

**Storage:** rules live in the `triage_rules` table (§11), not hardcoded — same editable-without-redeploy pattern as the knowledge base, so this content can be corrected later (by a supervisor, a clinician, or just iteration) without a code change.

---

## 11. Data Model

The source report defines five tables (Users, Knowledge Base, Appointments, Reminders, Interaction Logs). Those five are kept and extended below; nine more tables are added to support behaviours the report describes in its class/sequence diagrams but never gave a table (Symptom Checker, chat continuity) or omitted entirely (password reset, editable triage rules, doctor duty scheduling, patient assignment and handover). Every difference is itemised in Appendix A.

**users** `user_id (PK), full_name, email (unique), password_hash, role (student|staff|doctor|admin), created_at, is_active`

**knowledge_base** `topic_id (PK), disease (malaria|typhoid), category (symptom|cause|prevention|general), content (text), source (WHO|NCDC), source_url, updated_at, updated_by (FK→users)`

**appointments** `appointment_id (PK), user_id (FK), appointment_date, status (pending|confirmed|cancelled|completed|no_show), created_at`\
*(report specifies only Pending/Confirmed/Cancelled; `completed` and `no_show` added for reporting — the first three behave exactly as the report describes)*

**reminders** `reminder_id (PK), appointment_id (FK), message, scheduled_time, sent_at (nullable), channel (email)`

**interaction_logs** `log_id (PK), user_id (FK), action (varchar — the report's original field, kept), intent, structured_payload (json), urgent_flag (bool), timestamp`\
*(report has `action VARCHAR(100)` only; `action` is kept and `intent`/`structured_payload`/`urgent_flag` are added alongside it, so the report's field is still present)*

**symptom_checks** *(the report names a `Symptom Checker` class but defines no table for it — this table is what persists its results; needed for FR-11–13, FR-23–24)* `check_id (PK), user_id (FK), status (in_progress|completed), fever_duration, red_flags (json), outcome (urgent|book|self_care), timestamp, notified_at (nullable — when the staff alert email was sent), reviewed (bool, default false), reviewed_by (FK→users, nullable), reviewed_at (nullable), contacted (bool, default false)`

**password_reset_tokens** *(new — not in source doc, needed to implement FR-25)* `token_id (PK), user_id (FK), token_hash, expires_at, used (bool, default false), created_at`

**chat_sessions** *(new — holds multi-turn state so triage and booking flows can span several messages)* `session_id (PK), user_id (FK), active_flow (none|symptom_check|booking), flow_state (json), started_at, last_active_at`

**chat_messages** *(new — satisfies FR-5 message history)* `message_id (PK), session_id (FK), user_id (FK), role (user|bot), content (text), intent (nullable), created_at`\
*Privacy split: `chat_messages` is visible only to the owning user (and deletable by them). Admins see `interaction_logs` (intent + structured payload, no raw free text) — never `chat_messages`. This is how FR-5 (history) and FR-21 (minimise stored free text for admin view) both hold.*

**triage_rules** *(new — moves symptom-triage decision content out of code, same editable-without-redeploy pattern as `knowledge_base`)* `rule_id (PK), condition_type (red_flag|duration_threshold), label, value, outcome (urgent|book|self_care), active (bool, default true), updated_at, updated_by (FK→users)`

**doctors** *(new — not in source doc; extends users with clinical-profile data needed for duty scheduling and patient assignment, FR-27–32)* `doctor_id (PK), user_id (FK→users, unique), specialization (varchar — e.g. "General Practice", "Internal Medicine"), is_available (bool, default true), created_at`\
*A `doctor` is always also a `user` with `role=doctor`. This table holds the extra profile fields; all auth/identity stays in `users`.*

**duty_shifts** *(new — the duty roster, FR-28–29)* `shift_id (PK), doctor_id (FK→doctors), shift_date (date), start_time (time), end_time (time), status (scheduled|on_duty|completed|absent), created_at, updated_at`\
*Constraint: no overlapping shifts for the same doctor on the same date. Status transitions: `scheduled → on_duty → completed` (normal) or `scheduled → absent` (no-show). Admin-managed; doctors see read-only.*

**patient_assignments** *(new — links a confirmed appointment to the doctor treating the patient, FR-30–32)* `assignment_id (PK), appointment_id (FK→appointments, unique), doctor_id (FK→doctors), assigned_at (timestamp), status (active|transferred|completed)`\
*Created when an admin confirms an appointment and assigns a doctor (or auto-assigns). `transferred` status means a handover has moved this patient to another doctor. `completed` when the appointment is marked completed.*

**patient_handovers** *(new — full audit trail of patient transfers between doctors, FR-33–37)* `handover_id (PK), assignment_id (FK→patient_assignments), from_doctor_id (FK→doctors), to_doctor_id (FK→doctors), reason (auto_shift_end|emergency|specialization|other), notes (text, nullable), handover_at (timestamp), acknowledged_at (timestamp, nullable)`\
*A handover creates a new `patient_assignments` row for the receiving doctor and sets the old one to `transferred`. Automatic shift-end handovers process instantly and set `acknowledged_at` automatically.*

---

## 12. Core API Endpoints (REST, served by FastAPI)

```
POST   /auth/register
POST   /auth/login
POST   /auth/refresh
POST   /auth/forgot-password       → issues a reset token, emails the link
POST   /auth/reset-password        → { token, new_password }

POST   /chat/message              → { intent, confidence, reply, kb_source?, quick_replies? }
GET    /chat/history              (mine — current/previous sessions)
POST   /chat/session/new          (reset conversation)
POST   /symptom-check/start
POST   /symptom-check/{id}/answer
GET    /symptom-check/{id}/result

GET    /appointments               (mine — includes assigned doctor name if confirmed)
POST   /appointments
PATCH  /appointments/{id}          (cancel — user; confirm/cancel/assign — admin)

GET    /reminders                  (mine)

GET    /users/me                   (profile)
PATCH  /users/me                   (edit name / change password)

# Doctor only
GET    /doctor/dashboard                  (current shift, assigned patients, pending handovers)
GET    /doctor/shifts                     (my upcoming + past shifts)
GET    /doctor/patients                   (my active patient assignments with triage history)
POST   /doctor/handovers                  (initiate a handover to another on-duty doctor)
PATCH  /doctor/handovers/{id}/acknowledge (accept an incoming handover)
GET    /doctor/handovers                  (my handover history — sent and received)

# Admin only
GET    /admin/knowledge-base
POST   /admin/knowledge-base
PATCH  /admin/knowledge-base/{id}
DELETE /admin/knowledge-base/{id}
GET    /admin/triage-rules
POST   /admin/triage-rules
PATCH  /admin/triage-rules/{id}
DELETE /admin/triage-rules/{id}
GET    /admin/doctors                     (list all doctor profiles)
POST   /admin/doctors                     (register a user as a doctor — creates doctor profile)
PATCH  /admin/doctors/{id}                (update specialization, availability)
DELETE /admin/doctors/{id}                (remove doctor profile — user account stays)
GET    /admin/duty-shifts                 (all shifts, filterable by doctor/date/status)
POST   /admin/duty-shifts                 (create a shift)
PATCH  /admin/duty-shifts/{id}            (update shift time/status)
DELETE /admin/duty-shifts/{id}            (cancel a shift)
GET    /admin/doctors/on-duty             (currently on-duty doctors — used for assignment)
POST   /admin/appointments/{id}/assign    (assign a doctor to a confirmed appointment)
GET    /admin/handovers                   (all handover records, filterable by doctor/date/reason)
GET    /admin/appointments
GET    /admin/users
PATCH  /admin/users/{id}           (activate/deactivate, change role)
GET    /admin/stats                (queries/day, top intents, pending appointments, urgent count, doctors on duty)
GET    /admin/logs?urgent=true
GET    /admin/urgent-flags               (symptom_checks with outcome=urgent, filterable by reviewed)
PATCH  /admin/urgent-flags/{id}          (mark reviewed/contacted)
```

Next.js consumes these as a plain REST client (no server-side rendering coupling required for chat/appointments — client-side fetch is fine).

---

## 13. Backend Module Architecture

Full modularity per feature, mapped onto FastAPI's equivalents of controller/service/DTO/repository:

```
app/
  modules/
    auth/
      controller.py        ← controller: defines endpoints, calls service, returns response
      dto.py               ← DTOs: Pydantic request/response models
      spec.py              ← interfaces, OpenAPI constants, validation rules
      service.py         ← business logic (hashing, JWT issuing, validation rules)
      dependencies.py     ← DI: get_current_user, role guards
      exceptions.py        ← module-specific errors (InvalidCredentials, etc.)

    users/
      controller.py
      dto.py
      spec.py              ← interfaces, OpenAPI constants, validation rules
      service.py
      repository.py        ← DB queries isolated here (SQLAlchemy)
      dependencies.py

    chat/
      controller.py         ← POST /chat/message, history, session reset
      dto.py
      spec.py
      service.py            ← orchestrator: classify → route to KB / symptom_check / appointments; composes reply; writes interaction log
      repository.py         ← chat_sessions + chat_messages

    knowledge_base/
      controller.py
      dto.py
      spec.py
      service.py
      repository.py

    symptom_check/
      controller.py
      dto.py
      spec.py
      service.py            ← reads rules from triage_rules, evaluates the decision table (§10)
      repository.py         ← triage_rules + symptom_checks queries

    triage_rules/
      controller.py         ← admin CRUD for rules
      dto.py
      spec.py
      service.py
      repository.py

    appointments/
      controller.py
      dto.py
      spec.py
      service.py
      repository.py

    doctors/
      controller.py         ← admin CRUD for doctor profiles + admin duty-shift management
      dto.py
      spec.py
      service.py            ← doctor registration, availability, auto-assignment logic
      repository.py         ← doctors + duty_shifts queries

    doctor_dashboard/
      controller.py         ← /doctor/* endpoints (dashboard, shifts, patients, handovers)
      dto.py
      spec.py
      service.py            ← handover initiation/acknowledgement, shift-end warnings
      repository.py         ← patient_assignments + patient_handovers queries

    reminders/
      controller.py
      dto.py
      spec.py
      service.py
      jobs.py               ← APScheduler job definitions live with their module

    interaction_logs/
      controller.py
      dto.py
      spec.py
      service.py

    notifications/
      service.py            ← single email-sending service used by reminders, urgent-flag alerts, password reset, handover notifications
      templates/            ← email templates

  nlp/                       ← the Intent Recognizer (standalone package, not a standard backend module)
    data/intents.csv         ← labeled training phrasings (Appendix B)
    train.py                 ← offline: fit TF-IDF + classifier, evaluate, write artifacts
    classifier.py            ← loads artifacts once at startup; predict(text) → (intent, confidence)
    artifacts/               ← tfidf.joblib, model.joblib (checked in so a fresh clone runs)

  core/
    config.py               ← env/settings
    security.py             ← JWT encode/decode, password hashing helpers (shared)
    db.py                   ← SQLAlchemy engine/session factory

  models/                    ← SQLAlchemy ORM models, one file per table
    user.py
    knowledge_base.py
    appointment.py
    reminder.py
    interaction_log.py
    chat_session.py
    chat_message.py
    symptom_check.py
    triage_rule.py
    password_reset_token.py
    doctor.py
    duty_shift.py
    patient_assignment.py
    patient_handover.py

  main.py                    ← creates the FastAPI app, includes every module's controller
```

**Layer definitions:**

- **Controller = `controller.py`.** Thin — parses the request via the DTO, calls the service, returns the response. No business logic here (replaces FastAPI's default `router.py` naming for better OOP alignment).
- **DTO = `dto.py`.** Pydantic models, split by direction (e.g. `UserCreateRequest` vs. `UserResponse`).
- **Spec = `spec.py`.** Interfaces, enums, validation constants, and OpenAPI documentation metadata specific to the module.
- **Service = `service.py`.** All business logic — classifier calls, the triage decision table, authorization rules like "can this user cancel this appointment," handover validation ("is the receiving doctor actually on duty?"), auto-assignment logic. Controllers never contain `if`/business rules directly.
- **Repository = `repository.py`.** Isolates raw SQLAlchemy queries from the service layer. Optional — skip it for a smaller module if the extra file isn't earning its keep.
- **Models** live in a shared `models/` folder, not per-module, since some (e.g. `appointments` referencing `users`) cross module boundaries and per-module placement risks circular imports.

**Wiring and Specs:** `main.py` simply mounts each controller via `app.include_router(auth.controller, prefix="/auth")`. The OpenAPI spec is auto-generated by FastAPI combining the `dto.py` models and endpoints, augmented by custom documentation metadata defined in `spec.py`. Tests live in a mirrored `tests/test_<module>.py` structure, completely separated from the feature modules themselves.

---

## 14. Frontend Pages & Components

**Pages**

| Route | Purpose | Access |
| --- | --- | --- |
| `/` | Landing/redirect — logged out → `/login`, logged in → role-based redirect (`/dashboard`, `/doctor`, or `/admin`) | Public |
| `/register` | Account creation | Public |
| `/login` | Auth | Public |
| `/forgot-password`, `/reset-password` | Password reset (FR-25) | Public |
| `/dashboard` | Student Home Dashboard — quick actions, features grid, appointment booking shortcut | Student/Staff |
| `/chat` | Core conversational interface | Student/Staff |
| `/appointments` | View/book/cancel own appointments (shows assigned doctor name on confirmed appointments) | Student/Staff |
| `/reminders` | View own upcoming reminders | Student/Staff |
| `/profile` | View/edit own account details | Student/Staff |
| `/doctor` | Doctor dashboard — current shift, assigned patients, pending incoming handovers | Doctor |
| `/doctor/shifts` | Doctor's own shift schedule (upcoming + past) | Doctor |
| `/doctor/patients` | Doctor's active patient list with triage history summaries | Doctor |
| `/doctor/handovers` | Doctor's handover history (sent and received) + initiate new handover | Doctor |
| `/admin` | Dashboard home — usage stats overview (includes doctors-on-duty count) | Admin |
| `/admin/knowledge-base` | List KB entries | Admin |
| `/admin/knowledge-base/new` | Create KB entry | Admin |
| `/admin/knowledge-base/[id]/edit` | Edit KB entry | Admin |
| `/admin/triage-rules` | Manage red-flag/threshold triage rules (FR-11–13 content, moved out of code) | Admin |
| `/admin/doctors` | Doctor profile management — register users as doctors, edit specialization/availability | Admin |
| `/admin/duty-roster` | Duty shift scheduling — create/edit shifts, view coverage calendar | Admin |
| `/admin/appointments` | Manage all appointments (includes doctor assignment action on confirmed appointments) | Admin |
| `/admin/handovers` | System-wide handover audit log | Admin |
| `/admin/logs` | Interaction log viewer | Admin |
| `/admin/urgent-flags` | Active urgent-flag queue — reviewed/contacted tracking | Admin |
| `/admin/users` | User account management — implied by the report's "Administrator manages users" relationship, not covered by an existing FR; confirm scope with client (§21) | Admin |

**Components per page**

*`Universal Layout (Public Pages)`* — Used on `/`, `/login`, and `/register`. 
- `Header` — sticky, frosted-glass header with Logo and Login/Register CTA buttons. Reacts to scroll (shrinks slightly, changes opacity).
- `Footer` — standard universal footer with copyright and links.

*`Universal Layout (Authenticated Pages)`* — Used on `/chat`, `/doctor/*`, `/admin/*`.
- `DesktopSidebar` — frosted-glass navigation sidebar.
- `MobileBottomNav` — on mobile (`< 768px`), the sidebar is hidden and a floating, frosted-glass bottom navigation bar appears for thumb-friendly routing.

*`/` (Landing Page)* — fully animated using **Framer Motion**:
- `HeroSection` — striking headline, dynamic background, CTA button ("Start Chatting" → `/register`), scroll-reveal animations.
- `FeaturesGrid` — cards highlighting features (Triage, Appointments, Instant KB), fading in as the user scrolls down.

*`/dashboard` (Student Home)* — The main landing view for users:
- `GreetingCard` — "Hello, [Name]!" and notification bell.
- `QuickLaunchBanner` — Prominent CTA to "Discover Our Healthcare Chat Assistant" (links to `/chat`).
- `FeaturesGrid` — Grid of quick actions (Symptom Checker, Health Knowledge, Appointments, Reminders).
- `DoctorCarousel` — Horizontally scrolling cards of available doctors (name, photo, specialization) allowing quick appointment booking.

*`/login`* — login form (email, password), error banner for invalid credentials, link to `/register`, "Forgot password?" link to `/forgot-password`.

*`/forgot-password`, `/reset-password`* — email-entry form, then a new-password form reached via the emailed reset link (`?token=...`); implements FR-25.

*`/chat`* — the core screen:

- `MessageList` — scrollable, auto-scrolls to newest, visually distinguishes user vs. bot bubbles
- `MessageBubble` — renders plain text, a quick-reply button group, or a source-citation footer ("— WHO") on education replies
- `TypingIndicator` — shown while awaiting `/chat/message`
- `MessageInput` — text field + send button; disabled when a quick-reply flow expects a button tap instead
- `QuickReplyGroup` — triage checklist options, fever-duration buttons, or the "education / triage / booking" fallback menu
- `FallbackPrompt` — shown on low-confidence classification
- `SessionHeader` — logged-in user, "new conversation" reset

*`/appointments`* — `AppointmentList` (date, status badge, assigned doctor name + specialization on confirmed appointments, cancel action), `EmptyState` with a CTA into chat, `StatusBadge` (color-coded per status), `CancelConfirmModal`.

*`/reminders`* — `ReminderList` (upcoming reminders + linked appointment + scheduled time), `EmptyState`.

*`/profile`* — read-only account details + edit form for name/password change.

*`/doctor`* — the doctor's home screen:

- `CurrentShiftCard` — today's shift times, status badge, time remaining
- `AssignedPatientsList` — active patient assignments with patient name, appointment date, triage outcome (if any), quick-link to triage details
- `PendingHandoversAlert` — incoming handovers awaiting acknowledgement, with an "Accept" action
- `ShiftEndWarning` — shown when shift is ending. If manual handover isn't done, patients will be auto-assigned to the next on-duty doctor at shift end.

*`/doctor/shifts`* — `ShiftCalendar` or `ShiftList` (date, time range, status badge), toggle between upcoming/past.

*`/doctor/patients`* — `PatientDetailCard` (patient name, appointment info, triage history summary including fever duration, red flags checked, outcome), `HandoverButton` → opens `HandoverForm`.

*`/doctor/handovers`* — `HandoverHistoryTable` (date, patient, from/to doctor, reason, status — pending/acknowledged), `InitiateHandoverButton` → `HandoverForm` (select patient assignment, select receiving doctor from on-duty list, reason dropdown, notes textarea).

*`/admin`* — `StatCard` ×5-6 (queries/day, top intents, pending appointments, today's urgent-flag count, doctors currently on duty, pending handovers), optional `SimpleChart` for usage over time.

*`/admin/knowledge-base`* — `KBTable` (disease, category, source, updated_at, edit/delete), `FilterBar` (by disease/category), "New entry" button.

*`/admin/knowledge-base/new`, `/[id]/edit`* — `KBForm` (disease dropdown, category dropdown, content textarea, source dropdown, source_url field), save/cancel.

*`/admin/triage-rules`* — `TriageRuleTable` (condition_type, label, value, outcome, active toggle, updated_at), `TriageRuleForm` for add/edit. Same editable-without-redeploy pattern as the knowledge base — lets red-flag symptoms and fever-duration thresholds be corrected by an admin, not just in code.

*`/admin/doctors`* — `DoctorTable` (name, specialization, availability toggle, created_at), `RegisterDoctorButton` → `DoctorForm` (select existing user, specialization input), `EditDoctorModal`.

*`/admin/duty-roster`* — `DutyCalendar` (week/month view showing shifts per doctor with color-coding by status), `CreateShiftButton` → `ShiftForm` (doctor dropdown, date picker, start/end time pickers), shift status management (mark on-duty/completed/absent). Shows coverage gaps visually.

*`/admin/appointments`* — `AdminAppointmentTable` (all users, filter by status, confirm/cancel actions, **"Assign Doctor" action** on confirmed appointments → `AssignDoctorModal` with on-duty doctor dropdown or auto-assign button).

*`/admin/handovers`* — `HandoverAuditTable` (all handovers system-wide: date, patient, from/to doctor, reason, notes, acknowledged status), filterable by doctor/date/reason. For operational oversight per FR-37.

*`/admin/logs`* — `LogTable` (user, intent, timestamp, urgent-flag column), `UrgentFilterToggle` (explicitly required by FR-22), pagination.

*`/admin/urgent-flags`* — `UrgentFlagQueue` (one row per urgent `symptom_check`: user, timestamp, fever duration, red flags, notified-at, reviewed/contacted status), `MarkReviewedButton`, `MarkContactedButton`, filter by reviewed/unreviewed. This is the active-escalation surface (FR-23/24) — distinct from `/admin/logs`, which stays a general-purpose, passive audit view.

**Shared/dumb components:** `Button`, `Input`, `Select`, `Modal`, `Toast`, `Badge`, `LoadingSpinner`, `ProtectedRoute` wrapper, `DoctorRoute` wrapper, `AdminRoute` wrapper.

**Cross-cutting requirements:** loading/error/empty states on every list view; frontend form validation matching backend validation; toast/notification system for action feedback; keyboard nav + labels + contrast per the NFR's WCAG requirement (§6).

**Folder structure**, mirroring the backend's feature-first modularity (§13) rather than a flat `components/`/`pages/` split:

```
app/
  (auth)/login/, (auth)/register/
  chat/
  appointments/
  doctor/
    shifts/
    patients/
    handovers/
  admin/
    knowledge-base/
    doctors/
    duty-roster/
    appointments/
    handovers/
    logs/
features/
  auth/        ← hooks, api calls, types
  chat/
  appointments/
  doctor/      ← hooks, api calls, types for doctor dashboard/shifts/patients/handovers
  admin/
components/    ← shared/dumb UI only (Button, Input, Modal)
lib/
  api-client.ts
  auth.ts
```

---

## 15. User Flows

**1. Registration → first chat** Register → login → land on `/dashboard` → User clicks "Start Chat" → lands on `/chat` → the FR-7 fallback menu doubles as a natural first message, telling the user what the bot can help with.

**2. Health education flow** User types free text ("what causes malaria?") → classifier returns `education_malaria_causes` → KB lookup → bubble renders content + source citation → optional quick-reply offering a related follow-up ("want prevention tips too?").

**3. Symptom triage flow** User signals a symptom concern → classifier returns `symptom_check_start` → `QuickReplyGroup` (fever duration) → `QuickReplyGroup` (red-flag checklist) → deterministic decision table (§10) runs server-side → outcome bubble (urgent/book/self-care) + disclaimer, always → a "book" outcome offers a quick-reply CTA into flow 4.

**4. Appointment booking flow** Via chat (`book_appointment` intent) or directly on `/appointments` → date picker component (not free text — avoids ambiguous date parsing) → confirm → `POST /appointments` → success toast → appears as `pending` in the list → admin confirms and assigns a doctor (or system auto-assigns) → reminder auto-created on confirmation (backend, surfaces in `/reminders`) → user sees assigned doctor name on their `/appointments` page.

**5. Cancellation flow** `/appointments` → `CancelConfirmModal` → `PATCH /appointments/{id}` → status updates → associated `patient_assignment` is also set to `completed`. Whether the associated pending reminder should also cancel automatically isn't defined in the FRs — confirm with client (§21).

**6. Admin KB maintenance flow** `/admin/knowledge-base` → new/edit → `KBForm` → save → `updated_by`/`updated_at` set server-side → list refreshes.

**7. Urgent escalation flow** Triage outcome = urgent (flow 3) → backend immediately sends a notification email to the configured Medical Centre staff address (`notified_at` set) → the flagged `symptom_check` appears in `/admin/urgent-flags` → an admin marks it `contacted` once someone has followed up with the student, and `reviewed` once resolved. `/admin/logs` remains available separately for general-purpose, after-the-fact pattern review across all interactions (not just urgent ones).

**8. Doctor shift flow** Admin creates shifts on `/admin/duty-roster` → doctor sees upcoming shifts on `/doctor/shifts` → when shift starts, admin (or system) marks status `on_duty` → doctor sees active patients on `/doctor` dashboard → at shift end (or if doctor is `absent`), system automatically initiates a handover of all their active patients to the next on-duty doctor → shift marked `completed`.

**9. Patient handover flow** (Manual) Doctor on `/doctor/patients` → selects a patient → `HandoverButton` → `HandoverForm` (select receiving doctor from on-duty list, reason, notes) → `POST /doctor/handovers` → receiving doctor sees `PendingHandoversAlert` on their `/doctor` dashboard → clicks "Accept" → `PATCH /doctor/handovers/{id}/acknowledge` → patient assignment transfers to receiving doctor. Full record visible on `/admin/handovers`.

---

## 16. Tech Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Backend | **Python + FastAPI** | Matches the report's defended methodology; async support, auto OpenAPI docs (useful for a client/viva demo) |
| Database | **PostgreSQL** | Deviation from the report's MySQL — client-approved stack change; see §21 for notification |
| ORM | SQLAlchemy + Alembic | Migrations for schema evolution |
| NLP | **scikit-learn** (TF-IDF + logistic regression/SVM) | See §7 |
| Auth | JWT (python-jose) + bcrypt (passlib) on the backend | Standard, stateless, framework-agnostic on the frontend side |
| Frontend | **Next.js/React** | Deviation from the report's HTML/CSS/JS line — low-risk since that's a technology-review mention, not part of the defended methodology (§21) |
| Scheduler | APScheduler | Simplest option for reminder jobs at this scale |
| Model persistence | joblib (scikit-learn artifacts checked into the repo) | A fresh clone runs without a training step |
| Dev orchestration | `concurrently` (root npm script) + Docker Compose for PostgreSQL only | One command starts DB, backend and frontend (§20) |
| Local email | Console logging / MailHog | Demo needs no SMTP account or internet |
| Email | SMTP via SendGrid/Mailgun (production); console/MailHog (demo) | Reminders, urgent-flag alerts, password reset |
| Hosting | Demo: localhost (§20). If ever deployed: single VPS behind nginx, or split (Vercel + Railway/Render) | See §9 |

---

## 17. Risks & Mitigations

| Risk | Mitigation |
| --- | --- |
| Local/Pidgin phrasing misclassified | Curate training/paraphrase data specifically for Nigerian English phrasings of fever/malaria/typhoid symptoms |
| Classifier accuracy degrades as intents grow | Keep an eval script (held-out labeled set) run on every retrain; track per-intent precision/recall |
| "Reminder channel" undefined in source spec | Confirm with client before building — assumed email |
| KB content goes stale (WHO/NCDC guidance updates) | Admin CRUD + `updated_at`/`updated_by` fields; periodic review reminder for admins |
| Urgent flag goes unactioned (sits in a log nobody checks) | FR-23/24: immediate staff email notification + `reviewed`/`contacted` tracking on `/admin/urgent-flags` — makes escalation active, not passive |
| Sensitive triage data over-retained | Log structured outcomes, not raw free text; define a retention/deletion policy |
| Frontend/database deviation from report questioned in viva | One-line disclosure to supervisor: HTML/CSS/JS and MySQL were the report's stated choices; Next.js/PostgreSQL don't change the defended methodology (OOADM, class design, NLP approach) — client has already approved the change |
| Triage/KB content is illustrative (report specifies none) | Stored in editable tables (`triage_rules`, `knowledge_base`); demo disclosure line prepared (Appendix A); real clinical sign-off only needed for production |
| Classifier misroutes an unseen phrasing during the demo | "Did you mean…?" mid-confidence tier + fallback menu; training data densest around the demo script (Appendix B, C) |
| Two-process deployment complexity | Single VPS + nginx keeps this to one server; documented in §9 |
| Doctor duty/handover features not in source report | Flagged as a client-requested addition in Appendix A; does not contradict the report (extends it), but must be disclosed. Same strategy as password reset / triage rules — honest gap-fill. |
| Handover left unacknowledged (receiving doctor ignores it) | Both doctors see the patient until acknowledged; admin `/admin/handovers` shows pending handovers; an APScheduler job can email the receiving doctor a reminder after N minutes if unacknowledged |
| Shift gaps leave no on-duty doctor for assignment | `/admin/duty-roster` should visually highlight coverage gaps; auto-assignment fails gracefully with a clear message when no doctor is on duty; admin can still manually assign any doctor |
| Patient sees doctor name before doctor is actually available | Doctor name only shown on confirmed + assigned appointments — never on pending ones |

---

## 18. Build Plan (phased)

1. **Foundation** — repo skeleton (`/backend`, `/frontend`, root scripts, `docker-compose.yml` for PostgreSQL), FastAPI structure, PostgreSQL schema + Alembic migrations for all 14 tables (§11), `core/` (config, security, db), JWT auth with 4 roles (student/staff/doctor/admin), password reset (FR-25), `notifications` email service (console/mail-catcher in dev), seed script (admin + demo doctor + demo student accounts), README with the one-command startup.
2. **NLP + education module** — author KB content from WHO/NCDC sources, phrasing variants generated with an LLM offline and human-verified (§8), build `intents.csv` (Appendix B), `nlp/train.py` + evaluation script, `nlp/classifier.py`, `chat` module (orchestrator, sessions, history), KB lookup + admin KB CRUD, Next.js chat UI wired to `/chat/message`.
3. **Symptom triage** — `triage_rules` table + admin CRUD (FR-26), `symptom_check` service reading the rules, multi-turn flow via `chat_sessions`, `symptom_checks` table, urgent-flag logging, immediate staff-notification email (FR-23).
4. **Appointments + reminders** — booking and cancel flows (chat and `/appointments`), status management, reminder creation on confirmation, APScheduler job, reminder emails.
5. **Doctor duty & handover** — `doctors` module (admin CRUD for profiles, FR-27), `duty_shifts` management (admin CRUD, FR-28–29), `patient_assignments` (doctor assignment on appointment confirmation, auto-assign logic, FR-30–32), `patient_handovers` (initiate/acknowledge flow, shift-end warning, FR-33–37), doctor dashboard + `/doctor/*` Next.js pages.
6. **Admin dashboard** (Next.js) — appointments with doctor-assignment action, doctor profiles, duty roster calendar, handover audit log, users, logs viewer with urgent filter, `/admin/urgent-flags` reviewed/contacted queue (FR-24), triage-rules and KB pages, stats.
7. **Hardening & eval** — rate limiting, input validation pass, classifier accuracy eval on a held-out phrasing set and confidence-threshold tuning, security review, accessibility pass, "Did you mean…?" tier, response variants/typing polish.
8. **Demo readiness** — run the conformance walkthrough (Appendix A) and the demo script (Appendix C) on a clean machine using only the README; freeze seed data.
9. **Client/supervisor review** — walk through Appendix A deviations (including doctor duty/handover addition); collect answers to §21.

---

## 19. Testing Plan

- Unit tests: classifier accuracy against a labeled phrasing set (include local phrasing variants); triage decision table (every branch); reminder scheduling math; handover validation logic (can't hand over to an off-duty doctor, can't hand over a non-active assignment); auto-assignment logic (picks the on-duty doctor with fewest active assignments; fails gracefully when no doctor is on duty).
- Integration tests: chat → intent → KB/triage → response; appointment → confirmation → doctor assignment → reminder creation → send; handover initiation → notification → acknowledgement → assignment transfer; shift completion with un-handed-over patients → warning.
- Security tests: auth bypass attempts (including doctor-role endpoints accessed by student/staff), rate-limit verification, SQL injection on all inputs (use the ORM everywhere, no string-concatenated SQL).
- Conformance walkthrough: run the report's sequence diagram (Appendix A, part 1) end to end and confirm each of the 11 steps is observable in the demo, including the interaction-log entry at the end.
- Triage rules: every rule in `triage_rules` has a test case; editing a rule in the admin UI changes the next triage outcome with no redeploy.
- Duty/handover tests: create shifts → assign doctor → handover → acknowledge → verify both assignment records are correct; test overlapping-shift constraint; test shift-end warning trigger.
- UAT: a handful of real students/staff run through education, triage, booking, and doctor-assignment flows — matches the source doc's own evaluation intent (Chapter 4, referenced but not included in the uploaded draft).

---

## 20. Local Development & Demo Run

**Goal:** the client (or examiner) runs the whole system on their own machine with one command.

**Repo layout (single repo):**

```
/repo
  /backend            → FastAPI app (+ nlp/ classifier package, artifacts checked in)
  /frontend           → Next.js app
  docker-compose.yml  → PostgreSQL only (named volume so data persists)
  package.json        → root scripts (below)
  README.md           → prerequisites, the one command, what is running
```

**One command:** root `package.json` uses `concurrently` so `npm run dev` starts PostgreSQL (`predev` → `docker-compose up -d db`), the FastAPI backend (`uvicorn`, :8000) and the Next.js frontend (:3000) together, with colour-coded output per process.

**First-run setup (documented in README, done once):** create the Python venv and `pip install -r requirements.txt`; `npm install` at root and in `/frontend`; run migrations (`alembic upgrade head`); run the seed script (KB content, triage rules, an admin account, a demo student account); the trained classifier artifacts are already in the repo, and `python -m nlp.train` retrains them after editing `intents.csv`.

**Database location:** PostgreSQL is a separate running process — in the demo it runs in a Docker container on the presenting machine, with a named volume holding the data on disk. The code holds only the connection string (`DATABASE_URL`). If Docker is unavailable, a native PostgreSQL install works identically.

**Offline behaviour:** classifier, KB lookup, triage, booking and logging all run with no internet. The only outbound calls are emails (reminders, urgent alerts, password reset); on localhost these are logged to the console / a local mail catcher (e.g. MailHog) so the demo needs no SMTP account or connectivity.

**Demo aids:** seeded demo accounts (student, staff, admin), pre-seeded KB and triage rules, and a documented demo script (Appendix C) so the walkthrough follows the report's sequence diagram exactly.

---

## 21. Open Questions for the Client

1. Reminder delivery channel — email, SMS, in-app only, or a combination?
2. Does appointment booking need time-slot granularity, or is a date sufficient (as the source schema implies)?
3. Confirming: is using Next.js/React for the frontend (vs. the report's HTML/CSS/JS line) acceptable, given it doesn't touch the report's defended methodology? Flagged as low-risk but worth their explicit sign-off.
4. Who owns sign-off on the medical content and triage decision table — the project supervisor, a UNN Medical Centre clinician, or both?
5. Confirming: is PostgreSQL (vs. the report's stated MySQL) acceptable? Unlike the frontend, this does sit inside the report's stated technology choice — worth explicit sign-off, not just a heads-up.
6. Which staff email address should receive urgent-flag notifications (FR-23), and is there an expected response window, or is "reviewed/contacted" tracking (FR-24) sufficient without a formal SLA?
7. Does cancelling an appointment need to also auto-cancel its associated pending reminder?
8. Scope of `/admin/users` (user account management) — implied by the report's class-diagram relationships but not covered by an existing functional requirement.
9. Is the optional LLM enhancement layer (§8) worth pursuing at all, given its ongoing cost and added risk surface — or should the system stay a pure local classifier indefinitely?
10. Appointment status: the report lists Pending/Confirmed/Cancelled; the design adds Completed and No-show for reporting. Acceptable, or restrict to the report's three?
11. Interaction log: the report's single `action` field is kept, with `intent`, `structured_payload` and `urgent_flag` added alongside it. Acceptable?
12. Confirm the demo is delivered on localhost/simulation only (no hosted deployment required).

---

## Appendix A — Report Conformance Matrix

**Part 1 — Sequence diagram (report §3.3.2) → implementation.** These are the report's own steps; the demo must show each one.

| # | Report step | Where it happens in this design |
| --- | --- | --- |
| 1 | User logs in | `auth` module, JWT session |
| 2 | User sends a health-related query via chat | Next.js `/chat` → `POST /chat/message` |
| 3 | Chatbot forwards message to Intent Recognizer | `chat/service.py` → `nlp/classifier.py` |
| 4 | Intent Recognizer classifies the intent | scikit-learn TF-IDF + linear classifier → `(intent, confidence)` |
| 5 | Education intent → Knowledge Base queried | `knowledge_base` lookup by `(disease, category)` |
| 6 | Symptom-guidance intent → Symptom Checker evaluates urgency | `symptom_check` service reading `triage_rules` |
| 7 | Appointment intent → Appointment module creates record | `appointments` service |
| 8 | Reminder module schedules reminder linked to the appointment | `reminders` service + APScheduler job |
| 9 | Chatbot composes response from the handling module | `chat/service.py` |
| 10 | Response delivered to user | JSON reply rendered in the chat UI |
| 11 | Interaction Log records the exchange | `interaction_logs` write on every message |

**Part 2 — Class diagram (report §3.3.1) → modules.** Report relationships preserved: one User → many Appointments; one Appointment → many Reminders; Administrator manages the Knowledge Base and monitors the Interaction Log.

| Report class | Implemented as |
| --- | --- |
| User | `users` module, role `student`/`staff`/`doctor` |
| Administrator | `users` with role `admin`; `/admin/*` API and pages |
| Chatbot | `chat` module (orchestrator) |
| Intent Recognizer | `nlp/` package (classifier + training script) |
| Knowledge Base | `knowledge_base` module + table |
| Symptom Checker | `symptom_check` module + `symptom_checks` table |
| Appointment | `appointments` module + table |
| Reminder | `reminders` module + table |
| Interaction Log | `interaction_logs` module + table |
| *(not in report)* Doctor | `doctors` module + `doctors` table (extends User with clinical profile) |
| *(not in report)* Duty Shift | `doctors` module + `duty_shifts` table |
| *(not in report)* Patient Assignment | `doctor_dashboard` module + `patient_assignments` table |
| *(not in report)* Patient Handover | `doctor_dashboard` module + `patient_handovers` table |

**Part 3 — Deviations and additions, complete list.**

| Item | Report | This design | Type |
| --- | --- | --- | --- |
| Frontend | HTML/CSS/JS | Next.js/React | Stack deviation (technology-review line, not the defended methodology) |
| Database engine | MySQL | PostgreSQL | Stack deviation (client-approved; sign-off requested, §21 Q5) |
| Password storage | "Encrypted" | Hashed (bcrypt) | Correction |
| NLP framework | "an NLP framework" (unnamed) | scikit-learn | Gap filled — not a deviation |
| Appointment status | Pending / Confirmed / Cancelled | + Completed, No-show | Field-level extension |
| Interaction log | `action` only | `action` kept + `intent`, `structured_payload`, `urgent_flag` | Field-level extension |
| Symptom Checker persistence | Class only, no table | `symptom_checks` table | Gap filled |
| Urgent handling | User advised to visit Centre; flagged | + immediate staff email, reviewed/contacted tracking | Addition |
| Password reset | Not mentioned | Emailed single-use link | Addition |
| Editable triage rules | Not mentioned | `triage_rules` table + admin CRUD | Addition |
| Chat history / multi-turn state | Not mentioned | `chat_sessions`, `chat_messages` | Addition |
| Reminder channel | "Reminder" (channel unnamed) | Email | Assumption |
| Doctor role | Not mentioned | `doctor` user role + `doctors` profile table | Addition (client-requested; extends user model) |
| Duty scheduling | Not mentioned | `duty_shifts` table + admin roster management | Addition (client-requested) |
| Patient-doctor assignment | Not mentioned (flat appointment table) | `patient_assignments` linking appointments to doctors | Addition (client-requested; extends appointment model) |
| Patient handover | Not mentioned | `patient_handovers` audit trail + initiate/acknowledge flow | Addition (client-requested) |

**Content the report does not specify (filled by the design; illustrative for demo):** the intent list, the classifier confidence threshold, the red-flag symptoms and fever-duration thresholds, and reminder lead time. Honest one-liner if asked: *"The report defines the procedure and classes; it doesn't define the clinical criteria, so we implemented them as editable, clearly-labelled illustrative rules."*

---

## Appendix B — Intent Taxonomy & Classifier Training Plan

| Intent | Handler | Notes |
| --- | --- | --- |
| `greeting` | canned reply + capability menu |  |
| `education_malaria_symptoms` / `_causes` / `_prevention` / `_general` | KB lookup `(malaria, category)` | 4 intents |
| `education_typhoid_symptoms` / `_causes` / `_prevention` / `_general` | KB lookup `(typhoid, category)` | 4 intents |
| `symptom_check_start` | `symptom_check` flow | e.g. "I have fever", "my body is hot" |
| `book_appointment` | booking flow |  |
| `cancel_appointment` | cancel flow |  |
| `reminder_query` | list user's reminders |  |
| `fallback` | menu of what the bot can do | low confidence |

**Training data (`nlp/data/intents.csv`, columns `text,intent`):** 25–50 phrasings per intent, including Nigerian English/Pidgin and everyday wording ("hot body", "I dey feel weak", "how do I avoid mosquito bites", "what causes typhoid"). Author the phrasing variants with an LLM offline, then review by hand — no runtime LLM needed (§8).

**Confidence tiers:** high → answer; middle → "Did you mean: …?" quick-reply for the top intent; low → fallback menu. Threshold values are tuned on a held-out split and stored in config, not hardcoded. Never loosen thresholds to hide fallbacks.

**Entity extraction:** keyword rules for disease (malaria/typhoid) and category (symptoms/causes/prevention) so a message like "tell me about typhoid" or a follow-up "and prevention?" resolves against session context.

---

## Appendix C — Conversation Design & Demo Script

**Making a fixed-intent bot feel conversational (no generation needed):** 2–4 stored phrasings per KB fact, rotated; short acknowledgement lead-ins ("Good question." / "That sounds uncomfortable."); the answer wrapped in a light template that echoes the topic; a proactive follow-up quick-reply after each answer ("Want prevention tips too?"); session memory so the bot doesn't repeat itself; buttons for structured flows (triage, booking); realistic typing indicator.

**Demo script (mirrors the report's sequence diagram):**

1. Log in as the seeded student → greeting + capability menu.
2. "What causes malaria?" → KB answer with WHO/NCDC citation → follow-up chip.
3. "I have a fever" → triage: fever duration buttons → red-flag checklist → outcome + disclaimer.
4. Trigger an urgent outcome → show the staff alert email (mail catcher) → switch to admin → `/admin/urgent-flags` → mark contacted.
5. "Book an appointment" → date picker → appointment `pending` → admin confirms and assigns a doctor → student sees assigned doctor name → reminder appears under `/reminders`.
6. Switch to admin → `/admin/duty-roster` → show doctor shifts → `/admin/doctors` → show doctor profiles.
7. Switch to doctor account → `/doctor` dashboard → show current shift, assigned patient from step 5.
8. Shift ends (or admin triggers completion) → system automatically performs a handover to the next on-duty doctor.
9. Admin → `/admin/handovers` → show full handover audit trail showing the `auto_shift_end` record.
10. Admin → `/admin/logs` shows every exchange logged (report step 11); `/admin/knowledge-base` and `/admin/triage-rules` edited live and the change shows on the next chat message.
11. Off-script message → fallback/"Did you mean...?" behaviour shown deliberately.

---

## Appendix D — Deferred / Post-Demo

- Optional LLM rewording/disambiguation layer (§8) — only if the client wants it and accepts cost/eval burden.
- Igbo-language support.
- SMS reminders; real SMTP provider configuration.
- Clinical validation of triage rules and KB content by a qualified reviewer before any real-world use.
- Admin-triggered classifier retraining from the UI (currently a script).
- Advanced shift scheduling: recurring shift templates, self-service shift swaps between doctors, automatic shift-start/end status transitions via a scheduled job.
- Handover escalation: auto-notify admin if a handover remains unacknowledged after a configurable timeout.
- Doctor specialization-based routing: auto-assign patients to doctors whose specialization matches the triage outcome category.