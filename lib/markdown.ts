import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/** Markdown from the admin panel → safe HTML. */
export function renderMarkdown(markdown: string | null | undefined) {
  const html = marked.parse(markdown || '', { async: false });
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      a: ['href', 'name', 'target', 'rel', 'title'],
    },
  });
}
