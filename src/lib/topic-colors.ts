// Top-level folders with their own `--topic-color-<slug>` token in tokens.css.
const FIXED = new Set(['cs50']);

/** CSS custom property holding each topic's colour, in topic order. Fixed topics don't take a rotation slot. */
export function topicColorVars(topics: { slug: string }[]): string[] {
  let slot = 0;
  return topics.map((topic) => (FIXED.has(topic.slug) ? `--topic-color-${topic.slug}` : `--topic-${slot++ % 8}`));
}
