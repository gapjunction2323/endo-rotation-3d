window.ENDO_CONTENT = window.ENDO_CONTENT || {};

window.ENDO_CONTENT[4] = {
  scene: "Day 4. Floor 4 is two wings and a skybridge: oncology and dialysis on one side, the stone clinic and CT on the other. Today's calcium is too high, and you need to find out why before you fix it.",
  objectives: [
    'Correct calcium for albumin, grade the hypercalcemia, and let the PTH split the differential.',
    'Treat a calcium crisis in the right order: fluids, calcitonin, an antiresorptive, and steroids only when calcitriol drives it.',
    'Confirm primary hyperparathyroidism, rule out FHH, and know who needs a parathyroidectomy.',
    'Work up a kidney stone and prevent the next one with fluid, diet, and the right drug.'
  ],
  source: 'Endocrine Secrets (2009), Ch. 13, 14, 15 & 17; updates follow the Endocrine Society 2023 hypercalcemia-of-malignancy guideline. AACE and the Endocrine Society have no current guideline for primary hyperparathyroidism or stones, so those updates follow the 2022 International Workshop on primary hyperparathyroidism and the AUA kidney stone guidelines.',
  cast: {
    maya: { station: 'hcm', emoji: '👴🏻', name: 'Mr. Dawson, 64', color: '#f87171',
      lines: ['...what day is it? ...', '(His wife: "He\'s been confused all week, constipated, and peeing constantly. They just found the lung cancer last month.")'] },
    alvarez: { station: 'phpt', emoji: '👩🏼', name: 'Ms. Romero, 48', color: '#fbbf24',
      lines: ['This is my second kidney stone in three years. The urologist said my calcium was high and sent me over.', 'Honestly, I\'ve felt foggy and tired for a year. I thought it was just turning 48.'] },
    ortiz: { station: 'pager', emoji: '🧑🏽‍💻', name: 'Radiology Resident Malik', color: '#60a5fa',
      lines: ['Reading room\'s busy. I have calcium math, an intraoperative PTH, and two stones that need a plan. Grab a calculator.'] },
    sam: { station: 'crashcart',
      lines: ['The infusion center wants a calcium crash cart stocked. Match each drug to what it does before the next patient arrives?'] },
    noor: { station: 'mechanism', emoji: '👩🏾‍⚕️', name: 'Nephrology Fellow Adeyemi', color: '#f59e0b',
      lines: ['Every high calcium comes from bone, kidney, or gut. Ten causes, three buttons. Go.'] },
    carrel: { station: 'pearls',
      lines: ['Day 4 rapid-fire synthesis. Stones, bones, groans, and moans.'] },
    okafor: { station: 'boss',
      lines: ['Have a seat at the tumor board table. Four questions on calcium. No options, and no hiding behind the PTHrP.'] }
  },
  stations: [
    {
      id: 'hcm',
      type: 'consult',
      title: 'Ward Consult #1: The Confused Smoker',
      icon: '🫁',
      chart: {
        hpi: '64-year-old man with 50 pack-years and squamous cell lung cancer diagnosed last month. One week of confusion, constipation, polyuria, nausea, and poor intake.',
        vitals: 'HR 104 · BP 102/64 · RR 16 · T 36.9 °C · dry mucous membranes',
        exam: 'Drowsy but rousable, oriented to person only. No focal deficits. ECG: sinus tachycardia with a short QT interval.',
        labs: [
          ['Calcium (total)', '14.6 mg/dL (ULN 10.5)'],
          ['Albumin', '2.6 g/dL'],
          ['Creatinine', '1.9 mg/dL (baseline 0.9)'],
          ['Phosphorus', '2.4 mg/dL'],
          ['Intact PTH', 'Pending']
        ]
      },
      rrt: 'Debrief: hypercalcemia makes patients dry, and being dry keeps the calcium up. Break that cycle with saline first, then add calcitonin and an antiresorptive. Steroids only help when calcitriol is the driver.',
      nodes: [
        {
          kind: 'calc',
          prompt: 'Correct his calcium for the albumin. What is the corrected calcium?',
          answer: { min: 15.6, max: 15.8, value: '15.7', unit: 'mg/dL' },
          xp: 10,
          fb: 'Corrected Ca = measured Ca + 0.8 × (4.0 − albumin) = 14.6 + 0.8 × 1.4 = <b>15.7 mg/dL</b>. That is severe: more than 3.5 above the upper limit (above 14 here). Low albumin hides calcium. When protein is abnormal, an ionized calcium is the most reliable number.'
        },
        {
          info: '<b>Intact PTH returns at 6 pg/mL</b> (normal 10–65).',
          prompt: 'What does the PTH tell you?',
          xp: 10,
          options: [
            { t: 'The hypercalcemia is not PTH-driven. With squamous lung cancer, this is humoral hypercalcemia of malignancy from PTHrP.', ok: true,
              fb: '<b>Correct.</b> A suppressed intact PTH reliably excludes hyperparathyroidism, the other big cause. Squamous cell lung cancer is the classic source of humoral hypercalcemia, and PTHrP is the mediator in over 90% of cases. A PTHrP level would confirm it but is not needed to start treatment.' },
            { t: 'Primary hyperparathyroidism. The PTH is in the low-normal range.',
              fb: 'A PTH of 6 is suppressed. In primary hyperparathyroidism, the PTH is high or inappropriately normal for the calcium.' },
            { t: 'You can\'t say anything until a PTHrP comes back.',
              fb: 'The PTH has already done the key work. PTHrP is an expensive confirmatory test, and treatment shouldn\'t wait for it.' },
            { t: 'Familial hypocalciuric hypercalcemia.',
              fb: 'FHH gives mild, lifelong, asymptomatic hypercalcemia with a normal or high PTH, not a calcium of 15.7 with confusion.' }
          ]
        },
        {
          prompt: 'He is confused and dry. What do you do in the first hour?',
          xp: 10,
          options: [
            { t: 'IV normal saline: a 1–2 L bolus, then 200–500 mL/h, watching his heart and lungs.', ok: true,
              fb: '<b>Correct.</b> Hypercalcemia causes polyuria, the dehydration lowers kidney function, and that cuts calcium excretion further. Saline dilutes the calcium and restores the urine flow that carries it out.' },
            { t: 'Furosemide 80 mg IV now to push calcium into the urine.', danger: true,
              fb: 'He is volume depleted. A loop diuretic before rehydration makes him drier and the calcium higher. Give it only after good hydration, and only to prevent fluid overload.' },
            { t: 'Zoledronic acid alone. Fluids can wait.',
              fb: 'Bisphosphonates take 2–4 days to work, and they are harder on dry kidneys. Fluids come first.' },
            { t: 'Emergency dialysis.',
              fb: 'Dialysis is for refractory hypercalcemia or hypercalcemia with kidney failure that can\'t take fluids. Start with saline.' }
          ],
          update: 'Endocrine Society 2023: loop diuretics should not be used routinely. Use them only to prevent fluid overload during hydration, such as in heart or kidney failure.'
        },
        {
          prompt: 'He is getting saline. What do you add?',
          xp: 10,
          options: [
            { t: 'Calcitonin for a fast effect, plus an antiresorptive: zoledronic acid 4 mg IV over 15 minutes, or denosumab.', ok: true,
              fb: '<b>Correct.</b> Calcitonin lowers calcium within hours but wears off in 48–72 hours (tachyphylaxis). The antiresorptive takes a few days and lasts for weeks. The book calls zoledronic acid the drug of choice for malignancy-associated hypercalcemia, with caution in kidney disease and myeloma.' },
            { t: 'Calcitonin alone, repeated every day for a week.',
              fb: 'Calcitonin stops working after 48–72 hours. It bridges you to the antiresorptive; it does not replace it.' },
            { t: 'Prednisone 60 mg daily.',
              fb: 'Glucocorticoids work when excess calcitriol drives the calcium, as in lymphoma or granulomatous disease. PTHrP-driven hypercalcemia doesn\'t respond.' },
            { t: 'Cinacalcet.',
              fb: 'Cinacalcet makes the calcium-sensing receptor more sensitive and lowers PTH. That helps parathyroid carcinoma, not a PTHrP-secreting lung cancer.' }
          ],
          update: 'Endocrine Society 2023: give an IV bisphosphonate or denosumab, with denosumab suggested over a bisphosphonate (weak recommendation). When calcium is above 14 mg/dL, add calcitonin at the start. If calcium stays high or comes back on a bisphosphonate, add denosumab. Denosumab is not cleared by the kidneys but causes more hypocalcemia, so check vitamin D.'
        },
        {
          info: '<b>Day 4.</b> Calcium is 10.9 mg/dL and his confusion has cleared. His wife asks what this means for him.',
          prompt: 'What do you tell his wife about his outlook?',
          xp: 5,
          options: [
            { t: 'The calcium is treatable, but it usually means advanced cancer. We should talk about his goals and his cancer treatment.', ok: true,
              fb: '<b>Correct.</b> Hypercalcemia of malignancy tends to appear at advanced stages. In one study, median survival after it developed was only 30 days. Treating the cancer is the most effective way to keep calcium down, and this is the moment for a goals-of-care conversation.' },
            { t: 'Now that the calcium is normal, the danger has passed.',
              fb: 'The calcium will come back unless the cancer is controlled, and its arrival signals advanced disease.' },
            { t: 'The cancer is probably in his bones, so radiation will cure the calcium.',
              fb: 'His mechanism is humoral (PTHrP), not local bone destruction. Treating the tumor itself matters most.' }
          ]
        },
        {
          info: '<b>Next bed:</b> a 58-year-old woman with diffuse large B-cell lymphoma. Calcium 13.2, intact PTH 4, PTHrP undetectable, 1,25-dihydroxyvitamin D high.',
          prompt: 'What is driving her calcium, and what helps most?',
          xp: 5,
          options: [
            { t: 'The lymphoma makes calcitriol (1α-hydroxylase), which raises gut absorption. Glucocorticoids are the key add-on.', ok: true,
              fb: '<b>Correct.</b> Some lymphomas, like granulomas in sarcoidosis or TB, convert 25-OH vitamin D to calcitriol. Glucocorticoids antagonize vitamin D, lower calcitriol production, and may be tumor-lytic. She still gets saline and an antiresorptive if the calcium is severe.' },
            { t: 'PTHrP, just like the lung cancer.',
              fb: 'Her PTHrP is undetectable, and her calcitriol is high. That pattern points to calcitriol-mediated hypercalcemia.' },
            { t: 'Local bone destruction, so steroids won\'t help.',
              fb: 'Local osteolysis gives low calcitriol. Hers is high, and steroids target exactly that.' }
          ]
        }
      ],
      outro: '🎉 Calcium normal, confusion gone, and the oncology team is planning his next treatment. He goes home on denosumab every 4 weeks. The PTH sorted out the differential in one test.'
    },
    {
      id: 'phpt',
      type: 'consult',
      title: 'Ward Consult #2: The Stones Came First',
      icon: '🪨',
      chart: {
        hpi: '48-year-old woman with her second calcium phosphate kidney stone in 3 years. A year of fatigue and "brain fog." Takes hydrochlorothiazide for blood pressure. No family history of high calcium.',
        vitals: 'BP 136/84 · HR 72 · BMI 26',
        exam: 'Unremarkable. No neck mass.',
        labs: [
          ['Calcium', '11.2 mg/dL (ULN 10.5), albumin 4.2'],
          ['Phosphorus', '2.3 mg/dL (low)'],
          ['Intact PTH', '98 pg/mL (10–65)'],
          ['Creatinine / eGFR', '0.8 / 88'],
          ['25-OH vitamin D', '18 ng/mL']
        ]
      },
      rrt: 'Debrief: high calcium plus a high or inappropriately normal PTH is primary hyperparathyroidism until FHH is ruled out. Stones alone make surgery the right answer, and imaging only tells the surgeon where to look.',
      nodes: [
        {
          prompt: 'What do you do before you call this primary hyperparathyroidism?',
          xp: 10,
          options: [
            { t: 'Stop the thiazide for at least a week, replete vitamin D, and repeat fasting calcium and PTH.', ok: true,
              fb: '<b>Correct.</b> The book confirms with repeated fasting calcium and at least two PTH levels weeks apart, off thiazides for at least a week. Thiazides raise calcium and can unmask mild disease. Low vitamin D raises PTH by itself, so replete it to above 30 ng/mL.' },
            { t: 'Order a sestamibi scan to make the diagnosis.',
              fb: 'Imaging never makes the diagnosis. Up to 1 in 5 true cases have a negative scan, and an incidental thyroid nodule can look positive. The calcium and PTH make the diagnosis.' },
            { t: 'Send a PTHrP.',
              fb: 'Her PTH is high. PTHrP is for the patient with suppressed PTH and a suspected cancer.' },
            { t: 'Restrict her dietary calcium to protect her kidneys.',
              fb: 'Restricting calcium without restricting oxalate increases oxalate absorption and calcium oxalate stones. Keep a normal calcium intake.' }
          ],
          update: '2022 International Workshop: replete vitamin D to ≥ 30 ng/mL, which is safe in primary hyperparathyroidism and does not raise calcium meaningfully.'
        },
        {
          info: '<b>Three weeks off the thiazide:</b> calcium 11.0, PTH 104, 25-OH vitamin D 34. 24-hour urine calcium 340 mg.',
          prompt: 'Could this be familial hypocalciuric hypercalcemia instead?',
          xp: 10,
          options: [
            { t: 'Unlikely. Her urine calcium is high; FHH has very low urinary calcium (calcium/creatinine clearance ratio below 0.01).', ok: true,
              fb: '<b>Correct.</b> FHH is an inactivating calcium-sensing receptor mutation: lifelong mild hypercalcemia, normal or high PTH, a family history, and low urine calcium (book: FECa under 1%; primary hyperparathyroidism is usually above 2%). Surgery doesn\'t fix FHH, so rule it out first.' },
            { t: 'Likely. Her PTH is high, and FHH also raises PTH.',
              fb: 'PTH can be normal or high in both. The urine calcium separates them, and hers is high.' },
            { t: 'Can\'t tell without a neck exploration.',
              fb: 'An exploration in FHH is needless and doesn\'t lower the calcium. The urine test answers the question.' }
          ],
          update: '2022 International Workshop: a calcium/creatinine clearance ratio below 0.01 suggests FHH, and genetic testing (CASR and related genes) confirms it.'
        },
        {
          prompt: 'Does she need a parathyroidectomy?',
          xp: 10,
          options: [
            { t: 'Yes. Kidney stones alone qualify her, and she is also under 50.', ok: true,
              fb: '<b>Correct.</b> The 2002 NIH criteria (in the book): calcium > 1 mg/dL above normal, urine calcium > 400 mg/day, creatinine clearance down 30%, T-score below −2.5, age under 50, calcium kidney stones, or follow-up not possible. The book adds: it is never wrong to recommend surgery to a fit patient with access to a skilled surgeon.' },
            { t: 'No. Her calcium is less than 1 mg/dL above normal.',
              fb: 'The calcium threshold is only one criterion. Stones and her age each qualify her on their own.' },
            { t: 'Only if her bone density shows osteoporosis.',
              fb: 'Osteoporosis is one criterion, but she already meets two others.' },
            { t: 'No. Cinacalcet is just as good.',
              fb: 'Cinacalcet lowers calcium but doesn\'t cure the disease or protect bone. Surgery is the only cure, and it lowers fracture risk.' }
          ],
          update: '2022 International Workshop surgical criteria: calcium > 1 mg/dL above normal; T-score ≤ −2.5 at the spine, hip, or distal radius, or a vertebral fracture; eGFR < 60; 24-hour urine calcium > 250 mg (women) or > 300 mg (men); kidney stones or nephrocalcinosis on imaging; or age < 50. Her urine calcium of 340 now qualifies her too.'
        },
        {
          prompt: 'She agrees to surgery. What imaging now?',
          xp: 5,
          options: [
            { t: 'Localize the gland, with a sestamibi scan plus neck ultrasound (or 4D-CT), so she can have a minimally invasive operation.', ok: true,
              fb: '<b>Correct.</b> Sestamibi SPECT is the procedure of choice for adenomas (85–90% accurate), and adding ultrasound raises sensitivity to about 95%. It is less useful for four-gland hyperplasia. Most surgeons need localization for minimally invasive surgery, reoperations, and suspected bilateral disease.' },
            { t: 'No imaging. An experienced surgeon always explores all four glands.',
              fb: 'A skilled surgeon finds the adenoma 90–95% of the time with a bilateral exploration. But the minimally invasive operation needs the gland localized first.' },
            { t: 'If the scan is negative, cancel the surgery.',
              fb: 'A negative scan doesn\'t mean no disease. It may mean hyperplasia or a small gland. She still meets criteria for surgery.' }
          ],
          update: '2022 International Workshop: options include sestamibi SPECT/CT, ultrasound, 4D-CT, and choline PET, chosen by local expertise. Choose a surgeon who does at least 50 parathyroidectomies a year.'
        },
        {
          info: '<b>In the OR:</b> PTH 210 pg/mL before the incision; 10 minutes after the adenoma comes out, 84 pg/mL.',
          prompt: 'Is the operation done?',
          xp: 5,
          options: [
            { t: 'Yes. PTH fell by 60%, more than the 50% that marks success.', ok: true,
              fb: '<b>Correct.</b> (210 − 84) ÷ 210 = 60%. Intact PTH has a half-life of about 2 minutes, so a 50% drop at 10 minutes means the overactive tissue is gone. About 85% of patients have a single adenoma.' },
            { t: 'No. PTH must be in the normal range before you close.',
              fb: 'The test is the percent drop, not a normal value. It keeps falling after surgery.' },
            { t: 'No. Explore the other three glands anyway.',
              fb: 'With an adequate drop, a full exploration adds risk without benefit. Explore when the PTH does not fall by 50%.' }
          ]
        },
        {
          prompt: 'Her cousin has mild primary hyperparathyroidism and refuses surgery. How do you follow him?',
          xp: 5,
          options: [
            { t: 'Calcium and creatinine yearly, bone density every 1–2 years at three sites including the forearm, stay hydrated, normal calcium diet, and no thiazides or lithium.', ok: true,
              fb: '<b>Correct.</b> The book: calcium twice a year, creatinine/eGFR and three-site DXA yearly, office visits every 6 months. The forearm matters because hyperparathyroidism thins cortical bone. If he needs medication, cinacalcet lowers calcium and a bisphosphonate protects bone.' },
            { t: 'Restrict calcium to 400 mg a day.',
              fb: 'Calcium restriction raises PTH further and worsens oxalate absorption. Keep a normal calcium diet.' },
            { t: 'Nothing. Mild disease never progresses.',
              fb: 'Some patients lose bone or develop stones over time. That is why monitoring is scheduled, and surgery is offered when a criterion appears.' }
          ],
          update: 'Cinacalcet was FDA-approved in 2011 for severe hypercalcemia from primary hyperparathyroidism when surgery isn\'t possible. It lowers calcium but does not improve bone density. Use a bisphosphonate or denosumab for bone.'
        }
      ],
      outro: '🎉 A single 1.2-g adenoma, PTH down 60%, and she went home the same day. At 6 months her calcium is 9.4 and she says the fog has lifted. Her stones were the first clue.'
    },
    {
      id: 'crashcart',
      type: 'match',
      title: 'Concept Matching: The Calcium Crash Cart',
      icon: '🧩',
      instructions: 'Tap a drug, then tap what it does.',
      xpPer: 2,
      pairs: [
        { l: 'Normal saline', r: 'Dilutes calcium and restores the urine flow that carries it out' },
        { l: 'Furosemide', r: 'Only after rehydration, to prevent fluid overload' },
        { l: 'Calcitonin', r: 'Works within hours; tachyphylaxis after 48–72 h' },
        { l: 'Zoledronic acid', r: '4 mg IV over 15 minutes; the most potent bisphosphonate' },
        { l: 'Pamidronate', r: '60–90 mg IV over 2–4 hours; less potent than zoledronic acid' },
        { l: 'Denosumab', r: 'RANKL antibody; not cleared by the kidneys' },
        { l: 'Glucocorticoids', r: 'For calcitriol-driven hypercalcemia: lymphoma and granulomas' },
        { l: 'Cinacalcet', r: 'Makes the calcium-sensing receptor more sensitive to calcium' },
        { l: 'Hydrochlorothiazide', r: 'Increases tubular calcium reabsorption; first-line for hypercalciuric stones' },
        { l: 'Potassium citrate', r: 'Raises urine citrate and pH; for hypocitraturia and uric acid stones' }
      ]
    },
    {
      id: 'mechanism',
      type: 'sort',
      title: 'Lightning Sort: Bone, Kidney, or Gut?',
      icon: '⚡',
      instructions: 'What is the main way this cause raises the calcium?',
      xpPer: 1,
      categories: [
        { key: 'B', label: 'Bone resorption' },
        { key: 'K', label: 'Kidney reabsorption' },
        { key: 'G', label: 'Gut absorption' }
      ],
      items: [
        { t: 'Primary hyperparathyroidism', c: 'B' },
        { t: 'PTHrP from a squamous cell lung cancer', c: 'B' },
        { t: 'Thyrotoxicosis', c: 'B' },
        { t: 'Prolonged immobilization', c: 'B' },
        { t: 'Hydrochlorothiazide', c: 'K' },
        { t: 'Milk-alkali syndrome', c: 'K' },
        { t: 'Familial hypocalciuric hypercalcemia', c: 'K' },
        { t: 'Sarcoidosis', c: 'G' },
        { t: 'Vitamin D intake above 10,000 IU a day', c: 'G' },
        { t: 'A lymphoma that makes calcitriol', c: 'G' }
      ],
      outro: 'Most hypercalcemia comes from <b>bone resorption</b>, which is why most drugs for it are antiresorptives. Kidney causes call for stopping the drug (thiazide, lithium, calcium-alkali), and gut causes driven by calcitriol respond to <b>glucocorticoids</b>. Hyperparathyroidism and cancer cause 90% of all hypercalcemia.'
    },
    {
      id: 'pager',
      type: 'pager',
      title: 'Pager Interrupts: The Reading Room',
      icon: '📟',
      nodes: [
        {
          kind: 'calc',
          info: '📟 <b>Wards:</b> calcium 11.4 mg/dL with an albumin of 2.4 g/dL.',
          prompt: 'What is the corrected calcium?',
          answer: { min: 12.6, max: 12.8, value: '12.7', unit: 'mg/dL' },
          xp: 5,
          fb: '11.4 + 0.8 × (4.0 − 2.4) = 11.4 + 1.28 = <b>12.7 mg/dL</b>, moderate hypercalcemia (12–14 with an upper limit of 10.5). Albumin changes alter total calcium but not ionized calcium.'
        },
        {
          kind: 'calc',
          info: '📟 <b>Endocrine clinic:</b> an 18-year-old with years of mild hypercalcemia. Serum calcium 11.5, serum creatinine 1.0; spot urine calcium 5 mg/dL, urine creatinine 90 mg/dL.',
          prompt: 'Calculate the calcium/creatinine clearance ratio: (urine Ca × serum Cr) ÷ (serum Ca × urine Cr).',
          answer: { min: 0.004, max: 0.006, value: '0.005', unit: '' },
          xp: 5,
          fb: '(5 × 1.0) ÷ (11.5 × 90) = <b>0.005</b>, well below 0.01, which points to FHH. The book does the same math using only the filterable 60% of serum calcium and gets an FECa of 0.8%, also under 1%. Test family members (and today, the CASR gene) and avoid neck surgery.'
        },
        {
          kind: 'calc',
          info: '📟 <b>No 24-hour urine yet:</b> a spot urine shows calcium 20 mg/dL and creatinine 70 mg/dL.',
          prompt: 'Estimate the 24-hour urine calcium (1.1 × the calcium/creatinine ratio, in mg/day).',
          answer: { min: 310, max: 320, value: '315', unit: 'mg/day' },
          xp: 5,
          fb: '20 ÷ 70 = 0.286 g per g of creatinine; × 1.1 ≈ <b>315 mg/day</b>. Normal is up to 4 mg/kg/day (about 240 mg in a 60-kg woman), so it is high, but under the 2002 surgical cutoff of 400. By the 2022 criteria (> 250 in women) it would qualify.'
        },
        {
          info: '📟 <b>OR 6:</b> intraoperative PTH 180 pg/mL at baseline, 120 pg/mL 10 minutes after the surgeon removed an enlarged gland.',
          prompt: 'What do you tell the surgeon?',
          xp: 5,
          options: [
            { t: 'Only a 33% drop. Keep exploring; there may be another adenoma or hyperplasia.', ok: true,
              fb: '<b>Correct.</b> A successful operation drops PTH at least 50% at 10 minutes. About 5% of patients have multiple adenomas and 10% four-gland hyperplasia.' },
            { t: 'That\'s a drop. Close.',
              fb: 'The threshold is 50%. A 33% drop means abnormal tissue is still there.' },
            { t: 'Recheck the PTH tomorrow morning.',
              fb: 'The point of the rapid PTH is to decide while the neck is still open.' }
          ]
        },
        {
          info: '📟 <b>CT:</b> a 4-mm stone in the distal ureter. First episode, pain controlled with oral medication, no fever, normal creatinine.',
          prompt: 'What is the plan?',
          xp: 5,
          options: [
            { t: 'Fluids and pain control, strain the urine to catch the stone, and follow up. Most stones this size pass.', ok: true,
              fb: '<b>Correct.</b> About 75% of distal ureteral stones under 5 mm pass on their own. Send the stone for analysis and get a chemistry panel. Refer to urology for persistent pain, stones over 5 mm, obstruction, or infection.' },
            { t: 'Urgent lithotripsy.',
              fb: 'Lithotripsy is for symptomatic stones of 1–2 cm, or stones that won\'t pass. This one probably will.' },
            { t: 'Restrict calcium to prevent the next one.',
              fb: 'Low-calcium diets raise oxalate absorption and calcium oxalate stones. Keep 1,000–1,200 mg of dietary calcium.' }
          ],
          update: 'AUA: offer an alpha-blocker such as tamsulosin to help pass distal ureteral stones of 10 mm or less. Low-dose noncontrast CT is the preferred scan.'
        },
        {
          info: '📟 <b>KUB:</b> no stone is visible, but CT shows a 6-mm renal stone. Urine pH is 5.0. Stone analysis from a prior episode: uric acid.',
          prompt: 'What is the main prevention strategy?',
          xp: 5,
          options: [
            { t: 'Raise urine pH with potassium citrate and increase fluid intake.', ok: true,
              fb: '<b>Correct.</b> Uric acid stones are radiolucent on KUB and almost never form unless the urine pH is below 5.5. At pH 6.5, about 90% is in the soluble urate form. Fluids and potassium citrate are often all that is needed; add allopurinol if stones continue.' },
            { t: 'Sodium bicarbonate is better than potassium citrate.',
              fb: 'Sodium loading raises urine calcium and can promote calcium stones. The book prefers potassium citrate.' },
            { t: 'Acidify the urine with cranberry juice.',
              fb: 'Acid urine is the problem. Uric acid is 100 times less soluble than urate.' }
          ],
          update: 'AUA: offer potassium citrate to raise urine pH in uric acid and cystine stone formers (to about 6.0 for uric acid, and about 7.0 for cystine).'
        },
        {
          info: '📟 <b>Psychiatry:</b> a man on lithium for 12 years has calcium 11.0 and PTH 72.',
          prompt: 'What is going on?',
          xp: 5,
          options: [
            { t: 'Lithium makes the calcium-sensing receptor less sensitive and lowers urine calcium. It may persist even after lithium stops.', ok: true,
              fb: '<b>Correct.</b> Lithium shifts the PTH-calcium curve to the right, so PTH stays up at any calcium level, and it blocks the renal receptor so less calcium is excreted, like FHH. Don\'t stop lithium without psychiatry. Cinacalcet has corrected the calcium in these patients.' },
            { t: 'Lithium toxicity. Hold it tonight.',
              fb: 'Stopping a long-term mood stabilizer abruptly is risky, and the hypercalcemia may not resolve anyway.' },
            { t: 'An unrelated adenoma. Lithium has nothing to do with it.',
              fb: 'Lithium is a known cause of hypercalcemia with high PTH. Some patients do have a true adenoma, but consider the drug first.' }
          ]
        }
      ]
    },
    {
      id: 'boss',
      type: 'boss',
      title: 'Attending Pimp Boss',
      icon: '👹',
      intro: 'Dr. Okafor turns off the tumor board screen. "Four questions on calcium. Answer before you reveal, and grade yourself honestly."',
      xpPer: 10,
      questions: [
        { q: 'A calcium of 12.1 comes back. Walk me through the workup.',
          a: '<ul><li><b>Is it real?</b> Correct for albumin (+0.8 per 1 g/dL below 4.0), or get an ionized calcium. Repeat it.</li><li><b>Get an intact PTH.</b> It splits the differential.</li><li><b>PTH high or inappropriately normal:</b> primary hyperparathyroidism. Rule out FHH (calcium/creatinine clearance ratio below 0.01), thiazides, and lithium. Check 25-OH vitamin D and creatinine.</li><li><b>PTH suppressed:</b> look for cancer (PTHrP; SPEP/UPEP for myeloma), calcitriol excess (1,25-D: lymphoma, sarcoidosis, TB), vitamin D or A excess, thyrotoxicosis, immobilization, and milk-alkali.</li></ul>Hyperparathyroidism and cancer cause 90% of cases. Primary hyperparathyroidism is 70% of outpatient cases; cancer is 50% of inpatient cases.' },
        { q: 'Calcium 15.7 with confusion. Treat it, in order.',
          a: '<ol><li><b>Saline:</b> a 1–2 L bolus, then 200–500 mL/h. Loop diuretics only for fluid overload, not routinely.</li><li><b>Calcitonin</b> for a fast effect (hours), knowing it fades after 48–72 hours.</li><li><b>An antiresorptive:</b> zoledronic acid 4 mg IV over 15 minutes, or denosumab (Endocrine Society 2023 suggests denosumab over a bisphosphonate).</li><li><b>Glucocorticoids</b> only for calcitriol-driven cases (lymphoma, granulomas).</li><li><b>Dialysis</b> for refractory hypercalcemia or kidney failure.</li></ol>Then treat the cause, and in cancer, have the goals-of-care conversation.' },
        { q: 'Who needs a parathyroidectomy?',
          a: 'Anyone symptomatic, plus asymptomatic patients meeting any criterion (2022 Workshop):<ul><li>Calcium > 1 mg/dL above normal</li><li>T-score ≤ −2.5 (spine, hip, or distal radius) or a vertebral fracture</li><li>eGFR < 60, 24-hour urine calcium > 250 (women) or > 300 (men), or stones or nephrocalcinosis on imaging</li><li>Age < 50</li></ul>Rule out FHH first. Localize before minimally invasive surgery, and confirm cure with a ≥ 50% PTH drop at 10 minutes. The book: it is never wrong to recommend surgery to a fit patient with an experienced surgeon.' },
        { q: 'A patient with recurrent calcium oxalate stones asks how to prevent the next one.',
          a: '<ul><li><b>Fluid:</b> enough to make more than 2 L of urine a day (AUA: at least 2.5 L).</li><li><b>Diet:</b> sodium ≤ 2,300 mg/day, protein ≤ 1 g/kg with less animal protein, a <b>normal</b> calcium intake of 1,000–1,200 mg (don\'t restrict it), less oxalate and vitamin C, and no grapefruit juice.</li><li><b>24-hour urine</b> to target therapy: a thiazide for hypercalciuria, potassium citrate for low citrate, allopurinol for high uric acid.</li><li>Look for primary hyperparathyroidism. It causes about 5% of hypercalciuric stones, and calcium phosphate stones are its signature.</li></ul>' }
      ]
    },
    {
      id: 'pearls',
      type: 'pearls',
      title: 'Rapid-Fire Synthesis',
      icon: '⚡',
      intro: 'Fifteen rapid-fire items in three formats: type it from memory, pick the best answer, and explain the why.',
      items: [
        { kind: 'recall', q: 'For each 1 g/dL that albumin falls below 4.0, how much do you add to the calcium (mg/dL)?',
          accept: { any: ['0.8', '.8'] },
          a: '0.8 mg/dL. Corrected Ca = measured Ca + 0.8 × (4.0 − albumin). Albumin changes don\'t affect ionized calcium.' },
        { kind: 'mcq', q: 'Which single test best separates the two leading causes of hypercalcemia?',
          options: [
            { t: 'Intact PTH', ok: true },
            { t: 'PTHrP' },
            { t: 'Alkaline phosphatase' },
            { t: 'Bone scan' }
          ],
          a: 'PTH is high or inappropriately normal in primary hyperparathyroidism, and suppressed in cancer and most other causes.' },
        { kind: 'recall', q: 'What percentage of humoral hypercalcemia of malignancy is caused by PTHrP?',
          accept: { any: ['90', '>90', 'more than 90', 'over 90'] },
          a: 'More than 90%. Squamous cell lung cancer is the classic source.' },
        { kind: 'mcq', q: 'Which cancers cause local osteolytic hypercalcemia?',
          options: [
            { t: 'Breast cancer with bone metastases, myeloma, and lymphoma', ok: true },
            { t: 'Squamous cell lung and head-and-neck cancers' },
            { t: 'Thyroid and adrenal cancers' },
            { t: 'Melanoma only' }
          ],
          a: 'Local osteolysis comes from cancer cells on the bone surface. Squamous cancers usually cause humoral (PTHrP) hypercalcemia instead.' },
        { kind: 'why', q: 'Why is saline the first treatment for severe hypercalcemia?',
          points: [
            'Hypercalcemia causes polyuria and dehydration',
            'Dehydration lowers kidney function and calcium excretion, creating a vicious cycle',
            'Saline dilutes the calcium and restores the urine flow that carries it out'
          ] },
        { kind: 'mcq', q: 'Calcitonin stops working after about how long?',
          options: [
            { t: '48–72 hours', ok: true },
            { t: '6 hours' },
            { t: '2 weeks' },
            { t: 'It never stops working' }
          ],
          a: 'Tachyphylaxis sets in after 48–72 hours, so calcitonin bridges to a bisphosphonate or denosumab.' },
        { kind: 'mcq', q: 'In which hypercalcemia do glucocorticoids work best?',
          options: [
            { t: 'Calcitriol-mediated, as in lymphoma or sarcoidosis', ok: true },
            { t: 'PTHrP-mediated lung cancer' },
            { t: 'Primary hyperparathyroidism' },
            { t: 'FHH' }
          ],
          a: 'Steroids antagonize vitamin D and lower calcitriol made by granulomas or lymphoma.' },
        { kind: 'recall', q: 'What fraction of primary hyperparathyroidism is caused by a single adenoma (%)?',
          accept: { any: ['85'] },
          a: 'About 85%. Multiple adenomas about 5%, four-gland hyperplasia about 10%, carcinoma under 1%.' },
        { kind: 'mcq', q: 'Which kidney stone type is most characteristic of hyperparathyroidism?',
          options: [
            { t: 'Calcium phosphate', ok: true },
            { t: 'Uric acid' },
            { t: 'Struvite' },
            { t: 'Cystine' }
          ],
          a: 'Calcium oxalate is the most common stone overall, but calcium phosphate is the signature of hyperparathyroidism.' },
        { kind: 'why', q: 'Why must you rule out FHH before a parathyroidectomy?',
          points: [
            'FHH also gives hypercalcemia with a normal or high PTH',
            'It is a lifelong, benign calcium-sensing receptor defect',
            'Neck surgery doesn\'t lower the calcium, so the operation is needless'
          ] },
        { kind: 'recall', q: 'At 10 minutes after removing the adenoma, PTH should fall by at least what percent?',
          accept: { any: ['50'] },
          a: 'At least 50%. Intact PTH has a half-life of about 2 minutes.' },
        { kind: 'mcq', q: 'A patient with calcium stones asks whether to cut out dairy. What do you say?',
          options: [
            { t: 'No. Keep 1,000–1,200 mg of calcium a day; cut sodium and animal protein instead.', ok: true },
            { t: 'Yes, under 400 mg a day' },
            { t: 'Yes, and avoid all fluids with calcium' },
            { t: 'Calcium intake doesn\'t matter' }
          ],
          a: 'Low calcium intake leaves oxalate free in the gut to be absorbed, which raises urinary oxalate and calcium oxalate stones.' },
        { kind: 'recall', q: 'Below what urine pH do uric acid stones form?',
          accept: { any: ['5.5'] },
          a: 'Below 5.5. Obesity and diabetes lower urine pH through insulin resistance, so uric acid stones are more common in those patients.' },
        { kind: 'mcq', q: 'Which drug is first-line for hypercalciuric calcium stones?',
          options: [
            { t: 'A thiazide diuretic', ok: true },
            { t: 'Furosemide' },
            { t: 'Triamterene' },
            { t: 'Calcitonin' }
          ],
          a: 'Thiazides increase tubular calcium reabsorption. Replace potassium and citrate with potassium citrate, and avoid triamterene, which can form stones itself.' },
        { kind: 'why', q: 'How does lithium cause hypercalcemia?',
          points: [
            'It makes the parathyroid calcium-sensing receptor less sensitive, so PTH stays high',
            'It blocks the receptor in the loop of Henle, so less calcium is excreted',
            'The problem can persist after lithium is stopped; cinacalcet can help'
          ] }
      ],
      pearls: [
        'Corrected calcium = measured Ca + {{c1::0.8}} × (4.0 − albumin).',
        'Calcium is about {{c1::50%}} ionized, {{c2::40%}} protein-bound, and 10% complexed.',
        'With an upper limit of 10.5, calcium of 12–14 is {{c1::moderate}} and above 14 is {{c2::severe}} hypercalcemia.',
        'The classic ECG sign of hypercalcemia is a short {{c1::QT}} interval.',
        'Hyperparathyroidism and cancer cause {{c1::90%}} of hypercalcemia.',
        'Primary hyperparathyroidism causes {{c1::70%}} of outpatient hypercalcemia; cancer causes {{c2::50%}} of inpatient cases.',
        'The causes of hypercalcemia: {{c1::VITAMINS TRAP}}.',
        'Most hypercalcemia comes from increased {{c1::bone resorption}}.',
        'In humoral hypercalcemia of malignancy, intact PTH is {{c1::suppressed}} and {{c2::PTHrP}} is high.',
        'PTHrP shares {{c1::8}} of its first 13 amino acids with PTH and binds the same receptor.',
        '1,25-dihydroxyvitamin D tends to be {{c1::high}} in primary hyperparathyroidism and {{c2::low}} in PTHrP-mediated hypercalcemia.',
        'Lymphomas and granulomas raise calcium by making {{c1::calcitriol}}; treat them with {{c2::glucocorticoids}}.',
        'Median survival after hypercalcemia of malignancy was only about {{c1::30 days}} in one study.',
        'Treatment order: {{c1::saline}}, calcitonin, {{c2::zoledronic acid}}, and glucocorticoids if indicated.',
        'Zoledronic acid: {{c1::4}} mg IV over {{c2::15}} minutes.',
        'Calcitonin loses its effect after {{c1::48–72}} hours.',
        'Single adenoma {{c1::85%}}, four-gland hyperplasia {{c2::10%}}, carcinoma under {{c3::1%}}.',
        'Primary hyperparathyroidism: high calcium, high or inappropriately normal {{c1::PTH}}, and low {{c2::phosphate}}.',
        'Stop {{c1::thiazides}} for at least a week before confirming primary hyperparathyroidism.',
        'FHH is an inactivating mutation of the {{c1::calcium-sensing receptor}}, with FECa below {{c2::1%}}.',
        'More than {{c1::85%}} of patients with primary hyperparathyroidism are asymptomatic.',
        '"Stones, bones, {{c1::abdominal groans}}, and {{c2::psychic moans}}."',
        'Classic X-ray: subperiosteal resorption of the {{c1::phalanges}} and a {{c2::salt-and-pepper}} skull.',
        'Hyperparathyroidism thins {{c1::cortical}} bone, so check DXA at the {{c2::distal radius}}.',
        'Sestamibi SPECT finds {{c1::adenomas}} but is less useful for {{c2::hyperplasia}}.',
        'A successful parathyroidectomy drops PTH at least {{c1::50%}} at {{c2::10}} minutes.',
        'Calcium phosphate stones are most characteristic of {{c1::hyperparathyroidism}}.',
        'Hypercalciuria: urine calcium above {{c1::300}} mg/day in men, {{c2::250}} in women, or > {{c3::4}} mg/kg/day.',
        'Estimated 24-hour urine calcium = {{c1::1.1}} × the spot calcium/creatinine ratio.',
        'Calcium stones are {{c1::80%}} of all stones; calcium oxalate is the most common.',
        'Uric acid stones form only when urine pH is below {{c1::5.5}} and are {{c2::radiolucent}} on KUB.',
        'Struvite stones need {{c1::alkaline}} urine and infection; cystine crystals are {{c2::hexagonal}}.',
        'About {{c1::75%}} of distal ureteral stones under 5 mm pass on their own.',
        'Stone prevention: urine over {{c1::2 L}} a day, sodium ≤ {{c2::2,300}} mg, calcium {{c3::1,000–1,200}} mg.',
        'Restricting dietary calcium without restricting oxalate {{c1::increases}} calcium oxalate stones.',
        'Thiazides are first-line for hypercalciuric stones; add {{c1::potassium citrate}} to replace potassium and citrate.',
        'Lithium shifts the PTH-calcium curve to the {{c1::right}}, raising PTH and lowering urinary calcium.'
      ],
      updates: [
        'Endocrine Society 2023: treat hypercalcemia of malignancy with an IV bisphosphonate or {{c1::denosumab}}, with denosumab suggested over a bisphosphonate.',
        'Endocrine Society 2023: when calcium is above {{c1::14}} mg/dL, start {{c2::calcitonin}} together with the antiresorptive.',
        'Endocrine Society 2023: {{c1::loop diuretics}} should not be used routinely, only to prevent fluid overload.',
        'Endocrine Society 2023: for parathyroid carcinoma, use a {{c1::calcimimetic}} or an antiresorptive, adding the other if needed.',
        '2022 Workshop surgery criteria add 24-hour urine calcium > {{c1::250}} (women) or > {{c2::300}} (men), and eGFR < {{c3::60}}.',
        '2022 Workshop: a {{c1::vertebral fracture}} or T-score ≤ −2.5 at the spine, hip, or {{c2::distal radius}} is a surgical indication.',
        '2022 Workshop: a calcium/creatinine clearance ratio below {{c1::0.01}} suggests FHH; confirm with {{c2::genetic testing}}.',
        'Imaging in primary hyperparathyroidism is for {{c1::localization}} only, never for diagnosis.',
        'Replete 25-OH vitamin D to at least {{c1::30}} ng/mL in primary hyperparathyroidism.',
        '{{c1::Cinacalcet}} is FDA-approved for severe hypercalcemia from primary hyperparathyroidism when surgery isn\'t possible; it doesn\'t improve bone density.',
        'AUA: use an {{c1::alpha-blocker}} (tamsulosin) to help pass distal ureteral stones of 10 mm or less.',
        'Estimate kidney function with the race-free {{c1::CKD-EPI 2021}} equation, which replaced the MDRD equation used in the book.'
      ]
    }
  ]
};
