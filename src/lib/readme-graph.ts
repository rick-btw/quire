/**
 * A static SVG picture of the whole graph for the README. Nodes are coloured by topic and sized by links,
 * and only topics are labelled, so it reads as a map of the library rather than a wall of titles.
 * The background is transparent; the caller picks a light or dark palette to match GitHub's theme.
 */
import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceX,
  forceY,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';
import type { GraphData, GraphNode } from './vault/types';

export interface SvgPalette {
  /** One colour per entry in `GraphData.topics`. */
  topics: string[];
  none: string;
  line: string;
}

export interface SvgOptions {
  width?: number;
  height?: number;
  title?: string;
}

interface Node extends SimulationNodeDatum, GraphNode {
  x: number;
  y: number;
}

const GOLDEN_ANGLE = 2.399963;
const PAD = 24;
const LABEL_SIZE = 13;

const radius = (node: { degree: number }) => Math.min(8, 2.5 + 1.1 * Math.sqrt(node.degree));
const round = (value: number) => Math.round(value * 10) / 10;

/** Whether the segment (x1, y1)–(x2, y2) passes through the box (Liang–Barsky clipping). */
function crosses(box: { l: number; r: number; t: number; b: number }, e: { x1: number; y1: number; x2: number; y2: number }) {
  let t0 = 0;
  let t1 = 1;
  const dx = e.x2 - e.x1;
  const dy = e.y2 - e.y1;
  for (const [p, q] of [
    [-dx, e.x1 - box.l],
    [dx, box.r - e.x1],
    [-dy, e.y1 - box.t],
    [dy, box.b - e.y1],
  ]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) t0 = Math.max(t0, t);
      else t1 = Math.min(t1, t);
      if (t0 > t1) return false;
    }
  }
  return true;
}
const escapeXml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' })[c] ?? c);

/** "data-structures" → "Data structures"; names with their own capitals ("CS50", "Operating Systems") stay. */
export function topicLabel(name: string): string {
  const spaced = name.replace(/[-_]+/g, ' ').trim();
  return spaced === spaced.toLowerCase() ? spaced.charAt(0).toUpperCase() + spaced.slice(1) : spaced;
}

/**
 * The custom properties of tokens.css for one theme, with `var()` references resolved:
 * `:root` first, then `html.dark` on top when `dark` is set.
 */
export function themeVars(css: string, dark: boolean): Map<string, string> {
  const source = css.replace(/\/\*[\s\S]*?\*\//g, '');
  const block = (selector: string) => {
    const at = source.indexOf(`${selector} {`);
    return at < 0 ? '' : source.slice(at, source.indexOf('}', at));
  };
  const vars = new Map<string, string>();
  for (const body of dark ? [block(':root'), block('html.dark')] : [block(':root')]) {
    for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) vars.set(name, value.trim());
  }
  const resolve = (value: string, depth = 0): string =>
    depth > 8 ? value : value.replace(/var\((--[\w-]+)\)/g, (_, name: string) => resolve(vars.get(name) ?? '', depth + 1));
  for (const [name, value] of vars) vars.set(name, resolve(value));
  return vars;
}

export function paletteFor(data: GraphData, vars: Map<string, string>): SvgPalette {
  return {
    topics: data.topics.map((topic) => vars.get(topic.colorVar) ?? ''),
    none: vars.get('--topic-none') ?? 'gray',
    line: vars.get('--graph-line') ?? 'gray',
  };
}

