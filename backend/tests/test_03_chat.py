def test_chat_message(client, test_user):
    response = client.post("/chat/message", json={"content": "I have a headache"}, headers=test_user["headers"])
    assert response.status_code == 200
    data = response.json()
    assert "session_id" in data
    assert len(data["messages"]) == 2 # 1 user, 1 system
    assert data["messages"][0]["role"] == "user"
    assert data["messages"][1]["role"] == "bot"
