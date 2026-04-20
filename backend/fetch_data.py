import asyncio
import httpx
import json
from main import fetch_with_auth, FINANVO_BASE_URL

async def fetch_finanvo_companies(query: str, page: int = 1, limit: int = 5):
    """
    Fetches company data from the Finanvo API utilizing the self-healing Backend logic.
    """
    params = {
        "query": query,
        "page": page,
        "limit": limit
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await fetch_with_auth(client, f"{FINANVO_BASE_URL}/search/company", params)
            
            if response.status_code == 200:
                print(f"✅ API Call Success! Fetched {query}")
                return response.json()
            else:
                return {
                    "error": f"API Error: Status {response.status_code}",
                    "details": response.text
                }
    except Exception as e:
        return {"error": f"Connection failed: {str(e)}"}

if __name__ == "__main__":
    print("Testing the self-healing function...\n")
    
    # Run the async function synchronously
    result = asyncio.run(fetch_finanvo_companies("TATA", limit=3))
    
    print(json.dumps(result, indent=2))

