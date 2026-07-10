import json
import urllib.request
import urllib.error

API_BASE = "http://localhost:5000/api"

def run_test(name, path, method="GET", body=None):
    url = f"{API_BASE}{path}"
    print(f"Testing endpoint: {name} ({method} {path})")
    
    headers = {"Content-Type": "application/json"}
    data = json.dumps(body).encode("utf-8") if body else None
    
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req) as res:
            status = res.status
            content = res.read().decode("utf-8")
            data = json.loads(content)
            print(f"  [SUCCESS] Status: {status}")
            return True, data
    except urllib.error.HTTPError as e:
        print(f"  [FAILED] HTTP Error {e.code}: {e.read().decode('utf-8')}")
        return False, None
    except urllib.error.URLError as e:
        print(f"  [ERROR] Cannot connect to API gateway: {e.reason}")
        return False, None

def test_integration():
    print("="*60)
    print("SMARTPREDICT AI - BACKEND API GATEWAY INTEGRATION HEALTH CHECK")
    print("="*60)
    
    # 1. Status Check
    status_ok, status_data = run_test("System Gateway Status", "/status")
    if not status_ok:
        print("\n[CRITICAL] Backend server is offline. Please launch `python backend/app.py` first.")
        return
        
    print(f"  System gateway reports: {status_data.get('status')}")
    print(f"  ML model active: {status_data.get('model_loaded')}")
    
    # 2. Registration API Test
    new_user = {
        "name": "Integration Tester",
        "email": "tester@smartpredict.ai",
        "password": "testerpassword"
    }
    reg_ok, reg_data = run_test("User Registration", "/auth/register", "POST", new_user)
    if reg_ok:
        print(f"  Registration Success: {reg_data.get('success')}")
        print(f"  Registered Account: {reg_data.get('user', {}).get('email')}")
        
    # 3. Login API Test
    login_credentials = {
        "email": "tester@smartpredict.ai",
        "password": "testerpassword"
    }
    log_ok, log_data = run_test("User Hashed Login", "/auth/login", "POST", login_credentials)
    if log_ok:
        print(f"  Login Success: {log_data.get('success')}")
        print(f"  User Session Name: {log_data.get('user', {}).get('name')}")
        
    # 4. Contact Message API Test
    contact_payload = {
        "name": "Alex Mercer",
        "email": "alex@mercer.com",
        "subject": "Major Project Collaboration",
        "message": "Interested in integrating the Random Forest pipeline with other APIs."
    }
    contact_ok, contact_data = run_test("Contact Us Form Submission", "/contact", "POST", contact_payload)
    if contact_ok:
        print(f"  Contact Saved Status: {contact_data.get('success')}")
        
    # 5. Prediction Endpoint Test
    sample_property = {
        "City": "Mumbai",
        "Location": "Bandra",
        "Carpet Area": 800,
        "BHK": 2,
        "Bathrooms": 2,
        "Balcony": 1,
        "Parking": 1,
        "Property Age": 5,
        "Facing": "East",
        "Property Type": "Apartment",
        "Furnishing": "Semi-Furnished",
        "Nearby Metro": 1,
        "Nearby School": 1,
        "Nearby Hospital": 1,
        "Road Width": 30,
        "user_email": "tester@smartpredict.ai"
    }
    pred_ok, pred_data = run_test("Property Inference Valuation", "/predict", "POST", sample_property)
    if pred_ok:
        print(f"  Predicted Valuation: {pred_data.get('formatted_price').replace('₹', 'Rs.')}")
        print(f"  Confidence Rating: {pred_data.get('confidence_score')}%")
        print(f"  Investment index: {pred_data.get('investment_score')}/10 ({pred_data.get('market_rating')})")
        
    # 6. Recommendations Endpoint Test
    rec_ok, rec_data = run_test("Asset Recommendations List", "/recommendations?city=Mumbai")
    if rec_ok:
        print(f"  Recommendations retrieved: {len(rec_data)} entries.")
            
    # 7. Property A/B Compare Test
    comparison_data = {
        "property_a": sample_property,
        "property_b": {**sample_property, "Location": "Andheri", "Carpet Area": 1000}
    }
    comp_ok, comp_data = run_test("Property A/B Comparison Matrix", "/compare", "POST", comparison_data)
    if comp_ok:
        print(f"  Comparative Winner: {comp_data.get('winner')}")
        
    # 8. History logs
    logs_ok, logs_data = run_test("User-Specific Prediction history", "/predictions-history?email=tester@smartpredict.ai")
    if logs_ok:
        print(f"  Tester history log count: {len(logs_data)}")
        if logs_data:
            print(f"  First item inputs location: {logs_data[0].get('location')}")
        
    print("="*60)
    print("INTEGRATION HEALTH CHECK COMPLETE")
    print("="*60)

if __name__ == "__main__":
    test_integration()
