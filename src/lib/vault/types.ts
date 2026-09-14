export interface VaultHeading {
  depth: number;
  text: string;
  /** Anchor id, produced with github-slugger exactly like Astro's heading ids. */
  slug: string;
}

export interface Link {
  /** Source note id. */
  source: string;
  /** Target note id. */
  target: string;
  anchor?: string;
  /** Short plain-text window around the link in the source note. */
  context: string;
}

export interface VaultNote {
  /** Slugified vault path without extension, e.g. `data-structures/trees`. Equals the collection entry id. */
  id: string;
  /** Vault-relative path with original casing, e.g. `data-structures/Trees.md`. */
  path: string;
  /** Absolute file path. */
  file: string;
  /** File name without extension, original casing. */
  stem: string;
  /** Vault-relative folder of the note (`''` for the vault root), original casing. */
  folder: string;
  title: string;
  description?: string;
  tags: string[];
  aliases: string[];
  draft: boolean;
  /** Slug of the first folder segment; `''` for root notes. */
  topic: string;
  /** Display name of the first folder segment. */
  topicName: string;
  /** Headings as Astro will render them (a stripped leading H1 is excluded). */
  headings: VaultHeading[];
  /** True when the first block is an H1 equal to the title, so it must not be rendered twice. */
  stripTitle: boolean;
  /** Plain text for search and backlink context. */
  plain: string;
  wordCount: number;
  /** Outgoing links to other notes, deduplicated by target. */
  links: Link[];
}

export interface VaultFolder {
  /** Original folder name. */
  name: string;
  slug: string;
  /** Slug path from the vault root, e.g. `programming/python`. `''` for the root. */
  path: string;
  folders: VaultFolder[];
  notes: VaultNote[];
  /** Recursive note count. */
  count: number;
}

export type Resolution =
  | { kind: 'note'; note: VaultNote; anchor?: string; warning?: string }
  | { kind: 'attachment'; path: string; anchor?: string }
  | { kind: 'external'; url: string }
  | { kind: 'unresolved'; reason: string; candidates?: string[] };

export interface Diagnostic {
  file: string;
  message: string;
}

export interface Topic {
  slug: string;
  name: string;
}

export interface GraphNode {
  id: string;
  title: string;
  href: string;
  /** Index into `GraphData.topics`; -1 for root notes. */
  topic: number;
  degree: number;
}

export interface GraphLink {
  source: string;
  target: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
  topics: Topic[];
}

/** Lookup tables used by the resolver. Keys are NFC + lower-cased. */
export interface Lookups {
  byPathKey: Map<string, VaultNote>;
  byStem: Map<string, VaultNote[]>;
  bySlugStem: Map<string, VaultNote[]>;
  byAlias: Map<string, VaultNote[]>;
  byTitle: Map<string, VaultNote[]>;
  byFile: Map<string, VaultNote>;
}

export interface VaultIndex {
  root: string;
  name: string;
  /** Non-draft notes sorted by id. */
  notes: VaultNote[];
  byId: Map<string, VaultNote>;
  lookups: Lookups;
  tree: VaultFolder;
  /** Top-level folders in tree order; their position defines the topic colour. */
  topics: Topic[];
  /** Vault-relative paths of every non-markdown file outside dot-directories. */
  attachments: string[];
  /** Target note id -> incoming links. */
  backlinks: Map<string, Link[]>;
  diagnostics: Diagnostic[];
}
