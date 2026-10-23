from datetime import datetime, timezone, timedelta
from app.modules.users.model import User
from app.modules.doctors.models.doctor import Doctor
from app.core.security import get_password_hash

def test_list_doctors_with_availability(client, test_user, test_doctor):
    res = client.get("/doctors/", headers=test_user["headers"])
    assert res.status_code == 200
    doctors = res.json()
    assert len(doctors) >= 1
    doc = next(d for d in doctors if d["doctor_id"] == test_doctor["doctor_id"])
    assert doc["is_available"] is True
    assert "General Medicine" in doc["specialization"]

def test_doctor_dashboard_patient_queue_and_handover(client, db_session, test_user, test_doctor, test_admin):
    # Create second doctor for handover
    doc2_user = User(name="Dr. Colleague", email="colleague@example.com", hashed_password=get_password_hash("docpass2"), role="doctor")
    db_session.add(doc2_user)
    db_session.commit()
    
    doc2_record = Doctor(user_id=doc2_user.id, specialization="Internal Medicine & Infectious Diseases", is_available=True)
    db_session.add(doc2_record)
    db_session.commit()
    
    # Book appointment with Doctor 1
    future_date = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    book_res = client.post("/appointments/", json={
        "appointment_date": future_date,
        "doctor_id": test_doctor["doctor_id"]
    }, headers=test_user["headers"])
    assert book_res.status_code == 200
    apt_id = book_res.json()["appointment_id"]
    
    # Doctor 1 checks queue
    queue_res = client.get("/doctor-dashboard/patients", headers=test_doctor["headers"])
    assert queue_res.status_code == 200
    patients = queue_res.json()
    assert any(p["appointment_id"] == apt_id for p in patients)
    assignment = next(p for p in patients if p["appointment_id"] == apt_id)
    
    # Doctor 1 hands over patient to Doctor 2
    handover_res = client.post("/doctor-dashboard/handover", json={
        "assignment_id": assignment["assignment_id"],
        "to_doctor_id": doc2_record.doctor_id,
        "reason": "shift_end",
        "notes": "Duty shift concluded; patient transferred to Dr. Colleague."
    }, headers=test_doctor["headers"])
    assert handover_res.status_code == 200
    assert "handover_id" in handover_res.json()
    assert handover_res.json()["to_doctor_id"] == doc2_record.doctor_id
    
    # Doctor 1's queue no longer has the active assignment
    queue_after = client.get("/doctor-dashboard/patients", headers=test_doctor["headers"])
    assert not any(p["assignment_id"] == assignment["assignment_id"] for p in queue_after.json())
