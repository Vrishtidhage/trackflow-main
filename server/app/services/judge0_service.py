import requests
import time

JUDGE0_URL = "https://judge0-ce.p.rapidapi.com/submissions"
API_KEY = "YOUR_RAPIDAPI_KEY"

headers = {
    "X-RapidAPI-Key": API_KEY,
    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com",
    "Content-Type": "application/json"
}

def run_code(source_code, language_id):
    payload = {
        "source_code": source_code,
        "language_id": language_id,
    }

    response = requests.post(JUDGE0_URL, json=payload, headers=headers)

    if response.status_code != 201:
        return {"stderr": "Error submitting code"}

    token = response.json().get("token")

    # Poll result
    while True:
        res = requests.get(f"{JUDGE0_URL}/{token}", headers=headers)
        result = res.json()

        if result["status"]["id"] in [1, 2]:
            time.sleep(1)
        else:
            return result