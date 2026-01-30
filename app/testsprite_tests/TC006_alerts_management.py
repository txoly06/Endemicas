import requests
import uuid

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Credentials for the users representing public, auth user, and admin roles
# For testing, these should be set to valid existing users or created dynamically.
# Since instructions do not provide user creation, assume existing users:
USERS = {
    "public": None,  # no auth token
    "auth": {"email": "user@example.com", "password": "userpass"},
    "admin": {"email": "admin@example.com", "password": "adminpass"},
}

def login(email, password):
    url = f"{BASE_URL}/auth/login"
    try:
        resp = requests.post(url, json={"email": email, "password": password}, timeout=TIMEOUT)
        resp.raise_for_status()
        token = resp.json().get("token")
        assert token, "Token not found in login response"
        return token
    except Exception as e:
        raise RuntimeError(f"Login failed for {email}: {e}")

def test_alerts_management():
    # 1. Test /alerts listing for authenticated users (auth and admin)
    # 2. Test creation of alert with valid data for both roles
    # 3. Ensure public role cannot access /alerts
    # 4. Cleanup created alerts after test

    headers_auth = {}
    headers_admin = {}
    created_alerts = []

    # Login as auth user
    token_auth = login(USERS["auth"]["email"], USERS["auth"]["password"])
    headers_auth = {"Authorization": f"Bearer {token_auth}", "Content-Type": "application/json"}

    # Login as admin user
    token_admin = login(USERS["admin"]["email"], USERS["admin"]["password"])
    headers_admin = {"Authorization": f"Bearer {token_admin}", "Content-Type": "application/json"}

    # 1.a. Auth user lists alerts
    url_alerts = f"{BASE_URL}/alerts"
    try:
        resp = requests.get(url_alerts, headers=headers_auth, timeout=TIMEOUT)
        resp.raise_for_status()
        alerts_list = resp.json()
        assert isinstance(alerts_list, list), "Alerts list for auth user should be a list"
    except Exception as e:
        raise AssertionError(f"Auth user failed to list alerts: {e}")

    # 1.b. Admin user lists alerts
    try:
        resp = requests.get(url_alerts, headers=headers_admin, timeout=TIMEOUT)
        resp.raise_for_status()
        alerts_list_admin = resp.json()
        assert isinstance(alerts_list_admin, list), "Alerts list for admin user should be a list"
    except Exception as e:
        raise AssertionError(f"Admin user failed to list alerts: {e}")

    # 1.c. Public (no auth) user tries to list alerts, should be unauthorized or forbidden
    try:
        resp = requests.get(url_alerts, timeout=TIMEOUT)
        assert resp.status_code in (401, 403), "Public user should not access /alerts"
    except Exception as e:
        raise AssertionError(f"Public user access to /alerts did not fail as expected: {e}")

    # Prepare valid alert creation payload
    # Example alert fields inferred (since not explicitly given in PRD):
    alert_payload = {
        "title": f"Test Alert {uuid.uuid4()}",
        "message": "This is a test alert created by automated test.",
        "level": "info",  # assuming level field exists, e.g., info, warning, critical
        "active": True
    }

    # 2.a. Auth user creates an alert
    alert_id_auth = None
    try:
        resp = requests.post(url_alerts, headers=headers_auth, json=alert_payload, timeout=TIMEOUT)
        resp.raise_for_status()
        alert_created = resp.json()
        assert "id" in alert_created, "Created alert response must contain 'id'"
        alert_id_auth = alert_created["id"]
        created_alerts.append((alert_id_auth, headers_auth))
    except Exception as e:
        raise AssertionError(f"Auth user failed to create alert: {e}")

    # 2.b. Admin user creates an alert
    alert_id_admin = None
    try:
        resp = requests.post(url_alerts, headers=headers_admin, json=alert_payload, timeout=TIMEOUT)
        resp.raise_for_status()
        alert_created_admin = resp.json()
        assert "id" in alert_created_admin, "Created alert response must contain 'id'"
        alert_id_admin = alert_created_admin["id"]
        created_alerts.append((alert_id_admin, headers_admin))
    except Exception as e:
        raise AssertionError(f"Admin user failed to create alert: {e}")

    # 2.c. Public user tries to create alert, should fail
    try:
        resp = requests.post(url_alerts, json=alert_payload, timeout=TIMEOUT)
        assert resp.status_code in (401, 403), "Public user should not create alerts"
    except Exception as e:
        raise AssertionError(f"Public user create alert did not fail as expected: {e}")

    # Cleanup: delete created alerts
    for alert_id, auth_headers in created_alerts:
        try:
            url_delete = f"{url_alerts}/{alert_id}"
            resp = requests.delete(url_delete, headers=auth_headers, timeout=TIMEOUT)
            # response might be 200 or 204 for successful delete
            assert resp.status_code in (200, 204), f"Failed to delete alert ID {alert_id}"
        except Exception as e:
            print(f"Warning: Failed to delete alert ID {alert_id}: {e}")

test_alerts_management()