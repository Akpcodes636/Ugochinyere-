export const SITE_NAME = 'The Digital PM';
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
export const CONTACT_EMAIL = 'ugoamoaoneye@gmail.com';
export const SOCIALS = {
  instagram: 'https://www.instagram.com/thedigitalpm_',
  tiktok: 'https://www.tiktok.com/@thedigitalpm_',
  linkedin: 'https://www.linkedin.com/in/ugochinyereamaonyeanaso-digitalprojectmanager/',
  upwork: 'https://www.upwork.com/freelancers/~01f1e193209236a77b',
};
export const AUDIT_URL = 'https://businessvisibility.netlify.app/';

/** Images are either full Supabase Storage URLs or paths to files shipped with the site (public/). */
export function src(path: string | null | undefined): string {
  const p = String(path || '').trim();
  if (!p) return '';
  return /^https?:/i.test(p) ? p : '/' + p.replace(/^\/+/, '');
}

/** Absolute URL (for Open Graph / JSON-LD). */
export function absolute(path: string | null | undefined): string {
  const s = src(path);
  return /^https?:/i.test(s) ? s : SITE_URL + s;
}

/** Only allow http(s), mailto and relative links. */
export function safeUrl(url: string | null | undefined): string {
  const u = String(url || '').trim();
  return /^(https?:|mailto:|\/|#)/i.test(u) ? u : '#';
}

export function stars(n: number | string | null | undefined): string {
  const count = Math.max(0, Math.min(5, Math.round(Number(n) || 5)));
  return '★★★★★'.slice(0, count);
}

/** Time zone used for dates shown on the website (e.g. Africa/Lagos, Europe/Dublin). */
export const SITE_TIME_ZONE = process.env.NEXT_PUBLIC_SITE_TIMEZONE || 'Africa/Lagos';

export function formatDate(value: string | null | undefined): string {
  if (!value) return '';
  const d = new Date(value);
  if (isNaN(d.getTime())) return '';
  const opts = { day: 'numeric', month: 'long', year: 'numeric' } as const;
  try {
    return d.toLocaleDateString('en-GB', { ...opts, timeZone: SITE_TIME_ZONE });
  } catch {
    return d.toLocaleDateString('en-GB', { ...opts, timeZone: 'UTC' }); // invalid time zone setting
  }
}

/** When a post last changed: its update time, but never earlier than when it went live. */
export function modifiedAt(post: { published_at: string; updated_at?: string | null }): string {
  const u = post.updated_at;
  return u && new Date(u).getTime() > new Date(post.published_at).getTime() ? u : post.published_at;
}

/** "PHS Interiors" → "phs-interiors" (same rule as the admin panel and the database). */
export function slugify(s: string | null | undefined): string {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'project';
}

/** Minutes to read, Medium-style (about 225 words a minute, at least 1). */
export function readingTime(words: number): number {
  return Math.max(1, Math.round(words / 225));
}

/** Word count of a Markdown article (ignores image links and symbols). */
export function wordCount(markdown: string | null | undefined): number {
  const text = String(markdown || '').replace(/!\[[^\]]*]\([^)]*\)/g, ' ').replace(/[#>*_`\-[\]()]/g, ' ').trim();
  return text ? text.split(/\s+/).length : 0;
}
