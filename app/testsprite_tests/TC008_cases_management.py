import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_cases_management():
    # User credentials for roles to test: public (no auth), auth user, admin
    # For this test, we'll use an auth user and an admin user for testing the /cases endpoint.
    # Assuming we have test users set with credentials:
    users = {
        "auth_user": {"email": "user@example.com", "password": "userpassword"},
        "admin": {"email": "admin@example.com", "password": "adminpassword"},
        # public role requires no authentication and should not allow GET/POST on /cases (restricted)
    }

    def login(user):
        resp = requests.post(f"{BASE_URL}/auth/login",
                             json={"email": user["email"], "password": user["password"]},
                             timeout=TIMEOUT)
        resp.raise_for_status()
        token = resp.json().get("token")
        assert token, "Login response missing token"
        return token

    def auth_headers(token):
        return {"Authorization": f"Bearer {token}"}

    # Sample case data for creation based on common disease case attributes inferred
    new_case_data = {
        "patient_name": "Test Patient",
        "disease": "Test Disease",
        "status": "confirmed",
        "date_reported": "2026-01-28",
        "location": "Test Location",
        "notes": "Test case created by automated test"
    }

    # FUNCTION TO CREATE a case and return its ID
    def create_case(token):
        headers = auth_headers(token)
        resp = requests.post(f"{BASE_URL}/cases", json=new_case_data, headers=headers, timeout=TIMEOUT)
        resp.raise_for_status()
        data = resp.json()
        assert "id" in data, "Response from case creation missing 'id'"
        return data["id"]

    # FUNCTION TO DELETE a case to clean up test data (if API supported DELETE, here assuming no delete endpoint in PRD for cases)
    # So no delete here, just testing create and list

    # Test for authenticated user role
    token_user = login(users["auth_user"])

    try:
        # List cases
        resp_list = requests.get(f"{BASE_URL}/cases", headers=auth_headers(token_user), timeout=TIMEOUT)
        resp_list.raise_for_status()
        cases_list = resp_list.json()
        assert isinstance(cases_list, list), "/cases GET should return a list"

        # Create a new case
        case_id = create_case(token_user)

        # Verify case is listed after creation
        resp_list2 = requests.get(f"{BASE_URL}/cases", headers=auth_headers(token_user), timeout=TIMEOUT)
        resp_list2.raise_for_status()
        cases_list2 = resp_list2.json()
        assert any(c.get("id") == case_id for c in cases_list2), "Newly created case not found in cases list"

    finally:
        # No deletion of case endpoint, so no cleanup possible here for case resource

        pass

    # Test for admin role
    token_admin = login(users["admin"])

    try:
        # List cases for admin
        resp_list_admin = requests.get(f"{BASE_URL}/cases", headers=auth_headers(token_admin), timeout=TIMEOUT)
        resp_list_admin.raise_for_status()
        cases_list_admin = resp_list_admin.json()
        assert isinstance(cases_list_admin, list), "/cases GET by admin should return a list"

        # Create a new case as admin
        case_id_admin = create_case(token_admin)

        # Verify case is listed after creation
        resp_list_admin2 = requests.get(f"{BASE_URL}/cases", headers=auth_headers(token_admin), timeout=TIMEOUT)
        resp_list_admin2.raise_for_status()
        cases_list_admin2 = resp_list_admin2.json()
        assert any(c.get("id") == case_id_admin for c in cases_list_admin2), "Newly created case by admin not found in cases list"

    finally:
        # No deletion endpoint to cleanup created case

        pass

    # Test that public (no token) cannot access /cases endpoint (should be unauthorized)
    resp_public_get = requests.get(f"{BASE_URL}/cases", timeout=TIMEOUT)
    assert resp_public_get.status_code in (401, 403), "Public access to /cases GET should be unauthorized"

    resp_public_post = requests.post(f"{BASE_URL}/cases", json=new_case_data, timeout=TIMEOUT)
    assert resp_public_post.status_code in (401, 403), "Public access to /cases POST should be unauthorized"


test_cases_management()