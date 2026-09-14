import { topicColorVars } from '../topic-colors';
import type { GraphData, GraphLink, GraphTopic, VaultIndex } from './types';

function graphTopics(index: VaultIndex): GraphTopic[] {
  const vars = topicColorVars(index.topics);
  return index.topics.map((topic, i) => ({ ...topic, colorVar: vars[i] }));
}

/** Every non-draft note (orphans included) and the links between them, undirected and deduplicated. */
export function toGraphData(index: VaultIndex, href: (id: string) => string): GraphData {
  const degree = new Map<string, number>();
  const seen = new Set<string>();
  const links: GraphLink[] = [];
  for (const note of index.notes) {
    for (const link of note.links) {
      const key = [link.source, link.target].sort().join(' ');
      if (seen.has(key)) continue;
      seen.add(key);
      links.push({ source: link.source, target: link.target });
      degree.set(link.source, (degree.get(link.source) ?? 0) + 1);
      degree.set(link.target, (degree.get(link.target) ?? 0) + 1);
    }
  }
  const topicIndex = new Map(index.topics.map((topic, i) => [topic.slug, i]));
  return {
    nodes: index.notes.map((note) => ({
      id: note.id,
      title: note.title,
      href: href(note.id),
      topic: topicIndex.get(note.topic) ?? -1,
      degree: degree.get(note.id) ?? 0,
    })),
    links,
    topics: graphTopics(index),
  };
}

/** The note, its direct neighbours in either direction, and all links among them. */
export function localGraph(index: VaultIndex, id: string, href: (id: string) => string): GraphData {
  const center = index.byId.get(id);
  if (!center) return { nodes: [], links: [], topics: graphTopics(index) };
  const ids = new Set<string>([id]);
  for (const link of center.links) ids.add(link.target);
  for (const link of index.backlinks.get(id) ?? []) ids.add(link.source);
  const full = toGraphData(index, href);
  return {
    nodes: full.nodes.filter((node) => ids.has(node.id)),
    links: full.links.filter((link) => ids.has(link.source) && ids.has(link.target)),
    topics: full.topics,
  };
}
