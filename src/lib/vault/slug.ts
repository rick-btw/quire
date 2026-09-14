import GithubSlugger from 'github-slugger';

/**
 * Slug for one path segment (folder or file stem). Keeps Unicode letters, digits and marks,
 * so Persian names survive; strips format-control characters such as ZWNJ.
 */
export function slugifySegment(segment: string): string {
  const slug = segment
    .normalize('NFC')
    .trim()
    .toLowerCase()
    .replace(/\p{Cf}/gu, '')
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}\p{M}_-]+/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug || 'untitled';
}

/** Slug for a vault-relative markdown path: `LeetCode Grind/1. Two Sum.md` -> `leetcode-grind/1-two-sum`. */
export function slugifyPath(relativePath: string): string {
  return relativePath
    .replace(/\\/g, '/')
    .replace(/\.md$/i, '')
    .split('/')
    .filter(Boolean)
    .map(slugifySegment)
    .join('/');
}

/** Heading anchors in document order, using github-slugger for parity with Astro's heading ids. */
export function headingSlugs(texts: string[]): string[] {
  const slugger = new GithubSlugger();
  return texts.map((text) => slugger.slug(text));
}

/** Single heading slug without de-duplication state (for matching `[[note#Heading]]`). */
export function headingSlug(text: string): string {
  return new GithubSlugger().slug(text);
}

/** Obsidian tags may be nested (`topic/sub`); each segment is slugified. */
export function tagSlug(tag: string): string {
  return tag
    .replace(/^#/, '')
    .split('/')
    .filter(Boolean)
    .map(slugifySegment)
    .join('/');
}

/** Normalisation used for every case-insensitive lookup. */
export function normalizeKey(value: string): string {
  return value.normalize('NFC').trim().toLowerCase();
}
