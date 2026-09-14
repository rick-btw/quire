import { resolveRef } from './resolve';
import { inlineToText, stripCode } from './text';
import type { Link, VaultIndex, VaultNote } from './types';

export interface Ref {
  raw: string;
  target: string;
  label?: string;
  embed: boolean;
  wiki: boolean;
  offset: number;
  length: number;
}

const WIKI = /(!?)\[\[([^\]\n]+?)\]\]/g;
const MARKDOWN = /(!?)\[([^\]\n]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;

/** Wikilinks and markdown links outside code, in document order. Offsets refer to `stripCode(body)`. */
export function extractRefs(body: string): Ref[] {
  const text = stripCode(body);
  const refs: Ref[] = [];
  for (const match of text.matchAll(WIKI)) {
    const [destination, ...labels] = match[2].split('|');
    refs.push({
      raw: match[0],
      target: destination.trim(),
      label: labels.join('|').trim() || undefined,
      embed: match[1] === '!',
      wiki: true,
      offset: match.index ?? 0,
      length: match[0].length,
    });
  }
  for (const match of text.matchAll(MARKDOWN)) {
    refs.push({
      raw: match[0],
      target: match[3],
      label: match[2] || undefined,
      embed: match[1] === '!',
      wiki: false,
      offset: match.index ?? 0,
      length: match[0].length,
    });
  }
  return refs.sort((a, b) => a.offset - b.offset);
}

/** A readable window of text around a link, for backlink panels. */
export function contextAround(text: string, offset: number, length: number, radius = 80): string {
  let start = Math.max(0, offset - radius);
  let end = Math.min(text.length, offset + length + radius);
  // Widen to whitespace so we never cut a word or a link in half.
  while (start > 0 && !/\s/.test(text[start - 1])) start--;
  while (end < text.length && !/\s/.test(text[end])) end++;
  const snippet = inlineToText(
    text.slice(start, end).replace(/^[ \t]{0,3}(?:#{1,6}[ \t]+|>[ \t]?|[-*+][ \t]+|\d+[.)][ \t]+)/gm, ''),
  )
    .replace(/\s+/g, ' ')
    .trim();
  return `${start > 0 ? '…' : ''}${snippet}${end < text.length ? '…' : ''}`;
}

function addDiagnostic(index: VaultIndex, note: VaultNote, message: string) {
  if (index.diagnostics.some((d) => d.file === note.path && d.message === message)) return;
  index.diagnostics.push({ file: note.path, message });
}

/** Outgoing note links of one note, deduplicated by target. Records unresolved links as diagnostics. */
export function toLinks(index: VaultIndex, note: VaultNote, body: string): Link[] {
  const links = new Map<string, Link>();
  const text = stripCode(body);
  for (const ref of extractRefs(body)) {
    const resolution = resolveRef(index, ref.target, note, { markdownLink: !ref.wiki });
    if (resolution.kind === 'unresolved') {
      // `[text](/graph/)` is a link to a site route, rendered by the remark plugin; not a broken note link.
      const siteRoute = !ref.wiki && /^\/(?!\/)/.test(ref.target);
      if (!siteRoute) addDiagnostic(index, note, resolution.reason);
      continue;
    }
    if (resolution.kind !== 'note') continue;
    if (resolution.warning) addDiagnostic(index, note, resolution.warning);
    const target = resolution.note.id;
    if (target === note.id || links.has(target)) continue;
    links.set(target, {
      source: note.id,
      target,
      anchor: resolution.anchor,
      context: contextAround(text, ref.offset, ref.length),
    });
  }
  return [...links.values()];
}
