/**
 * Fullscreen graph. The `[data-graph]` container moves into a modal dialog that fills the window (canvas,
 * listeners and simulation travel with it), grows out of its old spot, and gains a find box, a topic legend and a
 * card for the focused note. Closing shrinks it back into a placeholder that held its place in the page.
 */
import { navigate } from 'astro:transitions/client';
import { graphFor, type GraphHandle, type NodeData } from './graph';
import { matchNodes } from './graph-nav';

interface Session {
  container: HTMLElement;
  handle: GraphHandle;
  dialog: HTMLDialogElement;
  placeholder: HTMLElement;
  controller: AbortController;
  unsubscribe: () => void;
  byId: Map<string, NodeData>;
  /** Notes hopped away from, most recent last, for the card's Back button. */
  history: string[];
  previous: string | null;
  goingBack: boolean;
  pinnedTopic: number | null;
  results: NodeData[];
  active: number;
  finish: (() => void) | null;
}

const DURATION = 320;
const EASING = 'cubic-bezier(0.2, 0.8, 0.2, 1)';
const RESULTS = 8;

let session: Session | null = null;
// When the last Escape keydown was handled, so the dialog's own cancel event doesn't act on it twice.
let escapeAt = -Infinity;

const reduced = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
const narrow = () => matchMedia('(max-width: 640px)').matches;
// Room the find bar (top) and the legend and controls (bottom) take, kept clear when fitting or focusing.
const chromeInsets = () => ({ top: 52, right: 0, bottom: narrow() ? 96 : 52, left: 0 });

export const isGraphFullscreen = () => session !== null;

/** The clip that shows only `rect` of a dialog covering `full`. */
function clipTo(rect: DOMRect, full: DOMRect) {
  const top = rect.top - full.top;
  const left = rect.left - full.left;
  return `inset(${top}px ${full.right - rect.right}px ${full.bottom - rect.bottom}px ${left}px round 7px)`;
}

const centreShift = (from: DOMRect, to: DOMRect) => ({
  x: from.left + from.width / 2 - (to.left + to.width / 2),
  y: from.top + from.height / 2 - (to.top + to.height / 2),
});

function part<T extends HTMLElement = HTMLElement>(s: Session, selector: string): T | null {
  return s.container.querySelector<T>(selector);
}

function swatch(topic: number, s: Session) {
  const span = document.createElement('span');
  span.className = 'swatch';
  span.style.setProperty('--swatch', `var(${s.handle.data.topics[topic]?.colorVar ?? '--topic-none'})`);
  return span;
}

function nodeButton(node: NodeData, s: Session, tag: 'button' | 'li') {
  const item = document.createElement(tag);
  item.dataset.nodeId = node.id;
  if (tag === 'button') item.setAttribute('type', 'button');
  const title = document.createElement('span');
  title.dir = 'auto';
  title.textContent = node.title;
  item.append(swatch(node.topic, s), title);
  return item;
}

function renderCard(s: Session, id: string | null) {
  const card = part(s, '[data-graph-card]');
  if (!card) return;
  const node = id ? s.byId.get(id) : undefined;
  if (!node) {
    card.hidden = true;
    s.handle.setInsets(chromeInsets());
    return;
  }
  const topic = s.handle.data.topics[node.topic];
  part(s, '[data-card-swatch]')?.style.setProperty('--swatch', `var(${topic?.colorVar ?? '--topic-none'})`);
  part(s, '[data-card-topic]')!.textContent = topic?.name ?? 'Unfiled';
  part(s, '[data-card-title]')!.textContent = node.title;
  const linked = s.handle.neighbours(node.id).sort((a, b) => a.title.localeCompare(b.title));
  part(s, '[data-card-meta]')!.textContent =
    linked.length === 0 ? 'No links yet' : linked.length === 1 ? '1 linked note' : `${linked.length} linked notes`;
  part(s, '[data-card-links]')!.replaceChildren(
    ...linked.map((other) => {
      const li = document.createElement('li');
      li.append(nodeButton(other, s, 'button'));
      return li;
    }),
  );
  part<HTMLAnchorElement>(s, '[data-card-open]')!.href = node.href;
  const back = part(s, '[data-graph-back]')!;
  const previous = s.byId.get(s.history[s.history.length - 1] ?? '');
  back.hidden = !previous;
  back.setAttribute('aria-label', previous ? `Back to ${previous.title}` : 'Back');
  back.title = previous ? `Back to ${previous.title}` : '';
  card.hidden = false;
  // Keep the focused node clear of the card: beside it on wide screens, above it as a bottom sheet on phones.
  if (narrow()) s.handle.setInsets({ ...chromeInsets(), bottom: card.offsetHeight + 12 });
  else s.handle.setInsets({ ...chromeInsets(), right: card.offsetWidth + 24 });
}

