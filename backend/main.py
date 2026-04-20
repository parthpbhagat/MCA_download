import asyncio
from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from dotenv import load_dotenv
from typing import Optional, List
import smtplib
from email.message import EmailMessage
import razorpay
from pydantic import BaseModel

load_dotenv()
if not os.getenv("FINANVO_API_KEY"):
    load_dotenv(".venv")

app = FastAPI(title="MCA Data Hub API")

# Enable CORS for the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Finanvo API Configuration
FINANVO_API_KEY = os.getenv("FINANVO_API_KEY", "")
FINANVO_API_SECRET_KEY = os.getenv("FINANVO_API_SECRET_KEY", "")

def get_auth_headers():
    # Strip any 'Bearer ' prefix - mcadownload.com sends token WITHOUT Bearer prefix
    raw_token = FINANVO_API_KEY.replace("Bearer ", "").strip()
    
    # Exact headers as seen in mcadownload.com DevTools Network tab
    return {
        "Authorization": raw_token,
        "App-Origin": "https://mcadownload.com",
        "Accept": "application/json, text/plain, */*",
    }

def update_env_file(key, value):
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    root_env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
    
    for path in [env_path, root_env_path]:
        try:
            with open(path, "r") as f:
                lines = f.readlines()
            
            with open(path, "w") as f:
                found = False
                for line in lines:
                    if line.startswith(f"{key}="):
                        f.write(f"{key}={value}\n")
                        found = True
                    else:
                        f.write(line)
                if not found:
                    f.write(f"{key}={value}\n")
        except Exception:
            pass

FINANVO_BASE_URL = "https://api5.finanvo.in"

@app.middleware("http")
async def log_requests(request, call_next):
    print(f"DEBUG: Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"DEBUG: Response status: {response.status_code}")
    return response

# Settings for Admin Panel
import json

SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "settings.json")

def load_settings():
    if not os.path.exists(SETTINGS_FILE):
        return {
            "footerText": "© 2026 MCA Download. All rights reserved.",
            "contactInfo": {
                "name": "Technowire DataScience Pvt. Ltd.",
                "address": "Eighteen Floor, 1815, Block-B,\nNavratna Corporate Park,\nOpp. Jayantilal Park, Bopal Road,\nAmbli, Gujarat, PIN: 380058, India",
                "phone": "+91 9624850607",
                "email": "technowire@outlook.com"
            },
            "faq": [
                {"q": "What does the ZIP files contain?", "a": "The ZIP file contains the PDFs for each company..."}
            ],
            "pricing": [
                {"title": "Basic", "price": "₹99", "features": ["1 Download"]}
            ]
        }
    with open(SETTINGS_FILE, "r") as f:
        return json.load(f)

def save_settings(settings: dict):
    with open(SETTINGS_FILE, "w") as f:
        json.dump(settings, f, indent=4)

@app.get("/api/settings")
async def get_settings():
    return load_settings()

@app.post("/api/settings")
async def update_settings(settings: dict = Body(...)):
    save_settings(settings)
    return {"message": "Settings updated"}

# Razorpay Integration
try:
    import razorpay
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "rzp_test_YourTestKeyHere")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "YourTestSecretHere")
    print(f"DEBUG: Razorpay Key ID Loaded: {RAZORPAY_KEY_ID}")
    
    if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET and RAZORPAY_KEY_ID != "rzp_test_YourTestKeyHere":
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
    else:
        print("DEBUG: Client not created. Values are missing or still using dummy placeholders.")
        razorpay_client = None
except Exception as e:
    print(f"DEBUG: Razorpay Init Error: {e}")
    razorpay_client = None

@app.post("/api/payment/create-order")
async def create_payment_order(amount: int = Body(..., embed=True)):
    if not razorpay_client:
        print("ERROR: create-order called but razorpay_client is None!")
        raise HTTPException(status_code=500, detail="Razorpay is not configured on server. Add RAZORPAY_KEY_ID and SECRET to .env")
    try:
        data = { "amount": amount * 100, "currency": "INR", "payment_capture": "1" }
        order = razorpay_client.order.create(data=data)
        return {
            "order_id": order["id"], 
            "amount": order["amount"], 
            "currency": order["currency"], 
            "key_id": RAZORPAY_KEY_ID
        }
    except Exception as e:
        print(f"ERROR: Razorpay order.create failed: {e}")
        raise HTTPException(status_code=500, detail=f"Razorpay integration error: {str(e)}")

