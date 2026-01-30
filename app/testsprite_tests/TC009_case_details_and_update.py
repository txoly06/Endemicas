import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def login(email: str, password: str):
    url = f"{BASE_URL}/auth/login"
    payload = {"email": email, "password": password}
    try:
        resp = requests.post(url, json=payload, timeout=TIMEOUT)
        resp.raise_for_status()
        token = resp.json().get("token") or resp.json().get("access_token")
        assert token, "No token found in login response"
        return token
    except Exception as e:
        raise AssertionError(f"Login failed for {email}: {e}")

def create_case(auth_token):
    url = f"{BASE_URL}/cases"
    headers = {"Authorization": f"Bearer {auth_token}"}
    # Example case data, should be consistent with API schema (minimal required fields)
    payload = {
        "patient_name": "Test Patient",
        "disease": "Test Disease",
        "status": "active",
        "description": "Test case created for TC009.",
        "alert_verified": False,
        "case_verified": False
    }
    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        case_id = data.get("id") or data.get("case_id")
        assert case_id, "No case id returned on creation"
        return case_id
    except Exception as e:
        raise AssertionError(f"Case creation failed: {e}")

def delete_case(auth_token, case_id):
    url = f"{BASE_URL}/cases/{case_id}"
    headers = {"Authorization": f"Bearer {auth_token}"}
    try:
        resp = requests.delete(url, headers=headers, timeout=TIMEOUT)
        # 204 No Content or 200 OK expected on delete success
        assert resp.status_code in (200, 204), f"Failed to delete case {case_id}, status: {resp.status_code}"
    except Exception as e:
        # Don't raise to ensure cleanup attempt but log if needed
        pass

def test_case_details_and_update():
    # Credentials for public, auth user, and admin roles (placeholders - replace with actual test users)
    users = {
        "public": None,
        "auth": {"email": "user_auth", "password": "auth_pass"},
        "admin": {"email": "admin_user", "password": "admin_pass"}
    }
    # Login as authenticated user
    auth_token = login(users["auth"]["email"], users["auth"]["password"])
    admin_token = login(users["admin"]["email"], users["admin"]["password"])

    # Create a case to test on
    case_id = None
    try:
        case_id = create_case(auth_token)

        # Retrieve case details as authenticated user
        url = f"{BASE_URL}/cases/{case_id}"
        headers = {"Authorization": f"Bearer {auth_token}"}
        resp = requests.get(url, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        case_data = resp.json()
        assert case_data.get("id") == case_id or case_data.get("case_id") == case_id

        # Verify Alert and Case Verification fields are present (recently added features)
        assert "alert_verified" in case_data
        assert "case_verified" in case_data

        # Update the case details as authenticated user
        update_payload = {"description": "Updated description for test case.", "alert_verified": True, "case_verified": True}
        resp = requests.put(url, json=update_payload, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        updated_data = resp.json()
        assert updated_data.get("description") == update_payload["description"]
        assert updated_data.get("alert_verified") == True
        assert updated_data.get("case_verified") == True

        # Retrieve case details as admin to verify update
        headers_admin = {"Authorization": f"Bearer {admin_token}"}
        resp_admin = requests.get(url, headers=headers_admin, timeout=TIMEOUT)
        resp_admin.raise_for_status()
        case_data_admin = resp_admin.json()
        assert case_data_admin.get("description") == update_payload["description"]
        assert case_data_admin.get("alert_verified") is True
        assert case_data_admin.get("case_verified") is True

        # Attempt retrieving case details without auth (public role) should fail (401 or 403)
        resp_public = requests.get(url, timeout=TIMEOUT)
        assert resp_public.status_code in (401, 403)

    finally:
        if case_id:
            try:
                delete_case(auth_token, case_id)
            except Exception:
                pass

test_case_details_and_update()