function updateFind(s: Session) {
  const input = part<HTMLInputElement>(s, '[data-find-input]');
  const list = part(s, '[data-find-results]');
  if (!input || !list) return;
  const query = input.value.trim();
  const all = query ? matchNodes(s.handle.data.nodes, query, Infinity) : [];
  s.results = all.slice(0, RESULTS);
  s.active = 0;
  s.handle.setEmphasis({ matches: query ? new Set(all.map((node) => node.id)) : null });
  list.hidden = !query;
  input.setAttribute('aria-expanded', String(!!query));
  if (query && s.results.length === 0) {
    const empty = document.createElement('li');
    empty.className = 'graph-find-empty';
    empty.textContent = 'No matching notes';
    list.replaceChildren(empty);
    return;
  }
  list.replaceChildren(
    ...s.results.map((node, i) => {
      const item = nodeButton(node, s, 'li');
      item.setAttribute('role', 'option');
      item.setAttribute('aria-selected', String(i === s.active));
      return item;
    }),
  );
}

function moveActive(s: Session, by: number) {
  if (s.results.length === 0) return;
  s.active = (s.active + by + s.results.length) % s.results.length;
  part(s, '[data-find-results]')
    ?.querySelectorAll('[role="option"]')
    .forEach((item, i) => item.setAttribute('aria-selected', String(i === s.active)));
}

function clearFind(s: Session) {
  const input = part<HTMLInputElement>(s, '[data-find-input]');
  if (input) input.value = '';
  updateFind(s);
}

function chooseResult(s: Session, id: string) {
  clearFind(s);
  s.container.focus({ preventScroll: true });
  s.handle.select(id);
}

function goBack(s: Session) {
  const id = s.history.pop();
  if (!id) return;
  s.goingBack = true;
  s.handle.select(id);
  s.goingBack = false;
}

function setPinnedTopic(s: Session, topic: number | null) {
  s.pinnedTopic = topic;
  s.container.querySelectorAll<HTMLElement>('[data-topic]').forEach((button) => {
    button.setAttribute('aria-pressed', String(Number(button.dataset.topic) === topic));
  });
  s.handle.setEmphasis({ topic });
}

function wire(s: Session) {
  const { signal } = s.controller;
  const { container, dialog } = s;

  dialog.addEventListener(
    'cancel',
    (event) => {
      event.preventDefault();
      if (performance.now() - escapeAt > 100) closeGraphFullscreen();
    },
    { signal },
  );
  // Some browsers close a modal outright after repeated Escapes; tidy up rather than leave the page broken.
  dialog.addEventListener('close', () => closeGraphFullscreen(true), { signal });

  part(s, '[data-find-input]')?.addEventListener('input', () => updateFind(s), { signal });

  container.addEventListener(
    'click',
    (event) => {
      const target = event.target as HTMLElement;
      const nodeItem = target.closest<HTMLElement>('[data-node-id]');
      if (nodeItem) {
        const id = nodeItem.dataset.nodeId!;
        if (nodeItem.closest('[data-find-results]')) chooseResult(s, id);
        else s.handle.select(id);
        return;
      }
      if (target.closest('[data-graph-back]')) goBack(s);
      else if (target.closest('[data-graph-deselect]')) s.handle.select(null, false);
      else {
        const legend = target.closest<HTMLElement>('[data-topic]');
        if (legend) {
          const topic = Number(legend.dataset.topic);
          setPinnedTopic(s, s.pinnedTopic === topic ? null : topic);
        }
      }
    },
    { signal },
  );

  // Hovering a legend entry previews its topic; leaving it falls back to the pinned one.
  for (const button of container.querySelectorAll<HTMLElement>('[data-topic]')) {
    button.addEventListener('pointerenter', () => s.handle.setEmphasis({ topic: Number(button.dataset.topic) }), {
      signal,
    });
    button.addEventListener('pointerleave', () => s.handle.setEmphasis({ topic: s.pinnedTopic }), { signal });
  }
}

