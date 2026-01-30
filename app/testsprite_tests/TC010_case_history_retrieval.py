import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

PUBLIC_USER = {"username": "public_user", "password": "public_pass"}
AUTH_USER = {"username": "auth_user", "password": "auth_pass"}
ADMIN_USER = {"username": "admin_user", "password": "admin_pass"}

def login(user):
    resp = requests.post(f"{BASE_URL}/auth/login", json=user, timeout=TIMEOUT)
    resp.raise_for_status()
    data = resp.json()
    token = data.get("token") or data.get("access_token")
    assert token, "Login did not return a token"
    return token

def create_case(token):
    case_data = {
        "patient_name": "Test Patient",
        "disease": "TestDisease",
        "status": "new",
        "description": "Case created for testing history retrieval"
    }
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.post(f"{BASE_URL}/cases", json=case_data, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    case = resp.json()
    case_id = case.get("id")
    assert case_id, "Created case does not have an ID"
    return case_id

def delete_case(case_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    resp = requests.delete(f"{BASE_URL}/cases/{case_id}", headers=headers, timeout=TIMEOUT)
    # It's okay if delete fails for cleanup, so only catch exceptions silently
    try:
        resp.raise_for_status()
    except Exception:
        pass

def update_case(case_id, token):
    headers = {"Authorization": f"Bearer {token}"}
    update_data = {"status": "verified", "description": "Updated case status to verified"}
    resp = requests.put(f"{BASE_URL}/cases/{case_id}", json=update_data, headers=headers, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()

def test_case_history_retrieval():
    # Login users
    token_public = None  # Public does not require token
    token_auth = login(AUTH_USER)
    token_admin = login(ADMIN_USER)

    # Create a case as auth user to test history (we use auth_user for creation)
    case_id = None
    try:
        case_id = create_case(token_auth)

        # Make an update to create history entries
        update_case(case_id, token_auth)

        # Test retrieval of case history as:
        # 1) public (no authentication)
        resp_public = requests.get(f"{BASE_URL}/cases/{case_id}/history", timeout=TIMEOUT)
        # Public may or may not have access; we expect 401 or 403 or 200 with limited info
        if resp_public.status_code == 200:
            history_public = resp_public.json()
            assert isinstance(history_public, list), "Public history response should be a list"
        else:
            assert resp_public.status_code in (401,403), "Unexpected status for public role"

        # 2) authenticated user
        headers_auth = {"Authorization": f"Bearer {token_auth}"}
        resp_auth = requests.get(f"{BASE_URL}/cases/{case_id}/history", headers=headers_auth, timeout=TIMEOUT)
        resp_auth.raise_for_status()
        history_auth = resp_auth.json()
        assert isinstance(history_auth, list), "Auth user history response should be a list"
        assert len(history_auth) >= 1, "History should contain at least one entry after update"

        # 3) admin user
        headers_admin = {"Authorization": f"Bearer {token_admin}"}
        resp_admin = requests.get(f"{BASE_URL}/cases/{case_id}/history", headers=headers_admin, timeout=TIMEOUT)
        resp_admin.raise_for_status()
        history_admin = resp_admin.json()
        assert isinstance(history_admin, list), "Admin history response should be a list"
        assert len(history_admin) >= 1, "History should contain at least one entry after update"

        # Verify Alert and Case Verification features do not interfere (just check public alerts accessible)
        resp_alerts = requests.get(f"{BASE_URL}/public/alerts", timeout=TIMEOUT)
        resp_alerts.raise_for_status()
        alerts = resp_alerts.json()
        assert isinstance(alerts, list), "Public alerts response should be a list"

        # Verify public case verification by code (use the code from the case if returned)
        case_code = None
        # fetch case details to get code if available
        resp_case = requests.get(f"{BASE_URL}/cases/{case_id}", headers=headers_auth, timeout=TIMEOUT)
        resp_case.raise_for_status()
        case_details = resp_case.json()
        case_code = case_details.get("verification_code") or case_details.get("code")
        if case_code:
            resp_verify = requests.get(f"{BASE_URL}/public/verify/{case_code}", timeout=TIMEOUT)
            resp_verify.raise_for_status()
            verify_data = resp_verify.json()
            assert isinstance(verify_data, dict), "Verification response should be a dict"
            assert verify_data.get("id") == case_id, "Verification returned wrong case ID"
    finally:
        if case_id:
            delete_case(case_id, token_auth)

test_case_history_retrieval()