/**
 * Base-path-aware URL helpers for pages and components (uses Vite's BASE_URL).
 * Client scripts read `import.meta.env.BASE_URL` directly to stay dependency-free.
 */
import { attachmentHrefWithBase, joinBase, noteHrefWithBase, tagHrefWithBase } from './vault/hrefs';
import { tagSlug } from './vault/slug';

const BASE = import.meta.env.BASE_URL;

export const withBase = (path: string) => joinBase(BASE, path);
export const noteHref = (id: string, anchor?: string) => noteHrefWithBase(BASE, id, anchor);
export const attachmentHref = (vaultPath: string) => attachmentHrefWithBase(BASE, vaultPath);
export const tagHref = (tag: string) => tagHrefWithBase(BASE, tagSlug(tag));
