-- Adds floor-aware presence to a project that already ran schema.sql.
-- Each rotation day is its own hospital floor with its own layout, so players
-- should only see other residents who are on the same floor.
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run. Safe to run more than once.
alter table public.players add column if not exists floor int;

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

revoke execute on function public.ping(real, real, int) from public, anon;
grant execute on function public.ping(real, real, int) to authenticated;

-- Ask PostgREST to pick up the new function signature right away.
notify pgrst, 'reload schema';
