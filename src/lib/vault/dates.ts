import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import path from 'node:path';

const NUL = String.fromCharCode(0);

let cache: { root: string; dates: Map<string, string> } | undefined;

/** Last commit date (ISO 8601) per vault-relative path, from `git log`. Empty when git is unavailable. */
export function getNoteDates(root: string): Map<string, string> {
  if (cache?.root === root) return cache.dates;
  const dates = new Map<string, string>();
  try {
    const run = (args: string[], cwd: string) =>
      execFileSync('git', args, {
        cwd,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        maxBuffer: 64 * 1024 * 1024,
      });
    const top = run(['rev-parse', '--show-toplevel'], root).trim();
    // %x00 puts a NUL before each commit date so dates and file names cannot be confused.
    const log = run(['-c', 'core.quotePath=false', 'log', '--format=%x00%cI', '--name-only', '--', root], top);
    const prefix = `${path.relative(top, root).split(path.sep).join('/')}/`.replace(/^\/+/, '');
    let current = '';
    for (const line of log.split('\n')) {
      if (line.startsWith(NUL)) {
        current = line.slice(1).trim();
        continue;
      }
      const file = line.trim();
      if (!file || !current || !file.startsWith(prefix)) continue;
      const rel = file.slice(prefix.length);
      if (!dates.has(rel)) dates.set(rel, current);
    }
  } catch {
    // Not a git repository, no commits yet, or git missing: fall back to mtimes per note.
  }
  cache = { root, dates };
  return dates;
}

/** Best available "updated" date for one note: git commit date, else file mtime. */
export function noteDate(root: string, rel: string): string | undefined {
  const committed = getNoteDates(root).get(rel);
  if (committed) return committed;
  try {
    return statSync(path.join(root, rel)).mtime.toISOString();
  } catch {
    return undefined;
  }
}
