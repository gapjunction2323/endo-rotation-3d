/* The Realm of Corporia world map.
   Draws an interactive parchment map from window.CORPORIA (content/world.js): realm territories,
   landmarks, arterial rivers, neural roads, Lymph Gates and world bosses, plus the realm dossier and
   the board-category ledger under the map. No libraries; everything is generated SVG. */
(() => {
  'use strict';
  const C = window.CORPORIA;
  if (!C) return;
  const [MW, MH] = C.size;
  const INK = '#3a2a1a';
  const REALMS = C.realms;
  const byId = Object.fromEntries(REALMS.map((r) => [r.id, r]));
  const SITES = [];
  REALMS.forEach((r) => r.sites.forEach((s, i) => SITES.push({ realm: r, site: s, main: i === 0 })));
  const siteById = Object.fromEntries(SITES.map((x) => [x.site.id, x]));
  const homeOf = Object.fromEntries(SITES.map((x) => [x.site.category, x]));
  const floorsOf = (s) => (s.kind === 'dungeon' ? 10 : 5);
  const KIND = { dungeon: '10-floor dungeon', tower: '5-floor tower', guild: 'Guild hall · 5 floors' };
  const siteAt = (x) => x.site.at || x.realm.at;
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- small utilities ----------
  const $ = (s, root = document) => root.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const r1 = (n) => Math.round(n * 10) / 10;
  const P = (p) => `${r1(p[0])},${r1(p[1])}`;
  const lineD = (pts, closed) => `M${pts.map(P).join('L')}${closed ? 'Z' : ''}`;
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function shade(hex, f) {
    const n = parseInt(hex.slice(1), 16);
    const c = [n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.max(0, Math.min(255, Math.round(v * f))));
    return `rgb(${c.join(',')})`;
  }

  // ---------- geometry ----------
  function catmull(pts, closed, seg) {
    const out = [];
    const n = pts.length;
    const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    const last = closed ? n : n - 1;
    for (let i = 0; i < last; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let k = 0; k < seg; k++) {
        const t = k / seg, t2 = t * t, t3 = t2 * t;
        out.push([0, 1].map((d) => 0.5 * (2 * p1[d] + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3)));
      }
    }
    if (!closed) out.push(pts[n - 1].slice());
    return out;
  }
  function normals(pts, closed) {
    const n = pts.length;
    return pts.map((p, i) => {
      const a = pts[closed ? (i - 1 + n) % n : Math.max(0, i - 1)];
      const b = pts[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const L = Math.hypot(dx, dy) || 1;
      return [-dy / L, dx / L];
    });
  }
  function roughen(pts, closed, fn) {
    const ns = normals(pts, closed);
    let s = 0;
    return pts.map((p, i) => {
      if (i) s += Math.hypot(p[0] - pts[i - 1][0], p[1] - pts[i - 1][1]);
      const o = fn(s, i, pts.length);
      return [p[0] + ns[i][0] * o, p[1] + ns[i][1] * o];
    });
  }
  function inPoly(x, y, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function distToPath(x, y, pts, closed) {
    let best = Infinity;
    const n = pts.length;
    for (let i = 0; i < (closed ? n : n - 1); i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      const dx = b[0] - a[0], dy = b[1] - a[1];
      const L = dx * dx + dy * dy || 1;
      let t = ((x - a[0]) * dx + (y - a[1]) * dy) / L;
      t = t < 0 ? 0 : t > 1 ? 1 : t;
      const ex = a[0] + t * dx - x, ey = a[1] + t * dy - y;
      const d = ex * ex + ey * ey;
      if (d < best) best = d;
    }
    return Math.sqrt(best);
  }
  function clipHalf(poly, m, n) {
    const out = [];
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      const da = (a[0] - m[0]) * n[0] + (a[1] - m[1]) * n[1];
      const db = (b[0] - m[0]) * n[0] + (b[1] - m[1]) * n[1];
      if (da <= 0) out.push(a);
      if ((da <= 0) !== (db <= 0)) { const t = da / (da - db); out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]); }
    }
    return out;
  }
  function ribbon(pts, w0, w1) {
    const ns = normals(pts, false);
    const L = [], R = [];
    pts.forEach((p, i) => {
      const w = (w0 + (w1 - w0) * (i / (pts.length - 1))) / 2;
      L.push([p[0] + ns[i][0] * w, p[1] + ns[i][1] * w]);
      R.push([p[0] - ns[i][0] * w, p[1] - ns[i][1] * w]);
    });
    return lineD(L.concat(R.reverse()), true);
  }

  // ---------- world geometry ----------
  const coast = roughen(catmull(C.coast, true, 12), true,
    (s) => 6 * Math.sin(s / 43 + 1.3) + 3.4 * Math.sin(s / 15.5 + 0.4) + 1.6 * Math.sin(s / 6.3 + 2.1));
  const coastD = lineD(coast, true);
  const onLand = (x, y) => inPoly(x, y, coast);

  // Realm territories: a Voronoi split of the land around each realm's seed, with hand-drawn borders.
  const seeded = REALMS.filter((r) => r.seed);
  const BOX = [[0, 0], [MW, 0], [MW, MH], [0, MH]];
  const cells = seeded.map((r) => {
    let poly = BOX.map((p) => p.slice());
    for (const o of seeded) {
      if (o === r) continue;
      poly = clipHalf(poly, [(r.seed[0] + o.seed[0]) / 2, (r.seed[1] + o.seed[1]) / 2], [o.seed[0] - r.seed[0], o.seed[1] - r.seed[1]]);
    }
    return { realm: r, poly: poly.map((p) => [Math.round(p[0] * 100) / 100, Math.round(p[1] * 100) / 100]) };
  });
  const edgeCache = new Map();
  const onEdgeOfBox = (a, b) => (a[0] <= 0.01 && b[0] <= 0.01) || (a[0] >= MW - 0.01 && b[0] >= MW - 0.01) || (a[1] <= 0.01 && b[1] <= 0.01) || (a[1] >= MH - 0.01 && b[1] >= MH - 0.01);
  function borderPts(a, b) {
    if (onEdgeOfBox(a, b)) return [a, b];
    const ka = P(a), kb = P(b), fwd = ka < kb, key = fwd ? `${ka}|${kb}` : `${kb}|${ka}`;
    let pts = edgeCache.get(key);
    if (!pts) {
      const A = fwd ? a : b, B = fwd ? b : a;
      const len = Math.hypot(B[0] - A[0], B[1] - A[1]) || 1;
      const n = Math.max(2, Math.round(len / 13));
      const rnd = rng(hashStr(key));
      const ph1 = rnd() * 6.28, ph2 = rnd() * 6.28, amp = Math.min(10, len * 0.06);
      const nx = -(B[1] - A[1]) / len, ny = (B[0] - A[0]) / len;
      pts = [A];
      for (let i = 1; i < n; i++) {
        const t = i / n;
        const o = amp * Math.sin(Math.PI * t) * (0.65 * Math.sin(6.28 * t + ph1) + 0.35 * Math.sin(15 * t + ph2)) + (rnd() - 0.5) * 1.4;
        pts.push([A[0] + (B[0] - A[0]) * t + nx * o, A[1] + (B[1] - A[1]) * t + ny * o]);
      }
      pts.push(B);
      edgeCache.set(key, pts);
    }
    return fwd ? pts : pts.slice().reverse();
  }
  cells.forEach((c) => {
    const out = [];
    c.poly.forEach((p, i) => out.push(...borderPts(p, c.poly[(i + 1) % c.poly.length]).slice(0, -1)));
    c.rough = out;
    c.d = lineD(out, true);
  });
  const cellOf = Object.fromEntries(cells.map((c) => [c.realm.id, c]));

  // Travel geometry.
  const T = C.travel;
  const meander = (pts) => roughen(catmull(pts, false, 16), false, (s, i, n) => {
    const edge = Math.min(1, i / 8, (n - 1 - i) / 8);
    return edge * (2.6 * Math.sin(s / 23) + 1.1 * Math.sin(s / 9.5 + 1));
  });
  const rivers = T.rivers.routes.map((r) => ({ ...r, pts: meander([T.rivers.from, ...r.via, r.end]) }));
  const returns = T.rivers.returns.map((r) => ({ ...r, pts: meander([...r.points, r.end]) }));
  const roads = T.roads.paths.map((p) => ({ ...p, pts: catmull(p.points, false, 10) }));
  const bastionGate = byId.bastion.gate;
  const gateLinks = REALMS.filter((r) => r.id !== 'bastion').map((r) => {
    const a = r.gate, b = bastionGate;
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1], len = Math.hypot(dx, dy) || 1;
    const bend = Math.min(80, len * 0.16);
    const c = [mx - (dy / len) * bend, my + (dx / len) * bend];
    return { from: r.id, d: `M${P(a)}Q${P(c)} ${P(b)}` };
  });

  // ---------- labels ----------
  const LABELS = [];
  REALMS.forEach((r) => {
    LABELS.push({ realm: r.id, kind: 'realm', x: r.label[0], y: r.label[1], text: r.name.toUpperCase(), cap: r.caption === undefined ? r.short : r.caption, anchor: r.anchor || 'middle' });
    r.sites.forEach((s) => { if (s.label) LABELS.push({ realm: r.id, site: s.id, kind: 'site', x: s.label[0], y: s.label[1], text: s.name, cap: s.caption, anchor: s.anchor || 'middle' }); });
  });
  function labelBox(l) {
    const big = l.kind === 'realm';
    const w = Math.max(l.text.length * (big ? 11.6 : 7.5), (l.cap || '').length * (big ? 6.6 : 6.2));
    const x0 = l.anchor === 'start' ? l.x : l.anchor === 'end' ? l.x - w : l.x - w / 2;
    return [x0 - 4, l.y - (big ? 16 : 14), x0 + w + 4, l.y + (l.cap ? (big ? 24 : 20) : 6)];
  }

  // ---------- keep-out grid (glyphs stay off icons, labels, rivers and roads) ----------
  const CELL = 4, GW = Math.ceil(MW / CELL), GH = Math.ceil(MH / CELL);
  const occ = new Uint8Array(GW * GH);
  function markCircle(x, y, r) {
    const gx0 = Math.max(0, Math.floor((x - r) / CELL)), gx1 = Math.min(GW - 1, Math.floor((x + r) / CELL));
    const gy0 = Math.max(0, Math.floor((y - r) / CELL)), gy1 = Math.min(GH - 1, Math.floor((y + r) / CELL));
    for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
      const dx = gx * CELL + 2 - x, dy = gy * CELL + 2 - y;
      if (dx * dx + dy * dy <= r * r) occ[gy * GW + gx] = 1;
    }
  }
  function markBox(x0, y0, x1, y1) {
    for (let gy = Math.max(0, Math.floor(y0 / CELL)); gy <= Math.min(GH - 1, Math.floor(y1 / CELL)); gy++)
      for (let gx = Math.max(0, Math.floor(x0 / CELL)); gx <= Math.min(GW - 1, Math.floor(x1 / CELL)); gx++) occ[gy * GW + gx] = 1;
  }
  const isOcc = (x, y) => {
    const gx = Math.floor(x / CELL), gy = Math.floor(y / CELL);
    return gx < 0 || gy < 0 || gx >= GW || gy >= GH || occ[gy * GW + gx] === 1;
  };
  SITES.forEach((x) => { const [sx, sy] = siteAt(x); markCircle(sx, sy - 16, x.realm.kind === 'hub' ? 0 : x.main ? 54 : 40); });
  markCircle(byId.hub.at[0], byId.hub.at[1], 74);
  REALMS.forEach((r) => markCircle(r.gate[0], r.gate[1], 14));
  C.worldBosses.forEach((b) => { markCircle(b.at[0], b.at[1], 20); markBox(b.at[0] - 80, b.at[1] + 16, b.at[0] + 80, b.at[1] + 34); });
  LABELS.forEach((l) => markBox(...labelBox(l)));
  rivers.concat(returns).forEach((r) => r.pts.forEach((p) => markCircle(p[0], p[1], 9)));
  roads.forEach((r) => r.pts.forEach((p) => markCircle(p[0], p[1], 7)));

  // ---------- terrain glyphs, batched into a few long paths ----------
  const B = {};
  const STYLE = {
    mtnFill: 'fill="#f6efdc"', mtnDark: 'fill="#d3cbdd"', snow: 'fill="#ffffff"', rockFill: 'fill="#ddd3bf"',
    conifer: `fill="#7f9b76" stroke="${INK}" stroke-width=".9"`, treeGreen: `fill="#a5bb88" stroke="${INK}" stroke-width=".9"`,
    treeOlive: `fill="#aeb373" stroke="${INK}" stroke-width=".9"`, treeDeep: `fill="#8aa47c" stroke="${INK}" stroke-width=".9"`,
    twisted: `fill="#aaa0c0" stroke="${INK}" stroke-width=".9"`, crystal: `fill="#cdeff1" stroke="${INK}" stroke-width=".9"`,
    salt: `fill="#fbfaf5" stroke="#8aa5ac" stroke-width=".8"`, mushroom: `fill="#c27c64" stroke="${INK}" stroke-width=".9"`,
    stem: `fill="#f1e6ca" stroke="${INK}" stroke-width=".8"`, flower: 'fill="#d8909f"', flowerEye: 'fill="#e6c55a"',
    hedge: `fill="#90b07c" stroke="${INK}" stroke-width=".9"`, field: `fill="#e8d69f" stroke="${INK}" stroke-width=".8"`,
    cloud: `fill="#fbfaf6" stroke="${INK}" stroke-width=".8"`, bubble: `fill="#e1ebb8" stroke="#6b7a38" stroke-width=".8"`,
    line: `fill="none" stroke="${INK}" stroke-width="1.05" stroke-linecap="round" stroke-linejoin="round" opacity=".85"`,
    hatch: `fill="none" stroke="${INK}" stroke-width=".75" stroke-linecap="round" opacity=".45"`,
    mist: 'fill="none" stroke="#9a8db8" stroke-width="1.3" stroke-linecap="round" opacity=".85"',
    dune: 'fill="none" stroke="#9a7b40" stroke-width="1.2" stroke-linecap="round"',
    duneHatch: 'fill="none" stroke="#9a7b40" stroke-width=".7" stroke-linecap="round" opacity=".6"',
    ripple: 'fill="none" stroke="#5e9cb1" stroke-width="1.1" stroke-linecap="round" opacity=".85"',
    lava: 'fill="none" stroke="#c8492b" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" opacity=".9"',
    reed: 'fill="none" stroke="#6b7838" stroke-width="1.1" stroke-linecap="round"',
    palm: 'fill="none" stroke="#5f7d45" stroke-width="1.5" stroke-linecap="round"'
  };
  const ORDER = ['field', 'mtnFill', 'mtnDark', 'rockFill', 'snow', 'hedge', 'treeGreen', 'treeOlive', 'treeDeep', 'conifer', 'twisted', 'crystal', 'salt', 'mushroom', 'stem', 'flower', 'flowerEye', 'cloud', 'bubble', 'hatch', 'line', 'mist', 'dune', 'duneHatch', 'ripple', 'lava', 'reed', 'palm'];
  const push = (k, d) => { (B[k] || (B[k] = [])).push(d); };
  const n2 = (v) => r1(v);
  const GLYPH = {
    mountain(x, y, s, v) {
      const w = 12 * s, h = 15 * s;
      const d = `M${n2(x - w)},${n2(y)}L${n2(x - w * 0.2)},${n2(y - h)}L${n2(x + w)},${n2(y)}`;
      push(v === 'dark' ? 'mtnDark' : 'mtnFill', `${d}Z`);
      if (v === 'snow') push('snow', `M${n2(x - w * 0.47)},${n2(y - h * 0.6)}L${n2(x - w * 0.2)},${n2(y - h)}L${n2(x + w * 0.12)},${n2(y - h * 0.68)}L${n2(x - w * 0.06)},${n2(y - h * 0.74)}Z`);
      push('line', d);
      push('hatch', `M${n2(x + w * 0.02)},${n2(y - h * 0.78)}l${n2(w * 0.32)},${n2(h * 0.52)}M${n2(x + w * 0.3)},${n2(y - h * 0.5)}l${n2(w * 0.26)},${n2(h * 0.4)}`);
    },
    conifer(x, y, s) {
      push('conifer', `M${n2(x)},${n2(y - 16 * s)}L${n2(x - 5.5 * s)},${n2(y - 5 * s)}L${n2(x + 5.5 * s)},${n2(y - 5 * s)}ZM${n2(x)},${n2(y - 11 * s)}L${n2(x - 7 * s)},${n2(y + 0.5 * s)}L${n2(x + 7 * s)},${n2(y + 0.5 * s)}Z`);
      push('line', `M${n2(x)},${n2(y + 0.5 * s)}V${n2(y + 3.5 * s)}`);
    },
    tree(x, y, s, k) {
      const r = 6 * s;
      push(k, `M${n2(x - r)},${n2(y - 8 * s)}a${n2(r)},${n2(r)} 0 1 1 ${n2(2 * r)},0a${n2(r)},${n2(r)} 0 1 1 ${n2(-2 * r)},0Z`);
      push('line', `M${n2(x)},${n2(y - 2.4 * s)}V${n2(y + 2 * s)}`);
    },
    deadTree(x, y, s) { push('line', `M${n2(x)},${n2(y)}V${n2(y - 14 * s)}M${n2(x)},${n2(y - 9 * s)}l${n2(-5 * s)},${n2(-5 * s)}M${n2(x)},${n2(y - 11 * s)}l${n2(4 * s)},${n2(-4.5 * s)}M${n2(x)},${n2(y - 5 * s)}l${n2(4 * s)},${n2(-3 * s)}`); },
    twisted(x, y, s) {
      push('line', `M${n2(x)},${n2(y)}C${n2(x - 5 * s)},${n2(y - 5 * s)} ${n2(x + 4 * s)},${n2(y - 9 * s)} ${n2(x - 1 * s)},${n2(y - 14 * s)}`);
      const c = (cx, cy, r) => `M${n2(cx - r)},${n2(cy)}a${n2(r)},${n2(r)} 0 1 1 ${n2(2 * r)},0a${n2(r)},${n2(r)} 0 1 1 ${n2(-2 * r)},0Z`;
      push('twisted', c(x - 3.5 * s, y - 15 * s, 4.4 * s) + c(x + 3 * s, y - 13 * s, 3.6 * s));
    },
    mist(x, y, s) { push('mist', `M${n2(x - 9 * s)},${n2(y)}c${n2(4 * s)},${n2(-6 * s)} ${n2(12 * s)},${n2(-3 * s)} ${n2(9 * s)},${n2(2 * s)}c${n2(-2 * s)},${n2(3 * s)} ${n2(-6 * s)},${n2(1 * s)} ${n2(-4 * s)},${n2(-2 * s)}`); },
    dune(x, y, s) {
      push('dune', `M${n2(x - 12 * s)},${n2(y)}Q${n2(x - 1 * s)},${n2(y - 8 * s)} ${n2(x + 12 * s)},${n2(y)}`);
      push('duneHatch', `M${n2(x + 2 * s)},${n2(y - 4.5 * s)}l${n2(5 * s)},${n2(3.5 * s)}M${n2(x + 5.5 * s)},${n2(y - 3 * s)}l${n2(3.5 * s)},${n2(2.6 * s)}`);
    },
    crystal(x, y, s) {
      const c = (cx, h, w) => `M${n2(cx - w)},${n2(y)}V${n2(y - h + w)}L${n2(cx)},${n2(y - h)}L${n2(cx + w)},${n2(y - h + w)}V${n2(y)}Z`;
      push('crystal', c(x, 13 * s, 3 * s) + c(x + 5 * s, 8 * s, 2.3 * s));
    },
    palm(x, y, s) {
      push('line', `M${n2(x)},${n2(y)}Q${n2(x + 2 * s)},${n2(y - 7 * s)} ${n2(x + 1 * s)},${n2(y - 13 * s)}`);
      push('palm', `M${n2(x + 1 * s)},${n2(y - 13 * s)}q${n2(-5 * s)},${n2(-3 * s)} ${n2(-9 * s)},${n2(1 * s)}M${n2(x + 1 * s)},${n2(y - 13 * s)}q${n2(5 * s)},${n2(-3 * s)} ${n2(9 * s)},${n2(1.5 * s)}M${n2(x + 1 * s)},${n2(y - 13 * s)}q${n2(-2 * s)},${n2(-5 * s)} ${n2(-6 * s)},${n2(-6 * s)}M${n2(x + 1 * s)},${n2(y - 13 * s)}q${n2(3 * s)},${n2(-5 * s)} ${n2(7 * s)},${n2(-5 * s)}`);
    },
    ripple(x, y, s) { push('ripple', `M${n2(x - 7 * s)},${n2(y)}q${n2(3.5 * s)},${n2(-3 * s)} ${n2(7 * s)},0t${n2(7 * s)},0`); },
    salt(x, y, s) { push('salt', `M${n2(x)},${n2(y - 6 * s)}L${n2(x + 3 * s)},${n2(y - 2 * s)}L${n2(x)},${n2(y + 1 * s)}L${n2(x - 3 * s)},${n2(y - 2 * s)}Z`); },
    lava(x, y, s) { push('lava', `M${n2(x - 8 * s)},${n2(y)}l${n2(4 * s)},${n2(-3 * s)}l${n2(3 * s)},${n2(4 * s)}l${n2(4 * s)},${n2(-5 * s)}l${n2(4 * s)},${n2(3 * s)}`); },
    rock(x, y, s) {
      const d = `M${n2(x - 8 * s)},${n2(y)}L${n2(x - 5 * s)},${n2(y - 7 * s)}L${n2(x + 1 * s)},${n2(y - 9 * s)}L${n2(x + 7 * s)},${n2(y - 4 * s)}L${n2(x + 8 * s)},${n2(y)}`;
      push('rockFill', `${d}Z`); push('line', `${d}Z`);
      push('hatch', `M${n2(x + 2 * s)},${n2(y - 7 * s)}l${n2(3 * s)},${n2(6 * s)}`);
    },
    reed(x, y, s) {
      push('reed', `M${n2(x)},${n2(y)}l${n2(-2 * s)},${n2(-10 * s)}M${n2(x + 3 * s)},${n2(y)}l${n2(1 * s)},${n2(-12 * s)}M${n2(x - 3 * s)},${n2(y)}l${n2(-4 * s)},${n2(-8 * s)}`);
      push('ripple', `M${n2(x - 7 * s)},${n2(y + 1.5 * s)}h${n2(14 * s)}`);
    },
    bubble(x, y, s) {
      const c = (cx, cy, r) => `M${n2(cx - r)},${n2(cy)}a${n2(r)},${n2(r)} 0 1 1 ${n2(2 * r)},0a${n2(r)},${n2(r)} 0 1 1 ${n2(-2 * r)},0Z`;
      push('bubble', c(x, y - 3 * s, 2.6 * s) + c(x + 4 * s, y - 7 * s, 1.6 * s) + c(x - 3.5 * s, y - 8 * s, 1.2 * s));
    },
    mushroom(x, y, s) {
      push('stem', `M${n2(x - 1.8 * s)},${n2(y - 6 * s)}h${n2(3.6 * s)}v${n2(6 * s)}h${n2(-3.6 * s)}Z`);
      push('mushroom', `M${n2(x - 6 * s)},${n2(y - 6 * s)}Q${n2(x)},${n2(y - 15 * s)} ${n2(x + 6 * s)},${n2(y - 6 * s)}Z`);
    },
    flower(x, y, s) {
      let d = '';
      for (let i = 0; i < 5; i++) { const t = (i / 5) * Math.PI * 2; const cx = x + Math.cos(t) * 2.6 * s, cy = y - 4 * s + Math.sin(t) * 2.6 * s, r = 1.7 * s; d += `M${n2(cx - r)},${n2(cy)}a${n2(r)},${n2(r)} 0 1 1 ${n2(2 * r)},0a${n2(r)},${n2(r)} 0 1 1 ${n2(-2 * r)},0Z`; }
      push('flower', d);
      push('flowerEye', `M${n2(x - 1.2 * s)},${n2(y - 4 * s)}a${n2(1.2 * s)},${n2(1.2 * s)} 0 1 1 ${n2(2.4 * s)},0a${n2(1.2 * s)},${n2(1.2 * s)} 0 1 1 ${n2(-2.4 * s)},0Z`);
    },
    hedge(x, y, s) { push('hedge', `M${n2(x - 7 * s)},${n2(y)}c0,${n2(-8 * s)} ${n2(14 * s)},${n2(-8 * s)} ${n2(14 * s)},0Z`); },
    field(x, y, s) {
      push('field', `M${n2(x - 8 * s)},${n2(y)}L${n2(x + 6 * s)},${n2(y)}L${n2(x + 9 * s)},${n2(y - 6 * s)}L${n2(x - 5 * s)},${n2(y - 6 * s)}Z`);
      push('hatch', `M${n2(x - 4 * s)},${n2(y - 1 * s)}l${n2(2.5 * s)},${n2(-4 * s)}M${n2(x + 0.5 * s)},${n2(y - 1 * s)}l${n2(2.5 * s)},${n2(-4 * s)}M${n2(x + 5 * s)},${n2(y - 1 * s)}l${n2(2.5 * s)},${n2(-4 * s)}`);
    },
    cloud(x, y, s) { push('cloud', `M${n2(x - 10 * s)},${n2(y)}q${n2(2 * s)},${n2(-6 * s)} ${n2(8 * s)},${n2(-4 * s)}q${n2(3 * s)},${n2(-6 * s)} ${n2(10 * s)},${n2(-2 * s)}q${n2(6 * s)},0 ${n2(4 * s)},${n2(6 * s)}Z`); }
  };
  const BIOME = {
    spire: [['mountain', 6, 'snow'], ['conifer', 2], ['cloud', 0.6]],
    sanctum: [['dune', 5], ['crystal', 3], ['palm', 1]],
    citadel: [['rock', 4], ['mountain', 3, 'dark'], ['deadTree', 2]],
    veil: [['twisted', 5], ['mist', 3]],
    abyss: [['ripple', 4], ['salt', 3], ['rock', 2]],
    forge: [['lava', 4], ['rock', 3], ['mountain', 2, 'dark']],
    cauldron: [['reed', 4], ['bubble', 3], ['tree', 2, 'treeOlive']],
    marches: [['deadTree', 4], ['mushroom', 4], ['rock', 1]],
    genesis: [['tree', 4, 'treeGreen'], ['flower', 4], ['hedge', 2]],
    bulwark: [['rock', 4], ['mountain', 3, 'plain'], ['conifer', 2]],
    bastion: [['field', 4], ['tree', 3, 'treeDeep'], ['rock', 1]]
  };
  (function scatter() {
    const SP = 15, sg = new Map();
    const near = (x, y) => {
      const gx = Math.floor(x / SP), gy = Math.floor(y / SP);
      for (let j = gy - 1; j <= gy + 1; j++) for (let i = gx - 1; i <= gx + 1; i++) {
        const list = sg.get(`${i},${j}`);
        if (list) for (const p of list) if ((p[0] - x) ** 2 + (p[1] - y) ** 2 < SP * SP) return true;
      }
      return false;
    };
    const add = (x, y) => { const k = `${Math.floor(x / SP)},${Math.floor(y / SP)}`; (sg.get(k) || sg.set(k, []).get(k)).push([x, y]); };
    cells.forEach((c) => {
      const mix = BIOME[c.realm.id];
      if (!mix) return;
      const total = mix.reduce((n, m) => n + m[1], 0);
      const rnd = rng(hashStr(`glyph-${c.realm.id}`));
      const xs = c.poly.map((p) => p[0]), ys = c.poly.map((p) => p[1]);
      const x0 = Math.max(20, Math.min(...xs)), x1 = Math.min(MW - 20, Math.max(...xs));
      const y0 = Math.max(20, Math.min(...ys)), y1 = Math.min(MH - 20, Math.max(...ys));
      const tries = Math.round(((x1 - x0) * (y1 - y0)) / 90);
      for (let t = 0; t < tries; t++) {
        const x = x0 + rnd() * (x1 - x0), y = y0 + rnd() * (y1 - y0);
        if (!inPoly(x, y, c.rough) || !onLand(x, y) || isOcc(x, y - 6) || isOcc(x - 8, y) || isOcc(x + 8, y) || near(x, y)) continue;
        if (distToPath(x, y, coast, true) < 14) continue;
        add(x, y);
        let pick = rnd() * total, m = mix[0];
        for (const opt of mix) { pick -= opt[1]; if (pick <= 0) { m = opt; break; } }
        GLYPH[m[0]](x, y, 0.82 + rnd() * 0.36, m[2]);
      }
    });
  })();
  const glyphSvg = ORDER.filter((k) => B[k]).map((k) => `<path ${STYLE[k]} d="${B[k].join('')}"/>`).join('');

  // ---------- sea ----------
  const sea = (() => {
    const rnd = rng(777), pts = [], out = [];
    const avoid = (x, y) => (x < 470 && y < 96) || Math.hypot(x - 112, y - 872) < 76 || (x > 1470 && x < 1585 && y > 760 && y < 830) || (x < 96 && y > 400 && y < 640);
    for (let t = 0; t < 4000 && pts.length < 140; t++) {
      const x = 30 + rnd() * (MW - 60), y = 30 + rnd() * (MH - 60);
      if (onLand(x, y) || avoid(x, y) || distToPath(x, y, coast, true) < 26) continue;
      if (pts.some((p) => (p[0] - x) ** 2 + (p[1] - y) ** 2 < 46 * 46)) continue;
      pts.push([x, y]);
      out.push(`M${n2(x - 11)},${n2(y)}q5.5,-5 11,0t11,0`);
    }
    return out.join('');
  })();

  // ---------- landmarks ----------
  const skull = (x, y, s) => `<g transform="translate(${x},${y}) scale(${s})"><path d="M-7,1 a7,7 0 1 1 14,0 v3 q0,2 -2,2 h-10 q-2,0 -2,-2 z" fill="#f2ead6" stroke="${INK}" stroke-width="1.1"/><circle cx="-2.7" cy="-0.5" r="1.9" fill="${INK}"/><circle cx="2.7" cy="-0.5" r="1.9" fill="${INK}"/><path d="M-2.5,6 v-2.4 M0,6 v-2.4 M2.5,6 v-2.4" stroke="${INK}" stroke-width=".8"/></g>`;
  const LM = {
    hub: () => `
      <circle r="60" fill="#f4ecd6" stroke="${INK}" stroke-width="1.8"/>
      <circle r="53" fill="none" stroke="${INK}" stroke-width="6" stroke-dasharray="4.6 3.2" opacity=".85"/>
      <circle r="48.5" fill="none" stroke="${INK}" stroke-width=".9"/>
      <g transform="translate(-17,10)">
        <path d="M-19,-13 L0,-25 L19,-13 Z" fill="#e8dcbf" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
        <rect x="-18" y="-13" width="36" height="3" fill="${INK}"/>
        ${[-14, -6, 2, 10].map((cx) => `<rect x="${cx}" y="-10" width="4" height="16" fill="#f4ecd6" stroke="${INK}" stroke-width=".9"/>`).join('')}
        <rect x="-20" y="6" width="40" height="4" fill="#e8dcbf" stroke="${INK}" stroke-width="1"/>
      </g>
      <g transform="translate(23,2)">
        <path d="M-13,10 v-10 a13,13 0 0 1 26,0 v10 z" fill="#c8d6de" stroke="${INK}" stroke-width="1.3"/>
        <path d="M1,-11 l12,-12" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
        <rect x="-15" y="10" width="30" height="5" fill="#e8dcbf" stroke="${INK}" stroke-width="1"/>
      </g>
      <g transform="translate(0,-33)">
        <path d="M0,-10 V11" stroke="${INK}" stroke-width="2" stroke-linecap="round"/>
        <path d="M-4,-6 C4,-5 4,-1 -1,0.5 C-6,2 -4,6 4,7.5" fill="none" stroke="#4f7a46" stroke-width="1.7" stroke-linecap="round"/>
      </g>`,
    forge: () => `
      <path d="M-50,26 L-18,-22 Q0,-29 18,-22 L50,26 Z" fill="#b9836b" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M-36,26 L-14,-8 M34,26 L12,-10 M-22,26 L-6,0" stroke="${INK}" stroke-width="1" opacity=".3" fill="none"/>
      <ellipse cx="0" cy="-23" rx="17" ry="5.5" fill="url(#lavaGlow)" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-5,-20 C-9,-6 -16,4 -24,22 M5,-20 C9,-5 15,7 20,24" fill="none" stroke="#d6511f" stroke-width="3.2" stroke-linecap="round"/>
      ${[-27, -9, 9, 27].map((fx) => `<path d="M${fx - 5},24 v-7 a5,5 0 0 1 10,0 v7 z" fill="#ffb54a" stroke="${INK}" stroke-width="1"/>`).join('')}
      <path d="M-2,-29 c-9,-8 7,-13 -1,-22 c-7,-7 6,-12 1,-19" fill="none" stroke="#6d5d4d" stroke-width="1.8" stroke-linecap="round" opacity=".7"/>`,
    spire: () => `
      <path d="M-50,-24 q4,-8 12,-4 q4,-7 12,-2 q8,-1 6,6 z" fill="#fbfaf6" stroke="${INK}" stroke-width=".9"/>
      <path d="M-52,26 L-24,-20 L-8,4 L10,-36 L50,26 Z" fill="#eef2f4" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M-32,-7 L-24,-20 L-16,-8 L-21,-11 Z M1,-18 L10,-36 L19,-17 L12,-21 L8,-15 Z" fill="#ffffff" stroke="${INK}" stroke-width=".8"/>
      <path d="M15,-22 l11,22 M22,-10 l8,16 M-19,-13 l6,10" stroke="${INK}" stroke-width="1" opacity=".35" fill="none"/>
      <path d="M-24,-20 Q-7,-6 10,-36" fill="none" stroke="${INK}" stroke-width="1.2"/>
      <path d="M-17,-15 v5 M-10,-14 v6 M-3,-18 v6 M4,-25 v6" stroke="${INK}" stroke-width=".7" opacity=".6"/>
      <rect x="6" y="-70" width="8" height="36" fill="#f6f2e8" stroke="${INK}" stroke-width="1.3"/>
      <path d="M4,-70 L10,-84 L16,-70 Z" fill="#8aa6be" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M10,-63 v4 M10,-53 v4 M10,-43 v4" stroke="${INK}" stroke-width="1.4"/>`,
    sanctum: () => {
      const cr = (x, h, w) => `<path d="M${x - w},20 V${20 - h + w} L${x},${20 - h} L${x + w},${20 - h + w} V20 Z" fill="#c9eef0" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M${x},${20 - h} V20" stroke="${INK}" stroke-width=".8" opacity=".35"/>`;
      return `
      <path d="M-54,26 Q-28,10 0,22 Q26,8 54,26 Z" fill="#e5cd8f" stroke="${INK}" stroke-width="1.3"/>
      <ellipse cx="-24" cy="16" rx="18" ry="6" fill="#9fd0d9" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-24,12 C-29,-4 -18,-12 -24,-28 M-24,12 C-20,-2 -30,-10 -22,-22" fill="none" stroke="#7fb7c7" stroke-width="1.8" stroke-linecap="round"/>
      <circle cx="-30" cy="-30" r="1.6" fill="#7fb7c7"/><circle cx="-17" cy="-33" r="1.3" fill="#7fb7c7"/>
      ${cr(6, 54, 9)}${cr(21, 40, 7)}${cr(-6, 32, 6.5)}${cr(33, 26, 6)}`;
    },
    citadel: () => `
      <path d="M-34,-70 L-26,-58 L-31,-56 L-22,-44" fill="none" stroke="#e2bd34" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M36,-72 L28,-61 L33,-59 L24,-47" fill="none" stroke="#e2bd34" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>
      <path d="M-52,26 L-42,6 L-29,10 L-16,-2 L0,6 L17,-4 L32,8 L52,26 Z" fill="#a69fb6" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/>
      <rect x="-30" y="-14" width="60" height="22" fill="#dcd6e5" stroke="${INK}" stroke-width="1.4"/>
      <path d="M-30,-14 h60" stroke="${INK}" stroke-width="4.5" stroke-dasharray="4 3"/>
      <rect x="-9" y="-46" width="18" height="34" fill="#e6e1ec" stroke="${INK}" stroke-width="1.4"/>
      <path d="M-11,-46 L0,-70 L11,-46 Z" fill="#6c5e8b" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      <rect x="-31" y="-34" width="11" height="22" fill="#e6e1ec" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-33,-34 L-25.5,-50 L-18,-34 Z" fill="#6c5e8b" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <rect x="20" y="-34" width="11" height="22" fill="#e6e1ec" stroke="${INK}" stroke-width="1.3"/>
      <path d="M18,-34 L25.5,-50 L33,-34 Z" fill="#6c5e8b" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M-2,-36 v6 M2,-36 v6 M-27,-27 v5 M24,-27 v5" stroke="${INK}" stroke-width="1.6"/>
      <path d="M-5,8 v-8 a5,5 0 0 1 10,0 v8 z" fill="${INK}"/>`,
    optic: () => `
      <path d="M-20,8 Q0,-2 20,8 Z" fill="#a69fb6" stroke="${INK}" stroke-width="1.3"/>
      <rect x="-7" y="-32" width="14" height="36" fill="#e6e1ec" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-11,-32 h22 l-3,-6 h-16 z" fill="#d4cde3" stroke="${INK}" stroke-width="1.2"/>
      <path d="M-15,-49 Q0,-62 15,-49 Q0,-36 -15,-49 Z" fill="#fffdf6" stroke="${INK}" stroke-width="1.3"/>
      <circle cx="0" cy="-49" r="5.4" fill="#5d93b8" stroke="${INK}" stroke-width="1"/>
      <circle cx="0" cy="-49" r="2.1" fill="${INK}"/>
      <path d="M-2,-24 h4 M-2,-14 h4 M-2,-4 h4" stroke="${INK}" stroke-width="2"/>`,
    cochlear: () => {
      const pts = [];
      for (let i = 0; i <= 60; i++) { const a = (i / 60) * Math.PI * 5; const r = 11 - (i / 60) * 9.5; pts.push([Math.cos(a) * r, -48 + Math.sin(a) * r * 0.9]); }
      return `
      <path d="M-20,8 Q0,-2 20,8 Z" fill="#a69fb6" stroke="${INK}" stroke-width="1.3"/>
      <rect x="-7" y="-32" width="14" height="36" fill="#e6e1ec" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-11,-32 h22 l-3,-6 h-16 z" fill="#d4cde3" stroke="${INK}" stroke-width="1.2"/>
      <circle cx="0" cy="-48" r="12.5" fill="#f5ecd2" stroke="${INK}" stroke-width="1.2"/>
      <path d="${lineD(pts)}" fill="none" stroke="#a87a2c" stroke-width="2" stroke-linecap="round"/>
      <path d="M-2,-24 h4 M-2,-14 h4 M-2,-4 h4" stroke="${INK}" stroke-width="2"/>`;
    },
    abyss: () => `
      <path d="M-52,-24 H48 V-12 H-52 Z" fill="#cbc4b4" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-50,-19 H44" stroke="#7fb8c8" stroke-width="3"/>
      <rect x="-52" y="-12" width="100" height="34" fill="#d9d2c2" stroke="${INK}" stroke-width="1.3"/>
      ${[-36, -6, 24].map((ax) => `<path d="M${ax - 9},22 V6 A9,9 0 0 1 ${ax + 9},6 V22 Z" fill="#86aab2" stroke="${INK}" stroke-width="1.2"/>`).join('')}
      <path d="M-52,-2 H48" stroke="${INK}" stroke-width=".7" opacity=".3"/>
      <path d="M46,-19 C53,-8 53,10 51,24" fill="none" stroke="#6aa8ba" stroke-width="4.5" stroke-linecap="round"/>
      <ellipse cx="50" cy="25" rx="13" ry="4.2" fill="#a3d2dc" stroke="${INK}" stroke-width="1.1"/>
      <path d="M-46,30 l3,-5 l3,5 z M-38,30 l2,-4 l2,4 z" fill="#fbfaf5" stroke="#8fa9b0" stroke-width=".8"/>`,
    cauldron: () => `
      <path d="M31,-2 H42 V-32" fill="none" stroke="${INK}" stroke-width="5.5" stroke-linejoin="round"/>
      <path d="M31,-2 H42 V-32" fill="none" stroke="#8d8a7a" stroke-width="3" stroke-linejoin="round"/>
      <rect x="37" y="-38" width="10" height="7" fill="#6b6758" stroke="${INK}" stroke-width="1.1"/>
      <path d="M42,-40 c-6,-6 6,-10 0,-17" fill="none" stroke="#7d8c5a" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
      <path d="M-19,20 l-7,9 M19,20 l7,9 M0,23 v8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M-31,-6 C-33,24 33,24 31,-6 Z" fill="#4d493c" stroke="${INK}" stroke-width="1.5"/>
      <ellipse cx="0" cy="-6" rx="32" ry="7.5" fill="#5e5949" stroke="${INK}" stroke-width="1.5"/>
      <ellipse cx="0" cy="-6" rx="26.5" ry="5" fill="#a6c65c"/>
      <circle cx="-9" cy="-14" r="4.2" fill="#cde08f" stroke="${INK}" stroke-width=".8"/><circle cx="6" cy="-19" r="3.1" fill="#cde08f" stroke="${INK}" stroke-width=".8"/><circle cx="15" cy="-11" r="2.4" fill="#cde08f" stroke="${INK}" stroke-width=".8"/>`,
    veil: () => {
      const tree = (tx, ty, h) => `<path d="M${tx},${ty} C${tx - 6},${ty - h * 0.35} ${tx + 6},${ty - h * 0.6} ${tx - 1},${ty - h}" fill="none" stroke="${INK}" stroke-width="2.2" stroke-linecap="round"/><circle cx="${tx - 5}" cy="${ty - h - 2}" r="${r1(h * 0.2)}" fill="#a198bd" stroke="${INK}" stroke-width="1.1"/><circle cx="${tx + 5}" cy="${ty - h + 3}" r="${r1(h * 0.17)}" fill="#b3abcb" stroke="${INK}" stroke-width="1.1"/>`;
      return `
      <ellipse cx="0" cy="16" rx="52" ry="10" fill="#ece6f4" opacity=".9"/>
      ${tree(-24, 18, 36)}${tree(3, 14, 48)}${tree(27, 18, 32)}
      <ellipse cx="-30" cy="-46" rx="7" ry="10" fill="#e3ecf1" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-33,-52 l3,-3" stroke="#ffffff" stroke-width="1.6" stroke-linecap="round"/>
      <path d="M-50,0 c6,-8 16,-2 10,4 c-4,4 -10,0 -6,-4 M36,-8 c6,-7 15,-1 9,4 c-4,3 -9,0 -5,-4" fill="none" stroke="#8b7dab" stroke-width="1.5" stroke-linecap="round"/>`;
    },
    swamp: () => `
      <path d="M-32,10 C-28,-3 28,-5 32,8 C28,19 -28,21 -32,10 Z" fill="#9fbd5f" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-22,8 q6,-3 12,0 M6,12 q6,-3 12,0" fill="none" stroke="#5f7a2e" stroke-width="1" opacity=".8"/>
      ${skull(0, -12, 1)}
      <circle cx="-14" cy="0" r="2.4" fill="#d4e6a0" stroke="${INK}" stroke-width=".8"/><circle cx="16" cy="-1" r="1.8" fill="#d4e6a0" stroke="${INK}" stroke-width=".8"/>
      <path d="M-34,10 l-3,-14 M-30,8 l1,-12 M30,8 l3,-13 M34,10 l-1,-10" stroke="#6f6a3d" stroke-width="1.3" stroke-linecap="round"/>
      <path d="M-6,-24 c-5,-6 5,-9 0,-15 M7,-22 c-4,-5 4,-8 0,-13" fill="none" stroke="#7ea64a" stroke-width="1.5" stroke-linecap="round" opacity=".8"/>`,
    keep: () => {
      const tower = (tx) => `<rect x="${tx}" y="-30" width="14" height="48" fill="#b65a4f" stroke="${INK}" stroke-width="1.3"/><path d="M${tx - 2},-30 L${tx + 7},-46 L${tx + 16},-30 Z" fill="#7c2a24" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/><path d="M${tx + 7},-22 v6" stroke="${INK}" stroke-width="1.6"/>`;
      return `
      <rect x="-40" y="-16" width="80" height="34" fill="#c86b5f" stroke="${INK}" stroke-width="1.5"/>
      <path d="M-40,-16 h80" stroke="${INK}" stroke-width="4.5" stroke-dasharray="4 3"/>
      <path d="M-40,-2 h80 M-40,10 h80" stroke="${INK}" stroke-width=".7" opacity=".3"/>
      ${tower(-47)}${tower(33)}
      <rect x="-11" y="-38" width="22" height="26" fill="#d27e72" stroke="${INK}" stroke-width="1.4"/>
      <path d="M-13,-38 L0,-56 L13,-38 Z" fill="#7c2a24" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M0,-56 V-70" stroke="${INK}" stroke-width="1.3"/><path d="M0,-70 L15,-66 L0,-61 Z" fill="#e3c24e" stroke="${INK}" stroke-width=".9"/>
      <path d="M-6,18 v-9 a6,6 0 0 1 12,0 v9 z" fill="${INK}"/>`;
    },
    garrison: () => `
      <rect x="-26" y="-6" width="52" height="24" fill="#dbb6ae" stroke="${INK}" stroke-width="1.4"/>
      <path d="M-30,-6 L0,-24 L30,-6 Z" fill="#8c3b33" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      <path d="M-20,4 h6 v8 h-6 z M14,4 h6 v8 h-6 z" fill="${INK}" opacity=".8"/>
      <path d="M0,-2 h10 v8 q0,8 -10,12 q-10,-4 -10,-12 v-8 z" fill="#f2e4c7" stroke="${INK}" stroke-width="1.2"/>
      <path d="M0,0 v14 M-6,6 h12" stroke="#b5463c" stroke-width="2.2"/>`,
    outpost: () => `
      <path d="M-20,2 L-3,-28 L14,2 Z" fill="#e2d5b2" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M-3,-28 V-44" stroke="${INK}" stroke-width="1.3"/><path d="M-3,-44 L11,-40 L-3,-36 Z" fill="#d9b93a" stroke="${INK}" stroke-width=".9"/>
      ${Array.from({ length: 11 }, (_, i) => { const sx = -35 + i * 7; return `<path d="M${sx - 3},24 V6 L${sx},0 L${sx + 3},6 V24 Z" fill="#b59c74" stroke="${INK}" stroke-width="1"/>`; }).join('')}
      <path d="M-44,24 q-1,-10 0,-14" stroke="${INK}" stroke-width="2"/><path d="M-52,12 Q-44,-2 -36,12 Z" fill="#b9705d" stroke="${INK}" stroke-width="1.1"/>
      <circle cx="-47" cy="8" r="1.3" fill="#f3e9cf"/><circle cx="-41" cy="6" r="1.1" fill="#f3e9cf"/>
      <path d="M46,24 q-1,-8 0,-11" stroke="${INK}" stroke-width="1.8"/><path d="M39,14 Q46,2 53,14 Z" fill="#9d6a8a" stroke="${INK}" stroke-width="1.1"/>`,
    bulwark: () => `
      <path d="M-40,-18 V-38 M-24,-18 V-38 M-40,-38 H-24 M-40,-18 L-24,-38 M-40,-38 L-24,-18 M24,-18 V-34 M40,-18 V-34 M24,-34 H40 M24,-18 L40,-34" fill="none" stroke="#7a5a3a" stroke-width="1.4"/>
      <path d="M-56,26 L-46,-18 L46,-18 L56,26 Z" fill="#d2c9b9" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/>
      <path d="M-49,-4 H49 M-52,10 H52 M-30,-18 V-4 M-6,-18 V-4 M18,-18 V-4 M38,-18 V-4 M-40,-4 V10 M-18,-4 V10 M28,-4 V10 M-28,10 V26 M-2,10 V26 M24,10 V26" stroke="${INK}" stroke-width=".8" opacity=".35"/>
      <circle cx="0" cy="2" r="14" fill="#6f6b65" stroke="${INK}" stroke-width="1.6"/>
      <circle cx="0" cy="2" r="4.5" fill="#3e3b37"/>
      ${[0, 60, 120, 180, 240, 300].map((a) => { const t = (a * Math.PI) / 180; return `<circle cx="${r1(Math.cos(t) * 9.5)}" cy="${r1(2 + Math.sin(t) * 9.5)}" r="1.5" fill="#cfc7b9"/>`; }).join('')}`,
    wallgate: () => `
      <rect x="-15" y="-12" width="30" height="20" fill="#d8d0c0" stroke="${INK}" stroke-width="1.3"/>
      <rect x="-22" y="-20" width="10" height="28" fill="#cfc6b5" stroke="${INK}" stroke-width="1.3"/>
      <rect x="12" y="-20" width="10" height="28" fill="#cfc6b5" stroke="${INK}" stroke-width="1.3"/>
      <path d="M-22,-20 h10 M12,-20 h10" stroke="${INK}" stroke-width="3.5" stroke-dasharray="2.5 2"/>
      <path d="M-5,8 v-7 a5,5 0 0 1 10,0 v7 z" fill="${INK}"/>`,
    spring: () => `
      ${Array.from({ length: 12 }, (_, i) => { const t = (i / 12) * Math.PI * 2; return `<path d="M${r1(Math.cos(t) * 23)},${r1(Math.sin(t) * 23)} L${r1(Math.cos(t) * 30)},${r1(Math.sin(t) * 30)}" stroke="#d3ae4f" stroke-width="1.6" stroke-linecap="round"/>`; }).join('')}
      <circle r="19" fill="url(#springGlow)" stroke="${INK}" stroke-width="1.4"/>
      <path d="M0,-6 C4,-2 4,3 0,6 C-4,3 -4,-2 0,-6 Z M-7,1 C-3,0 -1,3 0,6 C-4,6 -7,4 -7,1 Z M7,1 C3,0 1,3 0,6 C4,6 7,4 7,1 Z" fill="#f2c6d0" stroke="${INK}" stroke-width=".8"/>`,
    gynaia: () => {
      const sp = [];
      for (let i = 0; i <= 70; i++) { const a = (i / 70) * Math.PI * 4.2; const r = 3 + (i / 70) * 21; sp.push([Math.cos(a) * r, 16 + Math.sin(a) * r * 0.42]); }
      return `
      <path d="${lineD(sp)}" fill="none" stroke="#7da567" stroke-width="3.2" stroke-linecap="round"/>
      <rect x="-17" y="-4" width="34" height="6" fill="#efe5d1" stroke="${INK}" stroke-width="1.2"/>
      ${[-14, -6, 2, 10].map((cx) => `<rect x="${cx}" y="-16" width="4" height="12" fill="#f6efe0" stroke="${INK}" stroke-width=".8"/>`).join('')}
      <path d="M-16,-16 a16,16 0 0 1 32,0 z" fill="#e5c7cd" stroke="${INK}" stroke-width="1.3"/>
      <path d="M0,-32 v-6" stroke="${INK}" stroke-width="1.3"/><circle cx="0" cy="-40" r="2" fill="#d6aa4e" stroke="${INK}" stroke-width=".8"/>`;
    },
    andros: () => `
      <path d="M-24,24 h48 v-14 h-48 z M-18,24 v-9 h36 v9 M-12,24 v-5 h24 v5" fill="none" stroke="#6d955c" stroke-width="2.6" stroke-linejoin="round"/>
      <rect x="-17" y="-4" width="34" height="6" fill="#efe5d1" stroke="${INK}" stroke-width="1.2"/>
      ${[-14, -6, 2, 10].map((cx) => `<rect x="${cx}" y="-18" width="4" height="14" fill="#f6efe0" stroke="${INK}" stroke-width=".8"/>`).join('')}
      <path d="M-16,-18 h32 l-4,-7 h-24 z" fill="#c8d6e6" stroke="${INK}" stroke-width="1.2"/>
      <path d="M-11,-25 a11,11 0 0 1 22,0 z" fill="#c8d6e6" stroke="${INK}" stroke-width="1.3"/>
      <path d="M0,-36 v-6" stroke="${INK}" stroke-width="1.3"/><circle cx="0" cy="-44" r="2" fill="#d6aa4e" stroke="${INK}" stroke-width=".8"/>`
  };
  const LM_OF = { forge: 'forge', spire: 'spire', sanctum: 'sanctum', citadel: 'citadel', optic: 'optic', cochlear: 'cochlear', abyss: 'abyss', veil: 'veil', swamp: 'swamp', keep: 'keep', garrison: 'garrison', outpost: 'outpost', cauldron: 'cauldron', bulwark: 'bulwark', wall: 'wallgate', lucina: 'spring', gynaia: 'gynaia', andros: 'andros' };
  const HIT_R = { hub: 64, forge: 50, spire: 54, sanctum: 54, citadel: 52, abyss: 54, veil: 50, keep: 50, outpost: 52, cauldron: 46, bulwark: 54, optic: 26, cochlear: 26, swamp: 34, garrison: 32, wall: 26, lucina: 30, gynaia: 30, andros: 30 };
  const tipFor = (x) => `${x.site.name}|${x.site.category}`;
  const landmarks = [];
  landmarks.push(`<g class="hit lm" data-realm="hub" data-tip="${esc(`${byId.hub.name}|${byId.hub.sites.map((s) => s.category).join(' · ')}`)}" transform="translate(${byId.hub.at[0]},${byId.hub.at[1]})">${LM.hub()}<circle r="${HIT_R.hub}" fill="transparent"/></g>`);
  SITES.forEach((x) => {
    const kind = LM_OF[x.site.id];
    if (!kind) return;
    const [sx, sy] = siteAt(x);
    landmarks.push(`<g class="hit lm" data-realm="${x.realm.id}" data-site="${x.site.id}" data-tip="${esc(tipFor(x))}" transform="translate(${sx},${sy})">${LM[kind]()}<circle cy="-14" r="${HIT_R[x.site.id] || 40}" fill="transparent"/></g>`);
  });

  // ---------- layers ----------
  const riverSvg = rivers.map((r) => `<path d="${ribbon(r.pts, 8, 2.4)}" fill="#c0473a" fill-opacity=".9" stroke="#6e2a20" stroke-width=".8"/><path d="${lineD(r.pts.slice(0, Math.round(r.pts.length * 0.7)))}" fill="none" stroke="#ec9a82" stroke-width="1" opacity=".75"/>`).join('')
    + returns.map((r, i) => `<path d="${ribbon(r.pts, 2.4, 7)}" fill="#4f7fae" fill-opacity=".9" stroke="#24405f" stroke-width=".8"/><path id="rp-${i}" d="${lineD(r.pts)}" fill="none"/><text class="t-route" fill="#2c4f74" dy="-8"><textPath href="#rp-${i}" startOffset="${r.labelAt || '50%'}" text-anchor="middle">${esc(r.label)}</textPath></text>`).join('');
  const roadSvg = roads.map((r) => `<path d="${lineD(r.pts)}" fill="none" stroke="#f8e8b4" stroke-width="5.5" stroke-linecap="round" opacity=".6"/><path d="${lineD(r.pts)}" fill="none" stroke="#c39126" stroke-width="2.2" stroke-dasharray="7 4" stroke-linecap="round"/>`).join('')
    + roads.filter((r) => r.label).map((r, i) => {
      const pts = r.pts[0][0] > r.pts[r.pts.length - 1][0] ? r.pts.slice().reverse() : r.pts;
      return `<path id="rd-${i}" d="${lineD(pts)}" fill="none"/><text class="t-route" fill="#7a5a12" dy="${r.labelDy || -7}"><textPath href="#rd-${i}" startOffset="50%" text-anchor="middle">${esc(r.label)}</textPath></text>`;
    }).join('');
  const gateSvg = gateLinks.map((g) => `<path d="${g.d}" fill="none" stroke="#3f8f5a" stroke-width="1.4" stroke-dasharray="1.5 5" stroke-linecap="round" opacity=".8"/>`).join('')
    + REALMS.map((r) => `<g transform="translate(${r.gate[0]},${r.gate[1]})"><circle r="9.5" fill="#d7eed5" stroke="#2f6e45" stroke-width="2.6"/><circle r="4.2" fill="none" stroke="#2f6e45" stroke-width="1.3"/><circle r="1.6" fill="#2f6e45"/></g>`).join('');
  const bossSvg = C.worldBosses.map((b) => `<g class="hit boss" data-boss="${b.id}" data-tip="${esc(`${b.name}|World boss · roams ${b.realms.length} realms`)}" transform="translate(${b.at[0]},${b.at[1]})"><path d="M-11,-9 l-6,-8 M11,-9 l6,-8" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><circle r="15" fill="#7d2420" stroke="${INK}" stroke-width="1.6"/><circle r="11.5" fill="none" stroke="#e7b9a8" stroke-width=".8" opacity=".7"/>${skull(0, -1, 0.95)}<circle r="22" fill="transparent"/></g><text class="t-boss" x="${b.at[0]}" y="${b.at[1] + 31}" text-anchor="middle">${esc(b.name)}</text>`).join('');

  // the Outer Wall: a crenellated wall that follows the southern coast
  const wallPts = coast.filter((p) => p[0] > 872 && p[0] < 1262 && p[1] > 850).sort((a, b) => a[0] - b[0]).map((p) => [p[0], p[1] - 13]);
  const wallSvg = wallPts.length > 2 ? `<path d="${lineD(wallPts)}" fill="none" stroke="${INK}" stroke-width="8.5" stroke-linecap="round" stroke-linejoin="round"/><path d="${lineD(wallPts)}" fill="none" stroke="#d3c8b2" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/><path d="${lineD(wallPts.map((p) => [p[0], p[1] - 3.2]))}" fill="none" stroke="${INK}" stroke-width="3" stroke-dasharray="3 3.5"/>` : '';

  // labels
  const labelSvg = LABELS.map((l) => {
    const a = `text-anchor="${l.anchor}"`;
    if (l.kind === 'realm') return `<text class="t-realm" x="${l.x}" y="${l.y}" ${a}>${esc(l.text)}</text>${l.cap ? `<text class="t-cap" x="${l.x}" y="${l.y + 19}" ${a}>${esc(l.cap)}</text>` : ''}`;
    return `<text class="t-site" x="${l.x}" y="${l.y}" ${a}>${esc(l.text)}</text>${l.cap ? `<text class="t-site-cap" x="${l.x}" y="${l.y + 16}" ${a}>${esc(l.cap)}</text>` : ''}`;
  }).join('');

  // decorations
  function compass(x, y) {
    let s = `<g transform="translate(${x},${y})"><circle r="46" fill="#efe4c6" fill-opacity=".55" stroke="${INK}" stroke-width="1"/><circle r="40" fill="none" stroke="${INK}" stroke-width=".6"/>`;
    for (const [ang, len, w] of [[45, 28, 6], [135, 28, 6], [225, 28, 6], [315, 28, 6], [0, 44, 8], [90, 44, 8], [180, 44, 8], [270, 44, 8]]) {
      const t = (ang * Math.PI) / 180, tip = [Math.sin(t) * len, -Math.cos(t) * len], L = [Math.cos(t) * w, Math.sin(t) * w], R = [-L[0], -L[1]];
      s += `<path d="M0,0L${P(L)}L${P(tip)}Z" fill="#efe4c6" stroke="${INK}" stroke-width=".9"/><path d="M0,0L${P(R)}L${P(tip)}Z" fill="${INK}" stroke="${INK}" stroke-width=".9"/>`;
    }
    return `${s}<circle r="3" fill="#d6aa4e" stroke="${INK}" stroke-width=".8"/><text class="t-compass" x="0" y="-51" text-anchor="middle">N</text><text class="t-compass" x="57" y="5" text-anchor="middle">E</text><text class="t-compass" x="0" y="63" text-anchor="middle">S</text><text class="t-compass" x="-57" y="5" text-anchor="middle">W</text></g>`;
  }
  const decor = `
    <g transform="translate(234,56)">
      <path d="M-190,-6 L-208,-6 L-200,4 L-208,14 L-178,14 Z M190,-6 L208,-6 L200,4 L208,14 L178,14 Z" fill="#e2d3ad" stroke="${INK}" stroke-width="1.3" stroke-linejoin="round"/>
      <path d="M-184,-22 H184 V16 H-184 Z" fill="#efe3c3" stroke="${INK}" stroke-width="1.6"/>
      <path d="M-176,-16 H176 M-176,10 H176" stroke="${INK}" stroke-width=".7" opacity=".45"/>
      <text class="t-title" x="0" y="6" text-anchor="middle">The Realm of Corporia</text>
    </g>
    ${compass(112, 872)}
    <text class="t-sea" transform="translate(66,520) rotate(-90)" text-anchor="middle">Here be pathogens</text>
    <g transform="translate(1526,800)">
      <path d="M-38,6 q8,-16 16,0 q8,-16 16,0 q8,-16 16,0" fill="none" stroke="${INK}" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M-38,6 q8,-16 16,0 q8,-16 16,0 q8,-16 16,0" fill="none" stroke="#9db69f" stroke-width="1.1" stroke-linecap="round"/>
      <path d="M10,6 q4,-22 18,-18 q6,2 6,8 q-6,0 -10,2 q-2,2 -4,8" fill="#9db69f" stroke="${INK}" stroke-width="1.4" stroke-linejoin="round"/>
      <circle cx="22" cy="-8" r="1.3" fill="${INK}"/>
      <path d="M-46,10 q6,-3 12,0 M-6,10 q6,-3 12,0 M26,10 q6,-3 12,0" fill="none" stroke="${INK}" stroke-width=".9" opacity=".6"/>
    </g>
    <rect x="7" y="7" width="${MW - 14}" height="${MH - 14}" fill="none" stroke="${INK}" stroke-width="2.4"/>
    <rect x="14" y="14" width="${MW - 28}" height="${MH - 28}" fill="none" stroke="${INK}" stroke-width=".9"/>
    ${[[14, 14], [MW - 14, 14], [MW - 14, MH - 14], [14, MH - 14]].map(([cx, cy]) => `<path d="M${cx},${cy - 7}L${cx + 7},${cy}L${cx},${cy + 7}L${cx - 7},${cy}Z" fill="#d6aa4e" stroke="${INK}" stroke-width="1"/>`).join('')}`;

  // regions: fills with watercolor-style darker edges, then hand-drawn borders
  const regionClips = cells.map((c) => `<clipPath id="rc-${c.realm.id}"><path d="${c.d}"/></clipPath>`).join('');
  const regionSvg = cells.map((c) => `<path class="hit region" data-realm="${c.realm.id}" data-tip="${esc(`${c.realm.name}|${c.realm.short}`)}" tabindex="0" role="button" aria-label="${esc(`${c.realm.name}: ${c.realm.sites.map((s) => s.category).join(', ')}`)}" d="${c.d}" fill="${c.realm.color}" fill-opacity=".72"/><path d="${c.d}" fill="none" stroke="${shade(c.realm.color, 0.78)}" stroke-width="20" stroke-opacity=".35" clip-path="url(#rc-${c.realm.id})" pointer-events="none"/>`).join('');
  const borderSvg = [...edgeCache.values()].map((pts) => `<path d="${lineD(pts)}"/>`).join('');

  const svgEl = $('#map');
  svgEl.innerHTML = `
    <defs>
      <clipPath id="landClip"><path d="${coastD}"/></clipPath>
      ${regionClips}
      <radialGradient id="lavaGlow"><stop offset="0" stop-color="#fff3b4"/><stop offset=".55" stop-color="#f39b3d"/><stop offset="1" stop-color="#c4471f"/></radialGradient>
      <radialGradient id="springGlow"><stop offset="0" stop-color="#fff8d8"/><stop offset=".6" stop-color="#c3e5e9"/><stop offset="1" stop-color="#8cc4d2"/></radialGradient>
      <radialGradient id="vig" cx="50%" cy="50%" r="72%"><stop offset=".6" stop-color="#5c3c1c" stop-opacity="0"/><stop offset="1" stop-color="#5c3c1c" stop-opacity=".3"/></radialGradient>
      <pattern id="grain" width="256" height="256" patternUnits="userSpaceOnUse"><image id="grainImg" width="256" height="256" href=""/></pattern>
    </defs>
    <g id="vp">
      <rect width="${MW}" height="${MH}" fill="#dbceaf"/>
      <path d="${sea}" fill="none" stroke="${INK}" stroke-width=".95" stroke-linecap="round" opacity=".42"/>
      <g fill="none" stroke-linejoin="round">
        <path d="${coastD}" stroke="#8f7c5c" stroke-width="36" stroke-opacity=".3"/>
        <path d="${coastD}" stroke="#dbceaf" stroke-width="32"/>
        <path d="${coastD}" stroke="#8f7c5c" stroke-width="21" stroke-opacity=".38"/>
        <path d="${coastD}" stroke="#dbceaf" stroke-width="18"/>
        <path d="${coastD}" stroke="#8f7c5c" stroke-width="9" stroke-opacity=".45"/>
        <path d="${coastD}" stroke="#dbceaf" stroke-width="6.5"/>
      </g>
      <path d="${coastD}" fill="#f1e7cb"/>
      <g clip-path="url(#landClip)">
        <g id="regions">${regionSvg}</g>
        <g fill="none" stroke="#5b4630" stroke-width="1.3" stroke-dasharray="6 4" stroke-linecap="round" opacity=".75" pointer-events="none">${borderSvg}</g>
        <g id="sel" pointer-events="none"></g>
      </g>
      <g pointer-events="none">${glyphSvg}</g>
      <g pointer-events="none">${wallSvg}</g>
      <path d="${coastD}" fill="none" stroke="${INK}" stroke-width="2.3" stroke-linejoin="round" pointer-events="none"/>
      <g id="layer-rivers" pointer-events="none">${riverSvg}</g>
      <g id="layer-roads" pointer-events="none">${roadSvg}</g>
      <g id="layer-gates" pointer-events="none">${gateSvg}</g>
      <g id="rings" pointer-events="none"></g>
      <g id="marks">${landmarks.join('')}</g>
      <g id="layer-bosses">${bossSvg}</g>
      <g id="labels">${labelSvg}</g>
      <g pointer-events="none">${decor}</g>
      <rect width="${MW}" height="${MH}" fill="url(#grain)" pointer-events="none"/>
      <rect width="${MW}" height="${MH}" fill="url(#vig)" pointer-events="none"/>
    </g>`;

  // paper grain, generated once
  try {
    const cv = document.createElement('canvas');
    cv.width = cv.height = 256;
    const g = cv.getContext('2d');
    const img = g.createImageData(256, 256);
    const rnd = rng(42);
    for (let i = 0; i < img.data.length; i += 4) {
      const v = rnd();
      img.data[i] = 84; img.data[i + 1] = 58; img.data[i + 2] = 30;
      img.data[i + 3] = v < 0.22 ? Math.round(rnd() * 34) : v > 0.985 ? 70 : 0;
    }
    g.putImageData(img, 0, 0);
    $('#grainImg').setAttribute('href', cv.toDataURL('image/png'));
  } catch (e) { /* the map works without grain */ }

  // ---------- view: pan and zoom ----------
  const wrap = $('#mapwrap');
  const vp = $('#vp');
  let vw = 1, vh = 1, k = 1, tx = 0, ty = 0, fitK = 1, kMin = 0.2, kMax = 3, ready = false, anim = 0;
  const clampK = (v) => Math.max(kMin, Math.min(kMax, v));
  function clampView() {
    const mw = MW * k, mh = MH * k, m = 40;
    tx = mw <= vw ? (vw - mw) / 2 : Math.min(m, Math.max(vw - mw - m, tx));
    ty = mh <= vh ? (vh - mh) / 2 : Math.min(m, Math.max(vh - mh - m, ty));
  }
  const apply = () => vp.setAttribute('transform', `translate(${r1(tx)},${r1(ty)}) scale(${k.toFixed(4)})`);
  function centerOn(x, y) { tx = vw / 2 - x * k; ty = vh / 2 - y * k; clampView(); apply(); }
  function startK() { return vw < 760 ? Math.max(fitK, Math.min(0.62, (vw / 400) * 0.62)) : fitK; }
  function measure() {
    const r = svgEl.getBoundingClientRect();
    const cx = (vw / 2 - tx) / k, cy = (vh / 2 - ty) / k;
    vw = Math.max(1, r.width); vh = Math.max(1, r.height);
    svgEl.setAttribute('viewBox', `0 0 ${r1(vw)} ${r1(vh)}`);
    fitK = Math.min(vw / MW, vh / MH);
    kMin = fitK * 0.95; kMax = Math.max(fitK * 6, 1.8);
    if (!ready) { ready = true; k = startK(); const at = focusPoint(state.realm); centerOn(at[0], at[1]); }
    else { k = clampK(k); centerOn(cx, cy); }
  }
  function zoomAt(f, px, py) {
    cancelAnimationFrame(anim);
    const nk = clampK(k * f);
    tx = px - (px - tx) * (nk / k); ty = py - (py - ty) * (nk / k); k = nk;
    clampView(); apply();
  }
  function flyTo(nk, x, y) {
    cancelAnimationFrame(anim);
    nk = clampK(nk);
    const k0 = k, cx0 = (vw / 2 - tx) / k, cy0 = (vh / 2 - ty) / k;
    if (reduceMotion) { k = nk; centerOn(x, y); return; }
    const t0 = performance.now(), dur = 380;
    const step = (now) => {
      const t = Math.min(1, (now - t0) / dur), e = 1 - (1 - t) ** 3;
      k = k0 + (nk - k0) * e;
      centerOn(cx0 + (x - cx0) * e, cy0 + (y - cy0) * e);
      if (t < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  const local = (e) => { const r = svgEl.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };

  const pointers = new Map();
  let drag = null, pinch = null, moved = false;
  svgEl.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.set(e.pointerId, local(e));
    if (pointers.size === 1) { drag = { p: local(e), tx, ty, target: e.target }; moved = false; }
    else if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, k, mid: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], tx, ty };
      moved = true; drag = null;
    }
    try { svgEl.setPointerCapture(e.pointerId); } catch (err) { /* older browsers */ }
  });
  svgEl.addEventListener('pointermove', (e) => {
    if (!pointers.has(e.pointerId)) { hover(e); return; }
    pointers.set(e.pointerId, local(e));
    if (pinch && pointers.size >= 2) {
      const [a, b] = [...pointers.values()];
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const nk = clampK(pinch.k * (d / pinch.d));
      tx = mid[0] - (pinch.mid[0] - pinch.tx) * (nk / pinch.k); ty = mid[1] - (pinch.mid[1] - pinch.ty) * (nk / pinch.k); k = nk;
      clampView(); apply();
    } else if (drag) {
      const p = local(e), dx = p[0] - drag.p[0], dy = p[1] - drag.p[1];
      if (!moved && Math.hypot(dx, dy) > 5) { moved = true; wrap.classList.add('dragging'); hideTip(); }
      if (moved) { cancelAnimationFrame(anim); tx = drag.tx + dx; ty = drag.ty + dy; clampView(); apply(); }
    }
  });
  function endPointer(e) {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size === 0) {
      if (drag && !moved && e.type === 'pointerup') {
        const hit = drag.target.closest && drag.target.closest('[data-realm],[data-boss]');
        if (hit) hit.dataset.boss ? selectBoss(hit.dataset.boss) : select(hit.dataset.realm, { site: hit.dataset.site });
      }
      drag = null; pinch = null; wrap.classList.remove('dragging');
    } else if (pointers.size === 1) {
      const p = [...pointers.values()][0];
      pinch = null; drag = { p, tx, ty, target: svgEl };
    }
  }
  svgEl.addEventListener('pointerup', endPointer);
  svgEl.addEventListener('pointercancel', endPointer);
  svgEl.addEventListener('pointerleave', hideTip);
  svgEl.addEventListener('wheel', (e) => { e.preventDefault(); const [px, py] = local(e); zoomAt(Math.exp(-e.deltaY * (e.deltaMode === 1 ? 0.05 : 0.0016)), px, py); }, { passive: false });
  svgEl.addEventListener('dblclick', (e) => { const [px, py] = local(e); zoomAt(1.7, px, py); });
  svgEl.addEventListener('keydown', (e) => {
    const t = e.target.closest && e.target.closest('[data-realm],[data-boss]');
    if ((e.key === 'Enter' || e.key === ' ') && t) { e.preventDefault(); t.dataset.boss ? selectBoss(t.dataset.boss) : select(t.dataset.realm, { pan: true }); }
    if (e.key === '+' || e.key === '=') zoomAt(1.25, vw / 2, vh / 2);
    if (e.key === '-') zoomAt(0.8, vw / 2, vh / 2);
  });
  $('#zoomIn').addEventListener('click', () => zoomAt(1.35, vw / 2, vh / 2));
  $('#zoomOut').addEventListener('click', () => zoomAt(1 / 1.35, vw / 2, vh / 2));
  $('#zoomFit').addEventListener('click', () => flyTo(fitK, MW / 2, MH / 2));
  if (window.ResizeObserver) new ResizeObserver(() => measure()).observe(svgEl);
  else window.addEventListener('resize', measure);

  // tooltip
  const tip = $('#tip');
  function hover(e) {
    if (e.pointerType !== 'mouse') return;
    const t = e.target.closest && e.target.closest('[data-tip]');
    if (!t) { hideTip(); return; }
    const [name, line] = t.dataset.tip.split('|');
    tip.innerHTML = `<b>${esc(name)}</b><span>${esc(line || '')}</span>`;
    tip.hidden = false;
    const [px, py] = local(e);
    const w = tip.offsetWidth, h = tip.offsetHeight;
    tip.style.left = `${Math.min(vw - w - 8, px + 14)}px`;
    tip.style.top = `${py + 18 + h > vh ? py - h - 12 : py + 18}px`;
  }
  function hideTip() { tip.hidden = true; }

  // ---------- selection and panels ----------
  const state = { realm: 'sanctum', boss: null, cats: new Set() };
  const focusPoint = (id) => (id === 'genesis' ? [440, 750] : (byId[id] || byId.sanctum).at);
  const realmTitle = (r) => (r.kind === 'hub' ? 'Hub' : 'Realm');
  const totalWritten = SITES.reduce((n, x) => n + x.site.floors.filter((f) => f[2] && f[2].written).length, 0);
  $('#tCats').innerHTML = `${new Set(SITES.map((x) => x.site.category)).size}<small> / ${C.categories.length}</small>`;
  $('#tFloors').textContent = SITES.reduce((n, x) => n + floorsOf(x.site), 0);
  $('#tWritten').textContent = totalWritten;

  const SW = {
    river: '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M1 8 Q7 2 12 6 T23 4" fill="none" stroke="#cf5444" stroke-width="3.2" stroke-linecap="round"/></svg>',
    vein: '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M1 4 Q7 10 12 6 T23 8" fill="none" stroke="#6b94c4" stroke-width="3.2" stroke-linecap="round"/></svg>',
    road: '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M1 6 H23" fill="none" stroke="#e0b44a" stroke-width="2.4" stroke-dasharray="5 3" stroke-linecap="round"/></svg>',
    gate: '<svg viewBox="0 0 24 12" aria-hidden="true"><path d="M1 9 Q12 -3 23 9" fill="none" stroke="#6cb684" stroke-width="1.6" stroke-dasharray="1.5 3.5" stroke-linecap="round"/><circle cx="12" cy="6" r="3.6" fill="#d5ecd3" stroke="#2f6e45" stroke-width="1.8"/></svg>',
    boss: '<svg viewBox="0 0 24 12" aria-hidden="true"><circle cx="12" cy="6" r="5.2" fill="#7d2420" stroke="#f0e5ca" stroke-width="1"/></svg>'
  };
  const riverTo = new Set(T.rivers.routes.map((r) => r.to));

  function floorList(s) {
    const n = floorsOf(s);
    const rows = s.floors.map(([f, t, meta]) => {
      const st = meta && meta.written ? `<span class="st done">Written · ${esc(meta.src)}</span>`
        : meta && meta.src ? `<span class="st">Planned as ${esc(meta.src)}</span>` : '<span></span>';
      return `<li><span class="fn">${esc(f)}</span><span class="ft">${esc(t)}</span>${st}</li>`;
    }).join('');
    const b = s.boss;
    const bst = b.partly ? `<span class="st">Partly written · ${esc(b.src)}</span>` : b.src ? `<span class="st">Planned as ${esc(b.src)}</span>` : '<span></span>';
    return `<ol class="floors">${rows}<li class="boss"><span class="fn">${n}</span><span class="ft"><b>Boss: ${esc(b.name)}</b><span class="topic">${esc(b.topic)}</span></span>${bst}</li></ol>`;
  }
  function travelList(r) {
    const items = [];
    if (r.id === 'forge') items.push(['river', 'Source of every arterial river']);
    else if (riverTo.has(r.id)) items.push(['river', 'Arterial river from the Crimson Forge']);
    if (r.id === 'spire' || r.id === 'forge') items.push(['vein', 'The Lesser Circuit, a two-way river between the Spire of Breath and the Crimson Forge']);
    if (r.id === 'citadel') items.push(['road', 'North end of the Spinal Road']);
    else if (r.id === 'bulwark') items.push(['road', 'South end of the Spinal Road']);
    else if (r.id === 'hub') items.push(['road', 'The Spinal Road runs through its gates']);
    else items.push(['road', 'Neural road to the Spinal Road']);
    if (r.id === 'sanctum' || r.id === 'citadel') items.push(['road', 'The Portal Stair joins the Alchemical Sanctum and the Synaptic Citadel']);
    items.push(['gate', r.id === 'bastion' ? 'Anchor of the Lymph Gate network' : 'Lymph Gate, lit when you clear Floor 1']);
    C.worldBosses.filter((b) => b.realms.includes(r.id)).forEach((b) => items.push(['boss', `World boss <button type="button" class="linkish" data-goboss="${b.id}">${esc(b.name)}</button> roams here`]));
    return `<section class="travel"><h3>Getting there</h3><ul>${items.map(([k, t]) => `<li>${SW[k]}<span>${t}</span></li>`).join('')}</ul></section>`;
  }
  function renderRealm(r) {
    const sites = r.sites.map((s) => {
      const written = s.floors.filter((f) => f[2] && f[2].written).length;
      return `<section class="site" id="site-${s.id}">
        <header><h3>${esc(s.name)}</h3><p class="kind">${KIND[s.kind]}</p></header>
        <span class="cat-chip">${esc(s.category)}</span>
        ${s.play ? `<p class="play">${esc(s.play)}</p>` : ''}
        ${written ? `<p class="progress"><b>${written} of ${floorsOf(s)} floors</b> already have questions in the 2D game.</p>` : ''}
        ${floorList(s)}
      </section>`;
    }).join('');
    $('#realmView').innerHTML = `<p class="eyebrow">${realmTitle(r)} · ${esc(r.short)}</p><h2>${esc(r.name)}</h2><p class="epithet">${esc(r.epithet)}</p><p class="lore">${esc(r.lore)}</p>${sites}${travelList(r)}`;
  }
  function renderBoss(b) {
    const links = b.realms.map((id) => `<li>${SW.gate}<span><button type="button" class="linkish" data-goto="${id}">${esc(byId[id].name)}</button> · ${esc(byId[id].short)}</span></li>`).join('');
    $('#realmView').innerHTML = `<p class="eyebrow">World boss · Multisystem disease</p><h2>${esc(b.name)}</h2><p class="epithet">${esc(b.blurb)}</p><p class="lore">A raid for guilds. Each player answers questions from the realms it touches, so a mixed party of specialists brings it down fastest.</p><section class="travel"><h3>Roams through</h3><ul>${links}</ul></section>`;
  }
  function renderPick() {
    const pick = $('#pick');
    if (state.boss) {
      const b = C.worldBosses.find((x) => x.id === state.boss);
      pick.innerHTML = `<span class="eyebrow">World boss</span><b>${esc(b.name)}</b><span class="meta">${b.realms.length} realms</span><button class="go" type="button" data-scroll>Details</button>`;
      return;
    }
    const r = byId[state.realm];
    const floors = r.sites.reduce((n, s) => n + floorsOf(s), 0);
    const kinds = r.sites.map((s) => s.kind);
    const parts = [['dungeon', 'dungeon'], ['tower', 'tower'], ['guild', 'guild hall']].map(([k, w]) => { const n = kinds.filter((x) => x === k).length; return n ? `${n} ${w}${n > 1 ? 's' : ''}` : ''; }).filter(Boolean).join(', ');
    pick.innerHTML = `<span class="eyebrow">${realmTitle(r)}</span><b>${esc(r.name)}</b><span class="meta">${parts} · ${floors} floors</span><button class="go" type="button" data-scroll>See all floors</button>`;
  }
  function drawSelection() {
    const sel = $('#sel');
    if (state.boss) { sel.innerHTML = ''; return; }
    if (state.realm === 'hub') {
      const [x, y] = byId.hub.at;
      sel.innerHTML = `<circle cx="${x}" cy="${y}" r="66" fill="none" stroke="#d6aa4e" stroke-width="10" stroke-opacity=".35"/><circle cx="${x}" cy="${y}" r="66" fill="none" stroke="#9a6b12" stroke-width="2.6"/>`;
      return;
    }
    const c = cellOf[state.realm];
    sel.innerHTML = c ? `<path d="${c.d}" fill="none" stroke="#d6aa4e" stroke-width="12" stroke-opacity=".38"/><path d="${c.d}" fill="none" stroke="#9a6b12" stroke-width="2.8"/>` : '';
  }
  function drawRings() {
    $('#rings').innerHTML = [...state.cats].map((cat) => {
      const x = homeOf[cat];
      if (!x) return '';
      const [sx, sy] = x.realm.kind === 'hub' ? x.realm.at : siteAt(x);
      const r = x.realm.kind === 'hub' ? 72 : x.main && !x.site.at ? 58 : 42;
      return `<circle class="ring${reduceMotion ? '' : ' pulse'}" cx="${sx}" cy="${x.realm.kind === 'hub' ? sy : sy - 14}" r="${r}"/>`;
    }).join('');
    document.querySelectorAll('.cat').forEach((li) => li.classList.toggle('lit', state.cats.has(li.dataset.cat)));
  }
  function setHash(id) {
    try { if (location.hash !== `#${id}`) history.replaceState(null, '', `#${id}`); } catch (e) { /* ignore */ }
  }
  function select(id, opts = {}) {
    if (!byId[id]) return;
    state.realm = id; state.boss = null;
    $('#jump').value = id;
    renderRealm(byId[id]); renderPick(); drawSelection(); setHash(id);
    if (opts.pan && k > fitK * 1.05) { const at = focusPoint(id); flyTo(k, at[0], at[1]); }
    if (opts.site && opts.scroll) {
      const el = document.getElementById(`site-${opts.site}`);
      if (el) el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }
  function selectBoss(id) {
    const b = C.worldBosses.find((x) => x.id === id);
    if (!b) return;
    state.boss = id;
    $('#jump').value = `boss:${id}`;
    renderBoss(b); renderPick(); drawSelection(); setHash(`boss-${id}`);
  }

  // jump menu
  $('#jump').innerHTML = REALMS.map((r) => `<option value="${r.id}">${esc(r.name)}</option>`).join('')
    + `<optgroup label="World bosses">${C.worldBosses.map((b) => `<option value="boss:${b.id}">${esc(b.name)}</option>`).join('')}</optgroup>`;
  $('#jump').addEventListener('change', (e) => {
    const v = e.target.value;
    if (v.startsWith('boss:')) selectBoss(v.slice(5)); else select(v, { pan: true });
  });

  // category ledger
  $('#cats').innerHTML = C.categories.map((cat, i) => {
    const x = homeOf[cat];
    const home = x ? (x.site.name === x.realm.name ? x.realm.name : `${x.site.name} · ${x.realm.name}`) : 'No home yet';
    return `<li class="cat" data-cat="${esc(cat)}"><input type="checkbox" id="cat-${i}" aria-label="${esc(`Light up ${cat} on the map`)}"><button type="button" class="name" data-i="${i}"><span>${esc(cat)}</span><small>${esc(home)}</small></button><span class="floorsn" title="Floors">${x ? floorsOf(x.site) : 0}</span></li>`;
  }).join('');
  $('#cats').addEventListener('change', (e) => {
    const li = e.target.closest('.cat');
    if (!li) return;
    if (e.target.checked) state.cats.add(li.dataset.cat); else state.cats.delete(li.dataset.cat);
    drawRings();
  });
  $('#cats').addEventListener('click', (e) => {
    const btn = e.target.closest('button.name');
    if (!btn) return;
    const cat = C.categories[+btn.dataset.i], x = homeOf[cat];
    if (!x) return;
    const box = document.getElementById(`cat-${btn.dataset.i}`);
    if (!box.checked) { box.checked = true; state.cats.add(cat); drawRings(); }
    select(x.realm.id, { site: x.site.id, scroll: true, pan: true });
  });
  $('#clearCats').addEventListener('click', () => {
    state.cats.clear();
    document.querySelectorAll('.cat input').forEach((b) => { b.checked = false; });
    drawRings();
  });

  // travel legend
  $('#legend').innerHTML = [
    ['river', T.rivers.name, T.rivers.text], ['road', T.roads.name, T.roads.text], ['gate', T.gates.name, T.gates.text],
    ['boss', 'World bosses', 'Multisystem disease that roams between realms. Guilds fight them together.']
  ].map(([k, n, t]) => `<li>${SW[k]}<div><b>${esc(n)}</b><p>${esc(t)}</p></div></li>`).join('');

  // layer toggles
  document.querySelectorAll('.toggle[data-layer]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const on = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(on));
      $(`#layer-${btn.dataset.layer}`).classList.toggle('off', !on);
    });
  });

  // links inside the panels
  document.addEventListener('click', (e) => {
    const go = e.target.closest('[data-goto]');
    if (go) { select(go.dataset.goto, { pan: true }); return; }
    const gb = e.target.closest('[data-goboss]');
    if (gb) { selectBoss(gb.dataset.goboss); return; }
    if (e.target.closest('[data-scroll]')) $('#dossier').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
  });

  // start: the realm in the link, else the Alchemical Sanctum (where the existing questions live)
  const fromHash = () => {
    const h = decodeURIComponent(location.hash.slice(1));
    if (h.startsWith('boss-') && C.worldBosses.some((b) => b.id === h.slice(5))) return { boss: h.slice(5) };
    return byId[h] ? { realm: h } : null;
  };
  const first = fromHash();
  if (first && first.realm) state.realm = first.realm;
  measure();
  if (first && first.boss) selectBoss(first.boss); else select(state.realm);
  window.addEventListener('hashchange', () => { const h = fromHash(); if (!h) return; if (h.boss) selectBoss(h.boss); else if (h.realm !== state.realm || state.boss) select(h.realm, { pan: true }); });
})();
