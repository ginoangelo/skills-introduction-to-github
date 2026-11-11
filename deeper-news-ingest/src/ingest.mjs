// Gathers story candidates for one location: near it, elsewhere in its
// country, and around the world. Phase 2 runs this on a schedule (AWS Lambda)
// and saves the results for the editor to approve.

import { buildQuery, dedupe, fetchArticles, toCandidate } from './gdelt.mjs';

/** Countries sampled for "around the world", rotated so people see new places. */
export const WORLD_COUNTRIES = [
  'Nigeria', 'Bangladesh', 'Brazil', 'Japan', 'Kenya', 'India', 'Mexico',
  'Netherlands', 'Australia', 'Canada', 'United Kingdom', 'South Africa',
];

export function pickWorldCountries(home, count, day = new Date()) {
  const pool = WORLD_COUNTRIES.filter((c) => c !== home);
  const start = Math.floor(day.getTime() / 86_400_000) % pool.length;
  return Array.from({ length: Math.min(count, pool.length) }, (_, i) => pool[(start + i) % pool.length]);
}

/**
 * @param {{ name: string, region?: string, country: string }} location
 * @param {{ perBucket?: number, worldCountries?: number, fetcher?: typeof fetchArticles }} [options]
 */
export async function ingestForLocation(location, { perBucket = 10, worldCountries = 2, fetcher = fetchArticles } = {}) {
  const jobs = [
    { bucket: 'near', query: buildQuery({ keyword: location.name, country: location.country }), max: perBucket },
    { bucket: 'country', query: buildQuery({ country: location.country }), max: perBucket },
    ...pickWorldCountries(location.country, worldCountries).map((c) => ({
      bucket: 'world',
      query: buildQuery({ country: c }),
      max: Math.ceil(perBucket / worldCountries),
    })),
  ];

  // One failed query shouldn't throw away the others: record it and keep going.
  const found = [];
  const errors = [];
  for (const job of jobs) {
    try {
      const articles = await fetcher(job.query, { max: job.max });
      found.push(...articles.map((a) => toCandidate(a, job.bucket)));
    } catch (err) {
      errors.push({ bucket: job.bucket, query: job.query, message: err instanceof Error ? err.message : String(err) });
    }
  }

  const all = dedupe(found);
  return {
    location,
    fetchedAt: new Date().toISOString(),
    counts: Object.fromEntries(['near', 'country', 'world'].map((b) => [b, all.filter((c) => c.bucket === b).length])),
    errors,
    candidates: all,
  };
}
