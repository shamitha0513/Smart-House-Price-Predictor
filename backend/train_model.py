import os
import numpy as np
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_absolute_error, r2_score

# Try to import XGBoost, fallback to GradientBoosting if not available
try:
    from xgboost import XGBRegressor
    HAS_XGB = True
except ImportError:
    HAS_XGB = False

# Constants for data generation
CITIES = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Pune", "Chennai", "Kolkata", "Ahmedabad", "Jaipur", "Lucknow",
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Tirupati", "Kurnool", "Kakinada", "Rajahmundry", "Kadapa", "Anantapur", "Eluru", "Vizianagaram"
]

LOCATIONS = {
    "Mumbai": ["South Mumbai", "Bandra", "Andheri", "Borivali", "Thane"],
    "Delhi": ["South Delhi", "Dwarka", "Rohini", "Connaught Place", "Noida"],
    "Bangalore": ["Indiranagar", "Whitefield", "Koramangala", "Electronic City", "Jayanagar"],
    "Hyderabad": ["Gachibowli", "Jubilee Hills", "Madhapur", "Kondapur", "Secunderabad"],
    "Pune": ["Koregaon Park", "Kothrud", "Hinjewadi", "Baner", "Wakad"],
    "Chennai": ["Adyar", "Velachery", "OMR", "Anna Nagar", "T Nagar"],
    "Kolkata": ["Salt Lake", "New Town", "Rajarhat", "Tollygunge", "Alipore"],
    "Ahmedabad": ["Satellite", "Bopal", "SG Highway", "Ghatlodia", "Prahlad Nagar"],
    "Jaipur": ["Malviya Nagar", "Vaishali Nagar", "Mansarovar", "Jagatpura", "C-Scheme"],
    "Lucknow": ["Gomti Nagar", "Aliganj", "Hazratganj", "Indira Nagar", "Charbagh"],
    "Visakhapatnam": ["Madhurawada", "Gajuwaka", "MVP Colony", "Rushikonda", "Seethammadhara"],
    "Vijayawada": ["Benz Circle", "Patamata", "Moghalrajpuram", "Kanuru", "Gollapudi"],
    "Guntur": ["Arundelpet", "Lakshmipuram", "Brodipet", "Pattabhipuram", "Gorantla"],
    "Nellore": ["Harnathapuram", "Dargamitta", "Vedayapalem", "Magunta Layout", "Podalakur Road"],
    "Tirupati": ["Alipiri", "TUDA Layout", "Bairagipatteda", "Renigunta Road", "Korlagunta"],
    "Kurnool": ["Budhavarapeta", "Kallur", "C-Camp", "Nandyal Road", "Joharapuram"],
    "Kakinada": ["Bhanugudi Junction", "Ramaraopeta", "Sarpavaram", "NFCL Road", "Pithapuram Road"],
    "Rajahmundry": ["Danavaipeta", "Innespeta", "Morampudi", "Lala Cheruvu", "Ramanayyapeta"],
    "Kadapa": ["RIMS Area", "Yerramukkapalli", "Ravindra Nagar", "Nagarajupet", "Co-operative Colony"],
    "Anantapur": ["Maruthi Nagar", "Rudrampeta", "Housing Board Colony", "Raju Road", "Kalyandurg Road"],
    "Eluru": ["RR Peta", "Powerpet", "Sanivarapupeta", "Vatluru", "Eluru Bypass"],
    "Vizianagaram": ["Cantonment", "Phool Baugh", "Kothavalasa", "KL Puram", "Balaji Nagar"]
}

CITY_BASE_PRICES = {  # Base price per sq ft in INR
    "Mumbai": 25000,
    "Delhi": 12000,
    "Bangalore": 8500,
    "Hyderabad": 7000,
    "Pune": 6500,
    "Chennai": 7500,
    "Kolkata": 6500,
    "Ahmedabad": 5000,
    "Jaipur": 4500,
    "Lucknow": 4500,
    "Visakhapatnam": 6000,
    "Vijayawada": 5500,
    "Guntur": 4500,
    "Nellore": 4000,
    "Tirupati": 4500,
    "Kurnool": 3800,
    "Kakinada": 3800,
    "Rajahmundry": 4000,
    "Kadapa": 3500,
    "Anantapur": 3400,
    "Eluru": 3200,
    "Vizianagaram": 3200
}

