'use client';

/* Helpers shared by the admin list/editor (AdminApp) and the blog writer (BlogEditor). */
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupabaseClient } from '@supabase/supabase-js';
import { STORAGE_BUCKET } from '@/lib/supabase';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Row = Record<string, any> & { id: string };
export type Toast = (msg: string, isError?: boolean) => void;
export type Ctx = { db: SupabaseClient; toast: Toast; refreshSite: () => void };

export function slugify(s: string) {
  return String(s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export function friendlyError(err: unknown) {
  const m = (err && typeof err === 'object' && 'message' in err ? String((err as { message: string }).message) : String(err));
  if (/duplicate key.*slug/i.test(m)) return 'Another item already uses that URL slug.';
  if (/row-level security/i.test(m)) return 'You do not have permission to do that.';
  return m;
}

/* Dates & times are stored in UTC and shown/edited in the admin's local time. */
const pad = (n: number) => String(n).padStart(2, '0');
/** ISO timestamp (or old "YYYY-MM-DD") → value for <input type="datetime-local">. */
export function toLocalInput(value: unknown) {
  const d = new Date(String(value || ''));
  if (!value || isNaN(d.getTime())) return '';
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
export function formatDateTime(value: unknown) {
  const d = new Date(String(value || ''));
  if (!value || isNaN(d.getTime())) return '';
  return d.toLocaleString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
export const isScheduled = (r: Row) => r.published !== false && new Date(r.published_at).getTime() > Date.now();

/** Upload an image to Supabase Storage; resolves to its public URL (or null after showing an error). */
export async function uploadImage(ctx: Ctx, file: File, folder: string): Promise<string | null> {
  if (!file.type.startsWith('image/')) { ctx.toast('That file is not an image.', true); return null; }
  if (file.size > 5 * 1024 * 1024) { ctx.toast('Image is larger than 5MB.', true); return null; }
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = folder + '/' + Date.now() + '-' + (slugify(file.name.replace(/\.[^.]+$/, '')) || 'image') + '.' + ext;
  ctx.toast('Uploading image…');
  const res = await ctx.db.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
  if (res.error) { ctx.toast('Upload failed: ' + res.error.message, true); return null; }
  ctx.toast('Image uploaded.');
  return ctx.db.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

/* ----------------------------- Auto-save ----------------------------- */
export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'invalid' | 'error';
const AUTOSAVE_DELAY = 1000;

/** Debounced auto-save. `collect` reads the form (null = not valid yet),
    `save` writes it and resolves to an error message or null on success. */
export function useAutoSave<P>(collect: () => P | null, save: (p: P) => Promise<string | null>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [error, setError] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const latest = useRef<P | null>(null);
  const running = useRef<Promise<boolean> | null>(null);
  const mounted = useRef(true);
  const saveRef = useRef(save);
  saveRef.current = save;

  const run = useCallback(async (): Promise<boolean> => {
    // Wait for any in-flight save so writes never overlap (keeps inserts single).
    while (running.current) await running.current;
    const payload = latest.current;
    if (payload == null) return true;
    latest.current = null;
    if (mounted.current) setStatus('saving');
    const p = saveRef.current(payload).then((err) => {
      if (mounted.current) { setStatus(err ? 'error' : 'saved'); setError(err || ''); }
      return !err;
    });
    running.current = p;
    try { return await p; } finally { running.current = null; }
  }, []);

  const schedule = useCallback(() => {
    clearTimeout(timer.current);
    const payload = collect();
    if (payload == null) { latest.current = null; setStatus('invalid'); return; }
    latest.current = payload;
    setStatus('pending');
    timer.current = setTimeout(run, AUTOSAVE_DELAY);
  }, [collect, run]);

  /** Save right now (e.g. before leaving the form). */
  const flush = useCallback(() => { clearTimeout(timer.current); return run(); }, [run]);

  // Leaving the page or tab mid-edit still saves the last change.
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      clearTimeout(timer.current);
      if (latest.current != null) run();
    };
  }, [run]);

  return { status, error, schedule, flush };
}

export function SaveIndicator({ status, error, invalidText }: { status: SaveStatus; error: string; invalidText?: string }) {
  const text: Record<SaveStatus, string> = {
    idle: 'Changes save automatically.',
    pending: 'Unsaved changes…',
    saving: 'Saving…',
    saved: 'All changes saved.',
    invalid: invalidText || 'Fill in the required fields to save.',
    error: 'Not saved: ' + error,
  };
  return (
    <p className={'save-status ' + status} aria-live="polite">
      {status === 'saving' && <span className="spinner" aria-hidden="true" />}
      {text[status]}
    </p>
  );
}
