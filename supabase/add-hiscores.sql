-- Adds the hiscores board to a project that already ran schema.sql.
-- Supabase dashboard -> SQL Editor -> New query -> paste -> Run.
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

revoke execute on function public.hiscores() from public, anon;
grant execute on function public.hiscores() to authenticated;