LOCATION_MULTIPLIERS = {
    "South Mumbai": 2.5, "Bandra": 1.8, "Andheri": 1.2, "Borivali": 0.9, "Thane": 0.7,
    "South Delhi": 2.0, "Connaught Place": 2.2, "Dwarka": 1.0, "Rohini": 0.8, "Noida": 0.7,
    "Indiranagar": 1.8, "Jayanagar": 1.4, "Koramangala": 1.5, "Whitefield": 0.9, "Electronic City": 0.7,
    "Jubilee Hills": 2.2, "Madhapur": 1.3, "Gachibowli": 1.1, "Kondapur": 0.9, "Secunderabad": 0.8,
    "Koregaon Park": 2.0, "Kothrud": 1.3, "Baner": 1.0, "Wakad": 0.8, "Hinjewadi": 0.7,
    "Adyar": 1.8, "Velachery": 1.2, "OMR": 0.8, "Anna Nagar": 1.5, "T Nagar": 2.0,
    "Salt Lake": 1.5, "New Town": 1.1, "Rajarhat": 0.8, "Tollygunge": 1.0, "Alipore": 2.2,
    "Satellite": 1.5, "Bopal": 0.9, "SG Highway": 1.1, "Ghatlodia": 0.8, "Prahlad Nagar": 1.3,
    "Malviya Nagar": 1.4, "Vaishali Nagar": 1.1, "Mansarovar": 1.0, "Jagatpura": 0.8, "C-Scheme": 2.0,
    "Gomti Nagar": 1.5, "Aliganj": 1.1, "Hazratganj": 2.0, "Indira Nagar": 1.2, "Charbagh": 0.9,
    "Madhurawada": 1.1, "Gajuwaka": 0.9, "MVP Colony": 1.5, "Rushikonda": 1.4, "Seethammadhara": 1.6,
    "Benz Circle": 2.0, "Patamata": 1.4, "Moghalrajpuram": 1.6, "Kanuru": 1.0, "Gollapudi": 0.8,
    "Arundelpet": 1.5, "Lakshmipuram": 1.3, "Brodipet": 1.4, "Pattabhipuram": 1.1, "Gorantla": 0.8,
    "Harnathapuram": 1.4, "Dargamitta": 1.2, "Vedayapalem": 1.0, "Magunta Layout": 1.5, "Podalakur Road": 0.8,
    "Alipiri": 1.6, "TUDA Layout": 1.2, "Bairagipatteda": 1.1, "Renigunta Road": 1.0, "Korlagunta": 0.9,
    "Budhavarapeta": 1.0, "Kallur": 0.9, "C-Camp": 1.3, "Nandyal Road": 1.1, "Joharapuram": 0.8,
    "Bhanugudi Junction": 1.4, "Ramaraopeta": 1.2, "Sarpavaram": 1.0, "NFCL Road": 0.9, "Pithapuram Road": 0.8,
    "Danavaipeta": 1.5, "Innespeta": 1.2, "Morampudi": 1.0, "Lala Cheruvu": 0.9, "Ramanayyapeta": 0.8,
    "RIMS Area": 1.2, "Yerramukkapalli": 1.1, "Ravindra Nagar": 1.0, "Nagarajupet": 1.3, "Co-operative Colony": 1.4,
    "Maruthi Nagar": 1.2, "Rudrampeta": 0.9, "Housing Board Colony": 1.1, "Raju Road": 1.0, "Kalyandurg Road": 0.8,
    "RR Peta": 1.4, "Powerpet": 1.1, "Sanivarapupeta": 0.9, "Vatluru": 0.8, "Eluru Bypass": 1.0,
    "Cantonment": 1.4, "Phool Baugh": 1.1, "Kothavalasa": 0.8, "KL Puram": 1.0, "Balaji Nagar": 1.2
}

CITY_COORDS = {
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Bangalore": (12.9716, 77.5946),
    "Hyderabad": (17.3850, 78.4867),
    "Pune": (18.5204, 73.8567),
    "Chennai": (13.0827, 80.2707),
    "Kolkata": (22.5726, 88.3639),
    "Ahmedabad": (23.0225, 72.5714),
    "Jaipur": (26.9124, 75.7873),
    "Lucknow": (26.8467, 80.9462),
    "Visakhapatnam": (17.6868, 83.2185),
    "Vijayawada": (16.5062, 80.6480),
    "Guntur": (16.3067, 80.4365),
    "Nellore": (14.4426, 79.9865),
    "Tirupati": (13.6288, 79.4192),
    "Kurnool": (15.8281, 78.0373),
    "Kakinada": (16.9891, 82.2475),
    "Rajahmundry": (17.0005, 81.8040),
    "Kadapa": (14.4716, 78.8224),
    "Anantapur": (14.6819, 77.6006),
    "Eluru": (16.7107, 81.1027),
    "Vizianagaram": (18.1124, 83.3989)
}

