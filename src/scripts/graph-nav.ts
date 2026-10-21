/** Pure helpers behind graph navigation: camera flights, arrow-key hops, the find box, and label fading. */

/** A camera view: the world point at the centre of the screen and how many world units fit across it. */
export interface View {
  x: number;
  y: number;
  w: number;
}

export interface Flight {
  /** The view at `t` in [0, 1]. */
  at(t: number): View;
  /** Suggested length of the flight in milliseconds. */
  duration: number;
}

// How far the camera pulls back while travelling; √2 is the usual default, lower stays closer to the ground.
const RHO = 1.25;

/**
 * Smooth zoom-and-pan between two views (van Wijk & Nuij, "Smooth and efficient zooming and panning", 2003):
 * long hops zoom out on the way so the destination comes into view before the camera arrives.
 */
export function smoothZoom(from: View, to: View): Flight {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const d2 = dx * dx + dy * dy;
  let at: (t: number) => View;
  let s: number;
  if (d2 < 1e-12) {
    s = Math.log(to.w / from.w) / RHO;
    at = (t) => ({ x: from.x + dx * t, y: from.y + dy * t, w: from.w * Math.exp(RHO * s * t) });
  } else {
    const d = Math.sqrt(d2);
    const rho2 = RHO * RHO;
    const b0 = (to.w * to.w - from.w * from.w + rho2 * rho2 * d2) / (2 * from.w * rho2 * d);
    const b1 = (to.w * to.w - from.w * from.w - rho2 * rho2 * d2) / (2 * to.w * rho2 * d);
    const r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
    const r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
    s = (r1 - r0) / RHO;
    at = (t) => {
      if (t >= 1) return { ...to };
      const r = RHO * s * t + r0;
      const u = (from.w / (rho2 * d)) * (Math.cosh(r0) * Math.tanh(r) - Math.sinh(r0));
      return { x: from.x + dx * u, y: from.y + dy * u, w: (from.w * Math.cosh(r0)) / Math.cosh(r) };
    };
  }
  return { at, duration: Math.min(1100, Math.max(320, Math.abs(s) * 420)) };
}

/**
 * The candidate an arrow key should hop to from `from`: the closest one roughly in direction `dir`,
 * where straying off the axis costs as much as being further away. Undefined when nothing lies that way.
 */
export function neighbourInDirection<T extends { x: number; y: number }>(
  from: { x: number; y: number },
  candidates: readonly T[],
  dir: { x: number; y: number },
): T | undefined {
  const len = Math.hypot(dir.x, dir.y) || 1;
  let best: T | undefined;
  let bestScore = Infinity;
  for (const candidate of candidates) {
    const vx = candidate.x - from.x;
    const vy = candidate.y - from.y;
    const dist = Math.hypot(vx, vy);
    if (dist < 1e-9) continue;
    const cos = (vx * dir.x + vy * dir.y) / (dist * len);
    if (cos < 0.35) continue;
    const score = dist * (1 + 3 * (1 - cos));
    if (score < bestScore) {
      bestScore = score;
      best = candidate;
    }
  }
  return best;
}

const fold = (value: string) =>
  value
    .normalize('NFKC')
    .replace(/[يى]/g, 'ی') // Arabic yeh / alef maksura → Persian yeh
    .replace(/ك/g, 'ک') // Arabic kaf → Persian keheh
    .toLocaleLowerCase();

/**
 * Titles matching `query`, best first: the whole title, then titles that start with it, then a word that
 * starts with it, then anywhere inside. Shorter titles win ties.
 */
export function matchNodes<T extends { title: string }>(nodes: readonly T[], query: string, limit = 8): T[] {
  const q = fold(query.trim());
  if (!q) return [];
  const ranked: { node: T; rank: number }[] = [];
  for (const node of nodes) {
    const title = fold(node.title);
    const at = title.indexOf(q);
    if (at < 0) continue;
    const rank = title === q ? 0 : at === 0 ? 1 : /[\s\-_/(.,:]/.test(title[at - 1]) ? 2 : 3;
    ranked.push({ node, rank });
  }
  ranked.sort((a, b) => a.rank - b.rank || a.node.title.length - b.node.title.length);
  return ranked.slice(0, limit).map((entry) => entry.node);
}

const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
};

/**
 * Opacity of a node's label at zoom `k`. Labels fade in as the reader zooms in, well-linked notes first;
 * small graphs show them sooner because there is room for them.
 */
export function labelOpacity(k: number, degree: number, count: number): number {
  const full = count < 80 ? 0.5 : 1.3;
  const reach = k * (1 + 0.3 * Math.sqrt(degree));
  return smoothstep(full * 0.55, full, reach);
}
