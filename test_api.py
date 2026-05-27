import requests

BASE_URL = "http://localhost:5000"

def test_signup():
    print("Testing Signup...")
    payload = {
        "username": "testuser",
        "password": "testpassword",
        "secret_question": "What is 1+1?",
        "secret_answer": "2"
    }
    try:
        response = requests.post(f"{BASE_URL}/api/signup", json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_signup()
