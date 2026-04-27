# How It Works: From Upload to Learning 🧠

This guide breaks down exactly what happens under the hood of your dashboard—from the moment you drop a CSV file into the browser, to the moment the Machine Learning engine gets "smarter" based on your actions.

---

## Step 1: The Upload & Harmonization 📤

**What you do:** You drop an **EKPO** (Purchase Orders) or **EBAN** (Requisitions) CSV file into the dashboard.

**What the code does:**
1. **CSV Parsing:** The browser uses a built-in Javascript reader to instantly convert the massive CSV spreadsheet into a lightweight JSON array. 
2. **Harmonization:** SAP data is messy. The dashboard maps the strict German column headers into standard names (e.g., `TXZ01` becomes the `Description`, `MATGR` becomes `Original Group`). 
3. **Gap Filling:** If the file is missing data like a `DEPARTMENT` or `VENDOR`, the script injects `"External Vendor"` so that the UI doesn't crash later.

---

## Step 2: The First Defense (Rules & Heuristics) 🛡️

Before the ML model is even called, the system runs rapid, hardcoded checks on the browser.

1. **The Junk Filter:** Is the description just `"-"`, `"."`, or `"NA"`? It skips the brain entirely and is flagged as a blank/junk row.
2. **The Vague Filter:** The system checks against a hardcoded list (`VAGUE_SET`). 
    - *Exact Matches:* If the description is exactly `"materials"` or `"parts"`, it is flagged as Vague.
    - *Partial Matches:* If it contains a phrase like `"as per indent"` (which is multi-word and over 8 characters), it is also flagged as Vague.
3. **The Keyword Filter:** It checks a static list of explicit rules (`KW`). For example, if the word `"bearing"` is found but the SAP group is `"OFFC"` (Office Supplies), it forcefully flags it as Misclassified.

---

## Step 3: The AI "Brain" Predicts 🤖

Now, all the remaining clean, valid descriptions are batched up and sent from your browser to the Flask backend via `POST /api/classify`.

**What happens on the Backend (`app.py`):**
1. **Vectorization:** The descriptions pass through a mathematical filter called **TF-IDF**. This converts English words into a matrix of numbers based on how rare or important a word is.
2. **Logistic Regression:** These numbers are fed into the loaded `.pkl` model. The model calculates the mathematical probability of that description belonging to every single Material Group.
3. **The Confidence Threshold:** The model selects the highest probability. If the model is **≥95% confident** that the SAP data is wrong, it flags the item as **Misclassified**. If it's less than 95%, it assumes it might be an edge case and leaves it alone.

---

## Step 4: The Review Queue & The Teacher (You) 🧑‍🏫

The Data Quality metrics update, and thousands of records are moved into the **Review Queue**. 

At this point, the ML model is waiting to be graded. You, the Analyst, are the teacher. In the Review Queue:

- **When you click "✔️ Accept":** You tell the system, *"Yes, your ML prediction was correct."*
- **When you click "✏️ Edit":** You tell the system, *"You identified a problem, but your prediction was wrong. Here is the correct answer."*
- **When you click "✕ Reject":** You tell the system, *"Your prediction was wrong, the original SAP data was correct all along."*

Every single click sends a silent message to `POST /api/feedback`, writing a new row into `feedback.csv` containing the description, your corrected group, and the action you took.

---

## Step 5: The "Aha!" Moment (Model Retraining) ⚡

The system watches your actions closely. Once you make **10 corrections**, it quietly triggers `retrain_model()` on a background server thread.

Here is exactly how the model achieves its "Self-Healing Learning":

1. **It Reads the Rulebook:** It loads `clean_training_data.csv`, which is an enormous vault of historical, verified PR/PO data.
2. **It Forgets Old Mistakes:** It checks your `feedback.csv`. If it finds that you corrected the word *"laptop bag"*, it scans the `clean_training_data.csv` and completely deletes any old historical references to *"laptop bag"* that conflict with your new rule. **This ensures the model doesn't get confused by competing facts.**
3. **The 500x Amplification:** Machine learning models are stubborn; they need a lot of data to change their minds. To force the model to listen to you, the system takes your single correction of *"laptop bag"* and mathematically duplicates it **500 times** in the machine's memory.
4. **Re-compiling:** It mixes your 500 amplified corrections with the millions of historical records, fits a brand new ML pipeline from scratch, generates a new accuracy score, and permanently saves over the old `nlp_model_final.pkl`.

### Step 6: Verifying Growth 📈

To mathematically prove it learned, you eventually trigger "Verify Baseline." The system loops back through all the records it previously got wrong, runs them through the *brand new* model, and measures the **Delta**.

You will watch the Model Confidence for that specific description rise from its old, incorrect score (e.g., 40%) to a near-perfect score (e.g., 99.8%)—proving the system physically learned from your clicks.
