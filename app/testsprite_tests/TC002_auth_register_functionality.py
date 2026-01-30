import requests
import uuid

BASE_URL = "http://localhost:8000"
REGISTER_ENDPOINT = f"{BASE_URL}/auth/register"
LOGIN_ENDPOINT = f"{BASE_URL}/auth/login"

def test_auth_register_functionality():
    # Generate unique user data for registration
    unique_suffix = str(uuid.uuid4())
    register_data = {
        "name": f"Test User {unique_suffix}",
        "email": f"testuser_{unique_suffix}@example.com",
        "password": "StrongPassword!123",
        "password_confirmation": "StrongPassword!123"
    }
    headers = {
        "Content-Type": "application/json"
    }

    try:
        # 1. Register new user
        response = requests.post(
            REGISTER_ENDPOINT,
            json=register_data,
            headers=headers,
            timeout=30
        )
        assert response.status_code == 201, f"Expected 201 Created but got {response.status_code}"
        response_json = response.json()
        assert "user" in response_json, "'user' field not found in response"
        user = response_json["user"]
        assert user.get("email") == register_data["email"], "Registered user's email does not match request email"

        # 2. Verify that the user can log in with the registered credentials
        login_data = {
            "email": register_data["email"],
            "password": register_data["password"]
        }
        login_response = requests.post(
            LOGIN_ENDPOINT,
            json=login_data,
            headers=headers,
            timeout=30
        )
        assert login_response.status_code == 200, f"Expected 200 OK for login but got {login_response.status_code}"
        login_json = login_response.json()
        assert "token" in login_json or "access_token" in login_json, "Authentication token not found in login response"

        # 3. Validate Alert and Case Verification public endpoints (no auth required)
        alert_public_response = requests.get(f"{BASE_URL}/public/alerts", timeout=30)
        assert alert_public_response.status_code == 200, f"Expected 200 OK for /public/alerts but got {alert_public_response.status_code}"
        alerts_json = alert_public_response.json()
        assert isinstance(alerts_json, (list, dict)), "Expected list or dict as alerts response"

        # For Case Verification, since no code given, just test that endpoint is accessible
        verify_code = "dummycode"
        verify_response = requests.get(f"{BASE_URL}/public/verify/{verify_code}", timeout=30)
        # Response can be 200 or 404 depending on code existence, just check accessibility
        assert verify_response.status_code in (200, 404), f"Expected 200 or 404 for /public/verify/{{code}} but got {verify_response.status_code}"

    except requests.RequestException as e:
        assert False, f"Request failed: {e}"

test_auth_register_functionality()