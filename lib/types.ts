export type Project = {
  id: string; title: string; slug: string; image: string | null; alt: string | null; description: string | null;
  body: string | null; tags: string | null; url: string | null; visible: boolean; sort_order: number;
};
export type GoogleProfile = {
  id: string; name: string; image: string | null; category: string | null; rating: string | null;
  reviews: number | null; visible: boolean; sort_order: number;
};
export type Testimonial = {
  id: string; quote: string; name: string; source: string | null; stars: number; visible: boolean; sort_order: number;
};
export type BlogPost = {
  id: string; title: string; slug: string; excerpt: string | null; body: string | null; cover: string | null;
  author: string | null; published: boolean; published_at: string; created_at: string;
  /** Set by the database on every change (missing until the migration is run). */
  updated_at?: string | null;
};
