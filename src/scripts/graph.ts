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
import { labelOpacity, neighbourInDirection, smoothZoom, type View } from './graph-nav';

export interface NodeData {
  id: string;
  title: string;
  href: string;
  topic: number;
  degree: number;
}

export interface GraphData {
  nodes: NodeData[];
  links: { source: string; target: string }[];
  topics: { slug: string; name: string; colorVar: string }[];
}

interface Node extends SimulationNodeDatum, NodeData {
  x: number;
  y: number;
  /** Drawn opacity, focus ring and label opacity; each eases toward its target every frame. */
  shade: number;
  ring: number;
  label: number;
  /** This frame's emphasis: true or false while something is highlighted, null when nothing is. */
  on: boolean | null;
}

interface Link extends SimulationLinkDatum<Node> {
  source: Node;
  target: Node;
  shade: number;
  lit: number;
}

/** What the graph highlights when no node has focus: matches from the find box, or one topic (-1 = unfiled). */
export interface Emphasis {
  matches?: ReadonlySet<string> | null;
  topic?: number | null;
}

/** Screen space covered by floating panels, so focusing a node keeps it in the visible part. */
export interface Insets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

/** A rectangle in the container's own pixels. */
export interface Frame {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface GraphHandle {
  readonly data: GraphData;
  destroy(): void;
  fit(animate?: boolean, frame?: Frame): void;
  zoomBy(factor: number): void;
  panBy(dx: number, dy: number): void;
  select(id: string | null, fly?: boolean): void;
  selected(): string | null;
  /** Select the linked note lying in screen direction `dir` from the selected one; false if there is none. */
  hop(dir: { x: number; y: number }): boolean;
  neighbours(id: string): NodeData[];
  setEmphasis(emphasis: Emphasis): void;
  setInsets(insets: Partial<Insets>): void;
  onSelect(listener: (id: string | null) => void): () => void;
  /** Re-measure the container now (after it moves), then shift the view by `shift` screen pixels. */
  relayout(shift?: { x: number; y: number }): void;
}

const MIN_ZOOM = 0.2;
const MAX_ZOOM = 6;
const GOLDEN_ANGLE = 2.399963;
const FADE_MS = 90;
const GLIDE_MS = 325;
const DOUBLE_TAP_MS = 350;
const NO_NEIGHBOURS: ReadonlySet<string> = new Set();

const easeOut = (t: number) => 1 - (1 - t) ** 3;
const easeInOut = (t: number) => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2);
const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

