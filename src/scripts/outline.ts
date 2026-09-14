let observer: IntersectionObserver | null = null;

/** Highlight the outline entry for the heading currently in view. */
export function mountOutline() {
  unmountOutline();
  const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-outline] a')];
  if (links.length === 0) return;
  const byId = new Map<string, HTMLAnchorElement>();
  for (const link of links) {
    const href = link.getAttribute('href') ?? '';
    if (href.startsWith('#')) byId.set(decodeURIComponent(href.slice(1)), link);
  }
  const headings = [...byId.keys()].map((id) => document.getElementById(id)).filter((el): el is HTMLElement => !!el);
  if (headings.length === 0) return;

  const visible = new Set<Element>();
  const update = () => {
    let current: HTMLElement | undefined = headings.find((h) => visible.has(h));
    if (!current) {
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top < 120) current = heading;
        else break;
      }
    }
    for (const link of links) link.removeAttribute('aria-current');
    if (current) byId.get(current.id)?.setAttribute('aria-current', 'true');
  };

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target);
        else visible.delete(entry.target);
      }
      update();
    },
    { rootMargin: '-10% 0px -70% 0px', threshold: 0 },
  );
  for (const heading of headings) observer.observe(heading);
  update();
}

export function unmountOutline() {
  observer?.disconnect();
  observer = null;
}
