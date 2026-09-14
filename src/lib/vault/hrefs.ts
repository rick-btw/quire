/**
 * URL builders parametrised by the site base path. Pure, so they can run in the
 * remark plugin (config process), in pages (Vite SSR) and in tests.
 */

const encodePath = (value: string) => value.split('/').map(encodeURIComponent).join('/');

/** `joinBase('/quire', 'notes/a/')` -> `/quire/notes/a/`; `joinBase('/', '')` -> `/`. */
export function joinBase(base: string, path: string): string {
  const cleanBase = base.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

export function noteHrefWithBase(base: string, id: string, anchor?: string): string {
  const path = id === 'index' ? '' : `notes/${encodePath(id)}/`;
  return joinBase(base, path) + (anchor ? `#${encodeURIComponent(anchor)}` : '');
}

export function attachmentHrefWithBase(base: string, vaultPath: string): string {
  const path = vaultPath.replace(/^attachments\//, '');
  return joinBase(base, `attachments/${encodePath(path)}`);
}

export function tagHrefWithBase(base: string, tagSlug: string): string {
  return joinBase(base, `tags/${encodePath(tagSlug)}/`);
}
