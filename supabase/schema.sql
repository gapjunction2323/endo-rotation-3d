-- Endo Rotation: online play schema.
-- Supabase dashboard -> SQL Editor -> New query -> paste this whole file -> Run.
-- Safe to re-run: tables are created only if missing and functions are replaced.

create extension if not exists pgcrypto;

-- ---------- tables ----------
create table if not exists public.players (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 24),
  avatar text not null default '🧑‍⚕️' check (char_length(avatar) <= 16),
  level int not null default 1,
  xp int not null default 0,
  guild_id uuid,
  x real,
  y real,
  floor int,
  seen_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.saves (
  id uuid primary key references public.players(id) on delete cascade,
  data jsonb not null,
  saved_at timestamptz not null default now()
);

create table if not exists public.guilds (
  id uuid primary key default gen_random_uuid(),
  name text not null unique check (char_length(name) between 2 and 24),
  emblem text not null default '🛡️' check (char_length(emblem) <= 16),
  code text not null unique,
  owner uuid references public.players(id) on delete set null,
  created_at timestamptz not null default now()
);

do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'players_guild_fk') then
    alter table public.players add constraint players_guild_fk foreign key (guild_id) references public.guilds(id) on delete set null;
  end if;
end $$;

create table if not exists public.guild_msgs (
  id bigint generated always as identity primary key,
  guild_id uuid not null references public.guilds(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 300),
  created_at timestamptz not null default now()
);

create table if not exists public.raids (
  id uuid primary key default gen_random_uuid(),
  guild_id uuid not null references public.guilds(id) on delete cascade,
  week date not null,
  boss text not null,
  max_hp int not null,
  hp int not null,
  defeated_at timestamptz,
  unique (guild_id, week)
);

