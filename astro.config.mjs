// @ts-check
import { rehypeHeadingIds, unified } from '@astrojs/markdown-remark';
import { defineConfig } from 'astro/config';
import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import { vault } from './src/integrations/vault';
import { rehypeDirAuto } from './src/lib/markdown/rehype-dir-auto';
import { remarkCallouts } from './src/lib/markdown/remark-callouts';
import { remarkStripTitle } from './src/lib/markdown/remark-strip-title';
import { remarkWikilinks } from './src/lib/markdown/remark-wikilinks';

// Where the site is served from. On a GitHub project page this is
// https://<owner>.github.io/<repo>, so SITE_BASE="/<repo>". On a custom
// domain or a user page leave both unset (base "/").
const site = process.env.SITE_URL || 'http://localhost:4321';
const base = process.env.SITE_BASE || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  integrations: [vault()],
  markdown: {
    // Astro 7 defaults to the Sätteri processor; the classic unified pipeline is what the
    // Obsidian plugins (wikilinks, callouts) and KaTeX are written for.
    processor: unified({
      gfm: true,
      smartypants: false,
      remarkPlugins: [remarkMath, [remarkWikilinks, { base }], remarkCallouts, remarkStripTitle],
      // Heading ids are assigned before KaTeX so `$x^2$` in a heading slugs from its raw text,
      // matching the anchors the vault index computes. Astro keeps ids that already exist.
      rehypePlugins: [rehypeHeadingIds, [rehypeKatex, { output: 'htmlAndMathml' }], rehypeDirAuto],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      defaultColor: false,
    },
  },
});
