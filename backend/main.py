from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

app = FastAPI(title=settings.PROJECT_NAME)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.modules.auth.controller import router as auth_router
app.include_router(auth_router, prefix='/auth', tags=['Auth'])
from app.modules.users.controller import router as users_router
app.include_router(users_router, prefix='/users', tags=['Users'])
from app.modules.chat.controller import router as chat_router
app.include_router(chat_router, prefix='/chat', tags=['Chat'])
from app.modules.knowledge_base.controller import router as knowledge_base_router
app.include_router(knowledge_base_router, prefix='/knowledge-base', tags=['Knowledge Base'])
from app.modules.symptom_check.controller import router as symptom_check_router
app.include_router(symptom_check_router, prefix='/symptom-check', tags=['Symptom Check'])
from app.modules.triage_rules.controller import router as triage_rules_router
app.include_router(triage_rules_router, prefix='/triage-rules', tags=['Triage Rules'])
from app.modules.appointments.controller import router as appointments_router
app.include_router(appointments_router, prefix='/appointments', tags=['Appointments'])
from app.modules.doctors.controller import router as doctors_router
app.include_router(doctors_router, prefix='/doctors', tags=['Doctors'])
from app.modules.doctor_dashboard.controller import router as doctor_dashboard_router
app.include_router(doctor_dashboard_router, prefix='/doctor-dashboard', tags=['Doctor Dashboard'])
from app.modules.reminders.controller import router as reminders_router
app.include_router(reminders_router, prefix='/reminders', tags=['Reminders'])
from app.modules.interaction_logs.controller import router as interaction_logs_router
app.include_router(interaction_logs_router, prefix='/interaction-logs', tags=['Interaction Logs'])

@app.get("/")
def read_root():
    return {"message": f"Welcome to the {settings.PROJECT_NAME} API"}
