// In-memory stand-in for Supabase (auth + PostgREST + the RPCs in supabase/schema.sql),
// so online features can be exercised without a real project. Loaded by tools/netmock.html.
(() => {
  const ORIGIN = 'https://mock.supabase.test';
  window.ENDO_ONLINE = { url: ORIGIN, anonKey: 'mock-anon-key-0123456789abcdef' };
  const STORE = 'endoNetMock.db';
  const RIVAL = '00000000-0000-4000-8000-000000000002';
  const iso = (t = Date.now()) => new Date(t).toISOString();
  const uuid = () => crypto.randomUUID();

  function seed() {
    const g = { id: uuid(), name: 'Night Float', emblem: '🦉', code: 'NIGHT1', owner: RIVAL, created_at: iso() };
    return {
      users: [{ id: RIVAL, email: 'rivera@test.dev', password: 'secret1' }],
      players: [{ id: RIVAL, name: 'Rivera', avatar: '🩺', level: 4, xp: 400, guild_id: g.id, x: 16.5, y: 20.5, seen_at: iso(), created_at: iso() }],
      saves: [],
      guilds: [g],
      guild_msgs: [{ id: 1, guild_id: g.id, player_id: RIVAL, body: 'Raid tonight after sign-out?', created_at: iso() }],
      raids: [], raid_hits: [], raid_claims: [], duels: [],
      listings: [{ id: uuid(), seller: RIVAL, kind: 'cons', item: 'coffee', qty: 2, price: 15, status: 'open', buyer: null, seller_paid: false, created_at: iso(), sold_at: null }],
      seq: 2
    };
  }
  let db = null;
  try { db = JSON.parse(localStorage.getItem(STORE)); } catch (e) { db = null; }
  if (!db) db = seed();
  const persist = () => localStorage.setItem(STORE, JSON.stringify(db));
  const calls = [];
  window.EndoNetMock = { db: () => db, reset() { db = seed(); persist(); }, RIVAL, calls };

  const fail = (msg, status = 400) => { const e = new Error(msg); e.status = status; throw e; };
  const player = (id) => db.players.find((p) => p.id === id);
  const guildOf = (uid) => (player(uid) || {}).guild_id || null;
  const weekStart = () => { const d = new Date(); const day = (d.getUTCDay() + 6) % 7; d.setUTCHours(0, 0, 0, 0); d.setUTCDate(d.getUTCDate() - day); return d.toISOString().slice(0, 10); };
  const pubGuild = (g) => ({ id: g.id, name: g.name, emblem: g.emblem, code: g.code, owner: g.owner });

  // ---------- PostgREST-ish query helpers ----------
  function test(row, col, expr) {
    const v = row[col];
    if (expr === 'is.null') return v == null;
    if (expr === 'not.is.null') return v != null;
    const [op, ...rest] = expr.split('.');
    const val = rest.join('.');
    const sv = v == null ? null : String(v);
    if (op === 'eq') return sv === val;
    if (op === 'neq') return sv !== val;
    if (op === 'gt') return typeof v === 'number' ? v > Number(val) : sv > val;
    return true;
  }
  function query(rows, params) {
    let out = rows.slice();
    params.forEach((val, key) => {
      if (['select', 'order', 'limit', 'on_conflict'].includes(key)) return;
      if (key === 'or') {
        const parts = val.replace(/^\(|\)$/g, '').split(',');
        out = out.filter((r) => parts.some((p) => { const [c, ...e] = p.split('.'); return test(r, c, e.join('.')); }));
        return;
      }
      out = out.filter((r) => test(r, key, val));
    });
    const order = params.get('order');
    if (order) {
      const [col, dir = 'asc'] = order.split('.');
      out.sort((a, b) => {
        const x = a[col]; const y = b[col];
        if (x == null && y == null) return 0;
        if (x == null) return 1;
        if (y == null) return -1;
        return (x > y ? 1 : x < y ? -1 : 0) * (dir === 'desc' ? -1 : 1);
      });
    }
    const limit = Number(params.get('limit'));
    if (limit) out = out.slice(0, limit);
    const sel = params.get('select') || '*';
    if (sel.includes('seller_p:')) out = out.map((r) => { const p = player(r.seller); return { ...r, seller_p: p ? { name: p.name, avatar: p.avatar } : null }; });
    return out.map((r) => ({ ...r }));
  }
  const visible = {
    players: () => db.players,
    saves: (uid) => db.saves.filter((s) => s.id === uid),
    guild_msgs: (uid) => db.guild_msgs.filter((m) => m.guild_id === guildOf(uid)),
    raids: (uid) => db.raids.filter((r) => r.guild_id === guildOf(uid)),
    raid_hits: (uid) => db.raid_hits.filter((h) => db.raids.some((r) => r.id === h.raid_id && r.guild_id === guildOf(uid))),
    raid_claims: (uid) => db.raid_claims.filter((c) => c.player_id === uid),
    duels: (uid) => db.duels.filter((d) => d.challenger === uid || d.opponent === uid),
    listings: () => db.listings
  };

  // ---------- RPCs ----------
  const rpcs = {
    ping(uid, a) {
      const me = player(uid);
      const floor = a.p_floor || 1;
      Object.assign(me, { x: a.p_x, y: a.p_y, floor, seen_at: iso() });
      const rival = player(RIVAL);
      rival.seen_at = iso();
      rival.floor = rival.floor || 1;
      rival.x = 16.5 + Math.sin(Date.now() / 2000) * 1.5;
      return db.players.filter((p) => p.id !== uid && Date.now() - Date.parse(p.seen_at || 0) < 30000 && p.x != null && (p.floor || 1) === floor)
        .map(({ id, name, avatar, level, x, y }) => ({ id, name, avatar, level, x, y }));
    },
    touch(uid) { player(uid).seen_at = iso(); return null; },
    my_guild(uid) { const g = db.guilds.find((x) => x.id === guildOf(uid)); return g ? pubGuild(g) : null; },
    create_guild(uid, a) {
      if (guildOf(uid)) fail('Leave your current guild first.');
      if (db.guilds.some((g) => g.name.toLowerCase() === a.p_name.trim().toLowerCase())) fail('That guild name is taken.');
      const g = { id: uuid(), name: a.p_name.trim(), emblem: a.p_emblem || '🛡️', code: Math.random().toString(36).slice(2, 8).toUpperCase(), owner: uid, created_at: iso() };
      db.guilds.push(g);
      player(uid).guild_id = g.id;
      return pubGuild(g);
    },
    join_guild(uid, a) {
      if (guildOf(uid)) fail('Leave your current guild first.');
      const g = db.guilds.find((x) => x.code === a.p_code.trim().toUpperCase());
      if (!g) fail('No guild has that code.');
      player(uid).guild_id = g.id;
      return pubGuild(g);
    },
    leave_guild(uid) { player(uid).guild_id = null; return null; },
    raid_current(uid, a) {
      const gid = guildOf(uid);
      if (!gid) fail('Join a guild first.');
      let r = db.raids.find((x) => x.guild_id === gid && x.week === weekStart());
      if (!r) {
        const n = db.players.filter((p) => p.guild_id === gid).length;
        r = { id: uuid(), guild_id: gid, week: weekStart(), boss: a.p_boss, max_hp: 200 + 400 * n, hp: 200 + 400 * n, defeated_at: null };
        db.raids.push(r);
      }
      return { ...r };
    },
    raid_hit(uid, a) {
      const r = db.raids.find((x) => x.id === a.p_raid && x.guild_id === guildOf(uid));
      if (!r) fail('Raid not found.');
      if (r.hp <= 0) return 0;
      const today = db.raid_hits.filter((h) => h.raid_id === r.id && h.player_id === uid && Date.now() - Date.parse(h.created_at) < 20 * 3600000).length;
      if (today >= 3) fail('You are out of raid attacks for today. Come back tomorrow.');
      const d = Math.max(0, Math.min(a.p_dmg, 120));
      db.raid_hits.push({ id: ++db.seq, raid_id: r.id, player_id: uid, dmg: d, created_at: iso() });
      r.hp = Math.max(0, r.hp - d);
      if (r.hp === 0) r.defeated_at = iso();
      return r.hp;
    },
    raid_claim(uid, a) {
      const r = db.raids.find((x) => x.id === a.p_raid && x.guild_id === guildOf(uid) && x.hp <= 0);
      if (!r) fail('The boss is still standing.');
      if (!db.raid_hits.some((h) => h.raid_id === r.id && h.player_id === uid)) fail('Only residents who joined the fight get loot.');
      if (db.raid_claims.some((c) => c.raid_id === r.id && c.player_id === uid)) return 0;
      db.raid_claims.push({ raid_id: r.id, player_id: uid });
      return 80;
    },
    duel_create(uid, a) {
      if (a.p_opponent === uid) fail('You cannot duel yourself.');
      const d = { id: uuid(), challenger: uid, opponent: a.p_opponent, seed: Math.floor(Math.random() * 2e9), c_score: null, o_score: null, status: 'pending', c_claimed: false, o_claimed: false, created_at: iso() };
      db.duels.push(d);
      return { id: d.id, seed: d.seed };
    },
    duel_submit(uid, a) {
      const d = db.duels.find((x) => x.id === a.p_id);
      if (!d || ![d.challenger, d.opponent].includes(uid)) fail('Duel not found.');
      if (d.status !== 'pending') fail('This duel is already over.');
      const s = Math.max(0, Math.min(a.p_score, 1000));
      if (uid === d.challenger && d.c_score == null) d.c_score = s;
      else if (uid === d.opponent && d.o_score == null) d.o_score = s;
      else fail('You already played this duel.');
      if (d.c_score != null && d.o_score != null) d.status = 'done';
      return { ...d };
    },
    duel_decline(uid, a) { const d = db.duels.find((x) => x.id === a.p_id && x.opponent === uid && x.status === 'pending'); if (d) d.status = 'declined'; return null; },
    duel_claim(uid, a) {
      const d = db.duels.find((x) => x.id === a.p_id);
      if (!d || d.status !== 'done') fail('Nothing to claim.');
      const c = uid === d.challenger;
      if (c ? d.c_claimed : d.o_claimed) return 0;
      if (c) d.c_claimed = true; else d.o_claimed = true;
      const mine = c ? d.c_score : d.o_score;
      const theirs = c ? d.o_score : d.c_score;
      return mine > theirs ? 40 : mine === theirs ? 20 : 10;
    },
    market_list(uid, a) {
      if (!['mat', 'cons', 'item'].includes(a.p_kind)) fail('bad kind');
      const l = { id: uuid(), seller: uid, kind: a.p_kind, item: a.p_item, qty: a.p_qty, price: a.p_price, status: 'open', buyer: null, seller_paid: false, created_at: iso(), sold_at: null };
      db.listings.push(l);
      return l.id;
    },
    market_buy(uid, a) {
      const l = db.listings.find((x) => x.id === a.p_id && x.status === 'open' && x.seller !== uid);
      if (!l) fail('That listing is no longer available.');
      Object.assign(l, { status: 'sold', buyer: uid, sold_at: iso() });
      return { ...l };
    },
    market_cancel(uid, a) {
      const l = db.listings.find((x) => x.id === a.p_id && x.seller === uid && x.status === 'open');
      if (!l) fail('That listing already sold or was removed.');
      l.status = 'cancelled';
      return { ...l };
    },
    hiscores() {
      return db.players.map((p) => {
        const g = db.guilds.find((x) => x.id === p.guild_id);
        const wins = db.duels.filter((d) => d.status === 'done' && ((d.challenger === p.id && d.c_score > d.o_score) || (d.opponent === p.id && d.o_score > d.c_score))).length;
        const dmg = db.raid_hits.filter((h) => h.player_id === p.id).reduce((a, h) => a + h.dmg, 0);
        return { id: p.id, name: p.name, avatar: p.avatar, level: p.level, xp: p.xp, guild: g ? g.name : null, emblem: g ? g.emblem : null, duel_wins: wins, raid_dmg: dmg };
      }).sort((a, b) => b.xp - a.xp);
    },
    market_collect(uid) {
      let total = 0;
      db.listings.forEach((l) => { if (l.seller === uid && l.status === 'sold' && !l.seller_paid) { l.seller_paid = true; total += l.price; } });
      return total;
    }
  };

  // ---------- router ----------
  const sessionFor = (u) => ({ access_token: `tok:${u.id}`, refresh_token: `ref:${u.id}`, expires_in: 3600, user: { id: u.id, email: u.email } });
  function route(method, url, body, uid, prefer) {
    const path = url.pathname;
    if (path === '/auth/v1/signup') {
      if (db.users.some((u) => u.email === body.email)) fail('User already registered', 422);
      const u = { id: uuid(), email: body.email, password: body.password };
      db.users.push(u);
      db.duels.push({ id: uuid(), challenger: RIVAL, opponent: u.id, seed: 12345, c_score: 420, o_score: null, status: 'pending', c_claimed: false, o_claimed: false, created_at: iso() });
      return [200, sessionFor(u)];
    }
    if (path === '/auth/v1/token') {
      if (url.searchParams.get('grant_type') === 'password') {
        const u = db.users.find((x) => x.email === body.email && x.password === body.password);
        if (!u) fail('Invalid login credentials');
        return [200, sessionFor(u)];
      }
      const u = db.users.find((x) => `ref:${x.id}` === body.refresh_token);
      if (!u) fail('Invalid Refresh Token', 400);
      return [200, sessionFor(u)];
    }
    if (path === '/auth/v1/logout') return [200, undefined];
    if (!uid) fail('JWT required', 401);
    const m = path.match(/^\/rest\/v1\/(rpc\/)?(\w+)$/);
    if (!m) fail('not found', 404);
    if (m[1]) {
      if (!rpcs[m[2]]) fail(`Could not find the function public.${m[2]}`, 404);
      return [200, rpcs[m[2]](uid, body || {})];
    }
    const table = m[2];
    const params = url.searchParams;
    if (method === 'GET') return [200, query(visible[table](uid), params)];
    if (method === 'PATCH' && table === 'players') {
      const allowed = ['name', 'avatar', 'level', 'xp'];
      const rows = query(db.players, params).map((r) => db.players.find((p) => p.id === r.id)).filter((p) => p.id === uid);
      rows.forEach((p) => allowed.forEach((k) => { if (k in body) p[k] = body[k]; }));
      return [200, prefer.includes('return=representation') ? rows.map((r) => ({ ...r })) : undefined];
    }
    if (method === 'POST' && table === 'players') {
      if (body.id !== uid) fail('new row violates row-level security policy', 403);
      db.players.push({ id: uid, name: body.name, avatar: body.avatar, level: body.level, xp: body.xp, guild_id: null, x: null, y: null, seen_at: null, created_at: iso() });
      return [201, undefined];
    }
    if (method === 'POST' && table === 'saves') {
      if (body.id !== uid) fail('new row violates row-level security policy', 403);
      db.saves = db.saves.filter((s) => s.id !== uid).concat([{ id: uid, data: body.data, saved_at: body.saved_at }]);
      return [201, undefined];
    }
    if (method === 'POST' && table === 'guild_msgs') {
      if (body.player_id !== uid || body.guild_id !== guildOf(uid)) fail('new row violates row-level security policy', 403);
      db.guild_msgs.push({ id: ++db.seq, guild_id: body.guild_id, player_id: uid, body: body.body, created_at: iso() });
      return [201, undefined];
    }
    fail(`mock: unsupported ${method} ${table}`, 405);
  }

  const realFetch = window.fetch.bind(window);
  window.fetch = async (input, init = {}) => {
    const url = new URL(typeof input === 'string' ? input : input.url);
    if (url.origin !== ORIGIN) return realFetch(input, init);
    await new Promise((r) => setTimeout(r, 15));
    const headers = init.headers || {};
    const tok = String(headers.Authorization || '').replace(/^Bearer /, '');
    const uid = tok.startsWith('tok:') ? tok.slice(4) : null;
    const body = init.body ? JSON.parse(init.body) : undefined;
    const method = init.method || 'GET';
    calls.push(`${method} ${url.pathname}`);
    try {
      const [status, data] = route(method, url, body, uid, headers.Prefer || '');
      persist();
      return new Response(data === undefined ? '' : JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
    } catch (e) {
      return new Response(JSON.stringify({ message: e.message }), { status: e.status || 400, headers: { 'Content-Type': 'application/json' } });
    }
  };
})();
