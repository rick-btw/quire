const KEY = 'quire:theme';

type Theme = 'light' | 'dark';

const media = matchMedia('(prefers-color-scheme: dark)');

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

export function currentTheme(): Theme {
  return stored() ?? (media.matches ? 'dark' : 'light');
}

/** Apply the effective theme to `<html>` and tell listeners (the graph re-reads its colours). */
export function applyTheme() {
  const theme = currentTheme();
  document.documentElement.classList.toggle('dark', theme === 'dark');
  document.dispatchEvent(new CustomEvent('quire:theme', { detail: theme }));
}

export function toggleTheme() {
  const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark';
  try {
    localStorage.setItem(KEY, next);
  } catch {
    // Private mode or storage disabled: the toggle still works for this page.
  }
  applyTheme();
}

export function initTheme() {
  applyTheme();
  media.addEventListener('change', () => {
    if (!stored()) applyTheme();
  });
  // The client router swaps <html> attributes, so the class must be re-applied after each navigation.
  document.addEventListener('astro:after-swap', applyTheme);
}
