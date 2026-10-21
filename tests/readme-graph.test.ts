import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import { paletteFor, renderGraphSvg, themeVars, topicLabel } from '../src/lib/readme-graph';
import { toGraphData } from '../src/lib/vault/graph';
import { fixtureIndex } from './helpers';

const TOKENS = readFileSync(
  path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'styles', 'tokens.css'),
  'utf8',
);

const graph = () => toGraphData(fixtureIndex(), (id) => `/notes/${id}/`);

test('topic labels read as words', () => {
  assert.equal(topicLabel('data-structures'), 'Data structures');
  assert.equal(topicLabel('Operating Systems'), 'Operating Systems');
  assert.equal(topicLabel('CS50'), 'CS50');
});

test('theme variables resolve var() references, and dark overrides light', () => {
  const light = themeVars(TOKENS, false);
  const dark = themeVars(TOKENS, true);
  assert.equal(light.get('--topic-0'), light.get('--green'));
  assert.doesNotMatch(light.get('--topic-0') ?? '', /var\(/);
  assert.notEqual(dark.get('--graph-line'), light.get('--graph-line'));
  assert.equal(dark.get('--topic-0'), light.get('--topic-0'));
});

test('the picture is the same on every build', () => {
  const data = graph();
  const palette = paletteFor(data, themeVars(TOKENS, false));
  assert.equal(renderGraphSvg(data, palette), renderGraphSvg(data, palette));
});

test('only topics are labelled, once each, and everything stays inside the frame', () => {
  const data = graph();
  const svg = renderGraphSvg(data, paletteFor(data, themeVars(TOKENS, true)), { width: 900, height: 360 });
  assert.match(svg, /^<svg [^>]*viewBox="0 0 900 360"/);
  const labels = [...svg.matchAll(/<text [^>]*>([^<]*)<\/text>/g)].map((m) => m[1]);
  const used = new Set(data.nodes.map((node) => node.topic).filter((topic) => topic >= 0));
  assert.equal(labels.length, used.size);
  assert.equal(new Set(labels).size, labels.length);
  assert.equal(svg.match(/<circle /g)?.length, data.nodes.length);
  for (const [, x, y] of svg.matchAll(/<(?:circle|text) [^>]*?(?:cx|x)="([\d.-]+)" (?:cy|y)="([\d.-]+)"/g)) {
    assert.ok(Number(x) >= 0 && Number(x) <= 900 && Number(y) >= 0 && Number(y) <= 360, `${x},${y} is outside`);
  }
  assert.doesNotMatch(svg, /var\(/);
});