export function openGraphFullscreen(container: HTMLElement) {
  if (session) return;
  const handle = graphFor(container);
  if (!handle) return;

  const from = container.getBoundingClientRect();
  const placeholder = document.createElement('div');
  placeholder.className = 'graph-placeholder';
  placeholder.style.height = `${from.height}px`;
  container.before(placeholder);

  const dialog = document.createElement('dialog');
  dialog.className = 'graph-dialog';
  dialog.setAttribute('aria-label', container.querySelector('canvas')?.getAttribute('aria-label') ?? 'Graph');
  document.body.append(dialog);
  dialog.append(container);
  container.setAttribute('data-fullscreen', '');
  document.documentElement.classList.add('graph-fullscreen-open');
  dialog.showModal();
  container.focus({ preventScroll: true });

  const full = dialog.getBoundingClientRect();
  // Keep every node where it was on screen; the fit below then eases the graph into the bigger frame.
  handle.relayout(centreShift(from, full));

  const s: Session = {
    container,
    handle,
    dialog,
    placeholder,
    controller: new AbortController(),
    unsubscribe: () => {},
    byId: new Map(handle.data.nodes.map((node) => [node.id, node])),
    history: [],
    previous: null,
    goingBack: false,
    pinnedTopic: null,
    results: [],
    active: 0,
    finish: null,
  };
  session = s;
  wire(s);
  s.unsubscribe = handle.onSelect((id) => {
    if (!s.goingBack && s.previous && id && id !== s.previous) {
      s.history.push(s.previous);
      if (s.history.length > 50) s.history.shift();
    }
    if (!id) s.history = [];
    s.previous = id;
    renderCard(s, id);
  });

  handle.setInsets(chromeInsets());
  // Opened from a note's panel: start focused on that note.
  const current = container.dataset.current;
  if (current) handle.select(current, false);
  handle.fit();

  if (!reduced()) {
    container.animate([{ clipPath: clipTo(from, full) }, { clipPath: 'inset(0px 0px 0px 0px round 0px)' }], {
      duration: DURATION,
      easing: EASING,
    });
    try {
      dialog.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURATION, pseudoElement: '::backdrop' });
    } catch {
      // No pseudo-element animations: the backdrop simply appears.
    }
  }
}

