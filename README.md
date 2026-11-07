# Endo Rotation 3D: Operation Homeostasis

A 14-day gamified endocrinology rotation for internal medicine residents, built as an installable, offline-capable web app (PWA). Content is adapted from *Endocrine Secrets* (2009), with amber "2026 Update" notes where current guidelines differ.

No build step and no dependencies. It's plain HTML, CSS, and JS.

## Play locally

```powershell
powershell -ExecutionPolicy Bypass -File tools\serve.ps1 -Port 8080
```

Open http://localhost:8080. Opening `index.html` directly also works, but offline caching only activates over http(s).

## Publish (GitHub Pages)

```powershell
gh auth login
gh repo create endo-rotation-3d --public --source . --push
gh api -X POST repos/{owner}/endo-rotation-3d/pages -f "source[branch]=main" -f "source[path]=/"
```

The game will be at `https://<your-username>.github.io/endo-rotation-3d/`.

No-tools alternative: drag this folder onto https://app.netlify.com/drop.

## Install on your phone

- **iPhone (Safari):** open the URL, tap Share, then **Add to Home Screen**.
- **Android (Chrome):** open the URL and tap **Install** in the app, or use ⋮ → **Install app**.

Progress (XP, badges, scores) is saved on the device in localStorage.

## Online play (optional)

Accounts, cloud sync, guilds with chat and a weekly raid boss, quiz duels, and a player-run Trading Post run on a free [Supabase](https://supabase.com) project. Without one, everything else works offline.

1. Create a Supabase project (free tier is plenty for an intern class).
2. **SQL Editor → New query**: paste `supabase/schema.sql` and run it.
3. **Authentication → Sign In / Providers → Email**: turn off **Confirm email** so residents can sign up and play immediately (optional).
4. **Project Settings → API**: copy the **Project URL** and the **anon public** key into `config.js`, then redeploy.

Projects set up before floors existed: run `supabase/add-floors.sql` in the SQL Editor once so residents only see players on the same floor. Until then the game falls back to the old presence call and shows everyone on every floor.

Residents sign in at the Badge Office in the lobby (or the 🌐 button). Signed-in players see each other walking the hospital. On a new phone or browser, residents can sign in right from the welcome screen, which loads their saved progress without making a new badge.

Coins, gear, and XP live in each player's own save. The server enforces the shared parts (guild membership, raid HP and daily attack limits, duel scores, market sales) but trusts each client's inventory, which is fine for a class of friends but not for a public game.

## Adding a day

1. Create `content/dayN.js` that sets `window.ENDO_CONTENT[N] = { scene, objectives, source, stations: [...] }`. Use `content/day1.js` as the template. Station types are `consult`, `pager`, `match`, `sort`, `boss`, and `pearls`.
2. Give the day its own floor plan in `content/rpg-data.js` under `floors[N]` (rooms, doors, decor, spawn/arrive point, and NPC slots). Floor 1 holds the ED, ICU, and the shared services (pharmacy, lab, library, guild hall, arena, badge office); upper floors should look like the units that day's cases come from. Each station slot's `id` matches a key in the day's `cast`. A day without a floor plan borrows Floor 2's.
3. Add a `<script src="content/dayN.js">` tag in `index.html`.
4. Add the file to `ASSETS` in `sw.js` and bump `CACHE`.

## Testing

With the local server running, open `http://localhost:8080/tools/selftest.html`. It plays through Days 1–5 automatically, walks the floors, and reports the score for each station and any errors.

`tools/nettest.html` exercises online play (sign-up, cloud sync, guild, chat, raid, duels, market, presence) against an in-memory fake of Supabase in `tools/netmock.js`. `tools/netmock.html` is the full game wired to that fake, for clicking around without a server.

Icons are regenerated with `tools\make-icons.ps1`.
