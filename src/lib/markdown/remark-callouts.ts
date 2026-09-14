import type { Paragraph, PhrasingContent, Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { visit } from 'unist-util-visit';

const ALIASES: Record<string, string> = {
  summary: 'abstract',
  tldr: 'abstract',
  hint: 'tip',
  important: 'tip',
  check: 'success',
  done: 'success',
  help: 'question',
  faq: 'question',
  caution: 'warning',
  attention: 'warning',
  fail: 'failure',
  missing: 'failure',
  error: 'danger',
  cite: 'quote',
};

const MARKER = /^\[!([\w-]+)\]([+-])?[ \t]*/;

function canonical(type: string): string {
  const lower = type.toLowerCase();
  return ALIASES[lower] ?? lower;
}

/**
 * Obsidian callouts: `> [!type] Title` becomes `<aside class="callout" data-callout="type">`,
 * `> [!type]- Title` a closed `<details>`, `> [!type]+ Title` an open one. The title element
 * is a `<div>` or `<summary>` with class `callout-title`; the body follows.
 */
export function remarkCallouts() {
  return (tree: Root) => {
    visit(tree, 'blockquote', (node) => {
      const first = node.children[0];
      if (!first || first.type !== 'paragraph') return;
      const lead = first.children[0];
      if (!lead || lead.type !== 'text') return;
      const match = lead.value.match(MARKER);
      if (!match) return;

      const type = canonical(match[1]);
      const fold = match[2];
      lead.value = lead.value.slice(match[0].length);

      const title: PhrasingContent[] = [];
      const body: PhrasingContent[] = [];
      let inTitle = true;
      for (const child of first.children) {
        if (!inTitle) {
          body.push(child);
          continue;
        }
        if (child.type === 'break') {
          inTitle = false;
          continue;
        }
        if (child.type === 'text' && child.value.includes('\n')) {
          const at = child.value.indexOf('\n');
          const head = child.value.slice(0, at);
          const tail = child.value.slice(at + 1);
          if (head.trim()) title.push({ type: 'text', value: head });
          if (tail) body.push({ type: 'text', value: tail });
          inTitle = false;
          continue;
        }
        if (child.type !== 'text' || child.value.trim()) title.push(child);
      }

      const titleChildren: PhrasingContent[] = toString(title).trim()
        ? title
        : [{ type: 'text', value: type.charAt(0).toUpperCase() + type.slice(1) }];
      if (body.length) first.children = body;
      else node.children.shift();

      node.data = {
        hName: fold ? 'details' : 'aside',
        hProperties: {
          className: ['callout'],
          'data-callout': type,
          ...(fold === '+' ? { open: true } : {}),
        },
      };
      const heading: Paragraph = {
        type: 'paragraph',
        children: titleChildren,
        data: { hName: fold ? 'summary' : 'div', hProperties: { className: ['callout-title'] } },
      };
      node.children.unshift(heading);
    });
  };
}
