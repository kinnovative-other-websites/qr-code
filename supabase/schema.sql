-- ============================================================
-- QR Studio — Supabase schema for global short links
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).
-- ============================================================

create extension if not exists "pgcrypto";

create table if not exists public.links (
  id            uuid primary key default gen_random_uuid(),
  code          text not null unique,
  url           text not null,
  owner         text,                       -- anonymous per-browser id (for history scoping)
  title         text,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz,
  clicks        integer not null default 0,
  last_accessed timestamptz
);

create index if not exists links_owner_idx on public.links (owner);
create index if not exists links_code_idx  on public.links (code);

-- Row Level Security ------------------------------------------------
alter table public.links enable row level security;

-- Public READ so any device can resolve a code (codes are public by nature).
drop policy if exists "links_select_public" on public.links;
create policy "links_select_public" on public.links
  for select using (true);

-- Public INSERT (no auth in this app).
drop policy if exists "links_insert_public" on public.links;
create policy "links_insert_public" on public.links
  for insert with check (true);

-- Public DELETE (the client filters by owner; tighten this if you add auth).
drop policy if exists "links_delete_public" on public.links;
create policy "links_delete_public" on public.links
  for delete using (true);

-- NOTE: no UPDATE policy — clicks are only mutated by the SECURITY DEFINER
-- function below, so clients cannot tamper with counts directly.

-- Atomic click increment ------------------------------------------
create or replace function public.increment_click(p_code text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.links
     set clicks = clicks + 1,
         last_accessed = now()
   where code = p_code;
end;
$$;

grant execute on function public.increment_click(text) to anon, authenticated;
