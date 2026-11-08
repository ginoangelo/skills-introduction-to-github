import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildQuery, dedupe, gdeltCountry, parseSeenDate, toCandidate } from '../src/gdelt.mjs';
import { ingestForLocation, pickWorldCountries } from '../src/ingest.mjs';

const article = (n, extra = {}) => ({
  url: `https://example.org/${n}`,
  title: `Story ${n}`,
  seendate: '20261108T143000Z',
  socialimage: '',
  domain: 'example.org',
  language: 'English',
  sourcecountry: 'United States',
  ...extra,
});

test('country names become GDELT sourcecountry values', () => {
  assert.equal(gdeltCountry('United States'), 'unitedstates');
  assert.equal(gdeltCountry('United Kingdom'), 'unitedkingdom');
});

test('queries combine a quoted place and a country', () => {
  assert.equal(buildQuery({ keyword: 'Louisville', country: 'United States' }), '"Louisville" sourcecountry:unitedstates');
  assert.throws(() => buildQuery({}));
});

test('GDELT dates become ISO dates', () => {
  assert.equal(parseSeenDate('20261108T143000Z'), '2026-11-08T14:30:00Z');
  assert.equal(parseSeenDate('bad'), null);
});

test('articles become candidates with a bucket', () => {
  const c = toCandidate(article(1), 'near');
  assert.equal(c.bucket, 'near');
  assert.equal(c.image, null);
  assert.equal(c.seenAt, '2026-11-08T14:30:00Z');
});

test('repeated URLs and titles are dropped', () => {
  const list = [toCandidate(article(1), 'near'), toCandidate(article(1), 'country'), toCandidate(article(2, { title: 'Story 1' }), 'world')];
  assert.equal(dedupe(list).length, 1);
});

test('world countries rotate by day and skip the home country', () => {
  const picks = pickWorldCountries('Nigeria', 3, new Date('2026-11-08'));
  assert.equal(picks.length, 3);
  assert.ok(!picks.includes('Nigeria'));
  assert.notDeepEqual(picks, pickWorldCountries('Nigeria', 3, new Date('2026-11-09')));
});

test('ingest sorts results into near, country and world', async () => {
  const queries = [];
  let n = 0;
  const fetcher = async (q) => {
    queries.push(q);
    return [article(++n)];
  };
  const result = await ingestForLocation({ name: 'Louisville', country: 'United States' }, { fetcher, worldCountries: 2 });
  assert.equal(queries[0], '"Louisville" sourcecountry:unitedstates');
  assert.equal(queries[1], 'sourcecountry:unitedstates');
  assert.equal(queries.length, 4);
  assert.deepEqual(result.counts, { near: 1, country: 1, world: 2 });
});
