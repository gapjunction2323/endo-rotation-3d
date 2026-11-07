window.ENDO_CONTENT = window.ENDO_CONTENT || {};

window.ENDO_CONTENT[3] = {
  scene: "Day 3. Floor 3 runs on fat, food, and sleep. A man's blood came back looking like milk, the bariatric clinic sent up a patient who dozes at red lights, and the sleep lab pages all night.",
  objectives: [
    'Know which lipoprotein carries what, and name the inherited dyslipidemias from their clues.',
    'Treat a triglyceride level above 1,000 mg/dL as a pancreatitis emergency, then pick the right long-term drugs.',
    'Stage obesity by BMI and waist, set a realistic goal, and match patients to diet, drugs, or surgery.',
    'Explain how sleep times hormone release, and how sleep loss and sleep apnea disturb glucose, appetite, thyroid, and adrenal tests.'
  ],
  source: 'Endocrine Secrets (2009), Ch. 6, 7 & 60; updates follow AACE (2025 dyslipidemia) and Endocrine Society (hypertriglyceridemia, obesity pharmacotherapy) guidelines, with ACC/AHA 2026, ASMBS/IFSO 2022, and AASM where they add to them',
  cast: {
    maya: { station: 'tgpanc', emoji: '🧔🏻', name: 'Mr. Novak, 41', color: '#f87171',
      lines: ['It feels like a knife going straight through to my back. Started after the weekend.', 'The lab called twice. They said my blood looked like a milkshake?'] },
    alvarez: { station: 'osa', emoji: '👩🏽', name: 'Ms. Brooks, 46', color: '#fbbf24',
      lines: ["I'm here about weight-loss surgery. I've tried every diet there is.", 'My husband says I stop breathing at night. I nodded off at a red light last week. That scared me.'] },
    ortiz: { station: 'pager', emoji: '🧑🏽‍💻', name: 'Sleep Tech Dana', color: '#60a5fa',
      lines: ["Night shift in the sleep lab. I've got study results, a BMI, a statin question, and the ICU calling about a TSH. Grab a calculator."] },
    sam: { station: 'pharmacy',
      lines: ['Lipid drugs and weight-loss drugs are all mixed up on my shelf. Match each one to what it does before clinic opens?'] },
    noor: { station: 'phenotypes', emoji: '👩🏾‍⚕️', name: 'Lipid Nurse Grace', color: '#f59e0b',
      lines: ['Ten charts from this week. Each one is a classic inherited lipid disorder. Name them fast.'] },
    carrel: { station: 'pearls',
      lines: ['Day 3 rapid-fire synthesis. Lipids, weight, and sleep, all in one sitting.'] },
    okafor: { station: 'boss',
      lines: ["Walk with me around the garden. Four questions on fat, food, and sleep. No options this time."] }
  },
  stations: [
    {
      id: 'tgpanc',
      type: 'consult',
      title: 'Ward Consult #1: The Milkshake Serum',
      icon: '🥛',
      chart: {
        hpi: '41-year-old man with type 2 diabetes who stopped his metformin and insulin 6 months ago. Drinks 6–8 beers a day. One day of severe epigastric pain radiating to the back, with vomiting.',
        vitals: 'HR 112 · BP 128/80 · RR 20 · T 37.8 °C · BMI 33',
        exam: 'Epigastric tenderness with guarding. Crops of small yellow papules on the buttocks and the backs of the arms. The retinal vessels look creamy white.',
        labs: [
          ['Lipase', '1,450 U/L'],
          ['Triglycerides', '2,860 mg/dL'],
          ['Total cholesterol', '410 mg/dL'],
          ['Glucose', '342 mg/dL'],
          ['HCO₃ / β-hydroxybutyrate', '23 mEq/L / 0.4 mmol/L (normal)'],
          ['Lab comment', 'Sample grossly lipemic']
        ]
      },
      rrt: 'Debrief: a triglyceride level above 1,000 mg/dL is a pancreatitis emergency, and drugs alone will not bring it down. Stop the fat, fix what pushed it up (glucose, alcohol, estrogen, HIV drugs), then use a fibrate once the level is below 1,000.',
      nodes: [
        {
          prompt: 'What is driving his pancreatitis?',
          xp: 10,
          options: [
            { t: 'Severe hypertriglyceridemia. A level above 1,000 mg/dL sharply raises pancreatitis risk.', ok: true,
              fb: '<b>Correct.</b> Above 1,000 mg/dL, the risk of acute pancreatitis rises sharply, and the book puts its mortality at up to 10%. Most patients this high have an inherited triglyceride disorder plus a secondary push. He has two: uncontrolled diabetes and alcohol.' },
            { t: 'Alcohol alone. The triglycerides are just a side effect of the pancreatitis.',
              fb: 'Alcohol is part of the story, and pancreatitis can raise triglycerides a little. A level near 3,000 is a cause, not a bystander.' },
            { t: 'Gallstones. Triglycerides are irrelevant until the ultrasound is back.',
              fb: 'An ultrasound is reasonable, but a triglyceride of 2,860 already explains the pancreatitis and needs treatment today.' },
            { t: 'Statin-induced pancreatitis.',
              fb: "He isn't on a statin. He isn't on anything, which is part of the problem." }
          ],
          update: 'The Endocrine Society grades fasting triglycerides as mild (150–199), moderate (200–999), severe (1,000–1,999), or very severe (≥ 2,000 mg/dL). His 2,860 is very severe. Screen for secondary causes in everyone with hypertriglyceridemia.'
        },
        {
          prompt: 'How do you bring his triglycerides down fast?',
          xp: 10,
          options: [
            { t: 'Nothing by mouth, then a very-low-fat diet (under 5% fat) until TG is below 1,000; an insulin drip for his glucose; no alcohol.', ok: true,
              fb: '<b>Correct.</b> The book: medications alone do not work at this level. A very-low-fat diet lowers triglycerides about 20% a day, and the contributors (uncontrolled diabetes, alcohol, estrogen, HIV drugs) must be fixed at the same time. Insulin also reactivates lipoprotein lipase.' },
            { t: 'Start fenofibrate and fish oil, and he can eat what he likes.',
              fb: 'Fibrates are the best triglyceride drugs, but not until the level is below 1,000. Until then, diet and fixing the causes do the work.' },
            { t: 'High-dose atorvastatin tonight.',
              fb: 'Statins lower triglycerides only 10–20%. He will likely need one later for his diabetes, but it will not rescue him from 2,860.' },
            { t: 'A regular diet with extra calories for healing.', danger: true,
              fb: 'Dietary fat becomes chylomicrons, the very particles that are clogging his serum. Feeding fat now keeps the pancreatitis going.' }
          ],
          update: 'Many hospitals now give an IV insulin infusion (with dextrose if glucose is normal) for severe hypertriglyceridemic pancreatitis, and use plasmapheresis in selected cases. Evidence for both is limited, so follow your local protocol.'
        },
        {
          prompt: 'What are the yellow papules and the creamy retinal vessels?',
          xp: 5,
          options: [
            { t: 'Eruptive xanthomas and lipemia retinalis, the classic signs of chylomicronemia.', ok: true,
              fb: '<b>Correct.</b> Severe hypertriglyceridemia with chylomicronemia brings eruptive xanthomas, lipemia retinalis, hepatosplenomegaly, and pancreatitis. They fade as triglycerides fall.' },
            { t: 'Tendon xanthomas from familial hypercholesterolemia.',
              fb: 'Tendon xanthomas are firm nodules on the Achilles tendons and knuckles in FH, which raises LDL with normal triglycerides.' },
            { t: 'Planar xanthomas from dysbetalipoproteinemia.',
              fb: 'Planar xanthomas sit in the creases of the palms and soles in familial dysbetalipoproteinemia (type III, apo E2/E2).' },
            { t: 'Acanthosis nigricans.',
              fb: 'Acanthosis is velvety, darkened skin in body folds, a sign of insulin resistance, not lipid deposits.' }
          ]
        },
        {
          prompt: 'Why did his triglycerides climb this high?',
          xp: 10,
          options: [
            { t: 'Most likely an inherited triglyceride disorder unmasked by secondary causes: uncontrolled diabetes and alcohol.', ok: true,
              fb: '<b>Correct.</b> The book: most patients above 1,000 have a primary disorder (familial hypertriglyceridemia, familial combined hyperlipidemia, or dysbetalipoproteinemia) plus a secondary one. Other secondary causes: hypothyroidism, nephrotic syndrome, and drugs (estrogens, beta-blockers, diuretics, retinoids, steroids, HIV drugs). Check a TSH and urine protein, and screen his family.' },
            { t: 'Lipoprotein lipase deficiency since birth.',
              fb: 'LPL or apo C-II deficiency (familial chylomicronemia) usually shows up in childhood with pancreatitis. He has an obvious adult trigger.' },
            { t: 'A high-fat diet. Anyone who eats this way reaches 3,000.',
              fb: 'Diet matters, but most people who eat badly never get near 1,000. It takes a genetic setup plus a push.' },
            { t: 'Lab error. Lipemic samples give false results.',
              fb: 'The lipemia is the finding. The sample is milky because it is full of chylomicrons.' }
          ]
        },
        {
          info: '<b>Day 4.</b> Lipase is falling and he is eating a low-fat diet. Triglycerides are 860 mg/dL on basal-bolus insulin.',
          prompt: 'Which drug do you start for his triglycerides now?',
          xp: 10,
          options: [
            { t: 'Fenofibrate. Fibrates lower triglycerides the most, and fish oil, niacin, or a statin can be added.', ok: true,
              fb: '<b>Correct.</b> Once triglycerides are below 1,000, fibrates are the most effective drugs (30–50% lower). Fish oils lower them up to 45%, niacin 20–30%, statins 10–20%.' },
            { t: 'Gemfibrozil plus simvastatin 80 mg.', danger: true,
              fb: 'Fibrate plus statin raises the risk of myositis and rhabdomyolysis. When the combination is needed, the book uses fenofibrate, not gemfibrozil, with a low statin dose and CK monitoring.' },
            { t: 'A statin alone, because statins are the best lipid drugs.',
              fb: 'Statins are best for LDL. For triglycerides they manage only 10–20%.' },
            { t: 'A CETP inhibitor to raise his HDL.',
              fb: 'Torcetrapib raised HDL more than 50% and then increased coronary events and deaths. That trial was stopped.' }
          ],
          update: 'Endocrine Society: a fibrate is first-line when triglycerides threaten pancreatitis, and a statin should never be used alone for severe or very severe levels. AACE 2025: for triglycerides of 150–499 with ASCVD or high risk on a statin, add icosapent ethyl (pure EPA), but not EPA + DHA mixtures or niacin, which have not reduced events.'
        },
        {
          prompt: 'He has diabetes. What LDL goal does the 2009 text give him?',
          xp: 5,
          options: [
            { t: 'High risk, because diabetes is a CAD risk equivalent: LDL below 100, with below 70 as an option.', ok: true,
              fb: '<b>Correct.</b> ATP III counts diabetes as a CAD risk equivalent, so his LDL goal is the same as for someone who has had an MI. Non-HDL cholesterol (goal 30 above the LDL goal) matters too once triglycerides are above 200.' },
            { t: 'Below 160, since he has no coronary disease.',
              fb: 'Below 160 is for patients with 0–1 risk factors. Diabetes alone puts him in the high-risk group.' },
            { t: 'No goal until lipoprotein particle size is measured.',
              fb: 'The book: particle size and number testing has not shown cost-effectiveness. Decide with the standard lipid panel and his risk factors.' }
          ],
          update: 'AACE 2025 suggests an LDL target below 70 mg/dL for adults with ASCVD or increased risk, which includes diabetes. It moved away from its 2017 goal of below 55. ACC/AHA 2026 still uses below 55 for very-high-risk ASCVD and below 70 for diabetes with a PREVENT 10-year risk ≥ 10%. Both treat diabetes as high risk.'
        }
      ],
      outro: '🎉 Discharged with triglycerides of 420, on fenofibrate, basal-bolus insulin, and a referral to the alcohol program. His sister\'s screening panel is already ordered.'
    },
    {
      id: 'osa',
      type: 'consult',
      title: 'Ward Consult #2: The Dispatcher Who Dozes at Red Lights',
      icon: '😴',
      chart: {
        hpi: '46-year-old 911 dispatcher on night shifts, referred to the bariatric clinic. Type 2 diabetes on metformin and glargine, hypertension on three drugs, and knee osteoarthritis. Loud snoring; her husband sees her stop breathing at night.',
        vitals: 'BP 152/94 · HR 88 · weight 118 kg · height 1.65 m (BMI 43) · waist 49 in · neck 17.5 in',
        exam: 'Crowded oropharynx, mild retrognathia. Acanthosis nigricans at the neck. Crepitus in both knees.',
        labs: [
          ['A1C', '8.4%'],
          ['TSH', '2.1 mU/L'],
          ['Epworth Sleepiness Scale', '15'],
          ['24-h urine metanephrines', '1.6 × upper limit of normal (sent by her PCP for resistant hypertension)']
        ]
      },
      rrt: 'Debrief: obesity, sleep apnea, and diabetes feed each other. Diagnose sleep apnea with a sleep study before you chase her catecholamines, and match her treatment to her BMI and comorbidities.',
      nodes: [
        {
          prompt: 'Her BMI is 43, with diabetes. Which treatments is she a candidate for?',
          xp: 10,
          options: [
            { t: 'All of them: lifestyle, drugs, and bariatric surgery.', ok: true,
              fb: '<b>Correct.</b> The book: behavioral treatment for everyone; drugs for BMI > 27 with complications or > 30 without; surgery for BMI > 40, or > 35 with comorbidities. A BMI above 40 is severe (morbid) obesity.' },
            { t: 'Lifestyle only, until she proves it has failed for a year.',
              fb: 'She already qualifies for every option. Holding back treatment while diabetes and sleep apnea worsen is not neutral.' },
            { t: 'Drugs, but surgery only above BMI 50.',
              fb: 'Surgery is for BMI > 40, or > 35 with comorbidities. She is past both thresholds.' }
          ],
          update: 'Endocrine Society (obesity pharmacotherapy): drugs at BMI ≥ 30, or ≥ 27 with a weight-related condition; if weight loss is under 5% after 3 months, stop or switch. AACE frames obesity as a chronic disease (adiposity-based chronic disease) and treats by complications, not BMI alone. ASMBS/IFSO 2022: surgery at BMI ≥ 35 regardless of comorbidities, and considered at ≥ 30 with metabolic disease.'
        },
        {
          prompt: 'She snores, her husband sees apneas, and her Epworth score is 15. Next step?',
          xp: 10,
          options: [
            { t: 'A sleep study (polysomnography), and no driving while drowsy until she is treated.', ok: true,
              fb: '<b>Correct.</b> OSA needs a sleep study for diagnosis. An Epworth score above 9 means excessive daytime sleepiness, and a neck over 17 inches is the most sensitive exam finding. Dozing at a red light is a safety emergency.' },
            { t: 'Start CPAP tonight. The story is classic.',
              fb: 'The story is classic, but the diagnosis and the CPAP pressure both come from a sleep study.' },
            { t: 'Nothing. Night-shift workers are always tired.',
              fb: 'Sleep deprivation and sleep apnea differ: in sleep deprivation you breathe normally but don\'t sleep; in OSA you sleep but don\'t breathe. Witnessed apneas point to OSA.' },
            { t: 'A sleeping pill so she sleeps better between shifts.',
              fb: 'That treats none of the airway collapse, and sedatives can make apneas worse.' }
          ],
          update: 'AASM: for uncomplicated adults with a high pretest probability of moderate-to-severe OSA, a home sleep apnea test is an acceptable alternative to in-lab polysomnography.'
        },
        {
          prompt: 'What do you do about the elevated urine metanephrines?',
          xp: 10,
          options: [
            { t: 'Treat her sleep apnea first, then repeat the test. Untreated OSA can raise catecholamines and metanephrines.', ok: true,
              fb: '<b>Correct.</b> Repeated airway collapse brings hypoxia, hypercarbia, and a surge in adrenergic tone. A 24-hour urine collected with untreated OSA can falsely suggest pheochromocytoma, just as an MI or a stroke can.' },
            { t: 'An adrenal CT scan this week.',
              fb: 'Imaging before you confirm the biochemistry finds incidentalomas, not answers. Remove the cause of a false positive first.' },
            { t: 'Start phenoxybenzamine and refer her to surgery.',
              fb: 'That is the preparation for removing a proven pheochromocytoma. Hers isn\'t proven. Pheochromocytoma has its own day later in the rotation.' }
          ]
        },
        {
          info: '<b>Sleep study:</b> apnea-hypopnea index 38 events per hour, nadir oxygen saturation 78%. She starts CPAP.',
          prompt: 'What can CPAP do for her metabolism?',
          xp: 5,
          options: [
            { t: 'Restore her sleep and hormone rhythms and improve insulin sensitivity, although the gain is smallest in obese patients with diabetes.', ok: true,
              fb: '<b>Correct.</b> Treating OSA improves sleep architecture, normalizes hormone release, and improves glucose metabolism. In one study insulin sensitivity improved within 2 days in nondiabetic patients, most in the nonobese, but not in obese patients with type 2 diabetes. CPAP also normalizes leptin.' },
            { t: 'CPAP will cure her diabetes.',
              fb: 'Nothing in the data supports a cure. The benefit is real but modest, and smallest in obese patients with established diabetes.' },
            { t: 'Nothing. Sleep apnea and glucose are unrelated.',
              fb: 'OSA is independently linked to impaired fasting glucose, impaired glucose tolerance, and diabetes, even in normal-weight people. Each 4% drop in oxygen saturation nearly doubles the odds of worse glucose tolerance.' }
          ],
          update: 'The 2009 text says CPAP leads to weight loss. Meta-analyses of randomized trials found the opposite: a modest weight gain on CPAP. Weight loss still needs its own plan.'
        },
        {
          prompt: 'She chooses Roux-en-Y gastric bypass. What outcome do you quote her?',
          xp: 10,
          options: [
            { t: 'About 30% of her body weight (about 60% of excess weight), with diabetes resolving in about three-quarters and sleep apnea in most.', ok: true,
              fb: '<b>Correct.</b> Buchwald meta-analysis: 61% excess weight loss (about 30% of preoperative weight), diabetes resolved in 77%, sleep apnea resolved in 86%, hypertension resolved in 62%. Hypertension is the most resistant. 30-day mortality was 0.5% for gastric bypass.' },
            { t: 'She will reach her ideal body weight.',
              fb: 'Very few patients reach ideal weight with any treatment. Unrealistic expectations set patients up to feel they failed.' },
            { t: 'About 10%, the same as medications.',
              fb: 'Diet, exercise, or the drugs of 2009 give about 10%. Surgery gives about three times that.' }
          ],
          update: 'Sleeve gastrectomy is now the most common bariatric operation. Newer drugs close part of the gap: semaglutide 2.4 mg gives about 15% weight loss and tirzepatide about 20%. In 2024 the FDA approved tirzepatide for moderate-to-severe OSA in adults with obesity.'
        },
        {
          info: '<b>Four months after surgery.</b> She gets palpitations, sweating, cramps, and diarrhea about 20 minutes after orange juice and a slice of cake.',
          prompt: 'What is happening, and what do you advise?',
          xp: 5,
          options: [
            { t: 'Dumping syndrome. Eat small, frequent meals and avoid juices and added sugars.', ok: true,
              fb: '<b>Correct.</b> Dumping after simple sugars was reported in up to 76% of gastric bypass patients. Small, frequent meals without juice or added sugar prevent it.' },
            { t: 'An insulinoma. Start a 72-hour fast.',
              fb: 'Post-bypass hyperinsulinemic hypoglycemia (nesidioblastosis) is a rare, late complication. Symptoms 20 minutes after sugar are classic dumping.' },
            { t: 'A marginal ulcer. Schedule an endoscopy.',
              fb: 'Marginal ulcers and stomal stenosis present as prolonged nausea and vomiting after eating, or trouble advancing to solid food.' }
          ]
        },
        {
          prompt: 'What does she need for the rest of her life?',
          xp: 10,
          options: [
            { t: 'Daily supplements (multivitamin with thiamine, iron, B12, folate, calcium, vitamin D) and labs every 6 months for 2 years, then yearly.', ok: true,
              fb: '<b>Correct.</b> Bypass skips the stomach, duodenum, and part of the jejunum, so thiamine, iron, folate, B12, calcium, and vitamin D are malabsorbed. Check CBC, metabolic panel, lipids, A1C, ferritin, folate, B12, 25-OH vitamin D, and PTH every 6 months for 2 years, then yearly.' },
            { t: 'Nothing if she eats a balanced diet.',
              fb: 'Malabsorption is built into the anatomy. A balanced diet cannot get iron and B12 past a bypassed duodenum and stomach.' },
            { t: 'Calcium and vitamin D only.',
              fb: 'Those matter, but iron deficiency anemia, B12 deficiency, and thiamine deficiency are all common and avoidable.' }
          ],
          update: 'ASMBS micronutrient guidance now calls for higher vitamin D doses (about 3,000 IU a day, adjusted to keep 25-OH vitamin D above 30 ng/mL) and calcium citrate 1,200–1,500 mg a day in divided doses.'
        }
      ],
      outro: '🎉 One year out she is down 34 kg, off insulin, and sleeps through the night. Her repeat urine metanephrines were normal. The sleep apnea had been faking a tumor.'
    },
    {
      id: 'pharmacy',
      type: 'match',
      title: 'Concept Matching: The Lipid & Weight Pharmacy',
      icon: '🧩',
      instructions: 'Tap a drug, then tap what it does.',
      xpPer: 2,
      pairs: [
        { l: 'Statins', r: 'Block HMG-CoA reductase; LDL −20–60%' },
        { l: 'Ezetimibe', r: 'Blocks intestinal cholesterol absorption; LDL −20–25%' },
        { l: 'Bile acid resins', r: 'Bind bile acids in the gut; LDL −15–25%' },
        { l: 'Niacin', r: 'The biggest HDL rise of the classic drugs (+10–25%)' },
        { l: 'Fibrates', r: 'The strongest triglyceride drug (−30–50%)' },
        { l: 'Fenofibrate', r: 'The safer fibrate to pair with a statin; watch the CK' },
        { l: 'Fish oils', r: 'Lower triglycerides by up to 45%' },
        { l: 'Torcetrapib', r: 'CETP inhibitor: HDL +50%, yet more coronary events and deaths' },
        { l: 'Orlistat', r: 'Blocks pancreatic lipase; greasy stools; add a daily multivitamin' },
        { l: 'Phentermine', r: 'Noradrenergic amphetamine relative; watch blood pressure and heart rate' }
      ]
    },
    {
      id: 'phenotypes',
      type: 'sort',
      title: 'Lightning Sort: Name That Dyslipidemia',
      icon: '⚡',
      instructions: 'Which inherited lipid disorder fits the clue? FH = familial hypercholesterolemia; FCH = familial combined hyperlipidemia; Type III = familial dysbetalipoproteinemia.',
      xpPer: 1,
      categories: [
        { key: 'FH', label: 'FH' },
        { key: 'FCH', label: 'FCH' },
        { key: 'III', label: 'Type III' },
        { key: 'CHY', label: 'Chylomicronemia' }
      ],
      items: [
        { t: 'Achilles tendon xanthomas, LDL 290, normal triglycerides', c: 'FH' },
        { t: 'A defective LDL receptor; 1 in 500 people carry one copy', c: 'FH' },
        { t: 'A PCSK9 mutation that speeds LDL-receptor breakdown', c: 'FH' },
        { t: 'Yellow plaques in the creases of the palms', c: 'III' },
        { t: 'Apo E2/E2 with a broad beta band on electrophoresis', c: 'III' },
        { t: 'High apo B, and each relative has a different lipid pattern', c: 'FCH' },
        { t: 'The liver overproduces apo B, making extra VLDL and LDL particles', c: 'FCH' },
        { t: 'A lipoprotein lipase or apo C-II mutation', c: 'CHY' },
        { t: 'Eruptive xanthomas, triglycerides 4,000, and lipemia retinalis', c: 'CHY' },
        { t: 'Pancreatitis and an enlarged liver and spleen in childhood', c: 'CHY' }
      ],
      outro: 'Telling the two combined disorders apart: <b>FCH</b> has a high apo B, and <b>type III</b> has apo E2/E2 with a broad beta band. Both bring early coronary disease. In <b>FH</b>, homozygotes (cholesterol 800–1,200) can have coronary disease before age 20.'
    },
    {
      id: 'pager',
      type: 'pager',
      title: 'Pager Interrupts: Night in the Sleep Lab',
      icon: '📟',
      nodes: [
        {
          kind: 'calc',
          info: '📟 <b>New consult:</b> a patient weighs 118 kg and is 1.68 m tall.',
          prompt: 'What is the BMI?',
          answer: { min: 41.5, max: 42.1, value: '41.8', unit: 'kg/m²' },
          xp: 5,
          fb: '118 ÷ (1.68 × 1.68) = 118 ÷ 2.82 = <b>41.8 kg/m²</b>. Above 40 is severe (morbid) obesity; 35–39.9 is moderate, 30–34.9 is mild, and 25–29.9 is overweight. At BMI 25–30, waist size refines the risk.'
        },
        {
          kind: 'calc',
          info: '📟 <b>Clinic:</b> a patient weighing 220 lb asks what a realistic first goal is.',
          prompt: 'How many pounds is a 5% weight loss?',
          answer: { min: 11, max: 11, value: '11', unit: 'lb' },
          xp: 5,
          fb: '220 × 0.05 = <b>11 lb</b>. A sustained 5–10% loss lowers blood pressure and LDL, improves function, and markedly cuts the risk of diabetes. Most patients hope for far more, so set the goal together.'
        },
        {
          kind: 'calc',
          info: '📟 <b>Sleep study:</b> 6 hours of sleep, with 132 apneas and hypopneas scored.',
          prompt: 'What is the apnea-hypopnea index (AHI)?',
          answer: { min: 22, max: 22, value: '22', unit: 'events/h' },
          xp: 5,
          fb: '132 ÷ 6 = <b>22 events per hour</b>. An apnea is a ≥ 90% airflow drop for at least 10 seconds. If respiratory-effort arousals (RERAs) are counted too, the number is the respiratory disturbance index (RDI), which is not the same as the AHI.'
        },
        {
          info: '📟 <b>Sleep study:</b> AHI 9 in a man who came in for a research study. He has no snoring, sleepiness, or other complaints.',
          prompt: 'Does he have obstructive sleep apnea?',
          xp: 5,
          options: [
            { t: 'No. Without symptoms, OSA needs 15 or more events an hour; with symptoms, 5 or more.', ok: true,
              fb: '<b>Correct.</b> With patient or bed-partner complaints, 5 or more respiratory events an hour diagnoses OSA. Without complaints, it takes 15. Other medical, neurologic, and substance causes must also be excluded.' },
            { t: 'Yes. Any AHI of 5 or more is OSA.',
              fb: 'Five or more counts only with symptoms such as sleepiness, gasping, or witnessed apneas. Without them, it takes 15.' },
            { t: 'Yes. Start CPAP and recheck in a year.',
              fb: 'He does not meet criteria, so there is nothing to treat.' }
          ]
        },
        {
          info: '📟 <b>ICU:</b> TSH 6.4 mU/L with a normal free T4, drawn at 2 AM in a patient who has been awake all night with alarms and vitals checks.',
          prompt: 'What do you advise about this TSH?',
          xp: 5,
          options: [
            { t: "Don't treat it. Acute sleep loss removes sleep's normal nighttime TSH suppression; recheck after normal sleep.", ok: true,
              fb: '<b>Correct.</b> TSH normally rises in the early evening and is held down by sleep. In a night without sleep it can roughly double (about 1.5 to 3.8 in one study) and returns to baseline after recovery sleep. This may explain some high TSH values in acutely ill inpatients.' },
            { t: 'Start levothyroxine 50 mcg.',
              fb: 'Treating a TSH drawn after a sleepless night in the ICU treats the sleep loss, not the thyroid.' },
            { t: 'Order a thyroid ultrasound.',
              fb: 'Imaging adds nothing to a TSH that sleep loss can explain. Repeat the test when he is well and rested.' }
          ]
        },
        {
          kind: 'calc',
          info: '📟 <b>Lipid clinic:</b> LDL is 140 mg/dL on atorvastatin 20 mg. The patient asks what doubling the dose would do.',
          prompt: 'Using the 6% rule, about what LDL do you expect on 40 mg?',
          answer: { min: 131, max: 132.5, value: '132', unit: 'mg/dL' },
          xp: 5,
          fb: '140 × 0.94 ≈ <b>132 mg/dL</b>. The first statin dose gives most of the benefit, and each doubling adds only about 6% more. Adding ezetimibe, niacin, or a resin cuts LDL about 20% more (to about 112).'
        },
        {
          info: '📟 <b>Men\'s health clinic:</b> a 68-year-old starting testosterone for hypogonadism snores loudly and has an Epworth score of 12.',
          prompt: 'What do you do before you start?',
          xp: 5,
          options: [
            { t: 'Screen for sleep apnea, because testosterone can worsen it.', ok: true,
              fb: '<b>Correct.</b> In one randomized trial, high-dose testosterone in older hypogonadal men shortened sleep and worsened undiagnosed sleep apnea. OSA itself lowers SHBG and total and free testosterone, and levels improve once OSA is treated.' },
            { t: 'Start testosterone, which will improve his sleep.',
              fb: 'Testosterone can worsen OSA. His low level may even improve once his sleep apnea is treated.' },
            { t: 'Testosterone has no effect on sleep, so just start it.',
              fb: 'Androgens worsen OSA. Screen first.' }
          ]
        }
      ]
    },
    {
      id: 'boss',
      type: 'boss',
      title: 'Attending Pimp Boss',
      icon: '👹',
      intro: 'Dr. Okafor stops by the fountain. "Four questions about fat, food, and sleep. Answer out loud before you reveal it, and grade yourself honestly."',
      xpPer: 10,
      questions: [
        { q: 'Name the four major lipoproteins and what each one carries, from where to where.',
          a: '<ul><li><b>Chylomicrons:</b> dietary triglycerides from the gut to fat and muscle.</li><li><b>VLDL:</b> triglycerides made in the liver, out to fat and muscle.</li><li><b>LDL:</b> cholesterol from the liver to the tissues (apo B-100 binds the LDL receptor).</li><li><b>HDL:</b> cholesterol from the tissues back to the liver (reverse transport), which also limits LDL oxidation and vascular inflammation.</li></ul>Lipoprotein lipase, with apo C-II as its cofactor, strips triglycerides from chylomicrons and VLDL. HMG-CoA reductase is the rate-limiting step in cholesterol synthesis.' },
        { q: 'A triglyceride level of 2,500 mg/dL. Walk me through the first 72 hours and the long-term plan.',
          a: '<ul><li><b>Now:</b> pancreatitis risk. Nothing by mouth, then a very-low-fat diet (under 5% fat), which lowers triglycerides about 20% a day. Drugs alone do not work at this level.</li><li><b>At the same time:</b> fix what pushed it up. Control the glucose (insulin), stop alcohol, stop estrogen, review HIV drugs, check TSH and urine protein.</li><li><b>Below 1,000:</b> start a fibrate. Add fish oil, niacin, or a statin if needed, and use fenofibrate (not gemfibrozil) with a statin.</li><li><b>Long term:</b> look for the inherited disorder underneath and screen the family.</li></ul>2026 Update: the Endocrine Society calls this <b>very severe</b> (≥ 2,000) and puts fibrates first-line for pancreatitis risk, never a statin alone. For cardiovascular risk once triglycerides are lower, AACE adds icosapent ethyl to a statin, not niacin.' },
        { q: 'Who gets lifestyle treatment, drugs, or surgery for obesity, and what goal do you set?',
          a: '<ul><li><b>Lifestyle and behavior:</b> everyone. Stage readiness to change and use motivational interviewing. The best diet is the one the patient can stick to.</li><li><b>Drugs:</b> BMI > 27 with complications or > 30 without. Try for 3 months and stop if weight loss is under 5%.</li><li><b>Surgery:</b> BMI > 40, or > 35 with comorbidities. Expect about 30% total weight loss.</li><li><b>Goal:</b> a sustained 5–10% loss, which already lowers blood pressure and LDL and cuts diabetes risk. Keeping weight off takes 60–90 minutes a day of activity.</li></ul>2026 Update: AACE treats obesity as a chronic disease staged by its complications, and long-term drug therapy is the norm. The Endocrine Society stops or switches a drug that gives under 5% loss at 3 months. Surgery is recommended at BMI ≥ 35 regardless of comorbidities. Semaglutide and tirzepatide give about 15–20% weight loss, and sibutramine was withdrawn in 2010.' },
        { q: 'How does sleep set the hormone clock, and what goes wrong when sleep breaks?',
          a: '<ul><li><b>Early sleep (slow-wave sleep):</b> GH and prolactin surge, triggered by sleep onset rather than clock time.</li><li><b>Late sleep (circadian):</b> testosterone rises after midnight; cortisol starts rising around 2 AM and peaks at 6–9 AM.</li><li><b>TSH:</b> sleep holds it down. After a night without sleep it can roughly double.</li><li><b>Sleep loss:</b> glucose tolerance is about 40% worse, first-phase insulin falls, leptin falls, and ghrelin rises, so hunger and weight go up.</li><li><b>OSA:</b> insulin resistance, a catecholamine surge that can fake a pheochromocytoma, and low SHBG and testosterone. Hypothyroidism, acromegaly (often central apnea), and PCOS all bring sleep apnea with them.</li></ul>' }
      ]
    },
    {
      id: 'pearls',
      type: 'pearls',
      title: 'Rapid-Fire Synthesis',
      icon: '⚡',
      intro: 'Fifteen rapid-fire items in three formats: type it from memory, pick the best answer, and explain the why.',
      items: [
        { kind: 'recall', q: 'Above what triglyceride level (mg/dL) does the risk of pancreatitis rise sharply?',
          accept: { any: ['1000', '1,000'] },
          a: 'Above 1,000 mg/dL. Treat it urgently with a very-low-fat diet and fix the secondary causes.' },
        { kind: 'mcq', q: 'Which lipoprotein carries cholesterol from the tissues back to the liver?',
          options: [
            { t: 'HDL', ok: true },
            { t: 'LDL' },
            { t: 'VLDL' },
            { t: 'Chylomicrons' }
          ],
          a: 'HDL drives reverse cholesterol transport. LDL carries cholesterol the other way, from the liver to the tissues.' },
        { kind: 'mcq', q: 'Which apoprotein is the cofactor for lipoprotein lipase?',
          options: [
            { t: 'Apo C-II', ok: true },
            { t: 'Apo B-100' },
            { t: 'Apo E' },
            { t: 'Apo A' }
          ],
          a: 'Apo C-II activates LPL. Apo B binds the LDL receptor, apo E binds the liver\'s remnant receptors, and apo A binds HDL receptors.' },
        { kind: 'why', q: 'Why can\'t you treat a triglyceride level of 2,000 with pills alone?',
          points: [
            'Medications alone are not effective at levels above 1,000',
            'A very-low-fat diet (under 5% fat) lowers triglycerides about 20% a day',
            'The secondary causes (diabetes, alcohol, estrogen, HIV drugs) must be fixed at the same time'
          ] },
        { kind: 'recall', q: 'Which inherited disorder has apo E2/E2 and xanthomas in the palm creases?',
          accept: { any: ['dysbetalipoproteinemia', 'type iii', 'type 3'] },
          a: 'Familial dysbetalipoproteinemia (type III). Poor apo E binding blocks the liver from clearing VLDL remnants.' },
        { kind: 'mcq', q: 'How much more does doubling a statin dose lower LDL?',
          options: [
            { t: 'About 6%', ok: true },
            { t: 'About 20%' },
            { t: 'About 50%' },
            { t: 'Not at all' }
          ],
          a: 'This is the "6% rule." Adding ezetimibe, niacin, or a resin gives about 20% more.' },
        { kind: 'recall', q: 'How many of the five criteria diagnose metabolic syndrome?',
          accept: { any: ['3', 'three'] },
          a: 'Any three: high fasting glucose, high triglycerides, low HDL, high blood pressure, and a large waist. Insulin resistance is the common thread.' },
        { kind: 'recall', q: 'Above what waist circumference (inches) is a man at increased risk?',
          accept: { any: ['40'] },
          a: 'Over 40 inches (102 cm) for men and over 35 inches (88 cm) for women. Measure at the iliac crest at the end of a relaxed breath out.' },
        { kind: 'mcq', q: 'What is a realistic weight-loss goal that still has clear health benefits?',
          options: [
            { t: '5–10% of body weight', ok: true },
            { t: 'Ideal body weight' },
            { t: '25% of body weight' },
            { t: '1–2% of body weight' }
          ],
          a: 'A sustained 5–10% loss improves blood pressure, LDL, and function, and markedly cuts the risk of diabetes.' },
        { kind: 'why', q: 'Why does an obese patient who says she "barely eats" stay obese?',
          points: [
            'Total energy expenditure rises with lean body mass, so larger bodies burn more',
            'Basal metabolic rate is not low in obesity',
            'Staying at a high weight requires a high calorie intake over time'
          ] },
        { kind: 'mcq', q: 'In common human obesity, leptin levels are usually...',
          options: [
            { t: 'High, from leptin resistance', ok: true },
            { t: 'Low, from leptin deficiency' },
            { t: 'Absent' },
            { t: 'Unrelated to fat mass' }
          ],
          a: 'Leptin rises with fat mass. True leptin deficiency is very rare, and giving leptin to obese people produced little weight loss.' },
        { kind: 'mcq', q: 'Six weeks after gastric bypass, which supplement does she need for life?',
          options: [
            { t: 'A multivitamin with iron, B12, folate, thiamine, calcium, and vitamin D', ok: true },
            { t: 'Nothing if she eats well' },
            { t: 'Vitamin C only' },
            { t: 'Calcium only' }
          ],
          a: 'Bypassing the stomach and duodenum causes malabsorption. Check labs every 6 months for 2 years, then yearly.' },
        { kind: 'recall', q: 'Neck circumference above how many inches is the most sensitive exam finding for sleep apnea?',
          accept: { any: ['17'] },
          a: 'Over 17 inches. BMI and retrognathia also raise the risk, and patients often don\'t notice their own symptoms.' },
        { kind: 'mcq', q: 'Which hormones surge with the first slow-wave sleep of the night?',
          options: [
            { t: 'GH and prolactin', ok: true },
            { t: 'Cortisol and testosterone' },
            { t: 'TSH and cortisol' },
            { t: 'LH and FSH' }
          ],
          a: 'Sleep onset, not clock time, triggers GH and prolactin. Cortisol and testosterone rise later and follow the circadian clock.' },
        { kind: 'why', q: 'Why can untreated sleep apnea make a patient look like they have a pheochromocytoma?',
          points: [
            'Repeated airway collapse causes hypoxia and hypercarbia',
            'This drives a marked rise in adrenergic (catecholamine) tone',
            'A 24-hour urine then shows high metanephrines, so treat OSA and repeat the test'
          ] }
      ],
      pearls: [
        '{{c1::Chylomicrons}} carry dietary triglycerides; {{c2::VLDL}} carries triglycerides made in the liver.',
        '{{c1::LDL}} carries cholesterol from the liver to the tissues; {{c2::HDL}} brings it back.',
        'Apo {{c1::B}} binds the LDL receptor; apo {{c2::C-II}} activates lipoprotein lipase; apo {{c3::E}} lets the liver clear remnants.',
        '{{c1::HMG-CoA reductase}} is the rate-limiting enzyme in cholesterol synthesis and the target of statins.',
        'Triglycerides above {{c1::1,000}} mg/dL sharply raise the risk of acute pancreatitis, with mortality up to {{c2::10%}}.',
        'Above 1,000, start a very-low-fat diet (under {{c1::5%}} fat), which lowers triglycerides about {{c2::20%}} a day.',
        'Once triglycerides are below 1,000, {{c1::fibrates}} are the most effective drugs, lowering them {{c2::30–50%}}.',
        'With a statin, choose {{c1::fenofibrate}} over gemfibrozil and monitor {{c2::CK}}.',
        'Each doubling of a statin dose lowers LDL only about {{c1::6%}} more.',
        'Adding {{c1::ezetimibe}}, niacin, or a resin to a statin lowers LDL about {{c2::20%}} more.',
        '{{c1::Niacin}} raised HDL the most of the classic drugs (10–25%).',
        'The CETP inhibitor {{c1::torcetrapib}} raised HDL more than 50% but increased coronary events and deaths.',
        'Familial hypercholesterolemia affects {{c1::1 in 500}} people (heterozygotes) and causes {{c2::tendon}} xanthomas.',
        'Familial dysbetalipoproteinemia is apo {{c1::E2/E2}} with {{c2::palmar (planar)}} xanthomas.',
        'Familial combined hyperlipidemia is marked by a high {{c1::apo B}}.',
        'Familial chylomicronemia comes from mutations in {{c1::lipoprotein lipase}} or {{c2::apo C-II}}.',
        'Chylomicronemia causes {{c1::eruptive}} xanthomas, lipemia retinalis, hepatosplenomegaly, and pancreatitis.',
        'Lipoprotein(a) is LDL with apo(a), about {{c1::85%}} homologous to {{c2::plasminogen}}.',
        'ATP III counts {{c1::diabetes}} as a CAD risk equivalent.',
        'Metabolic syndrome is any {{c1::three}} of five criteria; the common thread is {{c2::insulin resistance}}.',
        'BMI: 25–29.9 is {{c1::overweight}}; above {{c2::30}} is obesity; above {{c3::40}} is severe obesity.',
        'Waist risk cutoffs: over {{c1::40}} inches for men and over {{c2::35}} inches for women.',
        'Drugs are considered at BMI > {{c1::27}} with complications or > {{c2::30}} without; surgery at > {{c3::40}}, or > {{c4::35}} with comorbidities.',
        'A sustained {{c1::5–10%}} weight loss is a realistic goal with real health benefits.',
        'Obese people usually have {{c1::high}} leptin levels, reflecting leptin {{c2::resistance}}.',
        '{{c1::Ghrelin}} is the "hunger hormone" from the stomach; it falls dramatically after gastric bypass.',
        'Orlistat blocks {{c1::pancreatic lipase}}; patients should take a daily {{c2::multivitamin}}.',
        'Gastric bypass gives about {{c1::30%}} total weight loss; diabetes resolves in about {{c2::77%}} of patients.',
        'Avoid juices and added sugars after bypass to prevent {{c1::dumping syndrome}}.',
        'GH and prolactin surge with {{c1::slow-wave sleep}}; cortisol peaks at {{c2::6–9 AM}}.',
        'Acute sleep loss removes the nighttime suppression of {{c1::TSH}}, which can roughly double.',
        'Sleep deprivation {{c1::lowers}} leptin and {{c2::raises}} ghrelin.',
        'OSA needs a {{c1::sleep study (polysomnography)}}: ≥ {{c2::5}} events/h with symptoms or ≥ {{c3::15}} without.',
        'An Epworth Sleepiness Scale score above {{c1::9}} means excessive daytime sleepiness.',
        'A neck circumference over {{c1::17}} inches is the most sensitive exam finding for OSA.',
        'Untreated OSA raises catecholamines and can cause a false-positive {{c1::pheochromocytoma}} workup.',
        'Acromegaly is often linked to {{c1::central}} sleep apnea; hypothyroidism to {{c2::obstructive}} sleep apnea.',
        'OSA lowers SHBG and total and free {{c1::testosterone}}; exogenous testosterone can {{c2::worsen}} OSA.'
      ],
      updates: [
        'The 2026 ACC/AHA guideline estimates risk with the {{c1::PREVENT}} equations and brings back LDL goals: < {{c2::55}} mg/dL for very-high-risk ASCVD, < {{c3::70}} for 10-year risk ≥ 10%, and < {{c4::100}} for borderline or intermediate risk.',
        'Measure {{c1::lipoprotein(a)}} at least once in every adult\'s lifetime.',
        'A coronary artery calcium score of {{c1::0}} can justify deferring a statin in low- or intermediate-risk adults.',
        'Endocrine Society triglyceride grades: severe {{c1::1,000–1,999}}; very severe ≥ {{c2::2,000}} mg/dL. Fibrates are first-line for pancreatitis risk; never a {{c3::statin}} alone.',
        'AACE 2025 suggests an LDL target below {{c1::70}} mg/dL for adults with ASCVD or increased risk.',
        'AACE 2025: for triglycerides 150–499 on a statin with high risk, add {{c1::icosapent ethyl}} (pure EPA); recommends against adding {{c2::niacin}}.',
        'AACE 2025 adds a {{c1::PCSK9}} antibody for ASCVD or high risk above target on maximal statin, and {{c2::bempedoic acid}} for statin intolerance.',
        'Endocrine Society: if an obesity drug gives less than {{c1::5%}} weight loss after {{c2::3 months}}, stop or switch it.',
        'AACE calls obesity {{c1::adiposity-based chronic disease}} and stages it by complications.',
        '{{c1::Sibutramine}} was withdrawn in 2010 after it increased cardiovascular events.',
        'Semaglutide 2.4 mg gives about {{c1::15%}} weight loss, and tirzepatide about {{c2::20%}}.',
        'In 2024 the FDA approved {{c1::tirzepatide}} as the first drug for moderate-to-severe OSA in adults with obesity.',
        'ASMBS/IFSO 2022: bariatric surgery is recommended at BMI ≥ {{c1::35}} regardless of comorbidities and considered at ≥ {{c2::30}} with metabolic disease.',
        'A {{c1::home sleep apnea test}} is acceptable for uncomplicated adults with a high pretest probability of OSA.',
        'In randomized trials, CPAP led to modest weight {{c1::gain}}, not the weight loss the 2009 text describes.'
      ]
    }
  ]
};
