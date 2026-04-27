# PR/PO Intelligence Dashboard - Comprehensive Workflow & Architecture

This document maps out the complete end-to-end data workflow, logic, and operational architecture of the PR/PO Standardisation Dashboard, ensuring no line of logic or functionality is missed.

## 1. System Initialization & Server Startup (`app.py`)

1. **Environment Setup**: The Flask application initializes and reads the `GROQ_API_KEY` for LLM integrations (Llama 3.3).
2. **Persistent Storage Routing**: It maps `DATA_DIR` to `/app/data` (for Railway volume persistence) or defaults to the local directory. State files include:
   - `nlp_model_final.pkl`: The compiled Scikit-Learn pipeline.
   - `feedback.csv`: Human-in-the-loop analyst corrections.
   - `clean_training_data.csv`: Base historical training data that is never mutated.
   - `baseline_stats.json`: A static file saving the initial state metrics.
3. **Model Loading (`load_model`)**: Loads the pickled TF-IDF + Logistic Regression model. If missing, it seeds from a local fallback, so the system never fails catastrophically (falling back to regex/keyword mapping if completely absent).
4. **State Hydration (`count_existing_feedback`)**: Scans `feedback.csv` on boot to initialize `total_corrections` and the `feedback_count` (which tracks progress until `RETRAIN_EVERY = 10` is hit).

## 2. Frontend Initialization & UI Load (`templates/dashboard.html`)

1. **Structure Layout**: The page consists of a sidebar navigation and multiple view containers (Overview, Chat/Insights, Misclassifications, Vague, Review Queue, Feedback Learning).
2. **State Management Variables**: JavaScript initializes core arrays: `allData`, `allMisclass`, `allVague`, `allReview`, and tracking metrics like `reviewBatchStart` (offset for pagination).
3. **Rule Engines**: Hardcoded dictionaries and sets:
   - `KW` (Keyword mapping matrix)
   - `VAGUE_SET` (Set of generic descriptors like "consumables", "spares")
   - `JUNK_SET` (Purely meaningless noise like "na", ".", "-")
   - `AI_SUGGEST` (Specific smart overrides fallback map)

## 3. Data Ingestion & Harmonization (Frontend JS)

1. **File Upload Handlers**: Analysts upload raw SAP extracts (EBAN for Requisitions, EKPO for Purchase Orders).
2. **CSV Parsing**: The system uses PapaParse to read the physical files into JSON arrays.
3. **Harmonization (`processData`)**:
   - Iterates row by row translating German SAP fields (e.g., `TXZ01` → Description, `MATGR` → Material Group, `MENGE` → Quantity, `AFNAM` → Requisitioner).
   - Joins EBAN and EKPO logically, labelling the source (`src: 'EBAN'` or `src: 'EKPO'`).
   - Any missing departments (`AFNAM`) or vendors (`LIFNR`) are labeled as `"External Vendor"` to prevent UI breaking.
4. **Consensus Loading**: Concurrently, the frontend calls `/api/known-corrections` to fetch the dictionary of historically corrected words, allowing the frontend to know if a description has already been fixed in previous sessions.

## 4. Intelligent Classification Engine

1. **Pre-Classification check (`classifyRow` in JS)**:
   - **Blank/Junk Detection**: Filters against `JUNK_SET`.
   - **Vague Detection**: Checks exact matching against `VAGUE_SET`. Runs partial matching ONLY for multi-word vague phrases (>= 8 characters and contains a space). This prevents false positives on words like "parts" and "material".
   - **Misclassification Detection**: Scans description text against `KW`. If a keyword belongs to group 'MECH' but SAP says 'OFFC', it flags the row.
2. **ML Batch Processing (`analyzeData` via `/api/classify`)**:
   - The frontend batches the descriptions and sends them to the Flask backend.
   - The Backend runs `nlp_pipeline.predict_proba()` against the TF-IDF array.
   - Returns predictions, top 3 probabilities, and confidence scores (percentile).
3. **Post-Classification Merging**:
   - The frontend merges the ML responses back into the JSON array.
   - Descriptions with an ML confidence >= 95% and disagreeing with SAP are confidently flagged as 'misclass' and assigned `correct_group` from the ML prediction.

## 5. Reporting & Analytics Mapping

1. **Overview Dashboard**: Renders aggregate metrics (`total`, `clean`, `vague`, `misclass`).
   - Calls `/api/baseline` to persist the very first read of data.
   - Renders trend charts (baseline vs current).
2. **Table Rendering Functions**: `renderMiscTable` and `renderVagueTable` populate HTML dynamically.
3. **AI Chat Context Generation**: Extracts the top 10 misclassifications into a context prompt and queries `/api/chat`, piping through standard LLM context arrays to the Groq Llama 3.3 model to generate dynamic insights.

## 6. The Feedback Loop & Analyst Review

1. **Review Queue Dispatch**: Elements flagged as 'misclass' or 'vague' are pumped into the `allReview` array.
2. **Micro-Batching**: Rendered in chunks (`REVIEW_BATCH_SIZE`) to prevent DOM lag on massive datasets.
3. **Analyst Actions**:
   - **Accept (`acceptRow`)**: Approves AI suggestion. Adds `_reviewed = true` visually fading out.
   - **Edit (`saveEdit`)**: Analyst overrides the group via a dropdown.
   - **Reject (`rejectRow`)**: Discards AI suggestion, enforcing the original SAP group.
4. **API Bridging (`sendFeedback`)**: Every action sends an asynchronous POST to `/api/feedback`.

## 7. Backend Persistence & Training Logic (`app.py`)

1. **Feedback Ingestion**: `/api/feedback` appends the analyst action as a new row in `feedback.csv` with the corrected group, wrong group, action type, and timestamp.
2. **Triggering mechanism**: A global counter ticks up. If `feedback_count % 10 == 0`, it triggers `retrain_model()` in a background thread to avoid blocking UI requests.
3. **The Retraining Pipeline (`retrain_model`)**:
   - Connects to `clean_training_data.csv` handling the stable base test set (train/test split happens on purely clean data to preserve a mathematically honest test set).
   - Ingests `feedback.csv` and deduplicates (retains only the 'last' known correction per description).
   - **Data Sanitization**: Filters out any exact description matches in the base clean dataset that conflict with the new analyst correction.
   - **Data Weighting**: Repeats the known analyst corrections 500x (`pd.concat(...) * 500`) to force the Logistic Regression model parameters to aggressively adopt the human correction.
   - **Fit & Save**: Reinitializes the Scikit-Learn `Pipeline`, fits the TF-IDF vectorizer and LR model, evaluates against the clean test set, saves to `nlp_model_final.pkl`.

## 8. State Maintenance & Import/Export

1. **Clean Feedback (`clean_feedback.py`)**: A utility script capable of parsing `feedback.csv`, resolving conflicting duplicates in historical data using reverse iterators, purging 'accept' noise, and forcibly reducing the file dimensions.
2. **Dashboard Import/Export**: Users can export `feedback.csv` safely. Uploading it via the UI hits `/api/feedback/import` which forces a state reset and recalculates the total feedback count metrics.
3. **Verification Testing**: The UI periodically triggers `/api/verify-learning` which runs through real historical errors and computes a Delta (Original ML confidence vs Current ML confidence), proving the continuous reinforcement learning model mathematically.
