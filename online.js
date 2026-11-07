window.EndoNet = {
  init(G) {
    'use strict';
    const CFG = window.ENDO_ONLINE || {};
    const BASE = String(CFG.url || '').trim().replace(/\/+$/, '');
    const KEY = String(CFG.anonKey || '').trim();
    const configured = /^https?:\/\/\S+$/.test(BASE) && KEY.length > 20;
    const AUTH_STORE = 'endoRotation3d.auth';
    const D = window.ENDO_RPG;
    const { el, esc } = G;
    const S = () => G.getState();
    const BACK = '<a class="back" href="#/">← Back to the hospital</a>';

    // ---------- session ----------
    let sess = null;
    try { sess = JSON.parse(localStorage.getItem(AUTH_STORE)); } catch (e) { sess = null; }
    if (!sess || typeof sess !== 'object' || !sess.refresh_token || !sess.user || !sess.user.id) sess = null;
    const me = () => sess && sess.user.id;
    const signedIn = () => configured && !!sess;
    function storeSess(s) {
      sess = s;
      try { if (s) localStorage.setItem(AUTH_STORE, JSON.stringify(s)); else localStorage.removeItem(AUTH_STORE); } catch (e) { /* session stays in memory */ }
    }
    const toSess = (d) => ({
      access_token: d.access_token,
      refresh_token: d.refresh_token,
      expires_at: d.expires_at || Math.floor(Date.now() / 1000) + (d.expires_in || 3600),
      user: { id: d.user.id, email: d.user.email }
    });

    // ---------- http ----------
    const errText = (d, status) => (d && typeof d === 'object' && (d.message || d.msg || d.error_description || d.error)) || `Server error (${status})`;
    async function raw(path, { method = 'GET', body, prefer, token } = {}) {
      // Publishable keys (sb_publishable_…) aren't JWTs, so Authorization only carries a signed-in user's token.
      const headers = { apikey: KEY, 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;
      if (prefer) headers.Prefer = prefer;
      let res;
      try {
        res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
      } catch (e) {
        throw new Error("Can't reach the server. Check your connection.");
      }
      const text = await res.text();
      let data = null;
      try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }
      if (!res.ok) {
        const err = new Error(errText(data, res.status));
        err.status = res.status;
        throw err;
      }
      return data;
    }
    let refreshing = null;
    async function token(force) {
      if (!sess) throw new Error('Sign in at the Badge Office first.');
      if (!force && sess.expires_at * 1000 > Date.now() + 60000) return sess.access_token;
      if (!refreshing) {
        refreshing = raw('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: { refresh_token: sess.refresh_token } })
          .then((d) => storeSess(toSess(d)))
          .catch((e) => {
            if (e.status >= 400 && e.status < 500) { storeSess(null); throw new Error('Your session expired. Sign in again at the Badge Office.'); }
            throw e;
          })
          .finally(() => { refreshing = null; });
      }
      await refreshing;
      return sess.access_token;
    }
    async function api(path, opts = {}) {
      const t = await token();
      try {
        return await raw(path, { ...opts, token: t });
      } catch (e) {
        if (e.status === 401 && sess) return raw(path, { ...opts, token: await token(true) });
        throw e;
      }
    }
    const rpc = (fn, args = {}) => api(`/rest/v1/rpc/${fn}`, { method: 'POST', body: args });

    // ---------- cloud save ----------
    const pubProfile = () => {
      const s = S();
      return { name: s.profile.name, avatar: s.profile.avatar, level: G.RPG.levelFor(s.xp), xp: s.xp };
    };
    let sync = { state: 'idle', at: null, msg: '' };
    function agoShort(ts) {
      const s = Math.round((Date.now() - ts) / 1000);
      if (s < 10) return 'just now';
      if (s < 60) return `${s}s ago`;
      const m = Math.round(s / 60);
      return m < 60 ? `${m} min ago` : new Date(ts).toLocaleString();
    }
    function syncText() {
      if (!configured) return 'Online play is not set up. Progress saves on this device only.';
      if (!sess) return 'Not signed in. Progress saves on this device only.';
      if (sync.state === 'err') return `⚠️ Cloud sync failed: ${esc(sync.msg)}`;
      if (sync.state === 'pending') return '☁️ Syncing…';
      if (sync.at) return `☁️ Synced to the cloud ${agoShort(sync.at)}`;
      return '☁️ Signed in. Cloud sync is on.';
    }
    function setSync(state, msg = '') {
      sync = { state, at: state === 'ok' ? Date.now() : sync.at, msg };
      document.querySelectorAll('[data-sync]').forEach((n) => { n.innerHTML = syncText(); });
    }

    let pushTimer = 0;
    let pushing = false;
    let pushAgain = false;
    // True while the cloud save is being compared with this device, or while the player picks one.
    // Autosaves wait so they can't overwrite cloud progress before that choice is made.
    let hold = false;
    function onSaved() {
      if (!signedIn()) return;
      clearTimeout(pushTimer);
      pushTimer = setTimeout(push, 4000);
    }
    async function push() {
      if (!signedIn() || !S().profile || hold) return;
      if (pushing) { pushAgain = true; return; }
      pushing = true;
      clearTimeout(pushTimer);
      try {
        const s = S();
        await api('/rest/v1/saves', {
          method: 'POST',
          body: { id: me(), data: s, saved_at: new Date(s.lastSaved || Date.now()).toISOString() },
          prefer: 'resolution=merge-duplicates,return=minimal'
        });
        await api(`/rest/v1/players?id=eq.${me()}`, { method: 'PATCH', body: pubProfile(), prefer: 'return=minimal' });
        setSync('ok');
      } catch (e) {
        setSync('err', e.message);
      } finally {
        pushing = false;
        if (pushAgain) { pushAgain = false; push(); }
      }
    }
    const progressKey = (s) => JSON.stringify({
      xp: s.xp, days: s.days, bonusDay: s.bonusDay,
      rpg: Object.assign({}, s.rpg, { pos: null }),
      profile: s.profile && { name: s.profile.name, avatar: s.profile.avatar }
    });
    async function syncCheck(askAlways) {
      setSync('pending');
      hold = true;
      const release = () => { hold = false; };
      let rows;
      try { rows = await api(`/rest/v1/saves?select=data,saved_at&id=eq.${me()}`); } catch (e) { release(); throw e; }
      const cloud = rows && rows[0];
      if (!cloud) { release(); return push(); }
      let next;
      try { next = G.parseSave(JSON.stringify(cloud.data)); } catch (e) { release(); return push(); }
      const local = S();
      if (progressKey(next) === progressKey(local)) { release(); setSync('ok'); return; }
      const cloudAt = Date.parse(cloud.saved_at) || 0;
      if (!askAlways && (local.lastSaved || 0) >= cloudAt) { release(); return push(); }
      setSync('idle');
      G.showModal(`<div class="big-emoji">☁️</div><h2>Which progress should this device use?</h2>
        <p class="debrief"><b>Cloud save:</b> ${G.saveSummary(next)}<br><span class="muted small">saved ${esc(new Date(cloudAt).toLocaleString())}</span></p>
        <p class="debrief"><b>This device:</b> ${G.saveSummary(local)}</p>
        <p class="muted small">The one you don't pick is overwritten.</p>`, [
        { label: 'Keep this device', cls: 'btn', onClick: () => { release(); push(); } },
        { label: 'Use cloud save', cls: 'btn primary', onClick: () => { release(); G.replaceState(next); G.toast('☁️ Cloud save loaded', 'good'); } }
      ]);
    }
    async function ensurePlayer() {
      const rows = await api(`/rest/v1/players?id=eq.${me()}&select=guild_id`, { method: 'PATCH', body: pubProfile(), prefer: 'return=representation' });
      if (!rows || !rows.length) await api('/rest/v1/players', { method: 'POST', body: Object.assign({ id: me() }, pubProfile()), prefer: 'return=minimal' });
      flags.guild = rows && rows[0] ? rows[0].guild_id : null;
      rpc('touch').catch(() => {});
    }
    async function afterSignIn(askAlways) {
      if (!S().profile) return;
      hold = true;
      try { await ensurePlayer(); } catch (e) { hold = false; throw e; }
      await syncCheck(askAlways);
      refreshFlags();
    }
    // A badge was just made on the welcome screen while signed in: compare with the cloud first.
    function profileCreated() {
      if (signedIn()) afterSignIn(true).catch((e) => setSync('err', e.message));
    }

    // ---------- auth ----------
    async function signIn(email, password) {
      const d = await raw('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
      storeSess(toSess(d));
      await afterSignIn(true);
    }
    async function signUp(email, password) {
      const d = await raw('/auth/v1/signup', { method: 'POST', body: { email, password } });
      if (!d || !d.access_token) return false;
      storeSess(toSess(d));
      await afterSignIn(true);
      return true;
    }
    function signOut() {
      const t = sess && sess.access_token;
      storeSess(null);
      others.clear();
      onlineCount = 0;
      Object.assign(flags, { duels: 0, sales: 0, guild: null });
      setSync('idle');
      if (t) raw('/auth/v1/logout', { method: 'POST', token: t }).catch(() => {});
    }

    // ---------- badges on world NPCs ----------
    const flags = { duels: 0, sales: 0, guild: null };
    const needsMe = (d) => {
      const c = d.challenger === me();
      if (d.status === 'pending') return c ? d.c_score == null : d.o_score == null;
      if (d.status === 'done') return c ? !d.c_claimed : !d.o_claimed;
      return false;
    };
    async function refreshFlags() {
      if (!signedIn()) return;
      try {
        const [duels, sold] = await Promise.all([
          api('/rest/v1/duels?select=id,challenger,opponent,c_score,o_score,status,c_claimed,o_claimed&status=neq.declined&order=created_at.desc&limit=40'),
          api(`/rest/v1/listings?select=id&seller=eq.${me()}&status=eq.sold&seller_paid=eq.false`)
        ]);
        flags.duels = duels.filter(needsMe).length;
        flags.sales = sold.length;
      } catch (e) { /* badges are best-effort */ }
    }
    function status(type) {
      if (!configured) return 'soon';
      if (!sess) return type === 'account' ? 'new' : null;
      if (type === 'hiscores') return null;
      if (type === 'guild') return flags.guild ? null : 'new';
      if (type === 'duel') return flags.duels ? 'new' : null;
      if (type === 'market') return flags.sales ? 'new' : null;
      return null;
    }
    function info(type) {
      const box = (s) => `<div class="dlg-info">${s}</div>`;
      if (!configured) return box("🌐 Online play isn't switched on for this hospital yet. Your admin needs to add the server details to <code>config.js</code>.");
      if (!sess) return box(type === 'account' ? '🪪 Not signed in yet.' : '🪪 Sign in at the Badge Office (lobby) first.');
      if (type === 'account') return box(`Signed in as <b>${esc(sess.user.email || '')}</b>`);
      if (type === 'duel' && flags.duels) return box(`⚔️ ${flags.duels} duel${flags.duels > 1 ? 's need' : ' needs'} you.`);
      if (type === 'market' && flags.sales) return box(`💰 ${flags.sales} of your listings sold. Collect your coins.`);
      if ((type === 'guild' || type === 'raid') && !flags.guild) return box('🛡️ You are not in a guild yet.');
      if (type === 'raid') return box(`${bossOfWeek().emoji} This week: <b>${esc(bossOfWeek().name)}</b>`);
      return '';
    }

    // ---------- presence ----------
    const others = new Map();
    let onlineCount = 0;
    let lastPing = 0;
    let pinging = false;
    // Servers that haven't run supabase/add-floors.sql only have the two-argument ping; fall back to it once.
    let floorPing = true;
    let pingFloor = null;
    function worldTick(player, now, floor) {
      if (!signedIn() || pinging) return;
      if (floor !== pingFloor) { pingFloor = floor; others.clear(); lastPing = 0; }
      if (now - lastPing < 2500) return;
      lastPing = now;
      pinging = true;
      const args = { p_x: Math.round(player.x * 100) / 100, p_y: Math.round(player.y * 100) / 100 };
      const call = floorPing
        ? rpc('ping', { ...args, p_floor: floor || 1 }).catch((e) => {
          if (e.status !== 404) throw e;
          floorPing = false;
          return rpc('ping', args);
        })
        : rpc('ping', args);
      call
        .then((rows) => {
          const seen = new Set();
          (rows || []).forEach((r) => {
            if (typeof r.x !== 'number' || typeof r.y !== 'number') return;
            seen.add(r.id);
            const o = others.get(r.id);
            if (o) Object.assign(o, { tx: r.x, ty: r.y, name: r.name, avatar: r.avatar, level: r.level });
            else others.set(r.id, { id: r.id, name: r.name, avatar: r.avatar, level: r.level, x: r.x, y: r.y, tx: r.x, ty: r.y });
          });
          [...others.keys()].forEach((id) => { if (!seen.has(id)) others.delete(id); });
          onlineCount = others.size;
          hud();
        })
        .catch(() => { others.clear(); onlineCount = 0; hud(); })
        .finally(() => { pinging = false; });
    }
    function othersList() {
      const out = [];
      others.forEach((o) => {
        o.x += (o.tx - o.x) * 0.12;
        o.y += (o.ty - o.y) * 0.12;
        out.push(o);
      });
      return out;
    }
    function hud() {
      const b = document.getElementById('hudNet');
      if (!b) return;
      const dot = !configured ? '' : !sess ? '<i class="dot">!</i>' : onlineCount ? `<i class="dot on">${onlineCount}</i>` : '';
      b.innerHTML = `🌐${dot}`;
      b.setAttribute('aria-label', sess ? `Online play: ${onlineCount} other resident${onlineCount === 1 ? '' : 's'} nearby` : 'Online play');
    }

    // ---------- questions for raids and duels ----------
    const POOL = [];
    Object.keys(G.CONTENT).map(Number).sort((a, b) => a - b).forEach((day) => {
      G.CONTENT[day].stations.forEach((st) => {
        (st.nodes || []).forEach((n, i) => {
          if (!n.options || n.kind === 'calc') return;
          const right = n.options.find((o) => o.ok);
          if (!right) return;
          POOL.push({ id: `${day}:${st.id}:${i}`, ctx: n.info || (st.chart ? st.chart.hpi : ''), q: n.prompt, options: n.options.map((o) => ({ t: o.t, ok: !!o.ok })), fb: right.fb });
        });
        (st.items || []).forEach((it, i) => {
          if (it.kind !== 'mcq') return;
          POOL.push({ id: `${day}:${st.id}:m${i}`, ctx: '', q: it.q, options: it.options.map((o) => ({ t: o.t, ok: !!o.ok })), fb: it.a });
        });
      });
    });
    function mulberry32(a) {
      return () => {
        a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    function pickQs(n, rng) {
      const pool = POOL.slice();
      const out = [];
      while (out.length < n && pool.length) out.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
      return out;
    }
    function shuffleWith(arr, rng) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }
    window.EndoNetDebug = { pool: POOL };
    const QUIZ_MS = 20000;
    function runQuiz(v, { title, qs, rng, onDone }) {
      let i = 0;
      let score = 0;
      let correct = 0;
      let timer = 0;
      function step() {
        clearInterval(timer);
        if (!v.alive()) return;
        if (i >= qs.length) { onDone({ score, correct, total: qs.length }); return; }
        const q = qs[i];
        const opts = shuffleWith(q.options, rng);
        v.box.innerHTML = `<section class="card quiz">
          <div class="quiz-h"><span class="eyebrow">${esc(title)}</span><span class="muted small">Q${i + 1}/${qs.length} · ${score} pts</span></div>
          <div class="qtime"><i></i></div>
          ${q.ctx ? `<p class="muted small qctx">${q.ctx}</p>` : ''}
          <h3>${q.q}</h3>
          <div class="answers"></div>
          <div class="qfb"></div>
        </section>`;
        const answers = v.box.querySelector('.answers');
        const bar = v.box.querySelector('.qtime i');
        const t0 = performance.now();
        let done = false;
        const btns = opts.map((o, k) => {
          const b = el(`<button class="opt"><span class="letter">${'ABCDE'[k]}</span><span>${o.t}</span></button>`);
          b.onclick = () => answer(o, b);
          answers.appendChild(b);
          return b;
        });
        const left = () => Math.max(0, 1 - (performance.now() - t0) / QUIZ_MS);
        timer = setInterval(() => {
          if (!v.alive()) { clearInterval(timer); return; }
          bar.style.width = `${left() * 100}%`;
          if (left() <= 0) answer(null, null);
        }, 100);
        function answer(o, b) {
          if (done) return;
          done = true;
          clearInterval(timer);
          const rest = left();
          btns.forEach((x, k) => { x.disabled = true; if (opts[k].ok) x.classList.add('right'); });
          const ok = !!(o && o.ok);
          if (ok) { correct++; score += 100 + Math.round(50 * rest); G.buzz(15); } else { if (b) b.classList.add('wrong'); G.buzz([30, 40, 30]); }
          const fb = v.box.querySelector('.qfb');
          fb.innerHTML = `<div class="fb ${ok ? 'good' : 'bad'}"><b>${ok ? `✅ Correct · +${100 + Math.round(50 * rest)}` : o ? '❌ Not quite' : "⏰ Time's up"}</b>${q.fb ? `<div class="small">${q.fb}</div>` : ''}</div>`;
          const next = el(`<button class="btn primary big">${i + 1 < qs.length ? 'Next ▸' : 'Finish'}</button>`);
          next.onclick = () => { i++; step(); };
          fb.appendChild(next);
          next.focus();
        }
      }
      step();
    }

    // ---------- shared view bits ----------
    let viewSeq = 0;
    function shell(title, sub = '') {
      const id = ++viewSeq;
      G.app.innerHTML = `${BACK}<h1>${title}</h1>${sub}<div class="net"></div>`;
      const box = G.app.querySelector('.net');
      return { box, alive: () => box.isConnected && viewSeq === id };
    }
    const loading = '<section class="card"><p class="muted">Loading…</p></section>';
    function notConfigured() {
      return `<section class="card"><h3>Online play isn't set up yet</h3>
        <p>Everything offline still works. To turn on accounts, cloud sync, guilds, raids, duels, and the Trading Post, whoever hosts this game needs to:</p>
        <ol class="small">
          <li>Create a free project at <a href="https://supabase.com" target="_blank" rel="noopener">supabase.com</a>.</li>
          <li>Open <b>SQL Editor</b>, paste <code>supabase/schema.sql</code>, and run it.</li>
          <li>Under <b>Authentication → Sign In / Providers → Email</b>, turn off <b>Confirm email</b> (optional, but easier for a small group).</li>
          <li>Copy the <b>Project URL</b> and <b>anon public key</b> from <b>Project Settings → API</b> into <code>config.js</code>, then redeploy.</li>
        </ol></section>`;
    }
    function gate(v) {
      if (!configured) { v.box.innerHTML = notConfigured(); return false; }
      if (!sess) {
        v.box.innerHTML = '<section class="card"><p>Sign in at the Badge Office to play online with your intern class.</p><a class="btn primary" href="#/online">🪪 Go to the Badge Office</a></section>';
        return false;
      }
      return true;
    }
    function fail(v, e, retry) {
      if (!v.alive()) return;
      if (!sess) { gate(v); return; }
      v.box.innerHTML = `<section class="card"><p>⚠️ ${esc(e.message)}</p><button class="btn" data-retry>Try again</button></section>`;
      v.box.querySelector('[data-retry]').onclick = retry;
    }
    const drName = (p) => `Dr. ${esc(p ? p.name : 'Unknown')}`;
    const who = (p) => (p ? `<span class="who">${esc(p.avatar)} ${drName(p)}</span>` : '<span class="who muted">Former resident</span>');
    const isOnline = (p) => p && p.seen_at && Date.now() - Date.parse(p.seen_at) < 120000;
    function bossOfWeek() {
      const idx = Math.floor((Date.now() / 86400000 + 3) / 7) % D.raidBosses.length;
      return D.raidBosses[idx];
    }
    const bossEmoji = (name) => (D.raidBosses.find((b) => b.name === name) || { emoji: '👾' }).emoji;
    function addCoins(n) {
      if (n > 0) { S().rpg.coins += n; G.save(); G.renderHeader(); }
    }

    // ---------- Badge Office (account) ----------
    function viewOnline() {
      const v = shell('🪪 Badge Office');
      if (!configured) { v.box.innerHTML = notConfigured(); return; }
      if (!sess) return renderSignIn(v);
      const p = S().profile;
      v.box.innerHTML = `<section class="card">
          <h3>Your badge</h3>
          <p>Signed in as <b>${esc(sess.user.email || '')}</b></p>
          <p>Playing as ${esc(p.avatar)} <b>${drName(p)}</b> <span class="muted small">(change it in <a href="#/settings">Settings</a>)</span></p>
          <p class="small" data-sync>${syncText()}</p>
          <div class="row"><button class="btn primary" data-act="sync">☁️ Sync now</button><button class="btn ghost" data-act="out">Sign out</button></div>
        </section>
        <section class="card"><h3>Play together</h3>
          <div class="hub">
            <a class="hub-a" href="#/guild"><span>🛡️</span><b>Guild Hall</b><small>Guild chat and the weekly raid boss</small></a>
            <a class="hub-a" href="#/duels"><span>⚔️</span><b>Duel Arena</b><small>Five-question case duels${flags.duels ? ` · ${flags.duels} waiting` : ''}</small></a>
            <a class="hub-a" href="#/market"><span>🤝</span><b>Trading Post</b><small>Buy and sell with other residents</small></a>
            <a class="hub-a" href="#/hiscores"><span>🏆</span><b>Hiscores</b><small>Top XP, duel wins, raid damage, and guilds</small></a>
          </div>
          <p class="muted small">${onlineCount ? `${onlineCount} other resident${onlineCount === 1 ? ' is' : 's are'} walking the hospital right now.` : 'Other signed-in residents appear in the hospital as gold avatars.'}</p>
        </section>`;
      v.box.querySelector('[data-act="sync"]').onclick = async (e) => {
        e.target.disabled = true;
        try { await syncCheck(false); } catch (err) { setSync('err', err.message); }
        if (v.alive()) e.target.disabled = false;
      };
      v.box.querySelector('[data-act="out"]').onclick = () => G.showModal('<h2>Sign out?</h2><p>Your progress stays on this device. Sign in again any time to sync.</p>', [
        { label: 'Cancel', cls: 'btn ghost' },
        { label: 'Sign out', cls: 'btn primary', onClick: () => { signOut(); G.toast('Signed out'); viewOnline(); } }
      ]);
    }
    function renderSignIn(v) {
      v.box.innerHTML = `<section class="card">
        <h3>Sign in to play online</h3>
        <p class="muted small">An account syncs your progress across devices and lets you join a guild, raid, duel, and trade with your intern class.</p>
        <form class="net-form" novalidate>
          <label>Email<input type="email" name="email" autocomplete="email" required></label>
          <label>Password<input type="password" name="password" autocomplete="current-password" minlength="6" required></label>
          <div class="pf-err" aria-live="polite"></div>
          <div class="row"><button class="btn primary" type="submit" data-mode="in">Sign in</button><button class="btn" type="submit" data-mode="up">Create account</button></div>
        </form></section>`;
      const form = v.box.querySelector('form');
      const err = form.querySelector('.pf-err');
      let mode = 'in';
      form.querySelectorAll('[data-mode]').forEach((b) => { b.onclick = () => { mode = b.dataset.mode; }; });
      form.onsubmit = async (e) => {
        e.preventDefault();
        const email = form.elements.email.value.trim();
        const password = form.elements.password.value;
        err.textContent = '';
        if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Enter a valid email.'; return; }
        if (password.length < 6) { err.textContent = 'Passwords need at least 6 characters.'; return; }
        const btns = form.querySelectorAll('button');
        btns.forEach((b) => { b.disabled = true; });
        try {
          if (mode === 'up') {
            const ok = await signUp(email, password);
            if (!ok) {
              if (!v.alive()) return;
              v.box.innerHTML = '<section class="card"><h3>📧 Check your email</h3><p>Click the confirmation link we sent, then come back here and sign in.</p><button class="btn primary" data-act="back">Back to sign in</button></section>';
              v.box.querySelector('[data-act="back"]').onclick = () => renderSignIn(v);
              return;
            }
          } else {
            await signIn(email, password);
          }
          G.toast('🪪 Signed in', 'good');
          if (v.alive()) viewOnline();
        } catch (ex) {
          if (!v.alive()) return;
          err.textContent = ex.message;
          btns.forEach((b) => { b.disabled = false; });
        }
      };
    }

    // ---------- welcome screen: returning players restore their cloud save ----------
    // A new browser has no badge yet, so it can't reach the Badge Office. This card signs in
    // from the welcome screen and loads the account's saved progress directly.
    let noCloudFor = null;
    const authErrText = (msg) => {
      if (/invalid login credentials/i.test(msg)) return "That email and password don't match an account.";
      if (/email not confirmed/i.test(msg)) return 'Confirm your email first (check your inbox), then sign in.';
      return msg;
    };
    async function restoreFromCloud() {
      const rows = await api(`/rest/v1/saves?select=data,saved_at&id=eq.${me()}`);
      const cloud = rows && rows[0];
      let next = null;
      if (cloud) { try { next = G.parseSave(JSON.stringify(cloud.data)); } catch (e) { next = null; } }
      if (!next || !next.profile) { noCloudFor = me(); return 'none'; }
      if (S().profile) return 'skip';
      const load = () => {
        G.replaceState(next);
        G.toast(`☁️ Welcome back, ${drName(next.profile)}. Progress restored.`, 'good');
        afterSignIn(false).catch((e) => setSync('err', e.message));
      };
      const local = S();
      if (!(local.xp > 0 || Object.keys(local.days || {}).length)) { load(); return 'restored'; }
      G.showModal(`<div class="big-emoji">☁️</div><h2>Which progress should this device use?</h2>
        <p class="debrief"><b>Your account:</b> ${G.saveSummary(next)}<br><span class="muted small">saved ${esc(new Date(Date.parse(cloud.saved_at) || Date.now()).toLocaleString())}</span></p>
        <p class="debrief"><b>This device:</b> ${G.saveSummary(local)}</p>
        <p class="muted small">The one you don't pick is overwritten.</p>`, [
        { label: 'Keep this device', cls: 'btn' },
        { label: 'Use account progress', cls: 'btn primary', onClick: load }
      ]);
      return 'asked';
    }
    function renderWelcome(box, errMsg) {
      if (!configured || !box) return;
      if (sess) return welcomeSignedIn(box);
      box.innerHTML = `<p class="ob-si-lead"><b>🪪 Played before?</b> Sign in to pick up your saved progress on this device.</p>
        <div class="ob-si-body"><button class="btn primary" type="button" data-act="ob-show">Sign in</button></div>`;
      const body = box.querySelector('.ob-si-body');
      const showForm = () => {
        body.innerHTML = `<form class="net-form" novalidate>
            <label>Email<input type="email" name="email" autocomplete="email" required></label>
            <label>Password<input type="password" name="password" autocomplete="current-password" required></label>
            <div class="pf-err" aria-live="polite"></div>
            <button class="btn primary" type="submit">Sign in and restore progress</button>
          </form>`;
        const form = body.querySelector('form');
        const err = form.querySelector('.pf-err');
        const submit = form.querySelector('button');
        form.onsubmit = async (e) => {
          e.preventDefault();
          const email = form.elements.email.value.trim();
          const password = form.elements.password.value;
          err.textContent = '';
          if (!/^\S+@\S+\.\S+$/.test(email)) { err.textContent = 'Enter a valid email.'; return; }
          if (!password) { err.textContent = 'Enter your password.'; return; }
          submit.disabled = true;
          submit.textContent = 'Signing in…';
          try {
            const d = await raw('/auth/v1/token?grant_type=password', { method: 'POST', body: { email, password } });
            storeSess(toSess(d));
          } catch (ex) {
            if (!box.isConnected) return;
            err.textContent = authErrText(ex.message);
            submit.disabled = false;
            submit.textContent = 'Sign in and restore progress';
            return;
          }
          G.toast('🪪 Signed in', 'good');
          if (box.isConnected) welcomeSignedIn(box);
        };
        return form;
      };
      body.querySelector('[data-act="ob-show"]').onclick = () => showForm().elements.email.focus();
      if (errMsg) showForm().querySelector('.pf-err').textContent = errMsg;
    }
    function welcomeSignedIn(box) {
      box.innerHTML = `<p class="ob-si-lead">🪪 Signed in as <b>${esc(sess.user.email || '')}</b></p>
        <p class="small" data-ob-msg>Looking for your saved progress…</p>
        <div class="row"><button class="btn ghost" type="button" data-act="ob-out">Sign out</button></div>`;
      const msg = box.querySelector('[data-ob-msg]');
      box.querySelector('[data-act="ob-out"]').onclick = () => { signOut(); renderWelcome(box); };
      const none = () => { msg.textContent = 'No saved progress on this account yet. Set up your badge below, and it will save to your account from now on.'; };
      if (noCloudFor === me()) return none();
      restoreFromCloud().then((r) => {
        if (!box.isConnected) return;
        if (r === 'none') none();
        else if (r === 'asked') msg.textContent = "If you keep this device's progress, set up your badge below to continue.";
      }).catch((e) => {
        if (!box.isConnected) return;
        if (!sess) return renderWelcome(box, e.message);
        msg.innerHTML = `⚠️ ${esc(e.message)}`;
        const retry = G.el('<button class="btn" type="button">Try again</button>');
        retry.onclick = () => welcomeSignedIn(box);
        box.querySelector('.row').prepend(retry);
      });
    }

    // ---------- Guild Hall ----------
    const EMBLEMS = ['🛡️', '🦋', '🧬', '🩸', '🦉', '🔥', '⚡', '🌵', '🐙', '🫀'];
    async function viewGuild() {
      const v = shell('🛡️ Guild Hall');
      if (!gate(v)) return;
      v.box.innerHTML = loading;
      try {
        const g = await rpc('my_guild');
        if (!v.alive()) return;
        flags.guild = g ? g.id : null;
        if (!g) { renderNoGuild(v); return; }
        const [members, raid] = await Promise.all([
          api(`/rest/v1/players?select=id,name,avatar,level,xp,seen_at&guild_id=eq.${g.id}&order=xp.desc`),
          rpc('raid_current', { p_boss: bossOfWeek().name })
        ]);
        const [hits, claims, msgs] = await Promise.all([
          api(`/rest/v1/raid_hits?select=player_id,dmg,created_at&raid_id=eq.${raid.id}`),
          api(`/rest/v1/raid_claims?select=raid_id&raid_id=eq.${raid.id}`),
          api(`/rest/v1/guild_msgs?select=id,player_id,body,created_at&guild_id=eq.${g.id}&order=id.desc&limit=40`)
        ]);
        if (!v.alive()) return;
        renderGuild(v, g, members, raid, hits, claims.length > 0, msgs.reverse());
      } catch (e) { fail(v, e, viewGuild); }
    }
    function renderNoGuild(v) {
      v.box.innerHTML = `<section class="card">
          <h3>Join a guild</h3>
          <p class="muted small">Ask a guildmate for their 6-character invite code.</p>
          <form class="net-form" data-f="join" novalidate><label>Invite code<input name="code" maxlength="6" autocapitalize="characters" autocomplete="off" spellcheck="false" required></label>
          <div class="pf-err"></div><button class="btn primary">Join guild</button></form>
        </section>
        <section class="card">
          <h3>Start a guild</h3>
          <p class="muted small">Up to 30 residents. You'll get an invite code to share.</p>
          <form class="net-form" data-f="create" novalidate><label>Guild name<input name="name" maxlength="24" autocomplete="off" required></label>
          <div class="pf-label">Emblem</div>
          <div class="avatar-grid">${EMBLEMS.map((e, i) => `<button type="button" class="av ${i ? '' : 'sel'}" data-em="${e}">${e}</button>`).join('')}</div>
          <div class="pf-err"></div><button class="btn primary">Create guild</button></form>
        </section>`;
      const join = v.box.querySelector('[data-f="join"]');
      const create = v.box.querySelector('[data-f="create"]');
      let emblem = EMBLEMS[0];
      create.querySelectorAll('[data-em]').forEach((b) => {
        b.onclick = () => { emblem = b.dataset.em; create.querySelectorAll('[data-em]').forEach((x) => x.classList.toggle('sel', x === b)); };
      });
      const submit = (form, fn) => async (e) => {
        e.preventDefault();
        const err = form.querySelector('.pf-err');
        const btn = form.querySelector('button:not([type=button])');
        err.textContent = '';
        btn.disabled = true;
        try {
          const g = await fn();
          G.toast(`${esc(g.emblem)} Welcome to ${esc(g.name)}!`, 'good');
          if (v.alive()) viewGuild();
        } catch (ex) {
          err.textContent = ex.message;
          btn.disabled = false;
        }
      };
      join.onsubmit = submit(join, () => {
        const code = join.elements.code.value.trim().toUpperCase();
        if (code.length !== 6) throw new Error('Codes are 6 characters.');
        return rpc('join_guild', { p_code: code });
      });
      create.onsubmit = submit(create, () => {
        const name = create.elements.name.value.replace(/\s+/g, ' ').trim();
        if (name.length < 2) throw new Error('Pick a name with at least 2 characters.');
        return rpc('create_guild', { p_name: name, p_emblem: emblem });
      });
    }
    function renderGuild(v, g, members, raid, hits, claimed, msgs) {
      const byId = Object.fromEntries(members.map((m) => [m.id, m]));
      const mineToday = hits.filter((h) => h.player_id === me() && Date.now() - Date.parse(h.created_at) < 20 * 3600000).length;
      const iHit = hits.some((h) => h.player_id === me());
      const dmgBy = {};
      hits.forEach((h) => { dmgBy[h.player_id] = (dmgBy[h.player_id] || 0) + h.dmg; });
      const board = Object.entries(dmgBy).sort((a, b) => b[1] - a[1]);
      const hpPct = Math.max(0, (raid.hp / raid.max_hp) * 100);
      const dead = raid.hp <= 0;
      const reward = D.raidReward;
      const rewardText = `🪙 ${reward.coins} · ${Object.entries(reward.mats).map(([k, n]) => `${D.materials[k].icon} ${n}`).join(' · ')}`;
      let raidAction;
      if (!dead) raidAction = `<button class="btn primary big" data-act="attack" ${mineToday >= 3 ? 'disabled' : ''}>⚔️ Attack (5 questions)</button><p class="muted small">Attacks left today: ${3 - mineToday} of 3. Each correct answer hits for ${perHit()} damage.</p>`;
      else if (claimed) raidAction = '<p class="owned">Loot claimed ✓</p>';
      else if (iHit) raidAction = `<button class="btn primary big" data-act="claim">🎁 Claim loot (${rewardText})</button>`;
      else raidAction = '<p class="muted">The guild beat it without you this week. Join next week\'s fight to share the loot.</p>';

      v.box.innerHTML = `<section class="card guild-head">
          <span class="g-em">${esc(g.emblem)}</span>
          <div><h3>${esc(g.name)}</h3><div class="muted small">${members.length}/30 members</div></div>
          <button class="btn sm" data-act="code" title="Copy invite code">Invite: <b>${esc(g.code)}</b></button>
        </section>
        <section class="card raid ${dead ? 'dead' : ''}">
          <div class="eyebrow">Weekly raid boss</div>
          <div class="raid-boss"><span class="raid-em">${bossEmoji(raid.boss)}</span><div><h3>${esc(raid.boss)}</h3><div class="muted small">${dead ? '💀 Defeated' : `${raid.hp} / ${raid.max_hp} HP`}</div></div></div>
          <div class="hpbar"><div style="width:${hpPct}%"></div></div>
          ${raidAction}
          ${board.length ? `<div class="pf-label">Damage dealt</div><ol class="board">${board.map(([id, d]) => `<li>${who(byId[id])}<b>${d}</b></li>`).join('')}</ol>` : '<p class="muted small">No one has attacked yet. Be first.</p>'}
          <p class="muted small">Loot for everyone who fought: ${rewardText}. A new boss arrives every Monday.</p>
        </section>
        <section class="card"><h3>Roster</h3>
          <div class="roster">${members.map((m) => `<div class="mem"><span class="odot ${isOnline(m) ? 'on' : ''}"></span>${who(m)}<span class="muted small">Lv ${m.level} · ${m.xp} XP${m.id === g.owner ? ' · 👑' : ''}</span></div>`).join('')}</div>
        </section>
        <section class="card"><h3>Guild chat</h3>
          <div class="chat" aria-live="polite"></div>
          <form class="chat-form"><input name="body" maxlength="300" placeholder="Message your guild" autocomplete="off"><button class="btn primary sm">Send</button></form>
        </section>
        <button class="btn ghost" data-act="leave">Leave guild</button>`;

      const chat = v.box.querySelector('.chat');
      let lastId = 0;
      const addMsgs = (list) => {
        list.forEach((m) => {
          if (m.id <= lastId) return;
          lastId = m.id;
          const p = byId[m.player_id];
          chat.appendChild(el(`<div class="msg ${m.player_id === me() ? 'mine' : ''}"><b>${p ? `${esc(p.avatar)} ${drName(p)}` : 'Former resident'}</b><span>${esc(m.body)}</span><small class="muted">${esc(new Date(m.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }))}</small></div>`));
        });
        chat.scrollTop = chat.scrollHeight;
        if (!chat.children.length) chat.innerHTML = '<p class="muted small">No messages yet. Say hi.</p>';
      };
      addMsgs(msgs);
      const poll = async () => {
        if (!v.alive()) return;
        try {
          const fresh = await api(`/rest/v1/guild_msgs?select=id,player_id,body,created_at&guild_id=eq.${g.id}&id=gt.${lastId}&order=id.asc&limit=40`);
          if (fresh.length && chat.querySelector('p.muted')) chat.innerHTML = '';
          if (v.alive()) addMsgs(fresh);
        } catch (e) { /* retry next tick */ }
        if (v.alive()) setTimeout(poll, 6000);
      };
      setTimeout(poll, 6000);
      const chatForm = v.box.querySelector('.chat-form');
      const chatInput = chatForm.elements.body;
      chatForm.onsubmit = async (e) => {
        e.preventDefault();
        const body = chatInput.value.trim();
        if (!body) return;
        chatInput.value = '';
        try {
          await api('/rest/v1/guild_msgs', { method: 'POST', body: { guild_id: g.id, player_id: me(), body }, prefer: 'return=minimal' });
          const fresh = await api(`/rest/v1/guild_msgs?select=id,player_id,body,created_at&guild_id=eq.${g.id}&id=gt.${lastId}&order=id.asc&limit=40`);
          if (chat.querySelector('p.muted')) chat.innerHTML = '';
          addMsgs(fresh);
        } catch (ex) {
          chatInput.value = body;
          G.toast(esc(ex.message), 'bad');
        }
      };
      v.box.querySelector('[data-act="code"]').onclick = () => {
        const text = g.code;
        (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject())
          .then(() => G.toast('Invite code copied ✓', 'good'))
          .catch(() => G.toast(`Invite code: ${esc(text)}`));
      };
      v.box.querySelector('[data-act="leave"]').onclick = () => G.showModal(`<h2>Leave ${esc(g.name)}?</h2><p>You can rejoin later with the invite code.</p>`, [
        { label: 'Stay', cls: 'btn ghost' },
        { label: 'Leave', cls: 'btn danger', onClick: async () => {
          try { await rpc('leave_guild'); flags.guild = null; G.toast('You left the guild'); } catch (e) { G.toast(esc(e.message), 'bad'); }
          viewGuild();
        } }
      ]);
      const attack = v.box.querySelector('[data-act="attack"]');
      if (attack) attack.onclick = () => startRaid(raid);
      const claim = v.box.querySelector('[data-act="claim"]');
      if (claim) {
        claim.onclick = async () => {
          claim.disabled = true;
          try {
            const coins = await rpc('raid_claim', { p_raid: raid.id });
            if (coins > 0) {
              const r = S().rpg;
              Object.entries(reward.mats).forEach(([k, n]) => { r.mats[k] = (r.mats[k] || 0) + n; });
              addCoins(coins);
              G.toast(`🎁 Raid loot: +${coins} 🪙 and materials`, 'good');
            } else G.toast('Already claimed');
          } catch (e) { G.toast(esc(e.message), 'bad'); }
          viewGuild();
        };
      }
    }
    const perHit = () => Math.min(24, 10 + G.RPG.levelFor(S().xp));
    function startRaid(raid) {
      const v = shell(`${bossEmoji(raid.boss)} ${esc(raid.boss)}`);
      runQuiz(v, {
        title: 'Raid attack',
        qs: pickQs(5, Math.random),
        rng: Math.random,
        onDone: async ({ correct, total }) => {
          const per = perHit();
          const dmg = correct * per;
          v.box.innerHTML = '<section class="card"><p class="muted">Striking…</p></section>';
          try {
            const hp = await rpc('raid_hit', { p_raid: raid.id, p_dmg: dmg });
            const coins = correct * 3;
            addCoins(coins);
            if (!v.alive()) return;
            v.box.innerHTML = `<section class="card center">
              <div class="big-emoji">${hp <= 0 ? '💀' : '💥'}</div>
              <h2>${dmg} damage</h2>
              <p>${correct}/${total} correct × ${per} per hit${coins ? ` · +${coins} 🪙` : ''}</p>
              <p class="muted">${hp <= 0 ? `${esc(raid.boss)} is down! Claim your loot in the Guild Hall.` : `${esc(raid.boss)} has ${hp} HP left.`}</p>
              <a class="btn primary big" href="#/guild">Back to the Guild Hall</a>
            </section>`;
          } catch (e) { fail(v, e, viewGuild); }
        }
      });
    }

    // ---------- Duel Arena ----------
    async function viewDuels() {
      const v = shell('⚔️ Duel Arena', '<p class="muted">Five questions, 20 seconds each, same questions for both of you. Faster correct answers score more.</p>');
      if (!gate(v)) return;
      v.box.innerHTML = loading;
      try {
        const [players, duels] = await Promise.all([
          api('/rest/v1/players?select=id,name,avatar,level,xp,seen_at&order=seen_at.desc.nullslast&limit=100'),
          api('/rest/v1/duels?select=*&order=created_at.desc&limit=40')
        ]);
        if (!v.alive()) return;
        flags.duels = duels.filter(needsMe).length;
        renderDuels(v, players, duels);
      } catch (e) { fail(v, e, viewDuels); }
    }
    function renderDuels(v, players, duels) {
      const byId = Object.fromEntries(players.map((p) => [p.id, p]));
      const rival = (d) => byId[d.challenger === me() ? d.opponent : d.challenger];
      const mine = (d) => (d.challenger === me() ? d.c_score : d.o_score);
      const theirs = (d) => (d.challenger === me() ? d.o_score : d.c_score);
      const claimedBy = (d) => (d.challenger === me() ? d.c_claimed : d.o_claimed);
      const myTurn = duels.filter((d) => d.status === 'pending' && mine(d) == null);
      const waiting = duels.filter((d) => d.status === 'pending' && mine(d) != null);
      const done = duels.filter((d) => d.status === 'done').slice(0, 12);
      const R = D.duelReward;
      const resultOf = (d) => (mine(d) > theirs(d) ? ['Won', 'good', R.win] : mine(d) === theirs(d) ? ['Tie', '', R.tie] : ['Lost', 'bad', R.loss]);
      const rivals = players.filter((p) => p.id !== me());
      v.box.innerHTML = `
        ${myTurn.length ? `<section class="card"><h3>Your turn</h3>${myTurn.map((d) => `<div class="duel-row">${who(rival(d))}
          <span class="muted small">${d.challenger === me() ? 'You challenged them' : 'Challenged you'}</span>
          <span class="duel-btns">${d.opponent === me() ? `<button class="btn ghost sm" data-decline="${d.id}">Decline</button>` : ''}<button class="btn primary sm" data-play="${d.id}">Play ▸</button></span></div>`).join('')}</section>` : ''}
        ${done.length ? `<section class="card"><h3>Results</h3>${done.map((d) => {
          const [label, cls, coins] = resultOf(d);
          return `<div class="duel-row">${who(rival(d))}<span class="score ${cls}">${label} · ${mine(d)}–${theirs(d)}</span>
            <span class="duel-btns">${claimedBy(d) ? '<span class="muted small">Claimed</span>' : `<button class="btn primary sm" data-claim="${d.id}">+${coins} 🪙</button>`}</span></div>`;
        }).join('')}</section>` : ''}
        ${waiting.length ? `<section class="card"><h3>Waiting on them</h3>${waiting.map((d) => `<div class="duel-row">${who(rival(d))}<span class="muted small">You scored ${mine(d)}</span></div>`).join('')}</section>` : ''}
        <section class="card"><h3>Challenge a resident</h3>
          ${rivals.length ? rivals.map((p) => `<div class="duel-row"><span class="odot ${isOnline(p) ? 'on' : ''}"></span>${who(p)}<span class="muted small">Lv ${p.level}</span>
            <span class="duel-btns"><button class="btn sm" data-challenge="${p.id}">⚔️ Challenge</button></span></div>`).join('')
            : '<p class="muted">No other residents have signed in yet. Share the game link with your intern class.</p>'}
          <p class="muted small">Win ${R.win} 🪙 · tie ${R.tie} 🪙 · lose ${R.loss} 🪙 (for showing up).</p>
        </section>`;
      v.box.querySelectorAll('[data-play]').forEach((b) => {
        b.onclick = () => { const d = duels.find((x) => x.id === b.dataset.play); playDuel(d, rival(d)); };
      });
      v.box.querySelectorAll('[data-decline]').forEach((b) => {
        b.onclick = async () => {
          b.disabled = true;
          try { await rpc('duel_decline', { p_id: b.dataset.decline }); } catch (e) { G.toast(esc(e.message), 'bad'); }
          viewDuels();
        };
      });
      v.box.querySelectorAll('[data-claim]').forEach((b) => {
        b.onclick = async () => {
          b.disabled = true;
          try {
            const coins = await rpc('duel_claim', { p_id: b.dataset.claim });
            addCoins(coins);
            if (coins) G.toast(`+${coins} 🪙`, 'good');
          } catch (e) { G.toast(esc(e.message), 'bad'); }
          viewDuels();
        };
      });
      v.box.querySelectorAll('[data-challenge]').forEach((b) => {
        b.onclick = async () => {
          b.disabled = true;
          try {
            const d = await rpc('duel_create', { p_opponent: b.dataset.challenge });
            playDuel({ id: d.id, seed: d.seed, challenger: me(), opponent: b.dataset.challenge }, byId[b.dataset.challenge]);
          } catch (e) { G.toast(esc(e.message), 'bad'); b.disabled = false; }
        };
      });
    }
    function playDuel(d, rival) {
      const v = shell('⚔️ Duel', `<p class="muted">vs ${who(rival)}</p>`);
      const rng = mulberry32(d.seed);
      runQuiz(v, {
        title: 'Case duel',
        qs: pickQs(5, rng),
        rng,
        onDone: async ({ score, correct, total }) => {
          v.box.innerHTML = '<section class="card"><p class="muted">Submitting your score…</p></section>';
          try {
            const res = await rpc('duel_submit', { p_id: d.id, p_score: score });
            if (!v.alive()) return;
            const mine = res.challenger === me() ? res.c_score : res.o_score;
            const theirs = res.challenger === me() ? res.o_score : res.c_score;
            const verdict = res.status !== 'done' ? `Waiting for ${drName(rival)} to play. You'll see the result in the Arena.`
              : mine > theirs ? `🏆 You won, ${mine}–${theirs}!` : mine === theirs ? `🤝 Tie, ${mine}–${theirs}.` : `They took it, ${theirs}–${mine}. Rematch?`;
            v.box.innerHTML = `<section class="card center"><div class="big-emoji">⚔️</div><h2>${score} points</h2>
              <p>${correct}/${total} correct</p><p>${verdict}</p>
              <a class="btn primary big" href="#/duels">Back to the Arena</a></section>`;
          } catch (e) { fail(v, e, viewDuels); }
        }
      });
    }

    // ---------- Trading Post ----------
    let marketTab = 'buy';
    const goods = (kind, id) => {
      const src = kind === 'mat' ? D.materials : kind === 'cons' ? D.consumables : kind === 'item' ? D.items : null;
      return src && Object.prototype.hasOwnProperty.call(src, id) ? src[id] : null;
    };
    function moveGoods(kind, id, qty, sign) {
      const r = S().rpg;
      if (kind === 'item') { if (sign > 0) r.items[id] = 1; else delete r.items[id]; return; }
      const bag = kind === 'mat' ? r.mats : r.cons;
      bag[id] = Math.max(0, (bag[id] || 0) + sign * qty);
      if (!bag[id]) delete bag[id];
    }
    function sellables() {
      const r = S().rpg;
      const equipped = Object.values(r.equip);
      const out = [];
      Object.entries(r.mats).forEach(([k, n]) => { if (n > 0) out.push({ kind: 'mat', id: k, have: n }); });
      Object.entries(r.cons).forEach(([k, n]) => { if (n > 0) out.push({ kind: 'cons', id: k, have: n }); });
      Object.keys(r.items).forEach((k) => { if (k !== 'coat_short' && !equipped.includes(k)) out.push({ kind: 'item', id: k, have: 1 }); });
      return out;
    }
    const goodsLabel = (l, sub) => {
      const g = goods(l.kind, l.item);
      const name = g ? `<b ${g.rarity ? `style="color:${D.rarity[g.rarity]}"` : ''}>${esc(g.name)}</b>${l.qty > 1 ? ` × ${l.qty}` : ''}` : '<b class="muted">Unknown item</b>';
      return `<span class="item-ic">${g ? g.icon : '❔'}</span><div class="shop-b">${name}<div class="muted small">${sub}</div></div>`;
    };
    async function viewMarket() {
      const v = shell('🤝 Trading Post');
      if (!gate(v)) return;
      v.box.innerHTML = loading;
      try {
        const paid = await rpc('market_collect');
        if (paid > 0) { addCoins(paid); G.toast(`💰 Your sales paid out: +${paid} 🪙`, 'good'); }
        flags.sales = 0;
        const rows = await api(`/rest/v1/listings?select=id,seller,kind,item,qty,price,status,created_at,seller_p:players!listings_seller_fkey(name,avatar)&or=(status.eq.open,seller.eq.${me()})&order=created_at.desc&limit=80`);
        if (!v.alive()) return;
        renderMarket(v, rows);
      } catch (e) { fail(v, e, viewMarket); }
    }
    function renderMarket(v, rows) {
      const r = S().rpg;
      const forSale = rows.filter((l) => l.status === 'open' && l.seller !== me());
      const mine = rows.filter((l) => l.seller === me() && l.status !== 'cancelled').slice(0, 25);
      const tabs = [['buy', `Buy (${forSale.length})`], ['sell', 'Sell'], ['mine', 'My listings']];
      let body = '';
      if (marketTab === 'buy') {
        body = forSale.length ? forSale.map((l) => {
          const g = goods(l.kind, l.item);
          const owned = l.kind === 'item' && r.items[l.item];
          const can = g && !owned && r.coins >= l.price;
          return `<div class="shop-row">${goodsLabel(l, `from ${who(l.seller_p)}`)}
            ${owned ? '<span class="owned">Owned</span>' : `<button class="btn sm ${can ? 'primary' : ''}" data-buy="${l.id}" ${can ? '' : 'disabled'}>🪙 ${l.price}</button>`}</div>`;
        }).join('') : '<p class="muted">Nothing for sale right now. List something of your own.</p>';
      } else if (marketTab === 'sell') {
        const list = sellables();
        body = list.length ? `<form class="net-form sell" novalidate>
            <label>Item<select name="g">${list.map((s) => {
              const g = goods(s.kind, s.id);
              return `<option value="${s.kind}:${s.id}" data-have="${s.have}">${g.icon} ${esc(g.name)} (have ${s.have})</option>`;
            }).join('')}</select></label>
            <div class="row2"><label>Quantity<input type="number" name="qty" min="1" value="1" inputmode="numeric"></label>
            <label>Price (🪙 total)<input type="number" name="price" min="1" max="100000" value="20" inputmode="numeric"></label></div>
            <div class="pf-err"></div>
            <button class="btn primary">List for sale</button>
            <p class="muted small">Listed goods leave your bag until they sell or you cancel. Unequip gear in your 🎒 bag to sell it.</p>
          </form>` : '<p class="muted">You have nothing to sell yet. Clear cases for materials, or buy and craft gear.</p>';
      } else {
        body = mine.length ? mine.map((l) => `<div class="shop-row">${goodsLabel(l, l.status === 'open' ? `Listed for 🪙 ${l.price}` : `Sold for 🪙 ${l.price}`)}
          ${l.status === 'open' ? `<button class="btn ghost sm" data-cancel="${l.id}">Cancel</button>` : '<span class="owned">Sold ✓</span>'}</div>`).join('')
          : '<p class="muted">You have no listings.</p>';
      }
      v.box.innerHTML = `<div class="coins-bar">🪙 <b>${r.coins}</b> coins</div>
        <div class="tabs" role="tablist">${tabs.map(([k, label]) => `<button class="tab ${k === marketTab ? 'on' : ''}" role="tab" aria-selected="${k === marketTab}" data-tab="${k}">${label}</button>`).join('')}</div>
        <section class="card">${body}</section>`;
      v.box.querySelectorAll('[data-tab]').forEach((b) => { b.onclick = () => { marketTab = b.dataset.tab; renderMarket(v, rows); }; });
      v.box.querySelectorAll('[data-buy]').forEach((b) => {
        b.onclick = async () => {
          const l = rows.find((x) => x.id === b.dataset.buy);
          if (S().rpg.coins < l.price) return G.toast('Not enough coins', 'bad');
          b.disabled = true;
          try {
            const got = await rpc('market_buy', { p_id: l.id });
            S().rpg.coins -= got.price;
            moveGoods(got.kind, got.item, got.qty, 1);
            G.save();
            G.renderHeader();
            G.toast(`Bought ${esc(goods(got.kind, got.item).name)}`, 'good');
          } catch (e) { G.toast(esc(e.message), 'bad'); }
          viewMarket();
        };
      });
      v.box.querySelectorAll('[data-cancel]').forEach((b) => {
        b.onclick = async () => {
          b.disabled = true;
          try {
            const l = await rpc('market_cancel', { p_id: b.dataset.cancel });
            moveGoods(l.kind, l.item, l.qty, 1);
            G.save();
            G.toast('Listing cancelled. The goods are back in your bag.');
          } catch (e) { G.toast(esc(e.message), 'bad'); }
          viewMarket();
        };
      });
      const sell = v.box.querySelector('form.sell');
      if (sell) {
        const f = sell.elements;
        const qty = f.qty;
        const syncQty = () => {
          const opt = f.g.selectedOptions[0];
          qty.max = opt.dataset.have;
          qty.disabled = opt.value.startsWith('item:');
          if (qty.disabled) qty.value = 1;
        };
        f.g.onchange = syncQty;
        syncQty();
        sell.onsubmit = async (e) => {
          e.preventDefault();
          const err = sell.querySelector('.pf-err');
          const [kind, id] = f.g.value.split(':');
          const have = sellables().find((s) => s.kind === kind && s.id === id);
          const n = Math.floor(Number(qty.value));
          const price = Math.floor(Number(f.price.value));
          err.textContent = '';
          if (!have) { err.textContent = 'You no longer have that.'; return; }
          if (!(n >= 1 && n <= have.have)) { err.textContent = `Quantity must be 1–${have.have}.`; return; }
          if (!(price >= 1 && price <= 100000)) { err.textContent = 'Set a price from 1 to 100,000 coins.'; return; }
          const btn = sell.querySelector('button');
          btn.disabled = true;
          try {
            await rpc('market_list', { p_kind: kind, p_item: id, p_qty: n, p_price: price });
            moveGoods(kind, id, n, -1);
            G.save();
            G.toast('Listed on the Trading Post ✓', 'good');
            marketTab = 'mine';
            viewMarket();
          } catch (ex) {
            err.textContent = ex.message;
            btn.disabled = false;
          }
        };
      }
    }

    // ---------- Hiscores ----------
    let hsTab = 'xp';
    const HS_TABS = [
      ['xp', '⭐ XP', (p) => p.xp, (p) => `Lv ${p.level} · ${p.xp} XP`],
      ['duels', '⚔️ Duels', (p) => p.duel_wins, (p) => `${p.duel_wins} win${p.duel_wins === 1 ? '' : 's'}`],
      ['raids', '👾 Raids', (p) => p.raid_dmg, (p) => `${p.raid_dmg} dmg`],
      ['guilds', '🛡️ Guilds', null, null]
    ];
    const medal = (i) => ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;
    function personalCard() {
      const s = S();
      const info = G.RPG.levelInfo(s.xp);
      const days = Object.values(s.days).filter((d) => d.completed).length;
      return `<section class="card hs-me"><span class="hs-av">${esc(s.profile.avatar)}</span>
        <div><b>${drName(s.profile)}</b><div class="muted small">Lv ${info.level} ${esc(info.title)} · ${s.xp} XP · ${days} day${days === 1 ? '' : 's'} complete · 🪙 ${s.rpg.coins}</div></div></section>`;
    }
    async function viewHiscores() {
      const v = shell('🏆 Hiscores');
      if (!configured || !sess) {
        v.box.innerHTML = personalCard();
        const g = el('<div></div>');
        v.box.appendChild(g);
        gate({ box: g, alive: v.alive });
        return;
      }
      v.box.innerHTML = personalCard() + loading;
      try {
        const rows = await rpc('hiscores');
        if (!v.alive()) return;
        renderHiscores(v, rows || []);
      } catch (e) {
        if (/hiscores/.test(e.message)) e.message = 'The hiscores board needs one more database step: run supabase/add-hiscores.sql in the Supabase SQL Editor.';
        fail(v, e, viewHiscores);
      }
    }
    function renderHiscores(v, rows) {
      const tab = HS_TABS.find((t) => t[0] === hsTab);
      let list;
      if (hsTab === 'guilds') {
        const by = {};
        rows.forEach((p) => {
          if (!p.guild) return;
          const g = by[p.guild] || (by[p.guild] = { name: p.guild, emblem: p.emblem, xp: 0, members: 0, raid: 0, mine: false });
          g.xp += p.xp;
          g.members++;
          g.raid += p.raid_dmg;
          if (p.id === me()) g.mine = true;
        });
        const gs = Object.values(by).sort((a, b) => b.xp - a.xp);
        list = gs.length ? gs.map((g, i) => `<div class="hs-row ${g.mine ? 'mine' : ''}"><span class="hs-rank">${medal(i)}</span>
            <span class="who">${esc(g.emblem || '🛡️')} ${esc(g.name)}</span>
            <span class="hs-val">${g.xp} XP<small class="muted">${g.members} member${g.members === 1 ? '' : 's'} · ${g.raid} raid dmg</small></span></div>`).join('')
          : '<p class="muted">No guilds yet. Start one in the Guild Hall.</p>';
      } else {
        const sorted = rows.slice().sort((a, b) => tab[2](b) - tab[2](a) || b.xp - a.xp);
        const ranked = hsTab === 'xp' ? sorted : sorted.filter((p) => tab[2](p) > 0);
        list = ranked.length ? ranked.map((p, i) => `<div class="hs-row ${p.id === me() ? 'mine' : ''}"><span class="hs-rank">${medal(i)}</span>
            ${who(p)}${p.guild ? `<span class="muted small hs-g">${esc(p.emblem || '')} ${esc(p.guild)}</span>` : ''}
            <span class="hs-val">${tab[3](p)}</span></div>`).join('')
          : `<p class="muted">${hsTab === 'duels' ? 'No duels won yet. Head to the Duel Arena.' : 'No raid damage yet. Attack your guild\'s boss.'}</p>`;
      }
      const myRank = hsTab === 'guilds' ? -1 : rows.slice().sort((a, b) => tab[2](b) - tab[2](a) || b.xp - a.xp).findIndex((p) => p.id === me());
      v.box.innerHTML = `${personalCard()}
        <div class="tabs" role="tablist">${HS_TABS.map(([k, label]) => `<button class="tab ${k === hsTab ? 'on' : ''}" role="tab" aria-selected="${k === hsTab}" data-hs="${k}">${label}</button>`).join('')}</div>
        <section class="card">${myRank >= 0 && tab[2](rows.find((p) => p.id === me())) > 0 ? `<p class="small">You're <b>${medal(myRank)}</b> of ${rows.length}.</p>` : ''}${list}</section>`;
      v.box.querySelectorAll('[data-hs]').forEach((b) => { b.onclick = () => { hsTab = b.dataset.hs; renderHiscores(v, rows); }; });
    }

    // ---------- start-up ----------
    if (signedIn()) {
      afterSignIn(false).catch((e) => setSync('err', e.message));
    }
    setInterval(refreshFlags, 60000);

    return {
      configured,
      signedIn,
      onSaved,
      status,
      info,
      worldTick,
      others: othersList,
      hud,
      statusLine: syncText,
      renderWelcome,
      profileCreated,
      views: { online: viewOnline, guild: viewGuild, duels: viewDuels, market: viewMarket, hiscores: viewHiscores }
    };
  }
};
