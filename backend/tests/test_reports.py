from tests.conftest import register_and_login


def test_citizen_can_create_and_view_own_report(client):
    headers = register_and_login(client, email="reporter@example.com", role="citizen")

    resp = client.post(
        "/api/reports",
        data={"location": "Main St", "description": "Brown water from tap", "water_source": "Municipal supply"},
        headers=headers,
    )
    assert resp.status_code == 201
    report = resp.json()
    assert report["status"] == "pending"

    resp = client.get("/api/reports", headers=headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


def test_citizen_cannot_change_report_status(client):
    headers = register_and_login(client, email="reporter2@example.com", role="citizen")
    create_resp = client.post(
        "/api/reports",
        data={"location": "Elm St", "description": "cloudy water", "water_source": "well"},
        headers=headers,
    )
    report_id = create_resp.json()["id"]

    resp = client.patch(f"/api/reports/{report_id}/status", json={"status": "verified"}, headers=headers)
    assert resp.status_code == 403


def test_authority_can_verify_report(client):
    citizen_headers = register_and_login(client, email="reporter3@example.com", role="citizen")
    authority_headers = register_and_login(client, email="authority3@example.com", role="authority")

    create_resp = client.post(
        "/api/reports",
        data={"location": "Oak St", "description": "sewage smell near creek", "water_source": "creek"},
        headers=citizen_headers,
    )
    report_id = create_resp.json()["id"]

    resp = client.patch(f"/api/reports/{report_id}/status", json={"status": "verified"}, headers=authority_headers)
    assert resp.status_code == 200
    assert resp.json()["status"] == "verified"


def test_contamination_keyword_triggers_alert(client):
    citizen_headers = register_and_login(client, email="reporter4@example.com", role="citizen")
    client.post(
        "/api/reports",
        data={"location": "Creekside", "description": "dead fish and foam near the creek", "water_source": "creek"},
        headers=citizen_headers,
    )
    resp = client.get("/api/alerts")
    assert resp.status_code == 200
    assert any(a["alert_type"] == "contamination" for a in resp.json())
