import { cpSync, createReadStream, existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { AstroIntegration, AstroIntegrationLogger } from 'astro';
import { getVaultIndex } from '../lib/vault/index';
import { SITE } from '../site';

const MIME: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  pdf: 'application/pdf',
  mp3: 'audio/mpeg',
  mp4: 'video/mp4',
  webm: 'video/webm',
  wav: 'audio/wav',
  txt: 'text/plain; charset=utf-8',
  json: 'application/json',
};

export interface VaultOptions {
  /** Folder inside the vault that holds attachments (Obsidian's `attachmentFolderPath`). */
  folder?: string;
  /** URL segment the folder is served from. */
  route?: string;
}

function reportDiagnostics(logger: AstroIntegrationLogger) {
  const index = getVaultIndex();
  for (const diagnostic of index.diagnostics) logger.warn(`${diagnostic.file}: ${diagnostic.message}`);
  logger.info(`${index.notes.length} notes, ${index.topics.length} topics, ${index.diagnostics.length} warnings`);
}

/**
 * Glue between the vault and Astro:
 * - serves `notes/attachments/**` at `/attachments/*` in dev and copies it to `dist/attachments/` at build;
 * - reloads the browser when any note changes, so links, backlinks and the tree stay fresh;
 * - prints link diagnostics (missing, ambiguous) once per build or dev start.
 */
export function vault({ folder = 'attachments', route = 'attachments' }: VaultOptions = {}): AstroIntegration {
  let root = process.cwd();
  let base = '/';

  return {
    name: 'quire:vault',
    hooks: {
      'astro:config:done': ({ config }) => {
        root = fileURLToPath(config.root);
        base = config.base;
      },

      'astro:server:setup': ({ server, logger }) => {
        const vaultDir = path.resolve(root, SITE.vaultDir);
        const sourceDir = path.resolve(vaultDir, folder);
        const prefixes = [...new Set([`/${route}/`, `${base.replace(/\/+$/, '')}/${route}/`])];

        server.middlewares.use((req, res, next) => {
          const url = (req.url ?? '').split('?')[0];
          const prefix = prefixes.find((p) => url.startsWith(p));
          if (!prefix) return next();
          let relative: string;
          try {
            relative = decodeURIComponent(url.slice(prefix.length));
          } catch {
            return next();
          }
          const file = path.resolve(sourceDir, relative);
          if (!file.startsWith(sourceDir + path.sep)) return next();
          let stat;
          try {
            stat = statSync(file);
          } catch {
            return next();
          }
          if (!stat.isFile()) return next();
          res.setHeader('Content-Type', MIME[path.extname(file).slice(1).toLowerCase()] ?? 'application/octet-stream');
          res.setHeader('Content-Length', String(stat.size));
          res.setHeader('Cache-Control', 'no-cache');
          createReadStream(file).pipe(res);
        });

        let timer: NodeJS.Timeout | undefined;
        server.watcher.on('all', (_event, file) => {
          if (!file.startsWith(vaultDir + path.sep) || !/\.md$/i.test(file)) return;
          clearTimeout(timer);
          timer = setTimeout(() => {
            logger.info('vault changed, reloading');
            server.ws.send({ type: 'full-reload' });
          }, 400);
        });
      },

      'astro:server:start': ({ logger }) => reportDiagnostics(logger),
      'astro:build:start': ({ logger }) => reportDiagnostics(logger),

      'astro:build:done': ({ dir, logger }) => {
        const sourceDir = path.resolve(root, SITE.vaultDir, folder);
        if (!existsSync(sourceDir)) return;
        cpSync(sourceDir, path.join(fileURLToPath(dir), route), { recursive: true });
        logger.info(`copied ${SITE.vaultDir}/${folder} to ${route}/`);
      },
    },
  };
}
