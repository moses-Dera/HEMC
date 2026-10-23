def test_chat_message(client, test_user):
    response = client.post("/chat/message", json={"content": "I have a headache"}, headers=test_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["messages"]) == 2 # 1 user, 1 system
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][1]["role"] == "bot"

def test_start_new_chat_session(client, test_user):
    # First message in session 1
    res1 = client.post("/chat/message", json={"content": "What causes malaria?"}, headers=test_user["headers"])
    session_1_id = res1.json()["session_id"]
    
    # Start fresh session
    new_res = client.post("/chat/new", headers=test_user["headers"])
    assert new_res.status_code == 200
    new_session_id = new_res.json()["session_id"]
    assert new_session_id != session_1_id
    
    # Message in session 2
    res2 = client.post("/chat/message", json={"content": "How to prevent typhoid?"}, headers=test_user["headers"])
    session_2_id = res2.json()["session_id"]
    assert session_2_id == new_session_id
    
    # Verify sessions endpoint returns both distinct sessions
    sessions_res = client.get("/chat/sessions", headers=test_user["headers"])
    assert sessions_res.status_code == 200
    sessions = sessions_res.json()
    assert len(sessions) >= 2
    session_ids = [s["session_id"] for s in sessions]
    assert session_1_id in session_ids
    assert session_2_id in session_ids

