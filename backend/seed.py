import sys
import os

# Ensure the backend directory is in the path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.db import SessionLocal
from app.modules.users.model import User
from app.modules.doctors.models.doctor import Doctor
from app.modules.knowledge_base.model import KnowledgeBase
from app.modules.triage_rules.model import TriageRule
from app.modules.notifications.model import Notification
from app.core.security import get_password_hash

def seed_db():
    db = SessionLocal()
    try:
        print("Seeding database...")

        # --- 1. USERS ---
        users_data = [
            {"email": "test@unn.edu.ng", "name": "Test User", "role": "student", "reg_number": None, "department": None, "level": None},
            {"email": "okonkwomoses158@gmail.com", "name": "Moses Okonkwo", "role": "student", "reg_number": "2020/24810000", "department": "Computer Science", "level": "400"},
            {"email": "chika.nwosu@unn.edu.ng", "name": "Dr. Chikaodinaka Nwosu", "role": "doctor", "reg_number": None, "department": "University Medical Centre", "level": None},
            {"email": "emeka.ogbuefi@unn.edu.ng", "name": "Dr. Emeka Ogbuefi", "role": "doctor", "reg_number": None, "department": "University Medical Centre", "level": None},
            {"email": "nneka.ibe@unn.edu.ng", "name": "Dr. Nneka Ibe", "role": "doctor", "reg_number": None, "department": "University Medical Centre", "level": None},
        ]
        
        for u in users_data:
            existing_user = db.query(User).filter(User.email == u["email"]).first()
            if not existing_user:
                new_user = User(
                    email=u["email"],
                    name=u["name"],
                    hashed_password=get_password_hash("password123"), # default password
                    role=u["role"],
                    reg_number=u["reg_number"],
                    department=u["department"],
                    level=u["level"]
                )
                db.add(new_user)
        db.commit()

        # --- 2. DOCTORS ---
        doctors_data = [
            {"email": "chika.nwosu@unn.edu.ng", "specialization": "General Medicine & Tropical Health", "is_available": True},
            {"email": "emeka.ogbuefi@unn.edu.ng", "specialization": "Internal Medicine & Infectious Diseases", "is_available": True},
            {"email": "nneka.ibe@unn.edu.ng", "specialization": "Community Health & Emergency Care", "is_available": True},
        ]

        for d in doctors_data:
            user = db.query(User).filter(User.email == d["email"]).first()
            if user:
                existing_doc = db.query(Doctor).filter(Doctor.user_id == user.id).first()
                if not existing_doc:
                    new_doc = Doctor(
                        user_id=user.id,
                        specialization=d["specialization"],
                        is_available=d["is_available"]
                    )
                    db.add(new_doc)
        db.commit()

        # --- 3. KNOWLEDGE BASE ---
        kb_data = [
            {"disease": "malaria", "category": "symptom", "content": "According to the World Health Organization (WHO), symptoms of uncomplicated malaria typically begin 10–15 days after an infective mosquito bite. Common symptoms include: fever, chills and shivering, headache, extreme fatigue, nausea, vomiting, muscle pain, and sweating. If left untreated, malaria can progress to severe illness within 24 hours.", "source": "WHO", "source_url": None},
            {"disease": "malaria", "category": "cause", "content": "WHO guidelines state that malaria is caused by Plasmodium parasites (predominantly Plasmodium falciparum in Nigeria and sub-Saharan Africa). The parasites are transmitted to humans through the bites of infected female Anopheles mosquitoes, which bite predominantly between dusk and dawn.", "source": "WHO", "source_url": None},
            {"disease": "malaria", "category": "prevention", "content": "The Nigeria Centre for Disease Control (NCDC) recommends several key prevention measures against malaria: 1) Sleep inside long-lasting insecticide-treated mosquito nets (LLINs) every night. 2) Eliminate stagnant water around hostels and residences to prevent mosquito breeding. 3) Apply insect repellent on exposed skin. 4) Install window and door screens. 5) Promptly test and treat fever with Artemisinin-based Combination Therapy (ACT).", "source": "NCDC", "source_url": None},
            {"disease": "malaria", "category": "general", "content": "Malaria is a life-threatening disease that is both preventable and curable. In endemic zones like Nigeria, timely testing using Rapid Diagnostic Tests (RDT) or microscopy at the UNN Medical Centre ensures rapid recovery and prevents severe complications.", "source": "WHO", "source_url": None},
            {"disease": "typhoid", "category": "symptom", "content": "According to the WHO, common symptoms of typhoid fever include: prolonged high fever (often rising daily to 39°–40°C), severe headache, generalized weakness, fatigue, abdominal pain, constipation or diarrhea, and in some cases a rash with flat rose-colored spots. Without prompt treatment, complications like intestinal bleeding may develop.", "source": "WHO", "source_url": None},
            {"disease": "typhoid", "category": "cause", "content": "WHO states that typhoid fever is caused by the bacterium Salmonella enterica serotype Typhi. It is spread through the fecal-oral route, usually by consuming food or water contaminated with feces or urine from an infected person or chronic carrier.", "source": "WHO", "source_url": None},
            {"disease": "typhoid", "category": "prevention", "content": "NCDC guidelines for preventing typhoid fever include: 1) Drink only safe, treated, or boiled water. 2) Practice strict hand hygiene with soap and running water before eating and after using the restroom. 3) Avoid raw or undercooked foods and ensure street food is steaming hot. 4) Wash fruits and vegetables thoroughly with clean water. 5) Get vaccinated with the Typhoid Conjugate Vaccine (TCV).", "source": "NCDC", "source_url": None},
            {"disease": "typhoid", "category": "general", "content": "Typhoid fever is common in regions with limited access to clean water and sanitation. Accurate diagnosis requires clinical evaluation and blood or stool culture at the UNN Medical Centre. It must be treated with appropriate antibiotics prescribed by a physician.", "source": "NCDC", "source_url": None},
        ]

        if db.query(KnowledgeBase).count() == 0:
            for kb in kb_data:
                db.add(KnowledgeBase(**kb))
            db.commit()

        # --- 4. TRIAGE RULES ---
        triage_data = [
            {"condition_type": "red_flag", "label": "Persistent Vomiting", "value": "persistent_vomiting", "outcome": "urgent", "active": True},
            {"condition_type": "red_flag", "label": "Severe Dehydration", "value": "severe_dehydration", "outcome": "urgent", "active": True},
            {"condition_type": "red_flag", "label": "Confusion / Altered Mental State", "value": "confusion", "outcome": "urgent", "active": True},
            {"condition_type": "red_flag", "label": "Difficulty Breathing", "value": "difficulty_breathing", "outcome": "urgent", "active": True},
            {"condition_type": "red_flag", "label": "Convulsions / Seizure", "value": "convulsions", "outcome": "urgent", "active": True},
            {"condition_type": "duration_threshold", "label": "High Unremitting Fever > 3 Days", "value": "fever_gt_3_days", "outcome": "urgent", "active": True},
            {"condition_type": "duration_threshold", "label": "Mild to Moderate Fever 1-2 Days", "value": "fever_1_2_days", "outcome": "book", "active": True},
            {"condition_type": "duration_threshold", "label": "Slight Body Aches / Rest Needed", "value": "mild_body_aches", "outcome": "self_care", "active": True},
        ]

        if db.query(TriageRule).count() == 0:
            for tr in triage_data:
                db.add(TriageRule(**tr))
            db.commit()

        # --- 5. NOTIFICATIONS ---
        if db.query(Notification).count() == 0:
            for u in db.query(User).all():
                # Welcome alert
                db.add(Notification(
                    user_id=u.id,
                    title="Welcome to HEMC Health Portal! 🎉",
                    message="Welcome to the UNN Health Education & Management Portal. Your profile has been initialized.",
                    link="/dashboard",
                    is_read=False
                ))
                # Health Advisory
                db.add(Notification(
                    user_id=u.id,
                    title="Health Advisory: Malaria Prevention 🦟",
                    message="UNN Medical Centre advises all hostel residents to use treated mosquito nets and maintain clean water containers.",
                    link="/chat",
                    is_read=False
                ))
                if u.role == "doctor":
                    db.add(Notification(
                        user_id=u.id,
                        title="Duty Shift Notice 🩺",
                        message="Your clinical duty rotation schedule for the Medical Centre is active.",
                        link="/doctor/dashboard",
                        is_read=False
                    ))
            db.commit()

        # --- 6. SAMPLE URGENT CASES ---
        from app.modules.symptom_check.model import SymptomCheck, OutcomeEnum, CheckStatusEnum
        if db.query(SymptomCheck).count() == 0:
            student = db.query(User).filter(User.role == "student").first()
            if student:
                from datetime import datetime, timezone, timedelta
                db.add(SymptomCheck(
                    user_id=student.id,
                    status=CheckStatusEnum.completed,
                    fever_duration="4 days (> 3 days prolonged)",
                    red_flags=["Persistent Vomiting", "Severe Dehydration"],
                    outcome=OutcomeEnum.urgent,
                    reviewed=False,
                    contacted=False,
                    timestamp=datetime.now(timezone.utc) - timedelta(minutes=35)
                ))
                db.commit()

        # --- 7. DUTY SHIFTS & PATIENT ASSIGNMENTS FOR DOCTORS ---
        from app.modules.doctors.models.duty_shift import DutyShift, ShiftStatusEnum
        from app.modules.doctor_dashboard.models.patient_assignment import PatientAssignment, AssignmentStatusEnum
        from app.modules.appointments.model import Appointment, AppointmentStatusEnum
        from datetime import date, time

        docs = db.query(Doctor).all()
        if len(docs) >= 3:
            # Current shifts
            shifts_to_add = [
                {"doctor_id": docs[1].doctor_id, "shift_date": date(2026, 10, 25), "start_time": time(14, 0), "end_time": time(20, 0), "status": ShiftStatusEnum.scheduled},
                {"doctor_id": docs[0].doctor_id, "shift_date": date(2026, 10, 26), "start_time": time(8, 0), "end_time": time(14, 0), "status": ShiftStatusEnum.scheduled},
                {"doctor_id": docs[1].doctor_id, "shift_date": date(2026, 10, 26), "start_time": time(14, 0), "end_time": time(20, 0), "status": ShiftStatusEnum.scheduled},
                {"doctor_id": docs[2].doctor_id, "shift_date": date(2026, 10, 27), "start_time": time(8, 0), "end_time": time(14, 0), "status": ShiftStatusEnum.scheduled},
                {"doctor_id": docs[1].doctor_id, "shift_date": date(2026, 10, 27), "start_time": time(14, 0), "end_time": time(20, 0), "status": ShiftStatusEnum.scheduled},
                {"doctor_id": docs[0].doctor_id, "shift_date": date(2026, 10, 28), "start_time": time(8, 0), "end_time": time(14, 0), "status": ShiftStatusEnum.scheduled},
                {"doctor_id": docs[2].doctor_id, "shift_date": date(2026, 10, 28), "start_time": time(14, 0), "end_time": time(20, 0), "status": ShiftStatusEnum.scheduled},
            ]
            for s in shifts_to_add:
                if not db.query(DutyShift).filter(DutyShift.doctor_id == s["doctor_id"], DutyShift.shift_date == s["shift_date"]).first():
                    db.add(DutyShift(**s))
            db.commit()

            # Ensure patient assignments distributed
            appts = db.query(Appointment).all()
            for idx, a in enumerate(appts):
                target_doc = docs[idx % len(docs)]
                asgn = db.query(PatientAssignment).filter(PatientAssignment.appointment_id == a.appointment_id).first()
                if not asgn:
                    db.add(PatientAssignment(
                        appointment_id=a.appointment_id,
                        doctor_id=target_doc.doctor_id,
                        status=AssignmentStatusEnum.active
                    ))
            db.commit()

        print("Database seeding completed successfully!")
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_db()
