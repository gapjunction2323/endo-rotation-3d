window.ENDO_CONTENT = window.ENDO_CONTENT || {};

window.ENDO_CONTENT[1] = {
  scene: "It's 11:40 PM. Your pager goes off. The ED is holding two diabetic patients and your senior is stuck at a rapid response. You're on your own.",
  objectives: [
    'Diagnose and run the first hours of DKA: fluids, potassium, insulin, dextrose, and closing the gap.',
    'Distinguish HHS from DKA and explain why fluids come before insulin.',
    'Write inpatient insulin orders without a sliding scale, and treat hypoglycemia.'
  ],
  source: 'Endocrine Secrets (2009), Ch. 2 & 4; Top 100 Secrets #5–7, #94, #98',
  stations: [
    {
      id: 'dka',
      type: 'consult',
      title: 'Ward Consult #1: The Vomiting Grad Student',
      icon: '🚑',
      chart: {
        hpi: '22-year-old woman with type 1 diabetes. Two days of nausea, vomiting, and diffuse abdominal pain. She "didn\'t take her insulin because she wasn\'t eating."',
        vitals: 'HR 124 · BP 98/60 · RR 30 (deep, sighing) · T 37.4 °C · fruity breath',
        exam: 'Dry mucous membranes, diffuse abdominal tenderness, no rebound.',
        labs: [
          ['Glucose', '486 mg/dL'],
          ['Na / K / Cl / HCO₃', '131 / 5.6 / 96 / 8'],
          ['BUN / Cr', '32 / 1.6'],
          ['VBG pH', '7.08'],
          ['Urine ketones (nitroprusside)', 'Small']
        ]
      },
      rrt: 'Debrief: in hyperglycemic crises, the order of operations saves lives. Volume first, then check potassium, then insulin. Add dextrose when glucose falls, and overlap subcutaneous insulin before you stop the drip.',
      nodes: [
        {
          prompt: 'What is your next best move?',
          xp: 10,
          options: [
            { t: 'Start a regular insulin infusion at 0.1 U/kg/h right now. The glucose is the emergency.', danger: true,
              fb: 'Insulin before volume and a potassium check is backwards. Insulin drives glucose, and with it water and potassium, into cells. In a volume-depleted patient that worsens hypotension and can unmask a dangerous total-body potassium deficit.' },
            { t: 'Normal saline ~15 mL/kg/h (≈1 L/h), ECG, baseline labs, then insulin.', ok: true,
              fb: '<b>Correct.</b> Hour one: NS at 15 mL/kg/h. Send electrolytes, BUN/Cr, glucose, anion gap, UA, and blood and urine ketones, and get an <b>ECG to read the T waves</b> before you decide on potassium. Then insulin. Start hunting the trigger now; infection and MI top the list.' },
            { t: 'Push 2 ampules of sodium bicarbonate. The pH is 7.08.', danger: true,
              fb: 'Bicarbonate is not recommended unless pH is below 6.9 or another cause of severe acidosis exists (sepsis, lactic acidosis). Her acidosis corrects as insulin shuts off ketogenesis. Bicarb risks hypokalemia.' },
            { t: 'Hold off on calling it DKA. Urine ketones are only "small," so look for another cause first.',
              fb: '<b>Trap!</b> The nitroprusside test detects only <b>acetoacetate</b>. In untreated DKA, <b>beta-hydroxybutyrate</b> predominates, so urine ketones can read low or even negative. Glucose 486, HCO₃ 8, and a gap of 27 mean you treat it as DKA now.' }
          ],
          update: 'ADA consensus (2024) uses pH below 7.0 as the bicarbonate threshold. Point-of-care beta-hydroxybutyrate testing now avoids the nitroprusside trap entirely.'
        },
        {
          kind: 'calc',
          prompt: 'Bonus: calculate her anion gap (Na − Cl − HCO₃).',
          answer: { min: 26, max: 28, value: '27', unit: 'mEq/L' },
          xp: 5,
          fb: '131 − 96 − 8 = <b>27</b> (normal ≤ ~13). The gap is the number you follow to decide when to stop the drip, not the glucose.'
        },
        {
          kind: 'calc',
          prompt: 'Bonus: what is her corrected sodium? Use Na + 1.6 × (glucose − 100) / 100.',
          answer: { min: 136.5, max: 138, value: '≈137', unit: 'mEq/L' },
          xp: 5,
          fb: '131 + 1.6 × 3.86 ≈ <b>137</b>. Her "hyponatremia" is dilutional because glucose pulls water out of cells. Her true sodium is normal.'
        },
        {
          info: '<b>Hour 2.</b> She has received 2 L of NS. Her ECG showed normal T waves, so you started an insulin infusion at 0.1 U/kg/h. Repeat labs: glucose 390, <b>K 4.1</b>, HCO₃ 10, AG 22. Urine output is picking up.',
          prompt: 'What do you do about her potassium?',
          xp: 10,
          options: [
            { t: 'Hold potassium. She arrived with a K of 5.6, so she is overloaded.', danger: true,
              fb: 'Admission hyperkalemia in DKA is a <b>shift</b> (acidosis plus insulin deficiency), not a surplus. Total-body K is depleted by osmotic diuresis and vomiting. With insulin running, K will keep falling, and she is at risk for arrhythmia.' },
            { t: 'Add KCl to each liter of IV fluid and titrate to keep serum K at 4–5 mEq/L.', ok: true,
              fb: '<b>Correct.</b> The goal is K 4–5. The book adds 40 mEq KCl per liter if T waves flatten or U waves appear, and adjusts with the hourly labs.' },
            { t: 'Pause the insulin drip until K is above 5.', danger: true,
              fb: 'Stopping insulin stops the only therapy that halts ketogenesis. The real rule works the other way: you hold insulin only when the starting K is below 3.3, and you replete first.' },
            { t: 'Give sodium polystyrene to prevent rebound hyperkalemia.', danger: true,
              fb: 'There is no rebound coming. Her K is falling, and a binding resin would speed her into hypokalemia.' }
          ],
          update: 'Current ADA practice: if K < 3.3, hold insulin and replete K first. If K is 3.3–5.2, add 20–30 mEq/L to fluids. If K > 5.2, hold K and recheck in 2 h.'
        },
        {
          info: '<b>Hour 5.</b> Glucose 232, HCO₃ 13, AG 17, pH 7.21. She is more alert.',
          prompt: 'Next step?',
          xp: 10,
          options: [
            { t: 'Glucose is below 250, so stop the insulin drip.', danger: true,
              fb: 'Glucose corrects long before the ketoacidosis does. Stop insulin now and ketogenesis restarts. <b>Treat the gap, not the glucose.</b>' },
            { t: 'Switch fluids to D5–D10 in saline and keep the insulin infusion running.', ok: true,
              fb: '<b>Correct.</b> Dextrose lets you keep insulin running to close the gap without causing hypoglycemia. The book says not to let glucose fall below 250 in the first 4–5 hours; the optimal decline is about 100 mg/dL per hour.' },
            { t: 'Switch to subcutaneous sliding-scale insulin.',
              fb: 'Too early. She is still acidotic (AG 17, HCO₃ 13). The subcutaneous transition comes after the gap closes, and never as a sliding scale alone.' },
            { t: 'Double the insulin rate to close the gap faster.', danger: true,
              fb: 'You double the rate when glucose is <i>not</i> falling after the first hour. Hers is falling well, and doubling it without dextrose courts hypoglycemia.' }
          ]
        },
        {
          info: '<b>Hour 11.</b> AG 11, HCO₃ 19, pH 7.33. She is asking for breakfast. Urine ketones are still "moderate."',
          prompt: 'How do you get her off the drip?',
          xp: 10,
          options: [
            { t: 'Keep the drip running until urine ketones are negative.',
              fb: '<b>Trap.</b> Urine ketones lag, and they can look <i>worse</i> as beta-hydroxybutyrate converts to acetoacetate. Go by the gap, pH ≥ 7.3, or HCO₃ ≥ 18. She meets all three.' },
            { t: 'Give SC insulin (basal plus rapid-acting with her meal), then stop the drip after an overlap.', ok: true,
              fb: '<b>Correct.</b> Ch. 2: give short-acting SC insulin with the meal and stop the drip 30 minutes later. Ch. 4: give long-acting basal 2–3 hours before stopping. IV insulin acts for only about an hour, so a drip stopped without overlap leaves her with no insulin at all.' },
            { t: 'Stop the drip now and give her usual SC insulin with lunch.', danger: true,
              fb: 'A gap in insulin coverage means rebound ketoacidosis within hours. Always overlap.' },
            { t: 'Stop the drip and start metformin.', danger: true,
              fb: 'She has type 1 diabetes. She needs insulin, always, and oral agents have no role here.' }
          ],
          update: 'Many protocols now give basal insulin early, even within the first hours of DKA treatment, which shortens the transition and reduces rebound hyperglycemia.'
        }
      ],
      outro: '🎉 Gap closed, and she is eating breakfast. Before discharge she needs insulin education, sick-day rules (never stop basal insulin, check ketones when ill), and reliable access to supplies. Knowledge gaps drive recurrent DKA.'
    },
    {
      id: 'hhs',
      type: 'consult',
      title: 'Ward Consult #2: The Confused Nursing Home Resident',
      icon: '🧓',
      chart: {
        hpi: '81-year-old man from a nursing home with type 2 diabetes on glipizide. One week of poor oral intake, now lethargic and oriented only to self.',
        vitals: 'HR 112 · BP 92/54 · RR 18 · T 38.4 °C',
        exam: 'Very dry mucosa, poor skin turgor, no focal neurologic deficits.',
        labs: [
          ['Glucose', '1,040 mg/dL'],
          ['Na / K / Cl / HCO₃', '148 / 4.2 / 110 / 22'],
          ['BUN / Cr', '78 / 2.4'],
          ['pH', '7.36'],
          ['Serum ketones', 'Negative']
        ]
      },
      rrt: 'Debrief: HHS is a disease of profound dehydration. Isotonic volume comes first. Insulin given into an empty vascular space shifts water into cells and can tip the patient into shock.',
      nodes: [
        {
          kind: 'calc',
          prompt: 'Calculate his effective serum osmolality: 2 × Na + glucose / 18.',
          answer: { min: 350, max: 358, value: '≈354', unit: 'mOsm/L' },
          xp: 10,
          fb: '2(148) + 1040/18 = 296 + 58 ≈ <b>354 mOsm/L</b>. Above 340, coma can be attributed to HHS. If mental status is worse than the osmolality explains, work through the AEIOU TIPSS differential.'
        },
        {
          kind: 'calc',
          prompt: 'Bonus: what is his corrected sodium?',
          answer: { min: 162, max: 164.5, value: '≈163', unit: 'mEq/L' },
          xp: 5,
          fb: '148 + 1.6 × 9.4 ≈ <b>163</b>. He is profoundly hypernatremic underneath, with a huge free-water deficit.'
        },
        {
          prompt: 'What is your first priority?',
          xp: 10,
          options: [
            { t: 'Insulin bolus plus infusion to bring the glucose down fast.', danger: true,
              fb: 'In HHS, giving insulin first is dangerous. As glucose moves into cells, water follows, collapsing an intravascular space that is already empty, and he goes into shock. <b>Fluids first.</b>' },
            { t: 'Aggressive isotonic saline, 1–2 L in the first hour, before insulin.', ok: true,
              fb: '<b>Correct.</b> The deficit is typically <b>9–12 L</b>. Replace half over the first 5–12 hours and the rest over the next 12. Consider central venous monitoring with cardiac or renal disease, and a Foley catheter when mental status is altered.' },
            { t: 'D5W to correct his free-water deficit.', danger: true,
              fb: 'Hypotonic dextrose first, in a hypotensive patient with a glucose of 1,040, is the wrong fluid at the wrong time. Restore circulating volume with isotonic saline first.' },
            { t: 'Sodium bicarbonate for his kidney injury.',
              fb: 'He is not acidotic (pH 7.36, HCO₃ 22), so bicarbonate has no role. His AKI is prerenal and needs volume.' }
          ]
        },
        {
          info: '<b>After hour 1</b> (2 L NS): BP 104/60. His corrected Na is still about 160.',
          prompt: 'Which fluid now?',
          xp: 10,
          options: [
            { t: 'Switch to 0.45% saline.', ok: true,
              fb: '<b>Correct per the text.</b> After the first hour, if Na is 145–165, half-normal saline may be considered; if Na is below 145, continue isotonic. Lower the sodium gradually.' },
            { t: 'Continue 0.9% saline regardless of sodium.',
              fb: 'That was right for the first hour. With a corrected Na near 160, though, he needs free water, and the book suggests switching to 0.45%.' },
            { t: 'Stop IV fluids. He can drink now.', danger: true,
              fb: 'Impaired thirst and altered mentation are why elderly patients develop HHS in the first place. He cannot drink his way out of a 10 L deficit.' }
          ]
        },
        {
          prompt: 'His temperature is 38.4 °C. How do you interpret it?',
          xp: 10,
          options: [
            { t: 'It is expected, because HHS commonly causes fever.', danger: true,
              fb: '<b>Fever is not part of HHS.</b> It points to a precipitant, and infection is the classic one.' },
            { t: 'Search for a precipitant: cultures, UA, chest X-ray, ECG and troponin.', ok: true,
              fb: '<b>Correct.</b> Precipitants include infection, MI, stroke, pancreatitis, GI bleeding, and medications. HHS alone can cause leukocytosis, but fever demands a workup.' },
            { t: 'Give acetaminophen and recheck in the morning.',
              fb: 'That masks the clue. A febrile, confused, hypotensive elderly man needs a search for sepsis tonight.' }
          ]
        },
        {
          info: '<b>Day 3.</b> Glucose is in the 180s, mental status is back to baseline, and he is eating.',
          prompt: 'Discharge plan?',
          xp: 10,
          options: [
            { t: 'Restart glipizide. HHS was a one-off.',
              fb: 'HHS signals significant insulin deficiency. Sulfonylureas also carry real hypoglycemia risk in an elderly man with CKD and erratic intake.' },
            { t: 'Discharge on an insulin regimen and reassess oral agents in clinic.', ok: true,
              fb: '<b>Correct.</b> Most HHS patients need to go home on insulin. Whether oral agents are appropriate is decided later, in the outpatient setting.' },
            { t: 'Stop all diabetes medications and let the A1C guide it later.', danger: true,
              fb: 'That sets him up for HHS again. He needs a regimen and close follow-up.' }
          ]
        }
      ],
      outro: '🎉 He is back to baseline. Key contrast to remember: in <b>DKA</b>, dextrose goes in when glucose falls so the insulin can keep running. In <b>HHS</b>, there is no acidosis to close, so dextrose is not needed and he can transition straight to SC insulin.'
    },
    {
      id: 'medrec',
      type: 'match',
      title: 'Concept Matching: The Med Rec Minefield',
      icon: '🧩',
      instructions: 'Tap an item, then tap the fact that goes with it.',
      xpPer: 2,
      pairs: [
        { l: 'Beta-hydroxybutyrate', r: 'Main ketone in untreated DKA, and the nitroprusside test misses it' },
        { l: 'Glucose < 250 during DKA treatment', r: 'Switch to D5–D10 saline and keep the insulin running' },
        { l: 'Arterial pH < 6.9', r: "The book's threshold for considering bicarbonate" },
        { l: 'Phosphorus < 1.0 mg/dL', r: 'Consider potassium phosphate in the IV fluids' },
        { l: 'New headache or confusion during DKA therapy', r: 'Think cerebral edema and give mannitol' },
        { l: 'Sliding-scale regular insulin alone', r: 'Reactive dosing leads to insulin stacking and swings both ways' },
        { l: 'Metformin', r: 'Lactic acidosis risk, so hold it around IV contrast' },
        { l: 'Glyburide', r: 'Prolonged hypoglycemia, worse in renal insufficiency' },
        { l: 'NPH', r: 'Unpredictable peaks and more hypoglycemia than glargine' },
        { l: 'Thiazolidinedione', r: 'Fluid retention, a bad choice in heart failure' }
      ]
    },
    {
      id: 'hyposort',
      type: 'sort',
      title: 'Lightning Sort: Hypoglycemia Symptoms',
      icon: '⚡',
      instructions: 'Adrenergic (autonomic warning) or neuroglycopenic (brain running out of fuel)?',
      xpPer: 1,
      categories: [
        { key: 'A', label: 'Adrenergic' },
        { key: 'N', label: 'Neuroglycopenic' }
      ],
      items: [
        { t: 'Tremor', c: 'A' },
        { t: 'Confusion', c: 'N' },
        { t: 'Diaphoresis', c: 'A' },
        { t: 'Seizure', c: 'N' },
        { t: 'Palpitations', c: 'A' },
        { t: 'Visual changes', c: 'N' },
        { t: 'Hunger', c: 'A' },
        { t: 'Focal neurologic deficit', c: 'N' },
        { t: 'Anxiety', c: 'A' },
        { t: 'Inappropriate behavior', c: 'N' }
      ],
      outro: 'In <b>hypoglycemia unawareness</b>, the adrenergic warnings vanish and patients go straight to neuroglycopenia. About 3 months of strictly avoiding hypoglycemia can restore the warnings.'
    },
    {
      id: 'pager',
      type: 'pager',
      title: 'Pager Interrupts',
      icon: '📟',
      nodes: [
        {
          info: '📟 <b>Bed 12:</b> "Your DKA patient\'s fingerstick is 48 on the insulin drip. She\'s awake and talking."',
          prompt: 'Your order?',
          xp: 5,
          options: [
            { t: 'Stop the drip, give 25 mL D50 (½ amp) IV, recheck in 20 min.', ok: true,
              fb: '<b>Book protocol:</b> stop the drip. Give ½ amp of D50 if the patient is awake, 1 amp if not. Recheck every 20 minutes and repeat if below 60. Restart at a lower rate once glucose is above 70 on two checks. In DKA with the gap still open, restart insulin soon with more dextrose.' },
            { t: 'Give 4 oz of juice and continue the drip at the same rate.',
              fb: 'Leaving the drip at the same rate guarantees she drops again. Stop it, then treat.' },
            { t: 'Give glucagon 1 mg IM.',
              fb: 'It works, but in the hospital IV D50 is faster and already at hand. Glucagon is the option for home or when there is no IV access.' },
            { t: 'Stop the drip for good and switch to SC insulin.',
              fb: 'Her gap may still be open. Treat the low, then resume the drip at a lower rate with dextrose.' }
          ]
        },
        {
          info: '📟 <b>Bed 7:</b> COPD exacerbation on prednisone 60 mg every morning. Fasting BG 128, 2 PM 330, 6 PM 365.',
          prompt: 'Best adjustment?',
          xp: 5,
          options: [
            { t: 'Increase bedtime glargine.',
              fb: 'His fasting glucose is fine. Steroids push up the afternoon and evening numbers, and more overnight basal invites nocturnal lows, especially as the steroid tapers.' },
            { t: 'Morning NPH (with or without prandial insulin), timed to the prednisone.', ok: true,
              fb: '<b>Correct.</b> Glucocorticoids exaggerate postprandial excursions. A 12-hour insulin like NPH given in the morning (roughly 70% prandial, 30% basal) matches the steroid curve. Taper the insulin as the steroid tapers.' },
            { t: 'Regular insulin sliding scale only.',
              fb: 'Reactive dosing chases the numbers without preventing them, and the book says to abandon it.' },
            { t: 'Add glyburide.',
              fb: 'A long-acting sulfonylurea in a hospitalized patient is a hypoglycemia setup, especially once the steroids taper.' }
          ]
        },
        {
          info: '📟 <b>New admit:</b> T2DM on metformin and glyburide, eating about 50% of meals, CT with IV contrast tomorrow. BGs 214 and 236.',
          prompt: 'Your diabetes orders?',
          xp: 5,
          options: [
            { t: 'Continue his home oral agents.',
              fb: 'Erratic intake plus a sulfonylurea means hypoglycemia, and metformin plus contrast raises lactic acidosis concern. Oral agents are rarely right in hospital.' },
            { t: 'Hold the oral agents and start scheduled basal, prandial, and correction insulin.', ok: true,
              fb: '<b>Correct.</b> Two ward BGs above 170 (or one above 300) is the book\'s trigger to start SC insulin. Hold metformin around contrast (the book says 48 h).' },
            { t: 'Regular insulin sliding scale alone.',
              fb: 'This is the regimen the book says to abandon, because it causes both more hyperglycemia and more hypoglycemia.' }
          ],
          update: 'Current ACR guidance: hold metformin for contrast only if eGFR is below 30 or the patient has AKI. Current ADA inpatient target is 140–180 mg/dL.'
        },
        {
          kind: 'calc',
          info: '📟 <b>Transition time:</b> your ICU patient has needed <b>12 units</b> of IV insulin over the past 6 hours and is now eating.',
          prompt: 'Using the book\'s rule (TDD = 4 × the last 6 h of IV insulin, split 50/50), what daily basal glargine dose do you order?',
          answer: { min: 24, max: 24, value: '24', unit: 'units' },
          xp: 5,
          fb: '4 × 12 = <b>48 U total daily dose</b>, giving <b>24 U basal</b> and 24 U bolus (about 8 U per meal). Ch. 4 suggests starting prandial at 20–40% of TDD in hospital because intake is erratic. Give the basal 2–3 hours before stopping the drip.'
        },
        {
          info: '📞 <b>Family member calls:</b> "He\'s on insulin, unresponsive, and his sugar is 35!"',
          prompt: 'What do you tell them?',
          xp: 5,
          options: [
            { t: 'Pour orange juice into his mouth.', danger: true,
              fb: 'That risks aspiration. Never give liquids to an unconscious patient.' },
            { t: 'Give glucagon 1 mg IM (or glucose gel inside the cheek), then call 911.', ok: true,
              fb: '<b>Correct.</b> Everyone who lives with an insulin-treated patient should be trained to use glucagon and glucose gel.' },
            { t: 'Wait and see if he wakes up.', danger: true,
              fb: 'Untreated neuroglycopenia leads to seizure, coma, and death. Treat now.' }
          ]
        }
      ]
    },
    {
      id: 'boss',
      type: 'boss',
      title: 'Attending Pimp Boss',
      icon: '👹',
      intro: 'The attending stops rounds and turns to you. No answer choices this time. Type or say your answer, reveal it, and grade yourself honestly.',
      xpPer: 10,
      questions: [
        { q: 'Name the three lab criteria that tell you DKA has resolved enough to come off the insulin drip, and the one thing you must do before stopping it.',
          a: '<ul><li>Anion gap normalized</li><li>pH ≥ 7.3</li><li>HCO₃ ≥ 18 mEq/L</li></ul>Before stopping, give <b>subcutaneous insulin with an overlap</b> (short-acting about 30 min before, basal 2–3 h before), because IV insulin acts for only about an hour.' },
        { q: 'Why can urine ketones be negative early in DKA, and why do they seem to get worse with treatment?',
          a: 'Nitroprusside detects only <b>acetoacetate</b>. Untreated DKA is dominated by <b>beta-hydroxybutyrate</b>. As treatment proceeds, beta-hydroxybutyrate is converted to acetoacetate and the test turns "more positive" even though the patient is improving. Follow the anion gap instead.' },
        { q: 'Why does HHS usually lack ketoacidosis, and why do HHS patients get fluids before insulin?',
          a: 'Residual insulin secretion in type 2 diabetes, along with lower counterregulatory hormones, is enough to <b>suppress lipolysis and ketogenesis</b> but not enough to control glucose. Fluids go first because insulin moves glucose, and therefore water, into cells, collapsing an intravascular volume already short by 9–12 L.' },
        { q: 'List the three components of effective inpatient insulin therapy, and name the regimen the book says to abandon.',
          a: '<b>Basal + nutritional (prandial) + correction</b> insulin. Abandon <b>sliding-scale regular insulin alone</b>, which causes insulin stacking and both more hyperglycemia and more hypoglycemia.' }
      ]
    },
    {
      id: 'pearls',
      type: 'pearls',
      title: 'Rapid-Fire Synthesis',
      icon: '⚡',
      intro: 'Fifteen rapid-fire items in three formats: type it from memory, pick the best answer, and explain the why. Interleaving formats is what makes it stick.',
      items: [
        { kind: 'recall', q: 'Name the predominant ketone in untreated DKA.',
          accept: { any: ['hydroxybutyrate', 'bhb', 'ohb', 'beta hydroxy', 'β-hydroxy'] },
          a: 'Beta-hydroxybutyrate. The nitroprusside test detects only acetoacetate, so it misses it.' },
        { kind: 'mcq', q: 'A DKA patient arrives with K 3.0 mEq/L. What do you do before starting insulin?',
          options: [
            { t: 'Hold insulin and replete potassium first', ok: true },
            { t: 'Start insulin at 0.1 U/kg/h and recheck K in 2 hours' },
            { t: 'Give sodium bicarbonate to shift K into cells' },
            { t: 'Start insulin and add 20 mEq KCl per liter' }
          ],
          a: 'Insulin pushes potassium into cells. Starting it with K below 3.3 risks fatal arrhythmia.', update: true },
        { kind: 'why', q: 'Why is serum potassium often high on admission in DKA, yet these patients need potassium replacement?',
          points: [
            'Acidosis and insulin deficiency shift potassium out of cells',
            'Osmotic diuresis and vomiting deplete total-body potassium',
            'Insulin therapy drives potassium back into cells, so serum K falls fast'
          ] },
        { kind: 'recall', q: 'At what glucose (mg/dL) do you add dextrose to the fluids during DKA treatment?',
          accept: { any: ['250'] },
          a: '250 mg/dL. Add D5–D10 and keep the insulin running until the gap closes.' },
        { kind: 'mcq', q: 'Which finding is NOT caused by HHS itself and should prompt a search for a precipitant?',
          options: [
            { t: 'Fever', ok: true },
            { t: 'Leukocytosis' },
            { t: 'Elevated BUN and creatinine' },
            { t: 'Hypertriglyceridemia' }
          ],
          a: 'Fever is not part of HHS. Think infection first, then MI, stroke, pancreatitis, or GI bleeding.' },
        { kind: 'why', q: 'Why do patients with HHS usually avoid ketoacidosis even though their glucose runs higher than in DKA?',
          points: [
            'Residual insulin secretion persists in type 2 diabetes',
            'Even small amounts of insulin suppress lipolysis and ketogenesis',
            'Counterregulatory hormone levels are lower than in DKA'
          ] },
        { kind: 'recall', q: 'Write the formula for effective serum osmolality.',
          accept: { all: ['2', 'na', '18'] },
          a: '2 × Na + glucose / 18. Above 340 mOsm/L, coma can be attributed to HHS.' },
        { kind: 'mcq', q: 'Your patient needed 18 units of IV insulin over the last 6 hours. Using the book\'s rule, what is the estimated total daily SC dose?',
          options: [
            { t: '72 units', ok: true },
            { t: '36 units' },
            { t: '108 units' },
            { t: '18 units' }
          ],
          a: '4 × 18 = 72 U per day, split 50% basal (36 U) and 50% bolus.' },
        { kind: 'why', q: 'Why must you never stop an IV insulin drip without giving subcutaneous insulin first?',
          points: [
            'IV insulin acts for only about an hour after the drip stops',
            'The gap leaves no insulin, so ketogenesis restarts (rebound DKA)',
            'SC insulin takes time to work: rapid-acting about 30 min, basal 2–3 hours'
          ] },
        { kind: 'recall', q: 'What is the typical fluid deficit in HHS, in liters?',
          accept: { any: ['9', '10', '11', '12'] },
          a: '9–12 L. Replace half over the first 5–12 hours and the rest over the next 12.' },
        { kind: 'mcq', q: 'On prednisone 60 mg each morning: fasting glucose 120, 6 PM glucose 350. Best insulin adjustment?',
          options: [
            { t: 'Morning NPH timed to the prednisone', ok: true },
            { t: 'Increase bedtime glargine' },
            { t: 'Regular insulin sliding scale' },
            { t: 'Add glyburide' }
          ],
          a: 'Steroids mainly raise afternoon and evening glucose. A 12-hour insulin given in the morning matches that curve.' },
        { kind: 'mcq', q: 'Which hypoglycemia symptom is neuroglycopenic rather than adrenergic?',
          options: [
            { t: 'Confusion', ok: true },
            { t: 'Tremor' },
            { t: 'Palpitations' },
            { t: 'Diaphoresis' }
          ],
          a: 'Neuroglycopenic symptoms come from the brain running out of fuel: confusion, behavior change, seizures, coma.' },
        { kind: 'why', q: 'Why is sliding-scale insulin alone a bad inpatient regimen?',
          points: [
            'It is reactive: it treats high glucose after it happens instead of preventing it',
            'Repeated doses stack and cause hypoglycemia',
            'It ignores basal and mealtime insulin needs'
          ] },
        { kind: 'recall', q: 'Name the three components of effective inpatient insulin therapy.',
          accept: { all: ['basal', 'correct'], any: ['prandial', 'nutrition', 'bolus', 'meal'] },
          a: 'Basal + nutritional (prandial) + correction insulin.' },
        { kind: 'mcq', q: 'A family member calls: their husband is on insulin, unresponsive, glucose 35. What should they do?',
          options: [
            { t: 'Glucagon 1 mg IM or glucose gel inside the cheek, then call 911', ok: true },
            { t: 'Pour juice into his mouth' },
            { t: 'Give his usual insulin dose and wait' },
            { t: 'Wait 15 minutes and recheck' }
          ],
          a: 'Never give liquids by mouth to an unconscious patient because of aspiration risk.' }
      ],
      pearls: [
        'The DKA triad is {{c1::metabolic acidosis}}, {{c2::hyperglycemia}}, and {{c3::ketonemia/ketonuria}}.',
        'The predominant ketone in untreated DKA is {{c1::beta-hydroxybutyrate}}, which the nitroprusside ketone test {{c2::does not detect}}.',
        'The two classic triggers of DKA are {{c1::infection}} and {{c2::myocardial infarction}}.',
        'First-hour DKA fluids: normal saline at {{c1::15 mL/kg/h}} (about {{c2::1 L/h}} for a 70 kg adult).',
        'Admission potassium in DKA is often high, but total-body potassium is {{c1::depleted}}; keep serum K at {{c2::4–5}} mEq/L.',
        'When glucose falls below {{c1::250}} mg/dL during DKA treatment, add {{c2::dextrose}} and continue the insulin infusion.',
        'The target rate of glucose decline on an insulin infusion is about {{c1::100}} mg/dL per hour.',
        'Stop the DKA insulin drip when the anion gap is {{c1::normal}}, pH ≥ {{c2::7.3}}, or HCO₃ ≥ {{c3::18}} mEq/L, but only after giving {{c4::subcutaneous insulin}}.',
        'The 2009 text reserves bicarbonate in DKA for pH below {{c1::6.9}} or a coexisting cause of severe acidosis.',
        'Sudden headache or confusion during DKA treatment suggests {{c1::cerebral edema}}; treat with {{c2::mannitol}}.',
        'HHS criteria: glucose > {{c1::600}} mg/dL, serum osmolality > {{c2::320}} mOsm/L, and arterial pH > {{c3::7.3}}.',
        'Effective osmolality = {{c1::2 × Na + glucose / 18}}; it must exceed {{c2::340}} mOsm/L to attribute coma to HHS.',
        'Corrected sodium = measured Na + {{c1::1.6}} × (glucose − 100) / 100.',
        'In HHS, give {{c1::fluids}} before {{c2::insulin}}; the typical fluid deficit is {{c3::9–12 L}}.',
        '{{c1::Fever}} is not part of HHS and should prompt a search for {{c2::infection}}.',
        'Most patients who present with HHS should be discharged on {{c1::insulin}}.',
        "Whipple's triad: {{c1::low blood glucose}}, {{c2::compatible symptoms}}, and {{c3::relief when glucose is raised}}.",
        'Hypoglycemia unawareness is loss of the {{c1::adrenergic}} warning symptoms; about {{c2::3 months}} of strict hypoglycemia avoidance can restore them.',
        'Treat mild hypoglycemia with {{c1::15 g}} of simple carbohydrate; for an unconscious patient give {{c2::glucagon 1 mg IM}} or {{c3::IV D50}}, never liquids by mouth.',
        'Inpatient hypoglycemia on a drip: stop the infusion and give {{c1::25 mL (½ amp)}} of D50 if awake or {{c2::50 mL (1 amp)}} if not, then recheck in {{c3::20 minutes}}.',
        'Effective inpatient insulin therapy = {{c1::basal}} + {{c2::nutritional}} + {{c3::correction}} insulin; avoid {{c4::sliding-scale insulin alone}}.',
        'IV-to-SC conversion: estimated TDD = {{c1::4 ×}} the IV insulin used over the last 6 hours, split {{c2::50% basal / 50% bolus}}.',
        'On the wards, start SC insulin if two glucose values exceed {{c1::170}} mg/dL or one exceeds {{c2::300}} mg/dL.',
        'Steroid-induced hyperglycemia mainly raises {{c1::postprandial (afternoon/evening)}} glucose and responds well to {{c2::morning NPH}}.',
        'Hold {{c1::metformin}} around IV contrast because of the risk of {{c2::lactic acidosis}}.',
        '{{c1::Mucormycosis}} thrives in DKA because the fungi grow in acid pH, high glucose, and can use {{c2::ketones}} as a substrate.'
      ],
      updates: [
        'Current ICU and ward glucose targets are {{c1::140–180}} mg/dL; NICE-SUGAR showed harm from the 80–110 target in the 2009 text.',
        'In DKA, if the initial potassium is below {{c1::3.3}} mEq/L, {{c2::hold insulin}} and replete potassium first.',
        'Patients taking {{c1::SGLT2 inhibitors}} can develop {{c2::euglycemic}} DKA with glucose below 250 mg/dL.',
        'The mannitol dose for cerebral edema is {{c1::0.5–1 g/kg}}; the 2009 text misprints it as 1 mg/kg.',
        'Current ADA consensus considers bicarbonate in DKA when pH is below {{c1::7.0}}.'
      ]
    }
  ]
};
