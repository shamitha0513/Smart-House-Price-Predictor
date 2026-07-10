# AI-Powered Smart House Price Prediction and Property Recommendation System - Implementation Plan

## Goal Description
Build a modern, premium, fully responsive, commercial-grade web application for predicting house prices, comparing properties, analyzing real estate trends, and providing AI recommendations. 

This system will have two main components:
1. **Frontend**: A React application created with Vite, styled with Tailwind CSS and custom glassmorphism styling, animated with Framer Motion, and incorporating Recharts for analytics and Leaflet for interactive maps (Leaflet is preferred for local development to avoid Google Maps API key requirements).
2. **Backend**: A Python Flask API server that implements a full machine learning pipeline (training Random Forest and XGBoost regressors using Scikit-learn and XGBoost), manages a SQLite database (for user logs, prediction history, and saved properties), and handles CSV uploads and model retraining.

---

## User Review Required

> [!IMPORTANT]
> **Key Architectural Decisions for Local Execution:**
> - **SQLite Database**: Instead of PostgreSQL/MySQL, we propose using **SQLite** to ensure the project runs out-of-the-box locally without requiring you to install and configure local database servers.
> - **Leaflet Maps**: Instead of Google Maps, we propose using **Leaflet** (via React-Leaflet). Leaflet is open-source, free, and does not require a billing-enabled Google Maps API key, which makes it perfect for local demonstration and MCA project presentations.
> - **Synthetic Dataset Generation**: Since there is no pre-existing dataset in the empty workspace, the backend will automatically generate a highly realistic synthetic housing dataset containing 5,000+ records across major Indian cities (e.g., Mumbai, Delhi, Bangalore, Hyderabad, Pune) with features like carpet area, BHK, balconies, flooring, age, power backup, lift, and nearby amenities to train the machine learning models.

---

## Open Questions

None. The requirements are fully detailed, and the proposed local setup is tailored to ensure maximum reliability and portability.

---

## Proposed Changes

### Backend Component

#### [NEW] [requirements.txt](file:///c:/Users/lenovo/OneDrive/Documents/House%20price%20prediction/backend/requirements.txt)
Define backend packages:
- `flask`, `flask-cors`
- `pandas`, `numpy`, `scikit-learn`, `xgboost`, `joblib`
- `sqlite3` (built-in, no requirement needed)

#### [NEW] [train_model.py](file:///c:/Users/lenovo/OneDrive/Documents/House%20price%20prediction/backend/train_model.py)
A machine learning pipeline script that:
- Generates a synthetic housing dataset with parameters (City, Location, Carpet Area, BHK, Furnishing, Power Backup, Gym, Pool, Near Metro, Age, etc.).
- Preprocesses features (One-hot encoding for categorical data, Standard Scaling for numerical features).
- Trains multiple models: `RandomForestRegressor`, `XGBRegressor`, and `LinearRegression`.
- Evaluates them and saves the best-performing model alongside scalers/encoders using `joblib`.
- Exposes a retraining function that can be triggered dynamically.

#### [NEW] [app.py](file:///c:/Users/lenovo/OneDrive/Documents/House%20price%20prediction/backend/app.py)
The core Flask application exposing the following REST endpoints:
- `POST /api/predict`: Predicts the price of a property, returns confidence interval, investment score, growth prospects, and rental yield.
- `POST /api/compare`: Compares two property objects side-by-side and returns pros, cons, and a recommended "Winner".
- `GET /api/recommendations`: Returns AI-recommended properties based on search profiles and growth parameters.
- `GET /api/analytics`: Computes city-wide and location-wide statistics (average pricing, trending spots, supply/demand metrics).
- `POST /api/admin/retrain`: Triggers `train_model.py` with selected algorithm (XGBoost, Random Forest, or Linear Regression) and updates the active model.
- `POST /api/admin/upload-csv`: Processes uploaded CSV files to append/replace the active training dataset.
- `POST /api/contact` & `POST /api/feedback`: Processes contact forms and feedback logs.
- SQLite logs: Records every prediction request and user action in a local SQLite file (`database.db`).

---

### Frontend Component

#### [NEW] [package.json](file:///c:/Users/lenovo/OneDrive/Documents/House%20price%20prediction/frontend/package.json)
React frontend dependencies:
- `lucide-react` (icons)
- `recharts` (charts)
- `framer-motion` (animations)
- `react-router-dom` (routing)
- `leaflet` & `react-leaflet` (maps)
- Tailwind CSS styling files

#### [NEW] [src/index.css](file:///c:/Users/lenovo/OneDrive/Documents/House%20price%20prediction/frontend/src/index.css)
Establish the premium theme styles, including glassmorphism classes, custom gradients, scrollbars, and modern font imports (Inter & Outfit).

#### [NEW] [src/App.jsx](file:///c:/Users/lenovo/OneDrive/Documents/House%20price%20prediction/frontend/src/App.jsx)
Main router connecting the following pages:
- **Home**: Hero section, animated stats counters, AI features grid, visual timeline process.
- **Predict Price**: A searchable Multi-step form with 20+ inputs. Incorporates a dynamic loading screen with progress bars and sequential ML steps.
- **Results Dashboard**: Displays prediction outputs, Confidence metrics, Future Price Line Chart, EMI calculator (with custom Pie Chart), Nearby Places Dashboard, and a Leaflet Map with distance badges.
- **Compare**: Screen splitting Property A vs. Property B side-by-side with automatic winner determination and pro/con highlighting.
- **Recommendations**: Personalized property recommendations based on user criteria.
- **Analytics**: Real-time charts covering price trends, demand/supply, appreciation rates, and prediction accuracy.
- **Admin**: Administrative controls to switch/retrain models, upload datasets, and view prediction logs.
- **Profile**: Recently viewed predictions, favorite properties, settings.
- **About & Contact**: Tech stack explanations, ML pipeline architecture, interactive Contact Form, and FAQs.

---

## Verification Plan

### Automated Verification
We will run:
- A health check script (`verify_backend.py`) to verify Flask API server endpoints.
- Front-end build tests (`npm run build`) to ensure React compiles with zero TypeScript/JavaScript compilation errors.

### Manual Verification
1. Run backend: `python app.py` on `http://localhost:5000`.
2. Run frontend dev server: `npm run dev` on `http://localhost:5173`.
3. Fill out the Prediction Form, trigger prediction, watch the loading screen transition, and review the Result Dashboard.
4. Perform an A/B property comparison.
5. Use the Admin Dashboard to retrain the ML model and upload a new dataset.