create table if not exists public.raid_hits (
  id bigint generated always as identity primary key,
  raid_id uuid not null references public.raids(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  dmg int not null,
  created_at timestamptz not null default now()
);

create table if not exists public.raid_claims (
  raid_id uuid not null references public.raids(id) on delete cascade,
  player_id uuid not null references public.players(id) on delete cascade,
  primary key (raid_id, player_id)
);

create table if not exists public.duels (
  id uuid primary key default gen_random_uuid(),
  challenger uuid not null references public.players(id) on delete cascade,
  opponent uuid not null references public.players(id) on delete cascade,
  seed int not null,
  c_score int,
  o_score int,
  status text not null default 'pending' check (status in ('pending', 'done', 'declined')),
  c_claimed boolean not null default false,
  o_claimed boolean not null default false,
  created_at timestamptz not null default now(),
  check (challenger <> opponent)
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller uuid not null references public.players(id) on delete cascade,
  kind text not null check (kind in ('mat', 'cons', 'item')),
  item text not null check (char_length(item) <= 32),
  qty int not null check (qty between 1 and 99),
  price int not null check (price between 1 and 100000),
  status text not null default 'open' check (status in ('open', 'sold', 'cancelled')),
  buyer uuid references public.players(id) on delete set null,
  seller_paid boolean not null default false,
  created_at timestamptz not null default now(),
  sold_at timestamptz
);

create index if not exists players_seen_idx on public.players (seen_at);
alter table public.players add column if not exists floor int;
create index if not exists guild_msgs_guild_idx on public.guild_msgs (guild_id, id desc);
create index if not exists raid_hits_raid_idx on public.raid_hits (raid_id, player_id);
create index if not exists listings_status_idx on public.listings (status, created_at desc);

-- ---------- privileges ----------
-- Clients read through row-level security and change shared state only through the functions below.
revoke all on public.players, public.saves, public.guilds, public.guild_msgs, public.raids,
  public.raid_hits, public.raid_claims, public.duels, public.listings from anon, authenticated;

grant select on public.players to authenticated;
grant insert (id, name, avatar, level, xp) on public.players to authenticated;
grant update (name, avatar, level, xp) on public.players to authenticated;
grant select, insert, update on public.saves to authenticated;
grant select (id, name, emblem, owner, created_at) on public.guilds to authenticated;
grant select, insert on public.guild_msgs to authenticated;
grant select on public.raids, public.raid_hits, public.raid_claims, public.duels, public.listings to authenticated;

alter table public.players enable row level security;
alter table public.saves enable row level security;
alter table public.guilds enable row level security;
alter table public.guild_msgs enable row level security;
alter table public.raids enable row level security;
alter table public.raid_hits enable row level security;
alter table public.raid_claims enable row level security;
alter table public.duels enable row level security;
alter table public.listings enable row level security;

create or replace function public.my_guild_id() returns uuid
language sql stable security definer set search_path = public as $$
  select guild_id from players where id = auth.uid()
$$;

drop policy if exists players_read on public.players;
create policy players_read on public.players for select to authenticated using (true);
drop policy if exists players_insert on public.players;
create policy players_insert on public.players for insert to authenticated with check (id = auth.uid());
drop policy if exists players_update on public.players;
create policy players_update on public.players for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists saves_own on public.saves;
create policy saves_own on public.saves for all to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists guilds_read on public.guilds;
create policy guilds_read on public.guilds for select to authenticated using (true);

drop policy if exists msgs_read on public.guild_msgs;
create policy msgs_read on public.guild_msgs for select to authenticated using (guild_id = public.my_guild_id());
drop policy if exists msgs_write on public.guild_msgs;
create policy msgs_write on public.guild_msgs for insert to authenticated
  with check (player_id = auth.uid() and guild_id = public.my_guild_id());

drop policy if exists raids_read on public.raids;
create policy raids_read on public.raids for select to authenticated using (guild_id = public.my_guild_id());
drop policy if exists hits_read on public.raid_hits;
create policy hits_read on public.raid_hits for select to authenticated
  using (raid_id in (select id from public.raids where guild_id = public.my_guild_id()));
drop policy if exists claims_read on public.raid_claims;
create policy claims_read on public.raid_claims for select to authenticated using (player_id = auth.uid());

drop policy if exists duels_read on public.duels;
create policy duels_read on public.duels for select to authenticated using (auth.uid() in (challenger, opponent));

drop policy if exists listings_read on public.listings;
create policy listings_read on public.listings for select to authenticated using (true);

-- ---------- presence ----------
create or replace function public.ping(p_x real, p_y real)
returns table (id uuid, name text, avatar text, level int, x real, y real)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  update players set x = p_x, y = p_y, seen_at = now() where players.id = auth.uid();
  return query
    select p.id, p.name, p.avatar, p.level, p.x, p.y from players p
    where p.id <> auth.uid() and p.seen_at > now() - interval '30 seconds' and p.x is not null;
end $$;

-- Floor-aware presence: each rotation day is its own hospital floor, so players only see others on the same floor.
create or replace function public.ping(p_x real, p_y real, p_floor int)
returns table (id uuid, name text, avatar text, level int, x real, y real)
language plpgsql security definer set search_path = public as $$
#variable_conflict use_column
begin
  update players set x = p_x, y = p_y, floor = p_floor, seen_at = now() where players.id = auth.uid();
  return query
    select p.id, p.name, p.avatar, p.level, p.x, p.y from players p
    where p.id <> auth.uid() and p.seen_at > now() - interval '30 seconds' and p.x is not null
      and coalesce(p.floor, 1) = coalesce(p_floor, 1);
end $$;

create or replace function public.touch() returns void
language sql security definer set search_path = public as $$
  update players set seen_at = now() where id = auth.uid()
$$;

-- ---------- guilds ----------
create or replace function public.my_guild() returns json
language plpgsql stable security definer set search_path = public as $$
declare g guilds;
begin
  select * into g from guilds where id = my_guild_id();
  if not found then return null; end if;
  return json_build_object('id', g.id, 'name', g.name, 'emblem', g.emblem, 'code', g.code, 'owner', g.owner);
end $$;

create or replace function public.create_guild(p_name text, p_emblem text) returns json
language plpgsql security definer set search_path = public as $$
declare g guilds;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if my_guild_id() is not null then raise exception 'Leave your current guild first.'; end if;
  if exists (select 1 from guilds where lower(name) = lower(trim(p_name))) then raise exception 'That guild name is taken.'; end if;
  insert into guilds (name, emblem, code, owner)
    values (trim(p_name), coalesce(nullif(trim(p_emblem), ''), '🛡️'), upper(substr(md5(gen_random_uuid()::text), 1, 6)), auth.uid())
    returning * into g;
  update players set guild_id = g.id where id = auth.uid();
  return json_build_object('id', g.id, 'name', g.name, 'emblem', g.emblem, 'code', g.code, 'owner', g.owner);
end $$;

create or replace function public.join_guild(p_code text) returns json
language plpgsql security definer set search_path = public as $$
declare g guilds;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if my_guild_id() is not null then raise exception 'Leave your current guild first.'; end if;
  select * into g from guilds where code = upper(trim(p_code));
  if not found then raise exception 'No guild has that code.'; end if;
  if (select count(*) from players where guild_id = g.id) >= 30 then raise exception 'That guild is full (30 members).'; end if;
  update players set guild_id = g.id where id = auth.uid();
  return json_build_object('id', g.id, 'name', g.name, 'emblem', g.emblem, 'code', g.code, 'owner', g.owner);
end $$;

create or replace function public.leave_guild() returns void
language plpgsql security definer set search_path = public as $$
declare gid uuid := my_guild_id(); heir uuid;
begin
  if gid is null then return; end if;
  update players set guild_id = null where id = auth.uid();
  select id into heir from players where guild_id = gid order by xp desc limit 1;
  if heir is null then delete from guilds where id = gid;
  else update guilds set owner = heir where id = gid and (owner = auth.uid() or owner is null);
  end if;
end $$;

-- ---------- raids ----------
create or replace function public.raid_current(p_boss text) returns public.raids
language plpgsql security definer set search_path = public as $$
declare gid uuid := my_guild_id(); wk date := date_trunc('week', now())::date; r raids; n int; start_hp int;
begin
  if gid is null then raise exception 'Join a guild first.'; end if;
  select * into r from raids where guild_id = gid and week = wk;
  if found then return r; end if;
  select count(*) into n from players where guild_id = gid;
  start_hp := 200 + 400 * greatest(n, 1);
  insert into raids (guild_id, week, boss, max_hp, hp) values (gid, wk, left(coalesce(p_boss, 'Raid Boss'), 40), start_hp, start_hp)
    on conflict (guild_id, week) do nothing;
  select * into r from raids where guild_id = gid and week = wk;
  return r;
end $$;

create or replace function public.raid_hit(p_raid uuid, p_dmg int) returns int
language plpgsql security definer set search_path = public as $$
declare r raids; d int := greatest(0, least(coalesce(p_dmg, 0), 120)); today int;
begin
  select * into r from raids where id = p_raid and guild_id = my_guild_id() for update;
  if not found then raise exception 'Raid not found.'; end if;
  if r.hp <= 0 then return 0; end if;
  select count(*) into today from raid_hits
    where raid_id = p_raid and player_id = auth.uid() and created_at > now() - interval '20 hours';
  if today >= 3 then raise exception 'You are out of raid attacks for today. Come back tomorrow.'; end if;
  insert into raid_hits (raid_id, player_id, dmg) values (p_raid, auth.uid(), d);
  update raids set hp = greatest(0, hp - d), defeated_at = case when hp - d <= 0 then now() else defeated_at end
    where id = p_raid returning hp into r.hp;
  return r.hp;
end $$;

create or replace function public.raid_claim(p_raid uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not exists (select 1 from raids where id = p_raid and guild_id = my_guild_id() and hp <= 0) then
    raise exception 'The boss is still standing.';
  end if;
  if not exists (select 1 from raid_hits where raid_id = p_raid and player_id = auth.uid()) then
    raise exception 'Only residents who joined the fight get loot.';
  end if;
  insert into raid_claims (raid_id, player_id) values (p_raid, auth.uid()) on conflict do nothing;
  get diagnostics n = row_count;
  return case when n > 0 then 80 else 0 end;
end $$;

-- ---------- duels ----------
create or replace function public.duel_create(p_opponent uuid) returns json
language plpgsql security definer set search_path = public as $$
declare d duels;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if p_opponent = auth.uid() then raise exception 'You cannot duel yourself.'; end if;
  if not exists (select 1 from players where id = p_opponent) then raise exception 'Player not found.'; end if;
  if (select count(*) from duels where challenger = auth.uid() and status = 'pending') >= 5 then
    raise exception 'You already have 5 open challenges. Wait for some to finish.';
  end if;
  insert into duels (challenger, opponent, seed) values (auth.uid(), p_opponent, floor(random() * 2000000000)::int) returning * into d;
  return json_build_object('id', d.id, 'seed', d.seed);
end $$;

create or replace function public.duel_submit(p_id uuid, p_score int) returns public.duels
language plpgsql security definer set search_path = public as $$
declare d duels; s int := greatest(0, least(coalesce(p_score, 0), 1000));
begin
  select * into d from duels where id = p_id for update;
  if not found or auth.uid() not in (d.challenger, d.opponent) then raise exception 'Duel not found.'; end if;
  if d.status <> 'pending' then raise exception 'This duel is already over.'; end if;
  if auth.uid() = d.challenger and d.c_score is null then d.c_score := s;
  elsif auth.uid() = d.opponent and d.o_score is null then d.o_score := s;
  else raise exception 'You already played this duel.';
  end if;
  update duels set c_score = d.c_score, o_score = d.o_score,
    status = case when d.c_score is not null and d.o_score is not null then 'done' else 'pending' end
    where id = p_id returning * into d;
  return d;
end $$;

create or replace function public.duel_decline(p_id uuid) returns void
language sql security definer set search_path = public as $$
  update duels set status = 'declined' where id = p_id and opponent = auth.uid() and status = 'pending' and o_score is null
$$;

create or replace function public.duel_claim(p_id uuid) returns int
language plpgsql security definer set search_path = public as $$
declare d duels; mine int; theirs int;
begin
  select * into d from duels where id = p_id for update;
  if not found or d.status <> 'done' or auth.uid() not in (d.challenger, d.opponent) then raise exception 'Nothing to claim.'; end if;
  if auth.uid() = d.challenger then
    if d.c_claimed then return 0; end if;
    update duels set c_claimed = true where id = p_id;
    mine := d.c_score; theirs := d.o_score;
  else
    if d.o_claimed then return 0; end if;
    update duels set o_claimed = true where id = p_id;
    mine := d.o_score; theirs := d.c_score;
  end if;
  return case when mine > theirs then 40 when mine = theirs then 20 else 10 end;
end $$;

-- ---------- market ----------
create or replace function public.market_list(p_kind text, p_item text, p_qty int, p_price int) returns uuid
language plpgsql security definer set search_path = public as $$
declare lid uuid;
begin
  if auth.uid() is null then raise exception 'Sign in first.'; end if;
  if (select count(*) from listings where seller = auth.uid() and status = 'open') >= 10 then
    raise exception 'You can have at most 10 open listings.';
  end if;
  insert into listings (seller, kind, item, qty, price) values (auth.uid(), p_kind, p_item, p_qty, p_price) returning id into lid;
  return lid;
end $$;

create or replace function public.market_buy(p_id uuid) returns public.listings
language plpgsql security definer set search_path = public as $$
declare l listings;
begin
  update listings set status = 'sold', buyer = auth.uid(), sold_at = now()
    where id = p_id and status = 'open' and seller <> auth.uid() returning * into l;
  if not found then raise exception 'That listing is no longer available.'; end if;
  return l;
end $$;

create or replace function public.market_cancel(p_id uuid) returns public.listings
language plpgsql security definer set search_path = public as $$
declare l listings;
begin
  update listings set status = 'cancelled' where id = p_id and seller = auth.uid() and status = 'open' returning * into l;
  if not found then raise exception 'That listing already sold or was removed.'; end if;
  return l;
end $$;

create or replace function public.market_collect() returns int
language plpgsql security definer set search_path = public as $$
declare total int;
begin
  with paid as (
    update listings set seller_paid = true where seller = auth.uid() and status = 'sold' and not seller_paid returning price
  ) select coalesce(sum(price), 0) into total from paid;
  return total;
end $$;

-- ---------- hiscores ----------
create or replace function public.hiscores()
returns table (id uuid, name text, avatar text, level int, xp int, guild text, emblem text, duel_wins int, raid_dmg int)
language sql stable security definer set search_path = public as $$
  select p.id, p.name, p.avatar, p.level, p.xp, g.name, g.emblem,
    (select count(*)::int from duels d where d.status = 'done'
       and ((d.challenger = p.id and d.c_score > d.o_score) or (d.opponent = p.id and d.o_score > d.c_score))),
    (select coalesce(sum(h.dmg), 0)::int from raid_hits h where h.player_id = p.id)
  from players p left join guilds g on g.id = p.guild_id
  order by p.xp desc
  limit 200
$$;

-- ---------- function access ----------
revoke execute on all functions in schema public from anon, public;
grant execute on function public.my_guild_id(), public.ping(real, real), public.ping(real, real, int), public.touch(), public.my_guild(),
  public.create_guild(text, text), public.join_guild(text), public.leave_guild(),
  public.raid_current(text), public.raid_hit(uuid, int), public.raid_claim(uuid),
  public.duel_create(uuid), public.duel_submit(uuid, int), public.duel_decline(uuid), public.duel_claim(uuid),
  public.market_list(text, text, int, int), public.market_buy(uuid), public.market_cancel(uuid), public.market_collect(),
  public.hiscores()
  to authenticated;