def generate_synthetic_data(num_samples=5000):
    """Generates realistic synthetic housing data for Indian cities."""
    np.random.seed(42)
    data = []
    
    for _ in range(num_samples):
        city = np.random.choice(CITIES)
        location = np.random.choice(LOCATIONS[city])
        
        # Area and dimensions
        bhk = int(np.random.choice([1, 2, 3, 4, 5], p=[0.2, 0.4, 0.25, 0.1, 0.05]))
        
        # Area ranges based on BHK
        base_carpet_area = bhk * 400 + np.random.randint(-100, 200)
        carpet_area = max(300, base_carpet_area)
        built_up_area = int(carpet_area * 1.2)
        super_built_up_area = int(built_up_area * 1.25)
        
        bathrooms = max(1, bhk + np.random.choice([-1, 0, 1], p=[0.2, 0.6, 0.2]))
        balcony = int(np.random.choice([0, 1, 2, 3], p=[0.2, 0.4, 0.3, 0.1]))
        
        # Property details
        property_type = np.random.choice(["Apartment", "Villa", "Penthouse", "Builder Floor"], p=[0.7, 0.1, 0.05, 0.15])
        furnishing = np.random.choice(["Unfurnished", "Semi-Furnished", "Fully Furnished"], p=[0.3, 0.5, 0.2])
        
        # Floor calculations
        total_floors = int(np.random.choice([4, 7, 10, 15, 20, 30, 40], p=[0.2, 0.2, 0.2, 0.15, 0.1, 0.1, 0.05]))
        if property_type == "Villa":
            total_floors = np.random.choice([1, 2, 3])
        floor = np.random.randint(1, total_floors + 1)
        
        property_age = int(np.random.randint(0, 26))
        facing = np.random.choice(["East", "West", "North", "South"])
        road_width = int(np.random.choice([20, 30, 40, 60, 80], p=[0.1, 0.4, 0.3, 0.15, 0.05]))
        
        # Booleans
        parking = int(np.random.choice([0, 1, 2], p=[0.3, 0.5, 0.2]))
        power_backup = int(np.random.choice([0, 1], p=[0.2, 0.8]))
        lift = int(np.random.choice([0, 1], p=[0.3, 0.7])) if total_floors > 3 else 0
        security = int(np.random.choice([0, 1], p=[0.2, 0.8]))
        swimming_pool = int(np.random.choice([0, 1], p=[0.6, 0.4])) if property_type in ["Villa", "Penthouse"] or total_floors > 10 else 0
        gym = int(np.random.choice([0, 1], p=[0.5, 0.5])) if total_floors > 7 else 0
        garden = int(np.random.choice([0, 1], p=[0.4, 0.6]))
        
        nearby_metro = int(np.random.choice([0, 1], p=[0.3, 0.7]))
        nearby_hospital = int(np.random.choice([0, 1], p=[0.1, 0.9]))
        nearby_school = int(np.random.choice([0, 1], p=[0.1, 0.9]))
        nearby_mall = int(np.random.choice([0, 1], p=[0.4, 0.6]))
        
        corner_property = int(np.random.choice([0, 1], p=[0.8, 0.2]))
        east_facing = 1 if facing == "East" else 0
        
        # Coordinates
        city_lat, city_lon = CITY_COORDS[city]
        latitude = city_lat + np.random.normal(0, 0.05)
        longitude = city_lon + np.random.normal(0, 0.05)
        
        # Price Calculation Logic (Realistic Base)
        base_rate = CITY_BASE_PRICES[city] * LOCATION_MULTIPLIERS[location]
        
        # Modifiers
        rate_modifier = 1.0
        if property_type == "Villa": rate_modifier += 0.25
        elif property_type == "Penthouse": rate_modifier += 0.35
        
        if furnishing == "Fully Furnished": rate_modifier += 0.12
        elif furnishing == "Semi-Furnished": rate_modifier += 0.05
        
        # Amenities
        amenities_score = (power_backup * 0.02 + lift * 0.02 + security * 0.03 + 
                           swimming_pool * 0.05 + gym * 0.04 + garden * 0.02)
        rate_modifier += amenities_score
        
        # Connectivity & Infrastructure
        infra_score = (nearby_metro * 0.05 + nearby_hospital * 0.02 + 
                       nearby_school * 0.02 + nearby_mall * 0.03 + 
                       corner_property * 0.04 + (1 if road_width >= 40 else 0) * 0.03)
        rate_modifier += infra_score
        
        # Age depreciation
        age_depreciation = min(0.3, property_age * 0.015)
        rate_modifier -= age_depreciation
        
        # Final rate per sq ft
        final_rate = base_rate * rate_modifier
        
        # Calculate price based on super built-up area
        price = super_built_up_area * final_rate
        
        # Add random noise (±5%)
        noise = np.random.uniform(-0.05, 0.05)
        price = int(price * (1 + noise))
        
        data.append({
            "City": city,
            "Location": location,
            "Carpet Area": carpet_area,
            "Built-up Area": built_up_area,
            "Super Built-up Area": super_built_up_area,
            "BHK": bhk,
            "Bathrooms": bathrooms,
            "Balcony": balcony,
            "Parking": parking,
            "Floor": floor,
            "Total Floors": total_floors,
            "Property Age": property_age,
            "Facing": facing,
            "Property Type": property_type,
            "Furnishing": furnishing,
            "Power Backup": power_backup,
            "Lift": lift,
            "Security": security,
            "Swimming Pool": swimming_pool,
            "Gym": gym,
            "Garden": garden,
            "Nearby Metro": nearby_metro,
            "Nearby Hospital": nearby_hospital,
            "Nearby School": nearby_school,
            "Nearby Mall": nearby_mall,
            "Road Width": road_width,
            "Corner Property": corner_property,
            "East Facing": east_facing,
            "Latitude": round(latitude, 4),
            "Longitude": round(longitude, 4),
            "Price": price
        })
        
    return pd.DataFrame(data)

