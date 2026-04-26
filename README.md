# PR/PO Standardisation Intelligence Dashboard

An enterprise-grade, continuous-learning NLP classification system for SAP Purchase Requisitions (PR) and Purchase Orders (PO). 

![Dashboard Overview](https://i.imgur.com/your-image-here.png) *(You can replace this link with an actual screenshot of your dashboard later)*

## Overview
This platform securely ingests raw SAP exports (`EBAN` and `EKPO` tables) and utilizes a dual-engine architecture (TF-IDF + Logistic Regression alongside an LLM fallback) to automatically standardise vague, misclassified, or blank material descriptions into rigorous industrial categories (e.g., `MECH`, `ELEC`, `CHEM`, `OFFC`).

### Core Features
- **Continuous Machine Learning Loop:** Every human correction in the Review Queue is fed back into a dynamically retraining Logistic Regression model. The model learns organization-specific taxonomy instantly.
- **Client-Side Data Processing:** Uses PapaParse to handle large CSV dumps quickly within the browser, ensuring rapid UI feedback.
- **AI Insights Generation:** Automatically surfaces statistical anomalies, departmental issue rates, and misclassification patterns (e.g., `SAFE` → `ITEQ`).
- **Data Quality Tracking:** Monitors the historical Baseline vs Current data quality, proving the ROI of analyst feedback.

## Tech Stack
- **Backend:** Python, Flask, Pandas, Scikit-learn, Gunicorn
- **Frontend:** HTML5, CSS3, Vanilla JavaScript, Chart.js
- **Machine Learning:** `TfidfVectorizer`, `LogisticRegression`
- **LLM Integration:** Groq API (`llama-3.3-70b-versatile`)

## Local Development
1. Clone the repository: `git clone https://github.com/MPG2003/pr-po-dashboard.git`
2. Install dependencies: `pip install -r requirements.txt`
3. Set your API Key: `export GROQ_API_KEY="your-key-here"` (Linux/Mac) or `$env:GROQ_API_KEY="your-key-here"` (Windows PowerShell)
4. Run the server: `python app.py`
5. Open `http://localhost:8080` in your browser.

## Deployment (Railway)
This application is fully containerized and production-ready for deployment on [Railway.app](https://railway.app/). 
1. Link this repository to Railway.
2. The `Procfile` will automatically bind Gunicorn to the correct exposed `$PORT`.
3. Ensure you add `GROQ_API_KEY` to your Railway Project Variables.

---
*Developed for internal industrial procurement data standardisation.*
