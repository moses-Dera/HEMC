from datetime import datetime, timezone, timedelta

def test_book_appointment_with_doctor(client, test_user, test_doctor):
    future_date = (datetime.now(timezone.utc) + timedelta(days=2)).isoformat()
    response = client.post("/appointments/", json={
        "appointment_date": future_date,
        "doctor_id": test_doctor["doctor_id"]
    }, headers=test_user["headers"])
    
    assert response.status_code == 200
    data = response.json()
    assert data["doctor_id"] == test_doctor["doctor_id"]
    assert data["status"] == "pending"
    assert data["patient_name"] == "Test User"
    assert "doctor_name" in data

def test_book_appointment_past_date_rejected(client, test_user):
    past_date = "2020-01-01T10:00:00Z"
    response = client.post("/appointments/", json={
        "appointment_date": past_date
    }, headers=test_user["headers"])
    
    assert response.status_code == 400
    assert "past" in response.json()["detail"].lower()

def test_get_my_appointments(client, test_user, test_doctor):
    future_date = (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
    client.post("/appointments/", json={
        "appointment_date": future_date,
        "doctor_id": test_doctor["doctor_id"]
    }, headers=test_user["headers"])
    
    response = client.get("/appointments/my", headers=test_user["headers"])
    assert response.status_code == 200
    assert len(response.json()) >= 1
    assert any(a["doctor_id"] == test_doctor["doctor_id"] for a in response.json())

def test_doctor_confirm_and_complete_appointment(client, test_user, test_doctor):
    future_date = (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
    book_res = client.post("/appointments/", json={
        "appointment_date": future_date,
        "doctor_id": test_doctor["doctor_id"]
    }, headers=test_user["headers"])
    apt_id = book_res.json()["appointment_id"]
    
    # Doctor confirms appointment
    confirm_res = client.patch(f"/appointments/{apt_id}", json={
        "status": "confirmed"
    }, headers=test_doctor["headers"])
    assert confirm_res.status_code == 200
    assert confirm_res.json()["status"] == "confirmed"
    
    # Doctor conducts consultation & completes with prescription
    complete_res = client.patch(f"/appointments/{apt_id}", json={
        "status": "completed",
        "prescription": "Artemether-Lumefantrine 80/480mg BD x 3 days",
        "clinical_notes": "Uncomplicated malaria confirmed by RDT."
    }, headers=test_doctor["headers"])
    assert complete_res.status_code == 200
    assert complete_res.json()["status"] == "completed"
    assert "Artemether" in complete_res.json()["prescription"]
    assert "malaria" in complete_res.json()["clinical_notes"].lower()