/** Runs the layout to rest. Same input, same picture: the start positions and d3's random source are fixed. */
function layout(data: GraphData): Node[] {
  const nodes: Node[] = data.nodes.map((node, i) => {
    const r = 30 * Math.sqrt(i + 1);
    return { ...node, x: Math.cos(i * GOLDEN_ANGLE) * r, y: Math.sin(i * GOLDEN_ANGLE) * r };
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const links = data.links
    .filter((link) => byId.has(link.source) && byId.has(link.target))
    .map((link): SimulationLinkDatum<Node> => ({ source: byId.get(link.source)!, target: byId.get(link.target)! }));
  // A stronger pull on y than on x lays the graph out wide, to suit a banner above the README table.
  forceSimulation<Node>(nodes)
    .force('link', forceLink<Node, SimulationLinkDatum<Node>>(links).distance(42).strength(0.5))
    .force('charge', forceManyBody<Node>().strength(-110).distanceMax(500))
    .force('x', forceX<Node>(0).strength(0.015))
    .force('y', forceY<Node>(0).strength(0.16))
    .force('collide', forceCollide<Node>((node) => radius(node) + 5))
    .stop()
    .tick(500);
  return nodes;
}

export function renderGraphSvg(data: GraphData, palette: SvgPalette, options: SvgOptions = {}): string {
  const width = options.width ?? 900;
  const height = options.height ?? 360;
  const nodes = layout(data);
  const byId = new Map(nodes.map((node) => [node.id, node]));

  // Fit the drawing into the frame, leaving headroom above for the topic labels.
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const node of nodes) {
    const r = radius(node);
    minX = Math.min(minX, node.x - r);
    minY = Math.min(minY, node.y - r);
    maxX = Math.max(maxX, node.x + r);
    maxY = Math.max(maxY, node.y + r);
  }
  const top = PAD + LABEL_SIZE + 8;
  const scale = Math.min((width - PAD * 2) / Math.max(maxX - minX, 1), (height - top - PAD) / Math.max(maxY - minY, 1), 3);
  const offX = (width - (maxX - minX) * scale) / 2 - minX * scale;
  const offY = top + (height - top - PAD - (maxY - minY) * scale) / 2 - minY * scale;
  const sx = (node: Node) => round(node.x * scale + offX);
  const sy = (node: Node) => round(node.y * scale + offY);

  const edges = data.links
    .map((link) => [byId.get(link.source), byId.get(link.target)])
    .filter((pair): pair is [Node, Node] => !!pair[0] && !!pair[1])
    .map(([a, b]) => ({ x1: sx(a), y1: sy(a), x2: sx(b), y2: sy(b) }));
  const path = edges.map((e) => `M${e.x1} ${e.y1}L${e.x2} ${e.y2}`).join('');

  const circles = [...nodes]
    .sort((a, b) => a.degree - b.degree)
    .map((node) => {
      const cls = node.topic >= 0 ? `t${node.topic}` : 'tn';
      return `<circle class="${cls}" cx="${sx(node)}" cy="${sy(node)}" r="${round(Math.max(2, radius(node) * Math.min(scale, 1.6)))}"/>`;
    })
    .join('');

  // One label per topic, biggest topics first. Each goes beside one of its own notes (above, below, right or
  // left), at the free spot closest to the topic's centre that touches no node, no other label and no edge.
  type Box = { l: number; r: number; t: number; b: number };
  const hits = (a: Box, b: Box) => a.l < b.r && a.r > b.l && a.t < b.b && a.b > b.t;
  const nodeBoxes: Box[] = nodes.map((node) => {
    const r = radius(node) * Math.min(scale, 1.6) + 2;
    return { l: sx(node) - r, r: sx(node) + r, t: sy(node) - r, b: sy(node) + r };
  });
  const placed: Box[] = [];
  const labels: string[] = [];
  const order = data.topics
    .map((topic, i) => ({ topic, i, members: nodes.filter((node) => node.topic === i) }))
    .filter((entry) => entry.members.length > 0)
    .sort((a, b) => b.members.length - a.members.length);
  for (const { topic, i, members } of order) {
    const text = topicLabel(topic.name);
    const w = text.length * LABEL_SIZE * 0.6;
    const cx = members.reduce((sum, node) => sum + sx(node), 0) / members.length;
    const cy = members.reduce((sum, node) => sum + sy(node), 0) / members.length;
    const candidates: { x: number; y: number }[] = [];
    // Big clusters also get a spot centred over the whole group.
    if (members.length >= 4) {
      candidates.push({ x: cx, y: Math.min(...members.map((node) => sy(node))) - 12 });
    }
    for (const node of members) {
      const r = radius(node) * Math.min(scale, 1.6);
      for (const gap of [6, 18]) {
        const above = sy(node) - r - gap;
        const below = sy(node) + r + LABEL_SIZE + gap - 3;
        const side = r + gap + w / 2;
        candidates.push(
          { x: sx(node), y: above },
          { x: sx(node), y: below },
          { x: sx(node) + side, y: sy(node) + LABEL_SIZE / 2 - 2 },
          { x: sx(node) - side, y: sy(node) + LABEL_SIZE / 2 - 2 },
          { x: sx(node) + w / 2, y: above },
          { x: sx(node) - w / 2, y: above },
          { x: sx(node) + w / 2, y: below },
          { x: sx(node) - w / 2, y: below },
        );
      }
    }
    const boxAt = ({ x, y }: { x: number; y: number }): Box => ({ l: x - w / 2 - 3, r: x + w / 2 + 3, t: y - LABEL_SIZE, b: y + 4 });
    const inside = (box: Box) => box.l >= 4 && box.r <= width - 4 && box.t >= 2 && box.b <= height - 2;
    // Stricter rules first: clear of everything, then allowed to cross edges, then only clear of other labels.
    const tiers = [
      (box: Box) => !nodeBoxes.some((o) => hits(box, o)) && !placed.some((o) => hits(box, o)) && !edges.some((e) => crosses(box, e)),
      (box: Box) => !nodeBoxes.some((o) => hits(box, o)) && !placed.some((o) => hits(box, o)),
      (box: Box) => !placed.some((o) => hits(box, o)),
    ];
    let pool = candidates;
    for (const ok of tiers) {
      const found = candidates.filter((spot) => inside(boxAt(spot)) && ok(boxAt(spot)));
      if (found.length > 0) {
        pool = found;
        break;
      }
    }
    const spot = pool.reduce((best, next) =>
      Math.hypot(next.x - cx, next.y - cy) < Math.hypot(best.x - cx, best.y - cy) ? next : best,
    );
    placed.push(boxAt(spot));
    labels.push(`<text class="t${i}" x="${round(spot.x)}" y="${round(spot.y)}">${escapeXml(text)}</text>`);
  }

  const title = options.title ?? `Graph of ${data.nodes.length} notes and ${data.links.length} links`;
  const colors = palette.topics.map((color, i) => `.t${i}{fill:${color}}`).join('');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" role="img" aria-labelledby="title">` +
    `<title id="title">${escapeXml(title)}</title>` +
    `<style>path{fill:none;stroke:${palette.line};stroke-width:1}${colors}.tn{fill:${palette.none}}` +
    `text{font:600 ${LABEL_SIZE}px system-ui,-apple-system,'Segoe UI',Helvetica,Arial,sans-serif;text-anchor:middle}</style>` +
    `<path d="${path}"/><g>${circles}</g><g>${labels.join('')}</g></svg>\n`
  );
}
