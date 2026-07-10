import os
import sqlite3
import json
import numpy as np
import pandas as pd
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from train_model import train_model_pipeline, CITIES, LOCATIONS, LOCATION_MULTIPLIERS, CITY_BASE_PRICES

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend cross-origin requests

DB_PATH = "backend/database.db"
MODEL_PATH = "backend/models/house_model.joblib"
METADATA_PATH = "backend/models/model_metadata.joblib"
DATASET_PATH = "backend/data/housing_dataset.csv"

# Ensure directories exist
os.makedirs("backend", exist_ok=True)
os.makedirs("backend/models", exist_ok=True)

# Global variables to hold model
model_pipeline = None
model_metadata = None

def init_db():
    """Initializes the SQLite database and creates tables if they don't exist."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Create Users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Create Prediction History Logs table (with inputs_json to reload reports)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS prediction_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        city TEXT,
        location TEXT,
        bhk INTEGER,
        carpet_area INTEGER,
        predicted_price INTEGER,
        confidence_score REAL,
        algorithm TEXT,
        inputs_json TEXT
    )
    """)
    
    # Create Saved Properties table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS saved_properties (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_email TEXT,
        title TEXT,
        price INTEGER,
        location TEXT,
        city TEXT,
        bhk INTEGER,
        bathrooms INTEGER,
        rating REAL,
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create Feedback table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feedback (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        email TEXT,
        message TEXT,
        rating INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create Contact Messages table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Insert default admin user if not exists (hashed password)
    cursor.execute("SELECT * FROM users WHERE email='admin@smartpredict.ai'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ("System Admin", "admin@smartpredict.ai", generate_password_hash("admin123"), "admin")
        )
    
    # Insert default regular user if not exists (hashed password)
    cursor.execute("SELECT * FROM users WHERE email='user@smartpredict.ai'")
    if not cursor.fetchone():
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ("John Doe", "user@smartpredict.ai", generate_password_hash("user123"), "user")
        )
        
    conn.commit()
    conn.close()
    print("SQLite database initialized successfully.")

def load_ml_model():
    """Loads the trained machine learning model or trains a new one if missing."""
    global model_pipeline, model_metadata
    
    if not os.path.exists(MODEL_PATH):
        print("Model file not found. Running training pipeline to generate default model...")
        try:
            model_metadata = train_model_pipeline(algorithm="Random Forest")
        except Exception as e:
            print(f"Error during default model training: {e}")
            return
            
    try:
        model_pipeline = joblib.load(MODEL_PATH)
        model_metadata = joblib.load(METADATA_PATH)
        print(f"Loaded ML model: {model_metadata['algorithm']} (Accuracy: {model_metadata['accuracy']}%)")
    except Exception as e:
        print(f"Error loading model: {e}")

# Initialize DB and Load ML model
init_db()
load_ml_model()

# Helper: Format currency in Indian format (Lakhs/Crores)
def format_inr(price_in_rs):
    if price_in_rs >= 10000000:  # 1 Crore
        crores = price_in_rs / 10000000
        return f"₹ {crores:.2f} Cr"
    elif price_in_rs >= 100000:  # 1 Lakh
        lakhs = price_in_rs / 100000
        return f"₹ {lakhs:.2f} L"
    else:
        return f"₹ {price_in_rs:,}"

