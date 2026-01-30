import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_auth_me_functionality():
    login_url = f"{BASE_URL}/auth/login"
    auth_me_url = f"{BASE_URL}/auth/me"
    logout_url = f"{BASE_URL}/auth/logout"

    # Use known admin credentials that have access to Alert and Case Verification features
    credentials = {
        "email": "admin@example.com",
        "password": "adminpassword"
    }

    try:
        # Login to get token
        login_response = requests.post(login_url, json=credentials, timeout=TIMEOUT)
        assert login_response.status_code == 200, f"Login failed: {login_response.text}"
        login_data = login_response.json()
        assert "token" in login_data, "Token not in login response"

        token = login_data["token"]
        headers = {"Authorization": f"Bearer {token}"}

        # Call /auth/me to get current user info
        me_response = requests.get(auth_me_url, headers=headers, timeout=TIMEOUT)
        assert me_response.status_code == 200, f"/auth/me failed: {me_response.text}"

        user_info = me_response.json()
        # Validate returned user info contains expected keys
        assert "id" in user_info, "User id missing in auth me response"
        assert "email" in user_info, "User email missing in auth me response"
        assert user_info["email"] == credentials["email"], "Returned user email does not match login email"
        # Optionally check roles related to Alert and Case Verification are included
        assert "roles" in user_info, "User roles missing in auth me response"
        roles = user_info["roles"]
        assert any(r in roles for r in ["public", "auth", "admin"]), "Expected roles not present in user roles"

    finally:
        # Logout to invalidate token
        if 'token' in locals():
            headers = {"Authorization": f"Bearer {token}"}
            logout_response = requests.post(logout_url, headers=headers, timeout=TIMEOUT)
            assert logout_response.status_code == 200, f"Logout failed: {logout_response.text}"

test_auth_me_functionality()