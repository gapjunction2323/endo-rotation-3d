window.ENDO_CONTENT = window.ENDO_CONTENT || {};

window.ENDO_CONTENT[2] = {
  scene: "Day 2. No codes tonight. It's clinic, the wards, and an OB consult. The long game is catching diabetes early, dosing insulin like a pancreas, and protecting the next generation.",
  objectives: [
    'Diagnose diabetes and prediabetes, screen the right people, and start type 2 treatment without the "borderline" trap.',
    'Build a basal-bolus regimen from a total daily dose: carb ratio, correction factor, and pump basal rate.',
    'Diagnose and treat gestational diabetes, plan preconception care, and follow up postpartum.',
    'Recognize the skin signs of diabetes (and their thyroid look-alikes).'
  ],
  source: 'Endocrine Secrets (2009), Ch. 1, 3, 5 & 56; 2026 updates from the ADA Standards of Care',
  cast: {
    maya: { station: 'newdx', emoji: '🧔🏽', name: 'Mr. Reyes, 52', color: '#f87171',
      lines: ["I came in for this leg, but honestly I've been peeing all night and I'm always thirsty.", "Lost fifteen pounds without trying. My wife says that's good news. Is it?"] },
    alvarez: { station: 'gdm', emoji: '🤰🏽', name: 'Ms. Patel, 27 weeks', color: '#fbbf24',
      lines: ['OB sent me up. They said my sugar test came back high?', 'My first baby was almost ten pounds. Is that related?'] },
    ortiz: { station: 'pager', emoji: '👩🏻‍🏫', name: 'Diabetes Educator Kim', color: '#60a5fa',
      lines: ["Clinic phones are lighting up: carb ratios, corrections, and a pump that isn't working. Grab a calculator."] },
    sam: { station: 'cabinet',
      lines: ['The insulin fridge is a mess. Can you match each drug to how it works before the morning pass?'] },
    noor: { station: 'skin',
      lines: ['I pulled ten photos from this week\'s clinic. Diabetes or thyroid? Sort them before my next patient.'] },
    carrel: { station: 'pearls',
      lines: ['Day 2 rapid-fire synthesis. Lock in the long game.'] },
    okafor: { station: 'boss',
      lines: ["Clinic day. No drips, just decades. Let's see if you can manage diabetes for a lifetime, not a night."] }
  },
  stations: [
    {
      id: 'newdx',
      type: 'consult',
      title: 'Ward Consult #1: The Thirsty Truck Driver',
      icon: '🚚',
      chart: {
        hpi: '52-year-old man admitted for left-leg cellulitis. Three months of polyuria, polydipsia, and a 15-lb weight loss he wasn\'t trying for. Mother has type 2 diabetes. No prior labs in years.',
        vitals: 'HR 92 · BP 146/88 · RR 16 · T 37.9 °C · BMI 34',
        exam: 'Warm, erythematous left shin. Velvety, hyperpigmented plaques in the neck creases and axillae; multiple skin tags. Reduced monofilament sensation at both great toes.',
        labs: [
          ['Random glucose', '318 mg/dL'],
          ['Na / K / Cl / HCO₃', '136 / 4.4 / 100 / 25'],
          ['BUN / Cr', '18 / 0.9 (eGFR > 90)'],
          ['Beta-hydroxybutyrate', '0.3 mmol/L (normal)'],
          ['A1C', 'Pending']
        ]
      },
      rrt: 'Debrief: new diabetes in the hospital is a chance to do harm slowly. Avoid long-acting sulfonylureas with erratic intake, never label it "borderline," and treat profound hyperglycemia with insulin first.',
      nodes: [
        {
          prompt: 'Does he have diabetes, and what do you need to confirm it?',
          xp: 10,
          options: [
            { t: 'Yes. Classic symptoms plus a random glucose ≥ 200 mg/dL is diagnostic on its own.', ok: true,
              fb: '<b>Correct.</b> The book\'s criteria: fasting glucose ≥ 126, 2-hour 75-g OGTT ≥ 200, or a casual glucose ≥ 200 <b>with classic symptoms</b> (polyuria, polydipsia, unexplained weight loss). Only an asymptomatic positive test needs repeating on a different day.' },
            { t: 'Not yet. Repeat a fasting glucose on another day before you label him.',
              fb: 'That rule is for asymptomatic patients. Three months of polyuria, polydipsia, and weight loss with a glucose of 318 is already diagnostic, and delaying the label is how patients end up "borderline" for years.' },
            { t: 'No. This is stress hyperglycemia from the cellulitis; recheck after discharge.',
              fb: 'Infection raises glucose, but his symptoms started months before the cellulitis. Stress hyperglycemia is a diagnosis of exclusion, and the pending A1C will settle it.' },
            { t: 'Schedule a 75-g OGTT for tomorrow morning.',
              fb: 'The OGTT is a valid test, but it adds nothing here, and loading a glucose of 318 with 75 g of sugar is pointless.' }
          ],
          update: 'Since 2010 the ADA also accepts A1C ≥ 6.5% as diagnostic. In an asymptomatic patient, two different abnormal tests from the same sample (for example, A1C and fasting glucose) now confirm the diagnosis without a second visit.'
        },
        {
          prompt: 'What does the velvety rash in his neck folds tell you?',
          xp: 5,
          options: [
            { t: 'Insulin resistance. High insulin levels stimulate IGF-1 receptors on keratinocytes (acanthosis nigricans).', ok: true,
              fb: '<b>Correct.</b> Acanthosis nigricans is papillomatous hyperplasia of the skin, most often from obesity-related insulin resistance. It also occurs with acromegaly, Cushing\'s syndrome, some medications, and malignancy. Sudden, extensive acanthosis in a thin patient should prompt a cancer search.' },
            { t: 'Poor hygiene. It should wash off.',
              fb: 'It looks "dirty," which is the classic description, but it does not wash off. It is thickened, hyperpigmented skin.' },
            { t: 'Necrobiosis lipoidica.',
              fb: 'Necrobiosis lipoidica is yellow-brown, atrophic plaques with visible vessels, usually on the shins, not velvety neck folds.' },
            { t: 'Diabetic dermopathy.',
              fb: 'Dermopathy ("shin spots") is small brown pretibial macules. It marks microvascular disease, not insulin resistance.' }
          ]
        },
        {
          info: '<b>A1C returns 11.2%.</b> Floor glucoses run 280–340. He is eating full meals, there is no ketosis, and his eGFR is above 90.',
          prompt: 'What is your glucose plan?',
          xp: 10,
          options: [
            { t: 'Start basal-bolus insulin now, add metformin as he recovers, and plan to de-escalate once glucose toxicity resolves.', ok: true,
              fb: '<b>Correct.</b> The book: patients with profound hyperglycemia (above 300) respond quickly to insulin, and once glucotoxicity resolves, many can be managed on oral agents. Metformin is the starting drug of choice for obese patients with type 2 diabetes.' },
            { t: 'Glyburide 10 mg twice daily. He is a new type 2, so start a pill.', danger: true,
              fb: 'A long-acting sulfonylurea in a hospitalized patient with an infection and changing intake causes prolonged hypoglycemia. It also will not bring a glucose of 320 down fast enough.' },
            { t: 'Sliding-scale insulin only until discharge.',
              fb: 'Remember Day 1: reactive dosing alone chases the numbers without preventing them. He needs scheduled basal and prandial insulin.' },
            { t: 'Diet only for now. It is new and probably borderline.',
              fb: 'The book calls this the most common mistake in type 2 diabetes: labeling it "borderline" or not treating it. A fasting glucose ≥ 126 or postprandial > 200 already carries complication risk.' }
          ],
          update: 'ADA 2025: start insulin when there is ongoing weight loss, symptomatic hyperglycemia, A1C > 10%, or glucose ≥ 300. If he has ASCVD, heart failure, or CKD, add a GLP-1 RA or SGLT2 inhibitor with proven benefit regardless of A1C or metformin use.'
        },
        {
          info: '<b>Day 3.</b> The cellulitis is improving. Glucose is 140–190 on basal-bolus insulin.',
          prompt: 'Which complication screening belongs on his discharge checklist?',
          xp: 10,
          options: [
            { t: 'Dilated eye exam, urine albumin, full foot exam, and fasting lipids, all now.', ok: true,
              fb: '<b>Correct.</b> In type 2 diabetes, years of hyperglycemia precede the diagnosis, and about 50% of beta-cell mass is already gone, so complications can be present on day one. His reduced monofilament sensation is neuropathy already. The book: annual eye exam and urine albumin screen, lipids, and an A1C at least twice a year (quarterly on insulin).' },
            { t: 'An eye exam 5 years from now.',
              fb: 'That timing applies to type 1 diabetes, whose onset is abrupt. In type 2, screen at diagnosis.' },
            { t: 'An A1C in a year, then decide.',
              fb: 'On insulin with an A1C of 11%, he needs an A1C every 3 months, and complication screening shouldn\'t wait for it.' },
            { t: 'Nothing until his glucose is controlled.',
              fb: 'Complications already present will not wait for control. Find them now, while treatment changes outcomes.' }
          ],
          update: 'Current ADA targets: A1C < 7% for most adults, BP < 130/80, and a statin for most adults 40–75 with diabetes (LDL goal < 70 mg/dL, or < 55 with ASCVD). The 2009 text used LDL < 100 (< 70 if high risk).'
        },
        {
          prompt: 'His brother is 39, BMI 31, and asks when he should be tested. What do you tell him?',
          xp: 5,
          options: [
            { t: 'Now. Being overweight with a first-degree relative means testing before 45, then at least every 3 years.', ok: true,
              fb: '<b>Correct.</b> The book screens everyone every 3 years from age 45, and earlier or more often with major risk factors: family history, BMI ≥ 25, inactivity, high-risk ethnicity, prior IFG/IGT, hypertension, low HDL or high triglycerides, GDM or a baby over 9 lb, and PCOS.' },
            { t: 'At age 45, like everyone else.',
              fb: 'Age 45 is the start for people without risk factors. He has two major ones.' },
            { t: 'Only if he develops symptoms.',
              fb: 'Symptoms come late. By then about half the beta cells are gone.' },
            { t: 'Check GAD antibodies for type 1 risk.',
              fb: 'His family history is type 2. The book doesn\'t recommend routine type 1 antibody screening.' }
          ],
          update: 'ADA now starts screening all adults at age 35, and adults of any age who are overweight with a risk factor. USPSTF: adults 35–70 with overweight or obesity.'
        }
      ],
      outro: '🎉 Discharged on basal insulin and metformin, with a glucometer, an eye appointment, and podiatry. The long game: he lost about half his beta cells before anyone checked. Lifestyle change still pays off. In the Diabetes Prevention Program, diet and exercise cut progression to diabetes by about 60%, more than metformin did.'
    },
    {
      id: 'gdm',
      type: 'consult',
      title: 'Ward Consult #2: The OB Triage Call',
      icon: '🤰',
      chart: {
        hpi: '31-year-old G2P1 at 27 weeks. Her first baby weighed 9 lb 6 oz. Her mother has type 2 diabetes. No glucose testing was done until this week, when her 50-g glucose challenge came back at 168 mg/dL.',
        vitals: 'BP 122/76 · HR 88 · BMI 33 · fundal height 31 cm (large for dates)',
        exam: 'Acanthosis nigricans at the neck. No edema.',
        labs: [
          ['100-g OGTT, fasting', '98 mg/dL'],
          ['1 hour', '192 mg/dL'],
          ['2 hours', '160 mg/dL'],
          ['3 hours', '131 mg/dL']
        ]
      },
      rrt: 'Debrief: in pregnancy, the fetus pays for maternal hyperglycemia, and the mother pays for starvation. Pregnancy is a state of accelerated starvation, so treat high glucose with insulin, not by withholding food.',
      nodes: [
        {
          prompt: 'Interpret her 100-g OGTT.',
          xp: 10,
          options: [
            { t: 'Gestational diabetes. Three values meet or exceed the thresholds (95 / 180 / 155 / 140), and two are enough.', ok: true,
              fb: '<b>Correct.</b> These are the Carpenter–Coustan criteria the ADA adopted: fasting 95, 1-hour 180, 2-hour 155, 3-hour 140. Fasting 98, 1-hour 192, and 2-hour 160 are all abnormal.' },
            { t: 'Borderline. Repeat the test in a month.',
              fb: 'Repeat in a month is what you do with <b>one</b> abnormal value, since a third of those patients later meet criteria. She has three.' },
            { t: 'The 50-g challenge already made the diagnosis.',
              fb: 'The 50-g challenge is only a screen (positive at 130–140). A positive screen must be followed by the diagnostic 100-g, 3-hour test.' },
            { t: 'Overt (preexisting) diabetes.',
              fb: 'Overt diabetes in pregnancy means a fasting glucose > 125 or random > 200. Her fasting value is 98.' }
          ],
          update: 'The ADA now accepts either this two-step approach or a one-step 75-g OGTT at 24–28 weeks. In the one-step test, any one value diagnoses GDM: fasting ≥ 92, 1-hour ≥ 180, or 2-hour ≥ 153.'
        },
        {
          prompt: 'Looking back, when should she first have been tested?',
          xp: 5,
          options: [
            { t: 'At her first prenatal visit, then again at 24–28 weeks if that was normal.', ok: true,
              fb: '<b>Correct.</b> She is high risk on several counts: obesity, a prior macrosomic baby, and a first-degree relative with diabetes. Glycosuria, prior GDM, and PCOS also qualify. Test high-risk women as soon as pregnancy is diagnosed.' },
            { t: 'At 24–28 weeks, like everyone else.',
              fb: 'That schedule is for average-risk women. She was high risk from her first visit.' },
            { t: 'No testing needed, because she is under 35.',
              fb: 'Low risk, which allows skipping glucose testing, requires <b>all</b> of these: age under 25, normal weight, a low-risk ethnic group, no diabetic first-degree relatives, and no history of abnormal glucose or poor obstetric outcome.' }
          ],
          update: 'ADA: test women with risk factors for undiagnosed diabetes before 15 weeks, using standard nonpregnant criteria. An early A1C ≥ 6.5% means preexisting diabetes, with embryos exposed during organogenesis.'
        },
        {
          info: '<b>Two weeks later.</b> She has followed medical nutrition therapy and walks daily. Her log: fasting 101–108; 1-hour postprandial 132–150.',
          prompt: 'Next step?',
          xp: 10,
          options: [
            { t: 'Start insulin, aimed at the fasting values first (for example, bedtime NPH), adding mealtime insulin if needed.', ok: true,
              fb: '<b>Correct.</b> The book starts insulin when fasting glucose is > 95, 1-hour > 140, or 2-hour > 120. Diet alone controls about half of GDM, but it usually fails when the fasting glucose is high. Severe hypoglycemia is uncommon in GDM because these patients are insulin resistant.' },
            { t: 'Glyburide, since it doesn\'t cross the placenta.',
              fb: 'The 2009 text says glyburide doesn\'t cross; we now know it does. Fasting hyperglycemia also predicts glyburide failure, and about 20% of patients fail it.' },
            { t: 'Stay on diet alone; the numbers are close.',
              fb: 'Fetal hyperinsulinemia builds while you wait. Postprandial and fasting hyperglycemia both drive macrosomia.' },
            { t: 'Restrict her to under 1,200 kcal a day.', danger: true,
              fb: 'Pregnancy is a state of <b>accelerated starvation</b>: glycogen runs out within 12 hours and ketosis follows. With BMI > 30, the book uses a 30–33% restriction to about 1,800 kcal/day (20–25 kcal/kg), which lowers glucose without causing ketonuria.' }
          ],
          update: 'ADA and ACOG: insulin is the preferred drug for GDM. Metformin and glyburide both cross the placenta, and glyburide causes more neonatal hypoglycemia and macrosomia than insulin.'
        },
        {
          prompt: 'What glucose targets do you give her?',
          xp: 5,
          options: [
            { t: 'Fasting < 95, 1-hour postprandial < 140, and 2-hour < 120 mg/dL.', ok: true,
              fb: '<b>Correct.</b> The HAPO study showed fetal overgrowth rises continuously with maternal glucose, even below the old cutoffs. Check both premeal and postprandial values.' },
            { t: 'Premeal 90–130 and postprandial < 180, the usual adult targets.',
              fb: 'Those are nonpregnant targets. Pregnancy targets are much tighter, because postprandial glucose drives macrosomia.' },
            { t: 'Keep every value under 80.',
              fb: 'That invites hypoglycemia without benefit. Normal fasting glucose in pregnancy is about 75, with peaks near 110.' }
          ],
          update: 'Current ADA pregnancy targets are unchanged: fasting < 95, 1-hour < 140, 2-hour < 120, and an A1C < 6% if it can be reached without hypoglycemia. With CGM in type 1 pregnancy, aim for 63–140 mg/dL more than 70% of the time.'
        },
        {
          info: '<b>39 weeks.</b> She delivers a 4,100 g baby vaginally. The newborn\'s glucose is 32 mg/dL at 1 hour.',
          prompt: 'Why is the baby hypoglycemic?',
          xp: 5,
          options: [
            { t: 'Fetal beta-cell hyperplasia. The baby\'s own insulin keeps running after the maternal glucose supply stops.', ok: true,
              fb: '<b>Correct.</b> Excess glucose, amino acids, and fats cross the placenta and cause fetal hyperglycemia, islet hypertrophy, and hyperinsulinemia. Fetal insulin acts as a growth hormone and drives macrosomia. Infants of diabetic mothers also get hypocalcemia, polycythemia, hyperbilirubinemia, and respiratory distress.' },
            { t: 'Maternal insulin crossed the placenta.',
              fb: 'Maternal insulin does not cross the placenta in meaningful amounts. That is why amniotic fluid insulin is a marker of the fetus\'s own hyperinsulinemia.' },
            { t: 'Neonatal adrenal insufficiency.',
              fb: 'Possible in theory, but the cause here is classic: the infant of a diabetic mother has hyperinsulinemia.' }
          ]
        },
        {
          prompt: 'What are your postpartum orders?',
          xp: 10,
          options: [
            { t: 'Stop insulin, confirm glucose normalizes, then do a 75-g 2-hour OGTT at 6 weeks and screen for life.', ok: true,
              fb: '<b>Correct.</b> Insulin sensitivity returns right after delivery. A fasting glucose alone misses most impaired glucose tolerance, so do the OGTT. About 50% of women with GDM develop type 2 diabetes within 5–10 years. Encourage breastfeeding and weight loss, and make sure she has effective contraception.' },
            { t: 'Send her home on her pregnancy insulin dose.', danger: true,
              fb: 'Insulin needs plunge at delivery, so this is how postpartum hypoglycemia happens. In GDM, insulin stops; women with preexisting diabetes need their doses at least halved.' },
            { t: 'Check an A1C at the 6-week visit.',
              fb: 'An A1C is unreliable right after pregnancy and delivery blood loss, and it misses impaired glucose tolerance. Use the OGTT.' },
            { t: 'No follow-up needed. GDM goes away after delivery.',
              fb: 'The hyperglycemia usually resolves, but her risk does not. Pregnancy was her "stress test," and she failed it.' }
          ],
          update: 'ADA: do the 75-g OGTT at 4–12 weeks postpartum, then screen every 1–3 years for life. In the DPP, lifestyle change or metformin roughly halved progression in women with prior GDM.'
        }
      ],
      outro: '🎉 Mother and baby are doing well. Remember the cycle: in utero hyperglycemia programs the child for obesity and type 2 diabetes. Treating GDM protects two generations.'
    },
    {
      id: 'cabinet',
      type: 'match',
      title: 'Concept Matching: The Insulin Cabinet',
      icon: '🧩',
      instructions: 'Tap a drug, then tap how it works or how it behaves.',
      xpPer: 2,
      pairs: [
        { l: 'Lispro / aspart / glulisine', r: 'Onset 5–30 min, peak 1–2 h, done in 4–6 h' },
        { l: 'Regular insulin', r: 'Onset 30–60 min, peak 2–3 h, lasts 8–10 h' },
        { l: 'NPH', r: 'Peaks at 4–12 h; given in the morning and at bedtime' },
        { l: 'Glargine', r: 'Peakless microprecipitate; never mix it with other insulins' },
        { l: 'Pramlintide', r: 'Amylin analog; cut mealtime insulin 30–50% when starting it' },
        { l: 'Exenatide', r: 'GLP-1 mimetic: glucose-dependent insulin release, slower gastric emptying, weight loss' },
        { l: 'Sitagliptin', r: 'DPP-4 inhibitor: protects your own GLP-1; a weight-neutral pill' },
        { l: 'Metformin', r: 'Shuts down hepatic gluconeogenesis' },
        { l: 'Pioglitazone', r: 'PPAR-gamma agonist that sensitizes muscle and fat' },
        { l: 'Acarbose', r: 'Blocks brush-border enzymes that digest carbohydrate' }
      ]
    },
    {
      id: 'skin',
      type: 'sort',
      title: 'Lightning Sort: Skin Signs',
      icon: '⚡',
      instructions: 'Does this skin finding point to diabetes or to thyroid disease?',
      xpPer: 1,
      categories: [
        { key: 'D', label: 'Diabetes' },
        { key: 'T', label: 'Thyroid' }
      ],
      items: [
        { t: 'Yellow-brown atrophic shin plaques with visible vessels', c: 'D' },
        { t: 'Indurated, orange-peel plaques on the shins', c: 'T' },
        { t: 'Small brown pretibial "shin spots"', c: 'D' },
        { t: 'Tense, painless blisters on the feet', c: 'D' },
        { t: 'Loss of the outer third of the eyebrows', c: 'T' },
        { t: 'Woody induration of the upper back and neck', c: 'D' },
        { t: 'Finger clubbing with soft-tissue swelling (acropachy)', c: 'T' },
        { t: "Coral-red groin rash under a Wood's lamp", c: 'D' },
        { t: 'Waxy, nonpitting periorbital swelling', c: 'T' },
        { t: 'Tiny grouped papules over the knuckles ("finger pebbles")', c: 'D' }
      ],
      outro: 'Three shin lesions to keep straight: <b>necrobiosis lipoidica</b> (screen for diabetes if you see it), <b>diabetic dermopathy</b> (the most common, and a marker of microvascular disease), and <b>pretibial myxedema</b> (Graves\', usually with eye disease). <b>Bullosis diabeticorum</b> is the only finding that is pathognomonic of diabetes.'
    },
    {
      id: 'pager',
      type: 'pager',
      title: 'Pager Interrupts: Insulin Math',
      icon: '📟',
      nodes: [
        {
          kind: 'calc',
          info: '📟 <b>Clinic:</b> a patient switching from premixed 70/30 to basal-bolus takes 40 units a day in total.',
          prompt: 'Using the 500 rule, what is her starting carb ratio? (Grams of carbohydrate covered by 1 unit.)',
          answer: { min: 12, max: 13, value: '12.5', unit: 'g per unit' },
          xp: 5,
          fb: '500 ÷ 40 = <b>12.5 g per unit</b>. It is only a starting point. The ratio is right when the 2-hour glucose rises just 30–50 mg/dL over the premeal value and is back to 90–130 by about 5 hours.'
        },
        {
          kind: 'calc',
          info: '📟 <b>Another patient</b> takes 34 units of insulin a day.',
          prompt: 'Using the 1700 rule, what is his correction factor? (How far 1 unit drops glucose.)',
          answer: { min: 49, max: 51, value: '50', unit: 'mg/dL per unit' },
          xp: 5,
          fb: '1700 ÷ 34 = <b>50 mg/dL per unit</b>. Corrections are taken before meals, or at least 5 hours after the last bolus, to avoid stacking.'
        },
        {
          kind: 'calc',
          info: '📟 <b>Lunch:</b> premeal glucose 250 (target 100). Correction factor 50; carb ratio 1 unit per 15 g. She will eat 60 g of carbohydrate.',
          prompt: 'What is her total rapid-acting dose?',
          answer: { min: 7, max: 7, value: '7', unit: 'units' },
          xp: 5,
          fb: 'Meal: 60 ÷ 15 = 4 units. Correction: (250 − 100) ÷ 50 = 3 units. Total <b>7 units</b>, taken 15–30 minutes before eating because she is above 130.'
        },
        {
          info: '📟 <b>9 PM call:</b> glucose 300, two hours after a dinner bolus. Her premeal glucose was 100, and her correction factor is 60.',
          prompt: 'What do you advise?',
          xp: 5,
          options: [
            { t: 'A half correction toward 150: (300 − 150) ÷ 60 ÷ 2 ≈ 1 unit, then recheck in 2 hours.', ok: true,
              fb: '<b>Book protocol.</b> The dinner bolus is still active for about 3 more hours. Between meals, correct toward the expected postprandial value of 150 rather than 100, use half the usual correction, and recheck within 2 hours.' },
            { t: 'A full correction to 100: (300 − 100) ÷ 60 ≈ 3 units.', danger: true,
              fb: 'This stacks a full correction on top of an active dinner bolus, which sets up an overnight low.' },
            { t: 'Double tomorrow\'s basal dose.',
              fb: 'One high postprandial reading is a bolus problem, not a basal one. Look at her carb ratio for dinner.' },
            { t: 'Nothing. Recheck in the morning.',
              fb: 'Above 300, the book teaches a safe partial correction rather than leaving it all night.' }
          ]
        },
        {
          info: '📟 <b>Pump patient:</b> glucose 340, then 380 an hour after a correction bolus through the pump. She is nauseated, with moderate urine ketones.',
          prompt: 'What do you tell her?',
          xp: 5,
          options: [
            { t: 'Inject a correction by pen or syringe, change the infusion set and site, and drink fluids. Go to the ED if vomiting or ketones rise.', ok: true,
              fb: '<b>Correct.</b> Pumps deliver only rapid-acting insulin, so there is no long-acting depot. A kinked cannula, an air bubble, or a dislodged set leaves her with no insulin, and ketoacidosis follows within hours. Assume pump failure and bypass it.' },
            { t: 'Another bolus through the pump, then recheck in 2 hours.', danger: true,
              fb: 'If the set has failed, that bolus goes nowhere. Two more hours without insulin is how pump users end up in DKA.' },
            { t: 'Suspend the pump so she doesn\'t stack insulin.', danger: true,
              fb: 'She is ketotic and needs <b>more</b> insulin. Suspending the pump guarantees zero insulin delivery.' }
          ]
        },
        {
          info: '📟 <b>Hypoglycemia call:</b> glucose 58. She took rapid-acting insulin 2 hours ago. She has a chocolate bar, orange juice, and glucose tablets.',
          prompt: 'What should she take?',
          xp: 5,
          options: [
            { t: '15 g of dextrose (glucose tablets), recheck in 15–20 minutes, and repeat if still under 70.', ok: true,
              fb: '<b>Correct.</b> With rapid-acting insulin given 1–3 hours earlier, 15 g is the dose; if it was more than 4 hours earlier, 5–10 g may be enough. Dextrose is absorbed fastest.' },
            { t: 'The chocolate bar.',
              fb: 'Fat delays absorption, which prolongs the low and triggers counterregulatory rebound hyperglycemia later.' },
            { t: 'A large glass of juice plus the chocolate, to be safe.',
              fb: 'Overtreatment is a top cause of rebound hyperglycemia. Treat with a measured dose and recheck.' },
            { t: 'Nothing. Her liver will correct it.', danger: true,
              fb: 'Untreated lows can progress to neuroglycopenia, and recurrent lows blunt the warning symptoms (hypoglycemia unawareness).' }
          ]
        },
        {
          kind: 'calc',
          info: '📟 <b>Pump start:</b> his total daily dose on injections is 48 units.',
          prompt: 'Using the book\'s method (reduce TDD by 25%, use half as basal, spread over 24 hours), what is his initial basal rate?',
          answer: { min: 0.7, max: 0.8, value: '0.75', unit: 'U/h' },
          xp: 5,
          fb: '48 × 0.75 = 36 → half is 18 units of basal → 18 ÷ 24 = <b>0.75 U/h</b>. Set overnight rates first: test on three nights and adjust by 0.1 U/h if glucose drifts more than 20–30 mg/dL.'
        }
      ]
    },
    {
      id: 'boss',
      type: 'boss',
      title: 'Attending Pimp Boss',
      icon: '👹',
      intro: 'Dr. Okafor closes the clinic door. "Four questions. No options. Answer as if a patient\'s next decade depends on it." Type or say your answer, reveal it, and grade yourself honestly.',
      xpPer: 10,
      questions: [
        { q: 'Give the diagnostic thresholds for diabetes and for prediabetes.',
          a: '<b>Diabetes:</b> fasting glucose ≥ 126, 2-hour 75-g OGTT ≥ 200, random glucose ≥ 200 with classic symptoms, or A1C ≥ 6.5% (added in 2010). Confirm on a different day unless the patient is symptomatic.<br><b>Prediabetes:</b> impaired fasting glucose 100–125 (the 2009 text uses 110), impaired glucose tolerance 140–199 at 2 hours, or A1C 5.7–6.4%.' },
        { q: 'Walk me through how insulin needs change from conception to the postpartum ward, and why.',
          a: '<ul><li><b>First trimester:</b> insulin sensitivity rises, and nausea plus "accelerated starvation" bring nocturnal hypoglycemia. Severe lows affect 30–40% of type 1 women in the first 20 weeks, so lower and move the evening basal and add a bedtime snack.</li><li><b>After 20 weeks:</b> placental hormones (hPL, placental GH, cortisol, prolactin, progesterone) and TNF-α cause insulin resistance, and needs rise 2–3-fold.</li><li><b>After delivery:</b> sensitivity returns immediately. Cut doses at least in half; in GDM, stop insulin.</li></ul>' },
        { q: 'How do you build a basal-bolus regimen from a total daily dose?',
          a: 'Basal is <b>40–60% of the TDD</b>. Mealtime dose = carbs ÷ carb ratio (<b>500 ÷ TDD</b>) plus (glucose − target) ÷ correction factor (<b>1700 ÷ TDD</b>). Correct before meals or at least 5 hours after the last bolus; between meals, use half the correction toward 150. Adjust from the logs: 2-hour rise of 30–50 mg/dL, back to 90–130 by 5 hours.' },
        { q: 'A woman with type 2 diabetes on metformin, lisinopril, and atorvastatin wants to get pregnant. What do you fix first?',
          a: '<ul><li><b>Glucose before conception:</b> malformation risk tracks A1C (up to 25% when A1C > 12%). The neural tube closes by 4 weeks and the heart forms by 6 weeks, often before she knows she is pregnant.</li><li><b>Switch to insulin</b> before trying, so the dose is set before embryogenesis.</li><li><b>Stop the ACE inhibitor</b> (use a calcium channel blocker, methyldopa, or hydralazine) and <b>stop the statin</b>; stop any thiazolidinedione.</li><li><b>Folic acid</b>, an eye exam with laser treatment of proliferative retinopathy beforehand, renal function, and cardiac testing if she has risk factors.</li></ul>2026 Update: the ADA goal is A1C < 6.5% before conception if it can be reached safely, and low-dose aspirin from 12–16 weeks lowers preeclampsia risk.' }
      ]
    },
    {
      id: 'pearls',
      type: 'pearls',
      title: 'Rapid-Fire Synthesis',
      icon: '⚡',
      intro: 'Fifteen rapid-fire items in three formats: type it from memory, pick the best answer, and explain the why.',
      items: [
        { kind: 'recall', q: 'What fasting plasma glucose (mg/dL) diagnoses diabetes?',
          accept: { any: ['126'] },
          a: '≥ 126 mg/dL after 8 hours of fasting, confirmed on a different day unless the patient is symptomatic.' },
        { kind: 'mcq', q: 'An asymptomatic 50-year-old has a fasting glucose of 131 once. Next step?',
          options: [
            { t: 'Repeat a diagnostic test to confirm', ok: true },
            { t: 'Start metformin today' },
            { t: 'Diagnose diabetes now' },
            { t: 'Check a C-peptide' }
          ],
          a: 'Without symptoms, one abnormal result must be confirmed: a repeat test on another day, or (per current ADA) a second abnormal test from the same sample.' },
        { kind: 'why', q: 'Why does a patient with newly diagnosed type 2 diabetes need an eye exam now rather than in 5 years?',
          points: [
            'Hyperglycemia is usually present for years before type 2 is diagnosed',
            'About half of beta-cell mass is already gone at diagnosis',
            'Retinopathy, nephropathy, and neuropathy can already be present'
          ] },
        { kind: 'recall', q: 'Which drug does the book start first in an obese patient with type 2 diabetes?',
          accept: { any: ['metformin'] },
          a: 'Metformin. Lean patients may do better with a sulfonylurea; glucose above 300 responds fastest to insulin.' },
        { kind: 'mcq', q: 'Which diabetes drug works at the intestinal brush border?',
          options: [
            { t: 'Acarbose', ok: true },
            { t: 'Metformin' },
            { t: 'Pioglitazone' },
            { t: 'Glipizide' }
          ],
          a: 'Alpha-glucosidase inhibitors (acarbose, miglitol) slow carbohydrate digestion. GI side effects limit their use.' },
        { kind: 'recall', q: 'To get a starting carb ratio, you divide which number by the total daily dose?',
          accept: { any: ['500'] },
          a: '500 ÷ TDD = grams of carbohydrate covered by 1 unit (TDD 50 → 1 unit per 10 g).' },
        { kind: 'mcq', q: 'TDD is 30 units. Using the 1700 rule, about how far will 1 unit drop glucose?',
          options: [
            { t: '~57 mg/dL', ok: true },
            { t: '~17 mg/dL' },
            { t: '~100 mg/dL' },
            { t: '~30 mg/dL' }
          ],
          a: '1700 ÷ 30 ≈ 57 mg/dL per unit, so start with a correction factor of 55–60.' },
        { kind: 'why', q: 'Why are insulin-pump users at special risk for DKA?',
          points: [
            'Pumps deliver only rapid-acting insulin',
            'There is no long-acting insulin depot under the skin',
            'A kinked, dislodged, or air-filled set stops insulin delivery, and ketosis follows within hours'
          ] },
        { kind: 'mcq', q: 'Which 100-g OGTT result diagnoses gestational diabetes?',
          options: [
            { t: 'Two or more values at or above 95 / 180 / 155 / 140', ok: true },
            { t: 'Any single value above threshold' },
            { t: 'A 50-g challenge above 140' },
            { t: 'A fasting glucose above 90' }
          ],
          a: 'Two abnormal values diagnose GDM. One abnormal value means repeating the test in a month. The 50-g challenge is only a screen.' },
        { kind: 'recall', q: 'In pregnancy, fasting glucose should stay below what value (mg/dL)?',
          accept: { any: ['95'] },
          a: 'Fasting < 95, 1-hour postprandial < 140, 2-hour < 120 mg/dL.' },
        { kind: 'mcq', q: 'A woman with type 1 diabetes has just delivered. What happens to her insulin needs?',
          options: [
            { t: 'They fall sharply; cut doses at least in half', ok: true },
            { t: 'They stay at third-trimester levels for 6 weeks' },
            { t: 'They rise because of lactation' },
            { t: 'They return to prepregnancy levels over 3 months' }
          ],
          a: 'Insulin sensitivity returns at delivery, and breastfeeding adds to it. Some women need almost no insulin for several days.' },
        { kind: 'why', q: 'Why does glucose control before conception matter more than tightening it after a positive pregnancy test?',
          points: [
            'Malformation risk tracks A1C around conception and in the first trimester',
            'The neural tube forms by 4 weeks and the heart by 6 weeks after conception',
            'Many women do not know they are pregnant until those windows have passed'
          ] },
        { kind: 'mcq', q: 'A woman had GDM. What is the best test at her postpartum follow-up?',
          options: [
            { t: '75-g 2-hour OGTT', ok: true },
            { t: 'A1C' },
            { t: 'Fasting glucose only' },
            { t: 'No testing; GDM resolves at delivery' }
          ],
          a: 'A fasting glucose alone misses most impaired glucose tolerance. About 50% of women with GDM develop type 2 diabetes within 5–10 years.' },
        { kind: 'recall', q: 'Name the only skin finding that is pathognomonic of diabetes.',
          accept: { any: ['bullosis', 'bullous', 'bullae'] },
          a: 'Bullosis diabeticorum (diabetic bullae): tense, painless blisters on the distal extremities, usually with neuropathy.' },
        { kind: 'why', q: 'Why do insulin-resistant patients develop acanthosis nigricans?',
          points: [
            'Insulin resistance causes high circulating insulin levels',
            'Excess insulin stimulates IGF-1 receptors on keratinocytes',
            'That drives papillomatous epidermal growth in skin folds'
          ] }
      ],
      pearls: [
        'Diabetes is diagnosed by fasting glucose ≥ {{c1::126}} mg/dL, 2-hour 75-g OGTT ≥ {{c2::200}} mg/dL, or random glucose ≥ {{c3::200}} mg/dL with classic symptoms.',
        'The classic symptoms of hyperglycemia are {{c1::polyuria}}, {{c2::polydipsia}}, and {{c3::unexplained weight loss}}.',
        'Without symptoms, a positive diagnostic test must be {{c1::repeated on a different day}}.',
        'The 2009 text screens average-risk adults every {{c1::3}} years starting at age {{c2::45}}, earlier with risk factors.',
        'Type 2 accounts for {{c1::90–95%}} of diabetes; by diagnosis, about {{c2::50%}} of beta-cell mass is gone.',
        'The first beta-cell defect in type 2 diabetes is loss of {{c1::first-phase insulin secretion}}, so {{c2::postprandial}} glucose rises first.',
        'Type 1 autoimmunity markers are antibodies to {{c1::islet cells}}, {{c2::insulin}}, and {{c3::glutamic acid decarboxylase (GAD)}}.',
        'In the Diabetes Prevention Program, {{c1::lifestyle change}} cut progression to diabetes by about {{c2::60%}}, more than metformin.',
        'DCCT: intensive therapy cut microvascular complications by {{c1::34–76%}}, at the cost of {{c2::3-fold}} more severe hypoglycemia.',
        'UKPDS: tight {{c1::blood pressure}} control reduced both microvascular and macrovascular events.',
        'Metformin mainly reduces {{c1::hepatic gluconeogenesis}}; thiazolidinediones activate {{c2::PPAR-gamma}}.',
        'GLP-1 increases {{c1::glucose-dependent}} insulin secretion, suppresses {{c2::glucagon}}, slows {{c3::gastric emptying}}, and promotes satiety.',
        'When starting pramlintide, cut mealtime insulin by {{c1::30–50%}}.',
        'Basal insulin is about {{c1::40–60%}} of the total daily dose.',
        'Starting carb ratio = {{c1::500}} ÷ TDD; starting correction factor = {{c2::1700}} ÷ TDD.',
        'A carb ratio is right when the 2-hour glucose rises only {{c1::30–50}} mg/dL and is back to 90–130 by about {{c2::5}} hours.',
        'Correct before meals or at least {{c1::5 hours}} after the last bolus; between meals, give {{c2::half}} the correction toward {{c3::150}} mg/dL.',
        'Initial pump basal rate = (TDD × {{c1::0.75}}) ÷ 2 ÷ 24.',
        'Pumps deliver only {{c1::rapid-acting}} insulin, so an interrupted set can cause {{c2::DKA}} within hours.',
        'For a low within 1–3 hours of rapid-acting insulin, take {{c1::15 g}} of dextrose; avoid {{c2::fat-containing}} foods, which delay recovery.',
        'The dawn phenomenon is a predawn glucose rise driven by {{c1::growth hormone}} and {{c2::cortisol}}.',
        'Insulin needs fall in the {{c1::first trimester}} (hypoglycemia risk) and rise {{c2::2–3-fold}} after 20 weeks.',
        'After delivery, cut insulin doses at least in {{c1::half}}; in GDM, {{c2::stop insulin}}.',
        'Malformation risk tracks A1C at conception: above {{c1::12%}}, up to {{c2::25%}} of pregnancies have a major malformation.',
        'Before conception, stop {{c1::ACE inhibitors}}, {{c2::statins}}, and {{c3::thiazolidinediones}}, and start folic acid.',
        '100-g OGTT thresholds for GDM: fasting {{c1::95}}, 1-h {{c2::180}}, 2-h {{c3::155}}, 3-h {{c4::140}}; {{c5::two}} abnormal values diagnose it.',
        'Pregnancy targets: fasting < {{c1::95}}, 1-hour < {{c2::140}}, 2-hour < {{c3::120}} mg/dL.',
        'DKA in pregnancy can occur at glucose below {{c1::200}} mg/dL; pregnant patients need {{c2::100–150 g}} of IV glucose a day.',
        'Women with GDM have about a {{c1::50%}} risk of type 2 diabetes within {{c2::5–10}} years.',
        'Postpartum GDM follow-up uses a {{c1::75-g 2-hour OGTT}}, because fasting glucose alone misses most impaired glucose tolerance.',
        '{{c1::Bullosis diabeticorum}} is the only skin finding pathognomonic of diabetes.',
        'If you see {{c1::necrobiosis lipoidica}}, screen for diabetes; about {{c2::two-thirds}} of patients have it.',
        "Erythrasma ({{c1::Corynebacterium minutissimum}}) glows {{c2::coral red}} under a Wood's lamp.",
        'Recurrent {{c1::candidiasis}} of any form should prompt screening for diabetes.'
      ],
      updates: [
        'An {{c1::A1C ≥ 6.5%}} now diagnoses diabetes; prediabetes is A1C {{c2::5.7–6.4%}} or fasting glucose {{c3::100–125}} mg/dL.',
        'The ADA now starts screening all adults at age {{c1::35}}.',
        'With ASCVD, heart failure, or CKD, use a {{c1::GLP-1 RA}} or {{c2::SGLT2 inhibitor}} with proven benefit, regardless of A1C.',
        '{{c1::Teplizumab}} can delay stage 3 type 1 diabetes in high-risk, antibody-positive patients.',
        'Modern CGMs need {{c1::no fingerstick calibration}} and can guide {{c2::insulin dosing}}; automated insulin delivery is now standard in type 1.',
        '{{c1::Insulin}} is the preferred drug for GDM; metformin and glyburide both {{c2::cross the placenta}}.',
        'The one-step 75-g OGTT diagnoses GDM with any one value: fasting ≥ {{c1::92}}, 1-hour ≥ {{c2::180}}, or 2-hour ≥ {{c3::153}}.',
        'The postpartum OGTT now happens at {{c1::4–12 weeks}}, followed by screening every {{c2::1–3 years}} for life.',
        'Women with preexisting diabetes should take low-dose {{c1::aspirin}} from 12–16 weeks to lower preeclampsia risk.'
      ]
    }
  ]
};
