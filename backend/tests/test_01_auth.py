def test_register_user(client):
    response = client.post("/auth/register", json={
        "full_name": "New User",
        "email": "new@example.com",
        "password": "strongpassword"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_user(client, test_user):
    response = client.post("/auth/login", json={
        "email": test_user["email"],
        "password": test_user["password"]
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_wrong_password(client, test_user):
    response = client.post("/auth/login", json={
        "email": test_user["email"],
        "password": "wrongpassword"
    })
    assert response.status_code == 401
