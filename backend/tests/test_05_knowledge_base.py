def test_admin_create_kb(client, test_admin):
    response = client.post("/knowledge-base/", json={
        "disease": "malaria",
        "category": "symptom",
        "content": "Fever, chills",
        "source": "WHO"
    }, headers=test_admin["headers"])
    assert response.status_code == 200
    assert response.json()["disease"] == "malaria"

def test_student_cannot_create_kb(client, test_user):
    response = client.post("/knowledge-base/", json={
        "disease": "malaria",
        "category": "symptom",
        "content": "Fever, chills",
        "source": "WHO"
    }, headers=test_user["headers"])
    assert response.status_code == 403
