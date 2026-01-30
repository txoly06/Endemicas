import requests

BASE_URL = "http://localhost:8000"
TIMEOUT = 30

def test_public_alerts_retrieval():
    url = f"{BASE_URL}/public/alerts"
    headers = {
        "Accept": "application/json"
    }
    try:
        response = requests.get(url, headers=headers, timeout=TIMEOUT)
        response.raise_for_status()
    except requests.RequestException as e:
        assert False, f"Request to {url} failed: {e}"

    # Validate response status code
    assert response.status_code == 200, f"Expected status code 200, got {response.status_code}"

    try:
        alerts = response.json()
    except ValueError:
        assert False, "Response is not valid JSON"

    # Validate that the response is a list (of active public alerts)
    assert isinstance(alerts, list), "Response JSON is not a list"

    # Optional: Validate structure of each alert item if possible
    for alert in alerts:
        assert isinstance(alert, dict), "Each alert should be a dictionary"
        # Basic keys that might be expected in an alert object
        # Since no schema details, check at least for id and active status
        assert "id" in alert, "Alert item missing 'id'"
        assert "active" in alert, "Alert item missing 'active'"
        assert alert["active"] is True, "Alert item is not active"

test_public_alerts_retrieval()