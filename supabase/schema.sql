-- =====================================================================
-- The Digital PM — Supabase schema
-- Run this whole file once in Supabase → SQL Editor → New query → Run.
-- Then run seed.sql to load the current website content.
-- =====================================================================

-- ---------- Admins ----------------------------------------------------
-- Only users listed here can edit content. Add the owner after creating
-- her login (see README):  insert into admins (email) values ('owner@example.com');
create table if not exists public.admins (
  email text primary key
);
alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.admins where lower(email) = lower(auth.jwt() ->> 'email'));
$$;

-- ---------- Content tables --------------------------------------------
create table if not exists public.projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  image       text,
  alt         text,
  description text,
  body        text,
  tags        text default 'Custom Website Development · SEO',
  url         text,
  visible     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.google_profiles (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  image       text,
  category    text,
  rating      text,
  reviews     int,
  visible     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  quote       text not null,
  name        text not null,
  source      text default 'Google review',
  stars       int not null default 5 check (stars between 1 and 5),
  visible     boolean not null default true,
  sort_order  int not null default 0,
  created_at  timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  slug         text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  excerpt      text,
  body         text,
  cover        text,
  author       text default 'Ugochinyere',
  published    boolean not null default true,
  published_at timestamptz not null default now(),  -- future time = scheduled post
  updated_at   timestamptz not null default now(),  -- set automatically (trigger below)
  created_at   timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  if new is distinct from old then new.updated_at := now(); end if;
  return new;
end $$;
drop trigger if exists touch_blog_posts on public.blog_posts;
create trigger touch_blog_posts before update on public.blog_posts
  for each row execute function public.touch_updated_at();

-- Checkbox / dropdown options for the enquiry form
create table if not exists public.form_options (
  id          uuid primary key default gen_random_uuid(),
  kind        text not null check (kind in ('service', 'budget', 'timeline')),
  label       text not null,
  value       text,
  sort_order  int not null default 0
);

-- Simple key/value settings (Web3Forms key, booking link, contact email)
create table if not exists public.site_settings (
  key   text primary key,
  value text
);

-- ---------- Row Level Security ----------------------------------------
-- Visitors can read visible/published rows. Admins can do everything.
alter table public.projects        enable row level security;
alter table public.google_profiles enable row level security;
alter table public.testimonials    enable row level security;
alter table public.blog_posts      enable row level security;
alter table public.form_options    enable row level security;
alter table public.site_settings   enable row level security;

do $$
declare t text;
begin
  foreach t in array array['projects','google_profiles','testimonials','blog_posts','form_options','site_settings'] loop
    execute format('drop policy if exists "public read" on public.%I', t);
    execute format('drop policy if exists "admin all" on public.%I', t);
    execute format('create policy "admin all" on public.%I for all to authenticated using (public.is_admin()) with check (public.is_admin())', t);
  end loop;
end $$;

create policy "public read" on public.projects        for select using (visible);
create policy "public read" on public.google_profiles for select using (visible);
create policy "public read" on public.testimonials    for select using (visible);
create policy "public read" on public.blog_posts      for select using (published and published_at <= now());
create policy "public read" on public.form_options    for select using (true);
create policy "public read" on public.site_settings   for select using (true);

drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins for select to authenticated
  using (lower(email) = lower(auth.jwt() ->> 'email'));

-- ---------- Fixed homepage limits (enforced in the database too) ------
create or replace function public.enforce_visible_limit()
returns trigger language plpgsql as $$
declare max_rows int := tg_argv[0]::int; n int;
begin
  if new.visible then
    execute format('select count(*) from public.%I where visible and id <> $1', tg_table_name)
      into n using new.id;
    if n >= max_rows then
      raise exception 'Only % items can be shown on the website. Hide or delete one first.', max_rows;
    end if;
  end if;
  return new;
end $$;

-- Projects: no visible limit. The homepage shows the first 6 in the admin
-- order (arrows); every project has its own page at /projects/<slug>.
drop trigger if exists limit_projects on public.projects;
drop trigger if exists limit_google_profiles on public.google_profiles;
create trigger limit_google_profiles before insert or update of visible on public.google_profiles
  for each row execute function public.enforce_visible_limit(6);
drop trigger if exists limit_testimonials on public.testimonials;
create trigger limit_testimonials before insert or update of visible on public.testimonials
  for each row execute function public.enforce_visible_limit(4);

-- ---------- Image storage ---------------------------------------------
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

drop policy if exists "media public read" on storage.objects;
drop policy if exists "media admin write" on storage.objects;
drop policy if exists "media admin update" on storage.objects;
drop policy if exists "media admin delete" on storage.objects;
create policy "media public read"   on storage.objects for select using (bucket_id = 'media');
create policy "media admin write"   on storage.objects for insert to authenticated with check (bucket_id = 'media' and public.is_admin());
create policy "media admin update"  on storage.objects for update to authenticated using (bucket_id = 'media' and public.is_admin());
create policy "media admin delete"  on storage.objects for delete to authenticated using (bucket_id = 'media' and public.is_admin());
