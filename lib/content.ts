import { cache } from 'react';
import { isConfigured, serverClient } from './supabase';
import { slugify } from './format';
import type { BlogPost, GoogleProfile, Project, Testimonial } from './types';

/* Fixed number of items shown on the homepage, so the layout never breaks.
   Projects: the first 6 in the admin order are shown (every project still has
   its own page). Others: the database and admin panel enforce the maximums. */
export const LIMITS = { projects: 6, google_profiles: 6, testimonials: 4, blog_posts: 3 };

/** Now, as an ISO timestamp. Posts with a later `published_at` are scheduled (not live yet). */
function now() {
  return new Date().toISOString();
}

async function run<T>(query: PromiseLike<{ data: unknown; error: unknown }>): Promise<T[]> {
  if (!isConfigured) return [];
  try {
    const res = await query;
    if (res.error) throw res.error;
    return (res.data as T[]) || [];
  } catch (e) {
    console.error(e);
    return [];
  }
}

export const getProjects = cache(async () => {
  const rows = await run<Project>(serverClient().from('projects').select('*').eq('visible', true).order('sort_order').order('created_at'));
  // Until the project-pages migration is run, derive a slug from the title.
  return rows.map((p) => (p.slug ? p : { ...p, slug: slugify(p.title), body: p.body ?? null }));
});

export const getProject = cache(async (slug: string) => {
  const projects = await getProjects();
  return projects.find((p) => p.slug === slug) || null;
});

export const getGoogleProfiles = cache(() =>
  run<GoogleProfile>(serverClient().from('google_profiles').select('*').eq('visible', true).order('sort_order').order('created_at')),
);

export const getTestimonials = cache(() =>
  run<Testimonial>(serverClient().from('testimonials').select('*').eq('visible', true).order('sort_order').order('created_at')),
);

export const getPosts = cache(() =>
  run<BlogPost>(
    serverClient().from('blog_posts').select('*').eq('published', true).lte('published_at', now()).order('published_at', { ascending: false }),
  ),
);

export const getPost = cache(async (slug: string) => {
  const posts = await getPosts();
  return posts.find((p) => p.slug === slug) || null;
});
