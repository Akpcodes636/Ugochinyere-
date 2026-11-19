-- =====================================================================
-- Scheduled blog posts + automatic "last updated" date
-- Run once in Supabase → SQL Editor → New query → Run.
-- Safe to run more than once.
--
-- `published_at` becomes a date AND time. A published post with a future
-- publish time stays hidden from visitors until that moment, then goes
-- live automatically (pages refresh within about a minute).
-- Existing posts keep their date (at 00:00 UTC).
-- =====================================================================

do $$ begin
  if (select data_type from information_schema.columns
      where table_schema = 'public' and table_name = 'blog_posts' and column_name = 'published_at') = 'date' then
    -- The policy depends on the column, so drop it before changing the type.
    drop policy if exists "public read" on public.blog_posts;
    alter table public.blog_posts alter column published_at drop default;
    alter table public.blog_posts
      alter column published_at type timestamptz using (published_at::timestamp at time zone 'UTC');
  end if;
end $$;

alter table public.blog_posts alter column published_at set default now();

drop policy if exists "public read" on public.blog_posts;
create policy "public read" on public.blog_posts for select using (published and published_at <= now());

-- ---------------------------------------------------------------------
-- "Last updated" date: filled in automatically whenever a post changes.
-- Used for the sitemap and Google's dateModified.
-- ---------------------------------------------------------------------
alter table public.blog_posts add column if not exists updated_at timestamptz;
update public.blog_posts set updated_at = published_at where updated_at is null;
alter table public.blog_posts alter column updated_at set default now();
alter table public.blog_posts alter column updated_at set not null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  -- Only when something really changed (auto-save can send identical data).
  if new is distinct from old then
    new.updated_at := now();
  end if;
  return new;
end $$;

drop trigger if exists touch_blog_posts on public.blog_posts;
create trigger touch_blog_posts before update on public.blog_posts
  for each row execute function public.touch_updated_at();
