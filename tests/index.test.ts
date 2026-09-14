import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIndex } from '../src/lib/vault/index';
import type { ScanResult } from '../src/lib/vault/scan';
import { fixtureIndex, note } from './helpers';

test('scans every note except drafts and dot-directories', () => {
  const index = fixtureIndex();
  assert.deepEqual(
    [...index.byId.keys()],
    [
      'algorithms/bfs',
      'deep/inner/leaf',
      'folder/repeat',
      'index',
      'isolated',
      'leetcode-grind/1-two-sum',
      'leetcode-grind/10-ten',
      'leetcode-grind/9-nine',
      'repeat',
      'second/other',
      'structures/trees',
      'موضوع/مقدمه',
    ],
  );
  assert.deepEqual(index.attachments, ['attachments/diagram.svg']);
});

test('titles fall back from frontmatter to H1 to file name, and duplicate H1s are flagged', () => {
  const index = fixtureIndex();
  const trees = note(index, 'structures/trees');
  assert.equal(trees.title, 'Trees');
  assert.equal(trees.stripTitle, true);
  assert.deepEqual(trees.aliases, ['Branches']);
  assert.deepEqual(trees.tags, ['structure', 'data structures/trees']);

  const bfs = note(index, 'algorithms/bfs');
  assert.equal(bfs.title, 'Breadth first');
  assert.equal(bfs.stripTitle, true);

  const isolated = note(index, 'isolated');
  assert.equal(isolated.title, 'isolated');
  assert.equal(isolated.stripTitle, false);

  const home = note(index, 'index');
  assert.equal(home.title, 'Home');
  assert.equal(home.description, 'The fixture vault.');
  assert.equal(home.stripTitle, true);
});

test('headings exclude a stripped H1 and use github-slugger anchors', () => {
  const index = fixtureIndex();
  assert.deepEqual(note(index, 'structures/trees').headings, [
    { depth: 2, text: 'Shape', slug: 'shape' },
    { depth: 2, text: 'Shape', slug: 'shape-1' },
  ]);
  assert.deepEqual(note(index, 'algorithms/bfs').headings, [{ depth: 2, text: 'How it works', slug: 'how-it-works' }]);
});

test('topic comes from the first folder and plain text is searchable', () => {
  const index = fixtureIndex();
  const twoSum = note(index, 'leetcode-grind/1-two-sum');
  assert.equal(twoSum.topic, 'leetcode-grind');
  assert.equal(twoSum.topicName, 'LeetCode Grind');
  assert.equal(twoSum.folder, 'LeetCode Grind');
  assert.match(twoSum.plain, /Complexity\s+O\(n\) time\./);
  assert.equal(note(index, 'repeat').topic, '');
  const persian = note(index, 'موضوع/مقدمه');
  assert.equal(persian.title, 'مقدمه');
  assert.match(persian.plain, /پاراگراف فارسی/);
  assert.doesNotMatch(persian.plain, /\[\[/);
});

test('the folder tree is sorted naturally with recursive counts and no home note', () => {
  const index = fixtureIndex();
  assert.equal(index.tree.name, 'Fixture');
  assert.deepEqual(
    index.tree.folders.map((f) => f.name),
    ['algorithms', 'deep', 'folder', 'LeetCode Grind', 'second', 'structures', 'موضوع'],
  );
  assert.deepEqual(
    index.topics.map((t) => t.slug),
    ['algorithms', 'deep', 'folder', 'leetcode-grind', 'second', 'structures', 'موضوع'],
  );
  const deep = index.tree.folders.find((f) => f.name === 'deep')!;
  assert.deepEqual(deep.folders.map((f) => f.path), ['deep/inner']);
  assert.equal(deep.count, 1);
  const leetcode = index.tree.folders.find((f) => f.name === 'LeetCode Grind')!;
  assert.deepEqual(
    leetcode.notes.map((n) => n.stem),
    ['1. Two Sum', '9. Nine', '10. Ten'],
  );
  assert.equal(leetcode.path, 'leetcode-grind');
  assert.equal(leetcode.count, 3);
  assert.deepEqual(index.tree.notes.map((n) => n.id), ['isolated', 'repeat']);
  assert.equal(index.tree.count, 11);
});

test('links, backlinks and diagnostics come from one resolver', () => {
  const index = fixtureIndex();
  assert.deepEqual(
    note(index, 'index').links.map((l) => `${l.target}${l.anchor ? '#' + l.anchor : ''}`),
    ['structures/trees', 'algorithms/bfs#how-it-works'],
  );
  assert.deepEqual(
    (index.backlinks.get('structures/trees') ?? []).map((l) => l.source),
    ['algorithms/bfs', 'index', 'second/other', 'موضوع/مقدمه'],
  );
  const fromIndex = index.backlinks.get('structures/trees')!.find((l) => l.source === 'index')!;
  assert.match(fromIndex.context, /Start with Trees or again, then BFS/);
  assert.deepEqual(note(index, 'leetcode-grind/10-ten').links.map((l) => `${l.target}#${l.anchor}`), [
    'leetcode-grind/1-two-sum#complexity',
    'leetcode-grind/9-nine#undefined',
  ]);
  assert.deepEqual(note(index, 'folder/repeat').links, []);
  const messages = index.diagnostics.map((d) => `${d.file}: ${d.message}`);
  assert.deepEqual(messages, [
    'index.md: Link leaves the vault: ../secret.md',
    'index.md: Unsupported URL: javascript:alert%281%29',
    'second/Other.md: Ambiguous link "Repeat" matches folder/Repeat.md, Repeat.md. Use a folder path.',
    'second/Other.md: Missing note or attachment: Gone',
    'second/Other.md: Missing heading "Nope" in structures/Trees.md; linking to the note instead.',
    'second/Other.md: Block references are not supported (Trees#^block); linking to the note instead.',
  ]);
});

test('colliding ids throw with both paths named', () => {
  const scan: ScanResult = {
    root: '/tmp/vault',
    attachments: [],
    notes: [
      { rel: 'A Note.md', abs: '/tmp/vault/A Note.md', frontmatter: {}, body: '# A' },
      { rel: 'a-note.md', abs: '/tmp/vault/a-note.md', frontmatter: {}, body: '# B' },
    ],
  };
  assert.throws(() => buildIndex(scan, { name: 'x' }), /"A Note\.md" and "a-note\.md" both become "a-note"/);
});

test('frontmatter values are coerced leniently', () => {
  const scan: ScanResult = {
    root: '/tmp/vault',
    attachments: [],
    notes: [
      {
        rel: 'n.md',
        abs: '/tmp/vault/n.md',
        frontmatter: { title: 2024, tags: 'python, #ml', aliases: 'GD', draft: 'yes' },
        body: 'text',
      },
    ],
  };
  const [n] = buildIndex(scan, { name: 'x' }).notes;
  assert.equal(n.title, '2024');
  assert.deepEqual(n.tags, ['python', 'ml']);
  assert.deepEqual(n.aliases, ['GD']);
  assert.equal(n.draft, false);
});
