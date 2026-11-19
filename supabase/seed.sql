-- Seed data: the content that was on the site before the move to Supabase.
-- Images point at files in assets/images/ (shipped with the site).

insert into public.projects (title, slug, image, alt, description, tags, url, sort_order) values
  ('Cairde Concierge', 'cairde-concierge', 'assets/images/cairde-concierge.png', 'Cairde Concierge homepage screenshot', 'A professional website for a Dublin-based non-medical senior support service, with clear service information and consultation pathways.', 'Custom Website Development · SEO', 'https://www.cairdeconcierge.ie/', 0),
  ('PHS Interiors', 'phs-interiors', 'assets/images/phs-interiors.png', 'Perfect Home Services homepage screenshot', 'A service-focused website showcasing interior design, property solutions and featured projects in Enugu.', 'Custom Website Development · SEO', 'https://www.phsinteriors.com/', 1),
  ('My Hire Roads', 'my-hire-roads', 'assets/images/my-hire-roads.png', 'My Hire Roads homepage screenshot', 'A career services website designed to communicate services, guide prospective clients and collect qualified enquiries.', 'Custom Website Development · SEO', 'https://myhireroad.com/', 2);

insert into public.google_profiles (name, image, category, rating, reviews, sort_order) values
  ('Okpa Enugu in Lagos Foods', 'assets/images/okpa-enugu.png', 'Meal delivery · Lagos, Nigeria', '4.9', 8, 0),
  ('Dfruitz Treats n Sips', 'assets/images/dfruitz.png', 'Catering · Ontario, Canada', '5.0', 16, 1),
  ('Belovenice Studio', 'assets/images/belovenice.png', 'Photography studio · Onitsha, Nigeria', '5.0', 13, 2),
  ('P&J Party Rentals', 'assets/images/pj-party-rentals.png', 'Party equipment rental · Liverpool, UK', '5.0', 3, 3),
  ('Berura Natural Care', 'assets/images/berura.png', 'Beauty supply store', '5.0', 2, 4),
  ('Perfect Home Services', 'assets/images/perfect-home-services.png', 'Interior designer · Enugu, Nigeria', '5.0', 11, 5);

insert into public.testimonials (quote, name, source, stars, sort_order) values
  ('They are the best! Within a few hours, my business was already approved on Google. They are legit!', 'Olamma Sonia', 'Google review', 5, 0),
  ('I had lost access to my Google Business Profile and could not retrieve it despite several attempts. The Digital PM was patient and helped me regain access. My profile is now verified, and customers can find my business on Google. You''re the best!', 'Whispers by Onyi', 'Google review', 5, 1),
  ('Khen Digital came to my rescue when I had trouble setting up my Google Business Profile. The service was great, and my business has gained more visibility.', 'Blessing Adeghare', 'Google review', 5, 2),
  ('Khen Digital Agency set up and optimized my Google Business Profile using the right SEO keywords. Within two weeks, someone found my business on Google and messaged me to place an order. My profile has continued to gain visibility.', 'Bolatito Olalere', 'Google review · Toronto, Canada', 5, 3);

insert into public.form_options (kind, label, value, sort_order) values
  ('service', 'Website development', 'Website development', 0),
  ('service', 'SEO', 'SEO', 1),
  ('service', 'Google Business Profile setup / optimisation', 'Google Business Profile setup or optimisation', 2),
  ('service', 'AI visibility (AEO and GEO)', 'AI visibility (AEO and GEO)', 3),
  ('service', 'Keyword research', 'Keyword research', 4),
  ('service', 'Website SEO audit', 'Website SEO audit', 5),
  ('service', 'Other digital project support', 'Other digital project support', 6),
  ('budget', '$300–$600', '$300–$600', 0),
  ('budget', '$700–$1,000', '$700–$1,000', 1),
  ('budget', '$1,000–$2,000', '$1,000–$2,000', 2),
  ('budget', '$2,000–$3,500', '$2,000–$3,500', 3),
  ('budget', 'Above $3,500', 'Above $3,500', 4),
  ('budget', 'Not sure yet', 'Not sure yet', 5),
  ('timeline', 'Immediately', 'Immediately', 0),
  ('timeline', 'Within 2–4 weeks', 'Within 2–4 weeks', 1),
  ('timeline', 'Within 1–2 months', 'Within 1–2 months', 2),
  ('timeline', 'In 3 months or later', 'In 3 months or later', 3),
  ('timeline', 'Just exploring', 'Just exploring', 4);

insert into public.site_settings (key, value) values
  ('web3forms_access_key', 'YOUR_WEB3FORMS_ACCESS_KEY'),
  ('booking_url', 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ32pDXL2ja_nU9JrW-YQ89WjRD5ostn0DaeHPJTbk-T0AjynajI9yBbZ43FPJbzrxzde9Pf9P_4?gv=true'),
  ('contact_email', 'ugoamoaoneye@gmail.com')
on conflict (key) do update set value = excluded.value;

-- Starter project write-ups: see migrations/2026-11-16_project_pages.sql (section 3).
