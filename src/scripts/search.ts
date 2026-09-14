import { navigate } from 'astro:transitions/client';
import MiniSearch from 'minisearch';

interface SearchDocument {
  id: string;
  title: string;
  href: string;
  path: string;
  topic: string;
  aliases: string;
  tags: string;
  headings: string;
  text: string;
}

interface Result {
  id: string;
  title: string;
  href: string;
  path: string;
  snippet?: string;
}

interface Recent {
  id: string;
  title: string;
  href: string;
  path: string;
}

const BASE = import.meta.env.BASE_URL.replace(/\/+$/, '');
const RECENT_KEY = 'quire:recent';
const LIMIT = 12;
const HINT = '<kbd>↑</kbd> <kbd>↓</kbd> to move · <kbd>↵</kbd> to open · <kbd>esc</kbd> to close';

let engine: MiniSearch<SearchDocument> | null = null;
let loading: Promise<void> | null = null;
let failed = false;

function elements() {
  return {
    dialog: document.getElementById('search') as HTMLDialogElement | null,
    input: document.getElementById('search-input') as HTMLInputElement | null,
    list: document.getElementById('search-results'),
    status: document.getElementById('search-status'),
  };
}

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

async function ensureIndex(): Promise<void> {
  if (engine) return;
  if (!loading) {
    loading = (async () => {
      const response = await fetch(`${BASE}/search-index.json`);
      if (!response.ok) throw new Error(`search index: HTTP ${response.status}`);
      const documents = (await response.json()) as SearchDocument[];
      const built = new MiniSearch<SearchDocument>({
        fields: ['title', 'aliases', 'tags', 'headings', 'text', 'path'],
        storeFields: ['title', 'href', 'path', 'text'],
        searchOptions: {
          prefix: true,
          fuzzy: 0.2,
          combineWith: 'AND',
          boost: { title: 4, aliases: 3, headings: 2, tags: 2, path: 1.5 },
        },
      });
      built.addAll(documents);
      engine = built;
    })().catch((error) => {
      failed = true;
      loading = null;
      throw error;
    });
  }
  return loading;
}

function snippet(text: string, terms: string[]): string {
  const lower = text.toLowerCase();
  let at = -1;
  let term = '';
  for (const candidate of terms) {
    const i = lower.indexOf(candidate.toLowerCase());
    if (i >= 0 && (at < 0 || i < at)) {
      at = i;
      term = candidate;
    }
  }
  if (at < 0) {
    const head = text.slice(0, 140);
    return escapeHtml(head) + (text.length > 140 ? '…' : '');
  }
  let start = Math.max(0, at - 60);
  let end = Math.min(text.length, at + term.length + 80);
  while (start > 0 && !/\s/.test(text[start - 1])) start--;
  while (end < text.length && !/\s/.test(text[end])) end++;
  const window = escapeHtml(text.slice(start, end)).replace(/\s+/g, ' ');
  const pattern = new RegExp(terms.map((t) => escapeHtml(t).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|'), 'gi');
  return `${start > 0 ? '…' : ''}${window.replace(pattern, (m) => `<mark>${m}</mark>`)}${end < text.length ? '…' : ''}`;
}

function render(items: Result[], emptyMessage: string) {
  const { list } = elements();
  if (!list) return;
  if (items.length === 0) {
    list.innerHTML = `<li class="search-empty">${escapeHtml(emptyMessage)}</li>`;
    return;
  }
  list.innerHTML = items
    .map(
      (item, i) =>
        `<li role="option" aria-selected="${i === 0}" data-href="${escapeHtml(item.href)}">` +
        `<span class="title" dir="auto">${escapeHtml(item.title)}</span>` +
        `<span class="path" dir="auto">${escapeHtml(item.path)}</span>` +
        (item.snippet ? `<p class="snippet" dir="auto">${item.snippet}</p>` : '') +
        `</li>`,
    )
    .join('');
}

function readRecent(): Recent[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
    return Array.isArray(parsed) ? (parsed as Recent[]).filter((r) => r && typeof r.href === 'string') : [];
  } catch {
    return [];
  }
}

/** Remember the note being read so an empty search shows recently visited notes. */
export function recordVisit() {
  const id = document.querySelector('main')?.getAttribute('data-note-id');
  if (!id) return;
  const title = document.querySelector('.note-header h1')?.textContent?.trim() || id;
  const entry: Recent = { id, title, href: location.pathname, path: id };
  const recent = [entry, ...readRecent().filter((r) => r.id !== id)].slice(0, 8);
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(recent));
  } catch {
    // ignore
  }
}