@app.post("/api/payment/verify")
async def verify_payment(
    razorpay_order_id: str = Body(..., embed=True),
    razorpay_payment_id: str = Body(..., embed=True),
    razorpay_signature: str = Body(..., embed=True)
):
    if not razorpay_client:
         raise HTTPException(status_code=500, detail="Razorpay not configured")

    try:
        razorpay_client.utility.verify_payment_signature({
            'razorpay_order_id': razorpay_order_id,
            'razorpay_payment_id': razorpay_payment_id,
            'razorpay_signature': razorpay_signature
        })
        return {"status": "success", "message": "Payment verified successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Signature verification failed: {str(e)}")

# SMTP Settings
SMTP_EMAIL = os.getenv("SMTP_EMAIL", "parthpatel11.2.1997@gmail.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")

class EmailRequest(BaseModel):
    user_email: str
    company_name: str
    cin: str
    document_type: str

@app.post("/api/send-document-email")
async def send_document_email(req: EmailRequest):
    if not SMTP_PASSWORD:
        return {"status": "simulated", "message": "Email simulated! Add SMTP_PASSWORD to .env to send real emails."}
        
    try:
        msg = EmailMessage()
        msg["Subject"] = f"Your MCA Document for {req.company_name} ({req.document_type})"
        msg["From"] = SMTP_EMAIL
        msg["To"] = req.user_email
        
        msg.set_content(f"""\
Hello,

Thank you for your purchase on MCA Download.

Your document '{req.document_type}' for {req.company_name} (CIN: {req.cin}) is attached or ready for download.
Since we are using a simulated test environment, this is a placeholder email.
In production, your actual PDF/ZIP document would be attached here.

Best Regards,
Team MCA Download
""")
        
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as smtp:
            smtp.login(SMTP_EMAIL, SMTP_PASSWORD)
            smtp.send_message(msg)
            
        return {"status": "success", "message": f"Email sent successfully to {req.user_email}!"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@app.get("/")
async def root():
    return {"message": "MCA Data Hub Backend is running"}

FINANVO_EMAIL = os.getenv("FINANVO_EMAIL", "")
FINANVO_PASSWORD = os.getenv("FINANVO_PASSWORD", "")

async def auto_refresh_token(client: httpx.AsyncClient):
    global FINANVO_API_KEY
    if not FINANVO_EMAIL or not FINANVO_PASSWORD:
        print("ERROR: FINANVO_EMAIL or FINANVO_PASSWORD missing in your .env file!")
        return False
        
    print(f"\n[Auto-Refresh] Starting login for: {FINANVO_EMAIL}")
    print(f"[Auto-Refresh] Token BEFORE Update: {FINANVO_API_KEY[:20]}...{FINANVO_API_KEY[-10:] if len(FINANVO_API_KEY) > 30 else ''}")
    
    try:
        response = await client.post(
            f"{FINANVO_BASE_URL}/user/login",
            json={"email": FINANVO_EMAIL, "password": FINANVO_PASSWORD},
            headers={"App-Origin": "https://mcadownload.com", "Content-Type": "application/json"}
        )
        if response.status_code == 200:
            data = response.json()
            new_token = data.get("token") or data.get("data", {}).get("token")
            if new_token:
                FINANVO_API_KEY = new_token
                update_env_file("FINANVO_API_KEY", new_token)
                os.environ["FINANVO_API_KEY"] = new_token
                
                print(f"[Auto-Refresh] SUCCESS! New token fetched and saved to .env!")
                print(f"[Auto-Refresh] Token AFTER Update:  {new_token[:20]}...{new_token[-10:]}\n")
                return True
            else:
                print(f"ERROR: Login succeed but no token found in JSON: {data}")
        else:
            print(f"ERROR: Finanvo rejected login. Status: {response.status_code}")
            print(f"Server Response: {response.text}\n")
            
    except Exception as e:
        print(f"ERROR: Backend crashed during auto-login: {str(e)}\n")
    return False

async def fetch_with_auth(client: httpx.AsyncClient, url: str, params: dict = None):
    headers = get_auth_headers()
    response = await client.get(url, headers=headers, params=params, timeout=15.0)
    
    # Catch both "token invalid" AND "logged in from another device"
    err_text = str(response.text).lower()
    if response.status_code != 200 and ("token invalid" in err_text or "another device" in err_text):
        print(f"DEBUG: Session lost on {url}, attempting auto-refresh...")
        success = await auto_refresh_token(client)
        if success:
            headers = get_auth_headers()
            response = await client.get(url, headers=headers, params=params, timeout=15.0)
            
    return response

@app.get("/companies")
async def search_companies(
    q: Optional[str] = None,
    status: Optional[str] = None,
    state: Optional[str] = None,
    page: int = 1,
    limit: int = 20
):
    """
    Search for companies by name or CIN.
    """
    if not FINANVO_API_KEY and not FINANVO_EMAIL:
        return {"data": [], "total": 0, "page": page, "limit": limit}

    params = {
        "query": q if q else "",
        "page": page,
        "limit": limit
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await fetch_with_auth(client, f"{FINANVO_BASE_URL}/search/company", params)
            
            if response.status_code != 200:
                print(f"DEBUG: Search Error Status: {response.status_code}")
                return {"data": [], "total": 0, "page": page, "limit": limit}
            
            data = response.json()
            print(f"DEBUG: Raw Data Type: {type(data)}")
            
            companies = []
            total = 0
            
            if isinstance(data, list):
                companies = data
                total = len(data)
            elif isinstance(data, dict):
                # Try common keys
                companies = data.get("companies") or data.get("results") or data.get("data") or []
                total = data.get("total") or data.get("count") or len(companies)
            
            # Normalize fields
            normalized_companies = []
            for c in companies:
                if not isinstance(c, dict): continue
                normalized = {
                    "cin": c.get("cin") or c.get("dataid") or c.get("llpin") or c.get("id", ""),
                    "name": c.get("name") or c.get("companyName") or c.get("company_name", "Unknown"),
                    "status": c.get("status") or c.get("company_status") or "Active",
                    "state": c.get("state") or c.get("registered_state") or "",
                    "category": c.get("category") or c.get("company_type") or "",
                }
                normalized_companies.append(normalized)

            print(f"DEBUG: Normalized {len(normalized_companies)} companies")
            
            return {
                "data": normalized_companies,
                "total": total,
                "page": page,
                "limit": limit
            }
    except httpx.HTTPError as e:
        print(f"DEBUG: HTTP Error from Finanvo: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Finanvo API reached but failed: {str(e)}")
    except Exception as e:
        print(f"DEBUG: Unexpected Exception: {str(e)}")
        # Log the full traceback if possible
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/companies/{cin}")
async def get_company(cin: str):
    """
    Get company profile/master data from Finanvo.
    """
    headers = get_auth_headers()

    
    try:
        async with httpx.AsyncClient() as client:
            # Try getting profile with both CIN and cin params if one fails
            response = await fetch_with_auth(client, f"{FINANVO_BASE_URL}/company/profile", {"CIN": cin, "cin": cin})
            
            if response.status_code != 200:
                print(f"DEBUG: Profile Error: {response.status_code} - {response.text}")
                # Try fallback endpoint if profile fails
                response = await fetch_with_auth(client, f"{FINANVO_BASE_URL}/company/details", {"CIN": cin})
            
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail=f"Finanvo API error: {response.text}")
            
            data = response.json()
            # If data is nested under 'data' key, extract it
            if isinstance(data, dict) and "data" in data:
                return data["data"]
            return data
    except Exception as e:
        print(f"DEBUG: Profile Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/companies/{cin}/charges")
async def get_company_charges(cin: str):
    """
    Get company charges from Finanvo.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await fetch_with_auth(client, f"{FINANVO_BASE_URL}/company/charges", {"CIN": cin})
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/companies/{cin}/filings")
async def get_company_filings(cin: str):
    """
    Get company filings from Finanvo.
    """
    try:
        async with httpx.AsyncClient() as client:
            response = await fetch_with_auth(client, f"{FINANVO_BASE_URL}/company/filings", {"CIN": cin})
            return response.json()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/bulk-lookup")
async def bulk_lookup(cins: str = Query(...)):
    import traceback
    try:
        cin_list = [c.strip() for c in cins.split(",") if c.strip()]
        results = []
        
        async with httpx.AsyncClient() as client:
            tasks = []
            for cin in cin_list:
                tasks.append(fetch_with_auth(client, f"{FINANVO_BASE_URL}/company/profile", {"CIN": cin}))
            
            responses = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, response in enumerate(responses):
                cin = cin_list[i]
                if isinstance(response, Exception):
                    results.append({"cin": cin, "name": "Error", "error": str(response)})
                    continue
                    
                if response.status_code == 200:
                    data = response.json()
                    if isinstance(data, dict) and "data" in data:
                        data = data["data"]
                    
                    results.append({
                        "cin": cin,
                        "name": data.get("name") or data.get("COMPANY_NAME") or data.get("companyName") or "Unknown",
                        "status": data.get("status") or data.get("COMPANY_STATUS") or data.get("company_status") or "Active"
                    })
                else:
                    results.append({"cin": cin, "name": "Not Found", "error": f"Status {response.status_code}"})
                    
        return {"data": results}
    except Exception as e:
        return {"error": str(e), "traceback": traceback.format_exc()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
