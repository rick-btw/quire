# Quire

A personal, Obsidian-style website for markdown notes. The `notes/` folder in this repository **is** the
Obsidian vault: write there, push, and GitHub Actions publishes the site. Nothing is edited in the browser.

- Sidebar folder tree, reading pane, and a context panel with outline, local graph, and backlinks
- Full-vault graph view, fuzzy search (`⌘K` / `Ctrl K`), light and dark themes
- Obsidian syntax: `[[wikilinks]]`, `![[embeds]]`, callouts, KaTeX math, code highlighting, tags, aliases
- Built with [Astro](https://astro.build); no UI framework, no database, no backend

## Writing notes

Open `notes/` as a vault in Obsidian (or edit the files any other way). Conventions:

| Thing | How |
| --- | --- |
| Topics | Top-level folders (`data-structures/`, `mathematics/`, …). Nested folders are fine. |
| Home page | `notes/index.md`. If it is missing, an overview of topics is generated. |
| Title | Frontmatter `title`, else the first `# Heading`, else the file name. A leading `# Heading` equal to the title is not rendered twice. |
| Frontmatter | All optional: `title`, `description`, `tags` (list), `aliases` (list), `draft: true` (hides the note everywhere). |
| Links | `[[note]]`, `[[folder/note]]`, `[[note\|label]]`, `[[note#Heading]]`. Resolved by path, file name, alias, or title. Broken or ambiguous links render as dashed text with the reason in a tooltip, and the build prints a warning. |
| Images | Put files in `notes/attachments/` (already configured in `notes/.obsidian/app.json`) and embed with `![[picture.png]]` or `![[picture.png\|300]]`. |
| Callouts | `> [!note] Title`, `> [!tip]- Folded`, `> [!warning]+ Open`. Obsidian's type aliases are understood. |
| Math | `$inline$` and `$$ display $$`, rendered with KaTeX (`aligned`, `cases`, matrices all work). |
| Code | Fenced blocks with a language name are highlighted in both themes. |
| Persian / RTL | Mixed-direction text is handled per paragraph; Vazirmatn is used for Persian glyphs. |

Not supported (yet): note transclusion `![[note]]` (rendered as a link), block references `#^id`,
`==highlights==`, `%%comments%%`, Mermaid diagrams, Dataview.

URLs come from file paths: `notes/LeetCode Grind/1. Two Sum.md` is served at `/notes/leetcode-grind/1-two-sum/`.
Non-Latin file names are kept as they are.

## Running locally

Requires Node 22.12 or newer.

```bash
npm install
npm run dev
```

Open <http://localhost:4321>. Adding, renaming, or editing a note reloads the page so links, backlinks, and
the tree stay current. Other commands:

```bash
npm run build      # static site in dist/
npm run preview    # serve dist/ locally
npm run check      # type-check Astro and TypeScript files
npm test           # unit tests for the vault index, link resolver, and markdown plugins
npm run verify     # check + test + build
```

To preview exactly what GitHub Pages will serve for a project site:

```bash
SITE_BASE=/quire npm run build && npm run preview
```

then open <http://localhost:4321/quire/>.

## Publishing on GitHub Pages

1. Create a repository (for example `quire`) and push this project to its `main` branch.
2. In the repository settings, open **Pages** and set **Source** to **GitHub Actions**.
3. Push again (or run the workflow manually). `.github/workflows/deploy.yml` builds the site and deploys it to
   `https://<your-user>.github.io/<repo>/`.

The workflow derives `SITE_URL` and `SITE_BASE` from the repository name. For a custom domain, add two
repository variables (**Settings → Secrets and variables → Actions → Variables**): `SITE_URL=https://notes.example.com`
and `SITE_BASE=/`, and put the domain in `public/CNAME`.

The "Open in GitHub" link on each note is derived from the repository in CI. For local builds set `SITE_REPO=owner/repo`.

## Project layout

```
notes/                      the vault (your content)
src/lib/vault/              scans the vault: index, slugs, link resolver, graph data, git dates
src/lib/markdown/           remark/rehype plugins: wikilinks, callouts, title stripping, dir="auto"
src/integrations/vault.ts   serves attachments in dev, copies them at build, reloads on changes, prints link warnings
src/layouts, src/components, src/pages
src/scripts/                client code: theme, sidebar state, search, graph canvas, outline
src/styles/                 tokens (Minimal-inspired palette), layout, prose
tests/                      unit tests and a fixture vault
```
