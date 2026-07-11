# AI-Powered Smart House Price Prediction & Property Recommendation System (SmartPredict AI)

🚀 **Live Production Site**: [smarthousepriceprediction.vercel.app](https://smarthousepriceprediction.vercel.app)  
⚙️ **Live Backend API**: [smart-house-price-predictor-api.onrender.com](https://smart-house-price-predictor-api.onrender.com)  
👤 **Developer Credit**: Designed & Developed by Shamitha Tadepalli

---

## 📖 Project Overview
**SmartPredict AI** is an advanced, end-to-end real estate evaluation platform designed to automate and standardize property valuations. The system replaces subjective and slow manual appraisals with a high-performance **Random Forest Regressor** trained on historical housing transactions. It also incorporates a content-based recommendation engine to calculate similarity indices and suggest properties to buyers.

---

## 🌟 Key Features
*   **AI Price Prediction Engine**: Estimates property market values based on built-up square footage, BHK configurations, bathroom-to-balcony ratios, and neighborhood location tiers.
*   **Geographic Visual Mapping**: Captures neighborhood coordinate profiles and plots them on an interactive **Leaflet map**.
*   **A/B Comparisons**: Compares two structural configurations side-by-side with automatic layout metrics and pricing variance calculations.
*   **Property Recommendation Matcher**: Runs cosine similarity calculations against active housing listings to suggest matching properties.
*   **Admin Control Terminal**: A secure administrator dashboard that displays active model metrics, shows contact message histories, accepts fresh CSV transaction database uploads, and triggers real-time model retraining.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Framer Motion, Leaflet Maps, Lucide Icons |
| **Backend** | Python 3.10, Flask, Flask-CORS, Gunicorn WSGI Server |
| **Database** | SQLite3 (Relational Logging & Accounts Database) |
| **Machine Learning** | Scikit-Learn, Random Forest, Cosine Similarity, Pandas, NumPy, Joblib |
| **Deployment** | Vercel (Frontend), Render (Backend + Persistent Disk Mount) |

---

## 🔑 Admin Login Credentials
To access the secure **Admin Gateway** at `/admin` (or `/admin-login`):
*   **Administrator Email**: `admin@smartpredict.ai`
*   **Master Password**: `admin123`

---

## 💻 Local Installation & Setup

### Prerequisites
*   Python 3.10.x
*   Node.js (v18.0.0 or higher)

### 1. Backend Setup (Flask Server)
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a Python virtual environment:
   ```bash
   python -m venv venv
   # On Windows:
   .\venv\Scripts\activate
   # On Linux/macOS:
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the Flask development server:
   ```bash
   python app.py
   ```
   *The API will run locally at `http://localhost:5000`.*

### 2. Frontend Setup (React Application)
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Run the Vite development server:
   ```bash
   npm run dev
   ```
   *The application will run locally at `http://localhost:5173`.*

---

## 🗄️ Database Schema Design
*   **`users`**: Manages credentials, password hashes (`scrypt`), and roles.
*   **`predictions_history`**: Logs transaction data and prediction runs.
*   **`contact_messages`**: Stores feedback and support tickets.
*   **`wishlist`**: Manages property bookmarks for user profiles.

---

## 📜 License
This project is prepared as an academic submission for the Master of Computer Applications (MCA) degree. All rights reserved.
