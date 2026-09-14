import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Image, Link, PhrasingContent, Root, Text } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';
import { attachmentHrefWithBase, joinBase, noteHrefWithBase } from '../vault/hrefs';
import { getVaultIndex } from '../vault/index';
import { resolveRef } from '../vault/resolve';
import type { VaultIndex, VaultNote } from '../vault/types';

export interface WikilinkOptions {
  /** Site base path (`/` or `/repo`). */
  base?: string;
  /** Index provider; defaults to the cached vault index. Tests inject a fixture index. */
  index?: () => VaultIndex;
}

interface FileLike {
  path?: string;
  history?: string[];
}

const WIKI = /(!?)\[\[([^\]\n]+?)\]\]/g;
const IMAGE = /\.(?:png|jpe?g|gif|webp|avif|svg)$/i;
const SIZE = /^(\d+)(?:x(\d+))?$/;

const text = (value: string): Text => ({ type: 'text', value });

/** Locate the note being compiled from the vfile path (a filesystem path or a `file:` URL). */
function findSource(index: VaultIndex, file: FileLike): VaultNote | undefined {
  const raw = file.path ?? file.history?.[0];
  if (!raw) return undefined;
  const abs = raw.startsWith('file:') ? fileURLToPath(raw) : path.resolve(raw);
  return index.lookups.byFile.get(abs);
}

function unresolvedNode(label: string, reason: string): PhrasingContent {
  return {
    type: 'wikilinkUnresolved',
    children: [text(label)],
    data: { hName: 'span', hProperties: { className: ['unresolved'], title: reason } },
  } as unknown as PhrasingContent;
}

/**
 * Obsidian links: `[[note]]`, `[[folder/note|label]]`, `[[note#Heading]]`, `![[image.png|300]]`,
 * plus ordinary markdown links to `.md` files and attachments. Everything goes through `resolveRef`.
 */
export function remarkWikilinks(options: WikilinkOptions = {}) {
  const base = options.base ?? '/';
  const getIndex = options.index ?? getVaultIndex;

  return (tree: Root, file: FileLike) => {
    const index = getIndex();
    const from = findSource(index, file);
    const wiki = new WeakSet<object>();
    const explicitLabel = new WeakSet<object>();

    // 1. Turn `[[...]]` inside text into link/image nodes.
    visit(tree, 'text', (node, i, parent) => {
      if (!parent || i === undefined || parent.type === 'link' || parent.type === 'linkReference') return;
      const matches = [...node.value.matchAll(WIKI)];
      if (matches.length === 0) return;
      const out: PhrasingContent[] = [];
      let cursor = 0;
      for (const match of matches) {
        const start = match.index ?? 0;
        if (start > cursor) out.push(text(node.value.slice(cursor, start)));
        const [destination, ...labels] = match[2].split('|');
        const target = destination.trim();
        const label = labels.join('|').trim();
        const embed = match[1] === '!';
        let created: Link | Image;
        if (embed && IMAGE.test(target.split('#')[0])) {
          const size = label.match(SIZE);
          created = {
            type: 'image',
            url: target,
            alt: size || !label ? path.posix.basename(target) : label,
            data: size
              ? { hProperties: { width: Number(size[1]), ...(size[2] ? { height: Number(size[2]) } : {}) } }
              : undefined,
          };
        } else {
          created = { type: 'link', url: target, children: [text(label || target)] };
          if (label) explicitLabel.add(created);
        }
        wiki.add(created);
        out.push(created);
        cursor = start + match[0].length;
      }
      if (cursor < node.value.length) out.push(text(node.value.slice(cursor)));
      parent.children.splice(i, 1, ...out);
      return i + out.length;
    });

    // 2. Resolve every link and image against the vault.
    visit(tree, ['link', 'image'], (node, i, parent) => {
      if (!parent || i === undefined || (node.type !== 'link' && node.type !== 'image')) return;
      const isWiki = wiki.has(node);
      const resolution = resolveRef(index, node.url, from, { markdownLink: !isWiki });

      if (resolution.kind === 'external') {
        if (node.type === 'link') {
          node.data = {
            ...node.data,
            hProperties: { className: ['external-link'], rel: 'noopener noreferrer', target: '_blank' },
          };
        }
        return;
      }

      if (resolution.kind === 'attachment') {
        const anchor = resolution.anchor ? `#${encodeURIComponent(resolution.anchor)}` : '';
        node.url = attachmentHrefWithBase(base, resolution.path) + anchor;
        if (node.type === 'link') node.data = { ...node.data, hProperties: { className: ['attachment-link'] } };
        return;
      }

      if (resolution.kind === 'note') {
        const { note, anchor } = resolution;
        const href = noteHrefWithBase(base, note.id, anchor);
        const headingText = anchor ? note.headings.find((h) => h.slug === anchor)?.text : undefined;
        const defaultLabel = headingText ? `${note.title} › ${headingText}` : note.title;
        if (node.type === 'image') {
          // Note transclusion is not supported; show a plain link to the note instead.
          const link: Link = {
            type: 'link',
            url: href,
            children: [text(defaultLabel)],
            data: { hProperties: { className: ['internal-link', 'embed-fallback'], 'data-note': note.id } },
          };
          parent.children[i] = link;
          return;
        }
        node.url = href;
        if (isWiki && !explicitLabel.has(node)) node.children = [text(defaultLabel)];
        node.data = { ...node.data, hProperties: { className: ['internal-link'], 'data-note': note.id } };
        return;
      }

      // A markdown link to a site route (`/graph/`, `/tags/python/`) is not a note; prefix the base path.
      if (node.type === 'link' && !isWiki && /^\/(?!\/)/.test(node.url)) {
        node.url = joinBase(base, node.url);
        node.data = { ...node.data, hProperties: { className: ['site-link'] } };
        return;
      }

      const label = node.type === 'image' ? `[missing image: ${node.alt || node.url}]` : toString(node) || node.url;
      parent.children[i] = unresolvedNode(label, resolution.reason);
    });
  };
}