# Helper: Generate custom response metrics
def calculate_scores(inputs, predicted_price):
    city = inputs.get("City", "Mumbai")
    loc = inputs.get("Location", "Bandra")
    age = int(inputs.get("Property Age", 5))
    bhk = int(inputs.get("BHK", 2))
    pool = int(inputs.get("Swimming Pool", 0))
    gym = int(inputs.get("Gym", 0))
    security = int(inputs.get("Security", 0))
    metro = int(inputs.get("Nearby Metro", 0))
    road = int(inputs.get("Road Width", 30))
    
    # Property Score (0-100) based on BHK, age, amenities
    prop_score = 50 + bhk * 5 - min(15, age * 0.7) + pool * 8 + gym * 7 + security * 5 + (5 if road >= 40 else 0)
    prop_score = round(min(100, max(20, prop_score)), 1)
    
    # Investment Score (0-10) based on location connectivity, infra, and price attractiveness
    loc_multiplier = LOCATION_MULTIPLIERS.get(loc, 1.0)
    growth_index = 6.0 + (1.5 if metro else 0.5) + (1.0 if road >= 40 else 0) + (0.5 if loc_multiplier < 1.5 else -0.5)
    investment_score = round(min(10.0, max(3.0, growth_index + np.random.uniform(-0.3, 0.3))), 1)
    
    # Future Growth Appreciation (over 10 years, starting base compounding rate)
    appreciation_base = 5.0 + (3.0 if loc_multiplier < 1.3 else 1.5) + (2.0 if metro else 0)
    appreciation_rates = {
        "1 Yr": round(appreciation_base + np.random.uniform(-0.5, 0.5), 1),
        "3 Yr": round(appreciation_base * 3 + np.random.uniform(-1.0, 1.5), 1),
        "5 Yr": round(appreciation_base * 5 + np.random.uniform(-1.5, 2.5), 1),
        "10 Yr": round(appreciation_base * 11 + np.random.uniform(-3.0, 4.0), 1)
    }
    
    # Rental Yield (annualized rent / price)
    rental_yield = 2.5 + (1.5 if loc_multiplier < 1.0 else 0.5) + (0.5 if metro else 0) - (0.5 if prop_score > 80 else 0)
    rental_yield = round(min(6.5, max(1.8, rental_yield)), 2)
    
    # Price Range (Margin of Error based on accuracy)
    accuracy_pct = model_metadata.get("accuracy", 90.0) if model_metadata else 90.0
    err_margin = max(0.04, min(0.20, (100.0 - accuracy_pct) / 100.0))
    min_price = int(predicted_price * (1 - err_margin))
    max_price = int(predicted_price * (1 + err_margin))
    
    return {
        "property_score": prop_score,
        "investment_score": investment_score,
        "appreciation_rates": appreciation_rates,
        "rental_yield": rental_yield,
        "min_price": min_price,
        "max_price": max_price,
        "confidence_score": round(accuracy_pct + np.random.uniform(-1.5, 1.0), 1)
    }

# Status endpoint
@app.route("/api/status", methods=["GET"])
def get_status():
    global model_metadata
    dataset_exists = os.path.exists(DATASET_PATH)
    dataset_rows = 0
    if dataset_exists:
        try:
            df = pd.read_csv(DATASET_PATH)
            dataset_rows = len(df)
        except Exception:
            pass
            
    return jsonify({
        "status": "online",
        "model_loaded": model_pipeline is not None,
        "model_info": model_metadata,
        "dataset_rows": dataset_rows,
        "db_connected": True
    })

