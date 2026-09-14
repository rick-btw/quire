import type { APIRoute } from 'astro';
import { noteHref } from '../lib/url';
import { getVaultIndex } from '../lib/vault/index';

export interface SearchDocument {
  id: string;
  title: string;
  href: string;
  path: string;
  topic: string;
  aliases: string;
  tags: string;
  headings: string;
  text: string;
}

/** Static search index, fetched by the search dialog on first use. */
export const GET: APIRoute = () => {
  const index = getVaultIndex();
  const documents: SearchDocument[] = index.notes.map((note) => ({
    id: note.id,
    title: note.title,
    href: noteHref(note.id),
    path: note.path.replace(/\.md$/i, ''),
    topic: note.topicName,
    aliases: note.aliases.join(' '),
    tags: note.tags.join(' '),
    headings: note.headings.map((h) => h.text).join(' '),
    text: note.plain,
  }));
  return new Response(JSON.stringify(documents), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
