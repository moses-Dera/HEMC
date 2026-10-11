from contextlib import asynccontextmanager
from fastapi import FastAPI
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.db import SessionLocal
from app.core.email import send_email
from app.modules.appointments.model import Appointment
from app.modules.users.model import User
from app.modules.auth.controller import router as auth_router
from app.modules.users.controller import router as users_router
from app.modules.chat.controller import router as chat_router
from app.modules.appointments.controller import router as appointments_router
from app.modules.doctors.controller import router as doctors_router
from app.modules.notifications.controller import router as notifications_router
from app.modules.knowledge_base.controller import router as kb_router
from app.modules.doctor_dashboard.controller import router as doctor_dashboard_router
from app.modules.interaction_logs.controller import router as interaction_logs_router
from app.modules.reminders.controller import router as reminders_router
from app.modules.symptom_check.controller import router as symptom_check_router
from app.modules.triage_rules.controller import router as triage_rules_router

scheduler = BackgroundScheduler()

def run_reminders():
    print("Running scheduled appointment reminders...")
    db = SessionLocal()
    try:
        now = datetime.utcnow()
        tomorrow = now + timedelta(days=1)
        # Find appointments in the next 24 hours that are confirmed
        upcoming = db.query(Appointment).filter(
            Appointment.status == "confirmed",
            Appointment.appointment_date >= now,
            Appointment.appointment_date <= tomorrow
        ).all()

        for apt in upcoming:
            user = db.query(User).filter(User.id == apt.user_id).first()
            if user and user.email:
                subject = "HEMC: Upcoming Medical Centre Appointment"
                body = f"Hello {user.name},\n\nThis is a reminder for your confirmed appointment at the UNN Medical Centre on {apt.appointment_date.strftime('%Y-%m-%d %H:%M')}.\n\nPlease arrive 10 minutes early.\n\nBest,\nHEMC Team"
                send_email(subject, user.email, body)
    except Exception as e:
        print(f"Error in run_reminders: {e}")
    finally:
        db.close()

@asynccontextmanager
async def lifespan(app: FastAPI):
    scheduler.add_job(
        run_reminders,
        trigger=IntervalTrigger(minutes=60),
        id="appointment_reminders",
        name="Send appointment reminders every hour",
        replace_existing=True,
    )
    scheduler.start()
    print("APScheduler started.")
    yield
    scheduler.shutdown()
    print("APScheduler shutdown.")

app = FastAPI(
    title="HEMC API",
    description="Health Education and Management Chatbot API",
    version="1.0.0",
    lifespan=lifespan
)

cors_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
if settings.CORS_ORIGINS:
    for o in settings.CORS_ORIGINS.split(","):
        cleaned = o.strip()
        if cleaned and cleaned not in cors_origins:
            cors_origins.append(cleaned)

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/v1/users", tags=["users"])
app.include_router(chat_router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(appointments_router, prefix="/api/v1/appointments", tags=["appointments"])
app.include_router(doctors_router, prefix="/api/v1/doctors", tags=["doctors"])
app.include_router(notifications_router, prefix="/api/v1/notifications", tags=["notifications"])
app.include_router(kb_router, prefix="/api/v1/knowledge-base", tags=["knowledge_base"])
app.include_router(doctor_dashboard_router, prefix="/api/v1/doctor-dashboard", tags=["doctor_dashboard"])
app.include_router(interaction_logs_router, prefix="/api/v1/interaction-logs", tags=["interaction_logs"])
app.include_router(reminders_router, prefix="/api/v1/reminders", tags=["reminders"])
app.include_router(symptom_check_router, prefix="/api/v1/symptom-check", tags=["symptom_check"])
app.include_router(triage_rules_router, prefix="/api/v1/triage-rules", tags=["triage_rules"])

import traceback
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"Unhandled error on {request.url}: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"error": "Internal Server Error", "detail": str(exc)}
    )

@app.get("/")
def root():
    return {"message": "Welcome to HEMC API"}

@app.get("/health")
def health():
    return {"status": "ok", "version": "1.0.1"}
