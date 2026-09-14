import path from 'node:path';
import { headingSlug, normalizeKey, slugifyPath, slugifySegment } from './slug';
import type { Resolution, VaultIndex, VaultNote } from './types';

export interface ResolveOptions {
  /** True for `[text](url)` links, whose paths are relative to the source note and may be percent-encoded. */
  markdownLink?: boolean;
}

const EXTERNAL = /^(?:https?:|mailto:|tel:)/i;
const SCHEME = /^[a-z][\w+.-]*:/i;
const MD_EXT = /\.md$/i;

type NoteMatch = { note: VaultNote } | { ambiguous: VaultNote[] } | { escaped?: boolean };

/** Remove whitespace and control characters so `java\tscript:` cannot smuggle a scheme past the check. */
function compactForSchemeCheck(value: string): string {
  let out = '';
  for (const char of value) {
    if (char.charCodeAt(0) > 32) out += char;
  }
  return out;
}

/**
 * The one link resolver, shared by the remark plugin (rendering) and the link extractor (graph, backlinks).
 * Precedence: external URL → path form → name form (stem, slugged stem, alias, title) → attachment → unresolved.
 */
export function resolveRef(
  index: VaultIndex,
  raw: string,
  from?: VaultNote,
  options: ResolveOptions = {},
): Resolution {
  let value = raw.trim();
  if (!value) return { kind: 'unresolved', reason: 'Empty link' };
  if (EXTERNAL.test(value)) return { kind: 'external', url: value };
  const compact = compactForSchemeCheck(value);
  if (SCHEME.test(compact) || compact.startsWith('//')) {
    return { kind: 'unresolved', reason: `Unsupported URL: ${raw}` };
  }
  if (options.markdownLink) {
    try {
      value = decodeURIComponent(value);
    } catch {
      return { kind: 'unresolved', reason: `Invalid URL encoding: ${raw}` };
    }
  }

  const hashAt = value.indexOf('#');
  const target = (hashAt < 0 ? value : value.slice(0, hashAt)).trim();
  const fragment = hashAt < 0 ? '' : value.slice(hashAt + 1).trim();

  if (!target) {
    if (!from) return { kind: 'unresolved', reason: `Cannot resolve "${raw}" without a source note` };
    return withAnchor(from, fragment, raw);
  }

  const match = findNote(index, target.replace(MD_EXT, ''), from, options);
  if ('note' in match) return withAnchor(match.note, fragment, raw);
  if ('ambiguous' in match) {
    const candidates = match.ambiguous.map((n) => n.path);
    return {
      kind: 'unresolved',
      reason: `Ambiguous link "${raw}" matches ${candidates.join(', ')}. Use a folder path.`,
      candidates,
    };
  }

  if (!MD_EXT.test(target)) {
    const attachments = findAttachments(index, target, from);
    if (attachments.length === 1) {
      return { kind: 'attachment', path: attachments[0], anchor: fragment || undefined };
    }
    if (attachments.length > 1) {
      return {
        kind: 'unresolved',
        reason: `Ambiguous attachment "${raw}" matches ${attachments.join(', ')}.`,
        candidates: attachments,
      };
    }
  }
  if ('escaped' in match && match.escaped) {
    return { kind: 'unresolved', reason: `Link leaves the vault: ${raw}` };
  }
  return { kind: 'unresolved', reason: `Missing note or attachment: ${raw}` };
}

function findNote(
  index: VaultIndex,
  target: string,
  from: VaultNote | undefined,
  options: ResolveOptions,
): NoteMatch {
  const { lookups, byId } = index;
  const clean = target.replace(/^\/+/, '');
  const hasPath = clean.includes('/');

  if (options.markdownLink && from && !target.startsWith('/')) {
    const relative = path.posix.normalize(path.posix.join(from.folder, clean));
    if (relative.startsWith('..')) return { escaped: true };
    const hit = lookups.byPathKey.get(normalizeKey(relative)) ?? byId.get(slugifyPath(relative));
    if (hit) return { note: hit };
  }

  if (hasPath || options.markdownLink) {
    const hit = lookups.byPathKey.get(normalizeKey(clean)) ?? byId.get(slugifyPath(clean));
    if (hit) return { note: hit };
  }

  if (hasPath) {
    // Obsidian's "shortest path" links may be a unique suffix such as `sub/note`.
    const suffix = `/${normalizeKey(clean)}`;
    const slugSuffix = `/${slugifyPath(clean)}`;
    const matches = index.notes.filter(
      (note) => normalizeKey(note.path.replace(MD_EXT, '')).endsWith(suffix) || note.id.endsWith(slugSuffix),
    );
    return pick(matches, from);
  }

  const key = normalizeKey(clean);
  const candidates = [
    lookups.byStem.get(key),
    lookups.bySlugStem.get(slugifySegment(clean)),
    lookups.byAlias.get(key),
    lookups.byTitle.get(key),
  ];
  for (const matches of candidates) {
    if (!matches?.length) continue;
    return pick(matches, from);
  }
  return {};
}

function pick(matches: VaultNote[], from?: VaultNote): NoteMatch {
  if (matches.length === 0) return {};
  if (matches.length === 1) return { note: matches[0] };
  const sameFolder = from ? matches.filter((note) => note.folder === from.folder) : [];
  if (sameFolder.length === 1) return { note: sameFolder[0] };
  return { ambiguous: matches };
}

function withAnchor(note: VaultNote, fragment: string, raw: string): Resolution {
  if (!fragment) return { kind: 'note', note };
  if (fragment.startsWith('^')) {
    return {
      kind: 'note',
      note,
      warning: `Block references are not supported (${raw}); linking to the note instead.`,
    };
  }
  // Obsidian allows nested heading paths (`#Parent#Child`); the last segment is the anchor.
  const wanted = fragment.split('#').filter(Boolean).pop() ?? fragment;
  const key = normalizeKey(wanted);
  if (key === normalizeKey(note.title)) return { kind: 'note', note };
  const slug = headingSlug(wanted);
  const heading =
    note.headings.find((h) => h.slug === wanted) ??
    note.headings.find((h) => h.slug === slug) ??
    note.headings.find((h) => normalizeKey(h.text) === key);
  if (heading) return { kind: 'note', note, anchor: heading.slug };
  return {
    kind: 'note',
    note,
    warning: `Missing heading "${wanted}" in ${note.path}; linking to the note instead.`,
  };
}

function findAttachments(index: VaultIndex, target: string, from?: VaultNote): string[] {
  const clean = target.replace(/^\/+/, '');
  const byKey = (wanted: string) => {
    const key = normalizeKey(wanted);
    return index.attachments.filter((a) => normalizeKey(a) === key);
  };
  const exact = byKey(clean);
  if (exact.length) return exact;
  if (from) {
    const relative = path.posix.normalize(path.posix.join(from.folder, clean));
    if (!relative.startsWith('..')) {
      const hit = byKey(relative);
      if (hit.length) return hit;
    }
  }
  const inFolder = byKey(`attachments/${clean}`);
  if (inFolder.length) return inFolder;
  const base = normalizeKey(path.posix.basename(clean));
  return index.attachments.filter((a) => normalizeKey(path.posix.basename(a)) === base);
}
