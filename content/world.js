// The Realm of Corporia: the whole world in one data file.
// map.html draws the world map from it, and a 3D world (Three.js or Godot) can read the same
// realms, floors, positions and routes. Positions are map units on a 1600 × 1000 canvas
// (x to the right, y down); divide by `size` for 0–1 coordinates.
//
// Rule: each of the 20 board categories has exactly ONE home (a dungeon, tower or guild hall),
// so the board's category list maps 1:1 onto places. Dungeons have 10 floors, towers and guild
// halls have 5, and the last floor is always the boss.
window.CORPORIA = {
  size: [1600, 1000],

  // The board's 20 categories, in the order a question bank lists them.
  categories: [
    'Allergy & Immunology',
    'Biostatistics & Epidemiology',
    'Cardiovascular System',
    'Dermatology',
    'Ear, Nose & Throat (ENT)',
    'Endocrine, Diabetes & Metabolism',
    'Female Reproductive System & Breast',
    'Gastrointestinal & Nutrition',
    'Hematology & Oncology',
    'Infectious Diseases',
    'Male Reproductive System',
    'Nervous System',
    'Ophthalmology',
    'Poisoning & Environmental Exposure',
    'Pregnancy, Childbirth & Puerperium',
    'Psychiatric/Behavioral & Substance Use Disorder',
    'Pulmonary & Critical Care',
    'Renal, Urinary Systems & Electrolytes',
    'Rheumatology/Orthopedics & Sports',
    'Social Sciences (Ethics/Legal/Professional)'
  ],

  // kind: 'hub' | 'realm'. Each site is one dungeon (10 floors), tower (5) or guild hall (5).
  // floors: [floor or range, topic]; the boss is always the last floor.
  // A floor entry may carry `written` (questions already exist in the 2D game) and `src` (where).
  realms: [
    {
      id: 'hub', kind: 'hub', name: 'The Arcane Citadel', short: 'Biostatistics · Ethics & law',
      epithet: 'The healers’ hub at the center of Corporia',
      lore: 'Every river, road and portal leads back here. Players start in the Citadel, bank their loot, trade, and train in the two guild halls that teach what every realm shares.',
      color: '#efe6cc', seed: null, at: [785, 455], label: [785, 545], gate: [858, 432],
      sites: [
        {
          id: 'observatory', kind: 'guild', name: 'The Grand Observatory of Numbers', category: 'Biostatistics & Epidemiology',
          play: 'Scrying puzzles instead of monsters. Solving them grants buffs that work in every realm.',
          floors: [
            ['1', '2 × 2 tables: sensitivity and specificity'],
            ['2', 'Predictive values and likelihood ratios'],
            ['3', 'Study designs and bias'],
            ['4', 'Risk, number needed to treat and hypothesis testing']
          ],
          boss: { name: 'The Confounder', topic: 'Critical appraisal of a trial abstract' }
        },
        {
          id: 'court', kind: 'guild', name: 'The High Court of Asclepius', category: 'Social Sciences (Ethics/Legal/Professional)',
          play: 'Branching dialogue trials. Passing them raises your Honor rank, which unlocks Heroic mode.',
          floors: [
            ['1', 'Informed consent and autonomy'],
            ['2', 'Capacity and surrogate decisions'],
            ['3', 'Confidentiality and mandatory reporting'],
            ['4', 'Medical errors and patient safety']
          ],
          boss: { name: 'The Tribunal of Shades', topic: 'End-of-life care and professionalism' }
        }
      ]
    },
    {
      id: 'forge', kind: 'realm', name: 'The Crimson Forge', short: 'Cardiovascular',
      epithet: 'A volcano-forge with four great furnaces',
      lore: 'The heart of Corporia. Four chambered furnaces beat in rhythm, and every arterial river flows out from the caldera.',
      color: '#e6bca6', seed: [820, 640], at: [820, 655], label: [820, 722], gate: [886, 636], caption: 'Cardiovascular',
      sites: [
        {
          id: 'forge', kind: 'dungeon', name: 'The Crimson Forge', category: 'Cardiovascular System',
          floors: [
            ['1–2', 'Heart sounds, hemodynamics and the ECG'],
            ['3–4', 'Hypertension and coronary disease'],
            ['5–6', 'Heart failure and valve disease'],
            ['7–8', 'Arrhythmias, cardiomyopathy and the pericardium'],
            ['9', 'The aorta and peripheral vascular disease']
          ],
          boss: { name: 'The Molten Ventricle', topic: 'Cardiogenic shock and cardiac arrest' }
        }
      ]
    },
    {
      id: 'spire', kind: 'realm', name: 'The Spire of Breath', short: 'Pulmonary & critical care',
      epithet: 'Windswept peaks joined by bronchial bridges',
      lore: 'Snow peaks that rise and fall with a slow tide of wind. Bronchial suspension bridges branch between them and end in glowing alveolar caverns.',
      color: '#d9e3ea', seed: [470, 300], at: [465, 285], label: [465, 352], gate: [528, 248],
      sites: [
        {
          id: 'spire', kind: 'dungeon', name: 'The Spire of Breath', category: 'Pulmonary & Critical Care',
          floors: [
            ['1–2', 'Respiratory physiology, ABGs, PFTs and chest imaging'],
            ['3–4', 'Asthma, COPD and bronchiectasis'],
            ['5–6', 'Pneumonia, pleural disease and pulmonary embolism'],
            ['7–8', 'Interstitial lung disease, pulmonary hypertension, sleep apnea and lung nodules'],
            ['9', 'Respiratory failure and the ventilator']
          ],
          boss: { name: 'The Drowned King', topic: 'ARDS and septic shock' }
        }
      ]
    },
    {
      id: 'sanctum', kind: 'realm', name: 'The Alchemical Sanctum', short: 'Endocrinology · Diabetes · Metabolism',
      epithet: 'A desert oasis of crystal glands and hormone geysers',
      lore: 'Crystal glands rise from the dunes, and feedback-loop aqueducts carry their elixirs to every realm. The Portal Stair links it to the Synaptic Citadel. Your existing Endocrinology questions move in here.',
      color: '#ecdcaa', seed: [705, 245], at: [700, 230], label: [700, 297], gate: [768, 205],
      sites: [
        {
          id: 'sanctum', kind: 'dungeon', name: 'The Alchemical Sanctum', category: 'Endocrine, Diabetes & Metabolism',
          floors: [
            ['1', 'Hormone axes and feedback loops'],
            ['2', 'Diabetes: diagnosis, drugs and complications', { written: true, src: 'Day 2' }],
            ['3', 'Insulin, inpatient glucose and hypoglycemia', { written: true, src: 'Days 1–2' }],
            ['4', 'Lipids, obesity and metabolic syndrome', { written: true, src: 'Day 3' }],
            ['5', 'Calcium and the parathyroids', { written: true, src: 'Day 4' }],
            ['6', 'Bone and mineral disease', { written: true, src: 'Day 5' }],
            ['7', 'Pituitary and water balance', { src: 'Days 6–7' }],
            ['8', 'The adrenals', { src: 'Days 8–9' }],
            ['9', 'Thyroid and rare syndromes', { src: 'Days 10, 11, 13' }]
          ],
          boss: { name: 'The Twin Storms', topic: 'DKA, thyroid storm and adrenal crisis', src: 'Days 1, 11, 14', partly: true }
        }
      ]
    },
    {
      id: 'citadel', kind: 'realm', name: 'The Synaptic Citadel', short: 'Neurology · Eyes · Ear, nose & throat',
      epithet: 'A storm-lit castle between two watchtowers',
      lore: 'Lightning arcs between the towers and carries commands down the Neural Roads to every realm. The Optic Observatory and the Cochlear Spire keep watch over sight and sound.',
      color: '#d4cde3', seed: [1075, 195], at: [1060, 188], label: [1060, 258], gate: [1140, 150], caption: 'Nervous system',
      sites: [
        {
          id: 'citadel', kind: 'dungeon', name: 'The Synaptic Citadel', category: 'Nervous System',
          floors: [
            ['1–2', 'Localization: tracts, cranial nerves and the neuro exam'],
            ['3–4', 'Headache and seizures'],
            ['5–6', 'Stroke and intracranial bleeding'],
            ['7–8', 'Multiple sclerosis, neuromuscular and movement disorders'],
            ['9', 'Dementia and brain tumors']
          ],
          boss: { name: 'The Storm Crown', topic: 'Status epilepticus, coma and herniation' }
        },
        {
          id: 'optic', kind: 'tower', name: 'The Optic Observatory', category: 'Ophthalmology',
          at: [930, 190], label: [904, 184], anchor: 'end', caption: 'Ophthalmology',
          floors: [
            ['1', 'The red eye'],
            ['2', 'Sudden and gradual vision loss'],
            ['3', 'The eye in diabetes and hypertension'],
            ['4', 'Pupils, visual fields and the optic nerve']
          ],
          boss: { name: 'The Basilisk', topic: 'Eye emergencies: angle-closure glaucoma, retinal artery occlusion, orbital cellulitis, chemical burns' }
        },
        {
          id: 'cochlear', kind: 'tower', name: 'The Cochlear Spire', category: 'Ear, Nose & Throat (ENT)',
          at: [1240, 205], label: [1246, 254], caption: 'Ear, nose & throat',
          floors: [
            ['1', 'Ear infections and hearing loss'],
            ['2', 'Vertigo and balance'],
            ['3', 'The nose and sinuses'],
            ['4', 'Throat, neck masses and head and neck cancer']
          ],
          boss: { name: 'The Strangling Wyrm', topic: 'Airway emergencies: epiglottitis and deep neck infections' }
        }
      ]
    },
    {
      id: 'abyss', kind: 'realm', name: 'The Filtration Abysses', short: 'Renal · Urinary · Electrolytes',
      epithet: 'Sunken aqueducts and salt-crystal caverns',
      lore: 'Ancient aqueducts sink into the earth in countercurrent cascades, sieving the realm’s rivers clean. Salt crystals grow wherever the water runs too fast or too slow.',
      color: '#cbe2e2', seed: [1140, 480], at: [1145, 470], label: [1145, 535], gate: [1210, 432],
      sites: [
        {
          id: 'abyss', kind: 'dungeon', name: 'The Filtration Abysses', category: 'Renal, Urinary Systems & Electrolytes',
          floors: [
            ['1–2', 'Renal physiology, urinalysis and acute kidney injury'],
            ['3–4', 'Sodium, potassium and water'],
            ['5–6', 'Acid–base disorders'],
            ['7–8', 'Glomerular disease and chronic kidney disease'],
            ['9', 'Stones, obstruction and urinary tract tumors']
          ],
          boss: { name: 'The Uremic Leviathan', topic: 'Severe hyperkalemia, uremia and emergency dialysis' }
        }
      ]
    },
    {
      id: 'veil', kind: 'realm', name: 'The Veil of Illusion', short: 'Psychiatry · Substance use',
      epithet: 'A shifting, mist-bound forest beside the Citadel',
      lore: 'Paths move when no one is looking, and the mist shows each traveler something different. At its southern edge the forest rots into the Toxidrome Swamp.',
      color: '#c9d8cc', seed: [1390, 360], at: [1385, 330], label: [1370, 395], gate: [1462, 300], caption: 'Psychiatry · Substance use',
      sites: [
        {
          id: 'veil', kind: 'dungeon', name: 'The Veil of Illusion', category: 'Psychiatric/Behavioral & Substance Use Disorder',
          floors: [
            ['1–2', 'Depression and bipolar disorder'],
            ['3–4', 'Anxiety, trauma and OCD'],
            ['5–6', 'Psychosis and psychiatric medications'],
            ['7–8', 'Personality, eating, somatic and childhood disorders'],
            ['9', 'Substance use: intoxication and withdrawal']
          ],
          boss: { name: 'The Mirror Wraith', topic: 'Psychiatric emergencies: suicide risk, agitation, NMS, serotonin syndrome, delirium tremens' }
        },
        {
          id: 'swamp', kind: 'tower', name: 'The Toxidrome Swamp', category: 'Poisoning & Environmental Exposure',
          at: [1405, 560], label: [1405, 608], caption: 'Poisoning & environment',
          floors: [
            ['1', 'Toxidromes and antidotes'],
            ['2', 'Common overdoses'],
            ['3', 'Toxic gases, alcohols and pesticides'],
            ['4', 'Heat, cold, drowning and altitude']
          ],
          boss: { name: 'The Venom Matriarch', topic: 'Bites, stings and envenomation' }
        }
      ]
    },
    {
      id: 'bastion', kind: 'realm', name: 'The Scarlet Bastion', short: 'Hematology & oncology · Immunology',
      epithet: 'Marrow Keep and its immune garrison',
      lore: 'Marrow Keep forges the realm’s blood, and its garrison patrols every border. The Lymph Gates, Corporia’s portal network, are anchored in its walls.',
      color: '#e3c1bc', seed: [1290, 780], at: [1290, 756], label: [1290, 818], gate: [1360, 720], caption: 'Hematology & oncology',
      sites: [
        {
          id: 'keep', kind: 'dungeon', name: 'Marrow Keep', category: 'Hematology & Oncology',
          floors: [
            ['1–2', 'Anemias'],
            ['3–4', 'Bleeding, clotting and anticoagulants'],
            ['5–6', 'Leukemias and lymphomas'],
            ['7–8', 'Myeloma, myeloproliferative disease and transfusion'],
            ['9', 'Solid tumors, cancer screening and chemotherapy']
          ],
          boss: { name: 'The Lysis Lich', topic: 'Oncologic emergencies: tumor lysis, febrile neutropenia, TTP, DIC, cord compression' }
        },
        {
          id: 'garrison', kind: 'tower', name: 'The Immune Garrison', category: 'Allergy & Immunology',
          at: [1180, 700], label: [1176, 748], caption: 'Allergy & immunology',
          floors: [
            ['1', 'Hypersensitivity reactions'],
            ['2', 'Allergic rhinitis, food and drug allergy, urticaria'],
            ['3', 'Immunodeficiencies'],
            ['4', 'Transplant and immunosuppression']
          ],
          boss: { name: 'The Hive Queen', topic: 'Anaphylaxis and angioedema' }
        }
      ]
    },
    {
      id: 'marches', kind: 'realm', name: 'The Blighted Marches', short: 'Infectious diseases',
      epithet: 'A plague-haunted frontier at the edge of the map',
      lore: 'The western frontier, where ruined outposts and spore-filled groves hold back plagues from beyond the sea. Knights from the Scarlet Bastion arrive by Lymph Gate.',
      color: '#d5cba9', seed: [240, 520], at: [265, 505], label: [270, 572], gate: [330, 462],
      sites: [
        {
          id: 'outpost', kind: 'dungeon', name: 'The Quarantine Outpost', category: 'Infectious Diseases',
          floors: [
            ['1–2', 'Microbes, antibiotics and resistance'],
            ['3–4', 'Skin, bone, joint and sexually transmitted infections'],
            ['5–6', 'Meningitis, endocarditis and bloodstream infections'],
            ['7–8', 'HIV, tuberculosis and opportunistic infections'],
            ['9', 'Travel, zoonotic, fungal and parasitic infections']
          ],
          boss: { name: 'The Plague Sovereign', topic: 'Necrotizing fasciitis, meningococcemia and other fulminant infections' }
        }
      ]
    },
    {
      id: 'cauldron', kind: 'realm', name: 'The Cauldron of Chyme', short: 'Gastroenterology · Nutrition',
      epithet: 'Acid swamps around the Hepatic Refinery',
      lore: 'A steaming swamp of acid geysers and peristaltic tunnels. At its heart, the Hepatic Refinery purifies everything the Portal River carries in.',
      color: '#d5dba9', seed: [720, 830], at: [720, 790], label: [720, 852], gate: [790, 772],
      sites: [
        {
          id: 'cauldron', kind: 'dungeon', name: 'The Cauldron of Chyme', category: 'Gastrointestinal & Nutrition',
          floors: [
            ['1–2', 'Esophagus and stomach'],
            ['3–4', 'Small bowel, malabsorption and nutrition'],
            ['5–6', 'The colon: IBD, diverticular disease and colorectal cancer'],
            ['7–8', 'Liver, gallbladder and pancreas'],
            ['9', 'Upper and lower GI bleeding']
          ],
          boss: { name: 'The Portal Hydra', topic: 'Variceal bleeding and acute liver failure' }
        }
      ]
    },
    {
      id: 'bulwark', kind: 'realm', name: 'The Titan’s Bulwark', short: 'Rheumatology · Orthopedics · Sports',
      epithet: 'Colossal ramparts on iron hinges',
      lore: 'The realm’s skeleton: stone ramparts that swing on great iron hinges. The Outer Wall, Corporia’s skin, runs along the southern coast and takes the first blow from sun, fire and blade.',
      color: '#d8d2c6', seed: [1060, 830], at: [1040, 762], label: [1040, 822], gate: [1114, 726], caption: 'Rheumatology · Orthopedics · Sports',
      sites: [
        {
          id: 'bulwark', kind: 'dungeon', name: 'The Titan’s Bulwark', category: 'Rheumatology/Orthopedics & Sports',
          floors: [
            ['1–2', 'Fractures, sprains and sports injuries'],
            ['3–4', 'Back pain, neck pain and nerve entrapment'],
            ['5–6', 'Osteoarthritis, gout, rheumatoid arthritis and spondyloarthritis'],
            ['7–8', 'Lupus, myositis, scleroderma and vasculitis'],
            ['9', 'Pediatric orthopedics and bone tumors']
          ],
          boss: { name: 'The Shattered Colossus', topic: 'Compartment syndrome, open fractures, cauda equina and the septic joint' }
        },
        {
          id: 'wall', kind: 'tower', name: 'The Outer Wall', category: 'Dermatology',
          at: [912, 866], label: [944, 868], anchor: 'start', caption: 'Dermatology',
          floors: [
            ['1', 'Describing lesions and common rashes'],
            ['2', 'Skin infections and infestations'],
            ['3', 'Skin cancer'],
            ['4', 'Skin signs of systemic disease and drug eruptions']
          ],
          boss: { name: 'The Shedding Serpent', topic: 'Stevens–Johnson syndrome, TEN and blistering emergencies' }
        }
      ]
    },
    {
      id: 'genesis', kind: 'realm', name: 'The Genesis Sanctuary', short: 'Obstetrics · Gynecology · Male reproductive',
      epithet: 'Twin temple gardens around a glowing spring',
      lore: 'The gardens of Gynaia and Andros meet at the Nursery of Lucina, where new life enters Corporia, on the sheltered southwest coast far from the Blight.',
      color: '#e8d3d6', seed: [440, 760], at: [440, 760], label: [440, 640], gate: [440, 714], caption: null,
      sites: [
        {
          id: 'lucina', kind: 'dungeon', name: 'The Nursery of Lucina', category: 'Pregnancy, Childbirth & Puerperium',
          at: [450, 800], label: [450, 850], caption: 'Pregnancy & childbirth',
          floors: [
            ['1–2', 'Prenatal care and screening'],
            ['3–4', 'Early pregnancy loss and ectopic pregnancy'],
            ['5–6', 'Hypertension, diabetes and medical disease in pregnancy'],
            ['7–8', 'Labor, delivery and fetal monitoring'],
            ['9', 'Postpartum care and breastfeeding']
          ],
          boss: { name: 'The Bleeding Moon', topic: 'Obstetric emergencies: eclampsia, postpartum hemorrhage, shoulder dystocia' }
        },
        {
          id: 'gynaia', kind: 'dungeon', name: 'The Garden of Gynaia', category: 'Female Reproductive System & Breast',
          at: [345, 728], label: [338, 776], caption: 'Female reproductive & breast',
          floors: [
            ['1–2', 'The menstrual cycle and abnormal bleeding', { src: 'Day 12' }],
            ['3–4', 'Contraception, infertility and menopause', { src: 'Day 12' }],
            ['5–6', 'Pelvic infections, pain and masses'],
            ['7–8', 'Breast disease'],
            ['9', 'Gynecologic cancers and screening']
          ],
          boss: { name: 'The Thornbloom', topic: 'Ovarian torsion, tubo-ovarian abscess and other gynecologic emergencies' }
        },
        {
          id: 'andros', kind: 'tower', name: 'The Garden of Andros', category: 'Male Reproductive System',
          at: [524, 726], label: [554, 774], caption: 'Male reproductive',
          floors: [
            ['1', 'Puberty, hypogonadism and male infertility', { src: 'Day 12' }],
            ['2', 'The prostate'],
            ['3', 'Erectile dysfunction and gynecomastia', { src: 'Day 12' }],
            ['4', 'Testicular and scrotal masses']
          ],
          boss: { name: 'The Twisted Knight', topic: 'Testicular torsion, priapism and Fournier gangrene' }
        }
      ]
    }
  ],

  // Multisystem disease: raid bosses that roam between realms for guilds to fight together.
  worldBosses: [
    {
      id: 'sepsis', name: 'The Sepsis Hydra', at: [420, 440],
      blurb: 'Every head is a failing organ. Cut one off and two more grow.',
      realms: ['marches', 'spire', 'forge', 'abyss']
    },
    {
      id: 'amyloid', name: 'The Amyloid Golem', at: [990, 420],
      blurb: 'A slow giant of misfolded protein that settles into heart, kidney and nerve.',
      realms: ['forge', 'abyss', 'citadel', 'cauldron']
    },
    {
      id: 'trauma', name: 'The Polytrauma Juggernaut', at: [1192, 606],
      blurb: 'It breaks bone, drains blood and rattles the brain in a single charge.',
      realms: ['bulwark', 'bastion', 'spire', 'citadel']
    }
  ],

  // Three travel networks, each modeled on a body system.
  travel: {
    rivers: {
      name: 'Arterial rivers',
      text: 'Boat routes that flow out from the Crimson Forge to every realm. The Lesser Circuit runs both ways between the Forge and the Spire of Breath.',
      from: [820, 640],
      routes: [
        { to: 'sanctum', via: [[700, 522], [688, 370]], end: [712, 330] },
        { to: 'citadel', via: [[902, 522], [962, 382]], end: [1022, 296] },
        { to: 'spire', via: [[660, 602], [562, 472]], end: [484, 392] },
        { to: 'marches', via: [[642, 662], [452, 594]], end: [410, 546] },
        { to: 'genesis', via: [[702, 706], [612, 798]], end: [488, 812] },
        { to: 'cauldron', via: [[792, 702]], end: [748, 752] },
        { to: 'bulwark', via: [[922, 690]], end: [990, 742] },
        { to: 'bastion', via: [[962, 602], [1180, 640]], end: [1248, 704] },
        { to: 'abyss', via: [[952, 582]], end: [1095, 500] },
        { to: 'veil', via: [[962, 562], [1102, 402], [1252, 334]], end: [1336, 332] }
      ],
      // Venous return from the lungs to the Forge: the second half of the Lesser Circuit.
      returns: [{ from: 'spire', points: [[500, 396], [578, 466], [676, 594]], end: [800, 652], label: 'The Lesser Circuit', labelAt: '34%' }]
    },
    roads: {
      name: 'Neural roads',
      text: 'The Spinal Road runs from the Synaptic Citadel through the Arcane Citadel to the Titan’s Bulwark, and nerve roads branch off to every realm. The Portal Stair links the Synaptic Citadel to the Alchemical Sanctum.',
      paths: [
        { id: 'spinal-n', points: [[1062, 298], [960, 362], [826, 408]] },
        { id: 'spinal-s', points: [[838, 498], [930, 560], [990, 680], [1024, 726]] },
        { id: 'portal-stair', points: [[1018, 200], [930, 218], [820, 226], [760, 230]], label: 'The Portal Stair', labelDy: 17 },
        { id: 'to-spire', points: [[728, 446], [620, 400], [530, 340]] },
        { id: 'to-marches', points: [[728, 476], [560, 506], [420, 518], [330, 504]] },
        { id: 'to-genesis', points: [[748, 506], [640, 600], [548, 690]] },
        { id: 'to-cauldron', points: [[770, 516], [740, 612], [724, 748]] },
        { id: 'to-abyss', points: [[960, 362], [1040, 402], [1106, 446]] },
        { id: 'to-veil', points: [[1062, 298], [1160, 302], [1262, 302], [1336, 320]] },
        { id: 'to-bastion', points: [[1176, 504], [1270, 600], [1300, 684]] },
        { id: 'to-swamp', points: [[1400, 420], [1416, 476], [1410, 532]] },
        { id: 'to-optic', points: [[1008, 186], [952, 178]] },
        { id: 'to-cochlear', points: [[1112, 192], [1218, 200]] },
        { id: 'to-wall', points: [[1000, 798], [938, 848]] },
        { id: 'to-garrison', points: [[1250, 742], [1212, 716]] }
      ]
    },
    gates: {
      name: 'Lymph Gates',
      text: 'Portal stones for fast travel. Clear a realm’s first floor to light its gate. Every gate links back to the Scarlet Bastion.'
    }
  },

  // Coastline control points, clockwise from the northwest. map.js smooths and roughens them.
  coast: [
    [170, 300], [240, 190], [360, 150], [520, 135], [640, 120], [760, 112], [900, 120], [1010, 104],
    [1130, 112], [1250, 135], [1360, 168], [1450, 228], [1505, 330], [1490, 440], [1516, 540],
    [1482, 650], [1452, 760], [1402, 858], [1290, 904], [1160, 914], [1030, 906], [900, 920],
    [780, 906], [660, 886], [560, 900], [450, 896], [340, 872], [250, 822], [205, 732], [150, 650],
    [120, 560], [134, 450], [150, 370]
  ]
};

if (typeof module !== 'undefined') module.exports = window.CORPORIA;
