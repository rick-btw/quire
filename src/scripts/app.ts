/**
 * Single client entry. Runs once per full page load; the client router keeps it alive across
 * navigations, so everything is wired through delegation and Astro's lifecycle events.
 */
import { destroyAllGraphs, graphControl, mountAllGraphs } from './graph';
import { mountOutline, unmountOutline } from './outline';
import { closeSearch, initSearch, isSearchOpen, openSearch, recordVisit } from './search';
import { closeDrawer, initSidebar, isDrawerOpen, openDrawer, syncActive } from './sidebar';
import { initTheme, toggleTheme } from './theme';

initTheme();
initSidebar();
initSearch();

function isTyping(target: EventTarget | null) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
  );
}

document.addEventListener('click', (event) => {
  const trigger = (event.target as HTMLElement | null)?.closest<HTMLElement>('[data-action]');
  if (!trigger) return;
  const action = trigger.dataset.action ?? '';
  switch (action) {
    case 'theme':
      toggleTheme();
      break;
    case 'search':
      openSearch();
      break;
    case 'sidebar':
      openDrawer();
      break;
    case 'sidebar-close':
      closeDrawer();
      break;
    case 'graph-zoom-in':
    case 'graph-zoom-out':
    case 'graph-fit':
      graphControl(action, trigger);
      break;
    default:
      return;
  }
  event.preventDefault();
});

document.addEventListener('keydown', (event) => {
  const mod = event.metaKey || event.ctrlKey;
  if (mod && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    if (isSearchOpen()) closeSearch();
    else openSearch();
    return;
  }
  if (event.key === 'Escape' && isDrawerOpen()) {
    closeDrawer();
    return;
  }
  if (event.key === '/' && !mod && !isSearchOpen() && !isTyping(event.target)) {
    event.preventDefault();
    openSearch();
  }
});

document.addEventListener('astro:page-load', () => {
  closeDrawer();
  syncActive();
  recordVisit();
  mountOutline();
  mountAllGraphs();
});

document.addEventListener('astro:before-swap', () => {
  unmountOutline();
  destroyAllGraphs();
});
