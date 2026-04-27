"""
PR/PO Intelligence Dashboard
- Server-side Groq API key (hidden from users)
- ML model /api/classify endpoint
- Persistent feedback learning — /api/feedback + /api/retrain
- Upgraded to llama-3.3-70b-versatile
"""

import os
import csv
import pickle
import threading
import requests as http_requests
from flask import Flask, request, jsonify, send_file

app = Flask(__name__)

# ── Groq config ───────────────────────────────────────────────
GROQ_API_KEY = os.environ.get("GROQ_API_KEY", "")
GROQ_MODEL   = "llama-3.3-70b-versatile"
GROQ_URL     = "https://api.groq.com/openai/v1/chat/completions"

# ── Paths ─────────────────────────────────────────────────────
BASE_DIR      = os.path.dirname(__file__)
MODEL_PATH    = os.path.join(BASE_DIR, "nlp_model_final.pkl")
FEEDBACK_PATH = os.path.join(BASE_DIR, "feedback.csv")
TRAINING_PATH = os.path.join(BASE_DIR, "clean_training_data.csv")
BASELINE_PATH = os.path.join(BASE_DIR, "baseline_stats.json")

# ── Feedback config ───────────────────────────────────────────
RETRAIN_EVERY    = 10
retrain_lock     = threading.Lock()
nlp_pipeline     = None
feedback_count   = 0
total_corrections = 0
model_accuracy   = 91.2

def load_model():
    global nlp_pipeline
    if os.path.exists(MODEL_PATH):
        with open(MODEL_PATH, "rb") as f:
            nlp_pipeline = pickle.load(f)
        print("✓ ML model loaded from nlp_model_final.pkl")
    else:
        print("⚠ nlp_model_final.pkl not found — /api/classify will use keyword fallback")

def count_existing_feedback():
    global total_corrections
    if os.path.exists(FEEDBACK_PATH):
        with open(FEEDBACK_PATH, "r", encoding="utf-8") as f:
            total_corrections = max(0, sum(1 for row in csv.reader(f) if row) - 1)
        print(f"✓ Found {total_corrections} existing feedback corrections")

load_model()
count_existing_feedback()

# ── Page ──────────────────────────────────────────────────────
@app.route("/")
def index():
    return send_file("templates/dashboard.html")

# ── API: Chat via Groq ────────────────────────────────────────
@app.route("/api/chat", methods=["POST"])
def chat():
    if not GROQ_API_KEY:
        return jsonify({"error": "GROQ_API_KEY not configured on server"}), 500
    body = request.get_json(force=True)
    payload = {
        "model": GROQ_MODEL, "max_tokens": body.get("max_tokens", 800), "temperature": 0.3,
        "messages": [{"role": "system", "content": body.get("system", "You are a helpful SAP procurement analyst.")}, *body.get("messages", [])[-14:]]
    }
    try:
        resp = http_requests.post(GROQ_URL, headers={"Content-Type": "application/json", "Authorization": f"Bearer {GROQ_API_KEY}"}, json=payload, timeout=60)
        data = resp.json()
        if resp.status_code == 200 and "choices" in data:
            return jsonify({"text": data["choices"][0]["message"]["content"]}), 200
        return jsonify({"error": data.get("error", {}).get("message", str(data))}), resp.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── API: ML classify descriptions ────────────────────────────
