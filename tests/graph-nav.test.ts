import assert from 'node:assert/strict';
import { test } from 'node:test';
import { labelOpacity, matchNodes, neighbourInDirection, smoothZoom } from '../src/scripts/graph-nav';

const close = (actual: number, expected: number, epsilon = 1e-6) =>
  assert.ok(Math.abs(actual - expected) < epsilon, `${actual} is not within ${epsilon} of ${expected}`);

test('a flight starts and ends on the given views', () => {
  const from = { x: 0, y: 0, w: 400 };
  const to = { x: 900, y: -300, w: 250 };
  const flight = smoothZoom(from, to);
  const start = flight.at(0);
  const end = flight.at(1);
  close(start.x, 0);
  close(start.y, 0);
  close(start.w, 400);
  assert.deepEqual(end, to);
});

test('a long flight pulls back on the way', () => {
  const flight = smoothZoom({ x: 0, y: 0, w: 300 }, { x: 3000, y: 0, w: 300 });
  assert.ok(flight.at(0.5).w > 300);
  assert.ok(flight.duration >= 320 && flight.duration <= 1100);
});

test('a flight in place only zooms', () => {
  const flight = smoothZoom({ x: 5, y: 5, w: 400 }, { x: 5, y: 5, w: 100 });
  const mid = flight.at(0.5);
  close(mid.x, 5);
  close(mid.w, 200);
});

test('arrow hops prefer the nearest node on the axis', () => {
  const from = { x: 0, y: 0 };
  const right = { x: 100, y: 5 };
  const farRight = { x: 300, y: 0 };
  const up = { x: 0, y: -80 };
  const diagonal = { x: 60, y: -60 };
  assert.equal(neighbourInDirection(from, [right, farRight, up, diagonal], { x: 1, y: 0 }), right);
  assert.equal(neighbourInDirection(from, [right, farRight, up, diagonal], { x: 0, y: -1 }), up);
});

test('arrow hops find nothing behind the reader', () => {
  assert.equal(neighbourInDirection({ x: 0, y: 0 }, [{ x: 100, y: 0 }], { x: -1, y: 0 }), undefined);
});

test('title matches rank whole titles, then prefixes, then word starts, then substrings', () => {
  const nodes = ['Binary search tree', 'Search', 'Searching', 'Breadth-first search', 'Research notes'].map((title) => ({
    title,
  }));
  assert.deepEqual(
    matchNodes(nodes, 'search').map((node) => node.title),
    ['Search', 'Searching', 'Binary search tree', 'Breadth-first search', 'Research notes'],
  );
  assert.deepEqual(matchNodes(nodes, '   '), []);
  assert.equal(matchNodes(nodes, 'search', 2).length, 2);
});

test('title matching treats Arabic and Persian letter forms alike', () => {
  const nodes = [{ title: 'یادگیری ماشین' }];
  assert.equal(matchNodes(nodes, 'يادگيري').length, 1);
});

test('labels fade in with zoom, hubs first', () => {
  assert.equal(labelOpacity(0.1, 0, 40), 0);
  assert.equal(labelOpacity(2, 0, 40), 1);
  assert.ok(labelOpacity(0.4, 9, 40) > labelOpacity(0.4, 0, 40));
  assert.ok(labelOpacity(0.8, 0, 300) < labelOpacity(0.8, 0, 40));
});
