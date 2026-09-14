import assert from 'node:assert/strict';
import test from 'node:test';
import { attachmentHrefWithBase, joinBase, noteHrefWithBase, tagHrefWithBase } from '../src/lib/vault/hrefs';
import { headingSlug, headingSlugs, slugifyPath, slugifySegment, tagSlug } from '../src/lib/vault/slug';

test('segments lower-case, hyphenate whitespace and drop punctuation', () => {
  assert.equal(slugifySegment('1. Two Sum'), '1-two-sum');
  assert.equal(slugifySegment('  LeetCode   Grind '), 'leetcode-grind');
  assert.equal(slugifySegment('hash_maps-v2'), 'hash_maps-v2');
  assert.equal(slugifySegment("What's new?!"), 'whats-new');
  assert.equal(slugifySegment('???'), 'untitled');
});

test('unicode letters survive and format controls are stripped', () => {
  assert.equal(slugifySegment('نامه تگفا ۱'), 'نامه-تگفا-۱');
  const withZwnj = 'می' + String.fromCharCode(0x200c) + 'کند';
  assert.equal(slugifySegment(withZwnj), 'میکند');
  assert.equal(slugifySegment('Café'), 'café');
  assert.equal(slugifySegment('Café'), 'café');
});

test('paths keep folder structure and drop the extension', () => {
  assert.equal(slugifyPath('LeetCode Grind/1. Two Sum.md'), 'leetcode-grind/1-two-sum');
  assert.equal(slugifyPath('programming/python/List Comprehensions.MD'), 'programming/python/list-comprehensions');
  assert.equal(slugifyPath('index.md'), 'index');
});

test('heading slugs de-duplicate like github-slugger', () => {
  assert.deepEqual(headingSlugs(['Same heading', 'Same heading', 'x^2']), ['same-heading', 'same-heading-1', 'x2']);
  assert.equal(headingSlug('How it works'), 'how-it-works');
});

test('tags may be nested and prefixed with #', () => {
  assert.equal(tagSlug('#Data Structures/Trees'), 'data-structures/trees');
  assert.equal(tagSlug('python'), 'python');
});

test('hrefs honour the base path and encode unicode', () => {
  assert.equal(joinBase('/', ''), '/');
  assert.equal(joinBase('/quire', 'graph/'), '/quire/graph/');
  assert.equal(joinBase('/quire/', '/graph/'), '/quire/graph/');
  assert.equal(noteHrefWithBase('/', 'index'), '/');
  assert.equal(noteHrefWithBase('/quire', 'index'), '/quire/');
  assert.equal(noteHrefWithBase('/quire', 'a/b', 'shape'), '/quire/notes/a/b/#shape');
  assert.equal(noteHrefWithBase('/', 'موضوع/مقدمه'), '/notes/%D9%85%D9%88%D8%B6%D9%88%D8%B9/%D9%85%D9%82%D8%AF%D9%85%D9%87/');
  assert.equal(attachmentHrefWithBase('/quire', 'attachments/My Image.svg'), '/quire/attachments/My%20Image.svg');
  assert.equal(attachmentHrefWithBase('/', 'structures/diagram.svg'), '/attachments/structures/diagram.svg');
  assert.equal(tagHrefWithBase('/quire', 'data-structures/trees'), '/quire/tags/data-structures/trees/');
});