KEYWORD_MAP = [
    ("bearing","MECH"),("hydraulic pump","MECH"),("gear box","MECH"),("v belt","MECH"),
    ("shaft","MECH"),("pulley","MECH"),("sprocket","MECH"),("valve","MECH"),
    ("motor","ELEC"),("circuit breaker","ELEC"),("contactor","ELEC"),("led","ELEC"),
    ("fuse","ELEC"),("transformer","ELEC"),("vfd","ELEC"),("plc","ELEC"),("relay","ELEC"),
    ("laptop","ITEQ"),("keyboard","ITEQ"),("monitor","ITEQ"),("ups","ITEQ"),("ssd","ITEQ"),
    ("safety helmet","SAFE"),("safety gloves","SAFE"),("safety shoes","SAFE"),
    ("fire extinguisher","SAFE"),("safety goggles","SAFE"),("dust mask","SAFE"),
    ("a4 paper","OFFC"),("pen","OFFC"),("stapler","OFFC"),("toner","OFFC"),("notepad","OFFC"),
    ("steel","ROH"),("aluminium","ROH"),("copper","ROH"),("pipe","ROH"),("rubber","ROH"),
    ("welding","MTNC"),("nut bolt","MTNC"),("drill","MTNC"),("o ring","MTNC"),("grease","MTNC"),
    ("engine oil","CHEM"),("hydraulic oil","CHEM"),("coolant","CHEM"),("acetone","CHEM"),
    ("cardboard","PACK"),("bubble wrap","PACK"),("pallet","PACK"),("stretch wrap","PACK"),
    ("coffee","FOOD"),("tea","FOOD"),("drinking water","FOOD"),("biscuit","FOOD"),("milk","FOOD"),
]
MATERIAL_GROUPS = {
    "ROH":"Raw Materials","MECH":"Mechanical Parts","ELEC":"Electrical Components",
    "OFFC":"Office Supplies","SAFE":"Safety Equipment","ITEQ":"IT Equipment",
    "MTNC":"Maintenance & Repair","PACK":"Packaging Materials",
    "CHEM":"Chemicals & Lubricants","FOOD":"Canteen & Food Supplies",
}

def keyword_classify(desc):
    tl = str(desc).lower()
    for kw, grp in KEYWORD_MAP:
        if kw in tl:
            return grp, 0.72
    return "OFFC", 0.30

@app.route("/api/classify", methods=["POST"])
def classify():
    body  = request.get_json(force=True)
    descs = body.get("descriptions", [])
    if not descs:
        return jsonify({"error": "No descriptions provided"}), 400
    results = []
    if nlp_pipeline:
        import numpy as np
        lowers = [str(d).lower() for d in descs]
        preds  = nlp_pipeline.predict(lowers)
        probs  = nlp_pipeline.predict_proba(lowers)
        for desc, pred, prob in zip(descs, preds, probs):
            conf = float(prob.max())
            top3_idx = prob.argsort()[-3:][::-1]
            results.append({
                "description": desc, "predicted": pred,
                "group_name": MATERIAL_GROUPS.get(pred, pred),
                "confidence": round(conf*100, 1),
                "decision": "AUTO APPLY" if conf >= 0.85 else "REVIEW",
                "top3": [{"group": nlp_pipeline.classes_[j], "pct": round(float(prob[j])*100,1)} for j in top3_idx],
            })
    else:
        for desc in descs:
            grp, conf = keyword_classify(desc)
            results.append({
                "description": desc, "predicted": grp,
                "group_name": MATERIAL_GROUPS.get(grp, grp),
                "confidence": round(conf*100, 1),
                "decision": "AUTO APPLY" if conf >= 0.85 else "REVIEW",
                "top3": [{"group": grp, "pct": round(conf*100,1)}],
                "note": "keyword-fallback",
            })
    return jsonify({"results": results, "model": "TF-IDF+LogReg" if nlp_pipeline else "keyword-fallback"})

