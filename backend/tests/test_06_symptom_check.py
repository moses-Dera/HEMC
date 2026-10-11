def test_start_symptom_check(client, test_user):
    response = client.post("/symptom-check/start", json={"initial_symptom": "fever"}, headers=test_user["headers"])
    assert response.status_code == 200
    assert response.json()["fever_duration"] == "fever"
