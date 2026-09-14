import type { Root } from 'hast';
import { visit } from 'unist-util-visit';

const BLOCKS = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'li',
  'blockquote',
  'td',
  'th',
  'dd',
  'dt',
  'figcaption',
  'summary',
  'aside',
  'details',
]);

/** `dir="auto"` on every block so Persian paragraphs read right-to-left inside an English note. */
export function rehypeDirAuto() {
  return (tree: Root) => {
    visit(tree, 'element', (node) => {
      if (!BLOCKS.has(node.tagName)) return;
      node.properties ??= {};
      if (node.properties.dir === undefined) node.properties.dir = 'auto';
    });
  };
}