/** Shrink the graph back into the page. `immediate` skips the animation (used before navigating away). */
export function closeGraphFullscreen(immediate = false) {
  const s = session;
  if (!s) return;
  if (s.finish) {
    if (immediate) s.finish();
    return;
  }

  s.handle.select(null, false);
  s.handle.setEmphasis({ matches: null, topic: null });
  s.handle.setInsets({ top: 0, right: 0, bottom: 0, left: 0 });
  s.container.removeAttribute('data-fullscreen');

  const full = s.dialog.getBoundingClientRect();
  const to = s.placeholder.getBoundingClientRect();
  const animations: Animation[] = [];

  s.finish = () => {
    if (session !== s) return;
    session = null;
    s.controller.abort();
    s.unsubscribe();
    s.placeholder.replaceWith(s.container);
    for (const animation of animations) animation.cancel();
    s.dialog.close();
    s.dialog.remove();
    document.documentElement.classList.remove('graph-fullscreen-open');
    s.handle.relayout(centreShift(full, s.container.getBoundingClientRect()));
  };

  if (immediate || reduced()) {
    s.finish();
    if (!immediate) s.handle.fit(false);
    return;
  }
  // Fit into the placeholder's spot while the clip closes in on it, so the swap back is invisible.
  s.handle.fit(true, { x: to.left - full.left, y: to.top - full.top, width: to.width, height: to.height });
  const clip = s.container.animate([{ clipPath: 'inset(0px 0px 0px 0px round 0px)' }, { clipPath: clipTo(to, full) }], {
    duration: DURATION,
    easing: EASING,
    fill: 'forwards',
  });
  animations.push(clip);
  try {
    animations.push(
      s.dialog.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: DURATION,
        easing: EASING,
        fill: 'forwards',
        pseudoElement: '::backdrop',
      }),
    );
  } catch {
    // No pseudo-element animations: the backdrop disappears at the end.
  }
  clip.finished.then(
    () => s.finish?.(),
    () => s.finish?.(),
  );
}

export function toggleGraphFullscreen(container: HTMLElement | null) {
  if (session) closeGraphFullscreen();
  else if (container) openGraphFullscreen(container);
}

/** The graph a bare `F` opens: the full graph if the page has one, otherwise the note's local graph. */
export function pageGraph(): HTMLElement | null {
  return (
    document.querySelector<HTMLElement>('[data-graph]:not([data-compact])') ??
    document.querySelector<HTMLElement>('[data-graph]')
  );
}

const DIRECTIONS: Record<string, { x: number; y: number }> = {
  ArrowUp: { x: 0, y: -1 },
  ArrowDown: { x: 0, y: 1 },
  ArrowLeft: { x: -1, y: 0 },
  ArrowRight: { x: 1, y: 0 },
};

/** Keyboard handling while fullscreen; returns true when the key was used. */
export function handleGraphKey(event: KeyboardEvent): boolean {
  const s = session;
  if (!s || s.finish) return false;
  const target = event.target as Node | null;
  if (target !== document.body && !(target && s.dialog.contains(target))) return false;
  const input = part<HTMLInputElement>(s, '[data-find-input]');
  const typing = !!input && target === input;

  if (event.key === 'Escape') {
    event.preventDefault();
    escapeAt = performance.now();
    if (input?.value) clearFind(s);
    else if (typing) s.container.focus({ preventScroll: true });
    else if (s.handle.selected()) s.handle.select(null, false);
    else if (s.pinnedTopic !== null) setPinnedTopic(s, null);
    else closeGraphFullscreen();
    return true;
  }

  if (typing) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      moveActive(s, event.key === 'ArrowDown' ? 1 : -1);
      return true;
    }
    if (event.key === 'Enter') {
      event.preventDefault();
      const chosen = s.results[s.active];
      if (chosen) chooseResult(s, chosen.id);
      return true;
    }
    return false;
  }

  if (event.metaKey || event.ctrlKey || event.altKey) return false;
  const onControl = target instanceof HTMLElement && target.closest('button, a, input') !== null;
  const dir = DIRECTIONS[event.key];
  if (dir) {
    if (s.handle.selected()) s.handle.hop(dir);
    else s.handle.panBy(dir.x * 160, dir.y * 160);
  } else {
    switch (event.key) {
      case '/':
        input?.focus();
        break;
      case 'f':
      case 'F':
        closeGraphFullscreen();
        break;
      case '+':
      case '=':
        s.handle.zoomBy(1.35);
        break;
      case '-':
      case '_':
        s.handle.zoomBy(1 / 1.35);
        break;
      case '0':
        s.handle.fit();
        break;
      case 'Enter': {
        if (onControl) return false;
        const id = s.handle.selected();
        const node = id ? s.byId.get(id) : undefined;
        if (!node) return false;
        void navigate(node.href);
        break;
      }
      case 'Backspace':
        goBack(s);
        break;
      default:
        return false;
    }
  }
  event.preventDefault();
  return true;
}
