const TREE_KEY = 'quire:tree';

function sidebar(): HTMLElement | null {
  return document.getElementById('sidebar');
}

function readOpenFolders(): Set<string> {
  try {
    const raw = localStorage.getItem(TREE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : []);
  } catch {
    return new Set();
  }
}

function persistOpenFolders() {
  const side = sidebar();
  if (!side) return;
  const open = [...side.querySelectorAll<HTMLDetailsElement>('details[data-folder][open]')].map(
    (details) => details.dataset.folder ?? '',
  );
  try {
    localStorage.setItem(TREE_KEY, JSON.stringify(open));
  } catch {
    // Storage unavailable: expansion simply is not remembered.
  }
}

/** Re-open the folders the reader had open last time. */
export function restoreTree() {
  const side = sidebar();
  if (!side) return;
  const open = readOpenFolders();
  for (const details of side.querySelectorAll<HTMLDetailsElement>('details[data-folder]')) {
    details.open = open.has(details.dataset.folder ?? '');
  }
}

/** Highlight the note being read, expand its ancestors, and keep it visible. Runs after every navigation. */
export function syncActive() {
  const side = sidebar();
  if (!side) return;
  for (const element of side.querySelectorAll('[aria-current]')) element.removeAttribute('aria-current');

  const here = location.pathname.replace(/\/+$/, '/');
  for (const link of side.querySelectorAll<HTMLAnchorElement>('[data-nav]')) {
    if (new URL(link.href).pathname.replace(/\/+$/, '/') === here) link.setAttribute('aria-current', 'page');
  }

  const id = document.querySelector('main')?.getAttribute('data-note-id');
  if (!id) return;
  const active = side.querySelector<HTMLAnchorElement>(`a[data-note-id="${CSS.escape(id)}"]`);
  if (!active) return;
  active.setAttribute('aria-current', 'page');

  let parent = active.parentElement;
  while (parent && parent !== side) {
    if (parent instanceof HTMLDetailsElement) parent.open = true;
    parent = parent.parentElement;
  }
  persistOpenFolders();

  const nav = side.querySelector('.sidebar-nav');
  if (nav) {
    const item = active.getBoundingClientRect();
    const box = nav.getBoundingClientRect();
    if (item.top < box.top || item.bottom > box.bottom) active.scrollIntoView({ block: 'center' });
  }
}

export function openDrawer() {
  document.body.dataset.sidebar = 'open';
  sidebar()?.querySelector<HTMLElement>('.sidebar-search')?.focus();
}

export function closeDrawer() {
  if (document.body.dataset.sidebar === undefined) return;
  delete document.body.dataset.sidebar;
}

export function isDrawerOpen() {
  return document.body.dataset.sidebar === 'open';
}

export function initSidebar() {
  restoreTree();
  // `toggle` does not bubble, so listen in the capture phase.
  document.addEventListener(
    'toggle',
    (event) => {
      const target = event.target;
      if (target instanceof HTMLDetailsElement && target.dataset.folder !== undefined) persistOpenFolders();
    },
    true,
  );
}
