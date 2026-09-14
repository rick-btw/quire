import path from 'node:path';
import { SITE } from '../../site';
import { toLinks } from './links';
import { fingerprint, scanVault, type ScanResult, type ScannedNote } from './scan';
import { headingSlugs, normalizeKey, slugifyPath, slugifySegment } from './slug';
import {
  countWords,
  extractHeadings,
  leadingH1,
  shouldStripTitle,
  titleFromStem,
  toPlainText,
} from './text';
import type { Link, Lookups, Topic, VaultFolder, VaultIndex, VaultNote } from './types';

export interface BuildOptions {
  name: string;
}

function str(value: unknown): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return undefined;
}

function list(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(str).filter((v): v is string => !!v);
  if (typeof value === 'string') return value.split(',').map((v) => v.trim()).filter(Boolean);
  if (typeof value === 'number') return [String(value)];
  return [];
}

function dropLeadingH1(body: string): string {
  const lines = body.split('\n');
  const first = lines.findIndex((line) => line.trim() !== '');
  if (first < 0) return body;
  lines.splice(first, 1);
  return lines.join('\n');
}

function toNote(scanned: ScannedNote): VaultNote {
  const { rel, frontmatter } = scanned;
  const stem = path.posix.basename(rel).replace(/\.md$/i, '');
  const dir = path.posix.dirname(rel);
  const folder = dir === '.' ? '' : dir;
  const fmTitle = str(frontmatter.title);
  const h1 = leadingH1(scanned.body);
  const title = fmTitle ?? h1 ?? titleFromStem(stem);
  const stripTitle = shouldStripTitle(fmTitle, h1);
  const body = stripTitle ? dropLeadingH1(scanned.body) : scanned.body;
  const rawHeadings = extractHeadings(body);
  const slugs = headingSlugs(rawHeadings.map((h) => h.text));
  const plain = toPlainText(body);
  const firstSegment = folder ? folder.split('/')[0] : '';
  return {
    id: slugifyPath(rel),
    path: rel,
    file: scanned.abs,
    stem,
    folder,
    title,
    description: str(frontmatter.description),
    tags: list(frontmatter.tags).map((t) => t.replace(/^#/, '')),
    aliases: list(frontmatter.aliases),
    draft: frontmatter.draft === true,
    topic: firstSegment ? slugifySegment(firstSegment) : '',
    topicName: firstSegment,
    headings: rawHeadings.map((h, i) => ({ depth: h.depth, text: h.text, slug: slugs[i] })),
    stripTitle,
    plain,
    wordCount: countWords(plain),
    links: [],
  };
}

function push(map: Map<string, VaultNote[]>, key: string, note: VaultNote) {
  const bucket = map.get(key);
  if (bucket) {
    if (!bucket.includes(note)) bucket.push(note);
  } else map.set(key, [note]);
}

function buildLookups(notes: VaultNote[]): Lookups {
  const lookups: Lookups = {
    byPathKey: new Map(),
    byStem: new Map(),
    bySlugStem: new Map(),
    byAlias: new Map(),
    byTitle: new Map(),
    byFile: new Map(),
  };
  for (const note of notes) {
    lookups.byPathKey.set(normalizeKey(note.path.replace(/\.md$/i, '')), note);
    lookups.byFile.set(note.file, note);
    push(lookups.byStem, normalizeKey(note.stem), note);
    push(lookups.bySlugStem, slugifySegment(note.stem), note);
    for (const alias of note.aliases) push(lookups.byAlias, normalizeKey(alias), note);
    push(lookups.byTitle, normalizeKey(note.title), note);
  }
  return lookups;
}

const compare = (a: string, b: string) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });

function sortFolder(folder: VaultFolder): number {
  folder.folders.sort((a, b) => compare(a.name, b.name));
  folder.notes.sort((a, b) => compare(a.stem, b.stem));
  folder.count = folder.notes.length + folder.folders.reduce((sum, child) => sum + sortFolder(child), 0);
  return folder.count;
}

function buildTree(notes: VaultNote[], name: string): VaultFolder {
  const root: VaultFolder = { name, slug: '', path: '', folders: [], notes: [], count: 0 };
  for (const note of notes) {
    if (note.id === 'index') continue; // the home note is reached through the vault name
    let folder = root;
    for (const segment of note.folder ? note.folder.split('/') : []) {
      let child = folder.folders.find((f) => f.name === segment);
      if (!child) {
        const slug = slugifySegment(segment);
        child = {
          name: segment,
          slug,
          path: folder.path ? `${folder.path}/${slug}` : slug,
          folders: [],
          notes: [],
          count: 0,
        };
        folder.folders.push(child);
      }
      folder = child;
    }
    folder.notes.push(note);
  }
  sortFolder(root);
  return root;
}

/** Pure: builds the whole index from a scan. Throws on id collisions or invalid frontmatter. */
export function buildIndex(scan: ScanResult, options: BuildOptions): VaultIndex {
  const scannedById = new Map<string, ScannedNote>();
  const notes: VaultNote[] = [];
  for (const scanned of scan.notes) {
    const note = toNote(scanned);
    if (note.draft) continue;
    notes.push(note);
    scannedById.set(note.id, scanned);
  }
  notes.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const byId = new Map<string, VaultNote>();
  for (const note of notes) {
    const existing = byId.get(note.id);
    if (existing) {
      throw new Error(
        `Note ids collide: "${existing.path}" and "${note.path}" both become "${note.id}". Rename one of them.`,
      );
    }
    byId.set(note.id, note);
  }

  const tree = buildTree(notes, options.name);
  const topics: Topic[] = tree.folders.map((f) => ({ slug: f.slug, name: f.name }));
  const index: VaultIndex = {
    root: scan.root,
    name: options.name,
    notes,
    byId,
    lookups: buildLookups(notes),
    tree,
    topics,
    attachments: scan.attachments,
    backlinks: new Map(),
    diagnostics: [],
  };

  for (const note of notes) {
    note.links = toLinks(index, note, scannedById.get(note.id)?.body ?? '');
  }
  for (const note of notes) {
    for (const link of note.links) {
      const bucket = index.backlinks.get(link.target);
      if (bucket) bucket.push(link);
      else index.backlinks.set(link.target, [link]);
    }
  }
  for (const links of index.backlinks.values()) {
    links.sort((a, b) => (a.source < b.source ? -1 : a.source > b.source ? 1 : 0));
  }
  return index;
}

export function vaultRoot(): string {
  return path.resolve(process.cwd(), SITE.vaultDir);
}

let cache: { root: string; fp: string; index: VaultIndex; checkedAt: number } | undefined;

/**
 * Cached entry point used by pages, the remark plugin and the dev integration.
 * Rebuilds only when a file under the vault changes (checked at most every 250ms).
 */
export function getVaultIndex(root = vaultRoot()): VaultIndex {
  const now = Date.now();
  if (cache && cache.root === root && now - cache.checkedAt < 250) return cache.index;
  const fp = fingerprint(root);
  if (cache && cache.root === root && cache.fp === fp) {
    cache.checkedAt = now;
    return cache.index;
  }
  const index = buildIndex(scanVault(root), { name: SITE.name });
  cache = { root, fp, index, checkedAt: now };
  return index;
}

export function backlinksOf(index: VaultIndex, id: string): Link[] {
  return index.backlinks.get(id) ?? [];
}
