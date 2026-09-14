import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { pathToFileURL } from 'node:url';
import { createMarkdownProcessor, rehypeHeadingIds } from '@astrojs/markdown-remark';
import matter from 'gray-matter';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { rehypeDirAuto } from '../src/lib/markdown/rehype-dir-auto';
import { remarkCallouts } from '../src/lib/markdown/remark-callouts';
import { remarkStripTitle } from '../src/lib/markdown/remark-strip-title';
import { remarkWikilinks } from '../src/lib/markdown/remark-wikilinks';
import { fixtureIndex, note } from './helpers';

// Same plugin list as astro.config.mjs, minus Shiki (keeps the HTML small and the test fast).
const processor = createMarkdownProcessor({
  gfm: true,
  smartypants: false,
  syntaxHighlight: false,
  remarkPlugins: [remarkMath, [remarkWikilinks, { base: '/quire', index: fixtureIndex }], remarkCallouts, remarkStripTitle],
  rehypePlugins: [rehypeHeadingIds, [rehypeKatex, { output: 'htmlAndMathml' }], rehypeDirAuto],
});

async function renderNote(id: string) {
  const n = note(fixtureIndex(), id);
  const { content, data } = matter(readFileSync(n.file, 'utf8'));
  return (await processor).render(content, { fileURL: pathToFileURL(n.file), frontmatter: data });
}

async function renderText(markdown: string, frontmatter: Record<string, unknown> = {}) {
  return (await processor).render(markdown, { frontmatter });
}

test('wikilinks of every form become base-aware internal links', async () => {
  const { code } = await renderNote('index');
  assert.match(code, /<a href="\/quire\/notes\/structures\/trees\/" class="internal-link" data-note="structures\/trees">Trees<\/a>/);
  assert.match(code, /<a href="\/quire\/notes\/structures\/trees\/" class="internal-link" data-note="structures\/trees">again<\/a>/);
  assert.match(code, /<a href="\/quire\/notes\/algorithms\/bfs\/#how-it-works" class="internal-link" data-note="algorithms\/bfs">BFS<\/a>/);
  assert.match(code, /<span class="unresolved" title="Link leaves the vault: ..\/secret.md">escape<\/span>/);
  assert.match(code, /<span class="unresolved" title="Unsupported URL: javascript:alert%281%29">bad<\/span>/);
  assert.doesNotMatch(code, /href="javascript:/);
  assert.match(code, /<code>\[\[Missing in code\]\]<\/code>/);
  assert.doesNotMatch(code, /<h1/);
});

test('embeds, self anchors and heading ids agree with the vault index', async () => {
  const { code, metadata } = await renderNote('structures/trees');
  assert.match(code, /<img src="\/quire\/attachments\/diagram.svg" alt="diagram.svg" width="200">/);
  assert.match(code, /<a href="\/quire\/" class="internal-link" data-note="index">Home<\/a>/);
  assert.deepEqual(
    metadata.headings.map((h) => h.slug),
    note(fixtureIndex(), 'structures/trees').headings.map((h) => h.slug),
  );
  assert.match(code, /<h2 id="shape" dir="auto">Shape<\/h2>/);
  assert.match(code, /<h2 id="shape-1" dir="auto">Shape<\/h2>/);
});

test('link labels default to the target title, with the heading appended', async () => {
  const { code } = await renderNote('leetcode-grind/10-ten');
  assert.match(code, /data-note="leetcode-grind\/1-two-sum">1\. Two Sum › Complexity<\/a>/);
  assert.match(code, /href="\/quire\/notes\/leetcode-grind\/1-two-sum\/#complexity"/);
  assert.match(code, /data-note="leetcode-grind\/9-nine">Nine<\/a>/);
});

test('unresolved, ambiguous and block references degrade gracefully', async () => {
  const { code } = await renderNote('second/other');
  assert.match(code, /<span class="unresolved" title="Ambiguous link &#x22;Repeat&#x22; matches folder\/Repeat.md, Repeat.md. Use a folder path.">Repeat<\/span>/);
  assert.match(code, /<span class="unresolved" title="Missing note or attachment: Gone">Gone<\/span>/);
  assert.match(code, /href="\/quire\/notes\/structures\/trees\/" class="internal-link" data-note="structures\/trees">Trees<\/a> has no such heading/);
  assert.match(code, /href="\/quire\/notes\/structures\/trees\/" class="internal-link" data-note="structures\/trees">Trees<\/a> is a block reference/);
});

test('callouts render as aside or details with a title element', async () => {
  const { code } = await renderText(
    [
      '> [!tip]- Fold me',
      '> Hidden body',
      '',
      '> [!WARNING]+ Open',
      '> Shown body',
      '',
      '> [!hint]',
      '> Aliased type with default title',
      '',
      '> [!custom] Custom kind',
      '> **Bold** body',
    ].join('\n'),
  );
  assert.match(code, /<details class="callout" data-callout="tip" dir="auto">\s*<summary class="callout-title" dir="auto">Fold me<\/summary>\s*<p dir="auto">Hidden body<\/p>\s*<\/details>/);
  assert.match(code, /<details class="callout" data-callout="warning" open dir="auto">\s*<summary class="callout-title" dir="auto">Open<\/summary>/);
  assert.match(code, /<aside class="callout" data-callout="tip" dir="auto">\s*<div class="callout-title">Tip<\/div>\s*<p dir="auto">Aliased type with default title<\/p>/);
  assert.match(code, /<aside class="callout" data-callout="custom" dir="auto">\s*<div class="callout-title">Custom kind<\/div>\s*<p dir="auto"><strong>Bold<\/strong> body<\/p>/);
});

test('math renders with KaTeX and heading ids come from the raw TeX text', async () => {
  const { code, metadata } = await renderText('# Title\n\nInline $x^2$ here.\n\n## The $x^2$ rule\n\n$$\n\\begin{aligned} a &= b \\\\ c &= d \\end{aligned}\n$$', {
    title: 'Title',
  });
  assert.doesNotMatch(code, /<h1/);
  assert.match(code, /<span class="katex">/);
  assert.match(code, /<span class="katex-display">/);
  assert.match(code, /<h2 id="the-x2-rule" dir="auto">/);
  assert.deepEqual(metadata.headings.map((h) => h.slug), ['the-x2-rule']);
  assert.match(code, /<p dir="auto">Inline/);
});

test('a leading H1 survives when it differs from the frontmatter title', async () => {
  const { code } = await renderText('# Different heading\n\nBody.', { title: 'Frontmatter title' });
  assert.match(code, /<h1 id="different-heading" dir="auto">Different heading<\/h1>/);
});

test('external links open in a new tab and markdown images to attachments resolve', async () => {
  const { code } = await renderNote('structures/trees');
  assert.doesNotMatch(code, /target="_blank"/);
  const external = await renderText(
    'See [Astro](https://astro.build), ![d](../attachments/diagram.svg) and [the graph](/graph/).',
  );
  assert.match(external.code, /<a href="https:\/\/astro.build" class="external-link" rel="noopener noreferrer" target="_blank">Astro<\/a>/);
  assert.match(external.code, /<img src="\/quire\/attachments\/diagram.svg" alt="d">/);
  assert.match(external.code, /<a href="\/quire\/graph\/" class="site-link">the graph<\/a>/);
});
