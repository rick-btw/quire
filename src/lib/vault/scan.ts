import { readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

export interface ScannedNote {
  /** Vault-relative path, forward slashes, original casing. */
  rel: string;
  abs: string;
  frontmatter: Record<string, unknown>;
  body: string;
}

export interface ScanResult {
  root: string;
  notes: ScannedNote[];
  /** Vault-relative paths of non-markdown files. */
  attachments: string[];
}

interface WalkedFile {
  rel: string;
  abs: string;
  isMarkdown: boolean;
}

/** Depth-first walk that skips dot-entries (`.obsidian`, `.trash`, `.DS_Store`) and symlinks. */
function walk(root: string, prefix = ''): WalkedFile[] {
  let entries;
  try {
    entries = readdirSync(path.join(root, prefix), { withFileTypes: true });
  } catch {
    return [];
  }
  const files: WalkedFile[] = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.isSymbolicLink()) continue;
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walk(root, rel));
    else if (entry.isFile()) {
      files.push({ rel, abs: path.join(root, rel), isMarkdown: /\.md$/i.test(entry.name) });
    }
  }
  return files.sort((a, b) => (a.rel < b.rel ? -1 : a.rel > b.rel ? 1 : 0));
}

export function scanVault(root: string): ScanResult {
  const notes: ScannedNote[] = [];
  const attachments: string[] = [];
  for (const file of walk(root)) {
    if (!file.isMarkdown) {
      attachments.push(file.rel);
      continue;
    }
    const source = readFileSync(file.abs, 'utf8');
    let parsed: matter.GrayMatterFile<string>;
    try {
      parsed = matter(source);
    } catch (error) {
      throw new Error(`${file.rel}: invalid frontmatter: ${error instanceof Error ? error.message : String(error)}`);
    }
    const frontmatter =
      parsed.data && typeof parsed.data === 'object' ? (parsed.data as Record<string, unknown>) : {};
    notes.push({ rel: file.rel, abs: file.abs, frontmatter, body: parsed.content });
  }
  return { root, notes, attachments };
}

/** Cheap change detector: every file's path, mtime and size. No file contents are read. */
export function fingerprint(root: string): string {
  return walk(root)
    .map((file) => {
      try {
        const stat = statSync(file.abs);
        return `${file.rel}:${stat.mtimeMs}:${stat.size}`;
      } catch {
        return `${file.rel}:gone`;
      }
    })
    .join('\n');
}
