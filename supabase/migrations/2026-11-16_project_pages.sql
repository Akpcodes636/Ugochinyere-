-- =====================================================================
-- Project pages + "top 6 by position" homepage rule
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.
-- =====================================================================

-- 1. Each project gets its own page: a URL slug and a full write-up.
alter table public.projects add column if not exists slug text;
alter table public.projects add column if not exists body text;

-- Fill slugs for existing projects from their titles (duplicates get -2, -3 …).
with base as (
  select id,
         coalesce(nullif(trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g')), ''), 'project') as s,
         sort_order, created_at
  from public.projects
  where slug is null
), ranked as (
  select id, s, row_number() over (partition by s order by sort_order, created_at) as rn from base
)
update public.projects p
set slug = case when r.rn = 1 then r.s else r.s || '-' || r.rn end
from ranked r
where p.id = r.id;

alter table public.projects alter column slug set not null;
do $$ begin
  alter table public.projects add constraint projects_slug_key unique (slug);
exception when duplicate_table or duplicate_object then null; end $$;
do $$ begin
  alter table public.projects add constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
exception when duplicate_object then null; end $$;

-- 2. The homepage now shows the FIRST 6 projects in the admin order
--    (use the ↑ ↓ arrows to choose). Every project keeps its own page,
--    so the old "only 6 visible" database limit is removed for projects.
drop trigger if exists limit_projects on public.projects;
update public.projects set visible = true where not visible;

-- Renumber so the order is clean (0, 1, 2 …).
with ordered as (
  select id, row_number() over (order by sort_order, created_at) - 1 as n from public.projects
)
update public.projects p set sort_order = o.n from ordered o where p.id = o.id and p.sort_order <> o.n;

-- 3. Starter write-ups for the original projects (only where none exists yet).
--    Edit these in Admin → Selected Projects → Edit → "Full project description".
update public.projects set body = $md$
## About the client

Cairde Concierge is a Dublin-based, non-medical senior support service. Families come to the website looking for reassurance: who will be caring for their loved one, what support is offered, and how to get started.

## What we built

- A professional, calm website that explains each service in plain language
- Clear consultation pathways so families know exactly how to take the next step
- Mobile-friendly pages, as many visitors browse on their phones

## SEO foundations

- Google indexing set up from launch
- Technical SEO foundations: page titles, descriptions, headings and fast-loading pages
- Content structured around what families in Dublin search for when looking for senior support
$md$ where slug = 'cairde-concierge' and body is null;

update public.projects set body = $md$
## About the client

PHS Interiors (Perfect Home Services) provides interior design and property solutions in Enugu. Their work is visual, so the website needed to let the projects speak for themselves.

## What we built

- A service-focused website presenting interior design and property solutions
- A featured projects section to showcase completed work
- Clear calls to action so visitors can request a consultation

## SEO foundations

- Google indexing set up from launch
- Technical SEO foundations: page titles, descriptions, headings and image descriptions
- Content structured around local searches for interior design in Enugu
$md$ where slug = 'phs-interiors' and body is null;

update public.projects set body = $md$
## About the client

My Hire Roads is a career services business helping job seekers move forward in their careers. Prospective clients need to quickly understand the services and trust the team before getting in touch.

## What we built

- A career services website that clearly communicates each service
- Guided journeys that lead prospective clients to the right service
- Enquiry forms designed to collect qualified leads

## SEO foundations

- Google indexing set up from launch
- Technical SEO foundations: page titles, descriptions, headings and fast-loading pages
- Content structured around what job seekers search for
$md$ where slug = 'my-hire-roads' and body is null;
