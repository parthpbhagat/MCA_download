import razorpay
import os
from dotenv import load_dotenv

# Load from .venv in current dir
load_dotenv('.venv')

key_id = os.getenv('RAZORPAY_KEY_ID')
key_secret = os.getenv('RAZORPAY_KEY_SECRET')

print(f"Testing with Key ID: {key_id}")
client = razorpay.Client(auth=(key_id, key_secret))

try:
    order = client.order.create({'amount': 100, 'currency': 'INR'})
    print("SUCCESS: Order created!")
    print(order)
except Exception as e:
    print(f"FAILED: {str(e)}")
