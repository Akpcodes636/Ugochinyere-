'use client';

/* eslint-disable @next/next/no-img-element */
/* Admin panel: Supabase Auth login + editing for every dynamic section. */
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { Toaster, toast as sonner } from 'sonner';
import { browserClient } from '@/lib/supabase';
import { src } from '@/lib/format';
import BlogEditor from './BlogEditor';
import {
  formatDateTime, friendlyError, isScheduled, SaveIndicator, slugify, toLocalInput, uploadImage, useAutoSave,
  type Ctx, type Row, type Toast,
} from './shared';
type Field = {
  name: string; label: string; type?: 'textarea' | 'markdown' | 'bool' | 'select' | 'image' | 'number' | 'date' | 'datetime' | 'url';
  required?: boolean; full?: boolean; help?: string; placeholder?: string; min?: number; max?: number;
  default?: unknown | (() => unknown); options?: [string, string][];
};
type Section = {
  id: string; label: string; table?: string; max?: number; sortable?: boolean;
  /** Position-based: the first `topN` rows (by the arrows) are shown on the homepage. */
  topN?: number; pagePath?: string;
  /** The page address is made from the title automatically (no slug field shown). */
  slugFromTitle?: boolean;
  orderBy?: { column: string; ascending: boolean }; note?: string;
  title?: (r: Row) => string; sub?: (r: Row) => string; thumb?: string; visibleKey?: string; fields?: Field[];
};

/* ------------------------------------------------------------------
   Section definitions — one entry per editable table.
   `max` = how many can be shown on the website at once (fixed).
------------------------------------------------------------------ */
const SECTIONS: Section[] = [
  {
    id: 'projects', table: 'projects', label: 'Selected Projects', topN: 6, sortable: true, pagePath: '/projects/', slugFromTitle: true,
    note: 'The first 6 projects are shown on the homepage. Use ↑ ↓ to move a project in or out of the top 6. Every project has its own page.',
    title: (r) => r.title, sub: (r) => r.url || r.tags || '', thumb: 'image',
    fields: [
      { name: 'title', label: 'Project name', required: true },
      { name: 'url', label: 'Live website link', type: 'url', help: 'e.g. https://example.com' },
      { name: 'tags', label: 'Services / tags', placeholder: 'Custom Website Development · SEO', help: 'Separate with · — shown on the card and the project page.' },
      { name: 'description', label: 'Short description (homepage card, Google results)', type: 'textarea', full: true },
      { name: 'image', label: 'Homepage screenshot', type: 'image', full: true },
      { name: 'alt', label: 'Image description (accessibility)', full: true },
      { name: 'body', label: 'Full project description (project page)', type: 'markdown', full: true,
        help: 'Markdown: ## About the client, ## What we built, - bullet, **bold**, [link](https://…), ![image](url)' },
    ],
  },
  {
    id: 'google_profiles', table: 'google_profiles', label: 'Google Profiles', max: 6, sortable: true,
    title: (r) => r.name, sub: (r) => r.category || '', thumb: 'image',
    fields: [
      { name: 'name', label: 'Business name', required: true },
      { name: 'category', label: 'Category · Location', placeholder: 'Catering · Ontario, Canada' },
      { name: 'rating', label: 'Rating', placeholder: '5.0' },
      { name: 'reviews', label: 'Number of reviews', type: 'number' },
      { name: 'image', label: 'Google search screenshot', type: 'image', full: true },
      { name: 'visible', label: 'Show on website', type: 'bool', default: true },
    ],
  },
  {
    id: 'testimonials', table: 'testimonials', label: 'Testimonials', max: 4, sortable: true,
    title: (r) => r.name, sub: (r) => r.quote,
    fields: [
      { name: 'name', label: 'Client name', required: true },
      { name: 'source', label: 'Source', placeholder: 'Google review · Toronto, Canada', default: 'Google review' },
      { name: 'quote', label: 'Quote', type: 'textarea', full: true, required: true },
      { name: 'stars', label: 'Stars (1–5)', type: 'number', min: 1, max: 5, default: 5 },
      { name: 'visible', label: 'Show on website', type: 'bool', default: true },
    ],
  },
  {
    id: 'blog_posts', table: 'blog_posts', label: 'Blog', orderBy: { column: 'published_at', ascending: false },
    note: 'The 3 newest published posts appear on the homepage. All posts appear on the Blog page. '
      + 'New posts start as drafts — press Publish to publish now or schedule a date & time.',
    title: (r) => r.title, sub: (r) => formatDateTime(r.published_at) + ' · /blog/' + r.slug,
    thumb: 'cover', visibleKey: 'published',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'slug', label: 'URL slug', required: true, help: 'Lowercase words and dashes. Filled from the title automatically.' },
      { name: 'published_at', label: 'Publish date & time', type: 'datetime', default: () => new Date().toISOString(),
        help: 'Your local time. Pick a future time to schedule the post.' },
      { name: 'author', label: 'Author', default: 'Ugochinyere' },
      { name: 'excerpt', label: 'Short summary (shown on the card and in Google results)', type: 'textarea', full: true },
      { name: 'cover', label: 'Cover image', type: 'image', full: true },
      { name: 'body', label: 'Article', type: 'markdown', full: true,
        help: 'Markdown: ## Heading, **bold**, *italic*, - bullet, [link text](https://…), ![image](url)' },
      { name: 'published', label: 'Published (untick to keep it as a draft)', type: 'bool', default: true },
    ],
  },
];

