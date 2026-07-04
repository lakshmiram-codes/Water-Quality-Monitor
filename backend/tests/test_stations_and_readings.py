from tests.conftest import register_and_login


def test_authority_can_create_station_and_reading(client):
    headers = register_and_login(client, email="auth5@example.com", role="authority")

    resp = client.post("/api/stations", json={
        "name": "Test Station", "location": "Test City", "latitude": 1.23, "longitude": 4.56,
    }, headers=headers)
    assert resp.status_code == 201
    station_id = resp.json()["id"]

    resp = client.post("/api/readings", json={
        "station_id": station_id, "parameter": "pH", "value": 7.0,
    }, headers=headers)
    assert resp.status_code == 201

    resp = client.get(f"/api/readings?station_id={station_id}")
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_unsafe_reading_triggers_contamination_alert(client):
    headers = register_and_login(client, email="auth6@example.com", role="authority")
    station_id = client.post("/api/stations", json={
        "name": "Unsafe Station", "location": "City", "latitude": 1.0, "longitude": 1.0,
    }, headers=headers).json()["id"]

    client.post("/api/readings", json={
        "station_id": station_id, "parameter": "lead", "value": 0.05,
    }, headers=headers)

    alerts = client.get("/api/alerts").json()
    assert any(a["station_id"] == station_id and a["alert_type"] == "contamination" for a in alerts)


def test_citizen_cannot_create_station(client):
    headers = register_and_login(client, email="citizen7@example.com", role="citizen")
    resp = client.post("/api/stations", json={
        "name": "Nope", "location": "City", "latitude": 1.0, "longitude": 1.0,
    }, headers=headers)
    assert resp.status_code == 403
