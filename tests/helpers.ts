import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIndex } from '../src/lib/vault/index';
import { scanVault } from '../src/lib/vault/scan';
import type { VaultIndex } from '../src/lib/vault/types';

export const FIXTURE_VAULT = path.join(path.dirname(fileURLToPath(import.meta.url)), 'fixtures', 'vault');

let cached: VaultIndex | undefined;

/** The fixture vault index, built once per test process. */
export function fixtureIndex(): VaultIndex {
  cached ??= buildIndex(scanVault(FIXTURE_VAULT), { name: 'Fixture' });
  return cached;
}

export function note(index: VaultIndex, id: string) {
  const found = index.byId.get(id);
  if (!found) throw new Error(`fixture note "${id}" not found; have: ${[...index.byId.keys()].join(', ')}`);
  return found;
}
