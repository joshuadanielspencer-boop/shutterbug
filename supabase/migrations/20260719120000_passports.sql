-- ===========================================================================
-- Shutterbug: cross-device passport sync.
--
-- Design constraints that drove this schema:
--
--   * The data is CHILDREN'S. A first name and geography scores, nothing more.
--     No email, no birthdate, no free text a child can type. That is a schema
--     decision, not a policy one: there is nowhere here to put those things.
--   * A co-op is coming. Retrofitting row-level security after other families'
--     children are in the table is far worse than designing for it now, so the
--     household model is here from the first migration even though the first
--     release only syncs one household.
--   * The client is a static PWA holding a PUBLIC anon key. Every guarantee in
--     this file therefore has to hold in the database. Nothing may rely on the
--     client behaving.
--
-- RLS is enabled on every table and there is no permissive "for testing" policy
-- anywhere — those are what ship by accident.
-- ===========================================================================

-- A household is a set of devices that share travelers. Devices join with a code.
create table if not exists public.households (
  id          uuid primary key default gen_random_uuid(),
  -- The join code is a bearer secret: anyone holding it can join and read the
  -- household's passports. It is generated server-side (see the RPC below) rather
  -- than by the client, and it can be rotated by nulling it out.
  join_code   text unique,
  created_at  timestamptz not null default now()
);

create table if not exists public.household_members (
  household_id uuid not null references public.households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  joined_at    timestamptz not null default now(),
  primary key (household_id, user_id)
);

create table if not exists public.passports (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  -- The traveler's name as the family types it. Only ever visible inside the
  -- household.
  traveler_name text not null,
  -- What a leaderboard outside the household would show instead. Set by a parent;
  -- null means this traveler does not appear on any shared board at all.
  display_name  text,
  -- The whole profile, as the same JSON the file export writes. A blob rather than
  -- a normalised schema on purpose: profile fields are still being added, and a
  -- blob makes that churn free.
  blob          jsonb not null,
  -- Denormalised purely so a leaderboard query never has to open the blob.
  best_score    integer,
  best_rank     text,
  updated_at    timestamptz not null default now(),
  unique (household_id, traveler_name)
);

create index if not exists passports_household_idx on public.passports (household_id);

alter table public.households        enable row level security;
alter table public.household_members enable row level security;
alter table public.passports         enable row level security;

-- Is the caller a member of this household? SECURITY DEFINER so the membership
-- check itself isn't subject to the policy that calls it (which would recurse).
create or replace function public.is_household_member(hid uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.household_members m
    where m.household_id = hid and m.user_id = auth.uid()
  );
$$;

-- ---- Policies -------------------------------------------------------------
-- Members see their own household and nothing else. Note households are NOT
-- selectable by join_code: looking one up by code goes through the RPC below, so
-- codes can't be enumerated with a table scan.
drop policy if exists households_select on public.households;
create policy households_select on public.households
  for select using (public.is_household_member(id));

drop policy if exists members_select on public.household_members;
create policy members_select on public.household_members
  for select using (public.is_household_member(household_id));

drop policy if exists members_leave on public.household_members;
create policy members_leave on public.household_members
  for delete using (user_id = auth.uid());

-- Passports: full access within your household, none outside it.
drop policy if exists passports_select on public.passports;
create policy passports_select on public.passports
  for select using (public.is_household_member(household_id));

drop policy if exists passports_insert on public.passports;
create policy passports_insert on public.passports
  for insert with check (public.is_household_member(household_id));

drop policy if exists passports_update on public.passports;
create policy passports_update on public.passports
  for update using (public.is_household_member(household_id))
  with check (public.is_household_member(household_id));

drop policy if exists passports_delete on public.passports;
create policy passports_delete on public.passports
  for delete using (public.is_household_member(household_id));

-- ---- Joining --------------------------------------------------------------
-- Creating a household makes the caller its first member, and returns the code.
create or replace function public.create_household()
returns table (household_id uuid, join_code text)
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
  code text;
begin
  if auth.uid() is null then
    raise exception 'must be signed in';
  end if;
  -- 12 hex chars from a cryptographically secure source: ~48 bits. Long enough
  -- that guessing is not a realistic path to another family's data, short enough
  -- that a parent can read it off one screen and type it into another.
  code := encode(gen_random_bytes(6), 'hex');
  insert into public.households (join_code) values (code) returning id into hid;
  insert into public.household_members (household_id, user_id) values (hid, auth.uid());
  return query select hid, code;
end;
$$;

-- Join by code. SECURITY DEFINER because the caller cannot (and must not) be able
-- to SELECT households by join_code directly.
create or replace function public.join_household(code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  hid uuid;
begin
  if auth.uid() is null then
    raise exception 'must be signed in';
  end if;
  select id into hid from public.households where join_code = code;
  if hid is null then
    raise exception 'no such code';
  end if;
  insert into public.household_members (household_id, user_id)
  values (hid, auth.uid())
  on conflict do nothing;
  return hid;
end;
$$;

revoke all on function public.create_household() from public, anon;
revoke all on function public.join_household(text) from public, anon;
grant execute on function public.create_household() to authenticated;
grant execute on function public.join_household(text) to authenticated;
