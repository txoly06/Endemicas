import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

# Credentials for users with different roles
USERS = {
    "admin": {"email": "admin@example.com", "password": "AdminPass123"},
    "auth": {"email": "user@example.com", "password": "UserPass123"},
    "public": None  # No credentials for public
}

def login(user_credentials):
    try:
        resp = requests.post(
            f"{BASE_URL}/auth/login",
            json={
                "email": user_credentials["email"],
                "password": user_credentials["password"]
            },
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        token = resp.json().get("token")
        assert token, "Login failed: No token returned"
        return token
    except Exception as e:
        raise Exception(f"Login failed: {e}")

def create_alert(token, alert_data):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.post(
            f"{BASE_URL}/alerts",
            headers=headers,
            json=alert_data,
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        alert = resp.json()
        alert_id = alert.get("id")
        assert alert_id, "Create alert failed: No ID returned"
        return alert_id
    except Exception as e:
        raise Exception(f"Create alert failed: {e}")

def update_alert(token, alert_id, update_data):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.put(
            f"{BASE_URL}/alerts/{alert_id}",
            headers=headers,
            json=update_data,
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        updated_alert = resp.json()
        return updated_alert
    except Exception as e:
        raise Exception(f"Update alert failed: {e}")

def delete_alert(token, alert_id):
    headers = {"Authorization": f"Bearer {token}"}
    try:
        resp = requests.delete(
            f"{BASE_URL}/alerts/{alert_id}",
            headers=headers,
            timeout=TIMEOUT
        )
        resp.raise_for_status()
        return resp.status_code
    except Exception as e:
        raise Exception(f"Delete alert failed: {e}")

def test_alerts_update_and_delete():
    # Alert data for creation
    alert_data = {
        "title": "Test Alert",
        "message": "This is a test alert for update and delete.",
        "active": True
    }
    # Update data to modify the alert
    update_data = {
        "title": "Updated Test Alert",
        "message": "This alert has been updated.",
        "active": False
    }

    # Testing with admin role
    admin_token = login(USERS["admin"])

    alert_id = None
    try:
        alert_id = create_alert(admin_token, alert_data)

        # Update the alert
        updated_alert = update_alert(admin_token, alert_id, update_data)
        assert updated_alert["id"] == alert_id
        assert updated_alert["title"] == update_data["title"]
        assert updated_alert["message"] == update_data["message"]
        assert updated_alert["active"] == update_data["active"]

        # Delete the alert
        del_status = delete_alert(admin_token, alert_id)
        assert del_status == 200 or del_status == 204
        alert_id = None  # Mark as deleted to skip deletion in finally

    finally:
        # Cleanup: delete alert if it still exists
        if alert_id is not None:
            try:
                delete_alert(admin_token, alert_id)
            except Exception:
                pass

    # Testing update and delete with authenticated non-admin user (should be unauthorized)
    auth_token = login(USERS["auth"])
    # Create alert as admin to test update/delete with auth user
    alert_id_auth_test = None
    try:
        alert_id_auth_test = create_alert(admin_token, alert_data)

        # Attempt update with auth user - expect failure (403 or 401)
        headers_auth = {"Authorization": f"Bearer {auth_token}"}
        resp_update = requests.put(
            f"{BASE_URL}/alerts/{alert_id_auth_test}",
            headers=headers_auth,
            json=update_data,
            timeout=TIMEOUT
        )
        assert resp_update.status_code in (401, 403)

        # Attempt delete with auth user - expect failure (403 or 401)
        resp_delete = requests.delete(
            f"{BASE_URL}/alerts/{alert_id_auth_test}",
            headers=headers_auth,
            timeout=TIMEOUT
        )
        assert resp_delete.status_code in (401, 403)

    finally:
        # Cleanup: delete alert as admin
        if alert_id_auth_test is not None:
            try:
                delete_alert(admin_token, alert_id_auth_test)
            except Exception:
                pass

    # Testing unauthenticated (public) user update and delete - should be unauthorized
    if USERS["public"] is None:
        # Attempt update without auth token
        resp_update_public = requests.put(
            f"{BASE_URL}/alerts/1",
            json=update_data,
            timeout=TIMEOUT
        )
        assert resp_update_public.status_code == 401 or resp_update_public.status_code == 403

        # Attempt delete without auth token
        resp_delete_public = requests.delete(
            f"{BASE_URL}/alerts/1",
            timeout=TIMEOUT
        )
        assert resp_delete_public.status_code == 401 or resp_delete_public.status_code == 403

test_alerts_update_and_delete()