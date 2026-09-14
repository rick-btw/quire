import assert from 'node:assert/strict';
import { test } from 'node:test';
import { topicColorVars } from '../src/lib/topic-colors';

test('topics with a fixed colour do not take a slot in the rotation', () => {
  const vars = topicColorVars([{ slug: 'cs50' }, { slug: 'topic-a' }, { slug: 'topic-b' }]);
  assert.deepEqual(vars, ['--topic-color-cs50', '--topic-0', '--topic-1']);
});

test('the rotation wraps after eight topics', () => {
  const vars = topicColorVars(Array.from({ length: 9 }, (_, i) => ({ slug: `t${i}` })));
  assert.equal(vars[8], '--topic-0');
});
