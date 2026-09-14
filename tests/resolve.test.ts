import assert from 'node:assert/strict';
import test from 'node:test';
import { resolveRef } from '../src/lib/vault/resolve';
import type { Resolution } from '../src/lib/vault/types';
import { fixtureIndex, note } from './helpers';

function noteId(resolution: Resolution) {
  assert.equal(resolution.kind, 'note', JSON.stringify(resolution));
  return resolution.kind === 'note' ? `${resolution.note.id}${resolution.anchor ? '#' + resolution.anchor : ''}` : '';
}

test('name form: stem, slugged stem, alias, title; case-insensitive', () => {
  const index = fixtureIndex();
  assert.equal(noteId(resolveRef(index, 'Trees')), 'structures/trees');
  assert.equal(noteId(resolveRef(index, 'trees')), 'structures/trees');
  assert.equal(noteId(resolveRef(index, 'Trees.md')), 'structures/trees');
  assert.equal(noteId(resolveRef(index, 'Branches')), 'structures/trees');
  assert.equal(noteId(resolveRef(index, 'Breadth first')), 'algorithms/bfs');
  assert.equal(noteId(resolveRef(index, '1-two-sum')), 'leetcode-grind/1-two-sum');
  assert.equal(noteId(resolveRef(index, '9. Nine')), 'leetcode-grind/9-nine');
  assert.equal(noteId(resolveRef(index, 'مقدمه')), 'موضوع/مقدمه');
});

test('path form: vault path, slug path, and unique suffixes', () => {
  const index = fixtureIndex();
  assert.equal(noteId(resolveRef(index, 'folder/Repeat')), 'folder/repeat');
  assert.equal(noteId(resolveRef(index, 'structures/trees')), 'structures/trees');
  assert.equal(noteId(resolveRef(index, '/LeetCode Grind/10. Ten')), 'leetcode-grind/10-ten');
  assert.equal(noteId(resolveRef(index, 'leetcode grind/9. nine')), 'leetcode-grind/9-nine');
  assert.equal(noteId(resolveRef(index, 'inner/Leaf')), 'deep/inner/leaf');
  assert.equal(noteId(resolveRef(index, 'inner/leaf#Details')), 'deep/inner/leaf#details');
  // A suffix must start at a folder boundary: "Grind" is only part of "LeetCode Grind".
  assert.equal(resolveRef(index, 'Grind/9. Nine').kind, 'unresolved');
  assert.equal(resolveRef(index, 'nowhere/Trees').kind, 'unresolved');
});

test('ambiguous names prefer the source folder, otherwise list candidates', () => {
  const index = fixtureIndex();
  const fromOther = resolveRef(index, 'Repeat', note(index, 'second/other'));
  assert.equal(fromOther.kind, 'unresolved');
  assert.deepEqual(fromOther.kind === 'unresolved' && fromOther.candidates, ['folder/Repeat.md', 'Repeat.md']);
  assert.equal(noteId(resolveRef(index, 'Repeat', note(index, 'folder/repeat'))), 'folder/repeat');
  assert.equal(noteId(resolveRef(index, 'Repeat', note(index, 'repeat'))), 'repeat');
});

test('anchors match slugs or heading text; misses and block refs fall back to the note', () => {
  const index = fixtureIndex();
  assert.equal(noteId(resolveRef(index, 'Trees#Shape')), 'structures/trees#shape');
  assert.equal(noteId(resolveRef(index, 'Trees#shape-1')), 'structures/trees#shape-1');
  assert.equal(noteId(resolveRef(index, 'BFS#How it works')), 'algorithms/bfs#how-it-works');
  assert.equal(noteId(resolveRef(index, 'BFS#how-it-works')), 'algorithms/bfs#how-it-works');
  assert.equal(noteId(resolveRef(index, 'Trees#Trees')), 'structures/trees');
  const missing = resolveRef(index, 'Trees#Nope');
  assert.equal(noteId(missing), 'structures/trees');
  assert.match(missing.kind === 'note' ? missing.warning ?? '' : '', /Missing heading "Nope"/);
  const block = resolveRef(index, 'Trees#^abc');
  assert.match(block.kind === 'note' ? block.warning ?? '' : '', /Block references/);
  assert.equal(noteId(resolveRef(index, '#Shape', note(index, 'structures/trees'))), 'structures/trees#shape');
});

test('markdown links are relative to the source note and may be encoded', () => {
  const index = fixtureIndex();
  const home = note(index, 'index');
  assert.equal(
    noteId(resolveRef(index, 'algorithms/BFS.md#How%20it%20works', home, { markdownLink: true })),
    'algorithms/bfs#how-it-works',
  );
  assert.equal(
    noteId(resolveRef(index, '../structures/Trees.md', note(index, 'algorithms/bfs'), { markdownLink: true })),
    'structures/trees',
  );
  assert.equal(noteId(resolveRef(index, 'Repeat.md', note(index, 'folder/repeat'), { markdownLink: true })), 'folder/repeat');
  const escaped = resolveRef(index, '../secret.md', home, { markdownLink: true });
  assert.equal(escaped.kind, 'unresolved');
  assert.match(escaped.kind === 'unresolved' ? escaped.reason : '', /leaves the vault/);
  const bad = resolveRef(index, '%E0%A4%A', home, { markdownLink: true });
  assert.match(bad.kind === 'unresolved' ? bad.reason : '', /Invalid URL encoding/);
});

test('external and unsafe URLs', () => {
  const index = fixtureIndex();
  assert.deepEqual(resolveRef(index, 'https://example.com/a'), { kind: 'external', url: 'https://example.com/a' });
  assert.deepEqual(resolveRef(index, 'mailto:me@example.com'), { kind: 'external', url: 'mailto:me@example.com' });
  for (const unsafe of ['javascript:alert(1)', 'java\tscript:alert(1)', 'data:text/html,hi', '//evil.example']) {
    const result = resolveRef(index, unsafe);
    assert.equal(result.kind, 'unresolved', unsafe);
    assert.match(result.kind === 'unresolved' ? result.reason : '', /Unsupported URL/);
  }
});

test('attachments resolve by exact path, relative path, attachments folder, or unique basename', () => {
  const index = fixtureIndex();
  assert.deepEqual(resolveRef(index, 'diagram.svg'), { kind: 'attachment', path: 'attachments/diagram.svg', anchor: undefined });
  assert.deepEqual(resolveRef(index, 'attachments/diagram.svg'), {
    kind: 'attachment',
    path: 'attachments/diagram.svg',
    anchor: undefined,
  });
  assert.equal(
    resolveRef(index, '../attachments/diagram.svg', note(index, 'structures/trees'), { markdownLink: true }).kind,
    'attachment',
  );
  assert.equal(resolveRef(index, 'nope.png').kind, 'unresolved');
  assert.equal(resolveRef(index, '').kind, 'unresolved');
});
