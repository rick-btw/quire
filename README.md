# Quire

**Amirali's personal knowledge library.**

Quire is where I keep what I learn: notes on data structures, algorithms, machine learning, mathematics,
programming, and LeetCode problems. I write everything in [Obsidian](https://obsidian.md), and this repository
publishes the vault as a website so the notes can be read, searched, and browsed by anyone.

Read it at **<https://rick-btw.github.io/quire/>**.

The site is read-only. Every page is a plain markdown file in [`notes/`](notes/); when I push a change, the
site rebuilds itself.

## What's inside

| Topic | What it covers |
| --- | --- |
| Data structures | Graphs, trees, hash maps, and the algorithms that walk them |
| Machine learning | How models learn: linear regression, gradient descent, and onwards |
| Mathematics | The language underneath everything else: linear algebra, calculus |
| Programming | Things learned while picking up a language |
| LeetCode | Problems, solutions, and what each one teaches |

The library grows as I study, so expect new topics over time.

## Features

**Reading like a vault.** The site is laid out the way Obsidian is: a folder tree on the left, the note in the
middle, and a context panel on the right with the note's outline, a local graph of its neighbours, and a list of
backlinks (every note that links to the one you're reading).

**Connected notes.** Notes link to each other with Obsidian's `[[wikilinks]]`, so you can follow an idea from
one topic into another. The **graph view** shows the whole library at once, with every note as a node and
every link as an edge.

**Fast search.** Press `⌘K` (or `Ctrl K`) anywhere to fuzzy-search titles, aliases, tags, and note contents.

**Rich notes.** Math is typeset with KaTeX, code blocks are syntax-highlighted, and Obsidian callouts (tips,
warnings, collapsible sections) render as they do in the app. Images and diagrams are embedded inline.

**Tags.** Notes are tagged by subject, and each tag has its own page listing everything filed under it.

**Light and dark themes.** It follows your system setting, with a toggle in the sidebar. The palette is
inspired by Obsidian's Minimal theme.

**Persian and mixed-direction text.** Right-to-left paragraphs are detected automatically and set in
Vazirmatn, so English and Persian can sit side by side in the same note.

**Works on any screen.** On phones the sidebar folds into a drawer and the reading pane takes the full width.

## How it's built

- **[Astro](https://astro.build)** generates a fully static site. There is no UI framework, no database, and no
  backend; the only client-side code is for search, the graph, the theme toggle, and navigation state.
- **The vault is the source.** At build time the notes are scanned into an index that resolves wikilinks (by
  path, file name, alias, or title), computes backlinks and graph data, and reads last-updated dates from git.
- **Custom remark/rehype plugins** handle Obsidian syntax: wikilinks and embeds, callouts, duplicate-title
  stripping, and per-paragraph text direction.
- **KaTeX** for math, **Shiki** for code highlighting, **MiniSearch** for the search index, and **d3-force**
  for the graph layout.
- **Fonts:** Inter for text, JetBrains Mono for code, Vazirmatn for Persian.
- **GitHub Actions** builds the site on every push to `main` and deploys it to **GitHub Pages**.

### Project layout

```
notes/                      the vault (all content lives here)
src/lib/vault/              scans the vault: index, slugs, link resolver, graph data, git dates
src/lib/markdown/           remark/rehype plugins: wikilinks, callouts, title stripping, dir="auto"
src/integrations/vault.ts   serves attachments in dev, copies them at build, reloads on changes, prints link warnings
src/layouts, src/components, src/pages
src/scripts/                client code: theme, sidebar state, search, graph canvas, outline
src/styles/                 tokens (Minimal-inspired palette), layout, prose
tests/                      unit tests and a fixture vault
```