def train_model_pipeline(data_path=None, algorithm="Random Forest"):
    """Trains the ML model based on the selected algorithm and saves the components."""
    print(f"Training pipeline started using algorithm: {algorithm}")
    
    # Load dataset
    if data_path and os.path.exists(data_path):
        df = pd.read_csv(data_path)
    else:
        df = generate_synthetic_data(5000)
        # Save synthetic data for future use
        os.makedirs("backend/data", exist_ok=True)
        df.to_csv("backend/data/housing_dataset.csv", index=False)
        print("Generated synthetic dataset and saved to backend/data/housing_dataset.csv")

    # Split features and target
    X = df.drop(columns=["Price"])
    y = df["Price"]

    # Define categorical and numerical features
    categorical_features = ["City", "Location", "Facing", "Property Type", "Furnishing"]
    numerical_features = [
        "Carpet Area", "Built-up Area", "Super Built-up Area", "BHK", "Bathrooms",
        "Balcony", "Parking", "Floor", "Total Floors", "Property Age", "Road Width",
        "Power Backup", "Lift", "Security", "Swimming Pool", "Gym", "Garden",
        "Nearby Metro", "Nearby Hospital", "Nearby School", "Nearby Mall",
        "Corner Property", "East Facing", "Latitude", "Longitude"
    ]

    # Preprocessing pipelines
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numerical_features),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_features)
        ])

    # Choose regressor model
    if algorithm == "XGBoost" and HAS_XGB:
        model = XGBRegressor(n_estimators=150, max_depth=6, learning_rate=0.08, random_state=42)
    elif algorithm == "Linear Regression":
        model = LinearRegression()
    else:  # Default to Random Forest
        model = RandomForestRegressor(n_estimators=100, max_depth=15, min_samples_split=4, random_state=42)
        algorithm = "Random Forest"  # ensure consistency in log

    # Create full pipeline
    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("regressor", model)
    ])

    # Train-test split
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    # Train model
    pipeline.fit(X_train, y_train)

    # Evaluate
    y_pred = pipeline.predict(X_test)
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    accuracy = round(r2 * 100, 2)
    
    print(f"Model Training Completed. MAE: {mae:.2f}, R2 Score: {r2:.4f} (Accuracy: {accuracy}%)")

    # Save components
    os.makedirs("backend/models", exist_ok=True)
    model_filepath = "backend/models/house_model.joblib"
    joblib.dump(pipeline, model_filepath)
    
    # Save training metadata
    metadata = {
        "algorithm": algorithm,
        "accuracy": accuracy,
        "mae": round(mae, 2),
        "dataset_size": len(df),
        "trained_date": pd.Timestamp.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    joblib.dump(metadata, "backend/models/model_metadata.joblib")
    
    print(f"Saved model pipeline to {model_filepath} and metadata.")
    return metadata

if __name__ == "__main__":
    train_model_pipeline(algorithm="Random Forest")