# Prediction endpoint
@app.route("/api/predict", methods=["POST"])
def predict():
    global model_pipeline
    if model_pipeline is None:
        return jsonify({"error": "Machine learning model is not loaded. Train the model first."}), 500
        
    try:
        inputs = request.json
        if not inputs:
            return jsonify({"error": "Invalid request body."}), 400
            
        # Extract features for ML model input format matching df columns in train_model
        input_data = {
            "City": [inputs.get("City", "Mumbai")],
            "Location": [inputs.get("Location", "Bandra")],
            "Carpet Area": [int(inputs.get("Carpet Area", 800))],
            "Built-up Area": [int(inputs.get("Built-up Area", 960))],
            "Super Built-up Area": [int(inputs.get("Super Built-up Area", 1200))],
            "BHK": [int(inputs.get("BHK", 2))],
            "Bathrooms": [int(inputs.get("Bathrooms", 2))],
            "Balcony": [int(inputs.get("Balcony", 1))],
            "Parking": [int(inputs.get("Parking", 1))],
            "Floor": [int(inputs.get("Floor", 5))],
            "Total Floors": [int(inputs.get("Total Floors", 10))],
            "Property Age": [int(inputs.get("Property Age", 5))],
            "Facing": [inputs.get("Facing", "East")],
            "Property Type": [inputs.get("Property Type", "Apartment")],
            "Furnishing": [inputs.get("Furnishing", "Semi-Furnished")],
            "Power Backup": [int(inputs.get("Power Backup", 1))],
            "Lift": [int(inputs.get("Lift", 1))],
            "Security": [int(inputs.get("Security", 1))],
            "Swimming Pool": [int(inputs.get("Swimming Pool", 0))],
            "Gym": [int(inputs.get("Gym", 0))],
            "Garden": [int(inputs.get("Garden", 1))],
            "Nearby Metro": [int(inputs.get("Nearby Metro", 1))],
            "Nearby Hospital": [int(inputs.get("Nearby Hospital", 1))],
            "Nearby School": [int(inputs.get("Nearby School", 1))],
            "Nearby Mall": [int(inputs.get("Nearby Mall", 1))],
            "Road Width": [int(inputs.get("Road Width", 30))],
            "Corner Property": [int(inputs.get("Corner Property", 0))],
            "East Facing": [int(inputs.get("East Facing", 1 if inputs.get("Facing") == "East" else 0))],
            "Latitude": [float(inputs.get("Latitude", 19.0760))],
            "Longitude": [float(inputs.get("Longitude", 72.8777))]
        }
        
        # Convert to DataFrame
        input_df = pd.DataFrame(input_data)
        
        # Make Prediction
        pred = model_pipeline.predict(input_df)
        predicted_price = int(pred[0])
        
        # Calculate other outputs
        scores = calculate_scores(inputs, predicted_price)
        
        # Save prediction request in SQLite
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO prediction_logs 
            (user_email, city, location, bhk, carpet_area, predicted_price, confidence_score, algorithm, inputs_json)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            inputs.get("user_email", "guest@smartpredict.ai"),
            inputs.get("City"),
            inputs.get("Location"),
            int(inputs.get("BHK", 2)),
            int(inputs.get("Carpet Area", 800)),
            predicted_price,
            scores["confidence_score"],
            model_metadata.get("algorithm", "Random Forest") if model_metadata else "Random Forest",
            json.dumps(inputs)
        ))
        conn.commit()
        conn.close()
        
        # Prepare response package
        response = {
            "predicted_price": predicted_price,
            "formatted_price": format_inr(predicted_price),
            "price_range_min": scores["min_price"],
            "price_range_max": scores["max_price"],
            "formatted_min": format_inr(scores["min_price"]),
            "formatted_max": format_inr(scores["max_price"]),
            "confidence_score": scores["confidence_score"],
            "property_score": scores["property_score"],
            "investment_score": scores["investment_score"],
            "rental_yield": scores["rental_yield"],
            "appreciation_rates": scores["appreciation_rates"],
            "market_rating": "Strong Buy" if scores["investment_score"] >= 8.0 else ("Accumulate" if scores["investment_score"] >= 6.5 else "Hold"),
            "inputs": inputs
        }
        
        return jsonify(response)
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({"error": f"Failed to run predictions: {str(e)}"}), 500

# Property Recommendations endpoint
@app.route("/api/recommendations", methods=["GET"])
def get_recommendations():
    city = request.args.get("city", "Mumbai")
    bhk = request.args.get("bhk")
    
    # Generate 4 recommended property assets with high investment scores
    recs = []
    
    locations_list = LOCATIONS.get(city, LOCATIONS["Mumbai"])
    
    # Set default values for synthetic recommended properties
    for idx, loc in enumerate(locations_list[:4]):
        bhk_val = int(bhk) if bhk else (2 + (idx % 2))
        base_rate = CITY_BASE_PRICES.get(city, 10000) * LOCATION_MULTIPLIERS.get(loc, 1.0)
        area = bhk_val * 450
        price = int(area * base_rate * (1.1 + idx * 0.05))
        
        # Images representing modern flats
        images = [
            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
            "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=600&q=80"
        ]
        
        recs.append({
            "id": f"rec_{idx}",
            "title": f"Premium {bhk_val} BHK Flat in {loc}",
            "price": price,
            "formatted_price": format_inr(price),
            "location": loc,
            "city": city,
            "bhk": bhk_val,
            "bathrooms": bhk_val if bhk_val <= 3 else 3,
            "rating": round(4.2 + (idx * 0.2), 1),
            "investment_score": round(8.2 + (idx * 0.4) if idx < 3 else 7.5, 1),
            "growth_rate": f"+{round(8.5 + idx * 1.5, 1)}% YoY",
            "image_url": images[idx % len(images)],
            "reason": "Highly Recommended due to upcoming metro line connectivity and high developer demand."
        })
        
    return jsonify(recs)

