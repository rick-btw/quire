import { navigate } from 'astro:transitions/client';
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum,
} from 'd3-force';

interface NodeData {
  id: string;
  title: string;
  href: string;
  topic: number;
  degree: number;
}

interface GraphData {
  nodes: NodeData[];
  links: { source: string; target: string }[];
  topics: { slug: string; name: string }[];
}

interface Node extends SimulationNodeDatum, NodeData {
  x: number;
  y: number;
}

interface Link extends SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
}

export interface GraphHandle {
  destroy(): void;
  fit(animate?: boolean): void;
  zoomBy(factor: number): void;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 6;
const GOLDEN_ANGLE = 2.399963;

function palette() {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string) => css.getPropertyValue(name).trim();
  return {
    topics: Array.from({ length: 8 }, (_, i) => read(`--topic-${i}`)),
    none: read('--topic-none'),
    line: read('--graph-line'),
    label: read('--graph-label'),
    text: read('--text'),
    accent: read('--accent'),
    font: read('--font-sans') || 'sans-serif',
  };
}

/** Mounts a force-directed graph on the canvas inside `container` (`[data-graph]`). */
export function mountGraph(container: HTMLElement): GraphHandle | undefined {
  const canvas = container.querySelector('canvas');
  const source = container.querySelector('script[data-graph-data]');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !source || !ctx) return undefined;

  const data = JSON.parse(source.textContent || '{"nodes":[],"links":[],"topics":[]}') as GraphData;
  const compact = container.hasAttribute('data-compact');
  const currentId = container.dataset.current;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let colors = palette();

  const spread = compact ? 18 : 34;
  const nodes: Node[] = data.nodes.map((node, i) => {
    const angle = i * GOLDEN_ANGLE;
    const r = node.id === currentId ? 0 : spread * Math.sqrt(i + 1);
    return { ...node, x: Math.cos(angle) * r, y: Math.sin(angle) * r };
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const links: Link[] = data.links
    .filter((link) => byId.has(link.source) && byId.has(link.target))
    .map((link) => ({ source: byId.get(link.source)!, target: byId.get(link.target)! }));
  const neighbours = new Map<string, Set<string>>();
  for (const link of links) {
    (neighbours.get(link.source.id) ?? neighbours.set(link.source.id, new Set()).get(link.source.id)!).add(link.target.id);
    (neighbours.get(link.target.id) ?? neighbours.set(link.target.id, new Set()).get(link.target.id)!).add(link.source.id);
  }

  const radius = (node: Node) => Math.min(9, 3 + 1.2 * Math.sqrt(node.degree)) * (compact ? 0.85 : 1);
  const simulation = forceSimulation<Node>(nodes)
    .force('link', forceLink<Node, Link>(links).distance(compact ? 44 : 90).strength(0.6))
    .force('charge', forceManyBody<Node>().strength(compact ? -100 : -320).distanceMax(600))
    .force('center', forceCenter<Node>(0, 0).strength(0.05))
    .force('collide', forceCollide<Node>((node) => radius(node) + (compact ? 6 : 14)))
    .velocityDecay(0.4)
    .stop();

  let width = 0;
  let height = 0;
  let dpr = 1;
  let k = 1;
  let tx = 0;
  let ty = 0;
  let hover: Node | null = null;
  let dragging: Node | null = null;
  let panning = false;
  let moved = false;
  let last = { x: 0, y: 0 };
  let raf = 0;
  let autoFit = true;
  let fitAnimation = 0;
  const controller = new AbortController();
  const { signal } = controller;

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(draw);
  };

  const toWorld = (px: number, py: number): [number, number] => [(px - width / 2 - tx) / k, (py - height / 2 - ty) / k];

  function resize() {
    const rect = container.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
    dpr = window.devicePixelRatio || 1;
    canvas!.width = Math.round(width * dpr);
    canvas!.height = Math.round(height * dpr);
    if (autoFit) fit(false);
    schedule();
  }

  function bounds() {
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
    return { minX, minY, maxX, maxY };
  }

  function fit(animate = !reduced) {
    if (nodes.length === 0 || width === 0) return;
    const { minX, minY, maxX, maxY } = bounds();
    const pad = compact ? 26 : 56;
    const bw = Math.max(maxX - minX, 1);
    const bh = Math.max(maxY - minY, 1);
    const targetK = Math.min(compact ? 2.2 : 2.6, Math.max(MIN_ZOOM, Math.min((width - pad * 2) / bw, (height - pad * 2) / bh)));
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const targetTx = -cx * targetK;
    const targetTy = -cy * targetK;
    cancelAnimationFrame(fitAnimation);
    if (!animate) {
      k = targetK;
      tx = targetTx;
      ty = targetTy;
      schedule();
      return;
    }
    const from = { k, tx, ty };
    const startedAt = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - startedAt) / 260);
      const ease = 1 - (1 - t) ** 3;
      k = from.k + (targetK - from.k) * ease;
      tx = from.tx + (targetTx - from.tx) * ease;
      ty = from.ty + (targetTy - from.ty) * ease;
      schedule();
      if (t < 1) fitAnimation = requestAnimationFrame(step);
    };
    fitAnimation = requestAnimationFrame(step);
  }

  function zoomBy(factor: number, px = width / 2, py = height / 2) {
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k * factor));
    const [wx, wy] = toWorld(px, py);
    tx = px - width / 2 - wx * next;
    ty = py - height / 2 - wy * next;
    k = next;
    autoFit = false;
    schedule();
  }

  function draw() {
    raf = 0;
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, width, height);
    ctx!.translate(width / 2 + tx, height / 2 + ty);
    ctx!.scale(k, k);

    const focus = dragging ?? hover;
    const focusSet = focus ? neighbours.get(focus.id) ?? new Set<string>() : null;
    const isActive = (node: Node) => node === focus || node.id === currentId;
    const isDim = (node: Node) => !!focus && !isActive(node) && !focusSet!.has(node.id);

    for (const link of links) {
      const lit = !!focus && (link.source === focus || link.target === focus);
      ctx!.globalAlpha = focus ? (lit ? 0.95 : 0.12) : 0.7;
      ctx!.strokeStyle = lit ? colors.accent : colors.line;
      ctx!.lineWidth = (lit ? 1.6 : 1) / k;
      ctx!.beginPath();
      ctx!.moveTo(link.source.x, link.source.y);
      ctx!.lineTo(link.target.x, link.target.y);
      ctx!.stroke();
    }

    for (const node of nodes) {
      const r = radius(node);
      const color = node.topic >= 0 ? colors.topics[node.topic % 8] : colors.none;
      ctx!.globalAlpha = isDim(node) ? 0.25 : 1;
      ctx!.beginPath();
      ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx!.fillStyle = color;
      ctx!.fill();
      if (isActive(node)) {
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, r + 4 / k, 0, Math.PI * 2);
        ctx!.strokeStyle = color;
        ctx!.globalAlpha = 0.4;
        ctx!.lineWidth = 2 / k;
        ctx!.stroke();
      }
    }

    const showAll = k > 1.4 || nodes.length < 80;
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'top';
    ctx!.font = `${(compact ? 10 : 11.5) / k}px ${colors.font}`;
    for (const node of nodes) {
      const active = isActive(node);
      const near = focusSet?.has(node.id) ?? false;
      if (!(showAll || active || near)) continue;
      ctx!.globalAlpha = isDim(node) ? 0.2 : active ? 1 : 0.85;
      ctx!.fillStyle = active ? colors.text : colors.label;
      const label = compact && node.title.length > 24 ? `${node.title.slice(0, 22)}…` : node.title;
      ctx!.fillText(label, node.x, node.y + radius(node) + 3 / k);
    }
    ctx!.globalAlpha = 1;
  }

  function nodeAt(px: number, py: number): Node | undefined {
    const [wx, wy] = toWorld(px, py);
    return simulation.find(wx, wy, 14 / k);
  }

  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      zoomBy(Math.exp(-event.deltaY * 0.0022), event.offsetX, event.offsetY);
    },
    { passive: false, signal },
  );

  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0) return;
      canvas.setPointerCapture(event.pointerId);
      autoFit = false;
      moved = false;
      last = { x: event.offsetX, y: event.offsetY };
      const node = nodeAt(event.offsetX, event.offsetY);
      if (node) {
        dragging = node;
        node.fx = node.x;
        node.fy = node.y;
        if (!reduced) simulation.alphaTarget(0.3).restart();
      } else {
        panning = true;
        canvas.classList.add('dragging');
      }
      schedule();
    },
    { signal },
  );

  canvas.addEventListener(
    'pointermove',
    (event) => {
      const dx = event.offsetX - last.x;
      const dy = event.offsetY - last.y;
      if (dragging) {
        const [wx, wy] = toWorld(event.offsetX, event.offsetY);
        dragging.fx = wx;
        dragging.fy = wy;
        if (Math.hypot(event.offsetX - last.x, event.offsetY - last.y) > 3) moved = true;
        if (reduced) simulation.tick(2);
        schedule();
        return;
      }
      if (panning) {
        tx += dx;
        ty += dy;
        last = { x: event.offsetX, y: event.offsetY };
        moved = true;
        schedule();
        return;
      }
      const next = nodeAt(event.offsetX, event.offsetY) ?? null;
      if (next !== hover) {
        hover = next;
        canvas.classList.toggle('pointing', !!hover);
        schedule();
      }
    },
    { signal },
  );

  const release = (event: PointerEvent) => {
    if (dragging) {
      const target = dragging;
      target.fx = null;
      target.fy = null;
      if (!reduced) simulation.alphaTarget(0);
      dragging = null;
      if (!moved && event.type === 'pointerup') void navigate(target.href);
    }
    panning = false;
    canvas.classList.remove('dragging');
    schedule();
  };
  canvas.addEventListener('pointerup', release, { signal });
  canvas.addEventListener('pointercancel', release, { signal });
  canvas.addEventListener(
    'pointerleave',
    () => {
      hover = null;
      canvas.classList.remove('pointing');
      schedule();
    },
    { signal },
  );

  document.addEventListener(
    'quire:theme',
    () => {
      colors = palette();
      schedule();
    },
    { signal },
  );

  const observer = new ResizeObserver(() => resize());
  observer.observe(container);
  resize();

  simulation.on('tick', () => {
    if (autoFit) fit(false);
    schedule();
  });
  if (reduced) {
    simulation.tick(300);
    fit(false);
  } else {
    simulation.alpha(1).restart();
    simulation.on('end', () => {
      autoFit = false;
    });
    setTimeout(() => {
      autoFit = false;
    }, 2500);
  }

  return {
    destroy() {
      controller.abort();
      observer.disconnect();
      simulation.stop();
      cancelAnimationFrame(raf);
      cancelAnimationFrame(fitAnimation);
    },
    fit,
    zoomBy: (factor) => zoomBy(factor),
  };
}

const instances = new Map<Element, GraphHandle>();

export function mountAllGraphs() {
  for (const container of document.querySelectorAll<HTMLElement>('[data-graph]')) {
    if (instances.has(container)) continue;
    const handle = mountGraph(container);
    if (handle) instances.set(container, handle);
  }
}

export function destroyAllGraphs() {
  for (const handle of instances.values()) handle.destroy();
  instances.clear();
}

/** Toolbar buttons inside a graph container. */
export function graphControl(action: string, from: HTMLElement) {
  const container = from.closest<HTMLElement>('[data-graph]');
  const handle = container ? instances.get(container) : undefined;
  if (!handle) return;
  if (action === 'graph-zoom-in') handle.zoomBy(1.35);
  else if (action === 'graph-zoom-out') handle.zoomBy(1 / 1.35);
  else if (action === 'graph-fit') handle.fit();
}
