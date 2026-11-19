import { revalidatePath } from 'next/cache';
import { serverClient } from '@/lib/supabase';

/** Called by the admin panel after a save so the public pages update instantly.
    Only works for a logged-in admin (checked against the `admins` table via RLS). */
export async function POST(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return Response.json({ ok: false }, { status: 401 });

  const db = serverClient(token);
  const { data, error } = await db.from('admins').select('email').maybeSingle();
  if (error || !data) return Response.json({ ok: false }, { status: 403 });

  revalidatePath('/', 'layout');
  return Response.json({ ok: true });
}
