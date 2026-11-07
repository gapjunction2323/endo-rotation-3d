window.ENDO_CONTENT = window.ENDO_CONTENT || {};

window.ENDO_CONTENT[5] = {
  scene: "Day 5. The Bone & Mineral Center is a plus sign of hallways around a rotunda with a skeleton in the middle. Ortho has a hip fracture waiting, and short-stay has a patient whose hands are cramping after neck surgery.",
  objectives: [
    'Diagnose osteoporosis from a fracture or a DXA, read T- and Z-scores, and look for secondary causes.',
    'Choose and sequence osteoporosis drugs by fracture risk, including in patients on glucocorticoids.',
    'Treat acute hypocalcemia safely, and manage hypoparathyroidism for the long term.',
    'Tell osteoporosis, osteomalacia, and Paget\'s disease apart by labs, imaging, and history.'
  ],
  source: 'Endocrine Secrets (2009), Ch. 16, 8, 9, 10, 11 & 12; updates follow AACE 2020 and Endocrine Society (2019/2020) postmenopausal osteoporosis, Endocrine Society Paget\'s disease (2014) and vitamin D (2024) guidelines. Where AACE and the Endocrine Society have no current guideline, updates cite ACR 2022 (glucocorticoid-induced osteoporosis), the 2022 International Workshop on hypoparathyroidism, and ISCD.',
  cast: {
    maya: { station: 'hipfx', emoji: '👵🏼', name: 'Mrs. Lindqvist, 78', color: '#f87171',
      lines: ['I just turned to grab the kettle and down I went. They put a new hip in yesterday.', 'I\'ve been on prednisone for my shoulders for two years. Nobody ever checked my bones.'] },
    alvarez: { station: 'hypoca', emoji: '👩🏽', name: 'Ms. Okonjo, 44', color: '#fbbf24',
      lines: ['My lips are tingling and my hands keep cramping into claws.', 'They took out my whole thyroid yesterday for Graves\'. Is this normal?'] },
    ortiz: { station: 'pager', emoji: '🧑🏽‍💻', name: 'DXA Technologist Maria', color: '#60a5fa',
      lines: ['I\'ve got scans to interpret, a calcium count to tally, and a couple of tricky phone calls. Grab a calculator.'] },
    sam: { station: 'bonemeds',
      lines: ['The fracture liaison clinic needs its bone drugs sorted. Match each one to how it works or how to give it?'] },
    noor: { station: 'threebones', emoji: '👩🏾‍⚕️', name: 'MSK Radiologist Dr. Feld', color: '#f59e0b',
      lines: ['Ten films and lab panels. Each one is osteoporosis, osteomalacia, or Paget\'s. Call them fast.'] },
    carrel: { station: 'pearls',
      lines: ['Day 5 rapid-fire synthesis. Bones, minerals, and the hormones that run them.'] },
    okafor: { station: 'boss',
      lines: ['Stand here by the skeleton. Four questions on bone. No options.'] }
  },
  stations: [
    {
      id: 'hipfx',
      type: 'consult',
      title: 'Ward Consult #1: The Hip That Broke From Standing',
      icon: '🦴',
      chart: {
        hpi: '78-year-old woman who fell from standing in her kitchen. Right femoral neck fracture, hemiarthroplasty yesterday. Polymyalgia rheumatica on prednisone 10 mg daily for 2 years. Has lost 2 inches of height. Never had a DXA. Takes omeprazole and calcium carbonate 500 mg once a day.',
        vitals: 'BP 128/72 · HR 84 · weight 54 kg',
        exam: 'Thoracic kyphosis. Healing surgical wound. Cataracts in both eyes.',
        labs: [
          ['Calcium / albumin', '8.9 mg/dL / 3.6 g/dL'],
          ['Phosphorus', '3.0 mg/dL'],
          ['Alkaline phosphatase', '145 U/L (healing fracture)'],
          ['Creatinine / eGFR', '0.9 / 62'],
          ['25-OH vitamin D', '14 ng/mL'],
          ['TSH', '1.8 mU/L']
        ]
      },
      rrt: 'Debrief: a hip fracture from standing height is osteoporosis, whatever the DXA shows. Fix vitamin D, start a drug that prevents the next fracture before she leaves, and remember the prednisone and the falls.',
      nodes: [
        {
          prompt: 'Does she have osteoporosis, even without a DXA?',
          xp: 10,
          options: [
            { t: 'Yes. A hip fracture from standing height is a fragility fracture, and that makes the diagnosis.', ok: true,
              fb: '<b>Correct.</b> A fragility fracture happens spontaneously or after a fall from standing height or less. It diagnoses osteoporosis on its own. Her 2-inch height loss and kyphosis also suggest vertebral fractures, two-thirds of which are silent.' },
            { t: 'Not until a DXA shows a T-score of −2.5 or lower.',
              fb: 'The T-score criterion is for patients who haven\'t fractured yet. A fragility fracture already makes the diagnosis.' },
            { t: 'No. Falls cause fractures in anyone.',
              fb: 'A fall from standing shouldn\'t break a healthy hip. That is the definition of a fragility fracture.' },
            { t: 'Only if the alkaline phosphatase is high.',
              fb: 'Alkaline phosphatase rises with any healing fracture, and it is normal in most osteoporosis.' }
          ]
        },
        {
          prompt: 'Her 25-OH vitamin D is 14. What has to happen before any IV bisphosphonate?',
          xp: 10,
          options: [
            { t: 'Replete vitamin D and calcium first, because a bisphosphonate in a deficient patient can cause symptomatic hypocalcemia.', ok: true,
              fb: '<b>Correct.</b> With low vitamin D, PTH is holding her calcium up by pulling it from bone. Shut off bone resorption with zoledronic acid and the calcium can fall. The book: aim for 800–1,200 units a day of D3 (more to replete), with a 25-OH D goal of 30–100 ng/mL.' },
            { t: 'Nothing. Give the zoledronic acid today.',
              fb: 'Bisphosphonates are on the book\'s list of causes of hypocalcemia. In vitamin D deficiency that risk is real.' },
            { t: 'Check 1,25-dihydroxyvitamin D instead.',
              fb: '25-OH vitamin D reflects stores. 1,25-D stays normal until late because PTH keeps driving its production.' }
          ],
          update: 'Endocrine Society 2024 vitamin D guideline: no routine 25-OH D screening in healthy adults, and no single target level for the general population. That doesn\'t change things here: in a patient with a fragility fracture who is starting osteoporosis drugs, measure and replete vitamin D.'
        },
        {
          prompt: 'She takes omeprazole and one calcium carbonate 500 mg tablet a day. What do you change?',
          xp: 5,
          options: [
            { t: 'Switch to calcium citrate, and get her total calcium (diet plus pills) to about 1,200–1,500 mg a day.', ok: true,
              fb: '<b>Correct.</b> Calcium carbonate needs stomach acid, and a PPI can cut its absorption by up to 60%. Calcium citrate absorbs without acid. The book uses 1,500 mg for postmenopausal women and for anyone on glucocorticoids.' },
            { t: 'Stop the calcium. It causes kidney stones.',
              fb: 'Her intake is too low, not too high. Adequate calcium is the base of every osteoporosis regimen.' },
            { t: 'Triple the calcium carbonate and keep the PPI.',
              fb: 'More of a poorly absorbed pill isn\'t the fix. Change the type.' }
          ]
        },
        {
          prompt: 'Which drug do you start to prevent her next fracture?',
          xp: 10,
          options: [
            { t: 'Zoledronic acid 5 mg IV once a year. After a hip fracture it cut new fractures and death.', ok: true,
              fb: '<b>Correct.</b> In the trial of zoledronic acid after hip fracture (Lyles 2007), yearly infusions reduced new clinical fractures and mortality. Zoledronic acid, alendronate, and risedronate all lower hip fractures by 40–50%. Teriparatide is also effective in glucocorticoid-induced osteoporosis. Check creatinine before each IV dose.' },
            { t: 'Raloxifene 60 mg daily.',
              fb: 'Raloxifene reduces vertebral fractures but has not been shown to reduce hip fractures, and it doubles the risk of venous clots in a woman who just had hip surgery.' },
            { t: 'Calcitonin nasal spray.',
              fb: 'Calcitonin reduced vertebral fractures by only 33% and has no hip fracture data. It is a weak drug for a high-risk patient.' },
            { t: 'Estrogen plus progestin.',
              fb: 'After the WHI showed more heart attacks, strokes, clots, and breast cancer, hormone therapy is no longer used to treat osteoporosis.' }
          ],
          update: 'AACE 2020 calls her very high risk (recent fracture, glucocorticoids, age, frailty) and suggests starting with an anabolic drug (abaloparatide, teriparatide, or romosozumab) or with zoledronic acid or denosumab. ACR 2022 also prefers an anabolic drug for very-high-risk glucocorticoid users. Romosozumab should be avoided after a recent heart attack or stroke.'
        },
        {
          prompt: 'Her rheumatologist asks whether 10 mg of prednisone a day really matters for her bones.',
          xp: 10,
          options: [
            { t: 'Yes. Glucocorticoids suppress bone formation and increase resorption; use the lowest dose that controls her disease.', ok: true,
              fb: '<b>Correct.</b> Glucocorticoids kill osteoblasts and cut new ones, lower sex steroids, and reduce osteoprotegerin. Bone loss starts within 6 months, and up to 50% of long-term users fracture. Risk is highest at 7.5 mg or more, but rises even at 2.5 mg. The book treats every postmenopausal woman on ≥ 5 mg for 3 months or more.' },
            { t: 'No. Only doses above 20 mg affect bone.',
              fb: 'Fracture risk rises even at prednisolone doses around 2.5 mg a day, and it climbs steeply above 7.5 mg.' },
            { t: 'No. Switch her to inhaled steroids and the risk disappears.',
              fb: 'Inhaled glucocorticoids also lower bone density and raise fracture risk, just less.' }
          ],
          update: 'ACR 2022: assess fracture risk in everyone taking ≥ 2.5 mg of prednisone a day for more than 3 months (FRAX plus DXA with vertebral fracture assessment from age 40). Oral bisphosphonates are first-line at high risk. When stopping denosumab, romosozumab, or PTH-type drugs, follow with another drug to prevent rebound bone loss.'
        },
        {
          prompt: 'What else belongs in her discharge plan?',
          xp: 5,
          options: [
            { t: 'Fall prevention (review sedatives, fix vision, a walker, a safe home) and a baseline spine and hip DXA to monitor treatment.', ok: true,
              fb: '<b>Correct.</b> Falls drive most hip fractures. Sedatives, poor vision, cognitive impairment, leg weakness, and household obstacles are the major risk factors. Her cataracts are a fixable one. A baseline DXA lets you measure response, but it doesn\'t delay treatment.' },
            { t: 'Hip protectors only. Medications don\'t matter at her age.',
              fb: 'Drug therapy after a hip fracture lowers both the next fracture and mortality. Age is a reason to treat, not to skip it.' },
            { t: 'Strict bed rest for 6 weeks to protect the new hip.',
              fb: 'Immobilization accelerates bone loss and adds clots and pneumonia. She needs early mobilization with PT.' }
          ]
        },
        {
          info: '<b>Three years later.</b> She has had three yearly infusions. Bone density is stable and she hasn\'t fractured again. She asks how long she has to keep going.',
          prompt: 'How do you answer her question about a drug holiday?',
          xp: 5,
          options: [
            { t: 'Reassess her risk now. A holiday is reasonable only if she is no longer high risk; at very high risk, continue or switch drugs.', ok: true,
              fb: '<b>Correct.</b> Bone density usually rises for about 2 years on treatment and then plateaus, and that stability means the drug is still working. Deciding about a pause depends on her current fracture risk.' },
            { t: 'Stop for good. Three years is the maximum.',
              fb: 'There is no fixed maximum. The decision depends on her fracture risk, which is still high after a hip fracture on prednisone.' },
            { t: 'Keep going forever without reassessing.',
              fb: 'Long-term bisphosphonate use raises rare risks (osteonecrosis of the jaw, atypical femur fractures). Reassess at intervals.' }
          ],
          update: 'AACE 2020: consider a holiday after about 5 years of an oral bisphosphonate or 3 years of IV zoledronic acid in patients no longer at high risk; continue longer (up to 6 years IV or 10 years oral) at high risk. Denosumab is different: never stop it without moving to another drug, because rapid bone loss and multiple vertebral fractures can follow.'
        }
      ],
      outro: '🎉 Discharged on vitamin D3, calcium citrate, and her first zoledronic acid infusion scheduled for 2 weeks out, after her vitamin D is up. Her prednisone has been tapered to 5 mg, and cataract surgery is booked.'
    },
    {
      id: 'hypoca',
      type: 'consult',
      title: 'Ward Consult #2: Claws After the Thyroidectomy',
      icon: '🤲',
      chart: {
        hpi: '44-year-old woman, 18 hours after a total thyroidectomy for Graves\' disease. Perioral tingling, then painful cramping of both hands.',
        vitals: 'HR 96 · BP 118/70 · RR 18 · afebrile',
        exam: 'Positive Chvostek sign. Carpal spasm when a BP cuff is inflated (Trousseau sign). Neck incision clean and dry.',
        labs: [
          ['Calcium / albumin', '6.9 mg/dL / 4.0 g/dL'],
          ['Ionized calcium', '0.86 mmol/L (1.0–1.3)'],
          ['Phosphorus', '5.1 mg/dL (high)'],
          ['Magnesium', '1.4 mg/dL (low)'],
          ['Intact PTH', '6 pg/mL (low)'],
          ['ECG', 'QTc 510 ms']
        ]
      },
      rrt: 'Debrief: symptomatic hypocalcemia with a long QT is an emergency. Give IV calcium on a monitor, fix the magnesium, then start calcitriol and oral calcium. In hypoparathyroidism, aim for low-normal calcium, not normal.',
      nodes: [
        {
          prompt: 'Low PTH, high phosphate, low calcium after neck surgery. What is the cause?',
          xp: 10,
          options: [
            { t: 'Postsurgical hypoparathyroidism.', ok: true,
              fb: '<b>Correct.</b> Low calcium with a low PTH and high phosphate is hypoparathyroidism. Thyroid surgery is the most common cause. It may be transient (stunned glands) or permanent.' },
            { t: 'Hungry bone syndrome from her Graves\' disease.',
              fb: 'Hungry bones also follow surgery for hyperthyroidism, but the bones soak up phosphate too, so phosphate is low and PTH is normal or high. Hers is the opposite.' },
            { t: 'Vitamin D deficiency.',
              fb: 'In vitamin D deficiency, PTH rises (secondary hyperparathyroidism) and phosphate falls. Her PTH is low.' },
            { t: 'A lab artifact from low albumin.',
              fb: 'Her albumin is 4.0, and the ionized calcium is low too. This is real.' }
          ]
        },
        {
          prompt: 'She is cramping with a QTc of 510. What do you give first?',
          xp: 10,
          options: [
            { t: 'IV calcium gluconate: about 90–180 mg of elemental calcium over 10 minutes on a monitor, then an infusion of 0.5–2 mg/kg/h.', ok: true,
              fb: '<b>Correct.</b> One 10-mL ampule of 10% calcium gluconate holds 90 mg of elemental calcium. The book: 100–300 mg over 10 minutes, then 0.5–2.0 mg/kg/h. Symptomatic hypocalcemia, especially with QT prolongation, needs IV treatment.' },
            { t: 'Oral calcium carbonate and recheck in the morning.',
              fb: 'Oral calcium is for asymptomatic hypocalcemia. Tetany and a QTc of 510 need IV calcium now.' },
            { t: 'Calcium chloride pushed through her small hand IV.', danger: true,
              fb: 'Calcium chloride has three times the calcium of gluconate and is caustic. Through a small peripheral vein it can cause tissue necrosis if it leaks. Use calcium gluconate peripherally, and save chloride for a central line or a code.' },
            { t: 'IV sodium bicarbonate to calm the cramps.', danger: true,
              fb: 'Alkalosis increases calcium binding to albumin and lowers ionized calcium further. This would make the tetany worse.' }
          ]
        },
        {
          prompt: 'Her magnesium is 1.4. Does it matter?',
          xp: 5,
          options: [
            { t: 'Yes. Low magnesium impairs PTH release and action, so replace it or the calcium won\'t hold.', ok: true,
              fb: '<b>Correct.</b> Hypomagnesemia decreases PTH secretion and causes resistance to PTH. Chemotherapy, aminoglycosides, diuretics, and diarrhea are common causes. Replace magnesium alongside calcium.' },
            { t: 'No. Magnesium has nothing to do with calcium.',
              fb: 'Magnesium is needed for PTH to be released and to work. Refractory hypocalcemia is often a magnesium problem.' },
            { t: 'Only if it falls below 1.0.',
              fb: 'Even moderate deficiency blunts PTH. Replete it now.' }
          ]
        },
        {
          info: '<b>Day 3.</b> PTH is still undetectable. She is on a calcium gluconate infusion and wants to go home.',
          prompt: 'What long-term regimen do you start?',
          xp: 10,
          options: [
            { t: 'Oral calcium plus calcitriol, aiming for a low-normal calcium (about 8–8.5) without hypercalciuria.', ok: true,
              fb: '<b>Correct.</b> PTH drives the kidney\'s 1α-hydroxylase. Without PTH she can\'t make enough calcitriol, so give calcitriol directly. Aim for the low-normal range, because pushing to mid-normal without PTH spills calcium into the urine (stones, nephrocalcinosis).' },
            { t: 'Cholecalciferol 1,000 units a day.',
              fb: 'Plain vitamin D needs PTH-driven activation in the kidney. The book allows very large doses (50,000–100,000 units) only when calcitriol isn\'t available.' },
            { t: 'Calcium alone, titrated to a normal calcium of 9.5.',
              fb: 'Calcium alone is poorly absorbed without calcitriol, and chasing a mid-normal level raises urine calcium.' }
          ],
          update: '2022 International Workshop on hypoparathyroidism: target low-normal or slightly low calcium, normal phosphate and magnesium, and a normal 24-hour urine calcium. In 2024 the FDA approved palopegteriparatide, a once-daily PTH replacement for adults, and rhPTH(1–84) was discontinued. The book called PTH treatment experimental.'
        },
        {
          info: '<b>Meanwhile in the ICU:</b> a septic man with total calcium 7.2 and albumin 2.0.',
          prompt: 'The ICU team asks whether to give him calcium. What do you calculate and advise?',
          xp: 5,
          options: [
            { t: 'Corrected calcium is about 8.8, so likely normal. Check an ionized calcium before treating.', ok: true,
              fb: '<b>Correct.</b> 7.2 + 0.8 × (4.0 − 2.0) = 8.8. Low albumin is the most common cause of a low total calcium. Because citrate from transfusions, pH shifts, and sepsis all change binding, the book recommends ionized calcium in critically ill patients.' },
            { t: 'Give IV calcium. 7.2 is dangerously low.',
              fb: 'Corrected for his albumin, the total calcium is about normal. Treat the number that matters: the ionized calcium.' },
            { t: 'Start calcitriol.',
              fb: 'There is no evidence of hypoparathyroidism or vitamin D deficiency. Correct for albumin first.' }
          ]
        },
        {
          prompt: 'If her hypoparathyroidism is permanent, what chronic complications do you watch for?',
          xp: 5,
          options: [
            { t: 'Hypercalciuria with kidney stones and nephrocalcinosis, cataracts, and basal ganglia calcification.', ok: true,
              fb: '<b>Correct.</b> Chronic hypocalcemia causes cataracts, basal ganglia calcification, dry skin, coarse hair, and brittle nails. Treatment itself can cause hypercalciuria and kidney damage, so check urine calcium and kidney function regularly.' },
            { t: 'Osteoporosis from too little PTH.',
              fb: 'Without PTH, bone turnover is low and density tends to be normal or high.' },
            { t: 'None, as long as she feels well.',
              fb: 'Many complications are silent. Patients often only realize how unwell they were once treatment improves.' }
          ]
        }
      ],
      outro: '🎉 Six weeks later her PTH is back to 28, so her hypoparathyroidism was transient. She has weaned off calcitriol with normal calcium. The magnesium was the missing piece on day 1.'
    },
    {
      id: 'bonemeds',
      type: 'match',
      title: 'Concept Matching: The Fracture Liaison Shelf',
      icon: '🧩',
      instructions: 'Tap a drug, then tap how it works or how to give it.',
      xpPer: 2,
      pairs: [
        { l: 'Alendronate', r: 'Empty stomach, full glass of water, stay upright for 30 minutes' },
        { l: 'Zoledronic acid 5 mg', r: 'Once-yearly IV infusion; check creatinine before each dose' },
        { l: 'Denosumab', r: 'RANKL antibody every 6 months; don\'t stop without a follow-on drug' },
        { l: 'Raloxifene', r: 'SERM: fewer vertebral fractures and less breast cancer, more clots' },
        { l: 'Teriparatide', r: 'Daily PTH(1–34) injection that builds new bone' },
        { l: 'Romosozumab', r: 'Sclerostin antibody given monthly for 12 months; avoid after a recent MI or stroke' },
        { l: 'Calcitonin nasal spray', r: 'Modest vertebral benefit and some pain relief after fractures' },
        { l: 'Calcitriol', r: 'Active vitamin D for hypoparathyroidism and kidney failure' },
        { l: 'Calcium citrate', r: 'Absorbed without stomach acid; best for PPI users' },
        { l: 'Calcium gluconate 10%', r: '90 mg of elemental calcium per 10-mL ampule, IV' }
      ]
    },
    {
      id: 'threebones',
      type: 'sort',
      title: 'Lightning Sort: Which Bone Disease?',
      icon: '⚡',
      instructions: 'Osteoporosis, osteomalacia, or Paget\'s disease?',
      xpPer: 1,
      categories: [
        { key: 'OP', label: 'Osteoporosis' },
        { key: 'OM', label: 'Osteomalacia' },
        { key: 'PG', label: 'Paget\'s' }
      ],
      items: [
        { t: 'Normal calcium, phosphate, and alk phos; T-score −2.8', c: 'OP' },
        { t: 'A vertebral compression fracture after lifting groceries, with normal labs', c: 'OP' },
        { t: 'Low 25-OH vitamin D, low phosphate, high PTH, high alk phos', c: 'OM' },
        { t: 'Bilateral Looser zones (pseudofractures) in the pelvis and femoral necks', c: 'OM' },
        { t: 'Diffuse bone pain and a waddling gait from proximal weakness', c: 'OM' },
        { t: 'Wide osteoid seams on a tetracycline-labeled bone biopsy', c: 'OM' },
        { t: 'Alk phos 10 times normal, a bigger hat size, and hearing loss', c: 'PG' },
        { t: 'A "cotton-wool" skull on X-ray', c: 'PG' },
        { t: 'A bowed, warm tibia in a 72-year-old man', c: 'PG' },
        { t: 'Isolated high alk phos with normal liver tests in a 68-year-old', c: 'PG' }
      ],
      outro: '<b>Osteoporosis</b> has normal labs: too little bone, but normally mineralized. <b>Osteomalacia</b> is poorly mineralized bone, so vitamin D, phosphate, or alkaline phosphatase is usually off. <b>Paget\'s</b> is chaotic remodeling of one or several bones, with a high alkaline phosphatase. The single best treatment for Paget\'s is a bisphosphonate.'
    },
    {
      id: 'pager',
      type: 'pager',
      title: 'Pager Interrupts: The DXA Suite',
      icon: '📟',
      nodes: [
        {
          kind: 'calc',
          info: '📟 <b>Follow-up DXA:</b> spine BMD went from 0.812 to 0.845 g/cm² after a year of alendronate. The machine\'s least significant change is 2.8%.',
          prompt: 'What is the percent change in spine BMD?',
          answer: { min: 3.9, max: 4.2, value: '4.1', unit: '%' },
          xp: 5,
          fb: '(0.845 − 0.812) ÷ 0.812 = <b>4.1%</b>, which is more than the 2.8% least significant change, so it is a real gain. Always use absolute BMD (g/cm²) for percent changes, not T-scores.'
        },
        {
          info: '📟 <b>DXA report:</b> a 66-year-old woman with a femoral neck T-score of −3.0 and a Z-score of −2.5.',
          prompt: 'What does the Z-score add?',
          xp: 5,
          options: [
            { t: 'Her bone loss is greater than expected for her age, so look for secondary causes.', ok: true,
              fb: '<b>Correct.</b> A Z-score compares her with women her own age. Below −2.0 means more loss than aging explains. Look for hyperthyroidism, malabsorption or celiac disease, Cushing\'s, hypogonadism, vitamin D deficiency, myeloma, alcohol, and drugs.' },
            { t: 'Nothing. Only the T-score matters.',
              fb: 'The T-score diagnoses osteoporosis; the Z-score tells you whether something beyond aging is causing it.' },
            { t: 'Her osteoporosis is appropriate for her age.',
              fb: 'That would be a Z-score above −2.0. Hers is lower.' }
          ]
        },
        {
          kind: 'calc',
          info: '📟 <b>Clinic call:</b> each day she drinks 1 cup of milk, eats 1 cup of yogurt and 1 ounce of cheese, plus a regular nondairy diet.',
          prompt: 'Estimate her daily dietary calcium (mg).',
          answer: { min: 1200, max: 1200, value: '1200', unit: 'mg/day' },
          xp: 5,
          fb: 'About 300 mg each for the milk, yogurt, and cheese, plus 300 mg for the general diet = <b>1,200 mg</b>. If she is postmenopausal, the book\'s goal is 1,500 mg, so she needs about 300 mg more.'
        },
        {
          kind: 'calc',
          info: '📟 <b>Pharmacy:</b> a patient needs 600 mg more elemental calcium a day. She has Tums Extra Strength (750 mg calcium carbonate = 300 mg elemental).',
          prompt: 'How many tablets a day?',
          answer: { min: 2, max: 2, value: '2', unit: 'tablets' },
          xp: 5,
          fb: '600 ÷ 300 = <b>2 tablets</b>, taken with meals (carbonate needs stomach acid). Split doses absorb better than one large dose.'
        },
        {
          info: '📟 <b>Primary care:</b> a 63-year-old woman with a T-score of −1.8 and a FRAX 10-year major osteoporotic fracture risk of 22%.',
          prompt: 'Does she need medication?',
          xp: 5,
          options: [
            { t: 'Yes. Osteopenia with a FRAX major fracture risk of 20% or more (or hip risk of 3% or more) meets the treatment threshold.', ok: true,
              fb: '<b>Correct.</b> Treat if the T-score is −2.5 or lower, after a hip or vertebral fracture, or if the T-score is −1 to −2.5 with a high FRAX risk (≥ 20% major or ≥ 3% hip). AACE 2020 uses the same thresholds.' },
            { t: 'No. Osteopenia never needs medication.',
              fb: 'FRAX was built to find exactly these patients: osteopenia with a high fracture risk.' },
            { t: 'Only if she has already had a fracture.',
              fb: 'Waiting for a fracture is too late when her risk is already over the treatment threshold.' }
          ]
        },
        {
          info: '📟 <b>Phone call:</b> a woman on denosumab for 5 years wants to stop because her bone density is "fixed."',
          prompt: 'What do you tell her about stopping denosumab?',
          xp: 5,
          options: [
            { t: 'Don\'t simply stop. Move to a bisphosphonate (often zoledronic acid) about 6 months after the last dose.', ok: true,
              fb: '<b>Correct.</b> When denosumab stops, bone turnover rebounds sharply, the bone gained is lost within a year or two, and multiple vertebral fractures can follow. Always plan a follow-on antiresorptive.' },
            { t: 'Stop now. Denosumab protection lasts for years, like bisphosphonates.',
              fb: 'Unlike bisphosphonates, denosumab doesn\'t stay in bone. Its effect wears off within months.' },
            { t: 'Skip a dose and see what happens.',
              fb: 'A late or missed dose already begins the rebound. Keep the 6-month schedule until a transition is planned.' }
          ],
          update: 'The Endocrine Society and AACE both warn against stopping denosumab without a follow-on drug. This rebound wasn\'t known when the book was written; denosumab was still investigational then.'
        },
        {
          info: '📟 <b>Ortho clinic:</b> a man with known Paget\'s disease of the femur has new, worsening pain and swelling there, and his alkaline phosphatase has risen quickly after years of stability.',
          prompt: 'What do you worry about in his pagetic femur?',
          xp: 5,
          options: [
            { t: 'Sarcoma arising in pagetic bone. Image it and get a biopsy.', ok: true,
              fb: '<b>Correct.</b> Malignant transformation (usually osteosarcoma) happens in under 1% of patients but is very aggressive, with survival usually under a year. New pain, swelling, bone destruction on X-ray, and a rapidly rising alkaline phosphatase are the warning signs.' },
            { t: 'Normal Paget\'s activity. Increase his pain medicine.',
              fb: 'A sudden change in a stable patient isn\'t typical Paget\'s. Rule out sarcoma first.' },
            { t: 'Osteomalacia from his bisphosphonate.',
              fb: 'Only old high-dose etidronate impaired mineralization. Pain with swelling and a rising alk phos points to a tumor.' }
          ]
        }
      ]
    },
    {
      id: 'boss',
      type: 'boss',
      title: 'Attending Pimp Boss',
      icon: '👹',
      intro: 'Dr. Okafor taps the skeleton\'s femur. "Four questions on bone. Answer before you reveal, and grade yourself honestly."',
      xpPer: 10,
      questions: [
        { q: 'Teach me to read a DXA report.',
          a: '<ul><li><b>T-score:</b> SDs from young-adult peak bone mass. ≥ −1.0 normal, −1.0 to −2.5 low bone mass (osteopenia), ≤ −2.5 osteoporosis. Use the lowest of spine, total hip, and femoral neck; the forearm if those can\'t be read, or in hyperparathyroidism.</li><li><b>Z-score:</b> compared with age-matched people. Below −2.0 means look for a secondary cause.</li><li><b>BMD in g/cm²:</b> the only number to use for follow-up. Change must exceed the least significant change (about 2.8% spine, 5.7% hip in trials).</li><li><b>Pitfalls:</b> arthritis, osteophytes, aortic calcification, and compression fractures falsely raise spine BMD.</li></ul>A fragility fracture diagnoses osteoporosis whatever the T-score. 2026 Update: ISCD uses a white-female reference database for T-scores in women and men of all races.' },
        { q: 'A 70-year-old woman has a new vertebral fracture. Walk me through treatment.',
          a: '<ul><li><b>Basics for everyone:</b> calcium 1,200–1,500 mg (diet first), vitamin D 800–1,200 units, exercise, no smoking, limited alcohol, and fall prevention.</li><li><b>Look for secondary causes:</b> CBC, calcium, phosphate, alkaline phosphatase, creatinine, 25-OH D, 24-hour urine calcium, and TSH. In men, also testosterone.</li><li><b>Choose the drug by risk:</b> bisphosphonates for high risk. AACE 2020 starts with an anabolic drug (teriparatide, abaloparatide, or romosozumab) for very high risk: a recent or multiple fractures, a fracture on treatment, T-score below −3.0, glucocorticoids, or frailty.</li><li><b>Sequence:</b> follow every anabolic drug and denosumab with an antiresorptive. Teriparatide and abaloparatide up to 2 years; romosozumab 12 months.</li><li><b>Reassess</b> oral bisphosphonates at about 5 years and IV at about 3 for a possible holiday. Never just stop denosumab.</li></ul>' },
        { q: 'Calcium 6.8 and tetany after a thyroidectomy. Manage it now and for the next year.',
          a: '<ul><li><b>Now:</b> IV calcium gluconate (90 mg elemental per ampule), 100–300 mg over 10 minutes, then 0.5–2 mg/kg/h, on a cardiac monitor. Replace magnesium. Avoid alkalosis. Use calcium chloride only through a central line.</li><li><b>Confirm:</b> low PTH with high phosphate means hypoparathyroidism. Hungry bones gives low phosphate and a normal or high PTH.</li><li><b>Chronic:</b> calcitriol plus oral calcium, aiming for low-normal calcium (about 8–8.5) and a normal 24-hour urine calcium. Add a thiazide if urine calcium is high. Watch for stones, cataracts, and basal ganglia calcification.</li><li><b>2026 Update:</b> palopegteriparatide is an FDA-approved PTH replacement for adults when conventional therapy isn\'t enough.</li></ul>' },
        { q: 'How do osteomalacia and Paget\'s disease differ from osteoporosis, and how do you treat each?',
          a: '<ul><li><b>Osteomalacia:</b> bone that doesn\'t mineralize. Bone pain, proximal weakness, a waddling gait, and Looser zones. Labs show low or low-normal calcium and phosphate, high alkaline phosphatase, and in vitamin D deficiency, low 25-OH D and high PTH. Biopsy (widened osteoid seams) is the gold standard. Treat with vitamin D and calcium. For hypophosphatemic rickets, give phosphate plus calcitriol; for tumor-induced osteomalacia, remove the tumor. 2026 Update: burosumab (an FGF23 antibody) is approved for X-linked hypophosphatemia and tumor-induced osteomalacia.</li><li><b>Paget\'s disease:</b> chaotic remodeling of one or several bones in older adults. Alkaline phosphatase is high, a bone scan maps how far it extends, and X-rays show cotton-wool skull, bowing, and enlargement. Treat when there are symptoms, before surgery on pagetic bone, or when active disease involves weight-bearing bones, the skull, vertebrae, or bone next to a joint. Endocrine Society 2014: a single 5-mg zoledronic acid infusion is the treatment of choice. Watch for sarcoma.</li></ul>' }
      ]
    },
    {
      id: 'pearls',
      type: 'pearls',
      title: 'Rapid-Fire Synthesis',
      icon: '⚡',
      intro: 'Fifteen rapid-fire items in three formats: type it from memory, pick the best answer, and explain the why.',
      items: [
        { kind: 'recall', q: 'What T-score (or lower) defines osteoporosis by DXA?',
          accept: { any: ['-2.5', '−2.5', '2.5'] },
          a: '−2.5 or lower at the spine, total hip, or femoral neck. −1.0 to −2.5 is low bone mass (osteopenia).' },
        { kind: 'mcq', q: 'Which number on a DXA report should you use to track change over time?',
          options: [
            { t: 'Absolute BMD in g/cm²', ok: true },
            { t: 'T-score' },
            { t: 'Z-score' },
            { t: 'FRAX score' }
          ],
          a: 'Calculate percent change from absolute BMD, and compare it with the machine\'s least significant change.' },
        { kind: 'mcq', q: 'A 70-year-old has a Z-score of −2.4. What does that mean?',
          options: [
            { t: 'More bone loss than expected for her age; look for secondary causes', ok: true },
            { t: 'Normal for her age' },
            { t: 'She has osteomalacia' },
            { t: 'The scan is invalid' }
          ],
          a: 'A Z-score below −2.0 means something beyond aging is likely contributing.' },
        { kind: 'why', q: 'Why does a fragility fracture diagnose osteoporosis even with a normal DXA?',
          points: [
            'Bone strength depends on bone quality, not just bone mass',
            'A fall from standing height or less shouldn\'t break healthy bone',
            'A prior fracture raises the risk of the next one about fivefold'
          ] },
        { kind: 'recall', q: 'What prednisone dose (mg/day) carries the greatest fracture risk, according to the book?',
          accept: { any: ['7.5'] },
          a: '7.5 mg or more, but risk rises even at 2.5 mg, and inhaled steroids add risk too.' },
        { kind: 'mcq', q: 'Which calcium supplement absorbs best in a patient on a PPI?',
          options: [
            { t: 'Calcium citrate', ok: true },
            { t: 'Calcium carbonate' },
            { t: 'Calcium gluconate tablets' },
            { t: 'They are all the same' }
          ],
          a: 'Carbonate needs stomach acid; a PPI can cut its absorption by up to 60%.' },
        { kind: 'mcq', q: 'How should oral alendronate be taken?',
          options: [
            { t: 'Morning, empty stomach, full glass of water, upright for 30 minutes', ok: true },
            { t: 'With breakfast and milk' },
            { t: 'At bedtime lying down' },
            { t: 'With calcium tablets' }
          ],
          a: 'Food, calcium, and coffee block absorption. Staying upright protects the esophagus.' },
        { kind: 'why', q: 'Why can\'t you simply stop denosumab?',
          points: [
            'Denosumab doesn\'t stay in bone the way bisphosphonates do',
            'Bone turnover rebounds sharply within months of the last dose',
            'Rapid bone loss and multiple vertebral fractures can follow, so transition to a bisphosphonate'
          ] },
        { kind: 'recall', q: 'How many mg of elemental calcium are in one 10-mL ampule of 10% calcium gluconate?',
          accept: { any: ['90'] },
          a: '90 mg. Calcium chloride has the same 90 mg in just 2.5 mL, and is caustic to small veins.' },
        { kind: 'mcq', q: 'Low calcium, low PTH, and high phosphate after neck surgery. Diagnosis?',
          options: [
            { t: 'Hypoparathyroidism', ok: true },
            { t: 'Hungry bone syndrome' },
            { t: 'Vitamin D deficiency' },
            { t: 'Pseudohypoparathyroidism' }
          ],
          a: 'Hungry bones and vitamin D deficiency both give low phosphate. Pseudohypoparathyroidism has a high PTH.' },
        { kind: 'why', q: 'Why do patients with hypoparathyroidism need calcitriol rather than plain vitamin D?',
          points: [
            'PTH drives the kidney\'s 1α-hydroxylase',
            'Without PTH, vitamin D isn\'t converted to its active form',
            'Calcitriol bypasses that step and restores gut calcium absorption'
          ] },
        { kind: 'mcq', q: 'Which X-ray finding is classic for osteomalacia?',
          options: [
            { t: 'Looser zones (pseudofractures)', ok: true },
            { t: 'Cotton-wool skull' },
            { t: 'Subperiosteal resorption only' },
            { t: 'Punched-out lytic lesions' }
          ],
          a: 'Looser zones are transverse lucent bands, usually bilateral, in the femur, pelvis, and small bones of the hands and feet.' },
        { kind: 'recall', q: 'What is the gold-standard test for diagnosing osteomalacia?',
          accept: { any: ['biopsy'] },
          a: 'Bone biopsy after two courses of tetracycline labeling, showing widened osteoid seams and a long mineralization lag time.' },
        { kind: 'mcq', q: 'Which lab is the simplest way to follow Paget\'s disease?',
          options: [
            { t: 'Total alkaline phosphatase', ok: true },
            { t: 'Serum calcium' },
            { t: 'PTH' },
            { t: '1,25-dihydroxyvitamin D' }
          ],
          a: 'Calcium and phosphate are normal unless the patient is immobilized. Exclude liver disease as the source of a high alk phos.' },
        { kind: 'mcq', q: 'What is the most serious complication of Paget\'s disease?',
          options: [
            { t: 'Sarcoma in pagetic bone', ok: true },
            { t: 'Hearing loss' },
            { t: 'Hypercalcemia' },
            { t: 'Kidney stones' }
          ],
          a: 'It is rare (under 1%) but aggressive. New pain, swelling, and a rapidly rising alk phos are the warning signs.' }
      ],
      pearls: [
        'Osteoporosis is a T-score ≤ {{c1::−2.5}}; −1.0 to −2.5 is {{c2::low bone mass (osteopenia)}}.',
        'A {{c1::fragility fracture}} (from standing height or less) diagnoses osteoporosis regardless of DXA.',
        'Each 1-SD drop in bone mass {{c1::doubles}} fracture risk; a prior fracture raises it {{c2::fivefold}}.',
        'About {{c1::two-thirds}} of vertebral fractures are asymptomatic; height loss of {{c2::2 inches}} suggests them.',
        'Hip fractures cause permanent disability in nearly {{c1::50%}} and about {{c2::20%}} excess mortality.',
        'The {{c1::Z-score}} compares with age-matched people; below {{c2::−2.0}}, look for secondary causes.',
        'Use the {{c1::lowest}} T-score of the spine and hip; use the forearm in {{c2::hyperparathyroidism}}.',
        'Track treatment with absolute BMD; the least significant change is about {{c1::2.8%}} at the spine.',
        'Treat osteopenia when FRAX major fracture risk is ≥ {{c1::20%}} or hip fracture risk is ≥ {{c2::3%}}.',
        'Calcium goals: {{c1::1,000}} mg/day before menopause and {{c2::1,500}} mg/day after menopause or on glucocorticoids.',
        'Each cup of milk or yogurt, or ounce of cheese, has about {{c1::300}} mg of calcium.',
        'A PPI can cut calcium {{c1::carbonate}} absorption by up to 60%; use calcium {{c2::citrate}}.',
        'Bisphosphonates cut vertebral fractures by {{c1::50–70%}} and hip fractures by {{c2::40–50%}}.',
        'Raloxifene lowers vertebral fractures and breast cancer but doubles {{c1::venous thrombosis}}.',
        'Denosumab blocks {{c1::RANKL}}; osteoprotegerin is the body\'s own {{c2::decoy receptor}}.',
        'Intermittent {{c1::PTH (teriparatide)}} builds bone; continuous PTH {{c2::resorbs}} it.',
        'Osteonecrosis of the jaw occurs mostly with {{c1::high-dose IV}} bisphosphonates in cancer patients.',
        'Glucocorticoids {{c1::suppress formation}} and {{c2::increase resorption}}; bone loss begins within {{c3::6 months}}.',
        'Treat all postmenopausal women on ≥ {{c1::5}} mg prednisone for ≥ {{c2::3}} months (book).',
        'Corrected Ca = measured Ca + {{c1::0.8}} × (4.0 − albumin).',
        'The most common cause of low total calcium is {{c1::hypoalbuminemia}}.',
        '{{c1::Alkalosis}} lowers ionized calcium; acidosis raises it.',
        '{{c1::Chvostek}} is a facial twitch; {{c2::Trousseau}} is carpal spasm with a BP cuff.',
        'Hypocalcemia {{c1::prolongs}} the QT interval.',
        'Low {{c1::magnesium}} impairs PTH secretion and action.',
        'Hypoparathyroidism: low calcium, low PTH, {{c1::high}} phosphate.',
        'Hypoparathyroidism and kidney failure need {{c1::calcitriol}}, because PTH drives 1α-hydroxylation.',
        'One ampule of 10% calcium gluconate = {{c1::90}} mg elemental calcium.',
        'Anticonvulsants and rifampin speed {{c1::25-OH vitamin D}} breakdown and can cause hypocalcemia.',
        '{{c1::25-OH vitamin D}} best reflects vitamin D stores.',
        'Osteomalacia is defective {{c1::mineralization}} of mature bone; rickets is the same in {{c2::growing}} bone.',
        'Vitamin D deficiency: low-normal calcium, low {{c1::phosphate}}, high {{c2::PTH}}, high alk phos.',
        'X-linked hypophosphatemic rickets is the most common {{c1::inherited}} rickets; treat with phosphate plus {{c2::calcitriol}}.',
        'Tumor-induced osteomalacia is caused by {{c1::FGF23}} from usually benign mesenchymal tumors.',
        'Paget\'s disease has three phases: {{c1::lytic}}, mixed, and {{c2::sclerotic}}.',
        'Paget\'s affects men slightly more ({{c1::3:2}}), mostly over age 50.',
        'Bisphosphonates are the treatment of choice for Paget\'s; a single {{c1::zoledronic acid}} infusion outperformed oral risedronate.',
        'Sarcoma develops in fewer than {{c1::1%}} of patients with Paget\'s disease.'
      ],
      updates: [
        'AACE 2020: "very high risk" (recent or multiple fractures, fracture on therapy, T-score < {{c1::−3.0}}, glucocorticoids, frailty) → start with an {{c2::anabolic}} drug.',
        'Endocrine Society: {{c1::bisphosphonates}} are first-line for high-risk postmenopausal osteoporosis.',
        'Romosozumab, a {{c1::sclerostin}} antibody, is given for {{c2::12}} months; avoid it with a recent MI or stroke.',
        'Teriparatide and abaloparatide are limited to about {{c1::2}} years, then followed by an antiresorptive.',
        'Never stop {{c1::denosumab}} without a follow-on bisphosphonate: rebound {{c2::vertebral fractures}} can follow.',
        'AACE: consider a bisphosphonate holiday after about {{c1::5}} years oral or {{c2::3}} years IV in patients no longer at high risk.',
        'ACR 2022: assess fracture risk in anyone on ≥ {{c1::2.5}} mg/day of prednisone for more than 3 months.',
        'ISCD: T-scores for men and women of all races use a {{c1::white female}} reference database.',
        'Endocrine Society 2024: {{c1::no routine}} 25-OH vitamin D screening in healthy adults.',
        '{{c1::Palopegteriparatide}} (2024) is an FDA-approved PTH replacement for adult hypoparathyroidism.',
        'Hypoparathyroidism target: {{c1::low-normal}} calcium with a normal 24-hour urine calcium.',
        '{{c1::Burosumab}}, an FGF23 antibody, treats X-linked hypophosphatemia and tumor-induced osteomalacia.',
        'Endocrine Society 2014: a single {{c1::5}}-mg zoledronic acid infusion is the treatment of choice for Paget\'s disease.'
      ]
    }
  ]
};