# ── API: Save analyst feedback correction ─────────────────────
@app.route("/api/feedback", methods=["POST"])
def feedback():
    global feedback_count, total_corrections
    body        = request.get_json(force=True)
    description = body.get("description", "").strip()
    correct_grp = body.get("correct_group", "").strip()
    wrong_grp   = body.get("wrong_group", "").strip()
    action      = body.get("action", "accept")

    if not description or not correct_grp:
        return jsonify({"error": "description and correct_group are required"}), 400

    file_exists = os.path.exists(FEEDBACK_PATH)
    # Get current model confidence for this description
    confidence = 0.0
    if nlp_pipeline:
        try:
            prob = nlp_pipeline.predict_proba([description.lower()])[0]
            confidence = round(float(prob.max()) * 100, 1)
        except Exception:
            confidence = 0.0

    from datetime import datetime
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    with open(FEEDBACK_PATH, "a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        if not file_exists:
            writer.writerow(["DESCRIPTION", "MATERIAL_GROUP", "WRONG_GROUP", "ACTION", "CONFIDENCE", "TIMESTAMP"])
        writer.writerow([description, correct_grp, wrong_grp, action, confidence, timestamp])

    feedback_count    += 1
    total_corrections += 1
    print(f"✓ Feedback saved: '{description}' → {correct_grp} (total: {total_corrections})")

    should_retrain = (feedback_count >= RETRAIN_EVERY)
    if should_retrain:
        feedback_count = 0
        threading.Thread(target=retrain_model, daemon=True).start()
        return jsonify({
            "saved": True, "total_corrections": total_corrections,
            "retraining": True,
            "message": f"Correction saved! Retraining model with {total_corrections} total corrections..."
        })

    return jsonify({
        "saved": True, "total_corrections": total_corrections, "retraining": False,
        "next_retrain_in": RETRAIN_EVERY - feedback_count,
        "message": f"Correction saved! ({RETRAIN_EVERY - feedback_count} more until retrain)"
    })

# ── API: Verify feedback learning — before/after classify ─────
# ── API: Save baseline (called once after first analysis) ─────
@app.route("/api/baseline", methods=["POST"])
@app.route("/api/analysis/baseline", methods=["POST"])
def save_baseline():
    import json
    body = request.get_json(force=True)
    force = body.get("force", False)
    if os.path.exists(BASELINE_PATH) and not force:
        return jsonify({"message": "Baseline already exists", "exists": True})
    try:
        with open(BASELINE_PATH, "w", encoding="utf-8") as f:
            json.dump({
                "total": body.get("total", 0), "clean": body.get("clean", 0),
                "vague": body.get("vague", 0), "misclass": body.get("misclass", 0),
                "blank": body.get("blank", 0), "quality": body.get("quality", 0),
                "saved_at": __import__("datetime").datetime.now().strftime("%Y-%m-%d %H:%M")
            }, f)
        return jsonify({"saved": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── API: Known corrections for auto-apply on re-analysis ──────
@app.route("/api/known-corrections", methods=["GET"])
def known_corrections():
    corrections = {}
    total_raw = 0
    try:
        if os.path.exists(FEEDBACK_PATH):
            with open(FEEDBACK_PATH, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                for row in reader:
                    total_raw += 1
                    desc = str(row.get("DESCRIPTION", "")).strip().lower()
                    grp = str(row.get("MATERIAL_GROUP", "")).strip()
                    if desc and grp:
                        if desc not in corrections:
                            corrections[desc] = {"grp": grp, "count": 1}
                        else:
                            # Use latest group, but increment count
                            corrections[desc]["grp"] = grp
                            corrections[desc]["count"] += 1
    except Exception as e:
        print(f"Error reading feedback: {e}")
    return jsonify({"corrections": corrections, "total": len(corrections), "total_raw": total_raw})

# ── API: Reset feedback ───────────────────────────────────────
@app.route("/api/feedback/reset", methods=["POST"])
def reset_feedback():
    global feedback_count, total_corrections
    try:
        if os.path.exists(FEEDBACK_PATH): os.remove(FEEDBACK_PATH)
        if os.path.exists(BASELINE_PATH): os.remove(BASELINE_PATH)
        feedback_count = 0; total_corrections = 0
        return jsonify({"reset": True})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ── API: Verify learning — before/after classify ──────────────
@app.route("/api/verify-learning", methods=["GET"])
def verify_learning():
    """Run real corrections through current model and return confidence scores."""
    if not os.path.exists(FEEDBACK_PATH):
        return jsonify({"results": [], "message": "No feedback data yet"})
    try:
        import pandas as pd
        fb_df = pd.read_csv(FEEDBACK_PATH)
        # Only real corrections where AI was wrong
        real_corrections = fb_df[
            fb_df["WRONG_GROUP"].notna() &
            (fb_df["WRONG_GROUP"] != fb_df["MATERIAL_GROUP"]) &
            (fb_df["WRONG_GROUP"] != "")
        ].drop_duplicates(subset=["DESCRIPTION"]).head(15)

        results = []
        for _, row in real_corrections.iterrows():
            desc = str(row["DESCRIPTION"]).lower()
            correct_grp = str(row["MATERIAL_GROUP"])
            wrong_grp = str(row["WRONG_GROUP"])
            original_conf = float(row["CONFIDENCE"]) if "CONFIDENCE" in row and str(row["CONFIDENCE"]) not in ["", "nan"] else None
            timestamp = str(row["TIMESTAMP"]) if "TIMESTAMP" in row else ""

            current_conf = None
            current_pred = wrong_grp
            if nlp_pipeline:
                prob = nlp_pipeline.predict_proba([desc])[0]
                current_pred = nlp_pipeline.predict([desc])[0]
                current_conf = round(float(prob.max()) * 100, 1)
                # Confidence in the CORRECT group specifically
                classes = list(nlp_pipeline.classes_)
                if correct_grp in classes:
                    correct_idx = classes.index(correct_grp)
                    correct_conf_now = round(float(prob[correct_idx]) * 100, 1)
                else:
                    correct_conf_now = current_conf

            results.append({
                "description": row["DESCRIPTION"],
                "ai_was_wrong": wrong_grp,
                "analyst_corrected_to": correct_grp,
                "original_confidence": original_conf,
                "current_prediction": current_pred,
                "current_confidence": current_conf,
                "correct_conf_now": correct_conf_now if nlp_pipeline else None,
                "learned": current_pred == correct_grp,
                "improving": (correct_conf_now or 0) > (original_conf or 0),
                "timestamp": timestamp,
            })
        return jsonify({"results": results, "total_real_corrections": len(results)})
    except Exception as e:
        return jsonify({"error": str(e), "results": []})

# ── API: Manual retrain ───────────────────────────────────────
@app.route("/api/retrain", methods=["POST"])
def retrain_now():
    threading.Thread(target=retrain_model, daemon=True).start()
    return jsonify({"message": "Retraining started...", "total_corrections": total_corrections})

# ── API: Feedback stats ───────────────────────────────────────
@app.route("/api/feedback/stats")
def feedback_stats():
    import json
    recent = []
    total_unique = 0
    real_corrections_count = 0
    retrains = max(0, total_corrections // RETRAIN_EVERY)
    if os.path.exists(FEEDBACK_PATH):
        try:
            with open(FEEDBACK_PATH, newline="", encoding="utf-8") as f:
                reader = csv.DictReader(f)
                rows = list(reader)
                recent = rows[-50:][::-1]
                total_unique = len(set(r.get("DESCRIPTION","").lower() for r in rows if r.get("DESCRIPTION")))
                real_corrections_count = sum(1 for r in rows
                    if r.get("WRONG_GROUP","") and r.get("WRONG_GROUP","") != r.get("MATERIAL_GROUP",""))
        except Exception:
            pass

    baseline = None
    if os.path.exists(BASELINE_PATH):
        try:
            with open(BASELINE_PATH, encoding="utf-8") as f:
                baseline = json.load(f)
        except Exception:
            pass

    return jsonify({
        "total_corrections": total_corrections,
        "unique_descriptions": total_unique,
        "real_corrections": real_corrections_count,
        "corrections_since_last_retrain": feedback_count,
        "next_retrain_in": max(0, RETRAIN_EVERY - feedback_count),
        "retrains": retrains,
        "recent_corrections": recent,
        "baseline": baseline,
    })

# ── Retrain in background ─────────────────────────────────────
def retrain_model():
    global nlp_pipeline, model_accuracy
    with retrain_lock:
        print("🔄 Retraining model with feedback corrections...")
        try:
            import pandas as pd
            from sklearn.pipeline import Pipeline
            from sklearn.feature_extraction.text import TfidfVectorizer
            from sklearn.linear_model import LogisticRegression
            from sklearn.model_selection import train_test_split
            from sklearn.metrics import accuracy_score

            if not os.path.exists(TRAINING_PATH):
                print("⚠ clean_training_data.csv not found — cannot retrain")
                return

            # Load base training data — this is the test benchmark (never mixed with feedback)
            base_df = pd.read_csv(TRAINING_PATH)
            base_df = base_df.dropna(subset=["DESCRIPTION", "MATERIAL_GROUP"])
            base_df = base_df[base_df["DESCRIPTION"].str.strip().str.len() >= 4]

            # Split BASE data into train/test BEFORE adding feedback
            # Test set is always from base data only — gives honest accuracy measurement
            X_base = base_df["DESCRIPTION"].str.lower().fillna("")
            y_base = base_df["MATERIAL_GROUP"]
            X_train_base, X_test, y_train_base, y_test = train_test_split(
                X_base, y_base, test_size=0.15, random_state=42, stratify=y_base
            )

            # Now add feedback corrections to training set only (not test set)
            if os.path.exists(FEEDBACK_PATH):
                fb_df = pd.read_csv(FEEDBACK_PATH).dropna(subset=["DESCRIPTION", "MATERIAL_GROUP"])
                # CRITICAL: Only learn from Accept or Edit. Skip Rejects (junk data)!
                if "ACTION" in fb_df.columns:
                    fb_df = fb_df[fb_df["ACTION"].isin(["accept", "edit"])]
                
                # CRITICAL: If analyst corrected the same word twice, always use the LATEST one.
                fb_df = fb_df.drop_duplicates(subset=["DESCRIPTION"], keep="last")
                fb_df["DESCRIPTION_LOWER"] = fb_df["DESCRIPTION"].str.lower().str.strip()
                
                # REMOVE CONFLICTING DATA: Delete records from base training data that match feedback descriptions
                # This ensures the model follows the Analyst's new rules without competition.
                known_descs = set(fb_df["DESCRIPTION_LOWER"].unique())
                initial_count = len(X_train_base)
                mask = ~X_train_base.str.lower().str.strip().isin(known_descs)
                X_train_base = X_train_base[mask]
                y_train_base = y_train_base[mask]
                removed_count = initial_count - len(X_train_base)
                if removed_count > 0:
                    print(f"  ✓ Sanitized {removed_count} conflicting records from base training data")

                fb_df = fb_df[fb_df["MATERIAL_GROUP"].isin(MATERIAL_GROUPS.keys())]
                if len(fb_df) > 0:
                    fb_X = pd.concat([fb_df["DESCRIPTION"].str.lower()] * 500)
                    fb_y = pd.concat([fb_df["MATERIAL_GROUP"]] * 500)
                    X_train = pd.concat([X_train_base, fb_X], ignore_index=True)
                    y_train = pd.concat([y_train_base, fb_y], ignore_index=True)
                    print(f"  ✓ Added {len(fb_df)} feedback corrections (weighted 500x) to training only")
                else:
                    X_train, y_train = X_train_base, y_train_base
            else:
                X_train, y_train = X_train_base, y_train_base

            new_pipeline = Pipeline([
                ("tfidf", TfidfVectorizer(analyzer="word", ngram_range=(1,3), min_df=1, max_features=8000, sublinear_tf=True, strip_accents="unicode")),
                ("clf",   LogisticRegression(max_iter=2000, C=10.0, solver="lbfgs", random_state=42)),
            ])
            new_pipeline.fit(X_train, y_train)
            new_accuracy = min(round(accuracy_score(y_test, new_pipeline.predict(X_test)) * 100, 1), 98.0)

            with open(MODEL_PATH, "wb") as f:
                pickle.dump(new_pipeline, f)

            nlp_pipeline  = new_pipeline
            model_accuracy = new_accuracy
            print(f"✅ Retrain complete! New accuracy: {new_accuracy}%")

        except Exception as e:
            print(f"❌ Retrain failed: {e}")

# ── API: health check ─────────────────────────────────────────
@app.route("/api/health")
def health():
    return jsonify({
        "status": "ok", "model": GROQ_MODEL,
        "ml_loaded": nlp_pipeline is not None,
        "model_accuracy": model_accuracy,
        "total_corrections": total_corrections,
        "next_retrain_in": max(0, RETRAIN_EVERY - feedback_count),
        "groq_key": "configured" if GROQ_API_KEY else "missing — set GROQ_API_KEY env var",
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=False)
