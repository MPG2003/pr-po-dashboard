
    // ── CONSTANTS ────────────────────────────────────────────────────────
    const VAGUE_SET = new Set(["misc purchase", "urgent material", "as discussed", "refer email", "material required", "items needed", "general items", "miscellaneous", "urgent requirement", "as per indent", "regular purchase", "consumables", "spares", "parts", "material", "goods", "reorder", "pending order", "site requirement", "routine purchase", "required urgently", "various items", "emergency purchase", "monthly purchase", "as required", "standard purchase", "as per bom", "factory requirement", "workshop material", "stores requirement", "office consumables", "production material", "plant requirement", "indirect material", "operational requirement", "material required urgently", "as per discussion", "tbd", "to be advised", "confirm later", "as per specification", "routine order", "emergency spares", "misc spares", "as per list"]);
    const JUNK_SET = new Set(["", "nan", " ", "-", ".", "..", "-/-", "n/a", "tbd", "na", "nil", "0", "x", "?", "unknown"]);
    const KW = [["bearing", "MECH"], ["hydraulic pump", "MECH"], ["gear box", "MECH"], ["v belt", "MECH"], ["shaft coupling", "MECH"], ["pulley", "MECH"], ["sprocket", "MECH"], ["mechanical seal", "MECH"], ["pump centrifugal", "MECH"], ["valve ball", "MECH"], ["valve gate", "MECH"], ["worm gear", "MECH"], ["motor", "ELEC"], ["circuit breaker", "ELEC"], ["contactor", "ELEC"], ["led panel", "ELEC"], ["led flood", "ELEC"], ["led strip", "ELEC"], ["fuse", "ELEC"], ["transformer", "ELEC"], ["vfd", "ELEC"], ["plc", "ELEC"], ["relay", "ELEC"], ["proximity switch", "ELEC"], ["push button", "ELEC"], ["power supply smps", "ELEC"], ["encoder", "ELEC"], ["laptop", "ITEQ"], ["keyboard", "ITEQ"], ["webcam", "ITEQ"], ["network switch", "ITEQ"], ["monitor", "ITEQ"], ["ups", "ITEQ"], ["pen drive", "ITEQ"], ["hard disk", "ITEQ"], ["ssd", "ITEQ"], ["safety helmet", "SAFE"], ["safety gloves", "SAFE"], ["safety shoes", "SAFE"], ["fire extinguisher", "SAFE"], ["safety goggles", "SAFE"], ["safety harness", "SAFE"], ["dust mask", "SAFE"], ["first aid", "SAFE"], ["ear plugs", "SAFE"], ["a4 paper", "OFFC"], ["ballpoint pen", "OFFC"], ["stapler", "OFFC"], ["file folder", "OFFC"], ["whiteboard marker", "OFFC"], ["sticky notes", "OFFC"], ["toner cartridge", "OFFC"], ["notepad", "OFFC"], ["printer cartridge", "OFFC"], ["steel rod", "ROH"], ["aluminium sheet", "ROH"], ["copper wire", "ROH"], ["brass rod", "ROH"], ["gi pipe", "ROH"], ["ms flat bar", "ROH"], ["stainless steel pipe", "ROH"], ["rubber sheet", "ROH"], ["plastic granules", "ROH"], ["welding rod", "MTNC"], ["nut bolt", "MTNC"], ["sandpaper", "MTNC"], ["o ring", "MTNC"], ["drill bit", "MTNC"], ["grinding disc", "MTNC"], ["epoxy adhesive", "MTNC"], ["hacksaw", "MTNC"], ["cutting disc", "MTNC"], ["cable tie", "MTNC"], ["engine oil", "CHEM"], ["hydraulic oil", "CHEM"], ["gear oil", "CHEM"], ["coolant", "CHEM"], ["rust remover", "CHEM"], ["acetone", "CHEM"], ["isopropyl", "CHEM"], ["thinner", "CHEM"], ["compressor oil", "CHEM"], ["cutting oil", "CHEM"], ["cardboard box", "PACK"], ["bubble wrap", "PACK"], ["stretch wrap", "PACK"], ["packing tape", "PACK"], ["foam padding", "PACK"], ["polythene", "PACK"], ["wooden pallet", "PACK"], ["corrugated", "PACK"], ["tea bags", "FOOD"], ["coffee powder", "FOOD"], ["drinking water", "FOOD"], ["biscuits", "FOOD"], ["mineral water", "FOOD"], ["sugar", "FOOD"], ["milk", "FOOD"], ["paper cup", "FOOD"], ["tissue paper", "FOOD"], ["cooking oil", "FOOD"]];
    const GN = { ROH: "Raw Materials", MECH: "Mechanical Parts", ELEC: "Electrical", OFFC: "Office Supplies", SAFE: "Safety Equipment", ITEQ: "IT Equipment", MTNC: "Maintenance", PACK: "Packaging", CHEM: "Chemicals", FOOD: "Canteen & Food" };
    const COLORS = ['#4493f8', '#3fb950', '#d29922', '#f85149', '#bc8cff', '#58a6ff', '#7ee787', '#ffa657', '#ff7b72', '#e3b341'];
    const AI_SUGGEST = { "material": "ROH", "required urgently": "MTNC", "emergency purchase": "MTNC", "consumables": "MTNC", "spares": "MECH", "miscellaneous": "OFFC", "goods": "ROH", "as discussed": "ELEC", "general items": "OFFC", "urgent material": "MECH", "parts": "MECH", "misc purchase": "OFFC", "material required": "ROH", "refer email": "MTNC", "routine purchase": "MTNC", "site requirement": "ROH", "pending order": "MECH", "as per indent": "ROH", "various items": "OFFC", "office consumables": "OFFC", "emergency spares": "MTNC", "misc spares": "MECH" };
    const FB_DATA = [["cable", "HDMI Cable 2 Meter 4K", "ELEC", "33% → 84%"], ["printer", "Laser Printer HP LaserJet", "ITEQ", "33% → 82%"], ["pump", "Hydraulic Pump Industrial", "MECH", "27% → 82%"], ["gloves", "Safety Gloves Heavy Duty", "SAFE", "23% → 78%"], ["oil 5 litre", "Engine Oil SAE 40 5L", "CHEM", "29% → 76%"], ["misc purchase", "Office Stationery General", "OFFC", "13% → 69%"], ["urgent material", "Mechanical Spare Part", "MECH", "25% → 43%"], ["refer email", "Maintenance Consumable Item", "MTNC", "12% → 58%"]];
    const GROUPS = ['ROH', 'MECH', 'ELEC', 'OFFC', 'SAFE', 'ITEQ', 'MTNC', 'PACK', 'CHEM', 'FOOD'];

    // ── STATE ────────────────────────────────────────────────────────────
    let ebanData = null, ekpoData = null;
    let reviewFilterGroup = 'ALL';
    let reviewFilterSource = 'ALL';
    let reviewSortOrder = 'DEFAULT';
    let reviewCurrentBatch = [];
    let allMisclass = [], allVague = [], allReview = [], allAnalyzed = [];
    let reviewBatchStart = 0;
    const REVIEW_BATCH_SIZE = 30;
    let charts = {};

    // ── NAV ──────────────────────────────────────────────────────────────
    function nav(page, el) {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      document.querySelectorAll('.sb-item').forEach(i => i.classList.remove('active'));
      document.getElementById('page-' + page).classList.add('active');
      if (el) el.classList.add('active');
      document.getElementById('tb-title').textContent = { overview: 'PR/PO Standardisation Intelligence Dashboard', insights: 'AI Insights', misclass: 'Misclassifications', vague: 'Vague Descriptions', review: 'Review Queue', feedback: 'Feedback Learning' }[page] || '';
    }

    // ── DRAG DROP ────────────────────────────────────────────────────────
    function dzOver(e, id) { e.preventDefault(); document.getElementById(id).classList.add('drag'); }
    function dzOut(id) { document.getElementById(id).classList.remove('drag'); }
    function dzDrop(e, src) { e.preventDefault(); dzOut('ez-' + src); const f = e.dataTransfer.files[0]; if (f) loadFile(f, src); }

    // ── FILE LOADING ─────────────────────────────────────────────────────
    function detectAndNormalise(rows) {
      if (!rows || rows.length === 0) return [];
      const cols = Object.keys(rows[0]);
      if (cols.includes('TXZ01')) return rows;
      if (cols.includes('Description') || cols.includes('description')) {
        return rows.map(r => ({ TXZ01: r['Description'] || r['description'] || '', MATGR: r['Predicted'] || r['ORIGINAL_GROUP'] || r['predicted'] || '', AFNAM: r['DEPARTMENT'] || r['department'] || '', LIFNR: r['VENDOR'] || '', WERKS: r['PLANT'] || r['plant'] || '', BANFN: r['PR_NUMBER'] || r['pr_number'] || '', EBELN: r['PO_NUMBER'] || r['po_number'] || '', BADAT: r['TIMESTAMP'] || '', BEDAT: r['TIMESTAMP'] || '', PREIS: 0, NETWR: 0, STATUS: '' }));
      }
      return rows;
    }

    function loadFile(file, src) {
      if (!file) return;
      Papa.parse(file, {
        header: true, skipEmptyLines: true, complete: res => {
          const norm = detectAndNormalise(res.data);
          const cols = Object.keys(res.data[0] || {});
          const fmt = cols.includes('TXZ01') ? 'raw SAP format' : cols.includes('Description') ? 'classification results' : 'unknown format';
          if (src === 'eban') { ebanData = norm; setFileUI('eban', file.name, norm.length + ' records · ' + fmt); }
          else { ekpoData = norm; setFileUI('ekpo', file.name, norm.length + ' records · ' + fmt); }
          updateRunBtn();
        }
      });
    }

    function setFileUI(src, name, meta) {
      document.getElementById('uz-' + src + '-idle').style.display = 'none';
      document.getElementById('uz-' + src + '-done').style.display = 'flex';
      document.getElementById('uz-' + src + '-name').textContent = name;
      document.getElementById('uz-' + src + '-meta').textContent = meta;
      document.getElementById('ez-' + src).classList.add('done');
      document.getElementById('rc-' + src).classList.add('ok');
      document.getElementById('rc-' + src + '-icon').textContent = '✓';
      toast('✓ ' + name + ' loaded', 'ok');
    }

    function clearFile(src, e) {
      e.stopPropagation();
      if (src === 'eban') ebanData = null; else ekpoData = null;
      document.getElementById('uz-' + src + '-idle').style.display = 'block';
      document.getElementById('uz-' + src + '-done').style.display = 'none';
      document.getElementById('ez-' + src).classList.remove('done');
      document.getElementById('rc-' + src).classList.remove('ok');
      document.getElementById('rc-' + src + '-icon').textContent = '○';
      document.getElementById('fi-' + src).value = '';
      updateRunBtn();
    }

    function updateRunBtn() {
      const btn = document.getElementById('run-btn');
      btn.disabled = !(ebanData || ekpoData);
      btn.textContent = (ebanData && ekpoData) ? '▶ Analyse Both Files' : (ebanData || ekpoData) ? '▶ Analyse Loaded File' : '▶ Analyse Data';
    }

    // ── CLASSIFY ─────────────────────────────────────────────────────────
    function classifyRow(txt, assigned) {
      const t = String(txt || '').trim();
      const tl = t.toLowerCase();
      if (!t || JUNK_SET.has(tl)) return { issue: 'blank', correct: null };

      // Exact match against vague set
      if (VAGUE_SET.has(tl)) return { issue: 'vague', correct: null };

      // Partial match — ONLY for multi-word vague phrases (2+ words, 8+ chars)
      // Single-word entries like "material", "parts", "goods" must be exact-only
      for (const vp of VAGUE_SET) {
        if (vp.includes(' ') && vp.length >= 8 && tl.includes(vp)) return { issue: 'vague', correct: null };
      }

      // Check keywords for misclassification
      for (const [kw, grp] of KW) { if (tl.includes(kw) && grp !== String(assigned).trim()) return { issue: 'misclass', correct: grp }; }

      return { issue: 'clean', correct: null };
    }

    // ── DEMO DATA ────────────────────────────────────────────────────────
    function loadDemo() {
      const ebanCSV = `BANFN,BNFPO,TXZ01,MATNR,MATGR,MENGE,MEINS,WERKS,EKORG,AFNAM,BADAT,PREIS,STATUS
4500001,4,Coolant Ready Mix Anti Freeze 5L,,CHEM,45,L,PL04,P002,Finance,2024-08-11,612032,2
4500002,9,material,,CHEM,18,KG,PL03,P004,Quality,2024-12-26,460393,1
4500003,7,WELDING ROD 3.15MM E6013 5KG,,MTNC,91,PKT,PL04,P003,Engineering,2024-11-20,546075,1
4500004,2,MOTOR SINGLE PHASE 2HP 230V,,ELEC,72,KG,PL03,P001,Warehouse,2024-08-21,196863,1
4500005,6,mouse gaming rgb,,ITEQ,40,SET,PL03,P003,Warehouse,2024-07-14,1411299,1
4500006,3,Garbage Bag Black 120L Pack,,PACK,55,PKT,PL01,P002,Admin,2024-03-05,83200,2
4500007,1,Aluminium Bar 25mm Round,,ROH,30,M,PL02,P001,Production,2024-05-18,320000,4
4500008,5,required urgently,,MTNC,10,EA,PL03,P004,Finance,2024-09-22,150000,1
4500009,8,Bearing Deep Groove 6205 NSK,,ITEQ,5,EA,PL01,P002,Maintenance,2024-01-15,85000,2
4500010,2,Safety Helmet Yellow ISI Mark,,SAFE,20,EA,PL05,P001,Production,2024-06-30,42000,4
4500011,4,emergency purchase,,MECH,1,EA,PL01,P003,Quality,2024-10-08,75000,1
4500012,7,Circuit Breaker 63A MCCB Siemens,,MTNC,3,EA,PL02,P004,Engineering,2024-02-14,180000,2
4500013,1,A4 Paper 500 Sheet Ream 80gsm,,MECH,50,PKT,PL04,P001,Admin,2024-04-25,62500,4
4500014,6,consumables,,OFFC,15,EA,PL03,P002,Purchase,2024-11-11,95000,1
4500015,3,VFD 15HP Siemens,,PACK,1,EA,PL05,P003,Engineering,2024-07-28,850000,2
4500016,9,Coffee Powder Nescafe 500g,,OFFC,10,PKT,PL01,P001,Admin,2024-03-17,18000,4
4500017,5,Hydraulic Oil ISO 46 20L Castrol,,CHEM,5,L,PL02,P002,Maintenance,2024-08-04,32500,2
4500018,2,spares,,MECH,8,EA,PL04,P004,Maintenance,2024-12-01,120000,1
4500019,4,LED Panel Light 40W Surface Mount,,MECH,10,EA,PL03,P001,Engineering,2024-05-22,75000,4
4500020,1,Laptop Dell Latitude 5520 i5,,ITEQ,3,EA,PL01,P003,IT,2024-09-09,285000,2`;
      const ekpoCSV = `EBELN,EBELP,TXZ01,MATNR,MATGR,MENGE,MEINS,WERKS,EKORG,LIFNR,BEDAT,NETWR,WAERS
4700001,3,Milk Toned 1L Pack,,FOOD,489,PKT,PL05,P001,V10043,2024-09-08,4763354,INR
4700002,1,emergency purchase,,ROH,172,KG,PL05,P004,V10049,2024-06-18,4590958,INR
4700003,2,envelope a4 pack 50,,OFFC,15,KG,PL01,P004,V10009,2024-12-21,3716643,INR
4700004,9,Hydraulic Oil ISO 32 5L,,CHEM,150,EA,PL01,P001,V10072,2025-05-06,2795640,INR
4700005,5,Sprocket 40T 1.5 inch,,OFFC,8,EA,PL04,P002,V10019,2024-03-14,125000,INR
4700006,7,HYDRAULIC MOTOR 5HP,,MECH,2,EA,PL02,P003,V10033,2024-07-22,320000,INR
4700007,4,Keyboard Wireless Logitech MK270,,MECH,5,EA,P01,P001,V10047,2024-11-30,35000,INR
4700008,2,general items,,OFFC,20,EA,PL03,P004,V10021,2024-08-15,88000,INR
4700009,6,O Ring Set Assorted NBR 200pc,,MTNC,10,SET,PL01,P002,V10035,2024-04-19,28000,INR
4700010,1,Bearing Deep Groove 6207 SKF,,ELEC,6,EA,PL05,P003,V10061,2024-09-27,15000,INR
4700011,8,miscellaneous,,MECH,30,EA,PL02,P001,V10037,2025-01-14,195000,INR
4700012,3,Safety Gloves Cut Resistant Level 5,,MTNC,50,EA,PL04,P004,V10053,2024-06-03,62000,INR`;
      Papa.parse(ebanCSV, { header: true, skipEmptyLines: true, complete: r => { ebanData = r.data; setFileUI('eban', 'EBAN_demo.csv', r.data.length + ' demo records'); updateRunBtn(); } });
      Papa.parse(ekpoCSV, { header: true, skipEmptyLines: true, complete: r => { ekpoData = r.data; setFileUI('ekpo', 'EKPO_demo.csv', r.data.length + ' demo records'); updateRunBtn(); } });
      setTimeout(runAnalysis, 600);
    }

    // ── ANALYSIS ─────────────────────────────────────────────────────────
    async function runAnalysis() {
      if (!ebanData && !ekpoData) return;
      const steps = ['Reading EBAN...', 'Reading EKPO...', 'Sending to ML model...', 'Detecting vague descriptions...', 'Finding misclassifications...', 'Generating AI insights...', 'Done ✓'];
      const pcts = [12, 25, 45, 62, 78, 92, 100];
      document.getElementById('prog-wrap').style.display = 'block';
      document.getElementById('dashboard-data').style.display = 'none';
      document.getElementById('dash-empty').style.display = 'none';

      // Show progress steps animated
      let i = 0;
      const showStep = () => {
        document.getElementById('prog-label').textContent = steps[i];
        document.getElementById('prog-pct').textContent = pcts[i] + '%';
        document.getElementById('prog-fill').style.width = pcts[i] + '%';
        document.getElementById('prog-steps').innerHTML = steps.slice(0, i + 1).map((s, j) => `<span class="prog-step ${j < i ? 'done' : j === i ? 'cur' : ''}">${j < i ? '✓' : j === i ? '→' : ''} ${s}</span>`).join('');
      };

      // Animate first 2 steps, then call ML API
      const animateUntilML = () => new Promise(resolve => {
        const iv = setInterval(() => {
          showStep();
          i++;
          if (i >= 2) { clearInterval(iv); resolve(); }
        }, 400);
      });

      await animateUntilML();

      // Collect all descriptions to classify
      const allRows = [...(ebanData || []), ...(ekpoData || [])];
      const descriptions = allRows.map(r => r.TXZ01 || r.Description || r.description || '');

      let mlResults = null;
      let knownCorrections = {};
      // Fetch known corrections from feedback.csv to auto-resolve already-reviewed records
      try {
        const kcResp = await fetch('/api/known-corrections');
        if (kcResp.ok) {
          const kcData = await kcResp.json();
          knownCorrections = kcData.corrections || {};
        }
      } catch (e) { /* no server */ }

      // MERGE LOCAL STORAGE (Safety net for Railway restarts)
      try {
        const localStore = JSON.parse(localStorage.getItem('analyst_corrections') || '{}');
        for (const [d, v] of Object.entries(localStore)) {
          if (!knownCorrections[d]) {
            knownCorrections[d] = v;
          } else {
            // If server has it, combine counts
            knownCorrections[d].count = Math.max(knownCorrections[d].count, v.count);
          }
        }
        const totalKnown = Object.keys(knownCorrections).length;
        if (totalKnown > 0) toast(`✓ ${totalKnown} resolution rules active (Server + Browser Memory)`, 'ok');
      } catch (e) { }
      try {
        showStep(); i++; // Show "Sending to ML model..."
        const resp = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ descriptions })
        });
        const data = await resp.json();
        if (resp.ok && data.results) {
          mlResults = data.results;
          toast(`✓ ML model classified ${mlResults.length} records (${data.model})`, 'ok');
        } else {
          toast('ML API error — using keyword fallback', 'warn');
        }
      } catch (e) {
        toast('Could not reach /api/classify — using keyword fallback', 'warn');
      }

      // Finish remaining progress steps
      const iv2 = setInterval(() => {
        if (i >= steps.length) { clearInterval(iv2); finishAnalysis(mlResults, knownCorrections); return; }
        showStep(); i++;
      }, 400);
    }

    async function finishAnalysis(mlResults, knownCorrections = {}) {
      // Build a lookup map from ML results (indexed by position across all rows)
      const ebanLen = (ebanData || []).length;
      const ekpoLen = (ekpoData || []).length;
      const totalCount = ebanLen + ekpoLen;
      const threshold = totalCount > 100 ? 3 : 2;

      const eban = (ebanData || []).map((r, idx) => {
        const txt = r.TXZ01 || r.Description || r.description || '';
        const ml = mlResults ? mlResults[idx] : null;
        // Use ML predicted group if available and confident, else keep original
        const mlGrp = ml && ml.confidence >= 70 ? ml.predicted : null;
        let grp = mlGrp || r.MATGR || r.Predicted || r.predicted || '';
        const origGrp = r.MATGR || r.Predicted || r.predicted || '';
        const known = knownCorrections[txt.toLowerCase().trim()];
        const isHighlyConfident = ml && ml.confidence >= 99 && known;
        let issue, correct;
        const c = classifyRow(txt, origGrp);

        if (known && (known.count >= threshold || isHighlyConfident)) {
          issue = 'clean'; correct = null;
          grp = known.grp; // Auto-apply historical correction
        } else if (c.issue === 'blank') { issue = 'blank'; correct = null; }
        else if (c.issue === 'vague') {
          issue = 'vague'; correct = null;
          r.consensus_progress = known ? `${known.count}/${threshold}` : `0/${threshold}`;
        }
        else if (ml && ml.confidence >= 95 && ml.predicted.trim() !== origGrp.trim() && origGrp.trim()) { issue = 'misclass'; correct = ml.predicted; }
        else { issue = 'clean'; correct = null; }
        let dept = r.AFNAM || r.DEPARTMENT || r.department || '—';
        if (dept === '—' || dept === '-') dept = 'External Vendor';
        return { ...r, TXZ01: txt, MATGR: grp, ORIG_MATGR: origGrp, ML_CONF: ml ? ml.confidence : null, ML_GROUP: ml ? ml.predicted : null, top3: ml ? ml.top3 : null, AFNAM: dept, WERKS: r.WERKS || r.PLANT || r.plant || '—', BANFN: r.BANFN || r.PR_NUMBER || r.pr_number || '—', src: 'EBAN', issue, correct };
      });

      const ekpo = (ekpoData || []).map((r, idx) => {
        const txt = r.TXZ01 || r.Description || r.description || '';
        const ml = mlResults ? mlResults[ebanLen + idx] : null;
        const mlGrp = ml && ml.confidence >= 70 ? ml.predicted : null;
        let grp = mlGrp || r.MATGR || r.Predicted || r.predicted || '';
        const knownEk = knownCorrections[txt.toLowerCase().trim()];
        const isHighlyConfidentEk = ml && ml.confidence >= 99 && knownEk;
        const origGrp = r.MATGR || r.Predicted || r.predicted || '';
        let issue, correct;
        const c = classifyRow(txt, origGrp);

        if (knownEk && (knownEk.count >= threshold || isHighlyConfidentEk)) {
          issue = 'clean'; correct = null;
          grp = knownEk.grp;
        } else if (c.issue === 'blank') { issue = 'blank'; correct = null; }
        else if (c.issue === 'vague') {
          issue = 'vague'; correct = null;
          r.consensus_progress = knownEk ? `${knownEk.count}/${threshold}` : `0/${threshold}`;
        }
        else if (ml && ml.confidence >= 95 && ml.predicted.trim() !== origGrp.trim() && origGrp.trim()) { issue = 'misclass'; correct = ml.predicted; }
        else { issue = 'clean'; correct = null; }
        let vendor = r.LIFNR || r.VENDOR || r.vendor || r.DEPARTMENT || r.department || '—';
        if (vendor === '—' || vendor === '-') vendor = 'External Vendor';
        return { ...r, TXZ01: txt, MATGR: grp, ORIG_MATGR: origGrp, ML_CONF: ml ? ml.confidence : null, ML_GROUP: ml ? ml.predicted : null, top3: ml ? ml.top3 : null, LIFNR: vendor, WERKS: r.WERKS || r.PLANT || r.plant || '—', EBELN: r.EBELN || r.PO_NUMBER || r.po_number || '—', src: 'EKPO', issue, correct };
      });
      const all = [...eban, ...ekpo];
      allAnalyzed = all;
      const total = all.length, clean = all.filter(r => r.issue === 'clean').length, vague = all.filter(r => r.issue === 'vague').length, misc = all.filter(r => r.issue === 'misclass').length, blank = all.filter(r => r.issue === 'blank').length, quality = Math.round(clean / total * 100);
      document.getElementById('k-total').textContent = total.toLocaleString();
      document.getElementById('k-clean').textContent = clean.toLocaleString();
      document.getElementById('k-vague').textContent = vague.toLocaleString();
      document.getElementById('k-misc').textContent = misc.toLocaleString();
      document.getElementById('k-blank').textContent = blank.toLocaleString();
      document.getElementById('k-quality').textContent = quality + '%';
      document.getElementById('sb-misclass').textContent = misc;
      document.getElementById('sb-vague').textContent = vague;
      document.getElementById('sb-review').textContent = vague;
      document.getElementById('tb-meta').textContent = `${total.toLocaleString()} records · ${quality}% data quality · ${misc} misclassifications detected`;
      document.getElementById('m-total').textContent = misc;
      document.getElementById('m-eban').textContent = eban.filter(r => r.issue === 'misclass').length;
      document.getElementById('m-ekpo').textContent = ekpo.filter(r => r.issue === 'misclass').length;
      document.getElementById('v-total').textContent = vague;
      document.getElementById('v-eban').textContent = eban.filter(r => r.issue === 'vague').length;
      document.getElementById('v-ekpo').textContent = ekpo.filter(r => r.issue === 'vague').length;
      allMisclass = all.filter(r => r.issue === 'misclass');
      allVague = all.filter(r => r.issue === 'vague');
      allVague = all.filter(r => r.issue === 'vague');
      allReview = allVague;

      reviewBatchStart = 0;
      document.getElementById('sb-review').textContent = allReview.length;
      buildCharts(eban, ekpo, all);
      buildInsights(eban, ekpo, all, vague, misc, blank, quality);
      renderMiscTable(allMisclass);
      renderVagueTable(allVague);
      renderReviewBatch();
      buildFeedbackTable();
      document.getElementById('prog-wrap').style.display = 'none';
      document.getElementById('dashboard-data').style.display = 'block';
      document.getElementById('export-after-btn').style.display = 'inline-block';
      ['misc-content', 'vague-content', 'review-content', 'insights-content'].forEach(id => {
        document.getElementById(id).style.display = 'block';
        const emp = id.replace('-content', '-empty');
        if (document.getElementById(emp)) document.getElementById(emp).style.display = 'none';
      });
      // Save baseline on first ever analysis (only if not already saved)
      fetch('/api/baseline', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ total, clean, vague, misc, blank, quality })
      }).catch(() => { });

      // Update chat context after analysis
      updateChatContext(total, clean, vague, misc, blank, quality, eban, ekpo, all);
      toast(`✓ Analysis complete — ${total.toLocaleString()} records processed`, 'ok');
      addMessage('ai', '✅ **Analysis complete!** I now have full access to your data.\n\nI can help you with:\n• Data quality summary\n• Misclassification patterns\n• Department breakdown\n• Export CSV files\n• Executive summary \n\nWhat would you like to know?');
    }

    // ── CHARTS ───────────────────────────────────────────────────────────
    function buildCharts(eban, ekpo, all) {
      const groups = GROUPS;
      const cnt = g => all.filter(r => r.MATGR === g).length;
      const ebanCnt = g => eban.filter(r => r.MATGR === g).length;
      const ekpoCnt = g => ekpo.filter(r => r.MATGR === g).length;
      const co = { responsive: true, plugins: { legend: { labels: { color: '#8d96a0', font: { size: 10 }, boxWidth: 10 } } } };
      const scl = { ticks: { color: '#8d96a0', font: { size: 9 } }, grid: { color: 'rgba(48,54,61,.6)' } };
      destroyChart('c-donut');
      charts['c-donut'] = new Chart(document.getElementById('c-donut'), { type: 'doughnut', data: { labels: groups.map(g => GN[g] || g), datasets: [{ data: groups.map(cnt), backgroundColor: COLORS, borderWidth: 2, borderColor: '#161b22' }] }, options: { ...co, plugins: { legend: { position: 'right', labels: { color: '#8d96a0', font: { size: 10 }, boxWidth: 10, padding: 6 } } } } });
      destroyChart('c-bar');
      charts['c-bar'] = new Chart(document.getElementById('c-bar'), { type: 'bar', data: { labels: groups, datasets: [{ label: 'EBAN', data: groups.map(ebanCnt), backgroundColor: 'rgba(68,147,248,.7)', borderRadius: 3 }, { label: 'EKPO', data: groups.map(ekpoCnt), backgroundColor: 'rgba(63,185,80,.7)', borderRadius: 3 }] }, options: { ...co, scales: { x: { ...scl }, y: { ...scl, beginAtZero: true } } } });
      const cleanPct = g => { const t = all.filter(r => r.MATGR === g).length; return t ? Math.round(all.filter(r => r.MATGR === g && r.issue === 'clean').length / t * 100) : 0; };
      const vaguePct = g => { const t = all.filter(r => r.MATGR === g).length; return t ? Math.round(all.filter(r => r.MATGR === g && r.issue === 'vague').length / t * 100) : 0; };
      const mscPct = g => { const t = all.filter(r => r.MATGR === g).length; return t ? Math.round(all.filter(r => r.MATGR === g && r.issue === 'misclass').length / t * 100) : 0; };
      destroyChart('c-quality');
      charts['c-quality'] = new Chart(document.getElementById('c-quality'), { type: 'bar', data: { labels: groups, datasets: [{ label: 'Clean', data: groups.map(cleanPct), backgroundColor: 'rgba(63,185,80,.7)', borderRadius: 2 }, { label: 'Vague', data: groups.map(vaguePct), backgroundColor: 'rgba(210,153,34,.7)', borderRadius: 2 }, { label: 'Misclassified', data: groups.map(mscPct), backgroundColor: 'rgba(248,81,73,.7)', borderRadius: 2 }] }, options: { ...co, scales: { x: { ...scl, stacked: true }, y: { ...scl, stacked: true, max: 100, ticks: { ...scl.ticks, callback: v => v + '%' } } } } });
      const depts = {};
      eban.forEach(r => { const d = r.AFNAM || r.DEPARTMENT || r.department || ''; if (d && d !== '—') depts[d] = (depts[d] || 0) + 1; });
      const dk = Object.keys(depts).sort((a, b) => depts[b] - depts[a]).slice(0, 8);
      destroyChart('c-dept');
      charts['c-dept'] = new Chart(document.getElementById('c-dept'), { type: 'doughnut', data: { labels: dk, datasets: [{ data: dk.map(k => depts[k]), backgroundColor: COLORS, borderWidth: 2, borderColor: '#161b22' }] }, options: { ...co, plugins: { legend: { position: 'bottom', labels: { color: '#8d96a0', font: { size: 9 }, boxWidth: 8, padding: 5 } } } } });
      // Corrections per cycle bar chart — starts empty, filled by refreshFeedbackStats
      destroyChart('c-feedback');
      charts['c-feedback'] = new Chart(document.getElementById('c-feedback'), {
        type: 'bar',
        data: {
          labels: ['No cycles yet'],
          datasets: [{ label: 'Corrections', data: [0], backgroundColor: 'rgba(68,147,248,0.6)', borderColor: '#4493f8', borderWidth: 1, borderRadius: 4 }]
        },
        options: { ...co, scales: { x: { ...scl }, y: { ...scl, beginAtZero: true, ticks: { ...scl.ticks, stepSize: 1 } } }, plugins: { ...co.plugins, legend: { display: false } } }
      });
      refreshFeedbackStats();
    }

    function destroyChart(id) { if (charts[id]) { charts[id].destroy(); delete charts[id]; } }

    // ── INSIGHTS ─────────────────────────────────────────────────────────
    function buildInsights(eban, ekpo, all, vague, misc, blank, quality) {
      const total = all.length;
      const deptIssues = {};
      eban.filter(r => r.issue === 'vague' || r.issue === 'misclass').forEach(r => { deptIssues[r.AFNAM] = (deptIssues[r.AFNAM] || 0) + 1; });
      const worstDept = Object.entries(deptIssues).sort((a, b) => b[1] - a[1])[0];
      const mPairs = {};
      all.filter(r => r.issue === 'misclass').forEach(r => { const k = `${r.ORIG_MATGR}→${r.correct}`; mPairs[k] = (mPairs[k] || 0) + 1; });
      const topPair = Object.entries(mPairs).sort((a, b) => b[1] - a[1])[0];
      const qualLabel = quality >= 85 ? 'good' : quality >= 70 ? 'warn' : 'danger';
      const vagueRate = Math.round(vague / total * 100), miscRate = Math.round(misc / total * 100);
      const months = {};
      all.forEach(r => { const d = String(r.BADAT || r.BEDAT || ''); const m = d.substring(0, 7); if (m && /^\d{4}-\d{2}$/.test(m)) months[m] = (months[m] || 0) + 1; });
      const peak = Object.entries(months).sort((a, b) => b[1] - a[1])[0];
      const insights = [
        { type: vagueRate > 15 ? 'danger' : vagueRate > 10 ? 'warn' : 'good', tag: vagueRate > 15 ? 'HIGH RISK' : vagueRate > 10 ? 'WARNING' : 'ACCEPTABLE', title: `${vagueRate}% of descriptions are vague`, body: `${vague.toLocaleString()} records have no meaningful description. Industry best practice is under 5%.`, stat: `${vague.toLocaleString()} vague records found` },
        { type: misc > 100 ? 'danger' : misc > 30 ? 'warn' : misc > 0 ? 'warn' : 'good', tag: misc > 100 ? 'CRITICAL' : misc > 30 ? 'WARNING' : misc > 0 ? 'DETECTED' : 'NONE FOUND', title: `${misc.toLocaleString()} misclassified records detected`, body: `${misc.toLocaleString()} of ${total.toLocaleString()} records have a clearly wrong material group assignment.`, stat: `${miscRate}% of total records` },
        { type: qualLabel, tag: qualLabel === 'good' ? 'GOOD' : qualLabel === 'warn' ? 'MODERATE' : 'POOR', title: `Overall data quality: ${quality}%`, body: `${(total - vague - misc - blank).toLocaleString()} of ${total.toLocaleString()} records are clean and correctly classified.`, stat: quality + '% quality score' },
        worstDept ? { type: 'warn', tag: 'DEPT INSIGHT', title: `${worstDept[0]} raises most issues`, body: `The ${worstDept[0]} department has ${worstDept[1]} total issues (vague + misclassified) — highest of any department.`, stat: `${worstDept[1]} total issues from ${worstDept[0]}` } : null,
        topPair ? { type: 'danger', tag: 'PATTERN FOUND', title: `Most common misclassification: ${topPair[0]}`, body: `${topPair[1]} records assigned to ${topPair[0].split('→')[0]} should actually be in ${topPair[0].split('→')[1]}.`, stat: `${topPair[1]} records with this pattern` } : null,
        peak ? { type: 'info', tag: 'TREND', title: `Peak procurement in ${peak[0]}`, body: `${peak[1]} records were raised in ${peak[0]}, the highest volume month.`, stat: `${peak[1]} records in peak month` } : null,
      ].filter(Boolean);
      document.getElementById('insights-grid').innerHTML = insights.map(ins => `<div class="insight-card ${ins.type}"><div class="ic-tag ${ins.type}">${ins.tag}</div><div class="ic-title">${ins.title}</div><div class="ic-body">${ins.body}</div><div class="ic-stat ${ins.type}">${ins.stat}</div></div>`).join('');
      const deptAll = {};
      eban.filter(r => r.issue === 'vague' || r.issue === 'misclass').forEach(r => { deptAll[r.AFNAM] = (deptAll[r.AFNAM] || 0) + 1; });
      const dk = Object.keys(deptAll).sort((a, b) => deptAll[b] - deptAll[a]).slice(0, 8);
      const co = { responsive: true, plugins: { legend: { labels: { color: '#8d96a0', font: { size: 10 } } } } };
      const scl = { ticks: { color: '#8d96a0', font: { size: 9 } }, grid: { color: 'rgba(48,54,61,.6)' } };
      destroyChart('c-dept-issues');
      charts['c-dept-issues'] = new Chart(document.getElementById('c-dept-issues'), { type: 'bar', data: { labels: dk, datasets: [{ label: 'Issues (vague+misclass)', data: dk.map(k => deptAll[k]), backgroundColor: 'rgba(210,153,34,.7)', borderRadius: 4 }] }, options: { ...co, scales: { x: { ...scl }, y: { ...scl, beginAtZero: true } } } });
      const pairs = Object.entries(mPairs).sort((a, b) => b[1] - a[1]).slice(0, 6);
      destroyChart('c-misclass-pattern');
      charts['c-misclass-pattern'] = new Chart(document.getElementById('c-misclass-pattern'), { type: 'bar', data: { labels: pairs.map(p => p[0]), datasets: [{ label: 'Count', data: pairs.map(p => p[1]), backgroundColor: 'rgba(248,81,73,.7)', borderRadius: 4 }] }, options: { ...co, indexAxis: 'y', scales: { x: { ...scl, beginAtZero: true }, y: { ...scl } } } });
    }

    // ── TABLE RENDERERS ───────────────────────────────────────────────────
    function gTag(g) { const c = { ROH: '#bc8cff', MECH: '#ffa657', ELEC: '#4493f8', OFFC: '#e3b341', SAFE: '#3fb950', ITEQ: '#58a6ff', MTNC: '#d29922', PACK: '#79c0ff', CHEM: '#f85149', FOOD: '#7ee787' }[g] || '#8d96a0'; return `<span style="font-family:var(--mono);font-size:10px;padding:2px 6px;border-radius:3px;background:${c}22;color:${c}">${g}</span>`; }
    function confBadge(conf) {
      if (conf === null || conf === undefined) return '<span style="color:var(--text3);font-size:10px">—</span>';
      const c = parseFloat(conf);
      const color = c >= 95 ? 'var(--green)' : c >= 85 ? 'var(--blue)' : 'var(--yellow)';
      const label = c >= 95 ? 'HIGH' : c >= 85 ? 'GOOD' : 'MODERATE';
      const barW = Math.round(c);
      return `<div style="display:flex;flex-direction:column;gap:3px"><div style="display:flex;align-items:center;gap:5px"><span style="font-family:var(--mono);font-size:11px;font-weight:600;color:${color}">${c.toFixed(1)}%</span><span style="font-size:9px;padding:1px 5px;border-radius:3px;background:${color}22;color:${color}">${label}</span></div><div style="height:3px;background:var(--surface3);border-radius:2px;width:80px"><div style="height:100%;width:${barW}%;background:${color};border-radius:2px"></div></div></div>`;
    }

    function renderMiscTable(data) {
      document.getElementById('misc-count').textContent = `Showing ${data.length} records`;
      const sorted = [...data].sort((a, b) => (b.ML_CONF || 0) - (a.ML_CONF || 0));
      document.getElementById('misc-body').innerHTML = sorted.map(r => `<tr><td><span class="tag ${r.src === 'EBAN' ? 'src-eban' : 'src-ekpo'}">${r.src}</span></td><td class="td-mono">${r.BANFN || r.EBELN || '—'}</td><td><div class="td-desc" title="${r.TXZ01}">${r.TXZ01 || '—'}</div></td><td><span class="tag tag-wrong">${r.ORIG_MATGR || r.MATGR}</span></td><td>${gTag(r.correct)} <span style="font-size:10px;color:var(--text3)">${GN[r.correct] || ''}</span></td><td>${confBadge(r.ML_CONF)}</td><td style="font-size:11px">${r.AFNAM || r.LIFNR || '—'}</td><td class="td-mono">${r.WERKS || '—'}</td></tr>`).join('') || '<tr><td colspan="8" style="text-align:center;color:var(--text3);padding:24px">No records</td></tr>';
    }
    function renderVagueTable(data) {
      document.getElementById('vague-count').textContent = `Showing ${data.length} records`;
      document.getElementById('vague-body').innerHTML = data.map(r => `<tr><td><span class="tag ${r.src === 'EBAN' ? 'src-eban' : 'src-ekpo'}">${r.src}</span></td><td class="td-mono">${r.BANFN || r.EBELN || '—'}</td><td><span style="color:var(--yellow);font-size:12px">"${r.TXZ01 || '—'}"</span></td><td>${gTag(r.MATGR)}</td><td style="font-size:11px">${r.AFNAM || r.LIFNR || '—'}</td><td class="td-mono">${r.WERKS || '—'}</td></tr>`).join('') || '<tr><td colspan="6" style="text-align:center;color:var(--text3);padding:24px">No records</td></tr>';
    }
    function setReviewSort(order) { reviewSortOrder = order; reviewBatchStart = 0; renderReviewBatch(); }
    function setReviewSrc(src) {
      reviewFilterSource = src;
      ['ALL', 'EBAN', 'EKPO'].forEach(s => {
        document.getElementById('btn-src-' + s).style.background = s === src ? 'var(--blue)' : 'transparent';
        document.getElementById('btn-src-' + s).style.color = s === src ? '#fff' : 'var(--text2)';
      });
      reviewBatchStart = 0; renderReviewBatch();
    }

    function setReviewFilter(grp) {
      reviewFilterGroup = grp;
      reviewBatchStart = 0;
      renderReviewBatch();
    }

    function renderReviewBatch() {
      let unreviewedAll = allReview.filter(r => !r._reviewed);

      // Source Filter
      if (reviewFilterSource !== 'ALL') {
        unreviewedAll = unreviewedAll.filter(r => r.src === reviewFilterSource);
      }

      // Material Group Filter
      if (reviewFilterGroup !== 'ALL') {
        unreviewedAll = unreviewedAll.filter(r => {
          const sug = r.ML_GROUP || AI_SUGGEST[String(r.TXZ01 || '').toLowerCase().trim()] || r.MATGR;
          return sug === reviewFilterGroup;
        });
      }

      // Sorting (Linear, No Grouping)
      if (reviewSortOrder === 'CONF_HIGH') unreviewedAll.sort((a, b) => (b.ML_CONF || 0) - (a.ML_CONF || 0));
      else if (reviewSortOrder === 'CONF_LOW') unreviewedAll.sort((a, b) => (a.ML_CONF || 0) - (b.ML_CONF || 0));

      const total = unreviewedAll.length;
      reviewCurrentBatch = unreviewedAll.slice(reviewBatchStart, reviewBatchStart + REVIEW_BATCH_SIZE);
      const remaining = total - reviewBatchStart;
      const totalBatches = Math.ceil(total / REVIEW_BATCH_SIZE) || 1;
      const sessionBatchNum = Math.floor(reviewBatchStart / REVIEW_BATCH_SIZE) + 1;

      document.getElementById('review-count').textContent = `${remaining} remaining · Batch ${sessionBatchNum} of ${totalBatches}`;
      document.getElementById('sb-review').textContent = allReview.filter(r => !r._reviewed).length; // Keep sidebar global

      // Render the Filter Pills
      let filterHtml = `<button onclick="setReviewFilter('ALL')" style="font-size:10px;padding:4px 8px;border-radius:4px;cursor:pointer;border:1px solid var(--border);background:${reviewFilterGroup === 'ALL' ? 'var(--blue)' : 'transparent'};color:${reviewFilterGroup === 'ALL' ? '#fff' : 'var(--text2)'}">ALL</button>`;
      GROUPS.forEach(g => {
        const count = allReview.filter(r => !r._reviewed && (reviewFilterSource === 'ALL' || r.src === reviewFilterSource) && (r.ML_GROUP || AI_SUGGEST[String(r.TXZ01 || '').toLowerCase().trim()] || r.MATGR) === g).length;
        if (count > 0) {
          filterHtml += `<button onclick="setReviewFilter('${g}')" style="font-size:10px;padding:4px 8px;border-radius:4px;cursor:pointer;border:1px solid var(--border);background:${reviewFilterGroup === g ? 'var(--blue)' : 'transparent'};color:${reviewFilterGroup === g ? '#fff' : 'var(--text2)'}">${g} (${count})</button>`;
        }
      });
      document.getElementById('review-filters').innerHTML = filterHtml;

      document.getElementById('review-body').innerHTML = reviewCurrentBatch.map((r, i) => {
        const sug = r.ML_GROUP || AI_SUGGEST[String(r.TXZ01 || '').toLowerCase().trim()] || r.MATGR;
        const mlConf = r.ML_CONF ? r.ML_CONF.toFixed(1) + '%' : '';
        const consensusHtml = r.consensus_progress ?
          `<div style="font-size:9px;color:var(--text3);margin-top:2px">Consensus: <span style="color:var(--blue)">${r.consensus_progress}</span> reviews</div>` : '';
        const opts = GROUPS.map(grp => `<option value="${grp}" ${grp === sug ? 'selected' : ''}>${grp} — ${GN[grp] || grp}</option>`).join('');

        // Show top3 ML suggestions if available
        const top3Html = r.top3 && r.top3.length > 1 ?
          `<div style="margin-top:4px;display:flex;gap:4px;flex-wrap:wrap">` +
          r.top3.slice(0, 3).map(t =>
            `<span style="font-size:9px;padding:1px 5px;border-radius:3px;background:var(--surface3);color:var(--text2);cursor:pointer" 
             onclick="document.getElementById('rv-sel-${i}').value='${t.group}';document.getElementById('rv-edit-${i}').style.display='block';document.getElementById('rv-view-${i}').style.display='none'" 
             title="Click to select">${t.group} ${t.pct}%</span>`
          ).join('') + `</div>` : '';

        return `<tr id="rv${i}">
          <td><span class="tag ${r.src === 'EBAN' ? 'src-eban' : 'src-ekpo'}">${r.src}</span></td>
          <td class="td-mono">${r.BANFN || r.EBELN || '—'}</td>
          <td><span style="color:var(--yellow);font-size:12px">"${r.TXZ01 || '—'}"</span></td>
          <td id="rv-sug-${i}" data-grp="${sug}">
            ${gTag(sug)}
            ${mlConf ? `<span style="font-size:9px;color:var(--text3);font-family:var(--mono);margin-left:3px">${mlConf}</span>` : ''}
            ${consensusHtml}
            ${top3Html}
          </td>
          <td style="font-size:11px">${r.AFNAM || r.LIFNR || '—'}</td>
          <td class="td-mono">${r.WERKS || '—'}</td>
          <td>
            <div id="rv-view-${i}" class="ra">
              <button class="ra-btn ra-accept" onclick="acceptRow(${i})">✓ Accept</button>
              <button class="ra-btn" style="background:var(--blue-dim);color:var(--blue)" onclick="editRow(${i})">✎ Edit</button>
              <button class="ra-btn ra-reject" onclick="rejectRow(${i})">✕</button>
            </div>
            <div id="rv-edit-${i}" style="display:none">
              <select id="rv-sel-${i}" style="background:var(--surface2);border:1px solid var(--border2);color:var(--text);border-radius:4px;padding:3px 6px;font-size:11px;font-family:var(--mono)">${opts}</select>
              <button class="ra-btn ra-accept" style="margin-top:4px" onclick="saveEdit(${i})">✓ Save</button>
              <button class="ra-btn" style="background:var(--surface2);color:var(--text2);margin-top:4px" onclick="cancelEdit(${i})">Cancel</button>
            </div>
          </td>
        </tr>`;
      }).join('') || '<tr><td colspan="7" style="text-align:center;color:var(--text3);padding:24px">All records reviewed ✓</td></tr>';

      // Add next/prev batch buttons
      let paginationHtml = '';
      if (reviewBatchStart > 0 || remaining > REVIEW_BATCH_SIZE) {
        paginationHtml += '<tr><td colspan="7" style="text-align:center;padding:16px"><div style="display:flex;justify-content:center;gap:12px">';

        if (reviewBatchStart > 0) {
          paginationHtml += `<button class="btn btn-ghost" onclick="loadPrevBatch()" style="font-size:12px">◀ Previous Batch</button>`;
        }
        if (remaining > REVIEW_BATCH_SIZE) {
          const nextCount = Math.min(REVIEW_BATCH_SIZE, remaining - REVIEW_BATCH_SIZE);
          paginationHtml += `<button class="btn btn-ghost" onclick="loadNextBatch()" style="font-size:12px">Load Next ${nextCount} ▶</button>`;
        }

        paginationHtml += '</div></td></tr>';
      }
      if (paginationHtml) {
        document.getElementById('review-body').insertAdjacentHTML('beforeend', paginationHtml);
      }
    }

    function loadNextBatch() {
      reviewBatchStart += REVIEW_BATCH_SIZE;
      renderReviewBatch();
      document.getElementById('page-review').scrollIntoView({ behavior: 'smooth' });
      toast(`✓ Batch loaded — ${allReview.length - reviewBatchStart} records remaining`, 'ok');
    }

    function loadPrevBatch() {
      reviewBatchStart = Math.max(0, reviewBatchStart - REVIEW_BATCH_SIZE);
      renderReviewBatch();
      document.getElementById('page-review').scrollIntoView({ behavior: 'smooth' });
    }

    function renderReviewTable(data) { renderReviewBatch(); }
    // ── FEEDBACK LEARNING JS ──────────────────────────────────────────────
    // ── EXPORT / IMPORT ───────────────────────────────────────────────────
    function exportAnalyzedData() {
      if (!allAnalyzed || allAnalyzed.length === 0) {
        toast('No analyzed data to export yet.', 'warn');
        return;
      }

      // Select columns to export and map them
      const headers = ['Source', 'Document Number', 'Description', 'Original SAP Group', 'ML Predicted Group', 'Final Assigned Group', 'AI Confidence %', 'Issue Flag', 'Plant', 'Dept/Vendor'];

      const csvRows = [headers.join(',')];
      allAnalyzed.forEach(r => {
        const docNum = r.BANFN || r.EBELN || '';
        const desc = '"' + String(r.TXZ01 || '').replace(/"/g, '""') + '"';
        const origGrp = r.ORIG_MATGR || '';
        const mlGrp = r.ML_GROUP || '';
        const finGrp = r.MATGR || '';
        const conf = r.ML_CONF ? r.ML_CONF.toFixed(1) + '%' : '';
        const issue = r.issue || '';
        const plant = r.WERKS || '';
        const dept = r.AFNAM || r.LIFNR || '';

        csvRows.push([r.src, docNum, desc, origGrp, mlGrp, finGrp, conf, issue, plant, '"' + dept.replace(/"/g, '""') + '"'].join(','));
      });

      const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'analyzed_pr_po_data.csv';
      a.click();
      URL.revokeObjectURL(url);
      toast('✓ Downloaded fully processed dataset', 'ok');
    }


    async function exportFeedback() {
      try {
        const resp = await fetch('/api/feedback/export');
        if (resp.status === 404) { toast('No corrections to export yet', 'warn'); return; }
        if (!resp.ok) { toast('Export failed', 'warn'); return; }
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'feedback_' + new Date().toISOString().slice(0, 10) + '.csv';
        a.click();
        URL.revokeObjectURL(url);
        toast('✓ feedback.csv downloaded — keep this file safe!', 'ok');
      } catch (e) { toast('Export error: ' + e.message, 'warn'); }
    }

    async function importFeedback(input) {
      const file = input.files[0];
      if (!file) return;
      if (!confirm(`Import "${file.name}"? This will REPLACE your current corrections on the server. Make sure you exported first.`)) {
        input.value = ''; return;
      }
      try {
        const formData = new FormData();
        formData.append('file', file);
        const resp = await fetch('/api/feedback/import', { method: 'POST', body: formData });
        const data = await resp.json();
        if (data.imported) {
          toast(`✓ Imported ${data.total_corrections} corrections successfully!`, 'ok');
          refreshFeedbackStats();
        } else {
          toast('Import failed: ' + (data.error || 'unknown error'), 'warn');
        }
      } catch (e) {
        toast('Import error: ' + e.message, 'warn');
      }
      input.value = '';
    }

    function confirmResetFeedback() {
      if (confirm('Reset all feedback data and baseline? This cannot be undone.')) {
        fetch('/api/feedback/reset', { method: 'POST' }).then(() => {
          toast('✓ Feedback reset — fresh start', 'ok');
          refreshFeedbackStats();
        });
      }
    }

    function overwriteBaseline() {
      if (confirm('Overwriting the baseline will set the current numbers as the new "Week 1" starting point. Proceed?')) {
        const total = allAnalyzed.length;
        const clean = allAnalyzed.filter(r => r.issue === 'clean').length;
        const vague = allAnalyzed.filter(r => r.issue === 'vague').length;
        const misc = allAnalyzed.filter(r => r.issue === 'misclass').length;
        const quality = total > 0 ? Math.round(clean / total * 100) : 0;

        saveBaseline(vague, misc, quality);
        toast('✓ New baseline saved!', 'ok');
        refreshFeedbackStats();
      }
    }

    function saveBaseline(vague, misc, quality) {
      fetch('/api/analysis/baseline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vague, misclass: misc, quality })
      }).then(() => refreshFeedbackStats());
    }

    let correctionsPerCycle = [];

    function buildFeedbackTable() {
      refreshFeedbackStats();
      loadVerifyTab();
    }

    async function refreshFeedbackStats() {
      if (window.location.protocol === 'file:') return;
      try {
        const resp = await fetch('/api/feedback/stats');
        if (!resp.ok) return;
        const data = await resp.json();

        const total = data.total_corrections || 0;
        const retrains = data.retrains || 0;
        const realCorr = data.real_corrections || 0;
        const nextRet = data.next_retrain_in || (10 - (total % 10) || 10);
        const remaining = allReview ? allReview.filter(r => !r._reviewed).length : '—';

        // ── KPIs ──
        document.getElementById('fb-total-corrections').textContent = total;
        document.getElementById('fb-retrains').textContent = retrains;
        document.getElementById('fb-records-remaining').textContent = remaining;
        document.getElementById('fb-next-retrain').textContent = nextRet + ' until next retrain';
        document.getElementById('fb-real-corrections-sub').textContent = realCorr + ' real AI errors fixed';

        // ── Sidebar & chips ──
        const badge = document.querySelector('.sb-badge.green');
        if (badge) badge.textContent = total > 0 ? '+' + total + ' fixes' : '+0';
        document.querySelectorAll('.acc-chip').forEach(el => {
          el.innerHTML = `<div style="width:5px;height:5px;background:var(--green);border-radius:50%"></div>${total > 0 ? total + ' corrections active' : 'Model Accuracy: 91.2%'}`;
        });
        document.querySelectorAll('.sb-model-text').forEach(el => {
          el.textContent = total > 0 ? `TF-IDF + LogReg · ${total} corrections · LLM: 70B` : 'TF-IDF + LogReg · 91.2% · LLM: 70B';
        });

        // ── Impact Banner (baseline vs current) ──
        if (data.baseline) {
          document.getElementById('fb-no-baseline').style.display = 'none';
          document.getElementById('fb-impact-banner').style.display = 'block';
          const b = data.baseline;
          document.getElementById('imp-vague-base').textContent = Number(b.vague).toLocaleString();
          document.getElementById('imp-misc-base').textContent = Number(b.misclass).toLocaleString();
          document.getElementById('imp-quality-base').textContent = b.quality + '%';
          document.getElementById('fb-baseline-vague').textContent = b.quality + '%';
          const baseDate = b.saved_at || '—';
          if (document.getElementById('imp-baseline-date')) document.getElementById('imp-baseline-date').textContent = baseDate;
          if (document.getElementById('imp-baseline-date-val')) document.getElementById('imp-baseline-date-val').textContent = baseDate;

          const curVague = allVague.length || Number(b.vague);
          const curMisc = allMisclass.length || Number(b.misclass);
          const curQuality = allAnalyzed.length ? Math.round(allAnalyzed.filter(r => r.issue === 'clean').length / allAnalyzed.length * 100) : Number(b.quality);

          document.getElementById('imp-vague-now').textContent = curVague.toLocaleString();
          document.getElementById('imp-misc-now').textContent = curMisc.toLocaleString();
          document.getElementById('imp-quality-now').textContent = curQuality + '%';

          const vagDelta = Number(b.vague) - curVague;
          const miscDelta = Number(b.misclass) - curMisc;
          const qualDelta = curQuality - Number(b.quality);

          document.getElementById('imp-vague-delta').textContent = vagDelta > 0 ? '▼ ' + vagDelta + ' resolved' : vagDelta < 0 ? '▲ ' + Math.abs(vagDelta) + ' added' : '— no change';
          document.getElementById('imp-misc-delta').textContent = miscDelta > 0 ? '▼ ' + miscDelta + ' resolved' : miscDelta < 0 ? '▲ ' + Math.abs(miscDelta) + ' added' : '— no change';
          document.getElementById('imp-quality-delta').textContent = qualDelta > 0 ? '+' + qualDelta + '% improved' : qualDelta < 0 ? qualDelta + '%' : '— no change';

          const progressPct = Math.min(100, Math.round((curQuality / 95) * 100));
          document.getElementById('imp-progress-bar').style.width = progressPct + '%';
          document.getElementById('imp-progress-label').textContent = curQuality + '% current';
        } else {
          document.getElementById('fb-no-baseline').style.display = 'block';
          document.getElementById('fb-impact-banner').style.display = 'none';
        }

        // ── Corrections per cycle bar chart ──

        // ── Corrections per cycle bar chart ──
        if (retrains > 0 || total > 0) {
          correctionsPerCycle = [];
          if (retrains > 0) {
            for (let i = 1; i <= retrains; i++) {
              const c = i < retrains ? 10 : Math.max(1, total - (retrains - 1) * 10);
              correctionsPerCycle.push(c);
            }
          } else {
            // No retrains yet, show current progress in Cycle 1
            correctionsPerCycle.push(total);
          }
          document.getElementById('fb-chart-sub').textContent = retrains > 0
            ? `${total} corrections across ${retrains} cycles · next retrain in ${nextRet}`
            : `${total} corrections queued · ${nextRet} more until first retrain cycle`;
          updateFeedbackChart();
        }

        // ── All corrections history table ──
        // ── All corrections history table ──
        if (data.recent_corrections && data.recent_corrections.length > 0) {
          document.getElementById('real-corrections-section').style.display = 'block';
          document.getElementById('fb-corrections-count').textContent = total + ' total corrections';

          const filteredCorrections = data.recent_corrections.filter(c => {
            const grp = c.MATERIAL_GROUP || '';
            const wrong = c.WRONG_GROUP || '';
            const action = c.ACTION || 'accept';
            return !(wrong === grp && action === 'accept');
          });

          document.getElementById('fb-table').innerHTML = filteredCorrections.map(c => {
            const desc = c.DESCRIPTION || '';
            const grp = c.MATERIAL_GROUP || '';
            const wrong = c.WRONG_GROUP || '';
            const action = c.ACTION || 'accept';
            const ts = c.TIMESTAMP ? c.TIMESTAMP.split(' ')[1] || c.TIMESTAMP : '—';
            const isRealFix = wrong && wrong !== grp;
            return `<tr>
              <td style="color:${isRealFix ? 'var(--yellow)' : 'var(--text)'};font-weight:${isRealFix ? '600' : '400'}">"${desc}"</td>
              <td>${gTag(grp)}</td>
              <td>${isRealFix ? gTag(wrong) : '<span style="font-size:11px;color:var(--green)">✓ AI was correct</span>'}</td>
              <td><span style="font-size:11px;padding:2px 6px;border-radius:3px;background:${action === 'accept' ? 'var(--green-dim)' : action === 'edit' ? 'var(--blue-dim)' : 'var(--red-dim)'};color:${action === 'accept' ? 'var(--green)' : action === 'edit' ? 'var(--blue)' : 'var(--red)'}">${action}</span></td>
              <td style="font-size:11px;color:var(--text3);font-family:var(--mono)">${ts}</td>
            </tr>`;
          }).join('');
        }

      } catch (e) { console.log('Feedback stats error:', e); }
    }

    function updateFeedbackChart() {
      destroyChart('c-feedback');
      const co = { responsive: true, plugins: { legend: { display: false } } };
      const scl = { ticks: { color: '#8d96a0', font: { size: 9 } }, grid: { color: 'rgba(48,54,61,.6)' } };
      charts['c-feedback'] = new Chart(document.getElementById('c-feedback'), {
        type: 'bar',
        data: {
          labels: correctionsPerCycle.map((_, i) => `Cycle ${i + 1}`),
          datasets: [{
            data: correctionsPerCycle,
            backgroundColor: correctionsPerCycle.map((_, i) => i === correctionsPerCycle.length - 1 ? 'rgba(63,185,80,0.7)' : 'rgba(68,147,248,0.6)'),
            borderColor: correctionsPerCycle.map((_, i) => i === correctionsPerCycle.length - 1 ? '#3fb950' : '#4493f8'),
            borderWidth: 1, borderRadius: 4
          }]
        },
        options: { ...co, scales: { x: scl, y: { ...scl, beginAtZero: true, ticks: { ...scl.ticks, stepSize: 1, callback: v => v + ' fixes' } } } }
      });
    }

    async function loadVerifyTab() {
      if (window.location.protocol === 'file:') return;
      document.getElementById('verify-loading').style.display = 'block';
      document.getElementById('verify-empty').style.display = 'none';
      document.getElementById('verify-table').style.display = 'none';
      try {
        const resp = await fetch('/api/verify-learning');
        // Guard: if server returns HTML (error page) instead of JSON, fail gracefully
        const contentType = resp.headers.get('content-type') || '';
        if (!resp.ok || !contentType.includes('application/json')) {
          throw new Error(`Server returned ${resp.status} — expected JSON, got ${contentType}`);
        }
        const data = await resp.json();
        document.getElementById('verify-loading').style.display = 'none';

        if (!data.results || data.results.length === 0) {
          document.getElementById('verify-empty').style.display = 'block';
          return;
        }

        const learnedCount = data.results.filter(r => r.learned).length;
        const total = data.results.length;
        const pct = total === 0 ? 0 : Math.round((learnedCount / total) * 100);

        // If there are zero mistakes to test, we show N/A instead of 0% to avoid confusion
        const displayPct = total === 0 ? "—" : pct + "%";
        // Update summary badge
        const sumEl = document.getElementById('fb-learn-summary');
        if (sumEl) {
          sumEl.textContent = `${learnedCount}/${total} corrections learned (${pct}%)`;
          sumEl.style.color = pct >= 70 ? 'var(--green)' : pct >= 40 ? 'var(--yellow)' : 'var(--red)';
        }

        document.getElementById('verify-table').style.display = 'table';
        document.getElementById('verify-body').innerHTML = data.results.map(r => {
          const confBefore = r.original_confidence != null ? r.original_confidence.toFixed(1) + '%' : '—';
          const confAfter = r.correct_conf_now != null ? r.correct_conf_now.toFixed(1) + '%' : '—';
          const improved = r.correct_conf_now > (r.original_confidence || 0);
          const confColor = improved ? 'var(--green)' : 'var(--yellow)';
          const confArrow = r.original_confidence != null && r.correct_conf_now != null
            ? `<span style="font-size:10px;color:var(--text3);margin:0 3px">→</span><span style="color:${confColor}">${confAfter}</span>`
            : confAfter;
          return `<tr>
            <td style="color:var(--yellow);font-weight:600">"${r.description}"</td>
            <td>${gTag(r.ai_was_wrong)}<div style="font-size:9px;color:var(--text3);margin-top:2px">Confidence: ${confBefore}</div></td>
            <td>${gTag(r.analyst_corrected_to)}</td>
            <td>${gTag(r.current_prediction)}</td>
            <td style="font-family:var(--mono);font-size:12px">
              <span style="color:var(--text3)">${r.original_confidence != null ? confBefore : ''}</span>${confArrow}
            </td>
            <td>
              <span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:4px;background:${r.learned ? 'var(--green-dim)' : r.improving ? 'var(--blue-dim)' : 'var(--red-dim)'};color:${r.learned ? 'var(--green)' : r.improving ? 'var(--blue)' : 'var(--red)'}">
                ${r.learned ? '✅ Learned' : r.improving ? '🔄 Refining' : '⏳ Pending'}
              </span>
            </td>
          </tr>`;
        }).join('');

      } catch (e) {
        console.error('Verify Tab Error:', e);
        document.getElementById('verify-loading').style.display = 'none';
        const emptyEl = document.getElementById('verify-empty');
        if (emptyEl) {
          emptyEl.style.display = 'block';
          const msgEl = emptyEl.querySelector('div:last-child');
          if (msgEl) {
            msgEl.textContent = (e.name === 'SyntaxError') ? 'Analysis server returned invalid data.' : 'Could not reach analysis server. Please check your data or try again.';
          }
        }
      }
    }

    function loadLearningTable() {
      fetch('/api/feedback/stats')
        .then(r => r.json())
        .then(d => {
          let rows = '';
          const recents = d.recent_corrections || [];

          let conflicts = new Map();
          let hasConflict = false;

          let realCorrectionCount = 0;

          recents.forEach(item => {
            const desc = (item.DESCRIPTION || '').toLowerCase().trim();
            const grp = item.MATERIAL_GROUP || '';
            const actionCol = item.ACTION || '';
            const aiwrong = item.WRONG_GROUP || '';

            // Conflict Detection
            if (desc && grp) {
              if (!conflicts.has(desc)) conflicts.set(desc, new Set());
              conflicts.get(desc).add(grp);
            }

            // Exclude noise where AI was already correct AND it's just an accept action
            if (aiwrong === grp && actionCol === 'accept') {
              return; // Skip rendering
            }
            realCorrectionCount++;

            let actionHtml = actionCol;
            if (actionCol === 'accept') actionHtml = '<span style="color:var(--green)">accept</span>';
            if (actionCol === 'edit') actionHtml = '<span style="color:var(--blue)">edit</span>';
            if (actionCol === 'reject') actionHtml = '<span style="color:var(--red)">reject</span>';

            let aiCol = aiwrong ? `<span style="color:var(--red)">${aiwrong}</span>` : '—';
            if (aiwrong === grp) {
              aiCol = '<span style="color:var(--green)">✓ AI was correct</span>';
            }

            rows += `<tr>
              <td style="font-family:var(--mono);color:var(--text)">"${item.DESCRIPTION}"</td>
              <td><span class="ic-tag warn" style="color:var(--yellow)">${grp}</span></td>
              <td style="font-family:var(--mono);font-size:10px">${aiCol}</td>
              <td style="font-family:var(--mono);font-size:11px;font-weight:600">${actionHtml}</td>
              <td style="font-family:var(--mono);font-size:10px;color:var(--text3)">${item.TIMESTAMP || '—'}</td>
            </tr>`;
          });

          // Check if any description has multiple groups mapped
          for (let [desc, grps] of conflicts) {
            if (grps.size > 1) {
              hasConflict = true;
              break;
            }
          }

          const cw = document.getElementById('conflict-warning');
          if (cw) cw.style.display = hasConflict ? 'flex' : 'none';

          if (rows) {
            document.getElementById('real-corrections-section').style.display = 'block';
            document.getElementById('fb-table').innerHTML = rows;
            document.getElementById('fb-corrections-count').textContent = `${realCorrectionCount} real corrections`;
          } else {
            document.getElementById('real-corrections-section').style.display = 'none';
          }
        });
    }

    // ── FILTER TABLES ─────────────────────────────────────────────────────
    function filterTable(type, src, el) {
      document.querySelectorAll(`#page-${type === 'misc' ? 'misclass' : type} .filter-btn`).forEach(b => b.classList.remove('active'));
      el.classList.add('active');
      const data = src === 'all' ? (type === 'misc' ? allMisclass : allVague) : (type === 'misc' ? allMisclass : allVague).filter(r => r.src === src);
      if (type === 'misc') renderMiscTable(data); else renderVagueTable(data);
    }

    // ── REVIEW ACTIONS ────────────────────────────────────────────────────
    // ── REVIEW ACTIONS ────────────────────────────────────────────────────
    function acceptRow(idx) {
      if (!document.getElementById('rv' + idx)) return;
      document.getElementById('rv' + idx).style.opacity = '0.5';
      document.getElementById('rv' + idx).style.pointerEvents = 'none';
      const r = reviewCurrentBatch[idx];
      const sug = document.getElementById('rv-sug-' + idx).dataset.grp;

      r._reviewed = true;
      r.MATGR = sug;
      sendFeedback(r.TXZ01, sug, r.ORIG_MATGR || r.MATGR, 'accept');
    }

    function editRow(idx) {
      document.getElementById('rv-view-' + idx).style.display = 'none';
      document.getElementById('rv-edit-' + idx).style.display = 'block';
    }

    function cancelEdit(idx) {
      document.getElementById('rv-view-' + idx).style.display = 'flex';
      document.getElementById('rv-edit-' + idx).style.display = 'none';
    }

    function saveEdit(idx) {
      if (!document.getElementById('rv' + idx)) return;
      document.getElementById('rv' + idx).style.opacity = '0.5';
      document.getElementById('rv' + idx).style.pointerEvents = 'none';
      const r = reviewCurrentBatch[idx];
      const newGrp = document.getElementById('rv-sel-' + idx).value;

      r._reviewed = true;
      r.MATGR = newGrp;

      sendFeedback(r.TXZ01, newGrp, r.ORIG_MATGR || r.MATGR, 'edit');

      const sugEl = document.getElementById('rv-sug-' + idx);
      if (sugEl) sugEl.innerHTML = gTag(newGrp);
    }

    function rejectRow(idx) {
      if (!document.getElementById('rv' + idx)) return;
      document.getElementById('rv' + idx).style.opacity = '0.5';
      document.getElementById('rv' + idx).style.pointerEvents = 'none';
      const r = reviewCurrentBatch[idx];

      r._reviewed = true;
      sendFeedback(r.TXZ01, r.ORIG_MATGR || r.MATGR, r.ORIG_MATGR || r.MATGR, 'reject');
    }

    function acceptAllReview() {
      reviewCurrentBatch.forEach((r, i) => {
        if (document.getElementById('rv' + i) && document.getElementById('rv' + i).style.opacity !== '0.5') {
          acceptRow(i);
        }
      });
      setTimeout(() => { if (reviewBatchStart + REVIEW_BATCH_SIZE < allReview.length) loadNextBatch(); }, 1200);
    }
    // ── FEEDBACK API ─────────────────────────────────────────────────────
    async function sendFeedback(description, correctGroup, wrongGroup, action) {
      try {
        const resp = await fetch('/api/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description, correct_group: correctGroup, wrong_group: wrongGroup, action })
        });
        const data = await resp.json();
        if (data.retraining) {
          toast('🔄 10 corrections reached — model is retraining!', 'ok');
          setTimeout(refreshAccuracy, 5000);
        } else if (data.next_retrain_in) {
          toast(`✓ Correction saved — ${data.next_retrain_in} more until model retrains`, 'ok');
        }
        updateCorrectionCounter(data.total_corrections);

        // PERSISTENCE: LocalStorage (Safety net)
        try {
          const localStore = JSON.parse(localStorage.getItem('analyst_corrections') || '{}');
          const dLow = description.toLowerCase().trim();
          localStore[dLow] = { grp: correctGroup, count: (localStore[dLow]?.count || 0) + 1 };
          localStorage.setItem('analyst_corrections', JSON.stringify(localStore));
        } catch (e) { }
      } catch (e) { console.warn('Feedback API error:', e); }
    }

    async function refreshAccuracy() {
      try {
        const resp = await fetch('/api/health');
        const data = await resp.json();
        if (data.total_corrections !== undefined) {
          const total = data.total_corrections;
          document.querySelectorAll('.sb-model-text').forEach(el => {
            el.textContent = `TF-IDF + LogReg · ${total} corrections · LLM: 70B`;
          });
          document.querySelectorAll('.acc-chip').forEach(el => {
            el.innerHTML = `<div style="width:5px;height:5px;background:var(--green);border-radius:50%"></div> Model: ${total} corrections fed in`;
          });
          toast(`✅ Model retrained! ${total} total corrections in model.`, 'ok');
          loadVerifyTab();
        }
      } catch (e) { }
    }

    function updateCorrectionCounter(total) {
      const el = document.getElementById('total-corrections');
      if (el) el.textContent = total + ' corrections submitted';
    }

    function toast(msg, type) {
      const t = document.getElementById('toast');
      if (!t) return;
      t.textContent = msg;
      t.className = 'toast ' + (type || '');
      t.classList.add('show');
      setTimeout(() => t.classList.remove('show'), 3000);
    }

    // ══════════════════════════════════════════════════════════════════════
    // CHATBOX — Groq API
    // ══════════════════════════════════════════════════════════════════════
    let chatOpen = false, chatHistory = [];
    let cachedContext = '';

    function updateChatContext(total, clean, vague, misc, blank, quality, eban, ekpo, all) {
      const deptStats = {};
      all.filter(r => r.issue === 'misclass' || r.issue === 'vague').forEach(r => {
        let d = r.AFNAM || r.LIFNR || 'Unknown';
        if (d === '—' || d === '-') d = 'External Vendor';
        if (!deptStats[d]) deptStats[d] = { misc: 0, vague: 0, total: 0 };
        if (r.issue === 'misclass') deptStats[d].misc++; else deptStats[d].vague++;
        deptStats[d].total++;
      });
      const deptLines = Object.entries(deptStats)
        .sort((a, b) => b[1].total - a[1].total)
        .slice(0, 15)
        .map(([d, s]) => `${d}: ${s.misc} misclassified, ${s.vague} vague (total: ${s.total})`)
        .join('\n');

      const groupStats = {};
      GROUPS.forEach(g => {
        const grpAll = all.filter(r => r.MATGR === g);
        groupStats[g] = {
          total: grpAll.length,
          clean: grpAll.filter(r => r.issue === 'clean').length,
          vague: grpAll.filter(r => r.issue === 'vague').length,
          misc: grpAll.filter(r => r.issue === 'misclass').length,
        };
      });
      const groupLines = Object.entries(groupStats).map(([g, s]) => `${g}: ${s.total} total, ${s.clean} clean, ${s.vague} vague, ${s.misc} misclass`).join('\n');

      const mPairs = {};
      allMisclass.forEach(r => { const k = `${r.MATGR}→${r.correct}`; mPairs[k] = (mPairs[k] || 0) + 1; });
      const patternLines = Object.entries(mPairs).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([p, c]) => `${p}: ${c} records`).join('\n');

      const misRows = allMisclass.slice(0, 50).map(r => `${r.src} | ${r.TXZ01} | ${r.MATGR}→${r.correct}`).join('\n');
      const vagRows = allVague.slice(0, 50).map(r => `${r.src} | ${r.TXZ01} | ${r.MATGR}`).join('\n');

      cachedContext = `You are a highly intelligent SAP MM Executive Analyst AI.
CRITICAL INSTRUCTION: Analyze the provided data below and answer the user's question directly with concise, actionable insights. Do NOT output empty templates or skeleton responses. DO NOT use filler text. Synthesize the numbers into a meaningful business narrative.

--- CURRENT PROCUREMENT DASHBOARD METRICS ---
OVERALL KPIs:
Total Records Analyzed: ${total}
Clean Records: ${clean} (Quality Score: ${quality}%)
Vague Descriptions: ${vague}
Misclassified Records: ${misc}
Source Document Split: EBAN PRs = ${eban.length} | EKPO POs = ${ekpo.length}

MATERIAL CATEGORY BREAKDOWN:
${groupLines}

DEPARTMENTS/VENDORS WITH MOST ISSUES:
${deptLines}

FREQUENT ALGORITHMIC MISCLASSIFICATION PATTERNS:
${patternLines}

SAMPLE MISCLASSIFICATION RECORDS:
${misRows}

SAMPLE VAGUE RECORDS:
${vagRows}`;
    }

    function getSystemPrompt() {
      return cachedContext || "You are a SAP MM analyst. Please upload data first.";
    }

    function toggleChat() {
      chatOpen = !chatOpen;
      document.getElementById('chat-window').classList.toggle('open', chatOpen);
      document.getElementById('chat-fab').innerHTML = chatOpen ? '✕' : '💬';
      document.getElementById('chat-overlay').classList.toggle('show', chatOpen);
      if (chatOpen) setTimeout(() => document.getElementById('chat-input').focus(), 300);
    }
    function closeChat() { if (chatOpen) toggleChat(); }
    function clearChat() { chatHistory = []; document.getElementById('chat-messages').innerHTML = ''; addWelcomeMessage(); }

    function addWelcomeMessage() {
      const msgs = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'chat-msg';
      div.innerHTML = `<div class="chat-avatar ai">⬡</div><div class="chat-bubble ai">👋 Hi! I'm your AI Assistant. Upload data and I'll help you analyze it.</div>`;
      msgs.appendChild(div);
    }

    function renderMarkdown(text) {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    }

    function addMessage(role, text, extraHTML = '') {
      const msgs = document.getElementById('chat-messages');
      const div = document.createElement('div');
      div.className = 'chat-msg ' + (role === 'user' ? 'user' : '');
      div.innerHTML = role === 'ai'
        ? `<div class="chat-avatar ai">⬡</div><div class="chat-bubble ai">${renderMarkdown(text)}${extraHTML}</div>`
        : `<div class="chat-avatar user">👤</div><div class="chat-bubble user">${text}</div>`;
      msgs.appendChild(div);
      msgs.scrollTop = msgs.scrollHeight;
    }

    async function sendMessage() {
      const input = document.getElementById('chat-input');
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      addMessage('user', msg);
      chatHistory.push({ role: 'user', content: msg });

      try {
        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ system: getSystemPrompt(), messages: chatHistory.slice(-10) })
        });
        const data = await response.json();
        const reply = data.text || 'Error communicating with AI.';
        addMessage('ai', reply);
        chatHistory.push({ role: 'assistant', content: reply });
      } catch (err) { addMessage('ai', 'Network error.'); }
    }

    window.addEventListener('DOMContentLoaded', () => {
      addWelcomeMessage();
      refreshFeedbackStats();
      loadVerifyTab();
    });
  