/* ------------------------------ helpers ------------------------------ */
const visibleKey = (s: Section) => s.visibleKey || 'visible';

function EyeToggle({ shown, onToggle }: { shown: boolean; onToggle: () => void }) {
  return (
    <button type="button" className="eye-btn" onClick={onToggle}
      aria-label={shown ? 'Hide password' : 'Show password'} aria-pressed={shown} title={shown ? 'Hide password' : 'Show password'}>
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
        {shown && <line x1="3" y1="3" x2="21" y2="21" />}
      </svg>
    </button>
  );
}

/* ============================== App ============================== */
export default function AdminApp() {
  const dbRef = useRef<SupabaseClient | null>(null);
  const recovering = useRef(false);
  const [configMsg, setConfigMsg] = useState('');
  const [view, setView] = useState<'none' | 'login' | 'password' | 'dashboard'>('none');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [sectionId, setSectionId] = useState<string | null>(null);
  const [loginMsg, setLoginMsg] = useState({ text: '', ok: false });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [loggingIn, setLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);
  // Supabase re-fires SIGNED_IN when the tab regains focus; remember who is
  // already checked so we don't re-run the admin check (and re-toast) each time.
  const checkedUser = useRef<string | null>(null);
  const freshLogin = useRef(false);

  const toast = useCallback<Toast>((msg, isError) => {
    if (isError) sonner.error(msg); else sonner.success(msg);
  }, []);

  /** Tell Next.js to rebuild the public pages so edits appear immediately. */
  const refreshSite = useCallback(() => {
    const db = dbRef.current;
    if (!db) return;
    db.auth.getSession().then(({ data }) => {
      const token = data.session?.access_token;
      if (token) fetch('/api/revalidate', { method: 'POST', headers: { Authorization: 'Bearer ' + token } }).catch(() => {});
    });
  }, []);

  const startSession = useCallback((session: Session | null) => {
    const db = dbRef.current!;
    if (!session) { checkedUser.current = null; setUserEmail(null); setView('login'); return; }
    if (checkedUser.current === session.user.id) return;
    checkedUser.current = session.user.id;
    db.from('admins').select('email').maybeSingle().then((res) => {
      setLoggingIn(false);
      if (res.error || !res.data) {
        // Show the real database error (e.g. missing table) so it can be fixed.
        const text = res.error ? 'Could not check admin access: ' + res.error.message : 'This account is not an admin.';
        setLoginMsg({ text, ok: false });
        sonner.error(text, { id: 'login-status' });
        checkedUser.current = null;
        db.auth.signOut();
        setView('login');
        return;
      }
      setUserEmail(session.user.email || '');
      if (freshLogin.current) sonner.success('Welcome back!', { id: 'login-status' });
      freshLogin.current = false;
      setView('dashboard');
      setSectionId((cur) => cur || SECTIONS[0].id);
    });
  }, []);

  /* -------------------------------- Auth -------------------------------- */
  useEffect(() => {
    // Invite / recovery links land here: let the user choose a password.
    if (/type=(invite|recovery)/.test(window.location.hash)) recovering.current = true;
    const db = browserClient();
    if (!db) {
      setConfigMsg('Supabase is not configured yet. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY to .env.local.');
      return;
    }
    dbRef.current = db;
    const { data: { subscription } } = db.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') { recovering.current = true; setView('password'); return; }
      if (event === 'SIGNED_OUT') { setSectionId(null); startSession(null); return; }
      // Defer Supabase calls out of the auth callback to avoid lock contention.
      if (event === 'SIGNED_IN' && !recovering.current) setTimeout(() => startSession(session), 0);
    });
    db.auth.getSession().then(({ data }) => {
      if (recovering.current && data.session) { setView('password'); return; }
      startSession(data.session);
    });
    return () => subscription.unsubscribe();
  }, [startSession]);

  function validateLogin(email: string, password: string) {
    const errors: { email?: string; password?: string } = {};
    if (!email) errors.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    if (!password) errors.password = 'Password is required.';
    else if (password.length < 6) errors.password = 'Password must be at least 6 characters.';
    return errors;
  }

  function onLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (loggingIn) return;
    setLoginMsg({ text: '', ok: false });
    const f = e.currentTarget.elements;
    const email = (f.namedItem('email') as HTMLInputElement).value.trim();
    const password = (f.namedItem('password') as HTMLInputElement).value;
    const errors = validateLogin(email, password);
    setLoginErrors(errors);
    if (errors.email || errors.password) return; // shown under the fields
    setLoggingIn(true);
    freshLogin.current = true;
    dbRef.current!.auth.signInWithPassword({ email, password }).then((res) => {
      if (res.error) {
        setLoggingIn(false);
        freshLogin.current = false;
        const text = /invalid login credentials/i.test(res.error.message) ? 'Incorrect email or password.' : res.error.message;
        setLoginMsg({ text, ok: false });
        sonner.error(text, { id: 'login-status' });
      }
      // On success the spinner stays until the admin check in startSession finishes.
    }).catch((err) => {
      setLoggingIn(false);
      sonner.error(friendlyError(err));
    });
  }

  function onForgot() {
    const email = emailRef.current?.value.trim();
    if (!email || validateLogin(email, 'xxxxxx').email) {
      setLoginErrors({ email: 'Enter a valid email above first.' });
      return;
    }
    dbRef.current!.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split('#')[0] }).then((res) => {
      setLoginMsg(res.error ? { text: res.error.message, ok: false } : { text: 'Check your email for a reset link.', ok: true });
      if (res.error) sonner.error(res.error.message); else sonner.success('Check your email for a reset link.');
    });
  }

  function onNewPassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
    const db = dbRef.current!;
    db.auth.updateUser({ password }).then((res) => {
      if (res.error) { setPasswordMsg(res.error.message); sonner.error(res.error.message); return; }
      recovering.current = false;
      window.history.replaceState(null, '', window.location.pathname);
      toast('Password saved.');
      checkedUser.current = null;
      db.auth.getSession().then((r) => startSession(r.data.session));
    });
  }

  const current = SECTIONS.find((s) => s.id === sectionId) || null;
  const ctx: Ctx | null = dbRef.current ? { db: dbRef.current, toast, refreshSite } : null;

  return (
    <>
      <header>
        <div className="wrap nav">
          <Link className="logo" href="/">THE DIGITAL <span>PM.</span></Link>
          <div className="admin-user" id="admin-user" hidden={!userEmail || view !== 'dashboard'}>
            <span id="admin-email">{userEmail}</span>{' '}
            <button className="button light" id="logout" type="button" onClick={() => dbRef.current?.auth.signOut()}>Log out</button>
          </div>
        </div>
      </header>

      <main className="wrap">
        {/* Login */}
        <section id="login-view" className="admin-card narrow" hidden={view !== 'login'}>
          <h1>Admin login</h1>
          <form id="login-form" onSubmit={onLogin} noValidate>
            <div className={'field' + (loginErrors.email ? ' invalid' : '')}>
              <label htmlFor="login-email">Email</label>
              <input id="login-email" name="email" type="email" autoComplete="username" ref={emailRef}
                aria-invalid={!!loginErrors.email} aria-describedby="login-email-err"
                onInput={() => loginErrors.email && setLoginErrors((er) => ({ ...er, email: undefined }))} />
              {loginErrors.email && <span className="field-error" id="login-email-err">{loginErrors.email}</span>}
            </div>
            <div className={'field' + (loginErrors.password ? ' invalid' : '')}>
              <label htmlFor="login-password">Password</label>
              <div className="password-wrap">
                <input id="login-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password"
                  aria-invalid={!!loginErrors.password} aria-describedby="login-password-err"
                  onInput={() => loginErrors.password && setLoginErrors((er) => ({ ...er, password: undefined }))} />
                <EyeToggle shown={showPassword} onToggle={() => setShowPassword((v) => !v)} />
              </div>
              {loginErrors.password && <span className="field-error" id="login-password-err">{loginErrors.password}</span>}
            </div>
            <button className="button" type="submit" disabled={loggingIn} aria-busy={loggingIn}>
              {loggingIn ? <><span className="spinner" aria-hidden="true" /> Logging in…</> : 'Log in'}
            </button>
            <button className="link-btn" id="forgot" type="button" onClick={onForgot}>Forgot password?</button>
            <p className={'admin-msg' + (loginMsg.ok ? ' ok' : '')} id="login-msg" aria-live="polite">{loginMsg.text}</p>
          </form>
        </section>

        {/* Set new password (after reset / invite link) */}
        <section id="password-view" className="admin-card narrow" hidden={view !== 'password'}>
          <h1>Set a new password</h1>
          <form id="password-form" onSubmit={onNewPassword}>
            <div className="field"><label htmlFor="new-password">New password</label>
              <div className="password-wrap">
                <input id="new-password" name="password" type={showNewPassword ? 'text' : 'password'} minLength={8} autoComplete="new-password" required />
                <EyeToggle shown={showNewPassword} onToggle={() => setShowNewPassword((v) => !v)} />
              </div>
            </div>
            <button className="button" type="submit">Save password</button>
            <p className="admin-msg" id="password-msg" aria-live="polite">{passwordMsg}</p>
          </form>
        </section>

        {/* Dashboard */}
        <section id="dashboard" hidden={view !== 'dashboard'}>
          <nav className="admin-tabs" id="tabs" aria-label="Content sections">
            {current && SECTIONS.map((s) => (
              <button key={s.id} type="button" role="tab" aria-selected={s.id === sectionId} onClick={() => setSectionId(s.id)}>{s.label}</button>
            ))}
          </nav>
          <div id="panel">
            {view === 'dashboard' && current && ctx && (
              <SectionPanel key={current.id} section={current} ctx={ctx} />
            )}
          </div>
        </section>

        <p className="admin-msg" id="config-msg">{configMsg}</p>
      </main>

      <Toaster position="top-center" richColors closeButton />
    </>
  );
}

