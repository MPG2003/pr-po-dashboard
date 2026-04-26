import os
import csv

BASE_DIR = os.path.dirname(__file__)
FEEDBACK_PATH = os.path.join(BASE_DIR, "feedback.csv")

CONFLICT_MAPPING = {
    "required urgently": "MTNC",
    "spares": "MECH",
    "general items": "OFFC"
}

def clean_feedback():
    if not os.path.exists(FEEDBACK_PATH):
        print("feedback.csv not found")
        return

    with open(FEEDBACK_PATH, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader, None)
        rows = list(reader)

    # Clean logic
    cleaned_rows = []
    seen_descriptions = set()

    # Process roughly from latest to oldest if we want to keep the final/best correction?
    # Actually, we map the conflicts and ignore the useless accept rows.
    # To keep the final correction, we reverse the list.
    for row in reversed(rows):
        if len(row) < 4:
            continue
        description, material_group, wrong_group, action = row[0], row[1], row[2], row[3]
        confidence = row[4] if len(row) > 4 else ""
        timestamp = row[5] if len(row) > 5 else ""
        
        desc_lower = description.strip().lower()

        # 1. Skip non-learning rows where AI was right (WRONG_GROUP == MATERIAL_GROUP)
        # Note: if it's an 'edit' or 'reject', then WRONG_GROUP might be different. Let's strictly rely on WRONG_GROUP == MATERIAL_GROUP or action == 'accept' AND WRONG_GROUP == MATERIAL_GROUP.
        # Often WRONG_GROUP == MATERIAL_GROUP means the suggested group was correct and user just clicked accept.
        if wrong_group == material_group and action == "accept":
            continue

        # 2. Resolve known conflicts
        if desc_lower in CONFLICT_MAPPING:
            material_group = CONFLICT_MAPPING[desc_lower]
            action = "edit" # it implies we forced the correct mapping

        # 3. Deduplicate (keep only the newest valid correction)
        if desc_lower in seen_descriptions:
            continue
        
        # Add to cleaned data
        seen_descriptions.add(desc_lower)
        
        # If timestamp is missing, we could add a fake one or just leave it blank.
        if not timestamp:
            from datetime import datetime
            timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

        cleaned_rows.append([description, material_group, wrong_group, action, confidence, timestamp])

    # Reverse back to chronological order
    cleaned_rows.reverse()

    with open(FEEDBACK_PATH, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(["DESCRIPTION", "MATERIAL_GROUP", "WRONG_GROUP", "ACTION", "CONFIDENCE", "TIMESTAMP"])
        for r in cleaned_rows:
            writer.writerow(r)

    print(f"Cleaned feedback.csv! Reduced to {len(cleaned_rows)} real corrections.")

    # Trigger Retrain
    try:
        import app
        print("Imported app.py successfully.")
        print("Retraining model...")
        app.retrain_model()
        print("Retrain finished.")
    except Exception as e:
        print(f"Retrain step warning: {e}")

if __name__ == "__main__":
    clean_feedback()
