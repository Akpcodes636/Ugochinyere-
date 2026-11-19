# The Digital PM — website (Next.js)

Next.js 16 (App Router) site. Content lives in **Supabase** and is edited at **`/admin`**.
Enquiries are sent through **Web3Forms**. The design is the original CSS, unchanged (`app/styles.css`, `app/admin.css`).

Pages are **server-rendered** (good for SEO): Google sees all projects, reviews and blog posts in the HTML.
They are cached and refreshed every 60 seconds, and **instantly** whenever something is saved in the admin panel.

## Structure

```
app/(site)/layout.tsx          Header, footer, site-wide SEO metadata
app/(site)/page.tsx            Homepage
app/(site)/blog/page.tsx       All blog posts           → /blog
app/(site)/blog/[slug]/        One blog post            → /blog/my-post
app/admin/                     Admin panel (login)      → /admin
app/api/revalidate/route.ts    Refreshes pages after admin saves (admins only)
app/sitemap.ts, app/robots.ts  /sitemap.xml and /robots.txt
components/                    Header/footer, enquiry form, blog cards, admin app
lib/content.ts                 Supabase queries + fixed homepage limits
public/assets/images/          Images that ship with the site
supabase/schema.sql, seed.sql  Database setup
_legacy-static/                The old HTML version (safe to delete)
```

## SEO included

- Real HTML for every page, unique `<title>`, description and canonical URL per page
- Clean blog URLs (`/blog/my-post`) with Open Graph / Twitter cards from the post's cover and summary
- JSON-LD structured data: `ProfessionalService` (with reviews), `WebSite`, `Blog`, `BlogPosting`
- Automatic `sitemap.xml` (includes every published post) and `robots.txt` (admin hidden)
- Old URLs (`index.html`, `blog.html`, `post.html?slug=…`) 308-redirect to the new ones

## Fixed limits (so the layout never breaks)

| Section           | Shown on homepage |
|-------------------|-------------------|
| Selected Projects | 6                 |
| Google Profiles   | 6                 |
| Testimonials      | 4                 |
| Blog              | 3 newest (all on /blog) |

## Writing blog posts (Medium-style)

**Admin → Blog → + Write a story** opens a clean writing page:

- Type the **title**, then a short **summary** under it (shown on the blog card and in Google), then your story.
- **Select text** to get the toolbar: bold, italic, link, big/small heading, quote, list.
- On an **empty line**, click **+** to add an image or a divider. You can also paste or drag images in.
- Shortcuts at the start of a line, then a space: `##` heading, `###` small heading, `>` quote, `-` list. `---` + Enter = divider.
- Everything **saves automatically**. New stories are **drafts** until you press **Publish**.

## Publishing and scheduling

Press **Publish** (top right). The panel shows a **Google preview** and lets you set the web address and author. Then:

- **Publish now**: the story goes live immediately.
- **Schedule for later**: pick a date & time (your local time). The post shows a **Scheduled** badge, stays hidden
  from visitors, Google and the sitemap, and goes live automatically at that time (pages refresh within about a minute).
- A scheduled post can be rescheduled or **cancelled** (back to draft); a live post can be **unpublished**.

Editing a live post records a *last updated* date automatically; it is sent to Google and the sitemap,
and shown on the post as "Updated …" when it is a later day than the publish date. Posts also show "X min read".

## Setup

1. **Supabase → SQL Editor:** run `supabase/schema.sql`, then `supabase/seed.sql`.
   Existing database? Run the files in `supabase/migrations/` instead (each is safe to re-run).
2. **Owner login:** Authentication → Users → *Add user*, then
   `insert into admins (email) values ('owner@example.com');`
   Recommended: Authentication → Providers → Email → turn **off** "Allow new users to sign up".
3. **Environment variables** (`.env.local` locally, and in your host's dashboard, e.g. Vercel):
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   NEXT_PUBLIC_SITE_URL=https://www.your-domain.com   ← important for SEO (canonical, sitemap)
   NEXT_PUBLIC_SITE_TIMEZONE=Africa/Lagos              ← time zone for dates on the site (e.g. Europe/Dublin)
   ```
4. **Auth redirect:** Authentication → URL Configuration → *Site URL* = your domain, and add
   `https://YOUR-DOMAIN/admin` to *Redirect URLs* (for password-reset emails).
5. **Web3Forms:** paste your access key in **Admin → Settings**.
6. **Deploy** to Vercel (recommended) or any Node host: `npm run build && npm start`.
7. After going live, submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console.

## Running locally

```
npm install
npm run dev        # http://localhost:3000
```
