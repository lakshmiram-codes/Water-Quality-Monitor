def test_register_and_login(client):
    resp = client.post("/api/auth/register", json={
        "name": "Alice", "email": "alice@example.com", "password": "secret123", "role": "citizen",
    })
    assert resp.status_code == 201
    assert resp.json()["email"] == "alice@example.com"

    resp = client.post("/api/auth/login", json={"email": "alice@example.com", "password": "secret123"})
    assert resp.status_code == 200
    body = resp.json()
    assert "access_token" in body and "refresh_token" in body


def test_login_wrong_password_fails(client):
    client.post("/api/auth/register", json={
        "name": "Bob", "email": "bob@example.com", "password": "secret123", "role": "citizen",
    })
    resp = client.post("/api/auth/login", json={"email": "bob@example.com", "password": "wrong"})
    assert resp.status_code == 401


def test_duplicate_email_rejected(client):
    payload = {"name": "Carl", "email": "carl@example.com", "password": "secret123", "role": "citizen"}
    assert client.post("/api/auth/register", json=payload).status_code == 201
    assert client.post("/api/auth/register", json=payload).status_code == 400


def test_get_me_requires_auth(client):
    resp = client.get("/api/users/me")
    assert resp.status_code == 401
