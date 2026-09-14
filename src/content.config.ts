import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { SITE } from './site';
import { slugifyPath } from './lib/vault/slug';

/**
 * Every markdown file in the vault is a note. Ids come from the same slugifier the vault index uses,
 * so `getEntry('notes', note.id)` always finds the entry the index describes.
 * Rendering is deferred to page-render time so wikilinks resolve against the current vault.
 */
const notes = defineCollection({
  loader: glob({
    pattern: ['**/*.md', '!**/.obsidian/**', '!**/.trash/**'],
    base: `./${SITE.vaultDir}`,
    generateId: ({ entry }) => slugifyPath(entry),
    deferRender: true,
  }),
  schema: z.object({
    title: z.coerce.string().optional(),
    description: z.coerce.string().optional(),
    tags: z.union([z.array(z.coerce.string()), z.coerce.string()]).optional(),
    aliases: z.union([z.array(z.coerce.string()), z.coerce.string()]).optional(),
    draft: z.boolean().optional(),
  }),
});

export const collections = { notes };
