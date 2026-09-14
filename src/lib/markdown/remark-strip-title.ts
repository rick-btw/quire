import type { Root } from 'mdast';
import { toString } from 'mdast-util-to-string';
import { shouldStripTitle } from '../vault/text';

interface FileLike {
  data?: { astro?: { frontmatter?: Record<string, unknown> } };
}

/** Drop a leading `# H1` that duplicates the note title (the page renders the title itself). */
export function remarkStripTitle() {
  return (tree: Root, file: FileLike) => {
    const first = tree.children[0];
    if (!first || first.type !== 'heading' || first.depth !== 1) return;
    const raw = file.data?.astro?.frontmatter?.title;
    const frontmatterTitle = raw === undefined || raw === null ? undefined : String(raw);
    if (shouldStripTitle(frontmatterTitle, toString(first))) tree.children.shift();
  };
}
