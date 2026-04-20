import asyncio
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

FINANVO_API_KEY = os.getenv("FINANVO_API_KEY", "")
FINANVO_BASE_URL = "https://api5.finanvo.in"

def get_auth_headers():
    raw_token = FINANVO_API_KEY.replace("Bearer ", "").strip()
    return {
        "Authorization": raw_token,
        "App-Origin": "https://mcadownload.com",
        "Accept": "application/json, text/plain, */*",
    }

async def fetch_with_auth(client: httpx.AsyncClient, url: str, params: dict = None):
    headers = get_auth_headers()
    response = await client.get(url, headers=headers, params=params, timeout=15.0)
    return response

async def test_bulk():
    cins = [
        "L17110MH1973PLC019786",
        "L22210MH1995PLC084781",
        "L85110KA1981PLC013115",
        "L32102KA1945PLC020800",
        "L65920MH1994PLC080618",
        "L65190GJ1994PLC021012",
        "L99999MH1955PLC009594",
        "L74899DL1995PLC070609",
        "L34103DL1981PLC011375"
    ]
    results = []
    
    async with httpx.AsyncClient() as client:
        tasks = []
        for cin in cins:
            tasks.append(fetch_with_auth(client, f"{FINANVO_BASE_URL}/company/profile", {"CIN": cin}))
        
        responses = await asyncio.gather(*tasks, return_exceptions=True)
        
        for i, response in enumerate(responses):
            cin = cins[i]
            if isinstance(response, Exception):
                print(f"Error for {cin}: {str(response)}")
                continue
                
            print(f"Status for {cin}: {response.status_code}")
            if response.status_code == 200:
                print(f"Data for {cin}: {response.text[:100]}...")
            else:
                print(f"Response for {cin}: {response.text}")

if __name__ == "__main__":
    asyncio.run(test_bulk())
