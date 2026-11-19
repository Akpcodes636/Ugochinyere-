'use client';

/* eslint-disable @next/next/no-img-element */
/* Medium-style blog writer: big title, subtitle, and a clean page where you
   just type. Select text for the formatting toolbar; on an empty line, the
   + button adds an image or a divider. Everything saves automatically.
   The article is stored as Markdown (same as before), so the public pages
   and older posts keep working unchanged. */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import TurndownService from 'turndown';
import { renderMarkdown } from '@/lib/markdown';
import { readingTime, src, SITE_URL } from '@/lib/format';
import {
  formatDateTime, friendlyError, slugify, toLocalInput, uploadImage, useAutoSave, SaveIndicator,
  type Ctx, type Row,
} from './shared';

type Meta = {
  title: string; excerpt: string; cover: string; slug: string; author: string;
  published: boolean; published_at: string;
};

const turndown = new TurndownService({ headingStyle: 'atx', bulletListMarker: '-', hr: '---', codeBlockStyle: 'fenced', emDelimiter: '*' });
const toMarkdown = (html: string) => turndown.turndown(html).trim();
const EMPTY = '<p><br></p>';

/** Clean HTML for the editor: pasted or stored content goes Markdown → safe HTML. */
const normalize = (html: string) => renderMarkdown(toMarkdown(html));

