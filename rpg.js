window.EndoRPG = {
  init(G) {
    'use strict';
    const D = window.ENDO_RPG;
    let W = D.world;
    const S = () => G.getState();
    const { el, esc } = G;

    // ---------- state ----------
    const isNum = (n) => typeof n === 'number' && Number.isFinite(n);
    const count = (n) => (isNum(n) && n > 0 ? Math.floor(n) : 0);
    const pick = (obj, keys) => Object.fromEntries(keys.map((k) => [k, count(obj && obj[k])]).filter(([, v]) => v > 0));

    function ensure(state) {
      const r = state.rpg && typeof state.rpg === 'object' ? state.rpg : null;
      const out = {
        coins: r ? count(r.coins) : Math.round(state.xp * 0.5),
        skills: pick(r && r.skills, D.skills.map((s) => s.id)),
        items: pick(r && r.items, Object.keys(D.items)),
        cons: pick(r && r.cons, Object.keys(D.consumables)),
        mats: pick(r && r.mats, Object.keys(D.materials)),
        equip: {},
        buffs: pick(r && r.buffs, ['coffee', 'snack']),
        cleared: {},
        pos: null,
        floor: r && isNum(r.floor) ? r.floor : null,
        seenIntro: !!(r && r.seenIntro)
      };
      if (!out.items.coat_short) out.items.coat_short = 1;
      Object.keys(D.slots).forEach((slot) => {
        const id = r && r.equip && r.equip[slot];
        if (typeof id === 'string' && out.items[id] && D.items[id].slot === slot) out.equip[slot] = id;
      });
      if (!out.equip.coat) out.equip.coat = 'coat_short';
      D.skills.forEach((s) => { if (out.skills[s.id] > s.max) out.skills[s.id] = s.max; });
      if (r && r.cleared && typeof r.cleared === 'object') {
        Object.keys(r.cleared).forEach((k) => { if (/^\d+:[a-z0-9_-]+$/i.test(k)) out.cleared[k] = 1; });
      }
      if (r && r.pos && isNum(r.pos.x) && isNum(r.pos.y)) out.pos = { x: r.pos.x, y: r.pos.y, f: isNum(r.pos.f) ? r.pos.f : 1 };
      state.rpg = out;
      const spent = Object.values(out.skills).reduce((a, b) => a + b, 0);
      if (spent > levelFor(state.xp) - 1) out.skills = {};
      return state;
    }

    // ---------- levels ----------
    const xpForLevel = (L) => 30 * L * (L - 1);
    const levelFor = (xp) => { let L = 1; while (xp >= xpForLevel(L + 1)) L++; return L; };
    const titleFor = (L) => D.titles.filter((t) => L >= t.level).pop().name;
    function levelInfo(xp) {
      const level = levelFor(xp);
      const cur = xpForLevel(level);
      const next = xpForLevel(level + 1);
      return { level, title: titleFor(level), cur, next, into: xp - cur, need: next - cur, pct: Math.min(100, ((xp - cur) / (next - cur)) * 100) };
    }
    const skillPoints = () => levelFor(S().xp) - 1 - Object.values(S().rpg.skills).reduce((a, b) => a + b, 0);

    // ---------- perks ----------
    function perks() {
      const r = S().rpg;
      const p = { xpPct: 0, coinPct: 0, narrow: 0, stability: 0, discount: 0, craftDouble: 0, socratic: 0 };
      Object.values(r.equip).forEach((id) => {
        const m = D.items[id].mods;
        Object.keys(m).forEach((k) => { p[k] += m[k]; });
      });
      const sk = (id) => r.skills[id] || 0;
      p.narrow += sk('diff');
      p.stability += sk('steady');
      p.xpPct += 0.04 * sk('scholar');
      p.socratic = 0.1 * sk('socratic');
      p.discount = 0.1 * sk('debt');
      p.craftDouble = sk('chemist') ? 0.25 : 0;
      return p;
    }
    const pct = (n) => `${Math.round(n * 100)}%`;
    function perkLines(p) {
      const out = [];
      if (p.xpPct) out.push(`+${pct(p.xpPct)} XP`);
      if (p.socratic) out.push(`+${pct(p.socratic)} XP on boss & rapid-fire`);
      if (p.coinPct) out.push(`+${pct(p.coinPct)} coins`);
      if (p.narrow) out.push(`${p.narrow} × Narrow it down per station`);
      if (p.stability) out.push(`+${p.stability} stability light${p.stability > 1 ? 's' : ''}`);
      if (p.discount) out.push(`−${pct(p.discount)} pharmacy prices`);
      if (p.craftDouble) out.push(`${pct(p.craftDouble)} double-craft chance`);
      return out;
    }

    // ---------- station hooks ----------
    function stationStart(station, practice) {
      const p = perks();
      const r = S().rpg;
      const mod = { xpPct: p.xpPct, narrow: p.narrow, stability: p.stability, banners: [] };
      if (station.type === 'boss' || station.type === 'pearls') mod.xpPct += p.socratic;
      if (!practice && r.buffs.coffee) {
        r.buffs.coffee--;
        mod.xpPct += 0.2;
        mod.banners.push('☕ Double Espresso active: +20% XP this station');
      }
      if (!practice && station.type === 'consult' && r.buffs.snack) {
        r.buffs.snack--;
        mod.stability += 1;
        mod.banners.push('🍫 Snack active: +1 stability light');
      }
      if (mod.banners.length) G.save();
      return mod;
    }
    const narrowLeft = (mod) => mod.narrow + (S().rpg.cons.scroll || 0);
    function useNarrow(mod) {
      if (mod.narrow > 0) { mod.narrow--; return true; }
      const r = S().rpg;
      if (r.cons.scroll > 0) { r.cons.scroll--; G.save(); G.toast('📜 Mnemonic Scroll used'); return true; }
      return false;
    }

    function afterXP(amt, before) {
      const r = S().rpg;
      const coins = Math.round(amt * 0.5 * (1 + perks().coinPct));
      r.coins += coins;
      const a = levelFor(before);
      const b = levelFor(S().xp);
      if (b > a) {
        const oldTitle = titleFor(a);
        const title = titleFor(b);
        G.toast(`⬆️ Level ${b}!`, 'good');
        G.celebrate(`<div class="big-emoji">⬆️</div><h2>Level ${b}!</h2>
          <p>+${b - a} skill point${b - a > 1 ? 's' : ''} to spend in your 🎒 bag.</p>
          ${title !== oldTitle ? `<p>New title: <b>${title}</b></p>` : ''}`,
          [{ label: 'Later', cls: 'btn ghost' }, { label: 'Spend points', cls: 'btn primary', onClick: () => G.go('#/character') }]);
      }
      return coins;
    }

    const matLine = (mats) => Object.entries(mats).map(([k, n]) => `${D.materials[k].icon} ${n} ${D.materials[k].name}${n > 1 ? 's' : ''}`).join(' · ');
    function grantMats(mats) {
      const r = S().rpg;
      Object.entries(mats).forEach(([k, n]) => { r.mats[k] = (r.mats[k] || 0) + n; });
    }
    function stationComplete(dayId, station, practice) {
      const r = S().rpg;
      const key = `${dayId}:${station.id}`;
      const lines = [];
      const drop = D.drops[station.type] || {};
      if (!practice && !r.cleared[key]) {
        r.cleared[key] = 1;
        grantMats(drop);
        if (Object.keys(drop).length) lines.push(matLine(drop));
        if (station.type === 'boss') {
          const unowned = D.bossLoot.filter((id) => !r.items[id]);
          r.coins += D.bossCoins;
          lines.push(`🪙 ${D.bossCoins} bonus coins`);
          if (unowned.length) {
            const id = unowned[Math.floor(Math.random() * unowned.length)];
            r.items[id] = 1;
            const it = D.items[id];
            lines.push(`<span style="color:${D.rarity[it.rarity]}">${it.icon} <b>${it.name}</b> (${it.rarity})</span>`);
          }
        }
      } else if (practice) {
        const kinds = Object.keys(drop);
        r.coins += 5;
        lines.push('🪙 5 coins');
        if (kinds.length && Math.random() < 0.5) {
          const m = { [kinds[0]]: 1 };
          grantMats(m);
          lines.push(matLine(m));
        }
      }
      return lines.length ? `<div class="loot"><div class="eyebrow">Loot</div>${lines.map((l) => `<div>${l}</div>`).join('')}</div>` : '';
    }

    // ---------- shared UI ----------
    const itemName = (kind, id) => (kind === 'item' ? D.items[id] : D.consumables[id]);
    const priceOf = (entry) => Math.max(1, Math.round(entry.price * (1 - perks().discount)));
    const backToWorld = '<a class="back" href="#/">← Back to the hospital</a>';
    const coinsBar = () => `<div class="coins-bar">🪙 <b>${S().rpg.coins}</b> coins</div>`;

    // ---------- character ----------
    function viewCharacter() {
      const st = S();
      const r = st.rpg;
      const info = levelInfo(st.xp);
      const pts = skillPoints();
      const p = perks();
      const slots = Object.entries(D.slots).map(([slot, label]) => {
        const id = r.equip[slot];
        const it = id && D.items[id];
        const owned = Object.keys(r.items).filter((k) => D.items[k].slot === slot);
        return `<div class="slot">
          <div class="slot-h"><span class="muted">${label}</span>${owned.length > 1 || (owned.length && !id) ? `<button class="btn ghost sm" data-slot="${slot}">Change</button>` : ''}</div>
          ${it ? `<div class="item-line"><span class="item-ic">${it.icon}</span><div><b style="color:${D.rarity[it.rarity]}">${it.name}</b><div class="muted small">${it.desc}</div><div class="small">${perkLines(it.mods).join(' · ') || 'No bonus'}</div></div></div>`
            : '<div class="muted small">Empty</div>'}
          <div class="slot-pick hidden" data-for="${slot}">${owned.map((k) => {
            const o = D.items[k];
            return `<button class="pick ${k === id ? 'sel' : ''}" data-equip="${k}"><span>${o.icon}</span><span><b style="color:${D.rarity[o.rarity]}">${o.name}</b><small>${perkLines(o.mods).join(' · ') || 'No bonus'}</small></span></button>`;
          }).join('')}${id && slot !== 'coat' ? `<button class="pick" data-unequip="${slot}"><span>✖️</span><span>Unequip</span></button>` : ''}</div>
        </div>`;
      }).join('');
      const skills = D.skills.map((s) => {
        const rank = r.skills[s.id] || 0;
        return `<div class="skill">
          <span class="skill-ic">${s.icon}</span>
          <div class="skill-b"><b>${s.name}</b><div class="muted small">${s.desc}</div><div class="pips">${'●'.repeat(rank)}${'○'.repeat(s.max - rank)}</div></div>
          <button class="btn sm ${pts > 0 && rank < s.max ? 'primary' : ''}" data-skill="${s.id}" ${pts > 0 && rank < s.max ? '' : 'disabled'}>+</button>
        </div>`;
      }).join('');
      const cons = Object.entries(D.consumables).map(([k, c]) => `<div class="inv"><span>${c.icon}</span><div><b>${c.name}</b> × ${r.cons[k] || 0}<div class="muted small">${c.desc}</div></div>
        ${k !== 'scroll' && r.cons[k] ? `<button class="btn sm" data-use="${k}">${r.buffs[k] ? 'Active ✓' : 'Use'}</button>` : ''}</div>`).join('');
      const mats = Object.entries(D.materials).map(([k, m]) => `<span class="mat">${m.icon} ${m.name} <b>${r.mats[k] || 0}</b></span>`).join('');

      G.app.innerHTML = `${backToWorld}
        <section class="card char-card">
          <span class="char-av">${esc(st.profile.avatar)}</span>
          <div class="char-b">
            <div class="char-name">${esc('Dr. ' + st.profile.name)}</div>
            <div class="muted">Level ${info.level} · ${info.title}</div>
            <div class="bar"><div style="width:${info.pct}%"></div></div>
            <div class="small muted">${info.into} / ${info.need} XP to level ${info.level + 1} · 🪙 ${r.coins}</div>
          </div>
        </section>
        <section class="card"><h3>Active bonuses</h3>${perkLines(p).length ? `<ul class="perks">${perkLines(p).map((l) => `<li>${l}</li>`).join('')}</ul>` : '<p class="muted small">None yet. Equip gear and spend skill points.</p>'}</section>
        <section class="card"><h3>Gear</h3>${slots}</section>
        <section class="card"><h3>Skills <span class="pts ${pts > 0 ? 'has' : ''}">${pts} point${pts === 1 ? '' : 's'}</span></h3>
          <p class="muted small">You earn one skill point per level.</p>${skills}</section>
        <section class="card"><h3>Consumables</h3>${cons}</section>
        <section class="card"><h3>Materials</h3><div class="mats">${mats}</div><p class="muted small">Craft with these at the Crafting Lab.</p></section>`;

      G.app.querySelectorAll('[data-slot]').forEach((b) => { b.onclick = () => G.app.querySelector(`[data-for="${b.dataset.slot}"]`).classList.toggle('hidden'); });
      G.app.querySelectorAll('[data-equip]').forEach((b) => {
        b.onclick = () => { const id = b.dataset.equip; r.equip[D.items[id].slot] = id; G.save(); G.toast(`Equipped ${D.items[id].name}`, 'good'); viewCharacter(); };
      });
      G.app.querySelectorAll('[data-unequip]').forEach((b) => { b.onclick = () => { delete r.equip[b.dataset.unequip]; G.save(); viewCharacter(); }; });
      G.app.querySelectorAll('[data-skill]').forEach((b) => {
        b.onclick = () => {
          const s = D.skills.find((x) => x.id === b.dataset.skill);
          if (skillPoints() <= 0 || (r.skills[s.id] || 0) >= s.max) return;
          r.skills[s.id] = (r.skills[s.id] || 0) + 1;
          G.save();
          G.toast(`${s.icon} ${s.name} rank ${r.skills[s.id]}`, 'good');
          G.renderHeader();
          viewCharacter();
        };
      });
      G.app.querySelectorAll('[data-use]').forEach((b) => {
        b.onclick = () => {
          const k = b.dataset.use;
          if (r.buffs[k]) return G.toast('Already active. It applies to your next station.');
          r.cons[k]--;
          r.buffs[k] = 1;
          G.save();
          G.toast(`${D.consumables[k].icon} Active for your next ${k === 'snack' ? 'consult' : 'station'}`, 'good');
          viewCharacter();
        };
      });
    }

    // ---------- shop ----------
    function viewShop() {
      const r = S().rpg;
      const disc = perks().discount;
      const rows = D.shop.map((e) => {
        const it = itemName(e.kind, e.id);
        const owned = e.kind === 'item' && r.items[e.id];
        const price = priceOf(e);
        const afford = r.coins >= price;
        const sub = e.kind === 'item' ? `${perkLines(it.mods).join(' · ')}` : it.desc;
        const have = e.kind === 'cons' ? ` <span class="muted small">(have ${r.cons[e.id] || 0})</span>` : '';
        return `<div class="shop-row">
          <span class="item-ic">${it.icon}</span>
          <div class="shop-b"><b ${it.rarity ? `style="color:${D.rarity[it.rarity]}"` : ''}>${it.name}</b>${have}<div class="muted small">${sub}</div></div>
          ${owned ? '<span class="owned">Owned</span>' : `<button class="btn sm ${afford ? 'primary' : ''}" data-buy="${e.id}" ${afford ? '' : 'disabled'}>🪙 ${price}</button>`}
        </div>`;
      }).join('');
      G.app.innerHTML = `${backToWorld}
        <h1>💊 Pharmacy</h1>
        <p class="muted">PharmD Lee: "Gear makes you faster. It won't answer the questions for you."${disc ? ` Your Med School Debt skill gives −${pct(disc)}.` : ''}</p>
        ${coinsBar()}
        <section class="card">${rows}</section>`;
      G.app.querySelectorAll('[data-buy]').forEach((b) => {
        b.onclick = () => {
          const e = D.shop.find((x) => x.id === b.dataset.buy);
          const price = priceOf(e);
          if (r.coins < price) return;
          r.coins -= price;
          if (e.kind === 'item') r.items[e.id] = 1;
          else r.cons[e.id] = (r.cons[e.id] || 0) + 1;
          G.save();
          G.toast(`Bought ${itemName(e.kind, e.id).name}`, 'good');
          viewShop();
        };
      });
    }

    // ---------- lab ----------
    function viewLab() {
      const r = S().rpg;
      const rows = D.recipes.map((rc) => {
        const it = itemName(rc.out.kind, rc.out.id);
        const owned = rc.out.kind === 'item' && r.items[rc.out.id];
        const needs = Object.entries(rc.needs).map(([k, n]) => {
          const have = r.mats[k] || 0;
          return `<span class="need ${have >= n ? 'ok' : ''}">${D.materials[k].icon} ${have}/${n}</span>`;
        });
        if (rc.coins) needs.push(`<span class="need ${r.coins >= rc.coins ? 'ok' : ''}">🪙 ${rc.coins}</span>`);
        const can = !owned && Object.entries(rc.needs).every(([k, n]) => (r.mats[k] || 0) >= n) && r.coins >= rc.coins;
        const sub = rc.out.kind === 'item' ? perkLines(it.mods).join(' · ') : it.desc;
        return `<div class="shop-row">
          <span class="item-ic">${it.icon}</span>
          <div class="shop-b"><b ${it.rarity ? `style="color:${D.rarity[it.rarity]}"` : ''}>${it.name}</b><div class="muted small">${sub}</div><div class="needs">${needs.join('')}</div></div>
          ${owned ? '<span class="owned">Owned</span>' : `<button class="btn sm ${can ? 'primary' : ''}" data-craft="${rc.id}" ${can ? '' : 'disabled'}>Craft</button>`}
        </div>`;
      }).join('');
      const mats = Object.entries(D.materials).map(([k, m]) => `<span class="mat">${m.icon} ${m.name} <b>${r.mats[k] || 0}</b></span>`).join('');
      G.app.innerHTML = `${backToWorld}
        <h1>⚗️ Crafting Lab</h1>
        <p class="muted">Lab Tech Priya: "Clear cases for samples, rapid-fire rounds for pearl fragments, and attendings for notes."</p>
        <div class="mats">${mats}</div>
        ${coinsBar()}
        <section class="card">${rows}</section>`;
      G.app.querySelectorAll('[data-craft]').forEach((b) => {
        b.onclick = () => {
          const rc = D.recipes.find((x) => x.id === b.dataset.craft);
          Object.entries(rc.needs).forEach(([k, n]) => { r.mats[k] -= n; });
          r.coins -= rc.coins;
          const double = rc.out.kind === 'cons' && Math.random() < perks().craftDouble;
          const n = rc.out.n * (double ? 2 : 1);
          if (rc.out.kind === 'item') r.items[rc.out.id] = 1;
          else r.cons[rc.out.id] = (r.cons[rc.out.id] || 0) + n;
          G.save();
          G.toast(`${double ? '⚗️ Double craft! ' : ''}Crafted ${itemName(rc.out.kind, rc.out.id).name}${n > 1 ? ` × ${n}` : ''}`, 'good');
          viewLab();
        };
      });
    }

    // ---------- world ----------
    // Floor 1 is D.world (ED, ICU, and shared services). Other days use D.floors[day].
    function floorDef(day) {
      if (day === 1 || !day) return D.world;
      const f = D.floors && D.floors[day];
      if (f) return f;
      console.warn(`No floor plan for Day ${day} in content/rpg-data.js; borrowing Floor 2's.`);
      return D.floors[2];
    }
    let floorGrid;
    let solid;
    const gridCache = new Map();
    function useFloor(day) {
      W = floorDef(day);
      if (!gridCache.has(W)) {
        const fg = new Int16Array(W.w * W.h).fill(-1);
        const so = new Uint8Array(W.w * W.h).fill(1);
        const fill = (rc, idx) => { for (let y = rc.y; y < rc.y + rc.h; y++) for (let x = rc.x; x < rc.x + rc.w; x++) { fg[y * W.w + x] = idx; so[y * W.w + x] = 0; } };
        W.rooms.forEach((rc, i) => fill(rc, i));
        W.doors.forEach((d) => fill(d, 0));
        W.decor.forEach((d) => { if (d.solid !== false) for (let y = d.y; y < d.y + d.h; y++) for (let x = d.x; x < d.x + d.w; x++) so[y * W.w + x] = 1; });
        gridCache.set(W, { fg, so });
      }
      ({ fg: floorGrid, so: solid } = gridCache.get(W));
    }
    useFloor(1);
    const isFloor = (x, y) => x >= 0 && y >= 0 && x < W.w && y < W.h && floorGrid[y * W.w + x] >= 0;
    const blocked = (x, y) => { const tx = Math.floor(x); const ty = Math.floor(y); return tx < 0 || ty < 0 || tx >= W.w || ty >= W.h || solid[ty * W.w + tx] === 1; };

    // Each rotation day is a floor with its own map. Floor 1 uses its own cast; later floors fill their station slots from the day's `cast`.
    const dayRec = (id) => S().days[id] || { stations: {}, completed: false };
    const finished = (id) => dayRec(id).completed || G.CONTENT[id].stations.every((s) => dayRec(id).stations[s.id]?.done);
    const nextDay = () => G.DAYS.find((d) => G.isUnlocked(d.id) && !finished(d.id));
    function floorDay() {
      const f = S().rpg.floor;
      if (f && G.isUnlocked(f)) return f;
      return nextDay()?.id || 1;
    }
    function floorNpcs(day) {
      const F = floorDef(day);
      if (F === D.world) return F.npcs;
      const cast = G.CONTENT[day].cast || {};
      return F.npcs.flatMap((n) => {
        if (n.act.type !== 'station') return [n];
        const c = cast[n.id];
        return c ? [{ ...n, ...c, act: { type: 'station', day, station: c.station } }] : [];
      });
    }

    const NET_ROUTES = { account: '#/online', guild: '#/guild', raid: '#/guild', duel: '#/duels', market: '#/market', hiscores: '#/hiscores' };
    function npcStatus(n) {
      const a = n.act;
      if (a.type === 'elevator') {
        const next = nextDay();
        return next && next.id !== floorDay() ? 'new' : null;
      }
      if (a.type === 'station') {
        if (!G.isUnlocked(a.day)) return 'lock';
        const station = G.CONTENT[a.day].stations.find((s) => s.id === a.station);
        if (station.type === 'pearls' && !G.coreDone(a.day)) return 'lock';
        return dayRec(a.day).stations[a.station]?.done ? 'done' : 'new';
      }
      if (a.type === 'tutorial') return S().rpg.seenIntro ? null : 'new';
      if (NET_ROUTES[a.type]) return G.net() ? G.net().status(a.type) : 'soon';
      return null;
    }

    let cleanupWorld = null;
    const debug = { frames: 0 };
    window.EndoWorldDebug = debug;
    function viewWorld() {
      if (cleanupWorld) cleanupWorld();
      const st = S();
      const r = st.rpg;
      const info = levelInfo(st.xp);
      const pts = skillPoints();
      const day = floorDay();
      useFloor(day);
      const NPCS = floorNpcs(day);
      const TH = W.theme || D.world.theme;
      document.body.classList.add('in-world');
      G.app.innerHTML = `<div class="world" id="world">
        <canvas id="wc" aria-label="Hospital map. Use arrow keys or tap to move."></canvas>
        <div class="hud">
          <div class="hud-pill"><b>Lv ${info.level}</b><span class="hud-bar"><i style="width:${info.pct}%"></i></span><span>🪙 ${r.coins}</span></div>
          <div class="hud-floor">Floor ${day} · ${esc(W.name)} · ${esc(G.DAYS[day - 1].title)}</div>
          <div class="hud-btns">
            <a class="hud-btn" href="#/character" aria-label="Character, skills and gear">🎒${pts > 0 ? `<i class="dot">${pts}</i>` : ''}</a>
            <a class="hud-btn" href="#/days" aria-label="Rotation list">📋</a>
            <a class="hud-btn" id="hudNet" href="#/online" aria-label="Online play">🌐</a>
          </div>
        </div>
        <div class="joy hidden"><div class="joy-knob"></div></div>
        <button class="talk hidden" id="talk"></button>
        <div class="dialog hidden" id="dialog"></div>
      </div>`;
      const world = document.getElementById('world');
      const canvas = document.getElementById('wc');
      const c2d = canvas.getContext('2d');
      const talkBtn = document.getElementById('talk');
      const dialog = document.getElementById('dialog');
      const joy = world.querySelector('.joy');
      const knob = world.querySelector('.joy-knob');

      // Positions are remembered per floor; arriving on a different floor puts you at its elevator.
      const start = r.pos && r.pos.f === day ? r.pos : r.pos ? (W.arrive || W.spawn) : W.spawn;
      const player = { x: start.x, y: start.y };
      if (blocked(player.x, player.y)) Object.assign(player, { x: W.spawn.x, y: W.spawn.y });
      let T = 44;
      let vw = 0;
      let vh = 0;
      let dpr = 1;
      const keys = new Set();
      let joyVec = null;
      let target = null;
      let near = null;
      let dialogOpen = false;
      let raf = 0;
      let last = performance.now();
      let facing = 1;
      let walkT = 0;

      function layout() {
        document.documentElement.style.setProperty('--hdr-h', `${G.hdr.offsetHeight}px`);
        const rect = world.getBoundingClientRect();
        vw = rect.width;
        vh = rect.height;
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(vw * dpr);
        canvas.height = Math.round(vh * dpr);
        canvas.style.width = `${vw}px`;
        canvas.style.height = `${vh}px`;
        T = Math.max(34, Math.min(56, Math.round(Math.min(vw / 9, vh / 11))));
      }

      const rr = (x, y, w, h, rad) => { c2d.beginPath(); c2d.roundRect ? c2d.roundRect(x, y, w, h, rad) : c2d.rect(x, y, w, h); };
      function drawDecor(d) {
        const x = d.x * T;
        const y = d.y * T;
        const w = d.w * T;
        const h = d.h * T;
        const p = T * 0.08;
        switch (d.t) {
          case 'bed':
            c2d.fillStyle = '#ffffff'; rr(x + p, y + p, w - 2 * p, h - 2 * p, T * 0.14); c2d.fill();
            c2d.strokeStyle = '#b6c2d4'; c2d.lineWidth = 2; c2d.stroke();
            c2d.fillStyle = '#93c5fd'; rr(x + p * 2, y + p * 2, w - 4 * p, T * 0.32, T * 0.1); c2d.fill();
            c2d.fillStyle = '#bfdbfe'; rr(x + p, y + h * 0.48, w - 2 * p, h * 0.44, T * 0.12); c2d.fill();
            break;
          case 'monitor':
            c2d.fillStyle = '#1e293b'; rr(x + p * 2, y + p * 2, w - 4 * p, h - 5 * p, T * 0.08); c2d.fill();
            c2d.strokeStyle = '#4ade80'; c2d.lineWidth = 2; c2d.beginPath();
            c2d.moveTo(x + p * 3, y + h * 0.4); c2d.lineTo(x + w * 0.4, y + h * 0.4); c2d.lineTo(x + w * 0.5, y + h * 0.22); c2d.lineTo(x + w * 0.6, y + h * 0.5); c2d.lineTo(x + w - p * 3, y + h * 0.4); c2d.stroke();
            break;
          case 'counter':
            c2d.fillStyle = '#94a3b8'; rr(x, y + p, w, h - p, T * 0.1); c2d.fill();
            c2d.fillStyle = '#e2e8f0'; rr(x, y, w, h * 0.7, T * 0.1); c2d.fill();
            break;
          case 'shelf': {
            c2d.fillStyle = '#9a6b45'; rr(x, y, w, h, T * 0.06); c2d.fill();
            const cols = ['#ef4444', '#3b82f6', '#22c55e', '#eab308', '#a855f7', '#f97316'];
            for (let i = 0; i < d.w * 4; i++) { c2d.fillStyle = cols[i % cols.length]; c2d.fillRect(x + p + i * (T / 4), y + p * 1.5, T / 4 - 3, h - p * 3); }
            break;
          }
          case 'bench':
            c2d.fillStyle = '#cbd5e1'; rr(x, y, w, h, T * 0.1); c2d.fill();
            [['#a78bfa', 0.2], ['#34d399', 0.5], ['#f472b6', 0.8]].forEach(([col, f]) => { c2d.fillStyle = col; c2d.beginPath(); c2d.arc(x + w * f, y + h / 2, T * 0.13, 0, Math.PI * 2); c2d.fill(); });
            break;
          case 'table': case 'desk':
            c2d.fillStyle = d.t === 'desk' ? '#b98b5e' : '#d2a679'; rr(x + p / 2, y + p, w - p, h - 2 * p, T * 0.14); c2d.fill();
            break;
          case 'plant':
            c2d.fillStyle = '#c2703d'; rr(x + T * 0.3, y + T * 0.55, T * 0.4, T * 0.35, T * 0.08); c2d.fill();
            c2d.fillStyle = '#22c55e'; [[0.5, 0.35, 0.24], [0.33, 0.45, 0.16], [0.67, 0.45, 0.16]].forEach(([a, b, s]) => { c2d.beginPath(); c2d.arc(x + T * a, y + T * b, T * s, 0, Math.PI * 2); c2d.fill(); });
            break;
          case 'banner':
            c2d.fillStyle = '#b91c1c'; c2d.beginPath(); c2d.moveTo(x + T * 0.2, y); c2d.lineTo(x + T * 0.8, y); c2d.lineTo(x + T * 0.8, y + T * 0.9); c2d.lineTo(x + T * 0.5, y + T * 0.7); c2d.lineTo(x + T * 0.2, y + T * 0.9); c2d.closePath(); c2d.fill();
            c2d.fillStyle = '#fbbf24'; c2d.beginPath(); c2d.arc(x + T * 0.5, y + T * 0.35, T * 0.12, 0, Math.PI * 2); c2d.fill();
            break;
          case 'fridge':
            c2d.fillStyle = '#e2e8f0'; rr(x + p / 2, y, w - p, h - p / 2, T * 0.08); c2d.fill();
            c2d.strokeStyle = '#94a3b8'; c2d.lineWidth = 2; c2d.stroke();
            c2d.fillStyle = '#7dd3fc'; rr(x + p * 2, y + p * 2, w - p * 4, h * 0.45, T * 0.05); c2d.fill();
            c2d.fillStyle = '#64748b'; c2d.fillRect(x + w - p * 3, y + h * 0.62, p, h * 0.22);
            break;
          case 'whiteboard':
            c2d.fillStyle = '#94a3b8'; rr(x, y + p, w, h * 0.62, T * 0.05); c2d.fill();
            c2d.fillStyle = '#ffffff'; rr(x + p, y + p * 2, w - 2 * p, h * 0.62 - 2 * p, T * 0.04); c2d.fill();
            c2d.strokeStyle = '#2563eb'; c2d.lineWidth = 2; c2d.beginPath();
            c2d.moveTo(x + p * 3, y + h * 0.45); c2d.lineTo(x + w * 0.35, y + h * 0.3); c2d.lineTo(x + w * 0.55, y + h * 0.42); c2d.stroke();
            c2d.strokeStyle = '#dc2626'; c2d.beginPath(); c2d.moveTo(x + w * 0.65, y + h * 0.3); c2d.lineTo(x + w - p * 3, y + h * 0.3); c2d.stroke();
            break;
          case 'sofa':
            c2d.fillStyle = '#7c6a9a'; rr(x, y + p, w, h - p, T * 0.2); c2d.fill();
            c2d.fillStyle = '#9d8bbd'; for (let i = 0; i < d.w; i++) { rr(x + i * T + p, y + p * 2.5, T - 2 * p, h * 0.5, T * 0.12); c2d.fill(); }
            break;
          case 'chairs':
            for (let i = 0; i < d.w; i++) {
              c2d.fillStyle = '#64748b'; rr(x + i * T + p, y + p, T - 2 * p, h * 0.35, T * 0.08); c2d.fill();
              c2d.fillStyle = '#93a3c3'; rr(x + i * T + p, y + h * 0.4, T - 2 * p, h * 0.45, T * 0.1); c2d.fill();
            }
            break;
          case 'exam':
            c2d.fillStyle = '#475569'; rr(x + p, y + h * 0.55, w - 2 * p, h * 0.35, T * 0.06); c2d.fill();
            c2d.fillStyle = '#5eead4'; rr(x + p / 2, y + p, w - p, h * 0.6, T * 0.14); c2d.fill();
            c2d.fillStyle = '#f8fafc'; rr(x + w * 0.15, y + p * 2, w * 0.7, h * 0.4, T * 0.08); c2d.fill();
            break;
          case 'sink':
            c2d.fillStyle = '#cbd5e1'; rr(x + p, y + p, w - 2 * p, h - 2 * p, T * 0.12); c2d.fill();
            c2d.fillStyle = '#93c5fd'; c2d.beginPath(); c2d.ellipse(x + w / 2, y + h * 0.55, w * 0.28, h * 0.2, 0, 0, Math.PI * 2); c2d.fill();
            c2d.fillStyle = '#64748b'; c2d.fillRect(x + w / 2 - 2, y + p * 1.5, 4, h * 0.2);
            break;
          case 'stove':
            c2d.fillStyle = '#cbd5e1'; rr(x, y + p / 2, w, h - p, T * 0.08); c2d.fill();
            c2d.strokeStyle = '#334155'; c2d.lineWidth = 2;
            for (let i = 0; i < d.w * 2; i++) { c2d.beginPath(); c2d.arc(x + (i + 0.5) * (w / (d.w * 2)), y + h * 0.45, T * 0.13, 0, Math.PI * 2); c2d.stroke(); }
            break;
          case 'treadmill':
            c2d.fillStyle = '#334155'; rr(x + p / 2, y + p, w - p, h - 2 * p, T * 0.1); c2d.fill();
            c2d.fillStyle = '#64748b'; rr(x + p * 1.5, y + p * 2, w - p * 3, h - p * 4, T * 0.06); c2d.fill();
            c2d.fillStyle = '#38bdf8'; rr(x + w - p * 3, y + p * 1.2, p * 2, h - p * 2.4, T * 0.04); c2d.fill();
            break;
          case 'scale':
            c2d.fillStyle = '#94a3b8'; rr(x + p * 1.5, y + p * 1.5, w - p * 3, h - p * 3, T * 0.1); c2d.fill();
            c2d.fillStyle = '#0f172a'; rr(x + w * 0.3, y + h * 0.28, w * 0.4, h * 0.2, T * 0.04); c2d.fill();
            c2d.fillStyle = '#4ade80'; c2d.fillRect(x + w * 0.36, y + h * 0.33, w * 0.28, h * 0.1);
            break;
          case 'fountain':
            c2d.fillStyle = '#94a3b8'; c2d.beginPath(); c2d.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.46, 0, Math.PI * 2); c2d.fill();
            c2d.fillStyle = '#7dd3fc'; c2d.beginPath(); c2d.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.38, 0, Math.PI * 2); c2d.fill();
            c2d.fillStyle = '#e0f2fe'; c2d.beginPath(); c2d.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.1, 0, Math.PI * 2); c2d.fill();
            break;
          case 'recliner':
            c2d.fillStyle = '#7c8db5'; rr(x + p, y + p * 2, w - 2 * p, h - p * 3, T * 0.16); c2d.fill();
            c2d.fillStyle = '#9fb0d6'; rr(x + p * 2, y + h * 0.45, w - p * 4, h * 0.35, T * 0.1); c2d.fill();
            c2d.strokeStyle = '#94a3b8'; c2d.lineWidth = 2; c2d.beginPath(); c2d.moveTo(x + w - p, y + h - p); c2d.lineTo(x + w - p, y + p / 2); c2d.stroke();
            c2d.fillStyle = '#bae6fd'; rr(x + w - p * 2.2, y + p / 2, p * 2.4, p * 2.6, T * 0.04); c2d.fill();
            break;
          case 'dialysis':
            c2d.fillStyle = '#e2e8f0'; rr(x + p * 1.5, y + p, w - p * 3, h - p * 2, T * 0.08); c2d.fill();
            c2d.fillStyle = '#0f172a'; rr(x + p * 2.5, y + p * 2, w - p * 5, h * 0.28, T * 0.04); c2d.fill();
            c2d.fillStyle = '#ef4444'; c2d.beginPath(); c2d.arc(x + w * 0.35, y + h * 0.65, T * 0.08, 0, Math.PI * 2); c2d.fill();
            c2d.fillStyle = '#3b82f6'; c2d.beginPath(); c2d.arc(x + w * 0.65, y + h * 0.65, T * 0.08, 0, Math.PI * 2); c2d.fill();
            break;
          case 'scanner': {
            const cx = x + w * 0.38; const cy = y + h / 2; const rad = Math.min(w, h) * 0.42;
            c2d.fillStyle = '#cbd5e1'; rr(x + w * 0.3, cy - h * 0.14, w * 0.68, h * 0.28, T * 0.08); c2d.fill();
            c2d.fillStyle = '#e2e8f0'; c2d.beginPath(); c2d.arc(cx, cy, rad, 0, Math.PI * 2); c2d.fill();
            c2d.strokeStyle = '#64748b'; c2d.lineWidth = 3; c2d.stroke();
            c2d.fillStyle = '#475569'; c2d.beginPath(); c2d.arc(cx, cy, rad * 0.45, 0, Math.PI * 2); c2d.fill();
            break;
          }
          case 'dxa':
            c2d.fillStyle = '#e2e8f0'; rr(x, y + h * 0.25, w, h * 0.55, T * 0.12); c2d.fill();
            c2d.strokeStyle = '#94a3b8'; c2d.lineWidth = 2; c2d.stroke();
            c2d.fillStyle = '#475569'; rr(x + w * 0.55, y - h * 0.05, T * 0.35, h * 1.05, T * 0.06); c2d.fill();
            c2d.fillStyle = '#38bdf8'; c2d.fillRect(x + w * 0.55 + T * 0.08, y + h * 0.1, T * 0.19, h * 0.12);
            break;
          case 'skeleton': {
            const cx = x + w / 2;
            c2d.fillStyle = '#334155'; rr(x + p, y + p / 2, w - 2 * p, h - p * 2, T * 0.14); c2d.fill();
            c2d.fillStyle = '#a8a29e'; rr(x + p, y + h - p * 3, w - 2 * p, p * 2.5, T * 0.06); c2d.fill();
            c2d.strokeStyle = '#f5f0e6'; c2d.lineWidth = Math.max(2, T * 0.07); c2d.lineCap = 'round';
            c2d.beginPath(); c2d.arc(cx, y + h * 0.18, T * 0.17, 0, Math.PI * 2); c2d.stroke();
            c2d.beginPath(); c2d.moveTo(cx, y + h * 0.28); c2d.lineTo(cx, y + h * 0.62);
            for (let i = 0; i < 3; i++) { const ry = y + h * (0.34 + i * 0.08); c2d.moveTo(cx - w * 0.16, ry); c2d.lineTo(cx + w * 0.16, ry); }
            c2d.moveTo(cx - w * 0.22, y + h * 0.3); c2d.lineTo(cx - w * 0.3, y + h * 0.55);
            c2d.moveTo(cx + w * 0.22, y + h * 0.3); c2d.lineTo(cx + w * 0.3, y + h * 0.55);
            c2d.moveTo(cx, y + h * 0.62); c2d.lineTo(cx - w * 0.14, y + h * 0.84);
            c2d.moveTo(cx, y + h * 0.62); c2d.lineTo(cx + w * 0.14, y + h * 0.84);
            c2d.stroke(); c2d.lineCap = 'butt';
            break;
          }
          case 'bars':
            c2d.fillStyle = '#94a3b8';
            c2d.fillRect(x, y + h * 0.15, w, h * 0.12); c2d.fillRect(x, y + h * 0.73, w, h * 0.12);
            c2d.fillStyle = '#475569';
            [0.05, 0.5, 0.95].forEach((f) => { c2d.fillRect(x + w * f - 3, y + h * 0.1, 6, h * 0.8); });
            break;
          case 'mat':
            c2d.fillStyle = 'rgba(239,68,68,.18)'; rr(x, y, w, h, T * 0.3); c2d.fill();
            c2d.strokeStyle = 'rgba(239,68,68,.45)'; c2d.lineWidth = 3; c2d.beginPath(); c2d.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.3, 0, Math.PI * 2); c2d.stroke();
            break;
          default:
        }
      }

      function drawBubble(x, y, status, t) {
        if (!status) return;
        const bob = Math.sin(t / 300) * T * 0.05;
        const by = y - T * 0.78 + bob;
        const map = { new: ['#facc15', '!', '#3b2f00'], done: ['#22c55e', '✓', '#fff'], lock: ['#64748b', '🔒', '#fff'], soon: ['#94a3b8', '…', '#fff'] };
        const [bg, ch, fg] = map[status];
        c2d.fillStyle = bg;
        c2d.beginPath(); c2d.arc(x, by, T * 0.2, 0, Math.PI * 2); c2d.fill();
        c2d.fillStyle = fg;
        c2d.font = `800 ${Math.round(T * (status === 'lock' ? 0.2 : 0.28))}px system-ui, sans-serif`;
        c2d.textAlign = 'center'; c2d.textBaseline = 'middle';
        c2d.fillText(ch, x, by + 1);
      }

      function drawChar(x, y, emoji, color, isPlayer, t) {
        const bounce = isPlayer && walkT > 0 ? Math.abs(Math.sin(walkT * 10)) * T * 0.06 : 0;
        c2d.fillStyle = 'rgba(15,23,42,.18)';
        c2d.beginPath(); c2d.ellipse(x, y + T * 0.3, T * 0.32, T * 0.12, 0, 0, Math.PI * 2); c2d.fill();
        c2d.fillStyle = color;
        c2d.beginPath(); c2d.arc(x, y - bounce, T * 0.36, 0, Math.PI * 2); c2d.fill();
        c2d.strokeStyle = isPlayer ? '#0f766e' : '#ffffff'; c2d.lineWidth = isPlayer ? 3 : 2.5; c2d.stroke();
        c2d.font = `${Math.round(T * 0.46)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
        c2d.textAlign = 'center'; c2d.textBaseline = 'middle';
        c2d.fillText(emoji, x, y - bounce + 1);
      }

      function drawTag(x, y, label, bg) {
        c2d.font = `700 ${Math.round(T * 0.24)}px system-ui, sans-serif`;
        c2d.textAlign = 'center'; c2d.textBaseline = 'middle';
        const tw = c2d.measureText(label).width + T * 0.3;
        c2d.fillStyle = bg;
        rr(x - tw / 2, y - T * 0.86, tw, T * 0.32, T * 0.16); c2d.fill();
        c2d.fillStyle = '#fff';
        c2d.fillText(label, x, y - T * 0.7);
      }

      function draw(t) {
        c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
        c2d.fillStyle = TH.void;
        c2d.fillRect(0, 0, vw, vh);
        const ww = W.w * T;
        const wh = W.h * T;
        const camX = ww < vw ? (ww - vw) / 2 : Math.max(0, Math.min(ww - vw, player.x * T - vw / 2));
        const camY = wh < vh ? (wh - vh) / 2 : Math.max(0, Math.min(wh - vh, player.y * T - vh / 2));
        c2d.translate(-Math.round(camX), -Math.round(camY));
        const x0 = Math.max(0, Math.floor(camX / T) - 1);
        const y0 = Math.max(0, Math.floor(camY / T) - 1);
        const x1 = Math.min(W.w - 1, Math.ceil((camX + vw) / T) + 1);
        const y1 = Math.min(W.h - 1, Math.ceil((camY + vh) / T) + 1);

        for (let y = y0; y <= y1; y++) {
          for (let x = x0; x <= x1; x++) {
            const f = floorGrid[y * W.w + x];
            if (f >= 0) {
              c2d.fillStyle = W.rooms[f].color;
              c2d.fillRect(x * T, y * T, T + 0.5, T + 0.5);
              if ((x + y) % 2) { c2d.fillStyle = 'rgba(15,23,42,.035)'; c2d.fillRect(x * T, y * T, T, T); }
            } else {
              let edge = false;
              for (let dy = -1; dy <= 1 && !edge; dy++) for (let dx = -1; dx <= 1; dx++) if (isFloor(x + dx, y + dy)) { edge = true; break; }
              if (edge) {
                c2d.fillStyle = TH.wall; c2d.fillRect(x * T, y * T, T + 0.5, T + 0.5);
                c2d.fillStyle = TH.wallTop; c2d.fillRect(x * T, y * T, T + 0.5, T * 0.32);
              }
            }
          }
        }
        W.rooms.forEach((rc) => {
          if (!rc.name) return;
          c2d.fillStyle = TH.label;
          c2d.font = `800 ${Math.round(T * 0.3)}px system-ui, sans-serif`;
          c2d.textAlign = 'left'; c2d.textBaseline = 'top';
          c2d.fillText(rc.name.toUpperCase(), rc.x * T + T * 0.2, (rc.y + rc.h) * T - T * 0.45);
        });
        W.decor.forEach(drawDecor);

        const others = G.net() ? G.net().others() : [];
        const ents = NPCS.map((n) => ({ n, y: n.y }))
          .concat(others.map((o) => ({ o, y: o.y })), [{ me: true, y: player.y }])
          .sort((a, b) => a.y - b.y);
        ents.forEach((e) => {
          if (e.me) {
            drawChar(player.x * T, player.y * T, S().profile.avatar, '#5eead4', true, t);
            drawTag(player.x * T, player.y * T, 'Dr. ' + S().profile.name, 'rgba(15,23,42,.75)');
            return;
          }
          if (e.o) {
            drawChar(e.o.x * T, e.o.y * T, e.o.avatar, '#fde68a', false, t);
            drawTag(e.o.x * T, e.o.y * T, `Dr. ${e.o.name} · ${e.o.level}`, 'rgba(120,53,15,.8)');
            return;
          }
          const n = e.n;
          if (n.obj) {
            c2d.fillStyle = 'rgba(255,255,255,.85)';
            c2d.beginPath(); c2d.arc(n.x * T, n.y * T, T * 0.36, 0, Math.PI * 2); c2d.fill();
            c2d.font = `${Math.round(T * 0.5)}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
            c2d.textAlign = 'center'; c2d.textBaseline = 'middle';
            c2d.fillText(n.emoji, n.x * T, n.y * T + 1);
          } else {
            drawChar(n.x * T, n.y * T, n.emoji, n.color, false, t);
          }
          drawBubble(n.x * T, n.y * T, npcStatus(n), t);
          if (n === near) {
            c2d.strokeStyle = 'rgba(45,212,191,.9)'; c2d.lineWidth = 3;
            c2d.beginPath(); c2d.arc(n.x * T, n.y * T, T * 0.46 + Math.sin(t / 200) * 2, 0, Math.PI * 2); c2d.stroke();
          }
        });
        if (target && !target.npc) {
          c2d.strokeStyle = 'rgba(15,118,110,.6)'; c2d.lineWidth = 2;
          c2d.beginPath(); c2d.arc(target.x * T, target.y * T, T * 0.18, 0, Math.PI * 2); c2d.stroke();
        }
      }

      const R = 0.28;
      const hits = (x, y) => blocked(x - R, y - R) || blocked(x + R, y - R) || blocked(x - R, y + R) || blocked(x + R, y + R)
        || NPCS.some((n) => (n.x - x) ** 2 + (n.y - y) ** 2 < 0.36);
      function move(dx, dy) {
        if (!hits(player.x + dx, player.y)) player.x += dx;
        if (!hits(player.x, player.y + dy)) player.y += dy;
      }

      const TALK = 1.6;
      function update(dt) {
        if (dialogOpen) return;
        let vx = 0;
        let vy = 0;
        if (keys.has('ArrowLeft') || keys.has('a')) vx -= 1;
        if (keys.has('ArrowRight') || keys.has('d')) vx += 1;
        if (keys.has('ArrowUp') || keys.has('w')) vy -= 1;
        if (keys.has('ArrowDown') || keys.has('s')) vy += 1;
        if (joyVec) { vx = joyVec.x; vy = joyVec.y; }
        if (vx || vy) target = null;
        else if (target) {
          const tx = target.x - player.x;
          const ty = target.y - player.y;
          const dist = Math.hypot(tx, ty);
          const stopAt = target.npc ? TALK * 0.8 : 0.08;
          if (dist <= stopAt) {
            const n = target.npc;
            target = null;
            if (n) interact(n);
          } else {
            vx = tx / dist;
            vy = ty / dist;
          }
        }
        const mag = Math.hypot(vx, vy);
        if (mag > 0) {
          const sp = 4.2 * dt * Math.min(1, mag) / mag;
          const bx = player.x;
          const by = player.y;
          move(vx * sp, vy * sp);
          if (vx) facing = Math.sign(vx);
          walkT += dt;
          if (target && Math.hypot(player.x - bx, player.y - by) < 0.0005) {
            target.stuck = (target.stuck || 0) + dt;
            if (target.stuck > 0.35) target = null;
          }
        } else walkT = 0;

        let best = null;
        let bd = TALK;
        NPCS.forEach((n) => { const d = Math.hypot(n.x - player.x, n.y - player.y); if (d < bd) { bd = d; best = n; } });
        if (best !== near) {
          near = best;
          talkBtn.classList.toggle('hidden', !near);
          if (near) talkBtn.innerHTML = `<span>${near.emoji}</span> Talk to <b>${esc(near.name)}</b>`;
        }
      }

      function frame(now) {
        if (!canvas.isConnected) return cleanup();
        debug.frames++;
        const dt = Math.min(0.05, (now - last) / 1000);
        last = now;
        update(dt);
        if (G.net()) G.net().worldTick(player, now, day);
        draw(now);
        raf = requestAnimationFrame(frame);
      }

      function persist() {
        S().rpg.pos = { x: Math.round(player.x * 100) / 100, y: Math.round(player.y * 100) / 100, f: day };
        G.save();
      }

      // ---------- dialog ----------
      function closeDialog() {
        dialog.classList.add('hidden');
        dialogOpen = false;
      }
      function openDialog(n, lineIdx = 0) {
        dialogOpen = true;
        keys.clear();
        joyVec = null;
        const lines = n.lines || [];
        const lastLine = lineIdx >= lines.length - 1;
        const buttons = lastLine ? actionButtons(n) : [{ label: 'Next ▸', cls: 'btn primary', fn: () => openDialog(n, lineIdx + 1) }];
        dialog.innerHTML = `<div class="dlg-head"><span class="dlg-av" style="background:${n.obj ? '#fff' : n.color}">${n.emoji}</span><b>${esc(n.name)}</b><button class="dlg-x" aria-label="Close">✕</button></div>
          <div class="dlg-text">${lines[lineIdx] ? esc(lines[lineIdx]) : ''}</div>
          ${lastLine ? actionInfo(n) : ''}
          <div class="dlg-actions"></div>`;
        const box = dialog.querySelector('.dlg-actions');
        buttons.forEach((b) => {
          const btn = el(`<button class="${b.cls}">${b.label}</button>`);
          btn.onclick = b.fn;
          box.appendChild(btn);
        });
        dialog.querySelector('.dlg-x').onclick = closeDialog;
        dialog.querySelectorAll('[data-floor]').forEach((b) => {
          b.onclick = () => {
            const id = +b.dataset.floor;
            S().rpg.floor = id;
            persist();
            const to = floorDef(id).arrive || floorDef(id).spawn;
            S().rpg.pos = { x: to.x, y: to.y, f: id };
            G.toast(`🛗 Floor ${id}: ${esc(G.DAYS[id - 1].title)}`, 'good');
            viewWorld();
          };
        });
        dialog.classList.remove('hidden');
        box.querySelector('.btn')?.focus();
      }
      const leaveTo = (hash) => { sessionStorage.setItem('endo.from', 'world'); persist(); G.go(hash); };
      function actionInfo(n) {
        const a = n.act;
        if (a.type === 'station') {
          const status = npcStatus(n);
          const station = G.CONTENT[a.day].stations.find((s) => s.id === a.station);
          const rec = dayRec(a.day).stations[a.station];
          if (status === 'lock') return `<div class="dlg-info">🔒 ${station.type === 'pearls' ? `Clear every other Day ${a.day} case first.` : 'This day is not unlocked yet.'}</div>`;
          return `<div class="dlg-info">${station.icon} <b>${esc(station.title)}</b>${rec?.done ? ` · best ${rec.score}/${rec.max} XP · replays are practice` : ''}</div>`;
        }
        if (NET_ROUTES[a.type]) return G.net() ? G.net().info(a.type) : '';
        if (a.type === 'elevator') {
          return `<div class="floors">${G.DAYS.map((d) => {
            const open = G.isUnlocked(d.id);
            const here = d.id === day;
            const status = here ? 'You are here' : !G.hasContent(d.id) ? 'Under construction' : !open ? `Complete Day ${d.id - 1} first` : dayRec(d.id).completed ? 'Complete ✓' : 'Open ▸';
            const tag = open && !here ? 'button' : 'div';
            const plan = d.id === 1 ? D.world : D.floors && D.floors[d.id];
            const where = plan ? `<em>${esc(plan.name)}</em>` : '';
            return `<${tag} class="floor ${here ? 'here' : ''} ${open ? '' : 'off'}" ${tag === 'button' ? `data-floor="${d.id}"` : ''}><b>${d.id}</b><span>${d.badge.icon} ${esc(d.title)}${where}</span><small>${status}</small></${tag}>`;
          }).join('')}</div>`;
        }
        return '';
      }
      function actionButtons(n) {
        const a = n.act;
        const bye = { label: 'Leave', cls: 'btn ghost', fn: closeDialog };
        switch (a.type) {
          case 'station': {
            const status = npcStatus(n);
            if (status === 'lock') return [bye];
            return [bye, { label: status === 'done' ? 'Replay (practice)' : 'Start case ▸', cls: 'btn primary', fn: () => leaveTo(`#/day/${a.day}/s/${a.station}`) }];
          }
          case 'shop': return [bye, { label: 'Browse ▸', cls: 'btn primary', fn: () => leaveTo('#/shop') }];
          case 'lab': return [bye, { label: 'Open crafting ▸', cls: 'btn primary', fn: () => leaveTo('#/lab') }];
          case 'days': return [bye, { label: 'Open schedule ▸', cls: 'btn primary', fn: () => leaveTo('#/days') }];
          case 'tutorial': return [{ label: 'Got it', cls: 'btn primary', fn: () => { S().rpg.seenIntro = true; G.save(); closeDialog(); } }];
          case 'account': case 'guild': case 'raid': case 'duel': case 'market': case 'hiscores':
            return [bye, { label: 'Open ▸', cls: 'btn primary', fn: () => leaveTo(NET_ROUTES[a.type]) }];
          default: return [{ label: 'OK', cls: 'btn primary', fn: closeDialog }];
        }
      }
      function interact(n) {
        if (Math.hypot(n.x - player.x, n.y - player.y) > TALK) { target = { x: n.x, y: n.y, npc: n }; return; }
        openDialog(n);
      }
      talkBtn.onclick = () => near && interact(near);

      // ---------- input ----------
      const onKey = (e) => {
        if (!canvas.isConnected) return;
        const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (e.type === 'keydown') {
          if (dialogOpen) { if (k === 'Escape') closeDialog(); return; }
          if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(k)) e.preventDefault();
          if ((k === 'e' || k === 'Enter' || k === ' ') && near) return interact(near);
          keys.add(k);
        } else keys.delete(k);
      };
      window.addEventListener('keydown', onKey);
      window.addEventListener('keyup', onKey);

      let ptr = null;
      canvas.addEventListener('pointerdown', (e) => {
        if (dialogOpen) return;
        canvas.setPointerCapture(e.pointerId);
        ptr = { id: e.pointerId, x: e.clientX, y: e.clientY, t: performance.now(), moved: false };
      });
      canvas.addEventListener('pointermove', (e) => {
        if (!ptr || e.pointerId !== ptr.id) return;
        const dx = e.clientX - ptr.x;
        const dy = e.clientY - ptr.y;
        const d = Math.hypot(dx, dy);
        if (!ptr.moved && d > 12) {
          ptr.moved = true;
          const rect = world.getBoundingClientRect();
          joy.style.left = `${ptr.x - rect.left}px`;
          joy.style.top = `${ptr.y - rect.top}px`;
          joy.classList.remove('hidden');
        }
        if (ptr.moved) {
          const max = 50;
          const k = Math.min(1, d / max);
          joyVec = { x: (dx / d) * k, y: (dy / d) * k };
          knob.style.transform = `translate(${(dx / d) * Math.min(d, max)}px, ${(dy / d) * Math.min(d, max)}px)`;
        }
      });
      const endPtr = (e) => {
        if (!ptr || e.pointerId !== ptr.id) return;
        if (!ptr.moved && performance.now() - ptr.t < 400) {
          const rect = canvas.getBoundingClientRect();
          const ww = W.w * T;
          const wh = W.h * T;
          const camX = ww < vw ? (ww - vw) / 2 : Math.max(0, Math.min(ww - vw, player.x * T - vw / 2));
          const camY = wh < vh ? (wh - vh) / 2 : Math.max(0, Math.min(wh - vh, player.y * T - vh / 2));
          const wx = (e.clientX - rect.left + camX) / T;
          const wy = (e.clientY - rect.top + camY) / T;
          const hit = NPCS.find((n) => Math.hypot(n.x - wx, n.y - wy) < 0.6);
          if (hit) interact(hit);
          else if (!blocked(wx, wy)) target = { x: wx, y: wy };
        }
        ptr = null;
        joyVec = null;
        joy.classList.add('hidden');
        knob.style.transform = '';
      };
      canvas.addEventListener('pointerup', endPtr);
      canvas.addEventListener('pointercancel', endPtr);

      const onResize = () => layout();
      const onHide = () => { if (document.visibilityState === 'hidden') persist(); };
      const onHash = () => persist();
      window.addEventListener('resize', onResize);
      document.addEventListener('visibilitychange', onHide);
      window.addEventListener('hashchange', onHash, { once: true });

      function cleanup() {
        cancelAnimationFrame(raf);
        window.removeEventListener('keydown', onKey);
        window.removeEventListener('keyup', onKey);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onHide);
        window.removeEventListener('hashchange', onHash);
        cleanupWorld = null;
      }
      cleanupWorld = cleanup;

      layout();
      if (G.net()) G.net().hud();
      raf = requestAnimationFrame(frame);
      if (!r.seenIntro) {
        const jordan = NPCS.find((n) => n.act.type === 'tutorial');
        if (jordan) setTimeout(() => { if (canvas.isConnected) openDialog(jordan); }, 400);
      }
      Object.assign(debug, { player, interact: (id) => openDialog(NPCS.find((n) => n.id === id)) });
    }

    return {
      ensure, levelInfo, titleFor, levelFor, xpForLevel, skillPoints, perks, perkLines,
      stationStart, narrowLeft, useNarrow, afterXP, stationComplete,
      views: { world: viewWorld, character: viewCharacter, shop: viewShop, lab: viewLab }
    };
  }
};