# Compare Properties endpoint
@app.route("/api/compare", methods=["POST"])
def compare_properties():
    try:
        data = request.json
        prop_a = data.get("property_a")
        prop_b = data.get("property_b")
        
        if not prop_a or not prop_b:
            return jsonify({"error": "Both property A and property B are required for comparison."}), 400
            
        # Simple scorer logic to determine winner
        score_a = int(prop_a.get("BHK", 2)) * 10 + int(prop_a.get("Carpet Area", 800)) * 0.05 + int(prop_a.get("Parking", 0)) * 5
        score_b = int(prop_b.get("BHK", 2)) * 10 + int(prop_b.get("Carpet Area", 800)) * 0.05 + int(prop_b.get("Parking", 0)) * 5
        
        # Multiply by location modifier
        loc_a = prop_a.get("Location", "Bandra")
        loc_b = prop_b.get("Location", "Andheri")
        mult_a = LOCATION_MULTIPLIERS.get(loc_a, 1.0)
        mult_b = LOCATION_MULTIPLIERS.get(loc_b, 1.0)
        
        rating_a = round(5.0 + mult_a * 2.0 + np.random.uniform(0.1, 0.5), 1)
        rating_b = round(5.0 + mult_b * 2.0 + np.random.uniform(0.1, 0.5), 1)
        
        winner = "Property A" if (score_a * mult_a) > (score_b * mult_b) else "Property B"
        
        pros_a = ["Premium layout location" if mult_a >= 1.5 else "Cost effective", "Spacious area"]
        cons_a = ["Higher pricing" if mult_a >= 1.5 else "Older construction age"]
        
        pros_b = ["Premium layout location" if mult_b >= 1.5 else "Cost effective", "Near public amenities"]
        cons_b = ["Higher pricing" if mult_b >= 1.5 else "Older construction age"]
        
        return jsonify({
            "winner": winner,
            "rating_a": rating_a,
            "rating_b": rating_b,
            "pros_a": pros_a,
            "cons_a": cons_a,
            "pros_b": pros_b,
            "cons_b": cons_b
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Analytics endpoint
@app.route("/api/analytics", methods=["GET"])
def get_analytics():
    city = request.args.get("city", "Mumbai")
    
    locations = LOCATIONS.get(city, LOCATIONS["Mumbai"])
    base_rate = CITY_BASE_PRICES.get(city, 10000)
    
    loc_prices = {}
    for loc in locations:
        loc_prices[loc] = int(base_rate * LOCATION_MULTIPLIERS.get(loc, 1.0))
        
    sorted_locs = sorted(loc_prices.items(), key=lambda x: x[1], reverse=True)
    
    # Gather logs history count
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT COUNT(*), AVG(predicted_price) FROM prediction_logs")
    log_stats = cursor.fetchone()
    total_predictions = log_stats[0] if log_stats[0] else 125  # Mock baseline if db empty
    avg_predicted_price = int(log_stats[1]) if log_stats[1] else 18500000
    conn.close()
    
    # Market growth charts data
    historical_trends = [
        {"year": "2022", "avg_rate": int(base_rate * 0.85)},
        {"year": "2023", "avg_rate": int(base_rate * 0.90)},
        {"year": "2024", "avg_rate": int(base_rate * 0.95)},
        {"year": "2025", "avg_rate": int(base_rate * 1.0)},
        {"year": "2026", "avg_rate": int(base_rate * 1.08)}
    ]
    
    return jsonify({
        "total_predictions": total_predictions,
        "average_predicted_price": avg_predicted_price,
        "formatted_average_price": format_inr(avg_predicted_price),
        "most_expensive_area": f"{sorted_locs[0][0]} ({format_inr(sorted_locs[0][1]*1000)}/1000 sqft)",
        "cheapest_area": f"{sorted_locs[-1][0]} ({format_inr(sorted_locs[-1][1]*1000)}/1000 sqft)",
        "accuracy": model_metadata.get("accuracy", 91.5) if model_metadata else 91.5,
        "trending_locations": locations[:3],
        "location_prices": [{"location": loc, "average_rate_sqft": price} for loc, price in loc_prices.items()],
        "historical_trends": historical_trends
    })

# Admin: Retrain ML model endpoint
@app.route("/api/admin/retrain", methods=["POST"])
def retrain_model():
    try:
        data = request.json or {}
        algorithm = data.get("algorithm", "Random Forest")
        
        # Run retraining in train_model.py
        new_metadata = train_model_pipeline(algorithm=algorithm)
        
        # Reload newly trained model
        load_ml_model()
        
        return jsonify({
            "success": True,
            "message": f"Successfully retrained model with {algorithm}.",
            "metadata": new_metadata
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Admin: Upload CSV dataset endpoint
@app.route("/api/admin/upload-csv", methods=["POST"])
def upload_csv():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request."}), 400
            
        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected."}), 400
            
        if not file.filename.endswith(".csv"):
            return jsonify({"error": "Only CSV files are supported."}), 400
            
        # In a real app we save the file and parse it. Let's load the file into pandas to validate.
        df_uploaded = pd.read_csv(file.stream)
        
        # Verify required columns exist
        required_cols = ["City", "Location", "Carpet Area", "BHK", "Price"]
        missing_cols = [col for col in required_cols if col not in df_uploaded.columns]
        
        if missing_cols:
            return jsonify({"error": f"Invalid dataset. Missing required columns: {', '.join(missing_cols)}"}), 400
            
        # Append to our local csv or replace it
        df_uploaded.to_csv(DATASET_PATH, index=False)
        
        # Retrain the model on new uploaded dataset
        new_metadata = train_model_pipeline(data_path=DATASET_PATH, algorithm=model_metadata.get("algorithm", "Random Forest") if model_metadata else "Random Forest")
        load_ml_model()
        
        return jsonify({
            "success": True,
            "message": f"Successfully uploaded CSV dataset with {len(df_uploaded)} rows and retrained active model.",
            "metadata": new_metadata
        })
    except Exception as e:
        return jsonify({"error": f"Failed to upload and train: {str(e)}"}), 500

# Saved predictions history log
# Saved predictions history log
@app.route("/api/predictions-history", methods=["GET"])
def get_prediction_history():
    email = request.args.get("email")
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        if email:
            cursor.execute("SELECT * FROM prediction_logs WHERE user_email=? ORDER BY timestamp DESC LIMIT 20", (email,))
        else:
            cursor.execute("SELECT * FROM prediction_logs ORDER BY timestamp DESC LIMIT 20")
        logs = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        # Format the numbers for readability
        for log in logs:
            log["formatted_price"] = format_inr(log["predicted_price"])
            if log.get("inputs_json"):
                try:
                    log["inputs"] = json.loads(log["inputs_json"])
                except Exception:
                    log["inputs"] = None
            
        return jsonify(logs)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Auth: Login endpoint (with password hashing check)
@app.route("/api/auth/login", methods=["POST"])
def auth_login():
    data = request.json or {}
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400
        
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email=?", (email,))
    user = cursor.fetchone()
    conn.close()
    
    if user and check_password_hash(user["password"], password):
        user_dict = dict(user)
        user_dict.pop("password")  # Remove password hash from response
        return jsonify({"success": True, "user": user_dict})
    else:
        return jsonify({"success": False, "error": "Invalid email or password."}), 401

# Auth: Register endpoint (with password hashing and validation)
@app.route("/api/auth/register", methods=["POST"])
def auth_register():
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    password = data.get("password")
    
    if not name or not email or not password:
        return jsonify({"error": "Name, email, and password are required."}), 400
        
    # Basic email validation
    if "@" not in email or "." not in email:
        return jsonify({"success": False, "error": "Invalid email address format."}), 400
        
    if len(password) < 6:
        return jsonify({"success": False, "error": "Password must be at least 6 characters long."}), 400
        
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        
        # Check duplicate email beforehand
        cursor.execute("SELECT id FROM users WHERE email=?", (email,))
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": False, "error": "An account with this email already exists."}), 400
            
        hashed_password = generate_password_hash(password)
        cursor.execute(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            (name, email, hashed_password, "user")
        )
        conn.commit()
        
        # Query newly created user
        cursor.execute("SELECT id, name, email, role, created_at FROM users WHERE email=?", (email,))
        user_row = cursor.fetchone()
        conn.close()
        
        user_dict = {
            "id": user_row[0],
            "name": user_row[1],
            "email": user_row[2],
            "role": user_row[3],
            "created_at": user_row[4]
        }
        return jsonify({"success": True, "user": user_dict})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

# Feedback Form submission
@app.route("/api/feedback", methods=["POST"])
def post_feedback():
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    message = data.get("message")
    rating = int(data.get("rating", 5))
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO feedback (name, email, message, rating) VALUES (?, ?, ?, ?)",
            (name, email, message, rating)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Feedback submitted successfully."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Contact Us message submission
@app.route("/api/contact", methods=["POST"])
def post_contact():
    data = request.json or {}
    name = data.get("name")
    email = data.get("email")
    subject = data.get("subject")
    message = data.get("message")
    
    if not name or not email or not subject or not message:
        return jsonify({"error": "All fields (name, email, subject, message) are required."}), 400
        
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
            (name, email, subject, message)
        )
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Contact message recorded."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Wishlist: get saved properties
@app.route("/api/wishlist", methods=["GET"])
def get_wishlist():
    email = request.args.get("email", "user@smartpredict.ai")
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM saved_properties WHERE user_email=?", (email,))
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()
        
        for item in items:
            item["formatted_price"] = format_inr(item["price"])
            
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Wishlist: save property
@app.route("/api/wishlist", methods=["POST"])
def add_to_wishlist():
    data = request.json or {}
    email = data.get("email", "user@smartpredict.ai")
    title = data.get("title", "Premium Apartment")
    price = int(data.get("price", 15000000))
    location = data.get("location", "Bandra")
    city = data.get("city", "Mumbai")
    bhk = int(data.get("bhk", 2))
    bathrooms = int(data.get("bathrooms", 2))
    rating = float(data.get("rating", 4.5))
    image_url = data.get("image_url", "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80")
    
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        # Check if already saved
        cursor.execute("SELECT id FROM saved_properties WHERE user_email=? AND title=?", (email, title))
        if cursor.fetchone():
            conn.close()
            return jsonify({"success": True, "message": "Property already in wishlist."})
            
        cursor.execute("""
            INSERT INTO saved_properties (user_email, title, price, location, city, bhk, bathrooms, rating, image_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (email, title, price, location, city, bhk, bathrooms, rating, image_url))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Property added to wishlist."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Wishlist: remove property
@app.route("/api/wishlist/<int:property_id>", methods=["DELETE"])
def remove_from_wishlist(property_id):
    try:
        conn = sqlite3.connect(DB_PATH)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM saved_properties WHERE id=?", (property_id,))
        conn.commit()
        conn.close()
        return jsonify({"success": True, "message": "Property removed from wishlist."})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Admin: fetch contact submissions
@app.route("/api/admin/contacts", methods=["GET"])
def get_admin_contacts():
    try:
        conn = sqlite3.connect(DB_PATH)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM contact_messages ORDER BY created_at DESC")
        items = [dict(row) for row in cursor.fetchall()]
        conn.close()
        return jsonify(items)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    # Load 22-city ML model parameters for India & Andhra Pradesh
    app.run(host="0.0.0.0", port=5000, debug=True)