export default function BlogEditor({ row, ctx, onSaved, onCancel }: {
  row: Row | null; ctx: Ctx; onSaved: () => void; onCancel: () => void;
}) {
  const rowId = useRef<string | null>(row?.id || null);
  const savedOnce = useRef(false);
  const bodyRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLTextAreaElement>(null);
  const subRef = useRef<HTMLTextAreaElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);
  const insertAt = useRef<HTMLElement | null>(null);

  const [meta, setMeta] = useState<Meta>(() => ({
    title: row?.title || '',
    excerpt: row?.excerpt || '',
    cover: row?.cover || '',
    slug: row?.slug || '',
    author: row?.author ?? 'Ugochinyere',
    // New stories start as drafts — nothing goes live until you press Publish.
    published: row ? row.published !== false : false,
    published_at: row?.published_at || new Date().toISOString(),
  }));
  const metaRef = useRef(meta);
  // The address follows the title until the story is published or the slug is edited.
  const autoSlug = useRef(!row || (!row.published && !row.slug));
  const [words, setWords] = useState(0);
  const [panel, setPanel] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [bubble, setBubble] = useState<{ top: number; left: number } | null>(null);
  const [plus, setPlus] = useState<{ top: number } | null>(null);
  const [plusOpen, setPlusOpen] = useState(false);
  const [, force] = useState(0);

  /* ----------------------------- saving ----------------------------- */
  const collect = useCallback(() => {
    const m = metaRef.current;
    if (!m.title.trim()) return null;
    return {
      title: m.title.trim(),
      slug: slugify(m.slug || m.title) || 'post',
      excerpt: m.excerpt.trim() || null,
      cover: m.cover || null,
      author: m.author.trim() || null,
      published: m.published,
      published_at: m.published_at,
      body: bodyRef.current ? toMarkdown(bodyRef.current.innerHTML) || null : null,
    };
  }, []);

  const save = useCallback(async (payload: NonNullable<ReturnType<typeof collect>>) => {
    const base = payload.slug.replace(/-\d+$/, '');
    for (let n = 1; n < 20; n++) {
      const res = rowId.current
        ? await ctx.db.from('blog_posts').update(payload).eq('id', rowId.current)
        : await ctx.db.from('blog_posts').insert(payload).select('id').single();
      if (!res.error) {
        if (!rowId.current) rowId.current = (res.data as { id: string }).id;
        if (payload.slug !== metaRef.current.slug) { metaRef.current = { ...metaRef.current, slug: payload.slug }; setMeta(metaRef.current); }
        savedOnce.current = true;
        ctx.refreshSite();
        return null;
      }
      // Another post already uses this address: try "my-post-2", "my-post-3" …
      if (!/duplicate key.*slug/i.test(res.error.message)) return friendlyError(res.error);
      payload.slug = `${base}-${n + 1}`;
    }
    return 'Another post already uses that URL.';
  }, [ctx]);

  const { status, error, schedule, flush } = useAutoSave(collect, save);

  const patch = useCallback((p: Partial<Meta>) => {
    const next = { ...metaRef.current, ...p };
    if ('title' in p && autoSlug.current) next.slug = slugify(next.title);
    metaRef.current = next;
    setMeta(next);
    schedule();
  }, [schedule]);

  /* ------------------------------ setup ------------------------------ */
  useEffect(() => {
    const el = bodyRef.current!;
    el.innerHTML = renderMarkdown(row?.body) || EMPTY;
    document.execCommand('defaultParagraphSeparator', false, 'p');
    countWords();
    if (!row) titleRef.current?.focus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Grow the title / subtitle boxes with their text.
  useLayoutEffect(() => {
    for (const t of [titleRef.current, subRef.current]) {
      if (t) { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }
    }
  }, [meta.title, meta.excerpt]);

  function countWords() {
    const text = bodyRef.current?.innerText || '';
    setWords(text.trim() ? text.trim().split(/\s+/).length : 0);
  }

  /** Put the typing cursor at the start of `node`. */
  function caretTo(node: Node) {
    const r = document.createRange(); r.setStart(node, 0); r.collapse(true);
    const sel = window.getSelection()!; sel.removeAllRanges(); sel.addRange(r);
  }

  function onBodyInput() {
    const el = bodyRef.current!;
    // Everything deleted: start again with one empty paragraph (keeps the placeholder and + button working).
    if (!el.textContent?.trim() && !el.querySelector('img,hr,li') && el.innerHTML !== EMPTY) {
      el.innerHTML = EMPTY;
      if (document.activeElement === el) caretTo(el.firstChild!);
    }
    countWords();
    updateTools();
    schedule();
  }

  /* --------------------- toolbar & + button position -------------------- */
  const currentBlock = (): HTMLElement | null => {
    const sel = window.getSelection();
    const el = bodyRef.current;
    if (!sel || !sel.rangeCount || !el) return null;
    let n: Node | null = sel.anchorNode;
    if (!n || !el.contains(n)) return null;
    while (n && n.parentNode !== el) n = n.parentNode;
    return n as HTMLElement | null;
  };

  const updateTools = useCallback(() => {
    const sel = window.getSelection();
    const el = bodyRef.current;
    if (!sel || !sel.rangeCount || !el || !el.contains(sel.anchorNode)) { setBubble(null); setPlus(null); setPlusOpen(false); return; }
    const host = el.parentElement!.getBoundingClientRect();
    if (!sel.isCollapsed) {
      const r = sel.getRangeAt(0).getBoundingClientRect();
      setBubble({ top: r.top - host.top - 48, left: Math.max(0, r.left - host.left + r.width / 2) });
      setPlus(null); setPlusOpen(false);
    } else {
      setBubble(null);
      const block = currentBlock();
      if (block && block.tagName === 'P' && !block.textContent?.trim() && !block.querySelector('img')) {
        setPlus({ top: block.getBoundingClientRect().top - host.top });
        insertAt.current = block;
      } else { setPlus(null); setPlusOpen(false); }
    }
    force((x) => x + 1); // refresh active states of toolbar buttons
  }, []);

  useEffect(() => {
    document.addEventListener('selectionchange', updateTools);
    return () => document.removeEventListener('selectionchange', updateTools);
  }, [updateTools]);

  /* ---------------------------- formatting ---------------------------- */
  const blockTag = () => currentBlock()?.closest?.('h2,h3,blockquote')?.tagName || currentBlock()?.tagName || '';
  function toggleBlock(tag: 'H2' | 'H3' | 'BLOCKQUOTE') {
    document.execCommand('formatBlock', false, blockTag() === tag ? 'P' : tag);
    onBodyInput();
  }
  function cmd(name: string) { document.execCommand(name); onBodyInput(); }
  function link() {
    const sel = window.getSelection();
    const a = sel?.anchorNode?.parentElement?.closest('a');
    if (a) { document.execCommand('unlink'); onBodyInput(); return; }
    const range = sel && sel.rangeCount ? sel.getRangeAt(0) : null;
    let url = window.prompt('Paste or type a link', 'https://');
    if (!url || url === 'https://') return;
    if (!/^(https?:|mailto:|\/|#)/i.test(url)) url = 'https://' + url;
    bodyRef.current!.focus();
    if (range) { sel!.removeAllRanges(); sel!.addRange(range); }
    document.execCommand('createLink', false, url);
    onBodyInput();
  }
  const active = (name: string) => { try { return document.queryCommandState(name); } catch { return false; } };

  /** Markdown-style shortcuts at the start of a line: "## ", "### ", "> ", "- ", "1. ", "---". */
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' && blockTag() === 'P' && currentBlock()?.textContent === '---') {
      e.preventDefault();
      insertAt.current = currentBlock();
      addDivider();
      return;
    }
    if (e.key !== ' ') return;
    const block = currentBlock();
    if (!block || block.tagName !== 'P') return;
    const map: Record<string, () => void> = {
      '#': () => document.execCommand('formatBlock', false, 'H2'),
      '##': () => document.execCommand('formatBlock', false, 'H2'),
      '###': () => document.execCommand('formatBlock', false, 'H3'),
      '>': () => document.execCommand('formatBlock', false, 'BLOCKQUOTE'),
      '-': () => document.execCommand('insertUnorderedList'),
      '*': () => document.execCommand('insertUnorderedList'),
      '1.': () => document.execCommand('insertOrderedList'),
    };
    const action = map[block.textContent || ''];
    if (!action) return;
    e.preventDefault();
    block.innerHTML = '<br>';
    caretTo(block);
    action();
    onBodyInput();
  }

  /* ------------------------------ images ------------------------------ */
  async function insertImage(file: File, at?: HTMLElement | null) {
    const url = await uploadImage(ctx, file, 'blog_posts');
    if (!url) return;
    const alt = window.prompt('Describe the image in a few words (helps Google and screen readers):', '') || '';
    const p = document.createElement('p');
    const img = document.createElement('img');
    img.src = url; img.alt = alt.trim();
    p.appendChild(img);
    const after = document.createElement('p'); after.innerHTML = '<br>';
    const el = bodyRef.current!;
    if (at && el.contains(at)) { at.replaceWith(p); } else el.appendChild(p);
    p.after(after);
    caretTo(after);
    onBodyInput();
  }

  function addDivider() {
    const at = insertAt.current;
    const hr = document.createElement('hr');
    const after = document.createElement('p'); after.innerHTML = '<br>';
    if (!at || !bodyRef.current!.contains(at)) return;
    at.replaceWith(hr); hr.after(after);
    caretTo(after);
    setPlusOpen(false);
    onBodyInput();
  }

  function onPaste(e: React.ClipboardEvent<HTMLDivElement>) {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith('image/'));
    if (file) { e.preventDefault(); insertImage(file, currentBlock()); return; }
    const html = e.clipboardData.getData('text/html');
    e.preventDefault();
    // Keep headings, bold, links and lists from pasted text, but drop fonts, colours and junk.
    if (html) document.execCommand('insertHTML', false, normalize(html));
    else document.execCommand('insertText', false, e.clipboardData.getData('text/plain'));
    onBodyInput();
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    e.preventDefault();
    insertImage(file, null);
  }

  async function onCover(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    e.currentTarget.value = '';
    if (!file) return;
    const url = await uploadImage(ctx, file, 'blog_posts');
    if (url) patch({ cover: url });
  }

  /* ----------------------------- publishing ---------------------------- */
  const live = meta.published && new Date(meta.published_at).getTime() <= Date.now();
  const scheduled = meta.published && !live;
  const [when, setWhen] = useState<'now' | 'later'>(scheduled ? 'later' : 'now');
  const [laterValue, setLaterValue] = useState(() =>
    toLocalInput(scheduled ? meta.published_at : new Date(Date.now() + 24 * 3600e3).setMinutes(0, 0, 0)));

  async function publish(next: Partial<Meta>, message: string) {
    if (!metaRef.current.title.trim()) { ctx.toast('Add a title first.', true); titleRef.current?.focus(); return; }
    autoSlug.current = false;
    patch(next);
    const ok = await flush();
    if (!ok) return;
    setPanel(false);
    ctx.toast(message);
  }

  function onPublish() {
    if (when === 'now') {
      // Publishing a draft uses today's date; an already-live post keeps its date.
      publish({ published: true, published_at: live ? meta.published_at : new Date().toISOString() }, 'Published — your story is live.');
      return;
    }
    const d = new Date(laterValue);
    if (!laterValue || isNaN(d.getTime())) { ctx.toast('Pick a date and time.', true); return; }
    if (d.getTime() <= Date.now()) { ctx.toast('Pick a time in the future to schedule.', true); return; }
    publish({ published: true, published_at: d.toISOString() }, 'Scheduled — goes live ' + formatDateTime(d.toISOString()) + '.');
  }

  async function onBack() {
    setLeaving(true);
    await flush();
    if (savedOnce.current) onSaved(); else onCancel();
  }

  const state = live ? 'Published' : scheduled ? 'Scheduled · ' + formatDateTime(meta.published_at) : 'Draft';
  const minutes = readingTime(words);
  const url = `${SITE_URL.replace(/^https?:\/\//, '')}/blog/${slugify(meta.slug || meta.title) || '…'}`;

  return (
    <div className="story">
      <div className="story-bar">
        <button type="button" className="link-btn" onClick={onBack} disabled={leaving}>← All posts</button>
        <span className={'badge' + (live ? ' on' : scheduled ? ' scheduled' : '')}>{state}</span>
        <SaveIndicator status={status} error={error} invalidText="Add a title to start saving." />
        <span className="story-count">{words} words · {minutes} min read</span>
        {live && rowId.current && (
          <a className="button light" href={'/blog/' + meta.slug} target="_blank" rel="noopener">View</a>
        )}
        <button type="button" className="button" onClick={() => setPanel(true)}>
          {live ? 'Settings' : scheduled ? 'Scheduled' : 'Publish'}
        </button>
      </div>

      <div className="story-page">
        {meta.cover ? (
          <div className="story-cover">
            <img src={src(meta.cover)} alt="" />
            <div className="story-cover-actions">
              <button type="button" className="button light" onClick={() => coverRef.current?.click()}>Change cover</button>
              <button type="button" className="button light" onClick={() => patch({ cover: '' })}>Remove</button>
            </div>
          </div>
        ) : (
          <button type="button" className="story-add-cover" onClick={() => coverRef.current?.click()}>+ Add a cover image</button>
        )}
        <input ref={coverRef} type="file" accept="image/*" hidden onChange={onCover} />

        <textarea ref={titleRef} className="story-title" rows={1} placeholder="Title" value={meta.title}
          onChange={(e) => patch({ title: e.target.value.replace(/\n/g, ' ') })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); subRef.current?.focus(); } }} />
        <textarea ref={subRef} className="story-subtitle" rows={1} placeholder="Short summary — shown on the blog card and in Google"
          value={meta.excerpt} onChange={(e) => patch({ excerpt: e.target.value.replace(/\n/g, ' ') })}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); bodyRef.current?.focus(); } }} />

        <div className="story-body-wrap">
          {bubble && (
            <div className="story-bubble" style={{ top: bubble.top, left: bubble.left }} onMouseDown={(e) => e.preventDefault()}>
              <button type="button" className={active('bold') ? 'on' : ''} onClick={() => cmd('bold')} title="Bold (Ctrl/⌘+B)"><b>B</b></button>
              <button type="button" className={active('italic') ? 'on' : ''} onClick={() => cmd('italic')} title="Italic (Ctrl/⌘+I)"><i>i</i></button>
              <button type="button" onClick={link} title="Link">🔗</button>
              <span className="sep" />
              <button type="button" className={blockTag() === 'H2' ? 'on' : ''} onClick={() => toggleBlock('H2')} title="Big heading">T</button>
              <button type="button" className={blockTag() === 'H3' ? 'on small' : 'small'} onClick={() => toggleBlock('H3')} title="Small heading">T</button>
              <button type="button" className={blockTag() === 'BLOCKQUOTE' ? 'on' : ''} onClick={() => toggleBlock('BLOCKQUOTE')} title="Quote">❝</button>
              <button type="button" onClick={() => cmd('insertUnorderedList')} title="Bullet list">•</button>
            </div>
          )}
          {plus && (
            <div className="story-plus" style={{ top: plus.top }} onMouseDown={(e) => e.preventDefault()}>
              <button type="button" className={'plus-btn' + (plusOpen ? ' open' : '')} onClick={() => setPlusOpen((o) => !o)} aria-label="Add image or divider">+</button>
              {plusOpen && (
                <>
                  <button type="button" onClick={() => { setPlusOpen(false); fileRef.current?.click(); }}>Image</button>
                  <button type="button" onClick={addDivider}>Divider</button>
                </>
              )}
            </div>
          )}
          <input ref={fileRef} type="file" accept="image/*" hidden
            onChange={(e) => { const f = e.currentTarget.files?.[0]; e.currentTarget.value = ''; if (f) insertImage(f, insertAt.current); }} />
          <div ref={bodyRef} className="story-body body" contentEditable suppressContentEditableWarning
            data-placeholder="Tell your story…" onInput={onBodyInput} onKeyDown={onKeyDown}
            onPaste={onPaste} onDrop={onDrop} onBlur={() => setTimeout(updateTools, 150)} />
        </div>
        <p className="story-hint">
          Select text to format it. On an empty line, click <b>+</b> to add an image. Shortcuts: <code>##</code> heading,
          {' '}<code>&gt;</code> quote, <code>-</code> list, then a space.
        </p>
      </div>

      {panel && (
        <div className="story-panel-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) setPanel(false); }}>
          <div className="story-panel" role="dialog" aria-label="Publish settings">
            <button type="button" className="story-close" onClick={() => setPanel(false)} aria-label="Close">×</button>

            <h3>Google preview</h3>
            <div className="serp">
              <div className="serp-url">{url}</div>
              <div className="serp-title">{meta.title || 'Your title'}</div>
              <div className="serp-desc">{meta.excerpt || 'Add a short summary under the title — Google shows it here.'}</div>
            </div>
            <p className={'help' + (meta.title.length > 60 ? ' warn' : '')}>Title: {meta.title.length}/60 characters</p>
            <p className={'help' + (meta.excerpt.length > 160 || !meta.excerpt ? ' warn' : '')}>
              Summary: {meta.excerpt.length}/160 characters{!meta.excerpt && ' — add one for better Google results'}
            </p>

            <div className="field">
              <label htmlFor="story-slug">Web address</label>
              <input id="story-slug" value={meta.slug} placeholder={slugify(meta.title)}
                onChange={(e) => { autoSlug.current = false; patch({ slug: slugify(e.target.value) }); }} />
              <span className="help">/blog/{meta.slug || slugify(meta.title)} — avoid changing it after publishing.</span>
            </div>
            <div className="field">
              <label htmlFor="story-author">Author</label>
              <input id="story-author" value={meta.author} onChange={(e) => patch({ author: e.target.value })} />
            </div>

            {live ? (
              <>
                <p className="story-live">Live since {formatDateTime(meta.published_at)}.</p>
                <div className="editor-actions">
                  <button type="button" className="button" onClick={() => setPanel(false)}>Done</button>
                  <button type="button" className="button light" onClick={() => publish({ published: false }, 'Unpublished — saved as a draft.')}>Unpublish</button>
                </div>
              </>
            ) : (
              <>
                <h3>When</h3>
                <label className="story-radio">
                  <input type="radio" name="when" checked={when === 'now'} onChange={() => setWhen('now')} /> Publish now
                </label>
                <label className="story-radio">
                  <input type="radio" name="when" checked={when === 'later'} onChange={() => setWhen('later')} /> Schedule for later
                </label>
                {when === 'later' && (
                  <div className="field">
                    <input type="datetime-local" value={laterValue} min={toLocalInput(new Date().toISOString())}
                      onChange={(e) => setLaterValue(e.target.value)} />
                    <span className="help">Your local time. It goes live automatically.</span>
                  </div>
                )}
                <div className="editor-actions">
                  <button type="button" className="button" onClick={onPublish}>
                    {when === 'now' ? 'Publish now' : scheduled ? 'Update schedule' : 'Schedule'}
                  </button>
                  {scheduled && (
                    <button type="button" className="button light" onClick={() => publish({ published: false }, 'Schedule cancelled — saved as a draft.')}>
                      Cancel schedule
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
