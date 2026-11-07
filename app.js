(() => {
  'use strict';

  const DAYS = window.ENDO_DAYS;
  const CONTENT = window.ENDO_CONTENT || {};
  const STORE = 'endoRotation3d.v1';
  const RRT_PENALTY = 15;

  const app = document.getElementById('app');
  const hdr = document.getElementById('hdr');
  const modal = document.getElementById('modal');

  // ---------- state ----------
  const fresh = () => ({ xp: 0, days: {}, bonusDay: null, unlockAll: false, hideInstall: false, profile: null, lastSaved: null, rpg: null, resume: {} });
  const AVATARS = ['🧑‍⚕️', '👩🏽‍⚕️', '👨🏿‍⚕️', '👩🏻‍⚕️', '👨🏾‍⚕️', '🩺', '🧠', '🦋', '🩸', '💉', '🦴', '🧬', '🫀', '🔬', '🦉', '🐙'];
  const APP_ID = 'endo-rotation';
  const cleanName = (s) => String(s || '').replace(/\s+/g, ' ').trim().replace(/^dr(\.\s*|\s+)/i, '').slice(0, 20).trim();
  const validProfile = (p) => !!p && typeof p === 'object' && typeof p.name === 'string' && cleanName(p.name).length > 0
    && typeof p.avatar === 'string' && p.avatar.length > 0 && p.avatar.length <= 16;
  const drName = (p) => `Dr. ${p.name}`;

  let saveOk = (() => {
    try { localStorage.setItem(STORE + '.probe', '1'); localStorage.removeItem(STORE + '.probe'); return true; } catch (e) { return false; }
  })();
  let warnedSave = false;
  let state = load();
  let NET = null;

  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(STORE));
      if (!s || typeof s !== 'object') return fresh();
      if (s.profile && !validProfile(s.profile)) s.profile = null;
      return Object.assign(fresh(), s);
    } catch (e) {
      return fresh();
    }
  }
  function save() {
    state.lastSaved = Date.now();
    try {
      localStorage.setItem(STORE, JSON.stringify(state));
      saveOk = true;
    } catch (e) {
      saveOk = false;
    }
    flashSave();
    if (!saveOk && !warnedSave) { warnedSave = true; setTimeout(warnSaveFail, 0); }
    if (NET) NET.onSaved();
  }
  function warnSaveFail() {
    if (!modal.classList.contains('hidden')) return setTimeout(warnSaveFail, 800);
    showModal(`<div class="big-emoji">⚠️</div><h2>Progress can't be saved</h2>
      <p>This browser is blocking storage (private browsing or full storage). You can keep playing, but progress will be lost when this tab closes.</p>
      <p class="muted">Use <b>Settings → Export progress</b> to keep a backup.</p>`, [{ label: 'Got it', cls: 'btn primary' }]);
  }

  // ---------- save indicator ----------
  const PILL = {
    saving: '<span class="sp-ic">☁️</span><span class="sp-t">Saving…</span>',
    saved: '<span class="sp-t">Saved</span><span class="sp-ic">✓</span>',
    rest: '<span class="sp-ic">✓</span>',
    err: '<span class="sp-ic">⚠️</span><span class="sp-t">Not saved</span>'
  };
  let pillState = saveOk ? 'rest' : 'err';
  let pillTimer = null;
  function ago(ts) {
    if (!ts) return 'not yet';
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 10) return 'just now';
    if (s < 60) return `${s}s ago`;
    const m = Math.round(s / 60);
    if (m < 60) return `${m} min ago`;
    const h = Math.round(m / 60);
    if (h < 24) return `${h} h ago`;
    return new Date(ts).toLocaleDateString();
  }
  const pillTitle = () => (saveOk ? `Auto-saved on this device · ${ago(state.lastSaved)}` : 'Not saved: storage is blocked in this browser');
  const pillHtml = () => `<button id="savePill" class="save-pill ${pillState}" role="status" aria-label="${pillTitle()}" title="${pillTitle()}">${PILL[pillState]}</button>`;
  function setPill(s) {
    pillState = s;
    const p = document.getElementById('savePill');
    if (p) { p.className = `save-pill ${s}`; p.innerHTML = PILL[s]; p.title = pillTitle(); p.setAttribute('aria-label', pillTitle()); }
  }
  function flashSave() {
    clearTimeout(pillTimer);
    refreshSaveInfo();
    if (!saveOk) return setPill('err');
    setPill('saving');
    pillTimer = setTimeout(() => { setPill('saved'); pillTimer = setTimeout(() => setPill('rest'), 1600); }, 350);
  }
  const saveNoteText = () => (saveOk
    ? `💾 Progress auto-saves on this device · Last saved ${ago(state.lastSaved)}`
    : '⚠️ Storage is blocked in this browser, so progress is <b>not being saved</b>. Export a backup in Settings.');
  const saveNote = () => `<p class="save-note ${saveOk ? '' : 'err'}" data-save-note>${saveNoteText()}</p>`;
  function refreshSaveInfo() {
    document.querySelectorAll('[data-save-note]').forEach((n) => { n.innerHTML = saveNoteText(); n.classList.toggle('err', !saveOk); });
    const p = document.getElementById('savePill');
    if (p) p.title = pillTitle();
  }
  setInterval(refreshSaveInfo, 30000);
  function dayState(id) {
    if (!state.days[id]) state.days[id] = { stations: {}, completed: false };
    return state.days[id];
  }

  // ---------- helpers ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  const buzz = (ms) => { if (navigator.vibrate) navigator.vibrate(ms); };
  const dayMeta = (id) => DAYS.find((d) => d.id === id);

  function toast(msg, kind = '') {
    const t = el(`<div class="toast ${kind}">${msg}</div>`);
    document.getElementById('toasts').appendChild(t);
    setTimeout(() => t.classList.add('out'), 1600);
    setTimeout(() => t.remove(), 2100);
  }

  const modalQueue = [];
  function showModal(html, buttons) {
    if (!modal.classList.contains('hidden')) { modalQueue.push([html, buttons]); return; }
    modal.innerHTML = `<div class="modal-card">${html}<div class="modal-actions"></div></div>`;
    const actions = modal.querySelector('.modal-actions');
    buttons.forEach(({ label, cls = 'btn', onClick }) => {
      const b = el(`<button class="${cls}">${label}</button>`);
      b.onclick = () => {
        modal.classList.add('hidden');
        if (onClick) onClick();
        const next = modalQueue.shift();
        if (next && modal.classList.contains('hidden')) showModal(...next);
      };
      actions.appendChild(b);
    });
    modal.classList.remove('hidden');
  }

  // Popups that could navigate away wait until the current station is finished or left.
  let inStation = false;
  let updateReady = false;
  const held = [];
  function celebrate(html, buttons) {
    if (inStation) held.push([html, buttons]);
    else setTimeout(() => showModal(html, buttons), 300);
  }
  function leaveStation() {
    inStation = false;
    held.splice(0).forEach(([html, buttons]) => setTimeout(() => showModal(html, buttons), 300));
  }

  function award(dayId, n, practice, xpPct = 0) {
    if (practice || n <= 0) return 0;
    const streak = state.bonusDay === dayId;
    const amt = Math.round(n * (streak ? 1.1 : 1) * (1 + xpPct));
    const before = state.xp;
    state.xp += amt;
    const coins = RPG.afterXP(amt, before);
    save();
    toast(`+${amt} XP${streak ? ' 🔥' : ''} · +${coins} 🪙`, 'good');
    renderHeader();
    return amt;
  }

  function penalize(n, practice) {
    if (practice) return;
    state.xp = Math.max(0, state.xp - n);
    save();
    renderHeader();
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    const ta = el('<textarea style="position:fixed;opacity:0"></textarea>');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    ta.remove();
    return Promise.resolve();
  }

  function download(name, text, type) {
    const a = el(`<a download="${esc(name)}"></a>`);
    a.href = URL.createObjectURL(new Blob([text], { type }));
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }

  // ---------- backup / transfer ----------
  const toB64 = (str) => { let b = ''; new TextEncoder().encode(str).forEach((c) => { b += String.fromCharCode(c); }); return btoa(b); };
  const fromB64 = (b64) => new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  const exportJSON = () => JSON.stringify({ app: APP_ID, v: 1, exportedAt: Date.now(), state });
  const exportCode = () => toB64(exportJSON());
  function exportFileName() {
    const slug = (state.profile ? state.profile.name : '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'player';
    const d = new Date();
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return `endo-rotation-${slug}-${date}.json`;
  }

  function parseSave(text) {
    text = String(text || '').trim();
    if (!text) throw new Error('Nothing to import.');
    let data;
    try { data = JSON.parse(text); } catch (e) {
      try { data = JSON.parse(fromB64(text.replace(/\s+/g, ''))); } catch (e2) { throw new Error("That doesn't look like an Endo Rotation save."); }
    }
    const s = data && data.app === APP_ID ? data.state : data;
    const bad = (what) => { throw new Error(`Invalid save file (${what}).`); };
    const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
    const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
    if (!isObj(s)) bad('no data');
    if (!isNum(s.xp) || s.xp < 0) bad('XP');
    if (!isObj(s.days)) bad('days');
    Object.entries(s.days).forEach(([k, d]) => {
      if (!/^\d+$/.test(k) || !isObj(d) || !isObj(d.stations)) bad(`day ${k}`);
      Object.values(d.stations).forEach((st) => { if (!isObj(st) || !isNum(st.score || 0) || !isNum(st.max || 0)) bad(`day ${k} station`); });
    });
    if (s.profile != null && !validProfile(s.profile)) bad('profile');
    if (s.bonusDay != null && !isNum(s.bonusDay)) bad('streak');
    if (s.rpg != null && !isObj(s.rpg)) bad('character');
    const out = fresh();
    Object.keys(out).forEach((k) => { if (k in s) out[k] = s[k]; });
    out.unlockAll = !!out.unlockAll;
    out.hideInstall = !!out.hideInstall;
    if (out.profile) out.profile = { name: cleanName(out.profile.name), avatar: out.profile.avatar, createdAt: isNum(out.profile.createdAt) ? out.profile.createdAt : Date.now() };
    if (!isNum(out.lastSaved)) out.lastSaved = null;
    if (!isObj(out.resume)) out.resume = {};
    return RPG.ensure(out);
  }

  const saveSummary = (s) => {
    const n = DAYS.filter((d) => s.days[d.id]?.completed).length;
    return `${s.profile ? `${esc(s.profile.avatar)} ${esc(drName(s.profile))}` : 'No profile'} · ${s.xp} XP · ${n} day${n === 1 ? '' : 's'} complete`;
  };
  function applyImport(next) {
    state = next;
    save();
    toast('Progress imported ✓', 'good');
    route();
  }
  function confirmImport(text) {
    let next;
    try { next = parseSave(text); } catch (e) { return toast(esc(e.message), 'bad'); }
    showModal(`<div class="big-emoji">📥</div><h2>Replace progress?</h2>
      <p class="debrief"><b>Import:</b> ${saveSummary(next)}<br><b>Current:</b> ${saveSummary(state)}</p>
      <p class="muted">Your current progress on this device will be overwritten.</p>`, [
      { label: 'Cancel', cls: 'btn ghost' },
      { label: 'Replace', cls: 'btn primary', onClick: () => applyImport(next) }
    ]);
  }

  const importWidget = () => `
    <div class="import">
      <button class="btn" type="button" data-act="import-file">📂 Import file…</button>
      <input type="file" accept=".json,application/json" hidden>
      <textarea rows="3" placeholder="…or paste a save code here" aria-label="Save code" spellcheck="false"></textarea>
      <button class="btn" type="button" data-act="import-code">Import code</button>
    </div>`;
  function wireImport(root) {
    const file = root.querySelector('.import input[type=file]');
    root.querySelector('[data-act="import-file"]').onclick = () => file.click();
    file.onchange = async () => {
      const f = file.files[0];
      file.value = '';
      if (f) confirmImport(await f.text());
    };
    root.querySelector('[data-act="import-code"]').onclick = () => confirmImport(root.querySelector('.import textarea').value);
  }

  window.EndoRotation = { exportJSON, exportCode, parseSave };

  // ---------- profile ----------
  function profileForm(p, cta) {
    const av = p ? p.avatar : AVATARS[0];
    return `<form class="profile-form" novalidate>
      <div class="pf-preview">
        <span class="pf-av">${esc(av)}</span>
        <div><div class="pf-name">${esc(p ? drName(p) : 'Dr. ___')}</div><div class="muted pf-rank">Lv ${RPG.levelFor(state.xp)} ${esc(RPG.titleFor(RPG.levelFor(state.xp)))} · ${state.xp} XP</div></div>
      </div>
      <label class="pf-label" for="pfName">Your call-sign</label>
      <div class="name-field"><span>Dr.</span><input id="pfName" maxlength="24" autocomplete="nickname" autocapitalize="words" spellcheck="false" enterkeyhint="done" placeholder="Your name" value="${esc(p ? p.name : '')}"></div>
      <div class="pf-err" aria-live="polite"></div>
      <div class="pf-label">Pick an avatar</div>
      <div class="avatar-grid" role="radiogroup" aria-label="Avatar">${AVATARS.map((a) => `<button type="button" class="av ${a === av ? 'sel' : ''}" role="radio" aria-checked="${a === av}" data-av="${esc(a)}">${a}</button>`).join('')}</div>
      <button class="btn primary big" type="submit">${cta}</button>
    </form>`;
  }
  function wireProfileForm(form, onSave) {
    let avatar = form.querySelector('.pf-av').textContent;
    const input = form.querySelector('input');
    const err = form.querySelector('.pf-err');
    const nameEl = form.querySelector('.pf-name');
    input.oninput = () => {
      err.textContent = '';
      const n = cleanName(input.value);
      nameEl.textContent = n ? `Dr. ${n}` : 'Dr. ___';
    };
    form.querySelectorAll('.av').forEach((b) => {
      b.onclick = () => {
        avatar = b.dataset.av;
        form.querySelectorAll('.av').forEach((x) => { x.classList.toggle('sel', x === b); x.setAttribute('aria-checked', x === b); });
        form.querySelector('.pf-av').textContent = avatar;
        buzz(10);
      };
    });
    form.onsubmit = (e) => {
      e.preventDefault();
      const name = cleanName(input.value);
      if (!name) { err.textContent = 'Enter a name (1–20 characters).'; input.focus(); return; }
      onSave({ name, avatar });
    };
  }

  // ---------- unlock logic ----------
  const hasContent = (id) => !!CONTENT[id];
  function isUnlocked(id) {
    if (!hasContent(id)) return false;
    if (id === 1 || state.unlockAll) return true;
    const prev = state.days[id - 1];
    if (!prev) return false;
    return prev.completed || (hasContent(id - 1) && CONTENT[id - 1].stations.every((s) => prev.stations[s.id]?.done));
  }
  const coreStations = (id) => CONTENT[id].stations.filter((s) => s.type !== 'pearls');
  const coreDone = (id) => coreStations(id).every((s) => dayState(id).stations[s.id]?.done);

  const RPG = window.EndoRPG.init({
    getState: () => state, save, toast, showModal, celebrate, go, el, esc, buzz, renderHeader,
    app, hdr, DAYS, CONTENT, dayState, isUnlocked, coreDone, hasContent, net: () => NET
  });
  RPG.ensure(state);
  if (window.EndoNet) {
    NET = window.EndoNet.init({
      getState: () => state, save, toast, showModal, go, el, esc, buzz, renderHeader, app, RPG, CONTENT,
      parseSave, saveSummary: (s) => saveSummary(s),
      replaceState: (next) => { state = next; save(); renderHeader(); route(); }
    });
  }

  // ---------- header ----------
  function renderHeader() {
    const lv = RPG.levelInfo(state.xp);
    const p = state.profile;
    if (!p) {
      hdr.innerHTML = '<a href="#/" class="brand" aria-label="Home"><span class="logo">⚕️</span><span>Endo Rotation</span></a>';
      return;
    }
    hdr.innerHTML = `
      <a href="#/" class="brand has-me" aria-label="Home"><span class="logo">⚕️</span><span class="brand-t">Endo Rotation</span></a>
      <a href="#/character" class="me" aria-label="Character: ${esc(drName(p))}" title="${esc(drName(p))}"><span class="me-av">${esc(p.avatar)}</span><span class="me-name">${esc(drName(p))}</span></a>
      <div class="rank">
        <div class="rank-line"><b>Lv ${lv.level} · ${lv.title}</b><span>${lv.into} / ${lv.need} XP</span></div>
        <div class="bar"><div style="width:${lv.pct}%"></div></div>
      </div>
      ${pillHtml()}
      <nav><a href="#/badges" aria-label="Badges">🏅</a><a href="#/settings" aria-label="Settings">⚙️</a></nav>`;
    hdr.querySelector('#savePill').onclick = () => toast(saveOk ? `Saved on this device · ${ago(state.lastSaved)}` : '⚠️ Not saved: storage blocked', saveOk ? 'good' : 'bad');
  }

  // ---------- install prompt ----------
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; route(); });
  const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
  const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function installCard() {
    if (isStandalone() || state.hideInstall) return '';
    if (deferredInstall) {
      return `<div class="card install"><div>📲 <b>Install the app</b> to play offline from your home screen.</div>
        <div class="row"><button class="btn primary" data-act="install">Install</button><button class="btn ghost" data-act="hide-install">Not now</button></div></div>`;
    }
    if (isIOS()) {
      return `<div class="card install"><div>📲 <b>Install on iPhone:</b> tap <b>Share</b> <span class="kbd">⬆︎</span> in Safari, then <b>Add to Home Screen</b>.</div>
        <div class="row"><button class="btn ghost" data-act="hide-install">Got it</button></div></div>`;
    }
    return '';
  }
  function wireInstall(root) {
    root.querySelector('[data-act="install"]')?.addEventListener('click', async () => {
      if (!deferredInstall) return;
      deferredInstall.prompt();
      await deferredInstall.userChoice;
      deferredInstall = null;
      route();
    });
    root.querySelector('[data-act="hide-install"]')?.addEventListener('click', () => { state.hideInstall = true; save(); route(); });
  }

  // ---------- views ----------
  function viewHome() {
    const doneCount = DAYS.filter((d) => state.days[d.id]?.completed).length;
    const cards = DAYS.map((d) => {
      const ds = state.days[d.id];
      let status, cls;
      if (ds?.completed) { status = '✅'; cls = 'done'; }
      else if (isUnlocked(d.id)) { status = '▶️'; cls = 'open'; }
      else if (!hasContent(d.id)) { status = '🛠️'; cls = 'locked'; }
      else { status = '🔒'; cls = 'locked'; }
      const note = !hasContent(d.id) ? '<span class="tag">Content pack coming</span>' : '';
      const bonus = state.bonusDay === d.id && !ds?.completed ? '<span class="tag fire">🔥 ×1.1 XP</span>' : '';
      const inner = `
        <div class="day-num">${d.boss ? '👹' : 'Day'}<b>${d.id}</b></div>
        <div class="day-body">
          <div class="day-title">${d.badge.icon} ${esc(d.title)}</div>
          <div class="day-sub">${esc(d.subtitle)}</div>
          <div class="day-meta">Ch. ${d.chapters.join(', ')} ${note}${bonus}</div>
        </div>
        <div class="day-status">${status}</div>`;
      return isUnlocked(d.id)
        ? `<a class="day-card ${cls}" href="#/day/${d.id}">${inner}</a>`
        : `<div class="day-card ${cls}">${inner}</div>`;
    }).join('');

    const returning = state.xp > 0 || Object.keys(state.days).length > 0;
    app.innerHTML = `
      <a class="btn primary big enter" href="#/">🏥 Enter the hospital</a>
      <section class="hero">
        <a class="greet" href="#/settings"><span class="greet-av">${esc(state.profile.avatar)}</span><span>${returning ? 'Welcome back' : 'Welcome'}, <b>${esc(drName(state.profile))}</b></span></a>
        <h1>Operation Homeostasis</h1>
        <p>A 14-day endocrine rotation. Run ward consults, clear your pager, survive the attending, and lock it all in with a rapid-fire synthesis round.</p>
        <div class="progress-pill">${doneCount} / 14 days complete</div>
        ${saveNote()}
      </section>
      ${installCard()}
      <section class="day-list">${cards}</section>`;
    wireInstall(app);
  }

  function viewDay(id) {
    const meta = dayMeta(id);
    const content = CONTENT[id];
    if (!meta || !content || !isUnlocked(id)) return go('#/');
    const ds = dayState(id);
    const pearlsOpen = coreDone(id);

    const rows = content.stations.map((s) => {
      const st = ds.stations[s.id];
      const locked = s.type === 'pearls' && !pearlsOpen;
      const score = st?.done && st.max ? `<span class="score">${st.score}/${st.max} XP</span>` : '';
      const status = locked ? '🔒' : st?.done ? '✅' : '▶️';
      const inner = `<span class="st-icon">${s.icon}</span><span class="st-title">${esc(s.title)}${locked ? '<small>Unlocks after all other stations</small>' : ''}</span>${score}<span>${status}</span>`;
      return locked
        ? `<div class="station locked">${inner}</div>`
        : `<a class="station" href="#/day/${id}/s/${s.id}">${inner}</a>`;
    }).join('');

    app.innerHTML = `
      <a class="back" href="#/days">← All days</a>
      <section class="card briefing">
        <div class="eyebrow">Day ${id} · ${meta.badge.icon} ${esc(meta.badge.name)}</div>
        <h1>${esc(meta.title)}</h1>
        <p class="scene">${esc(content.scene)}</p>
        <h3>Pre-round briefing</h3>
        <ol>${content.objectives.map((o) => `<li>${esc(o)}</li>`).join('')}</ol>
        <div class="source">Source: ${esc(content.source)}</div>
        ${ds.completed ? `<div class="badge-earned">${meta.badge.icon} Badge earned: <b>${esc(meta.badge.name)}</b></div>` : ''}
      </section>
      <section class="stations">${rows}</section>`;
  }

  function viewBadges() {
    const grid = DAYS.map((d) => {
      const got = state.days[d.id]?.completed;
      return `<div class="badge ${got ? 'got' : ''}"><div class="b-icon">${d.badge.icon}</div><div class="b-name">${esc(d.badge.name)}</div><div class="b-day">Day ${d.id}</div></div>`;
    }).join('');
    const ranks = window.ENDO_RPG.titles.map((t) => `<li class="${RPG.levelFor(state.xp) >= t.level ? 'got' : ''}"><b>${t.name}</b><span>Level ${t.level} · ${RPG.xpForLevel(t.level)} XP</span></li>`).join('');
    app.innerHTML = `
      <a class="back" href="#/">← Home</a>
      <h1>Badges</h1>
      <div class="badge-grid">${grid}</div>
      <h2>Title ladder</h2>
      <ul class="rank-list">${ranks}</ul>`;
  }

  function viewOnboarding() {
    const hasProgress = state.xp > 0 || Object.keys(state.days).length > 0;
    const online = !!(NET && NET.configured);
    app.innerHTML = `
      <section class="onboard">
        <div class="eyebrow">⚕️ Operation Homeostasis</div>
        <h1>Welcome, resident</h1>
        <p class="muted">Before your first consult, set up your badge for the 14-day endocrine rotation.</p>
        ${online ? '<div class="card ob-signin"></div>' : ''}
        ${hasProgress ? `<div class="card ob-keep">✅ Your existing progress (<b>${state.xp} XP</b>) is safe. Just add a profile to continue.</div>` : ''}
        <div class="card">${profileForm(null, 'Start rotation →')}</div>
        <details class="card ob-import">
          <summary>${online ? 'No account? Import a save file instead' : 'Moving from another device or browser? Import a save'}</summary>
          <p class="muted small">Paste a save code or choose an exported file.</p>
          ${importWidget()}
        </details>
      </section>`;
    wireProfileForm(app.querySelector('.profile-form'), ({ name, avatar }) => {
      state.profile = { name, avatar, createdAt: Date.now() };
      save();
      route();
      if (NET) NET.profileCreated();
    });
    wireImport(app.querySelector('.ob-import'));
    if (online) NET.renderWelcome(app.querySelector('.ob-signin'));
  }

  function viewSettings() {
    app.innerHTML = `
      <a class="back" href="#/">← Home</a>
      <h1>Settings</h1>
      <div class="card" id="profile">
        <h3>Profile</h3>
        ${profileForm(state.profile, 'Save profile')}
      </div>
      <div class="card" id="backup">
        <h3>Saving &amp; backup</h3>
        ${saveNote()}
        <p class="muted small">${NET && NET.configured
          ? 'Progress saves in this browser. Sign in under <b>Account &amp; cloud sync</b> and it also saves to your account, so you can sign in on any device and pick up where you left off. Export/import still works as a backup.'
          : 'Progress lives in this browser on this device. iPhone home-screen apps and Safari keep separate storage, so use export/import to move between them.'}</p>
        <div class="row">
          <button class="btn" data-act="export-file">⬇️ Export progress</button>
          <button class="btn" data-act="copy-code">📋 Copy save code</button>
        </div>
        <h3>Import progress</h3>
        ${importWidget()}
      </div>
      <div class="card">
        <h3>Online play</h3>
        <p class="muted small">${NET ? NET.statusLine() : 'Online features are unavailable in this build.'}</p>
        <div class="row"><a class="btn" href="#/online">🪪 Account &amp; cloud sync</a></div>
      </div>
      <div class="card">
        <label class="toggle"><input type="checkbox" id="unlockAll" ${state.unlockAll ? 'checked' : ''}> Review mode: unlock every available day</label>
      </div>
      <div class="card">
        <h3>How scoring works</h3>
        <ul>
          <li>Ward consults: XP for each correct decision on your first try. Dangerous choices cost a stability light 🟢. Lose all three and the rapid response team comes (−${RRT_PENALTY} XP).</li>
          <li>Matching and sorting: XP for each pair or item you get right on the first try.</li>
          <li>Boss: you grade yourself (full, half, or zero).</li>
          <li>Finish a day with ≥ 80% of its XP to earn a 🔥 ×1.1 multiplier on the next day.</li>
          <li>Replaying a finished station is practice mode and doesn't award XP.</li>
        </ul>
      </div>
      <div class="card">
        <h3>About</h3>
        <p>Content is adapted from <i>Endocrine Secrets</i> (2009). Amber <b>2026 Update</b> notes flag places where current guidelines differ from the book. This is an educational game, not clinical guidance.</p>
      </div>
      <button class="btn danger" id="reset">Reset all progress</button>`;
    wireProfileForm(app.querySelector('.profile-form'), ({ name, avatar }) => {
      state.profile = Object.assign({}, state.profile, { name, avatar });
      save();
      renderHeader();
      toast('Profile updated ✓', 'good');
    });
    const backup = document.getElementById('backup');
    backup.querySelector('[data-act="export-file"]').onclick = () => { download(exportFileName(), exportJSON(), 'application/json'); toast('Backup downloaded', 'good'); };
    backup.querySelector('[data-act="copy-code"]').onclick = () => {
      const code = exportCode();
      copyText(code).then(() => toast('Save code copied ✓', 'good')).catch(() => {
        showModal(`<h2>Your save code</h2><p class="muted">Copy this and paste it into Import on the other device.</p><textarea readonly rows="5">${code}</textarea>`, [{ label: 'Done', cls: 'btn primary' }]);
        modal.querySelector('textarea').select();
      });
    };
    wireImport(backup);
    document.getElementById('unlockAll').onchange = (e) => { state.unlockAll = e.target.checked; save(); };
    document.getElementById('reset').onclick = () => showModal('<h2>Reset everything?</h2><p>This clears all XP, badges, and station progress on this device. Your profile is kept.</p>', [
      { label: 'Cancel', cls: 'btn ghost' },
      { label: 'Reset', cls: 'btn danger', onClick: () => { state = RPG.ensure(Object.assign(fresh(), { profile: state.profile })); save(); renderHeader(); go('#/'); } }
    ]);
  }

  function viewStation(dayId, sid) {
    const content = CONTENT[dayId];
    if (!content || !isUnlocked(dayId)) return go('#/');
    const station = content.stations.find((s) => s.id === sid);
    if (!station) return go(`#/day/${dayId}`);
    if (station.type === 'pearls' && !coreDone(dayId)) return go(`#/day/${dayId}`);

    const ds = dayState(dayId);
    const practice = !!ds.stations[sid]?.done;
    const fromWorld = sessionStorage.getItem('endo.from') === 'world';
    const back = fromWorld ? ['#/', '← Back to the hospital'] : [`#/day/${dayId}`, `← Day ${dayId}`];
    const mod = RPG.stationStart(station, practice);
    const key = `${dayId}:${sid}`;
    const saved = ['consult', 'pager', 'boss', 'pearls'].includes(station.type) && state.resume[key]?.i > 0 ? state.resume[key] : null;
    app.innerHTML = `
      <a class="back" href="${back[0]}">${back[1]}</a>
      <h1 class="station-h">${station.icon} ${esc(station.title)}</h1>
      ${practice ? '<div class="practice">Practice mode: no XP on replays (you can still find coins and materials)</div>' : ''}
      ${saved ? `<div class="buff resume">↩️ Picking up where you left off, at question ${saved.i + 1}. <button class="linkish" data-act="restart">Start over</button></div>` : ''}
      ${mod.banners.map((b) => `<div class="buff">${b}</div>`).join('')}
      <div id="stage"></div>`;
    const stage = document.getElementById('stage');
    app.querySelector('[data-act="restart"]')?.addEventListener('click', () => {
      delete state.resume[key];
      save();
      route();
    });
    inStation = true;

    const ctx = {
      dayId, station, practice, stage, mod, resumed: saved,
      award: (n) => award(dayId, n, practice, mod.xpPct),
      checkpoint(data) {
        state.resume[key] = data;
        save();
      },
      finish(score, max, { quiet = false } = {}) {
        const prev = ds.stations[sid];
        ds.stations[sid] = { done: true, score: Math.max(prev?.score || 0, practice ? 0 : score), max };
        if (practice && prev) ds.stations[sid].score = prev.score;
        delete state.resume[key];
        const loot = RPG.stationComplete(dayId, station, practice);
        save();
        leaveStation();
        if (quiet) return loot;
        const unlockedPearls = !practice && coreDone(dayId) && station.type !== 'pearls';
        const card = el(`<div class="card finish">
          <div class="big-emoji">🏁</div>
          <h2>Station complete</h2>
          <p>${practice ? 'Practice run finished.' : `You earned <b>${score} / ${max} XP</b>.`}</p>
          ${loot}
          ${unlockedPearls ? '<p class="unlock">⚡ Rapid-Fire Synthesis unlocked at the Library study carrel!</p>' : ''}
          <a class="btn primary" href="${back[0]}">${fromWorld ? 'Back to the hospital' : `Back to Day ${dayId}`}</a>
        </div>`);
        stage.appendChild(card);
        card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    };

    ({ consult: runNodes, pager: runNodes, match: runMatch, sort: runSort, boss: runBoss, pearls: runPearls })[station.type](ctx);
  }

  // ---------- station: consult / pager ----------
  function runNodes(ctx) {
    const { station, stage } = ctx;
    const isConsult = station.type === 'consult';
    const nodes = station.nodes;
    const max = nodes.reduce((sum, n) => sum + (n.xp || 0), 0);
    let score = ctx.resumed?.score || 0;
    const maxStability = 3 + ctx.mod.stability;
    let stability = Math.min(maxStability, ctx.resumed?.stability || maxStability);

    if (isConsult && station.chart) {
      const c = station.chart;
      stage.appendChild(el(`<details class="card chart" open>
        <summary>📋 Patient chart <span class="stability" id="stab"></span></summary>
        <p><b>HPI:</b> ${c.hpi}</p>
        <p><b>Vitals:</b> ${c.vitals}</p>
        <p><b>Exam:</b> ${c.exam}</p>
        <table class="labs">${c.labs.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table>
      </details>`));
    }
    const drawStability = () => {
      const s = document.getElementById('stab');
      if (s) s.textContent = '🟢'.repeat(stability) + '⚫'.repeat(maxStability - stability);
    };
    drawStability();

    const loseStability = () => {
      if (!isConsult) return;
      stability--;
      drawStability();
      buzz([60, 40, 60]);
      if (stability <= 0) {
        penalize(RRT_PENALTY, ctx.practice);
        showModal(`<div class="big-emoji">🚨</div><h2>Rapid response called</h2>
          <p>Your patient decompensated. ${ctx.practice ? '' : `<b>−${RRT_PENALTY} XP.</b>`}</p>
          <p class="debrief">${station.rrt || ''}</p>`, [{ label: 'Resume case', cls: 'btn primary', onClick: () => { stability = maxStability; drawStability(); } }]);
      }
    };

    const step = (i) => {
      if (i >= nodes.length) {
        if (station.outro) stage.appendChild(el(`<div class="card outro">${station.outro}</div>`));
        ctx.finish(score, max);
        return;
      }
      if (i > 0) ctx.checkpoint({ i, score, stability });
      const node = nodes[i];
      const card = el(`<section class="card node">
        <div class="eyebrow">${isConsult ? 'Decision point' : 'Page'} ${i + 1} of ${nodes.length}${node.xp ? ` · ${node.xp} XP` : ''}</div>
        ${node.info ? `<div class="info">${node.info}</div>` : ''}
        <h3 class="prompt">${node.prompt}</h3>
        <div class="answers"></div>
        <div class="feedback"></div>
      </section>`);
      stage.appendChild(card);
      if (i > 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const answers = card.querySelector('.answers');
      const feedback = card.querySelector('.feedback');

      const succeed = (earned, html, good) => {
        score += earned;
        if (earned) ctx.award(earned);
        feedback.innerHTML = `<div class="fb ${good ? 'good' : 'neutral'}">${html}</div>
          ${node.update ? `<div class="update"><b>2026 Update:</b> ${node.update}</div>` : ''}`;
        const next = el(`<button class="btn primary">${i + 1 < nodes.length ? 'Continue →' : 'Finish'}</button>`);
        next.onclick = () => { next.remove(); step(i + 1); };
        feedback.appendChild(next);
      };

      if (node.kind === 'calc') {
        let tries = 0;
        const form = el(`<form class="calc"><input type="text" inputmode="decimal" autocomplete="off" placeholder="Your answer" aria-label="Your answer"><span class="unit">${node.answer.unit || ''}</span><button class="btn primary" type="submit">Check</button></form>`);
        answers.appendChild(form);
        const input = form.querySelector('input');
        form.onsubmit = (e) => {
          e.preventDefault();
          const v = parseFloat(input.value.replace(',', '.'));
          if (Number.isNaN(v)) return;
          tries++;
          const ok = v >= node.answer.min && v <= node.answer.max;
          if (ok || tries >= 2) {
            input.disabled = true;
            form.querySelector('button').disabled = true;
            form.classList.add(ok ? 'right' : 'wrong');
            if (!ok) buzz(80);
            succeed(ok && tries === 1 ? node.xp || 0 : 0, `${ok ? '✅ ' : `❌ The answer is <b>${node.answer.value} ${node.answer.unit || ''}</b>. `}${node.fb}`, ok);
          } else {
            buzz(80);
            feedback.innerHTML = '<div class="fb bad">Not quite. Check your math and try once more.</div>';
          }
        };
        return;
      }

      let firstTry = true;
      const letters = 'ABCDEF';
      const pairs = [];
      shuffle(node.options).forEach((opt, k) => {
        const b = el(`<button class="opt"><span class="letter">${letters[k]}</span><span>${opt.t}</span></button>`);
        b.onclick = () => {
          if (opt.ok) {
            answers.querySelectorAll('.opt').forEach((x) => (x.disabled = true));
            b.classList.add('right');
            card.querySelector('.narrow')?.remove();
            succeed(firstTry ? node.xp || 0 : 0, opt.fb, true);
          } else {
            firstTry = false;
            b.disabled = true;
            b.classList.add(opt.danger ? 'danger' : 'wrong');
            feedback.innerHTML = `<div class="fb bad">${opt.danger ? '⚠️ <b>Patient harm risk.</b> ' : ''}${opt.fb}<div class="retry">Pick again.</div></div>`;
            if (opt.danger) loseStability(); else buzz(50);
          }
        };
        pairs.push({ b, opt });
        answers.appendChild(b);
      });
      narrowTool(ctx, answers, pairs);
    };
    step(ctx.resumed?.i || 0);
  }

  function narrowTool(ctx, answers, pairs) {
    const wrongLeft = () => pairs.filter((p) => !p.opt.ok && !p.b.disabled);
    if (RPG.narrowLeft(ctx.mod) <= 0 || wrongLeft().length < 2) return;
    const btn = el(`<button class="btn ghost narrow" type="button">🔍 Narrow it down <span></span></button>`);
    const label = () => { btn.querySelector('span').textContent = `(${RPG.narrowLeft(ctx.mod)} left)`; };
    label();
    btn.onclick = () => {
      const wrong = wrongLeft();
      if (wrong.length < 2 || !RPG.useNarrow(ctx.mod)) return btn.remove();
      const p = wrong[Math.floor(Math.random() * wrong.length)];
      p.b.disabled = true;
      p.b.classList.add('narrowed');
      if (RPG.narrowLeft(ctx.mod) <= 0 || wrongLeft().length < 2) btn.remove();
      else label();
    };
    answers.after(btn);
  }

  // ---------- station: matching ----------
  function runMatch(ctx) {
    const { station, stage } = ctx;
    const per = station.xpPer || 2;
    const pairs = station.pairs.map((p, i) => ({ ...p, i }));
    const max = pairs.length * per;
    let score = 0;
    let selected = null;
    const missed = new Set();
    let matched = 0;

    const wrap = el(`<div>
      <p class="instructions">${station.instructions}</p>
      <div class="match-left"></div>
      <div class="match-right"></div>
    </div>`);
    stage.appendChild(wrap);
    const left = wrap.querySelector('.match-left');
    const right = wrap.querySelector('.match-right');

    pairs.forEach((p) => {
      const chip = el(`<button class="chip" data-i="${p.i}">${esc(p.l)}</button>`);
      chip.onclick = () => {
        if (chip.classList.contains('matched')) return;
        left.querySelectorAll('.chip').forEach((c) => c.classList.remove('sel'));
        selected = p.i;
        chip.classList.add('sel');
      };
      left.appendChild(chip);
    });
    shuffle(pairs).forEach((p) => {
      const fact = el(`<button class="fact" data-i="${p.i}">${esc(p.r)}</button>`);
      fact.onclick = () => {
        if (selected === null || fact.classList.contains('matched')) {
          if (selected === null) toast('Tap an item first ↑');
          return;
        }
        const chip = left.querySelector(`.chip[data-i="${selected}"]`);
        if (p.i === selected) {
          chip.classList.remove('sel');
          chip.classList.add('matched');
          fact.classList.add('matched');
          fact.innerHTML = `<b>${esc(p.l)}</b> → ${esc(p.r)}`;
          right.appendChild(fact);
          if (!missed.has(p.i)) score += ctx.award(per) ? per : 0;
          selected = null;
          matched++;
          if (matched === pairs.length) {
            if (ctx.practice) score = 0;
            ctx.finish(score, max);
          }
        } else {
          missed.add(selected);
          fact.classList.add('shake');
          chip.classList.add('shake');
          buzz(60);
          setTimeout(() => { fact.classList.remove('shake'); chip.classList.remove('shake'); }, 450);
        }
      };
      right.appendChild(fact);
    });
  }

  // ---------- station: sort ----------
  function runSort(ctx) {
    const { station, stage } = ctx;
    const per = station.xpPer || 1;
    const items = shuffle(station.items);
    const max = items.length * per;
    let score = 0;
    let i = 0;

    const wrap = el(`<div>
      <p class="instructions">${station.instructions}</p>
      <div class="card sort-card"><div class="eyebrow" id="sortCount"></div><div class="sort-item" id="sortItem"></div></div>
      <div class="sort-buttons">${station.categories.map((c) => `<button class="btn sort-btn" data-k="${c.key}">${esc(c.label)}</button>`).join('')}</div>
      <div class="sort-log"></div>
    </div>`);
    stage.appendChild(wrap);
    const itemEl = wrap.querySelector('#sortItem');
    const countEl = wrap.querySelector('#sortCount');
    const log = wrap.querySelector('.sort-log');
    const label = (k) => station.categories.find((c) => c.key === k).label;

    const show = () => {
      countEl.textContent = `${i + 1} of ${items.length}`;
      itemEl.textContent = items[i].t;
    };
    wrap.querySelectorAll('.sort-btn').forEach((b) => {
      b.onclick = () => {
        if (i >= items.length) return;
        const it = items[i];
        const ok = b.dataset.k === it.c;
        if (ok) score += ctx.award(per) ? per : 0;
        else buzz(60);
        log.prepend(el(`<div class="log ${ok ? 'right' : 'wrong'}">${ok ? '✅' : '❌'} ${esc(it.t)} → ${esc(label(it.c))}</div>`));
        i++;
        if (i < items.length) return show();
        itemEl.textContent = 'Done!';
        countEl.textContent = '';
        wrap.querySelectorAll('.sort-btn').forEach((x) => (x.disabled = true));
        if (station.outro) stage.appendChild(el(`<div class="card outro">${station.outro}</div>`));
        if (ctx.practice) score = 0;
        ctx.finish(score, max);
      };
    });
    show();
  }

  // ---------- station: boss ----------
  function runBoss(ctx) {
    const { station, stage } = ctx;
    const per = station.xpPer || 10;
    const qs = station.questions;
    const max = qs.length * per;
    let score = ctx.resumed?.score || 0;
    stage.appendChild(el(`<div class="card boss-intro">${station.intro}</div>`));

    const step = (i) => {
      if (i >= qs.length) return ctx.finish(score, max);
      if (i > 0) ctx.checkpoint({ i, score });
      const q = qs[i];
      const card = el(`<section class="card node">
        <div class="eyebrow">Question ${i + 1} of ${qs.length} · ${per} XP</div>
        <h3 class="prompt">${q.q}</h3>
        <textarea rows="3" placeholder="Your answer (optional; typing it helps it stick)"></textarea>
        <button class="btn primary reveal">Reveal answer</button>
        <div class="feedback"></div>
      </section>`);
      stage.appendChild(card);
      if (i > 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const fb = card.querySelector('.feedback');
      card.querySelector('.reveal').onclick = (e) => {
        e.target.remove();
        card.querySelector('textarea').readOnly = true;
        fb.innerHTML = `<div class="fb neutral">${q.a}</div><div class="grade">How did you do?</div>`;
        const row = el('<div class="row grade-row"></div>');
        [['Nailed it', 1, 'good'], ['Partly', 0.5, ''], ['Missed', 0, 'bad']].forEach(([lbl, f, cls]) => {
          const b = el(`<button class="btn ${cls}">${lbl}</button>`);
          b.onclick = () => {
            row.remove();
            const earned = Math.round(per * f);
            score += ctx.award(earned) ? earned : 0;
            step(i + 1);
          };
          row.appendChild(b);
        });
        fb.appendChild(row);
      };
    };
    step(ctx.resumed?.i || 0);
  }

  // ---------- station: rapid-fire synthesis ----------
  const RF_KINDS = {
    recall: { label: '🧠 Active recall', xp: 3 },
    mcq: { label: '🎯 Multiple choice', xp: 3 },
    why: { label: '❓ Why?', xp: 6 }
  };
  const highlight = (text) => esc(text).replace(/\{\{c\d+::(.*?)(?:::.*?)?\}\}/g, '<mark>$1</mark>');
  const normalize = (s) => s.toLowerCase().replace(/[×*]/g, ' ').replace(/\s+/g, ' ').trim();
  function recallMatches(answer, accept) {
    const a = normalize(answer);
    if (!a) return false;
    const has = (k) => a.includes(normalize(k));
    return (!accept.all || accept.all.every(has)) && (!accept.any || accept.any.some(has));
  }

  function runPearls(ctx) {
    const { station, stage, dayId } = ctx;
    const items = station.items;
    const max = items.reduce((sum, it) => sum + RF_KINDS[it.kind].xp, 0);
    const tally = ctx.resumed?.tally || { recall: [0, 0], mcq: [0, 0], why: [0, 0] };
    let score = ctx.resumed?.score || 0;

    stage.appendChild(el(`<div class="card rf-intro">${station.intro}
      <div class="rf-legend">${Object.values(RF_KINDS).map((k) => `<span class="rf-kind">${k.label}</span>`).join('')}</div></div>`));

    const step = (i) => {
      if (i >= items.length) return wrapUp();
      if (i > 0) ctx.checkpoint({ i, score, tally });
      const it = items[i];
      const kind = RF_KINDS[it.kind];
      tally[it.kind][1] += kind.xp;
      const card = el(`<section class="card node rf-${it.kind}">
        <div class="eyebrow">${i + 1} of ${items.length} · <span class="rf-kind">${kind.label}</span> · ${kind.xp} XP</div>
        <h3 class="prompt">${it.q}</h3>
        <div class="answers"></div>
        <div class="feedback"></div>
      </section>`);
      stage.appendChild(card);
      if (i > 0) card.scrollIntoView({ behavior: 'smooth', block: 'start' });
      const answers = card.querySelector('.answers');
      const feedback = card.querySelector('.feedback');

      const done = (earned, html, cls) => {
        score += earned;
        tally[it.kind][0] += earned;
        feedback.insertAdjacentHTML('beforeend', `${html ? `<div class="fb ${cls}">${html}</div>` : ''}
          ${it.update ? '<div class="update"><b>2026 Update:</b> this reflects current guidelines, not the 2009 text.</div>' : ''}`);
        const next = el(`<button class="btn primary">${i + 1 < items.length ? 'Next →' : 'See results'}</button>`);
        next.onclick = () => { next.remove(); step(i + 1); };
        feedback.appendChild(next);
        if (earned) toast(`+${earned}`, 'good');
      };

      if (it.kind === 'mcq') {
        let firstTry = true;
        const pairs = [];
        shuffle(it.options).forEach((opt, k) => {
          const b = el(`<button class="opt"><span class="letter">${'ABCD'[k]}</span><span>${opt.t}</span></button>`);
          pairs.push({ b, opt });
          b.onclick = () => {
            if (opt.ok) {
              answers.querySelectorAll('.opt').forEach((x) => (x.disabled = true));
              card.querySelector('.narrow')?.remove();
              b.classList.add('right');
              feedback.innerHTML = '';
              done(firstTry ? kind.xp : 0, `${firstTry ? '✅' : '☑️ Got there.'} ${it.a}`, firstTry ? 'good' : 'neutral');
            } else {
              firstTry = false;
              b.disabled = true;
              b.classList.add('wrong');
              buzz(50);
              feedback.innerHTML = '<div class="fb bad">Not that one. Try again.</div>';
            }
          };
          answers.appendChild(b);
        });
        narrowTool(ctx, answers, pairs);
        return;
      }

      if (it.kind === 'recall') {
        const form = el(`<form class="rf-recall">
          <input type="text" autocomplete="off" autocapitalize="off" placeholder="Type your answer from memory" aria-label="Your answer">
          <div class="row"><button class="btn primary" type="submit">Check</button><button class="btn ghost" type="button" data-act="idk">I don't know</button></div>
        </form>`);
        answers.appendChild(form);
        const input = form.querySelector('input');
        const lock = () => { input.readOnly = true; form.querySelectorAll('button').forEach((b) => (b.disabled = true)); };
        form.onsubmit = (e) => {
          e.preventDefault();
          if (!input.value.trim()) return input.focus();
          lock();
          if (recallMatches(input.value, it.accept)) {
            form.classList.add('right');
            return done(kind.xp, `✅ ${it.a}`, 'good');
          }
          feedback.innerHTML = `<div class="fb neutral"><b>Answer:</b> ${it.a}</div><div class="grade">Did your answer mean the same thing?</div>`;
          const row = el('<div class="row grade-row"></div>');
          [['Yes, I had it', kind.xp - 1, 'good'], ['No, I missed it', 0, 'bad']].forEach(([lbl, xp, cls]) => {
            const b = el(`<button class="btn ${cls}">${lbl}</button>`);
            b.onclick = () => { row.remove(); form.classList.add(xp ? 'right' : 'wrong'); done(xp, '', ''); };
            row.appendChild(b);
          });
          feedback.appendChild(row);
        };
        form.querySelector('[data-act="idk"]').onclick = () => {
          lock();
          form.classList.add('wrong');
          done(0, `<b>Answer:</b> ${it.a}`, 'neutral');
        };
        return;
      }

      const per = kind.xp / it.points.length;
      const box = el(`<div class="rf-why">
        <textarea rows="4" placeholder="Explain it in your own words, as if teaching a med student"></textarea>
        <button class="btn primary reveal">Compare with the model answer</button>
      </div>`);
      answers.appendChild(box);
      box.querySelector('.reveal').onclick = (e) => {
        const text = box.querySelector('textarea');
        if (!text.value.trim()) { toast('Write your explanation first'); return text.focus(); }
        e.target.remove();
        text.readOnly = true;
        feedback.innerHTML = `<div class="fb neutral"><b>Key points.</b> Tick each one your explanation covered:
          <div class="checklist">${it.points.map((p, k) => `<label class="check"><input type="checkbox" data-k="${k}"><span>${p}</span></label>`).join('')}</div></div>`;
        const btn = el('<button class="btn primary">Score my explanation</button>');
        btn.onclick = () => {
          const hit = feedback.querySelectorAll('.checklist input:checked').length;
          feedback.querySelectorAll('.checklist input').forEach((c) => (c.disabled = true));
          btn.remove();
          done(Math.round(hit * per), `You covered <b>${hit} of ${it.points.length}</b> key points.`, hit === it.points.length ? 'good' : 'neutral');
        };
        feedback.appendChild(btn);
      };
    };

    const wrapUp = () => {
      ctx.award(score);
      const loot = ctx.finish(score, max, { quiet: true });
      const rows = Object.entries(RF_KINDS).map(([k, v]) => `<tr><td>${v.label}</td><td>${tally[k][0]} / ${tally[k][1]}</td></tr>`).join('');
      const list = (arr, update) => arr.map((p) => `<li class="pearl ${update ? 'upd' : ''}">${highlight(p)}</li>`).join('');
      const summary = el(`<div>
        <div class="card finish">
          <div class="big-emoji">⚡</div>
          <h2>Round complete</h2>
          <p>${ctx.practice ? 'Practice run finished.' : `You earned <b>${score} / ${max} XP</b>.`}</p>
          <table class="labs">${rows}</table>
          ${loot}
        </div>
        <details class="card recap" open>
          <summary>💎 Day ${dayId} pearl recap (${station.pearls.length + (station.updates?.length || 0)})</summary>
          <ol class="pearls">${list(station.pearls)}</ol>
          ${station.updates?.length ? `<h3 class="upd-h">2026 Updates</h3><ol class="pearls">${list(station.updates, true)}</ol>` : ''}
        </details>
        <div class="row"><button class="btn" data-act="again">Play the round again</button></div>
        <div class="finish-day"></div>
      </div>`);
      stage.appendChild(summary);
      summary.scrollIntoView({ behavior: 'smooth', block: 'start' });
      summary.querySelector('[data-act="again"]').onclick = () => go(location.hash);
      completeDayButton(ctx, summary.querySelector('.finish-day'));
    };
    step(ctx.resumed?.i || 0);
  }

  function completeDayButton(ctx, fin) {
    const { dayId } = ctx;
    const ds = dayState(dayId);
    const meta = dayMeta(dayId);
    if (ds.completed) {
      fin.innerHTML = `<div class="card badge-earned">${meta.badge.icon} Day ${dayId} complete. Badge: <b>${esc(meta.badge.name)}</b></div>`;
      return;
    }
    const btn = el(`<button class="btn primary big">Complete Day ${dayId} ${meta.badge.icon}</button>`);
    btn.onclick = () => {
      ds.completed = true;
      state.rpg.floor = null;
      const core = CONTENT[dayId].stations.map((s) => ds.stations[s.id]);
      const got = core.reduce((a, s) => a + (s?.score || 0), 0);
      const max = core.reduce((a, s) => a + (s?.max || 0), 0);
      const pct = max ? got / max : 0;
      const streak = pct >= 0.8 && dayId < DAYS.length;
      if (streak) state.bonusDay = dayId + 1;
      save();
      const nextReady = hasContent(dayId + 1);
      showModal(`<div class="big-emoji">${meta.badge.icon}</div><h2>Badge earned: ${esc(meta.badge.name)}</h2>
        <p>Day ${dayId} score: <b>${got} / ${max} XP</b> (${Math.round(pct * 100)}%).</p>
        ${streak ? '<p>🔥 Streak! You get <b>×1.1 XP</b> tomorrow.</p>' : '<p>Score 80% or more to earn a streak multiplier.</p>'}
        ${nextReady ? `<p>🛗 Floor ${dayId + 1} is open. Your next patients are waiting there.</p>` : `<p class="muted">The Day ${dayId + 1} content pack isn't built yet.</p>`}`,
        [{ label: 'Back to rotation', cls: 'btn primary', onClick: () => go('#/') }]);
    };
    fin.appendChild(btn);
  }

  // ---------- router ----------
  function go(hash) {
    if (location.hash === hash) route();
    else location.hash = hash;
  }
  function route() {
    const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
    if (updateReady) return location.reload();
    leaveStation();
    window.scrollTo(0, 0);
    renderHeader();
    document.body.classList.remove('in-world');
    if (!state.profile) return viewOnboarding();
    if (parts[0] === 'day' && parts[2] === 's') return viewStation(+parts[1], parts[3]);
    if (parts[0] === 'day') { sessionStorage.removeItem('endo.from'); return viewDay(+parts[1]); }
    if (parts[0] === 'days') { sessionStorage.removeItem('endo.from'); return viewHome(); }
    if (parts[0] === 'badges') return viewBadges();
    if (parts[0] === 'settings') return viewSettings();
    if (RPG.views[parts[0]]) return RPG.views[parts[0]]();
    if (NET && NET.views[parts[0]]) return NET.views[parts[0]](parts.slice(1));
    RPG.views.world();
  }
  window.addEventListener('hashchange', route);
  route();

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
    const hadController = !!navigator.serviceWorker.controller;
    let reloading = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || reloading) return;
      if (inStation) { updateReady = true; return; }
      reloading = true;
      location.reload();
    });
    window.addEventListener('load', () => navigator.serviceWorker.register('./sw.js').catch(() => {}));
  }
})();
