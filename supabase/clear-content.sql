-- =====================================================================
-- Clear ALL website content (projects, Google profiles, testimonials,
-- blog posts, form options, settings). Cannot be undone.
-- Logins and the admins list are NOT touched.
-- Run in Supabase → SQL Editor → New query → Run.
-- =====================================================================
begin;
delete from public.projects;
delete from public.google_profiles;
delete from public.testimonials;
delete from public.blog_posts;
delete from public.form_options;
delete from public.site_settings;
commit;

-- Uploaded images are not removed by this script (Supabase blocks deleting
-- storage files with SQL). To remove them: Storage → media → select all → Delete.