function palette(topics: GraphData['topics']) {
  const css = getComputedStyle(document.documentElement);
  const read = (name: string) => css.getPropertyValue(name).trim();
  return {
    topics: topics.map((topic) => read(topic.colorVar)),
    none: read('--topic-none'),
    line: read('--graph-line'),
    label: read('--graph-label'),
    text: read('--text'),
    accent: read('--accent'),
    bg: read('--bg'),
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
  let colors = palette(data.topics);

  const spread = compact ? 18 : 34;
  const nodes: Node[] = data.nodes.map((node, i) => {
    const angle = i * GOLDEN_ANGLE;
    const r = node.id === currentId ? 0 : spread * Math.sqrt(i + 1);
    return { ...node, x: Math.cos(angle) * r, y: Math.sin(angle) * r, shade: 1, ring: 0, label: 0, on: null };
  });
  const byId = new Map(nodes.map((node) => [node.id, node]));
  const links: Link[] = data.links
    .filter((link) => byId.has(link.source) && byId.has(link.target))
    .map((link) => ({ source: byId.get(link.source)!, target: byId.get(link.target)!, shade: 0.7, lit: 0 }));
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

  // The compact panel graph draws like the full one while it is fullscreen; its layout forces stay put.
  const small = () => compact && !container.hasAttribute('data-fullscreen');

  let width = 0;
  let height = 0;
  let dpr = 1;
  let k = 1;
  let tx = 0;
  let ty = 0;
  let hover: Node | null = null;
  let selected: Node | null = null;
  let dragging: Node | null = null;
  let panning = false;
  let moved = false;
  let down = { x: 0, y: 0 };
  let last = { x: 0, y: 0 };
  let raf = 0;
  let lastFrame = 0;
  let primed = false;
  let autoFit = true;
  // Set by a fit made while the layout is still spreading out: keep fitting once the camera gets there.
  let followAfterFlight = false;
  let emphasis: Required<Emphasis> = { matches: null, topic: null };
  let insets: Insets = { top: 0, right: 0, bottom: 0, left: 0 };
  // Camera motion: a timed flight (fit, fly-to, keyboard pan), a smoothed wheel zoom, or a momentum glide.
  let flight: { at: (t: number) => View; start: number; duration: number; ease: (t: number) => number } | null = null;
  let zoomGoal: { k: number; x: number; y: number } | null = null;
  let glide: { vx: number; vy: number } | null = null;
  let samples: { x: number; y: number; t: number }[] = [];
  const pointers = new Map<number, { x: number; y: number }>();
  let pinch: { dist: number; x: number; y: number } | null = null;
  let lastTap: { node: Node; x: number; y: number; time: number } | null = null;
  const selectListeners = new Set<(id: string | null) => void>();
  // Label widths in screen pixels, measured once per font size (and again once the web font has loaded).
  const labelWidths = new Map<Node, number>();
  let measuredAt = 0;
  const controller = new AbortController();
  const { signal } = controller;
  void document.fonts?.ready.then(() => {
    labelWidths.clear();
    schedule();
  });

  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };

  const toWorld = (px: number, py: number): [number, number] => [(px - width / 2 - tx) / k, (py - height / 2 - ty) / k];
  const view = (): View => ({ x: -tx / k, y: -ty / k, w: width / k });
  const setView = (next: View) => {
    k = width / next.w;
    tx = -next.x * k;
    ty = -next.y * k;
  };

  function stopMotion() {
    flight = null;
    followAfterFlight = false;
    zoomGoal = null;
    glide = null;
  }

  function animateTo(target: View, mode: 'fly' | 'ease', duration?: number) {
    stopMotion();
    if (reduced || width === 0) {
      setView(target);
      schedule();
      return;
    }
    const from = view();
    if (mode === 'fly') {
      const path = smoothZoom(from, target);
      flight = { at: path.at, start: performance.now(), duration: duration ?? path.duration, ease: easeInOut };
    } else {
      flight = {
        at: (t) => ({
          x: from.x + (target.x - from.x) * t,
          y: from.y + (target.y - from.y) * t,
          w: from.w * (target.w / from.w) ** t,
        }),
        start: performance.now(),
        duration: duration ?? 300,
        ease: easeOut,
      };
    }
    schedule();
  }

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

  /** The view that fits every node inside `frame`, which defaults to the area left clear by the insets. */
  function fitView(frame?: Frame): View | undefined {
    if (nodes.length === 0 || width === 0) return undefined;
    const box = frame ?? {
      x: insets.left,
      y: insets.top,
      width: width - insets.left - insets.right,
      height: height - insets.top - insets.bottom,
    };
    const { minX, minY, maxX, maxY } = bounds();
    const pad = small() ? 26 : 56;
    const bw = Math.max(maxX - minX, 1);
    const bh = Math.max(maxY - minY, 1);
    const targetK = Math.min(
      small() ? 2.2 : 2.6,
      Math.max(MIN_ZOOM, Math.min((box.width - pad * 2) / bw, (box.height - pad * 2) / bh)),
    );
    const offX = box.x + box.width / 2 - width / 2;
    const offY = box.y + box.height / 2 - height / 2;
    return { x: (minX + maxX) / 2 - offX / targetK, y: (minY + maxY) / 2 - offY / targetK, w: width / targetK };
  }

  function fit(animate = !reduced, frame?: Frame) {
    const target = fitView(frame);
    if (!target) return;
    const settling = !frame && simulation.alpha() > simulation.alphaMin();
    if (animate) {
      animateTo(target, 'ease');
      followAfterFlight = settling;
    } else {
      stopMotion();
      setView(target);
      if (settling) autoFit = true;
      schedule();
    }
  }

  /** Zoom by `factor` keeping the screen point (px, py) still. Moves the camera only; callers schedule. */
  function zoomAt(factor: number, px: number, py: number) {
    const next = clampZoom(k * factor);
    const [wx, wy] = toWorld(px, py);
    tx = px - width / 2 - wx * next;
    ty = py - height / 2 - wy * next;
    k = next;
  }

  function zoomBy(factor: number) {
    autoFit = false;
    const current = view();
    animateTo({ ...current, w: width / clampZoom(k * factor) }, 'ease', 220);
  }

  function panBy(dx: number, dy: number) {
    autoFit = false;
    const current = view();
    animateTo({ x: current.x + dx / k, y: current.y + dy / k, w: current.w }, 'ease', 220);
  }

  function flyTo(node: Node) {
    autoFit = false;
    const nextK = Math.min(2.4, Math.max(1.3, k));
    const ox = (insets.left - insets.right) / 2;
    const oy = (insets.top - insets.bottom) / 2;
    animateTo({ x: node.x - ox / nextK, y: node.y - oy / nextK, w: width / nextK }, 'fly');
  }

  function select(id: string | null, fly = true) {
    const node = (id && byId.get(id)) || null;
    if (node !== selected) {
      selected = node;
      for (const listener of selectListeners) listener(node?.id ?? null);
    }
    if (node && fly) flyTo(node);
    schedule();
  }

  function frame(now: number) {
    raf = 0;
    const dt = lastFrame ? Math.min(64, now - lastFrame) : 1000 / 60;
    let moving = false;
    if (flight) {
      const t = Math.min(1, (now - flight.start) / flight.duration);
      setView(flight.at(flight.ease(Math.max(0, t))));
      if (t < 1) {
        moving = true;
      } else {
        flight = null;
        if (followAfterFlight) autoFit = true;
        followAfterFlight = false;
      }
    }
    if (zoomGoal) {
      const next = k + (zoomGoal.k - k) * (1 - Math.exp(-dt / 70));
      if (Math.abs(zoomGoal.k - next) < k * 0.002) {
        zoomAt(zoomGoal.k / k, zoomGoal.x, zoomGoal.y);
        zoomGoal = null;
      } else {
        zoomAt(next / k, zoomGoal.x, zoomGoal.y);
        moving = true;
      }
    }
    if (glide) {
      tx += glide.vx * dt;
      ty += glide.vy * dt;
      const decay = Math.exp(-dt / GLIDE_MS);
      glide.vx *= decay;
      glide.vy *= decay;
      if (Math.hypot(glide.vx, glide.vy) < 0.01) glide = null;
      else moving = true;
    }
    const fading = draw(dt);
    if (moving || fading) {
      lastFrame = now;
      schedule();
    } else {
      lastFrame = 0;
    }
  }

  /** Paints one frame and eases every highlight a step toward its target; true while any is still moving. */
  function draw(dt: number): boolean {
    const step = primed && !reduced ? 1 - Math.exp(-dt / FADE_MS) : 1;
    primed = true;
    let fading = false;
    const approach = (current: number, target: number) => {
      const next = current + (target - current) * step;
      if (Math.abs(target - next) < 0.004) return target;
      fading = true;
      return next;
    };

    const { matches, topic } = emphasis;
    // A query being typed outranks the selection, so its matches show even while a note is focused.
    const focus = dragging ?? hover ?? (matches ? null : selected);
    const focusSet = focus ? neighbours.get(focus.id) ?? NO_NEIGHBOURS : null;
    for (const node of nodes) {
      node.on = focus
        ? node === focus || focusSet!.has(node.id)
        : matches
          ? matches.has(node.id)
          : topic !== null
            ? node.topic === topic || (topic < 0 && node.topic < 0)
            : null;
    }

    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.clearRect(0, 0, width, height);
    ctx!.translate(width / 2 + tx, height / 2 + ty);
    ctx!.scale(k, k);

    for (const link of links) {
      const highlighting = link.source.on !== null;
      link.shade = approach(link.shade, !highlighting ? 0.7 : link.source.on && link.target.on && !focus ? 0.7 : 0.12);
      link.lit = approach(link.lit, focus && (link.source === focus || link.target === focus) ? 1 : 0);
      ctx!.beginPath();
      ctx!.moveTo(link.source.x, link.source.y);
      ctx!.lineTo(link.target.x, link.target.y);
      ctx!.globalAlpha = link.shade;
      ctx!.strokeStyle = colors.line;
      ctx!.lineWidth = 1 / k;
      ctx!.stroke();
      if (link.lit > 0.01) {
        ctx!.globalAlpha = 0.95 * link.lit;
        ctx!.strokeStyle = colors.accent;
        ctx!.lineWidth = 1.6 / k;
        ctx!.stroke();
      }
    }

    const isActive = (node: Node) => node === focus || node === selected || node.id === currentId;
    for (const node of nodes) {
      const r = radius(node);
      const color = colors.topics[node.topic] ?? colors.none;
      node.shade = approach(node.shade, node.on === false ? 0.2 : 1);
      node.ring = approach(node.ring, isActive(node) ? 1 : 0);
      ctx!.globalAlpha = node.shade;
      ctx!.beginPath();
      ctx!.arc(node.x, node.y, r, 0, Math.PI * 2);
      ctx!.fillStyle = color;
      ctx!.fill();
      if (node.ring > 0.01) {
        ctx!.beginPath();
        ctx!.arc(node.x, node.y, r + (2 + 2 * node.ring) / k, 0, Math.PI * 2);
        ctx!.strokeStyle = color;
        ctx!.globalAlpha = 0.45 * node.ring;
        ctx!.lineWidth = 2 / k;
        ctx!.stroke();
      }
    }

    // Labels are placed most important first, and only where they don't collide with one already placed, so
    // dense clusters show their hubs and reveal the rest as zooming in makes room.
    const fontPx = small() ? 10 : 11.5;
    ctx!.font = `${fontPx}px ${colors.font}`;
    if (fontPx !== measuredAt) {
      labelWidths.clear();
      measuredAt = fontPx;
    }
    const text = (node: Node) => (small() && node.title.length > 24 ? `${node.title.slice(0, 22)}…` : node.title);
    const priority = (node: Node) =>
      (isActive(node) ? 1e4 : 0) +
      (node.on === true ? 1e3 : node.on === false ? -1e3 : 0) +
      node.degree * 10 +
      (node.label > 0.5 ? 25 : 0); // a little stickiness so neighbouring labels don't flicker
    const placed: { l: number; r: number; t: number; b: number }[] = [];
    const roomy = new Set<Node>();
    for (const node of [...nodes].sort((a, b) => priority(b) - priority(a))) {
      let w = labelWidths.get(node);
      if (w === undefined) {
        w = ctx!.measureText(text(node)).width;
        labelWidths.set(node, w);
      }
      const sx = width / 2 + tx + node.x * k;
      const sy = height / 2 + ty + (node.y + radius(node)) * k + 3;
      const box = { l: sx - w / 2 - 3, r: sx + w / 2 + 3, t: sy, b: sy + fontPx * 1.3 };
      if (isActive(node) || !placed.some((p) => box.l < p.r && box.r > p.l && box.t < p.b && box.b > p.t)) {
        roomy.add(node);
        if (box.r > 0 && box.l < width && box.b > 0 && box.t < height) placed.push(box);
      }
    }

    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'top';
    ctx!.font = `${fontPx / k}px ${colors.font}`;
    ctx!.lineJoin = 'round';
    ctx!.lineWidth = 3 / k;
    ctx!.strokeStyle = colors.bg;
    for (const node of nodes) {
      const active = isActive(node);
      const near = node.on === true && !active;
      const base = small() ? 1 : labelOpacity(k, node.degree, nodes.length);
      const target = active ? 1 : !roomy.has(node) ? 0 : near ? 0.9 : base * (node.on === false ? 0.2 : 0.85);
      node.label = approach(node.label, target);
      if (node.label < 0.01) continue;
      ctx!.globalAlpha = node.label;
      ctx!.fillStyle = active ? colors.text : colors.label;
      const y = node.y + radius(node) + 3 / k;
      ctx!.strokeText(text(node), node.x, y);
      ctx!.fillText(text(node), node.x, y);
    }
    ctx!.globalAlpha = 1;
    return fading;
  }

  function nodeAt(px: number, py: number): Node | undefined {
    const [wx, wy] = toWorld(px, py);
    return simulation.find(wx, wy, 14 / k);
  }

  canvas.addEventListener(
    'wheel',
    (event) => {
      event.preventDefault();
      autoFit = false;
      flight = null;
      glide = null;
      const dy = event.deltaY * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? height : 1);
      if (event.ctrlKey) {
        // Trackpad pinch arrives as ctrl+wheel with small, frequent deltas: follow it directly.
        zoomGoal = null;
        zoomAt(Math.exp(-dy * 0.01), event.offsetX, event.offsetY);
        schedule();
        return;
      }
      const factor = Math.exp(-dy * 0.0022);
      const notched =
        event.deltaMode === 1 || (event.deltaX === 0 && Math.abs(event.deltaY) >= 40 && Number.isInteger(event.deltaY));
      if (!notched || reduced) {
        zoomGoal = null;
        zoomAt(factor, event.offsetX, event.offsetY);
      } else {
        // A mouse wheel jumps in big steps; ease toward the accumulated target instead.
        zoomGoal = { k: clampZoom((zoomGoal?.k ?? k) * factor), x: event.offsetX, y: event.offsetY };
      }
      schedule();
    },
    { passive: false, signal },
  );

  const pinchState = () => {
    const [a, b] = [...pointers.values()];
    return { dist: Math.hypot(a.x - b.x, a.y - b.y) || 1, x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  function endDrag() {
    if (!dragging) return;
    dragging.fx = null;
    dragging.fy = null;
    if (!reduced) simulation.alphaTarget(0);
    dragging = null;
  }

  function startGlide(now: number) {
    const recent = samples.filter((sample) => now - sample.t < 80);
    if (reduced || recent.length < 2 || now - recent[recent.length - 1].t > 40) return;
    const first = recent[0];
    const lastSample = recent[recent.length - 1];
    const dt = lastSample.t - first.t;
    if (dt < 8) return;
    let vx = (lastSample.x - first.x) / dt;
    let vy = (lastSample.y - first.y) / dt;
    const speed = Math.hypot(vx, vy);
    if (speed < 0.2) return;
    const cap = Math.min(1, 4 / speed);
    vx *= cap;
    vy *= cap;
    glide = { vx, vy };
  }

  /** A press and release without movement: open the note inline; in fullscreen focus it, open it on a double tap. */
  function tap(node: Node | null, event: PointerEvent) {
    if (!container.hasAttribute('data-fullscreen')) {
      if (node) void navigate(node.href);
      return;
    }
    const now = event.timeStamp;
    // Matched by position, not by node: the first tap starts a flight, so the node moves under the pointer.
    if (lastTap && now - lastTap.time < DOUBLE_TAP_MS && Math.hypot(event.offsetX - lastTap.x, event.offsetY - lastTap.y) < 12) {
      const target = lastTap.node;
      lastTap = null;
      void navigate(target.href);
      return;
    }
    lastTap = node ? { node, x: event.offsetX, y: event.offsetY, time: now } : null;
    select(node?.id ?? null);
  }

  canvas.addEventListener(
    'pointerdown',
    (event) => {
      if (event.button !== 0) return;
      canvas.setPointerCapture(event.pointerId);
      const point = { x: event.offsetX, y: event.offsetY };
      pointers.set(event.pointerId, point);
      autoFit = false;
      stopMotion();
      if (pointers.size === 2) {
        endDrag();
        panning = false;
        canvas.classList.remove('dragging');
        pinch = pinchState();
        moved = true;
        schedule();
        return;
      }
      if (pointers.size > 2) return;
      moved = false;
      down = point;
      last = point;
      samples = [{ ...point, t: event.timeStamp }];
      const node = nodeAt(point.x, point.y);
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
      const point = { x: event.offsetX, y: event.offsetY };
      if (pointers.has(event.pointerId)) pointers.set(event.pointerId, point);
      if (pinch) {
        if (pointers.size < 2) return;
        const next = pinchState();
        tx += next.x - pinch.x;
        ty += next.y - pinch.y;
        zoomAt(next.dist / pinch.dist, next.x, next.y);
        pinch = next;
        schedule();
        return;
      }
      if (Math.hypot(point.x - down.x, point.y - down.y) > 3 && (dragging || panning)) moved = true;
      if (dragging) {
        const [wx, wy] = toWorld(point.x, point.y);
        dragging.fx = wx;
        dragging.fy = wy;
        if (reduced) simulation.tick(2);
        schedule();
        return;
      }
      if (panning) {
        tx += point.x - last.x;
        ty += point.y - last.y;
        last = point;
        samples.push({ ...point, t: event.timeStamp });
        samples = samples.filter((sample) => event.timeStamp - sample.t < 100);
        schedule();
        return;
      }
      if (event.pointerType === 'touch') return;
      const next = nodeAt(point.x, point.y) ?? null;
      if (next !== hover) {
        hover = next;
        canvas.classList.toggle('pointing', !!hover);
        schedule();
      }
    },
    { signal },
  );

  const release = (event: PointerEvent) => {
    if (!pointers.delete(event.pointerId)) return;
    if (pinch) {
      // The remaining finger does nothing until it lifts too.
      if (pointers.size < 2) pinch = null;
      return;
    }
    const still = !moved && event.type === 'pointerup';
    if (dragging) {
      const target = dragging;
      endDrag();
      if (still) tap(target, event);
    } else if (panning) {
      panning = false;
      canvas.classList.remove('dragging');
      if (moved) startGlide(event.timeStamp);
      else if (still) tap(null, event);
    }
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
      colors = palette(data.topics);
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
    // The camera keeps the graph fitted while the layout settles, until the reader takes over.
    simulation.alpha(1).restart();
    simulation.on('end', () => {
      autoFit = false;
    });
  }

  return {
    data,
    destroy() {
      controller.abort();
      observer.disconnect();
      simulation.stop();
      selectListeners.clear();
      cancelAnimationFrame(raf);
    },
    fit,
    zoomBy,
    panBy,
    select,
    selected: () => selected?.id ?? null,
    hop(dir) {
      if (!selected) return false;
      const candidates = [...(neighbours.get(selected.id) ?? [])].map((id) => byId.get(id)!);
      const next = neighbourInDirection(selected, candidates, dir);
      if (next) select(next.id);
      return !!next;
    },
    neighbours: (id) => [...(neighbours.get(id) ?? [])].map((other) => byId.get(other)!),
    setEmphasis(next) {
      emphasis = { ...emphasis, ...next };
      schedule();
    },
    setInsets(next) {
      insets = { ...insets, ...next };
    },
    onSelect(listener) {
      selectListeners.add(listener);
      return () => selectListeners.delete(listener);
    },
    relayout(shift = { x: 0, y: 0 }) {
      autoFit = false;
      stopMotion();
      resize();
      tx += shift.x;
      ty += shift.y;
      schedule();
    },
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

export function graphFor(container: Element): GraphHandle | undefined {
  return instances.get(container);
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
