import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_auth_login_functionality():
    login_url = f"{BASE_URL}/auth/login"
    
    # Assuming test credentials for public/auth/admin roles with Alert and Case Verification access
    # These credentials should be adjusted as per actual test setup
    test_credentials = {
        "email": "admin@example.com",
        "password": "StrongPassword123!"
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(login_url, json=test_credentials, headers=headers, timeout=TIMEOUT)
    except requests.RequestException as e:
        assert False, f"Request to {login_url} failed: {e}"
    
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"
    
    try:
        response_data = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"
    
    assert "token" in response_data, "Response JSON does not contain 'token'"
    token = response_data["token"]
    assert isinstance(token, str) and len(token) > 0, "'token' should be a non-empty string"

test_auth_login_functionality()