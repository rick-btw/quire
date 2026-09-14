import assert from 'node:assert/strict';
import test from 'node:test';
import { localGraph, toGraphData } from '../src/lib/vault/graph';
import { contextAround, extractRefs } from '../src/lib/vault/links';
import { extractHeadings, inlineToText, leadingH1, stripCode, toPlainText } from '../src/lib/vault/text';
import { fixtureIndex } from './helpers';

test('extractRefs finds wikilinks and markdown links but ignores code and comments', () => {
  const body = [
    'See [[Trees]] and [[folder/Repeat|alias]] and ![[img.png|300]] and [md](../a.md "title") and ![pic](x.png).',
    'Not this: `[[in code]]` nor this %%[[in comment]]%%',
    '```',
    '[[in fence]]',
    '```',
  ].join('\n');
  const refs = extractRefs(body);
  assert.deepEqual(
    refs.map((r) => [r.target, r.label, r.embed, r.wiki]),
    [
      ['Trees', undefined, false, true],
      ['folder/Repeat', 'alias', false, true],
      ['img.png', '300', true, true],
      ['../a.md', 'md', false, false],
      ['x.png', 'pic', true, false],
    ],
  );
});

test('stripCode keeps offsets stable', () => {
  const body = 'a `b` c\n```\nx\n```\nd';
  const stripped = stripCode(body);
  assert.equal(stripped.length, body.length);
  assert.equal(stripped.split('\n').length, body.split('\n').length);
  assert.doesNotMatch(stripped, /[bx]/);
});

test('context windows are readable and never cut a word', () => {
  const text = 'Alpha beta gamma [[delta|the link]] epsilon zeta eta theta iota kappa lambda mu nu xi omicron pi rho sigma tau';
  const offset = text.indexOf('[[');
  const link = '[[delta|the link]]';
  assert.equal(contextAround(text, offset, link.length, 20), 'Alpha beta gamma the link epsilon zeta eta theta…');
  assert.equal(contextAround(text, offset, link.length, 8), '…beta gamma the link epsilon…');
  assert.equal(contextAround('# Heading with [[x]]\n> quoted', 15, 5, 40), 'Heading with x quoted');
});

test('text helpers', () => {
  assert.equal(inlineToText('**bold** _it_ `code` [[a/b|B]] [[c]] [t](u) ![[i.png]] $x^2$ ==hl=='), 'bold it code B c t i.png x^2 hl');
  assert.equal(leadingH1('\n\n# Title #\nbody'), 'Title');
  assert.equal(leadingH1('intro\n# Not first'), undefined);
  assert.deepEqual(extractHeadings('# A\n```\n## not\n```\n## B `c`\n### D'), [
    { depth: 1, text: 'A' },
    { depth: 2, text: 'B c' },
    { depth: 3, text: 'D' },
  ]);
  const plain = toPlainText('# H\n\n> [!tip] Title\n> body\n\n- [ ] task\n1. one\n\n| a | b |\n| - | - |\n| 1 | 2 |\n');
  assert.equal(plain, 'H\n\nTitle\nbody\n\ntask\none\n\na b\n\n1 2');
});

test('graph data covers every note, deduplicates undirected links and knows topics', () => {
  const index = fixtureIndex();
  const graph = toGraphData(index, (id) => `/notes/${id}/`);
  assert.equal(graph.nodes.length, index.notes.length);
  assert.equal(graph.topics.length, 7);
  const trees = graph.nodes.find((n) => n.id === 'structures/trees')!;
  assert.equal(trees.topic, graph.topics.findIndex((t) => t.slug === 'structures'));
  assert.equal(trees.href, '/notes/structures/trees/');
  assert.equal(trees.degree, 4);
  assert.equal(graph.nodes.find((n) => n.id === 'repeat')!.topic, -1);
  assert.equal(graph.nodes.find((n) => n.id === 'isolated')!.degree, 0);
  const pairs = graph.links.map((l) => [l.source, l.target].sort().join(' '));
  assert.equal(new Set(pairs).size, pairs.length);
  assert.ok(pairs.includes('index structures/trees'));
  assert.ok(pairs.includes('folder/repeat second/other'));
});

test('local graph is the one-hop neighbourhood in both directions', () => {
  const index = fixtureIndex();
  const local = localGraph(index, 'structures/trees', (id) => id);
  assert.deepEqual(
    local.nodes.map((n) => n.id).sort(),
    ['algorithms/bfs', 'index', 'second/other', 'structures/trees', 'موضوع/مقدمه'],
  );
  assert.equal(local.links.length, 5);
  assert.deepEqual(localGraph(index, 'nope', (id) => id).nodes, []);
});
