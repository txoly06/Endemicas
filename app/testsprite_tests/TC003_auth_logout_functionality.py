import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_auth_logout_functionality():
    register_url = f"{BASE_URL}/auth/register"
    login_url = f"{BASE_URL}/auth/login"
    logout_url = f"{BASE_URL}/auth/logout"
    me_url = f"{BASE_URL}/auth/me"

    # Test user data for registration
    user_data = {
        "name": "Test User",
        "email": "testuser_logout@example.com",
        "password": "TestPassword123!",
        "password_confirmation": "TestPassword123!"
    }

    session = requests.Session()

    try:
        # Register new user
        reg_resp = session.post(register_url, json=user_data, timeout=TIMEOUT)
        assert reg_resp.status_code in (200,201), f"Registration failed: {reg_resp.text}"

        # Login to get auth token
        login_payload = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        login_resp = session.post(login_url, json=login_payload, timeout=TIMEOUT)
        assert login_resp.status_code == 200, f"Login failed: {login_resp.text}"

        login_json = login_resp.json()
        # Expect token in login response, this may be in headers or json, guess json: token or access_token
        token = None
        if "token" in login_json:
            token = login_json["token"]
        elif "access_token" in login_json:
            token = login_json["access_token"]
        assert token, "Auth token not found in login response"

        headers = {"Authorization": f"Bearer {token}"}

        # Verify that /auth/me works before logout
        me_resp = session.get(me_url, headers=headers, timeout=TIMEOUT)
        assert me_resp.status_code == 200, f"/auth/me failed before logout: {me_resp.text}"
        me_json = me_resp.json()
        assert "email" in me_json and me_json["email"] == user_data["email"], "User email mismatch before logout"

        # Call logout endpoint
        logout_resp = session.post(logout_url, headers=headers, timeout=TIMEOUT)
        assert logout_resp.status_code == 200, f"Logout failed: {logout_resp.text}"

        # After logout, token should be invalidated
        me_post_logout_resp = session.get(me_url, headers=headers, timeout=TIMEOUT)
        # Expect unauthorized or token invalid response
        assert me_post_logout_resp.status_code in (401, 403), "Token still valid after logout"

        # Also test that logout twice or logout without token should fail gracefully
        logout_again_resp = session.post(logout_url, headers=headers, timeout=TIMEOUT)
        # Either 401 unauthorized or 200 (idempotent logout)
        assert logout_again_resp.status_code in (200, 401, 403), "Unexpected response when logging out again"

    finally:
        # Cleanup user if API supported user deletion (not specified in PRD, so skipping)
        pass

test_auth_logout_functionality()