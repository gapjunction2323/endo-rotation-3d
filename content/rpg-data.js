window.ENDO_RPG = {
  titles: [
    { level: 1, name: 'Intern' },
    { level: 3, name: 'Junior Resident' },
    { level: 5, name: 'Senior Resident' },
    { level: 7, name: 'Chief Resident' },
    { level: 9, name: 'Endo Fellow' },
    { level: 11, name: 'Attending' }
  ],

  materials: {
    sample: { icon: '🧪', name: 'Lab Sample' },
    fragment: { icon: '💎', name: 'Pearl Fragment' },
    note: { icon: '📝', name: 'Attending Note' }
  },

  // Materials granted the first time a station type is cleared.
  drops: {
    consult: { sample: 2 },
    pager: { sample: 1 },
    match: { fragment: 1 },
    sort: { fragment: 1 },
    pearls: { fragment: 3 },
    boss: { note: 1 }
  },
  bossLoot: ['tool_steth', 'badge_pager', 'coat_long'],
  bossCoins: 50,

  slots: { coat: 'Coat', tool: 'Tool', badge: 'Badge' },
  rarity: { common: '#94a3b8', rare: '#38bdf8', epic: '#c084fc' },

  items: {
    coat_short: { icon: '🥼', name: 'Short White Coat', slot: 'coat', rarity: 'common', desc: 'Pockets full of index cards.', mods: {} },
    coat_long: { icon: '🥼', name: 'Long White Coat', slot: 'coat', rarity: 'rare', desc: 'Patients assume you know things.', mods: { xpPct: 0.05 } },
    coat_fleece: { icon: '🧥', name: 'Fleece Vest', slot: 'coat', rarity: 'epic', desc: 'The unofficial uniform of fellows.', mods: { xpPct: 0.08, coinPct: 0.1 } },
    tool_guide: { icon: '📘', name: 'Pocket Pharmacopeia', slot: 'tool', rarity: 'common', desc: 'Dog-eared at the insulin page.', mods: { coinPct: 0.1 } },
    tool_steth: { icon: '🩺', name: 'Cardiology Stethoscope', slot: 'tool', rarity: 'rare', desc: 'Hear the wrong answers coming.', mods: { narrow: 1 } },
    badge_lanyard: { icon: '🎗️', name: 'Lucky Lanyard', slot: 'badge', rarity: 'common', desc: 'Survived three night floats.', mods: { coinPct: 0.15 } },
    badge_pager: { icon: '📟', name: 'Code Pager', slot: 'badge', rarity: 'rare', desc: 'Calm under pressure.', mods: { stability: 1 } },
    badge_pin: { icon: '🏅', name: 'Golden Islet Pin', slot: 'badge', rarity: 'epic', desc: 'Awarded for beta-cell heroics.', mods: { xpPct: 0.05, narrow: 1 } }
  },

  consumables: {
    coffee: { icon: '☕', name: 'Double Espresso', desc: '+20% XP on your next station.' },
    snack: { icon: '🍫', name: 'Vending Machine Snack', desc: '+1 stability light on your next consult.' },
    scroll: { icon: '📜', name: 'Mnemonic Scroll', desc: 'One extra "Narrow it down" when you run out.' }
  },

  shop: [
    { id: 'coffee', kind: 'cons', price: 20 },
    { id: 'snack', kind: 'cons', price: 25 },
    { id: 'scroll', kind: 'cons', price: 40 },
    { id: 'tool_guide', kind: 'item', price: 60 },
    { id: 'badge_lanyard', kind: 'item', price: 80 },
    { id: 'coat_long', kind: 'item', price: 150 },
    { id: 'tool_steth', kind: 'item', price: 200 },
    { id: 'badge_pager', kind: 'item', price: 220 }
  ],

  recipes: [
    { id: 'r_scroll', out: { kind: 'cons', id: 'scroll', n: 1 }, needs: { fragment: 2 }, coins: 0 },
    { id: 'r_coffee', out: { kind: 'cons', id: 'coffee', n: 1 }, needs: { sample: 1, fragment: 1 }, coins: 0 },
    { id: 'r_fleece', out: { kind: 'item', id: 'coat_fleece', n: 1 }, needs: { sample: 4, note: 2 }, coins: 100 },
    { id: 'r_pin', out: { kind: 'item', id: 'badge_pin', n: 1 }, needs: { fragment: 6, note: 1 }, coins: 150 }
  ],

  skills: [
    { id: 'diff', icon: '🔍', name: 'Differential Diagnosis', max: 2, desc: '+1 "Narrow it down" per station (removes one wrong option).' },
    { id: 'steady', icon: '🫀', name: 'Steady Hands', max: 2, desc: '+1 patient stability light per rank.' },
    { id: 'scholar', icon: '📚', name: 'Scholar', max: 3, desc: '+4% XP from everything per rank.' },
    { id: 'socratic', icon: '❓', name: 'Socratic Method', max: 2, desc: '+10% XP on attending boss and rapid-fire rounds per rank.' },
    { id: 'debt', icon: '💰', name: 'Med School Debt', max: 2, desc: '−10% pharmacy prices per rank.' },
    { id: 'chemist', icon: '⚗️', name: 'Bench Chemist', max: 1, desc: '25% chance a craft yields double.' }
  ],

  raidBosses: [
    { name: 'Thyroid Storm', emoji: '🌪️' },
    { name: 'The Insulinoma', emoji: '🍬' },
    { name: 'Adrenal Crisis', emoji: '🧂' },
    { name: 'The Pheo Phantom', emoji: '👻' },
    { name: 'Myxedema Mire', emoji: '🧊' },
    { name: 'Hypercalcemic Golem', emoji: '🗿' }
  ],
  raidReward: { coins: 80, mats: { note: 1, fragment: 2 } },
  duelReward: { win: 40, tie: 20, loss: 10 },

  // Upper floors. Floor 1 (the ground floor above) holds the ED, ICU, and the shared services
  // (pharmacy, lab, library, guild hall, arena, badge office). Every other rotation day gets its
  // own floor plan here, keyed by day number. Station NPCs are slots: the day's content `cast`
  // (keyed by the same ids) decides which station each slot runs and can rename or re-skin it.
  // A slot with no matching cast entry is left empty on that floor.
  floors: {
    2: {
      w: 36, h: 29,
      spawn: { x: 17, y: 26.2 },
      arrive: { x: 17, y: 26.2 },
      name: 'Clinic & Wards',
      theme: { void: '#1c1824', wall: '#4a3f5c', wallTop: '#66597d', label: 'rgba(58,44,70,.6)' },
      rooms: [
        { id: 'hall', name: '', x: 15, y: 2, w: 4, h: 26, color: '#e8e1d4' },
        { id: 'ward', name: 'Medicine Ward 4B', x: 1, y: 2, w: 13, h: 8, color: '#dde9da' },
        { id: 'medroom', name: 'Med Room', x: 1, y: 11, w: 13, h: 4, color: '#dcebf3' },
        { id: 'edu', name: 'Diabetes Education', x: 1, y: 16, w: 13, h: 5, color: '#f3ead2' },
        { id: 'lounge', name: 'Staff Lounge', x: 1, y: 22, w: 13, h: 6, color: '#e8ddf0' },
        { id: 'ld', name: 'L&D Triage', x: 20, y: 2, w: 15, h: 8, color: '#f6dce5' },
        { id: 'clinic', name: 'Endocrine Clinic', x: 20, y: 11, w: 15, h: 6, color: '#d6ebe8' },
        { id: 'conf', name: 'Conference Room', x: 20, y: 18, w: 15, h: 5, color: '#ebe1d1' },
        { id: 'wait', name: 'Waiting Area', x: 20, y: 24, w: 15, h: 4, color: '#dfe3ef' }
      ],
      doors: [
        { x: 14, y: 5, w: 1, h: 2 }, { x: 14, y: 12, w: 1, h: 2 }, { x: 14, y: 18, w: 1, h: 1 }, { x: 14, y: 24, w: 1, h: 2 },
        { x: 19, y: 5, w: 1, h: 2 }, { x: 19, y: 13, w: 1, h: 1 }, { x: 19, y: 20, w: 1, h: 1 }, { x: 19, y: 25, w: 1, h: 2 }
      ],
      decor: [
        // ward: four beds with monitors and a charting station
        { t: 'bed', x: 2, y: 2, w: 1, h: 2 }, { t: 'monitor', x: 3, y: 2, w: 1, h: 1 },
        { t: 'bed', x: 5, y: 2, w: 1, h: 2 }, { t: 'monitor', x: 6, y: 2, w: 1, h: 1 },
        { t: 'bed', x: 8, y: 2, w: 1, h: 2 }, { t: 'monitor', x: 9, y: 2, w: 1, h: 1 },
        { t: 'bed', x: 11, y: 2, w: 1, h: 2 }, { t: 'monitor', x: 12, y: 2, w: 1, h: 1 },
        { t: 'counter', x: 2, y: 8, w: 3, h: 1 }, { t: 'sink', x: 13, y: 9, w: 1, h: 1 },
        // med room: insulin fridge, stock shelves, prep counter
        { t: 'fridge', x: 1, y: 11, w: 2, h: 1 }, { t: 'shelf', x: 4, y: 11, w: 9, h: 1 }, { t: 'counter', x: 3, y: 13, w: 4, h: 1 },
        // diabetes education: whiteboard and teaching tables
        { t: 'whiteboard', x: 2, y: 16, w: 5, h: 1 }, { t: 'table', x: 2, y: 18, w: 3, h: 1 }, { t: 'table', x: 7, y: 18, w: 3, h: 1 },
        { t: 'plant', x: 13, y: 16, w: 1, h: 1 },
        // staff lounge: couch, coffee counter, study desk
        { t: 'sofa', x: 1, y: 22, w: 4, h: 1 }, { t: 'table', x: 2, y: 24, w: 2, h: 1 }, { t: 'counter', x: 7, y: 22, w: 3, h: 1 },
        { t: 'desk', x: 9, y: 26, w: 3, h: 1 }, { t: 'plant', x: 13, y: 27, w: 1, h: 1 },
        // L&D triage: three bays with fetal monitors
        { t: 'bed', x: 22, y: 2, w: 1, h: 2 }, { t: 'monitor', x: 23, y: 2, w: 1, h: 1 },
        { t: 'bed', x: 27, y: 2, w: 1, h: 2 }, { t: 'monitor', x: 28, y: 2, w: 1, h: 1 },
        { t: 'bed', x: 32, y: 2, w: 1, h: 2 }, { t: 'monitor', x: 33, y: 2, w: 1, h: 1 },
        { t: 'counter', x: 21, y: 8, w: 3, h: 1 },
        // endocrine clinic: exam tables and a workstation
        { t: 'exam', x: 22, y: 12, w: 2, h: 1 }, { t: 'exam', x: 29, y: 12, w: 2, h: 1 }, { t: 'sink', x: 34, y: 11, w: 1, h: 1 },
        { t: 'desk', x: 31, y: 15, w: 3, h: 1 },
        // conference room: screen and long table
        { t: 'whiteboard', x: 23, y: 18, w: 8, h: 1 }, { t: 'table', x: 22, y: 20, w: 10, h: 1 },
        // waiting area: chair rows
        { t: 'chairs', x: 21, y: 24, w: 5, h: 1 }, { t: 'chairs', x: 21, y: 26, w: 5, h: 1 },
        { t: 'chairs', x: 28, y: 24, w: 5, h: 1 }, { t: 'chairs', x: 28, y: 26, w: 5, h: 1 }, { t: 'plant', x: 34, y: 27, w: 1, h: 1 },
        // hallway: nurses' station in the middle
        { t: 'counter', x: 16, y: 14, w: 2, h: 1 }, { t: 'plant', x: 15, y: 2, w: 1, h: 1 }, { t: 'plant', x: 18, y: 2, w: 1, h: 1 }
      ],
      npcs: [
        { id: 'maya', emoji: '🛏️', name: 'Ward patient', color: '#f87171', x: 5.5, y: 4.8, act: { type: 'station' } },
        { id: 'alvarez', emoji: '🤰🏽', name: 'L&D patient', color: '#fbbf24', x: 27.5, y: 4.8, act: { type: 'station' } },
        { id: 'sam', emoji: '🧑🏾‍💼', name: 'Pharmacy Resident Sam', color: '#a3e635', x: 9.5, y: 13.2, act: { type: 'station' } },
        { id: 'ortiz', emoji: '👩🏻‍🏫', name: 'Diabetes Educator', color: '#60a5fa', x: 11.5, y: 17.6, act: { type: 'station' } },
        { id: 'noor', emoji: '👩🏿‍⚕️', name: 'Dr. Ade, Dermatology', color: '#f59e0b', x: 25.5, y: 14.6, act: { type: 'station' } },
        { id: 'okafor', emoji: '👨🏽‍🏫', name: 'Dr. Okafor, Attending', color: '#f472b6', x: 33.2, y: 20.3, act: { type: 'station' } },
        { id: 'carrel', emoji: '📚', name: 'Study Carrel', obj: true, x: 10.5, y: 25.2, act: { type: 'station' } },
        { id: 'board', emoji: '📋', name: 'Rotation Board', obj: true, x: 15.6, y: 26.4, act: { type: 'days' },
          lines: ['The full 14-day rotation schedule, briefings, and scores.'] },
        { id: 'elevator', emoji: '🛗', name: 'Elevator', obj: true, x: 17, y: 27.4, act: { type: 'elevator' },
          lines: ['Each floor holds one day of the rotation. The ED, ICU, pharmacy, and guild hall are on Floor 1.'] }
      ]
    },
    3: {
      w: 38, h: 30,
      spawn: { x: 18.5, y: 27.2 },
      arrive: { x: 18.5, y: 27.2 },
      name: 'Cardiometabolic & Sleep',
      theme: { void: '#0d1d1c', wall: '#2e5350', wallTop: '#46736e', label: 'rgba(22,62,58,.6)' },
      // A loop corridor around a central healing garden, with clinics on the outside of the ring.
      rooms: [
        { id: 'hall', name: '', x: 8, y: 8, w: 22, h: 3, color: '#e2ebe6' },
        { id: 'hallS', name: '', x: 8, y: 19, w: 22, h: 3, color: '#e2ebe6' },
        { id: 'hallW', name: '', x: 8, y: 11, w: 3, h: 8, color: '#e2ebe6' },
        { id: 'hallE', name: '', x: 27, y: 11, w: 3, h: 8, color: '#e2ebe6' },
        { id: 'sleep', name: 'Sleep Lab', x: 1, y: 1, w: 12, h: 6, color: '#d2d8ee' },
        { id: 'lipid', name: 'Lipid Clinic', x: 14, y: 1, w: 10, h: 6, color: '#fbe2d4' },
        { id: 'stepdown', name: 'Step-Down Unit 3E', x: 25, y: 1, w: 12, h: 6, color: '#dbe5f3' },
        { id: 'kitchen', name: 'Teaching Kitchen', x: 1, y: 9, w: 6, h: 12, color: '#f5ebcd' },
        { id: 'weight', name: 'Weight Management', x: 31, y: 9, w: 6, h: 12, color: '#e0eed8' },
        { id: 'garden', name: 'Healing Garden', x: 12, y: 12, w: 14, h: 6, color: '#cde7c3' },
        { id: 'bari', name: 'Bariatric Surgery Clinic', x: 1, y: 23, w: 12, h: 6, color: '#eadff1' },
        { id: 'lobby', name: 'Elevator Lobby', x: 14, y: 23, w: 10, h: 6, color: '#e4e7ee' },
        { id: 'work', name: 'Staff Workroom', x: 25, y: 23, w: 12, h: 6, color: '#eee4d6' }
      ],
      doors: [
        { x: 9, y: 7, w: 1, h: 1 }, { x: 18, y: 7, w: 2, h: 1 }, { x: 28, y: 7, w: 1, h: 1 },
        { x: 7, y: 14, w: 1, h: 2 }, { x: 30, y: 14, w: 1, h: 2 },
        { x: 18, y: 11, w: 2, h: 1 }, { x: 18, y: 18, w: 2, h: 1 },
        { x: 9, y: 22, w: 1, h: 1 }, { x: 17, y: 22, w: 4, h: 1 }, { x: 28, y: 22, w: 1, h: 1 }
      ],
      decor: [
        // sleep lab: three polysomnography bays and the tech station
        { t: 'bed', x: 2, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 3, y: 1, w: 1, h: 1 },
        { t: 'bed', x: 6, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 7, y: 1, w: 1, h: 1 },
        { t: 'bed', x: 10, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 11, y: 1, w: 1, h: 1 },
        { t: 'counter', x: 2, y: 5, w: 3, h: 1 }, { t: 'monitor', x: 5, y: 5, w: 1, h: 1 },
        // lipid clinic
        { t: 'whiteboard', x: 15, y: 1, w: 4, h: 1 }, { t: 'exam', x: 15, y: 3, w: 2, h: 1 },
        { t: 'desk', x: 20, y: 5, w: 3, h: 1 }, { t: 'sink', x: 23, y: 1, w: 1, h: 1 },
        // step-down unit
        { t: 'bed', x: 26, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 27, y: 1, w: 1, h: 1 },
        { t: 'bed', x: 30, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 31, y: 1, w: 1, h: 1 },
        { t: 'bed', x: 34, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 35, y: 1, w: 1, h: 1 },
        { t: 'counter', x: 33, y: 5, w: 3, h: 1 },
        // teaching kitchen
        { t: 'stove', x: 1, y: 9, w: 2, h: 1 }, { t: 'counter', x: 3, y: 9, w: 4, h: 1 },
        { t: 'table', x: 2, y: 13, w: 3, h: 1 }, { t: 'table', x: 2, y: 17, w: 3, h: 1 }, { t: 'fridge', x: 5, y: 11, w: 2, h: 1 },
        // weight management: treadmills, a bariatric scale, an exam table
        { t: 'treadmill', x: 31, y: 9, w: 2, h: 1 }, { t: 'treadmill', x: 34, y: 9, w: 2, h: 1 },
        { t: 'scale', x: 36, y: 12, w: 1, h: 1 }, { t: 'chairs', x: 32, y: 16, w: 3, h: 1 }, { t: 'exam', x: 33, y: 19, w: 2, h: 1 },
        // healing garden
        { t: 'fountain', x: 18, y: 14, w: 2, h: 2 },
        { t: 'plant', x: 12, y: 12, w: 1, h: 1 }, { t: 'plant', x: 25, y: 12, w: 1, h: 1 },
        { t: 'plant', x: 21, y: 12, w: 1, h: 1 }, { t: 'plant', x: 25, y: 17, w: 1, h: 1 },
        { t: 'plant', x: 15, y: 12, w: 1, h: 1 }, { t: 'plant', x: 22, y: 17, w: 1, h: 1 },
        // bariatric surgery clinic
        { t: 'exam', x: 2, y: 24, w: 2, h: 1 }, { t: 'exam', x: 6, y: 24, w: 2, h: 1 },
        { t: 'scale', x: 12, y: 23, w: 1, h: 1 }, { t: 'desk', x: 8, y: 27, w: 3, h: 1 },
        // elevator lobby
        { t: 'chairs', x: 14, y: 25, w: 3, h: 1 }, { t: 'chairs', x: 21, y: 25, w: 3, h: 1 },
        { t: 'plant', x: 14, y: 23, w: 1, h: 1 }, { t: 'plant', x: 23, y: 28, w: 1, h: 1 },
        // staff workroom
        { t: 'sofa', x: 25, y: 23, w: 3, h: 1 }, { t: 'counter', x: 31, y: 23, w: 3, h: 1 },
        { t: 'table', x: 27, y: 26, w: 3, h: 1 }, { t: 'desk', x: 33, y: 27, w: 3, h: 1 }
      ],
      npcs: [
        { id: 'maya', emoji: '🛏️', name: 'Step-down patient', color: '#f87171', x: 30.5, y: 3.8, act: { type: 'station' } },
        { id: 'alvarez', emoji: '🧑', name: 'Bariatric clinic patient', color: '#fbbf24', x: 4.5, y: 26.2, act: { type: 'station' } },
        { id: 'ortiz', emoji: '🧑🏽‍💻', name: 'Sleep Tech', color: '#60a5fa', x: 8.5, y: 4.6, act: { type: 'station' } },
        { id: 'noor', emoji: '👩🏾‍⚕️', name: 'Lipid Clinic Nurse', color: '#f59e0b', x: 17.5, y: 4.8, act: { type: 'station' } },
        { id: 'sam', emoji: '🧑🏾‍💼', name: 'Pharmacy Resident Sam', color: '#a3e635', x: 33.5, y: 13.6, act: { type: 'station' } },
        { id: 'okafor', emoji: '👨🏽‍🏫', name: 'Dr. Okafor, Attending', color: '#f472b6', x: 15.5, y: 15.5, act: { type: 'station' } },
        { id: 'carrel', emoji: '📚', name: 'Study Carrel', obj: true, x: 34.5, y: 26.3, act: { type: 'station' } },
        { id: 'chef', emoji: '🧑🏻‍🍳', name: 'Dietitian Rosa', color: '#fb923c', x: 4.5, y: 15.2, act: { type: 'talk' },
          lines: ['Welcome to the teaching kitchen. Here is the secret about diets: none of them is "best." The one that works is the one a patient can stick to.',
            'A 5–10% weight loss is a realistic goal, and it already lowers blood pressure and LDL and markedly cuts the risk of diabetes.'] },
        { id: 'board', emoji: '📋', name: 'Rotation Board', obj: true, x: 16, y: 27.6, act: { type: 'days' },
          lines: ['The full 14-day rotation schedule, briefings, and scores.'] },
        { id: 'elevator', emoji: '🛗', name: 'Elevator', obj: true, x: 18.5, y: 28.4, act: { type: 'elevator' },
          lines: ['Each floor holds one day of the rotation. The ED, ICU, pharmacy, and guild hall are on Floor 1.'] }
      ]
    },
    4: {
      w: 40, h: 30,
      spawn: { x: 20, y: 20.2 },
      arrive: { x: 20, y: 20.2 },
      name: 'Oncology, Stones & Surgery',
      theme: { void: '#1a1410', wall: '#5a4636', wallTop: '#7a614c', label: 'rgba(70,48,30,.6)' },
      // Two wings joined by a skybridge. The elevator lobby hangs off the middle of the bridge.
      rooms: [
        { id: 'hallW', name: '', x: 9, y: 1, w: 3, h: 28, color: '#ece5dc' },
        { id: 'hallE', name: '', x: 28, y: 1, w: 3, h: 28, color: '#ece5dc' },
        { id: 'bridge', name: 'Skybridge', x: 12, y: 13, w: 16, h: 3, color: '#d9e8f3' },
        { id: 'infusion', name: 'Infusion Center', x: 1, y: 1, w: 7, h: 9, color: '#f3e3ef' },
        { id: 'hemonc', name: 'Hem-Onc 5W', x: 1, y: 11, w: 7, h: 8, color: '#dfe6f2' },
        { id: 'dialysis', name: 'Dialysis', x: 1, y: 20, w: 7, h: 9, color: '#dcefee' },
        { id: 'nucmed', name: 'Nuclear Medicine', x: 13, y: 1, w: 7, h: 11, color: '#e9e6c9' },
        { id: 'surg', name: 'Endocrine Surgery', x: 21, y: 1, w: 6, h: 11, color: '#d9efe0' },
        { id: 'lobby', name: 'Elevator Lobby', x: 15, y: 17, w: 10, h: 5, color: '#e4e7ee' },
        { id: 'tumor', name: 'Tumor Board', x: 15, y: 23, w: 10, h: 6, color: '#efe3d2' },
        { id: 'stone', name: 'Stone Clinic', x: 32, y: 1, w: 7, h: 9, color: '#f6e7cf' },
        { id: 'ct', name: 'CT Reading Room', x: 32, y: 11, w: 7, h: 8, color: '#d6dbe6' },
        { id: 'lounge', name: 'Staff Lounge', x: 32, y: 20, w: 7, h: 9, color: '#ece0f0' }
      ],
      doors: [
        { x: 8, y: 4, w: 1, h: 2 }, { x: 8, y: 14, w: 1, h: 2 }, { x: 8, y: 24, w: 1, h: 2 },
        { x: 12, y: 5, w: 1, h: 2 }, { x: 27, y: 5, w: 1, h: 2 },
        { x: 18, y: 16, w: 4, h: 1 }, { x: 16, y: 22, w: 2, h: 1 },
        { x: 31, y: 4, w: 1, h: 2 }, { x: 31, y: 14, w: 1, h: 2 }, { x: 31, y: 24, w: 1, h: 2 }
      ],
      decor: [
        // infusion center: recliners with IV poles
        { t: 'recliner', x: 1, y: 1, w: 1, h: 1 }, { t: 'recliner', x: 3, y: 1, w: 1, h: 1 }, { t: 'recliner', x: 5, y: 1, w: 1, h: 1 },
        { t: 'recliner', x: 7, y: 1, w: 1, h: 1 }, { t: 'counter', x: 3, y: 7, w: 3, h: 1 },
        // hem-onc ward
        { t: 'bed', x: 2, y: 11, w: 1, h: 2 }, { t: 'monitor', x: 3, y: 11, w: 1, h: 1 },
        { t: 'bed', x: 5, y: 11, w: 1, h: 2 }, { t: 'monitor', x: 6, y: 11, w: 1, h: 1 }, { t: 'sink', x: 7, y: 16, w: 1, h: 1 },
        // dialysis
        { t: 'recliner', x: 2, y: 20, w: 1, h: 1 }, { t: 'dialysis', x: 3, y: 20, w: 1, h: 1 },
        { t: 'recliner', x: 5, y: 20, w: 1, h: 1 }, { t: 'dialysis', x: 6, y: 20, w: 1, h: 1 }, { t: 'counter', x: 5, y: 25, w: 3, h: 1 },
        // nuclear medicine: gamma camera and console
        { t: 'scanner', x: 14, y: 3, w: 3, h: 2 }, { t: 'monitor', x: 18, y: 1, w: 1, h: 1 }, { t: 'desk', x: 17, y: 8, w: 3, h: 1 },
        // endocrine surgery pre-op
        { t: 'bed', x: 22, y: 1, w: 1, h: 2 }, { t: 'bed', x: 25, y: 1, w: 1, h: 2 }, { t: 'sink', x: 26, y: 9, w: 1, h: 1 }, { t: 'counter', x: 22, y: 8, w: 3, h: 1 },
        // skybridge
        { t: 'plant', x: 12, y: 13, w: 1, h: 1 }, { t: 'plant', x: 27, y: 15, w: 1, h: 1 },
        // elevator lobby
        { t: 'chairs', x: 15, y: 18, w: 2, h: 1 }, { t: 'chairs', x: 23, y: 18, w: 2, h: 1 }, { t: 'plant', x: 24, y: 21, w: 1, h: 1 },
        // tumor board
        { t: 'whiteboard', x: 17, y: 23, w: 6, h: 1 }, { t: 'table', x: 16, y: 25, w: 7, h: 1 },
        // stone clinic
        { t: 'exam', x: 33, y: 2, w: 2, h: 1 }, { t: 'sink', x: 38, y: 1, w: 1, h: 1 }, { t: 'desk', x: 36, y: 7, w: 3, h: 1 },
        // CT reading room
        { t: 'scanner', x: 34, y: 12, w: 3, h: 2 }, { t: 'desk', x: 36, y: 16, w: 3, h: 1 }, { t: 'monitor', x: 38, y: 11, w: 1, h: 1 },
        // staff lounge
        { t: 'sofa', x: 32, y: 20, w: 3, h: 1 }, { t: 'counter', x: 36, y: 20, w: 3, h: 1 }, { t: 'table', x: 33, y: 24, w: 2, h: 1 },
        { t: 'desk', x: 36, y: 27, w: 3, h: 1 }
      ],
      npcs: [
        { id: 'maya', emoji: '🛏️', name: 'Hem-Onc patient', color: '#f87171', x: 4, y: 14.4, act: { type: 'station' } },
        { id: 'alvarez', emoji: '🧑', name: 'Stone Clinic patient', color: '#fbbf24', x: 34, y: 4.6, act: { type: 'station' } },
        { id: 'sam', emoji: '🧑🏾‍💼', name: 'Pharmacy Resident Sam', color: '#a3e635', x: 4.5, y: 4.6, act: { type: 'station' } },
        { id: 'noor', emoji: '👩🏾‍⚕️', name: 'Nephrology Fellow', color: '#f59e0b', x: 4, y: 23.4, act: { type: 'station' } },
        { id: 'ortiz', emoji: '🧑🏽‍💻', name: 'Radiology Resident', color: '#60a5fa', x: 34.5, y: 16.4, act: { type: 'station' } },
        { id: 'okafor', emoji: '👨🏽‍🏫', name: 'Dr. Okafor, Attending', color: '#f472b6', x: 23.5, y: 27.2, act: { type: 'station' } },
        { id: 'carrel', emoji: '📚', name: 'Study Carrel', obj: true, x: 37.5, y: 26.3, act: { type: 'station' } },
        { id: 'surgeon', emoji: '👩🏻‍⚕️', name: 'Dr. Haddad, Endocrine Surgery', color: '#34d399', x: 23.5, y: 5.5, act: { type: 'talk' },
          lines: ['About 85% of patients with primary hyperparathyroidism have a single adenoma. About 10% have four-gland hyperplasia, and fewer than 1% have cancer.',
            'In the OR we check PTH before and 10 minutes after removing the gland. A drop of 50% or more means we got it. And pick a surgeon who does at least 50 of these a year.'] },
        { id: 'nuctech', emoji: '🧑🏼‍🔬', name: 'Tech Ren, Nuclear Medicine', color: '#c084fc', x: 15.5, y: 7.5, act: { type: 'talk' },
          lines: ['Sestamibi lights up most single adenomas but often misses hyperplasia. Ultrasound or 4D-CT adds to it.',
            'Remember: these scans find the gland for the surgeon. They never make the diagnosis. The calcium and PTH do that.'] },
        { id: 'board', emoji: '📋', name: 'Rotation Board', obj: true, x: 17, y: 20.6, act: { type: 'days' },
          lines: ['The full 14-day rotation schedule, briefings, and scores.'] },
        { id: 'elevator', emoji: '🛗', name: 'Elevator', obj: true, x: 20, y: 21.4, act: { type: 'elevator' },
          lines: ['Each floor holds one day of the rotation. The ED, ICU, pharmacy, and guild hall are on Floor 1.'] }
      ]
    },
    5: {
      w: 40, h: 30,
      spawn: { x: 20, y: 27.2 },
      arrive: { x: 20, y: 27.2 },
      name: 'Bone & Mineral Center',
      theme: { void: '#16171c', wall: '#4a4f5a', wallTop: '#676e7c', label: 'rgba(52,58,70,.6)' },
      // A plus sign: four corridors meet at a central rotunda, with a room in each corner.
      rooms: [
        { id: 'hallN', name: '', x: 18, y: 1, w: 4, h: 11, color: '#e6e7ea' },
        { id: 'hallS', name: '', x: 18, y: 18, w: 4, h: 11, color: '#e6e7ea' },
        { id: 'hallW', name: '', x: 1, y: 13, w: 15, h: 4, color: '#e6e7ea' },
        { id: 'hallE', name: '', x: 24, y: 13, w: 15, h: 4, color: '#e6e7ea' },
        { id: 'rotunda', name: 'Rotunda', x: 16, y: 12, w: 8, h: 6, color: '#f1ead9' },
        { id: 'dxa', name: 'DXA Suite', x: 1, y: 1, w: 8, h: 11, color: '#dbe3f0' },
        { id: 'fls', name: 'Fracture Liaison', x: 10, y: 1, w: 6, h: 11, color: '#f3e1d6' },
        { id: 'ortho', name: 'Ortho Ward 6E', x: 24, y: 1, w: 8, h: 11, color: '#dde9e1' },
        { id: 'shortstay', name: 'Surgical Short-Stay', x: 33, y: 1, w: 6, h: 11, color: '#e9e1f1' },
        { id: 'lab', name: 'Bone Lab', x: 1, y: 18, w: 7, h: 11, color: '#e3eedf' },
        { id: 'msk', name: 'MSK Radiology', x: 9, y: 18, w: 7, h: 11, color: '#d8dce6' },
        { id: 'gym', name: 'PT Gym', x: 24, y: 18, w: 8, h: 11, color: '#f4ecd2' },
        { id: 'lounge', name: 'Staff Lounge', x: 33, y: 18, w: 6, h: 11, color: '#ece0ea' }
      ],
      doors: [
        { x: 4, y: 12, w: 2, h: 1 }, { x: 16, y: 5, w: 2, h: 1 }, { x: 22, y: 5, w: 2, h: 1 }, { x: 35, y: 12, w: 2, h: 1 },
        { x: 4, y: 17, w: 2, h: 1 }, { x: 16, y: 23, w: 2, h: 1 }, { x: 22, y: 23, w: 2, h: 1 }, { x: 35, y: 17, w: 2, h: 1 }
      ],
      decor: [
        // DXA suite
        { t: 'dxa', x: 2, y: 2, w: 4, h: 1 }, { t: 'desk', x: 2, y: 8, w: 3, h: 1 }, { t: 'monitor', x: 6, y: 8, w: 1, h: 1 },
        // fracture liaison clinic
        { t: 'desk', x: 11, y: 2, w: 3, h: 1 }, { t: 'chairs', x: 11, y: 7, w: 3, h: 1 }, { t: 'plant', x: 15, y: 1, w: 1, h: 1 },
        // ortho ward
        { t: 'bed', x: 25, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 26, y: 1, w: 1, h: 1 },
        { t: 'bed', x: 29, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 30, y: 1, w: 1, h: 1 }, { t: 'counter', x: 28, y: 9, w: 3, h: 1 },
        // surgical short-stay
        { t: 'bed', x: 34, y: 1, w: 1, h: 2 }, { t: 'monitor', x: 35, y: 1, w: 1, h: 1 }, { t: 'sink', x: 38, y: 7, w: 1, h: 1 },
        // rotunda centerpiece
        { t: 'skeleton', x: 19, y: 14, w: 2, h: 2 }, { t: 'plant', x: 16, y: 12, w: 1, h: 1 }, { t: 'plant', x: 23, y: 12, w: 1, h: 1 }, { t: 'plant', x: 23, y: 17, w: 1, h: 1 },
        // bone lab
        { t: 'bench', x: 2, y: 19, w: 3, h: 1 }, { t: 'bench', x: 2, y: 23, w: 3, h: 1 }, { t: 'fridge', x: 6, y: 19, w: 2, h: 1 },
        // MSK radiology
        { t: 'whiteboard', x: 10, y: 18, w: 5, h: 1 }, { t: 'table', x: 10, y: 21, w: 4, h: 1 }, { t: 'monitor', x: 15, y: 25, w: 1, h: 1 },
        // PT gym
        { t: 'treadmill', x: 25, y: 18, w: 2, h: 1 }, { t: 'treadmill', x: 28, y: 18, w: 2, h: 1 },
        { t: 'bars', x: 26, y: 22, w: 4, h: 1 }, { t: 'mat', x: 26, y: 25, w: 4, h: 3, solid: false },
        // staff lounge
        { t: 'sofa', x: 33, y: 18, w: 3, h: 1 }, { t: 'counter', x: 37, y: 18, w: 2, h: 1 }, { t: 'table', x: 34, y: 22, w: 2, h: 1 },
        { t: 'desk', x: 35, y: 27, w: 3, h: 1 }
      ],
      npcs: [
        { id: 'maya', emoji: '🛏️', name: 'Ortho patient', color: '#f87171', x: 27, y: 4.4, act: { type: 'station' } },
        { id: 'alvarez', emoji: '🧑', name: 'Short-stay patient', color: '#fbbf24', x: 36, y: 4.4, act: { type: 'station' } },
        { id: 'sam', emoji: '🧑🏾‍💼', name: 'Pharmacy Resident Sam', color: '#a3e635', x: 12.5, y: 4.6, act: { type: 'station' } },
        { id: 'ortiz', emoji: '🧑🏽‍💻', name: 'DXA Technologist', color: '#60a5fa', x: 4.5, y: 5.4, act: { type: 'station' } },
        { id: 'noor', emoji: '👩🏾‍⚕️', name: 'MSK Radiologist', color: '#f59e0b', x: 12, y: 23.6, act: { type: 'station' } },
        { id: 'okafor', emoji: '👨🏽‍🏫', name: 'Dr. Okafor, Attending', color: '#f472b6', x: 17.5, y: 14.6, act: { type: 'station' } },
        { id: 'carrel', emoji: '📚', name: 'Study Carrel', obj: true, x: 36.5, y: 26.3, act: { type: 'station' } },
        { id: 'pt', emoji: '🧑🏻‍🦯', name: 'PT Coach Lena', color: '#34d399', x: 29, y: 20.6, act: { type: 'talk' },
          lines: ['Most hip fractures start with a fall. Sedatives, poor vision, cognitive impairment, weak legs, and clutter at home are the big risk factors.',
            'So we stop what we can, fix the vision, add a walker when it helps, and make the house fall-proof: lights, handrails, nonslip bathroom floors, and no loose rugs.'] },
        { id: 'labtech', emoji: '🧑🏼‍🔬', name: 'Bone Lab Tech Arjun', color: '#c084fc', x: 4.5, y: 26, act: { type: 'talk' },
          lines: ['25-OH vitamin D is the test for vitamin D stores. 1,25-dihydroxy D stays normal until very late because PTH keeps the kidney making it.',
            'And when alkaline phosphatase is high, check liver tests too. If the GGT is normal, the alk phos is probably coming from bone.'] },
        { id: 'board', emoji: '📋', name: 'Rotation Board', obj: true, x: 18.6, y: 27.6, act: { type: 'days' },
          lines: ['The full 14-day rotation schedule, briefings, and scores.'] },
        { id: 'elevator', emoji: '🛗', name: 'Elevator', obj: true, x: 20, y: 28.4, act: { type: 'elevator' },
          lines: ['Each floor holds one day of the rotation. The ED, ICU, pharmacy, and guild hall are on Floor 1.'] }
      ]
    }
  },

  world: {
    w: 40, h: 28,
    spawn: { x: 15.5, y: 21.5 },
    arrive: { x: 37, y: 14.5 },
    name: 'Emergency & ICU',
    theme: { void: '#0e1830', wall: '#2f4166', wallTop: '#425887', label: 'rgba(30,41,59,.55)' },
    rooms: [
      { id: 'hall', name: '', x: 1, y: 13, w: 38, h: 3, color: '#d3dae6' },
      { id: 'ed', name: 'Emergency Dept', x: 1, y: 2, w: 9, h: 10, color: '#f6d9d9' },
      { id: 'icu', name: 'ICU', x: 11, y: 2, w: 8, h: 10, color: '#d6e7f5' },
      { id: 'pharm', name: 'Pharmacy', x: 20, y: 2, w: 9, h: 10, color: '#d7f0e1' },
      { id: 'lab', name: 'Crafting Lab', x: 30, y: 2, w: 9, h: 10, color: '#e4ddf6' },
      { id: 'lib', name: 'Library', x: 1, y: 17, w: 9, h: 10, color: '#f4e8d2' },
      { id: 'lobby', name: 'Lobby', x: 11, y: 17, w: 10, h: 10, color: '#e7ebf3' },
      { id: 'guild', name: 'Guild Hall', x: 22, y: 17, w: 8, h: 10, color: '#f5e4cb' },
      { id: 'arena', name: 'Duel Arena', x: 31, y: 17, w: 8, h: 10, color: '#f3d6d6' }
    ],
    doors: [
      { x: 4, y: 12, w: 2, h: 1 }, { x: 14, y: 12, w: 2, h: 1 }, { x: 24, y: 12, w: 1, h: 1 }, { x: 34, y: 12, w: 1, h: 1 },
      { x: 5, y: 16, w: 1, h: 1 }, { x: 15, y: 16, w: 2, h: 1 }, { x: 25, y: 16, w: 1, h: 1 }, { x: 34, y: 16, w: 1, h: 1 }
    ],
    decor: [
      { t: 'bed', x: 2, y: 3, w: 1, h: 2 }, { t: 'bed', x: 5, y: 3, w: 1, h: 2 }, { t: 'bed', x: 8, y: 3, w: 1, h: 2 },
      { t: 'counter', x: 6, y: 8, w: 3, h: 1 },
      { t: 'bed', x: 12, y: 3, w: 1, h: 2 }, { t: 'monitor', x: 13, y: 3, w: 1, h: 1 }, { t: 'bed', x: 16, y: 3, w: 1, h: 2 }, { t: 'monitor', x: 17, y: 3, w: 1, h: 1 },
      { t: 'shelf', x: 20, y: 2, w: 9, h: 1 }, { t: 'counter', x: 21, y: 5, w: 7, h: 1 },
      { t: 'bench', x: 31, y: 4, w: 3, h: 1 }, { t: 'bench', x: 35, y: 4, w: 3, h: 1 }, { t: 'bench', x: 31, y: 9, w: 3, h: 1 },
      { t: 'shelf', x: 1, y: 17, w: 4, h: 1 }, { t: 'shelf', x: 6, y: 17, w: 4, h: 1 }, { t: 'table', x: 2, y: 22, w: 2, h: 1 }, { t: 'table', x: 6, y: 22, w: 2, h: 1 }, { t: 'desk', x: 7, y: 25, w: 2, h: 1 },
      { t: 'plant', x: 11, y: 17, w: 1, h: 1 }, { t: 'plant', x: 20, y: 17, w: 1, h: 1 }, { t: 'plant', x: 11, y: 26, w: 1, h: 1 }, { t: 'plant', x: 20, y: 26, w: 1, h: 1 },
      { t: 'desk', x: 14, y: 24, w: 4, h: 1 },
      { t: 'banner', x: 23, y: 17, w: 1, h: 1 }, { t: 'banner', x: 28, y: 17, w: 1, h: 1 }, { t: 'table', x: 24, y: 23, w: 4, h: 1 },
      { t: 'mat', x: 32, y: 19, w: 6, h: 6, solid: false }
    ],
    npcs: [
      { id: 'maya', emoji: '🤢', name: 'Maya, 22', color: '#f87171', x: 2.5, y: 4.2, act: { type: 'station', day: 1, station: 'dka' },
        lines: ['Doc… I can\'t stop throwing up. I stopped my insulin because I wasn\'t eating.', 'My breathing feels… deep. Is that bad?'] },
      { id: 'ortiz', emoji: '👩🏽‍⚕️', name: 'Charge Nurse Ortiz', color: '#60a5fa', x: 7.5, y: 9.6, act: { type: 'station', day: 1, station: 'pager' },
        lines: ['Your pager\'s been going off nonstop. Five floor calls are waiting. Ready?'] },
      { id: 'alvarez', emoji: '👴', name: 'Mr. Alvarez, 81', color: '#fbbf24', x: 12.5, y: 4.2, act: { type: 'station', day: 1, station: 'hhs' },
        lines: ['…where am I? …', '(His daughter whispers: "He\'s barely been drinking all week.")'] },
      { id: 'lee', emoji: '👨🏻‍⚕️', name: 'PharmD Lee', color: '#34d399', x: 24.5, y: 4.4, act: { type: 'shop' },
        lines: ['Welcome to the pharmacy. Coffee, snacks, gear. Coins only, no insurance.'] },
      { id: 'sam', emoji: '🧑🏾‍💼', name: 'Pharmacy Resident Sam', color: '#a3e635', x: 22.5, y: 9.5, act: { type: 'station', day: 1, station: 'medrec' },
        lines: ['I\'ve got ten med rec items that need matching before the morning. Help me out?'] },
      { id: 'priya', emoji: '🧑🏼‍🔬', name: 'Lab Tech Priya', color: '#c084fc', x: 34.5, y: 6.6, act: { type: 'lab' },
        lines: ['Bring me samples, pearl fragments, and attending notes. I can craft you something useful.'] },
      { id: 'noor', emoji: '🧕🏽', name: 'Librarian Noor', color: '#f59e0b', x: 3.5, y: 19.6, act: { type: 'station', day: 1, station: 'hyposort' },
        lines: ['Quick: can you tell adrenergic from neuroglycopenic? Ten cards, no peeking.'] },
      { id: 'carrel', emoji: '📚', name: 'Study Carrel', obj: true, x: 8, y: 24.4, act: { type: 'station', day: 1, station: 'pearls' },
        lines: ['A quiet corner for the rapid-fire synthesis round.'] },
      { id: 'okafor', emoji: '👨🏽‍🏫', name: 'Dr. Okafor, Attending', color: '#f472b6', x: 18.5, y: 19.6, act: { type: 'station', day: 1, station: 'boss' },
        lines: ['Ah, the night float resident. Let\'s see what you actually learned.'] },
      { id: 'jordan', emoji: '🧑🏻‍⚕️', name: 'Chief Resident Jordan', color: '#2dd4bf', x: 12.5, y: 19.6, act: { type: 'tutorial' },
        lines: [
          'Welcome to the hospital! Walk with the joystick (or tap where you want to go). Arrow keys and WASD work too.',
          'Anyone with a ❗ above them has a case for you. Clear cases to earn XP, coins, and crafting materials.',
          'Level up to earn skill points. Spend them and equip gear in your 🎒 bag.',
          'Pharmacy sells gear, the Crafting Lab makes better gear, and the elevator leads to future rotation floors.',
          'Sign in at the Badge Office to play online: guilds and raids in the Guild Hall, duels in the Arena, and trading at the Trading Post. Good luck tonight.'
        ] },
      { id: 'board', emoji: '📋', name: 'Rotation Board', obj: true, x: 19.5, y: 25.3, act: { type: 'days' },
        lines: ['The full 14-day rotation schedule, briefings, and scores.'] },
      { id: 'registrar', emoji: '🛡️', name: 'Guild Registrar', obj: true, x: 25.5, y: 21.5, act: { type: 'guild' },
        lines: ['Form a guild with your co-interns, chat, and take down the weekly raid boss together.'] },
      { id: 'raidboss', emoji: '👾', name: 'Weekly Raid Boss', obj: true, x: 26, y: 25.2, act: { type: 'raid' },
        lines: ['A new endocrine emergency every week. Your whole guild chips away at it, and everyone who fought shares the loot.'] },
      { id: 'referee', emoji: '⚔️', name: 'Duel Referee', obj: true, x: 34.5, y: 21.5, act: { type: 'duel' },
        lines: ['Challenge another resident to a five-question case duel. Same questions, same clock. Best score wins.'] },
      { id: 'broker', emoji: '🤝', name: 'Trading Post', obj: true, x: 29.5, y: 13.6, act: { type: 'market' },
        lines: ['Sell spare materials, consumables, and gear to other residents, or buy what you need.'] },
      { id: 'trophy', emoji: '🏆', name: 'Hiscore Board', obj: true, x: 19.5, y: 22.5, act: { type: 'hiscores' },
        lines: ['Top residents by XP, duel wins, and raid damage, plus the guild standings.'] },
      { id: 'badgeoffice', emoji: '🪪', name: 'Badge Office', obj: true, x: 13, y: 25.3, act: { type: 'account' },
        lines: ['Sign in to sync your progress across devices and play with your intern class.'] },
      { id: 'elevator', emoji: '🛗', name: 'Elevator', obj: true, x: 38.2, y: 14.5, act: { type: 'elevator' },
        lines: ['Each floor holds one day of the rotation.'] }
    ]
  }
};
