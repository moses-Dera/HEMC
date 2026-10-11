def test_get_me(client, test_user):
    response = client.get("/users/me", headers=test_user["headers"])
    assert response.status_code == 200
    assert response.json()["email"] == test_user["email"]

def test_admin_get_all_users(client, test_admin):
    response = client.get("/users/", headers=test_admin["headers"])
    assert response.status_code == 200
    assert len(response.json()) >= 1
    
def test_student_cannot_get_all_users(client, test_user):
    response = client.get("/users/", headers=test_user["headers"])
    assert response.status_code == 403
