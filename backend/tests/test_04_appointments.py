def test_book_appointment(client, test_user):
    response = client.post("/appointments/", json={
        "appointment_date": "2026-12-01T10:00:00Z"
    }, headers=test_user["headers"])
    assert response.status_code == 200
    assert "appointment_id" in response.json()

def test_get_my_appointments(client, test_user):
    client.post("/appointments/", json={
        "appointment_date": "2026-12-01T10:00:00Z"
    }, headers=test_user["headers"])
    
    response = client.get("/appointments/my", headers=test_user["headers"])
    assert response.status_code == 200
    assert len(response.json()) >= 1