function showRecent() {
  const recent = readRecent();
  render(
    recent.map((r) => ({ id: r.id, title: r.title, href: r.href, path: r.path })),
    'Type to search titles, tags, aliases and text.',
  );
}

function runQuery(query: string) {
  const { status } = elements();
  if (!query.trim()) {
    showRecent();
    return;
  }
  if (!engine) {
    if (status) status.textContent = failed ? 'The search index could not be loaded.' : 'Loading the search index…';
    return;
  }
  if (status) status.innerHTML = HINT;
  const hits = engine.search(query).slice(0, LIMIT);
  render(
    hits.map((hit) => ({
      id: String(hit.id),
      title: hit.title as string,
      href: hit.href as string,
      path: hit.path as string,
      snippet: snippet((hit.text as string) ?? '', hit.terms),
    })),
    `No notes match “${query}”.`,
  );
}

function selected(): HTMLElement | null {
  return elements().list?.querySelector<HTMLElement>('[role="option"][aria-selected="true"]') ?? null;
}

function move(delta: number) {
  const options = [...(elements().list?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
  if (options.length === 0) return;
  const current = options.findIndex((o) => o.getAttribute('aria-selected') === 'true');
  const next = (current + delta + options.length) % options.length;
  options.forEach((o, i) => o.setAttribute('aria-selected', String(i === next)));
  options[next].scrollIntoView({ block: 'nearest' });
}

function go(href: string | undefined) {
  if (!href) return;
  closeSearch();
  void navigate(href);
}

export function isSearchOpen() {
  return elements().dialog?.open ?? false;
}

export function openSearch() {
  const { dialog, input, status } = elements();
  if (!dialog || !input) return;
  if (!dialog.open) dialog.showModal();
  input.value = '';
  input.focus();
  showRecent();
  if (status) status.innerHTML = HINT;
  ensureIndex()
    .then(() => {
      if (status) status.innerHTML = HINT;
      runQuery(input.value);
    })
    .catch(() => {
      if (status) status.textContent = 'The search index could not be loaded.';
    });
}

export function closeSearch() {
  const { dialog } = elements();
  if (dialog?.open) dialog.close();
}

export function initSearch() {
  const isMac = /Mac|iPhone|iPad/.test(navigator.userAgent);
  document.addEventListener('astro:page-load', () => {
    for (const kbd of document.querySelectorAll('[data-shortcut]')) kbd.textContent = isMac ? '⌘K' : 'Ctrl K';
  });

  document.addEventListener('input', (event) => {
    if ((event.target as HTMLElement | null)?.id === 'search-input') runQuery((event.target as HTMLInputElement).value);
  });

  document.addEventListener('keydown', (event) => {
    if (!isSearchOpen()) return;
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      move(event.key === 'ArrowDown' ? 1 : -1);
    } else if (event.key === 'Enter') {
      event.preventDefault();
      go(selected()?.dataset.href);
    }
  });

  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement | null;
    const option = target?.closest<HTMLElement>('#search-results [role="option"]');
    if (option) {
      event.preventDefault();
      go(option.dataset.href);
      return;
    }
    // A click on the backdrop lands on the dialog element itself.
    const { dialog } = elements();
    if (dialog?.open && target === dialog) closeSearch();
  });
}