/* ============================ List view ============================ */
function SectionPanel({ section: s, ctx }: { section: Section; ctx: Ctx }) {
  const { db, toast, refreshSite } = ctx;
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState('');
  // undefined = list view, null = new item, Row = editing
  const [editing, setEditing] = useState<Row | null | undefined>(undefined);
  const vk = visibleKey(s);

  const loadRows = useCallback(() => {
    setEditing(undefined);
    let q = db.from(s.table!).select('*');
    if (s.orderBy) q = q.order(s.orderBy.column, { ascending: s.orderBy.ascending });
    else q = q.order('sort_order').order('created_at');
    q.then((res) => {
      if (res.error) { setError(friendlyError(res.error)); return; }
      setError('');
      setRows((res.data as Row[]) || []);
    });
  }, [db, s]);

  useEffect(() => { loadRows(); }, [loadRows]);

  if (error) return <div className="empty">{error}</div>;
  if (!rows) return <div className="empty">Loading…</div>;

  if (editing !== undefined) {
    if (s.id === 'blog_posts') {
      return (
        <BlogEditor key={editing?.id || 'new'} row={editing} ctx={ctx}
          onSaved={() => { refreshSite(); loadRows(); }} onCancel={loadRows} />
      );
    }
    return (
      <Editor key={editing?.id || 'new'} section={s} row={editing} rows={rows} ctx={ctx}
        onSaved={() => { refreshSite(); loadRows(); }} onCancel={loadRows} />
    );
  }

  const shown = s.topN ? Math.min(rows.length, s.topN) : rows.filter((r) => r[vk] !== false).length;
  const full = !!s.max && shown >= s.max;
  const count = s.topN
    ? `${shown} of ${s.topN} on homepage · ${rows.length} total`
    : s.max ? `${shown} of ${s.max} shown on website` : `${rows.length} total`;
  const hasVis = s.fields!.some((f) => f.name === vk);

  function removeRow(r: Row) {
    if (!confirm('Delete “' + s.title!(r) + '”? This cannot be undone.')) return;
    db.from(s.table!).delete().eq('id', r.id).then((res) => {
      if (res.error) return toast(friendlyError(res.error), true);
      toast('Deleted.');
      refreshSite();
      loadRows();
    });
  }

  function move(i: number, dir: -1 | 1) {
    const list = rows!;
    const a = list[i], b = list[i + dir];
    if (!a || !b) return;
    // Renumber the whole list so ties never block reordering.
    const reordered = list.slice();
    reordered[i] = b; reordered[i + dir] = a;
    const updates = reordered
      .map((r, idx) => (r.sort_order === idx ? null : db.from(s.table!).update({ sort_order: idx }).eq('id', r.id)))
      .filter(Boolean);
    Promise.all(updates).then((results) => {
      const err = results.find((x) => x && x.error);
      if (err) toast(friendlyError(err.error), true);
      refreshSite();
      loadRows();
    });
  }

  const sameGroup = (_r: Row, j: number) => !!rows[j];

  return (
    <>
      <div className="panel-head">
        <div>
          <h2>{s.label}</h2>
          <div className="count">{count}{full ? ' — limit reached. New items are saved hidden.' : ''}</div>
          {s.note && <div className="count">{s.note}</div>}
        </div>
        <button className="button" type="button" onClick={() => setEditing(null)}>{s.id === 'blog_posts' ? '+ Write a story' : '+ Add new'}</button>
      </div>
      {!rows.length ? (
        <div className="empty">Nothing here yet. Click “Add new”.</div>
      ) : (
        <div className="rows">
          {rows.map((r, i) => (
            <div key={r.id} className="row-wrap">
            {s.topN && i === s.topN && (
              <div className="top-divider" role="separator">Not on homepage — move a project above this line to show it</div>
            )}
            <div className={'row' + (s.topN && i >= s.topN ? ' muted' : '')}>
              {s.thumb && (r[s.thumb] ? <img src={src(r[s.thumb])} alt="" /> : <img alt="" />)}
              <div className="row-main">
                <div className="row-title">
                  {s.title!(r)}
                  {s.topN && (i < s.topN
                    ? <span className="badge on">On homepage #{i + 1}</span>
                    : <span className="badge">Not on homepage</span>)}
                  {hasVis && (r[vk] !== false
                    ? (vk === 'published' && isScheduled(r)
                      ? <span className="badge scheduled" title={'Goes live ' + formatDateTime(r.published_at)}>Scheduled</span>
                      : <span className="badge on">{vk === 'published' ? 'Published' : 'Shown'}</span>)
                    : <span className="badge">{vk === 'published' ? 'Draft' : 'Hidden'}</span>)}
                </div>
                <div className="row-sub">{s.sub!(r)}</div>
              </div>
              <div className="actions">
                {s.sortable && (
                  <>
                    <button className="icon-btn" title="Move up" disabled={!sameGroup(r, i - 1)} onClick={() => move(i, -1)}>↑</button>
                    <button className="icon-btn" title="Move down" disabled={!sameGroup(r, i + 1)} onClick={() => move(i, 1)}>↓</button>
                  </>
                )}
                {s.pagePath && r.slug && (
                  <a className="icon-btn" href={s.pagePath + r.slug} target="_blank" rel="noopener" title="Open the project page">View</a>
                )}
                <button className="icon-btn" onClick={() => setEditing(r)}>Edit</button>
                <button className="icon-btn danger" onClick={() => removeRow(r)}>Delete</button>
              </div>
            </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

/* ============================== Editor ============================== */
function ImageField({ f, value, table, ctx, onChanged }: { f: Field; value: string; table: string; ctx: Ctx; onChanged?: (name: string, url: string) => void }) {
  const [url, setUrl] = useState(value);
  const id = 'f-' + f.name;
  const cls = 'field' + (f.full ? ' full' : '');

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const publicUrl = await uploadImage(ctx, file, table);
    if (!publicUrl) { input.value = ''; return; }
    setUrl(publicUrl);
    onChanged?.(f.name, publicUrl);
  }

  return (
    <div className={cls}>
      <label htmlFor={id + '-file'}>{f.label}</label>
      <img className="img-preview" id={id + '-preview'} src={url ? src(url) : undefined} alt="" hidden={!url} />
      <input type="file" id={id + '-file'} accept="image/*" onChange={onFile} />
      <input type="hidden" id={id} name={f.name} value={url} />
      <span className="help">JPG, PNG or WebP, under 5MB.</span>
    </div>
  );
}

function FieldInput({ f, value, table, ctx, onImage }: { f: Field; value: unknown; table: string; ctx: Ctx; onImage?: (name: string, url: string) => void }) {
  const id = 'f-' + f.name;
  const v = value == null ? '' : String(value);
  const help = f.help ? <span className="help">{f.help}</span> : null;
  const cls = 'field' + (f.full || f.type === 'bool' ? ' full' : '');
  switch (f.type) {
    case 'textarea':
    case 'markdown':
      return (
        <div className={cls}>
          <label htmlFor={id}>{f.label}</label>
          <textarea id={id} name={f.name} className={f.type === 'markdown' ? 'tall' : undefined} required={f.required} defaultValue={v} />
          {help}
        </div>
      );
    case 'bool':
      return (
        <div className="field check full">
          <input type="checkbox" id={id} name={f.name} defaultChecked={!!value} />
          <label htmlFor={id}>{f.label}</label>
        </div>
      );
    case 'select':
      return (
        <div className={cls}>
          <label htmlFor={id}>{f.label}</label>
          <select id={id} name={f.name} required={f.required} defaultValue={v}>
            {f.options!.map(([val, label]) => <option key={val} value={val}>{label}</option>)}
          </select>
          {help}
        </div>
      );
    case 'image':
      return <ImageField f={f} value={v} table={table} ctx={ctx} onChanged={onImage} />;
    case 'datetime':
      return (
        <div className={cls}>
          <label htmlFor={id}>{f.label}</label>
          <input id={id} name={f.name} type="datetime-local" defaultValue={toLocalInput(value)} required />
          {help}
        </div>
      );
    default: {
      const type = f.type === 'number' ? 'number' : f.type === 'date' ? 'date' : f.type === 'url' ? 'url' : 'text';
      return (
        <div className={cls}>
          <label htmlFor={id}>{f.label}</label>
          <input id={id} name={f.name} type={type} defaultValue={v} placeholder={f.placeholder} min={f.min} max={f.max} required={f.required} />
          {help}
        </div>
      );
    }
  }
}

function Editor({ section: s, row, rows, ctx, onSaved, onCancel }: {
  section: Section; row: Row | null; rows: Row[]; ctx: Ctx; onSaved: () => void; onCancel: () => void;
}) {
  const vk = visibleKey(s);
  const formRef = useRef<HTMLFormElement>(null);
  // Becomes set after the first auto-save of a new item, so later saves update it.
  const rowId = useRef<string | null>(row?.id || null);
  const savedOnce = useRef(false);
  const images = useRef<Record<string, string>>({});
  const [leaving, setLeaving] = useState(false);

  const [data] = useState(() => {
    const d: Record<string, unknown> = {};
    s.fields!.forEach((f) => {
      d[f.name] = row ? row[f.name] : typeof f.default === 'function' ? (f.default as () => unknown)() : f.default;
    });
    // Respect the fixed limit: new items are hidden once the limit is reached.
    if (!row && s.max && rows.filter((r) => r[vk] !== false).length >= s.max) d[vk] = false;
    return d;
  });
  // Blog: auto-fill slug from title until the slug is edited by hand.
  const autoSlug = useRef(!data.slug);

  const collect = useCallback(() => {
    const form = formRef.current;
    if (!form || !form.checkValidity()) return null;
    const payload: Record<string, unknown> = {};
    s.fields!.forEach((f) => {
      const el = form.elements.namedItem(f.name) as HTMLInputElement;
      if (f.type === 'bool') payload[f.name] = el.checked;
      else if (f.type === 'number') payload[f.name] = el.value === '' ? null : Number(el.value);
      else if (f.type === 'datetime') payload[f.name] = new Date(el.value).toISOString();
      else {
        const val = f.type === 'image' && f.name in images.current ? images.current[f.name] : el.value;
        payload[f.name] = val.trim() === '' ? null : val.trim();
      }
    });
    if (s.slugFromTitle) payload.slug = slugify(String(payload.title || '')) || 'project';
    else if (payload.slug != null) payload.slug = slugify(String(payload.slug));
    if (payload.url && !/^https?:\/\//i.test(String(payload.url))) payload.url = 'https://' + payload.url;
    return payload;
  }, [s]);

  const save = useCallback(async (payload: Record<string, unknown>) => {
    if (s.slugFromTitle) {
      // Keep page addresses unique: "Acme" → "acme", then "acme-2", "acme-3" …
      const base = String(payload.slug);
      const taken = new Set(rows.filter((r) => r.id !== rowId.current).map((r) => r.slug));
      let n = 1;
      while (taken.has(n === 1 ? base : `${base}-${n}`)) n++;
      payload.slug = n === 1 ? base : `${base}-${n}`;
    }
    if (rowId.current) {
      let res = await ctx.db.from(s.table!).update(payload).eq('id', rowId.current);
      // Someone else's project already has this address (list was out of date): add a number.
      for (let n = 2; s.slugFromTitle && res.error && /duplicate key.*slug/i.test(res.error.message) && n < 20; n++) {
        payload.slug = `${String(payload.slug).replace(/-\d+$/, '')}-${n}`;
        res = await ctx.db.from(s.table!).update(payload).eq('id', rowId.current);
      }
      if (res.error) return friendlyError(res.error);
    } else {
      if (s.sortable) {
        payload.sort_order = rows.reduce((m, r) => Math.max(m, r.sort_order || 0), -1) + 1;
      }
      let res = await ctx.db.from(s.table!).insert(payload).select('id').single();
      for (let n = 2; s.slugFromTitle && res.error && /duplicate key.*slug/i.test(res.error.message) && n < 20; n++) {
        payload.slug = `${String(payload.slug).replace(/-\d+$/, '')}-${n}`;
        res = await ctx.db.from(s.table!).insert(payload).select('id').single();
      }
      if (res.error) return friendlyError(res.error);
      rowId.current = (res.data as { id: string }).id;
      if (payload[vk] === false && s.max) ctx.toast(`Saved as hidden — the website already shows ${s.max}.`);
      if (s.topN && rows.length >= s.topN) ctx.toast(`Added at the bottom — use ↑ to move it into the top ${s.topN} to show it on the homepage.`);
    }
    savedOnce.current = true;
    ctx.refreshSite();
    return null;
  }, [ctx, s, rows, vk]);

  const { status, error, schedule, flush } = useAutoSave(collect, save);

  function onInput(e: FormEvent<HTMLFormElement>) {
    const t = e.target as HTMLInputElement;
    if (t.name === 'slug') autoSlug.current = false;
    if (t.name === 'title' && autoSlug.current) {
      const slug = e.currentTarget.elements.namedItem('slug') as HTMLInputElement | null;
      if (slug) slug.value = slugify(t.value);
    }
    if (t.type !== 'file') schedule();
  }

  function onImage(name: string, url: string) {
    images.current[name] = url;
    schedule();
  }

  /** "Done": save anything pending, then go back to the list. */
  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) { form.reportValidity(); return; }
    setLeaving(true);
    schedule();
    const ok = await flush();
    setLeaving(false);
    if (!ok) return;
    const when = (form.elements.namedItem('published_at') as HTMLInputElement | null)?.value;
    const live = (form.elements.namedItem('published') as HTMLInputElement | null)?.checked;
    ctx.toast(when && live && new Date(when).getTime() > Date.now()
      ? 'Saved. Scheduled to go live ' + formatDateTime(new Date(when).toISOString()) + '.'
      : 'Saved.');
    onSaved();
  }

  async function onBack() {
    setLeaving(true);
    await flush();
    if (savedOnce.current) onSaved(); else onCancel();
  }

  return (
    <div className="admin-card editor">
      <h2>{!row ? 'Add to ' + s.label : 'Edit — ' + s.title!(row)}</h2>
      <form id="editor-form" ref={formRef} noValidate onSubmit={onSubmit} onChange={onInput}>
        <div className="fields">
          {s.fields!.map((f) => <FieldInput key={f.name} f={f} value={data[f.name]} table={s.table!} ctx={ctx} onImage={onImage} />)}
        </div>
        <div className="editor-actions">
          <button className="button" type="submit" disabled={leaving}>Done</button>
          <button className="button light" type="button" id="cancel" disabled={leaving} onClick={onBack}>Back to list</button>
        </div>
        <SaveIndicator status={status} error={error} />
      </form>
    </div>
  );
}
