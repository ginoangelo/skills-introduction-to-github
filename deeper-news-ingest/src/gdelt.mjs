// Client for the GDELT DOC 2.0 API (https://api.gdeltproject.org/api/v2/doc/doc).
// GDELT is free and asks for no more than one request every 5 seconds.

const ENDPOINT = 'https://api.gdeltproject.org/api/v2/doc/doc';
const MIN_GAP_MS = 5500;
const RATE_LIMIT_TEXT = 'Please limit requests';

let lastRequestAt = 0;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** GDELT's sourcecountry filter takes the country name, lower case, without spaces. */
export function gdeltCountry(countryName) {
  return countryName.toLowerCase().replace(/[^a-z]/g, '');
}

/** Builds a DOC API query, e.g. `"Louisville" sourcecountry:unitedstates`. */
export function buildQuery({ keyword, country, theme } = {}) {
  const parts = [];
  if (keyword) parts.push(`"${keyword.replace(/"/g, '')}"`);
  if (country) parts.push(`sourcecountry:${gdeltCountry(country)}`);
  if (theme) parts.push(`theme:${theme}`);
  if (parts.length === 0) throw new Error('A GDELT query needs a keyword, a country or a theme.');
  return parts.join(' ');
}

/** "20261108T143000Z" -> ISO 8601. */
export function parseSeenDate(s) {
  const m = /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/.exec(s ?? '');
  return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}Z` : null;
}

/** Turns one GDELT article into the shape the app's editor will review. */
export function toCandidate(article, bucket) {
  return {
    title: (article.title ?? '').trim(),
    url: article.url,
    source: article.domain,
    language: article.language,
    sourceCountry: article.sourcecountry,
    seenAt: parseSeenDate(article.seendate),
    image: article.socialimage || null,
    bucket,
  };
}

/** Keeps the first article per URL and per title, since syndicated copies repeat. */
export function dedupe(candidates) {
  const seen = new Set();
  return candidates.filter((c) => {
    const keys = [c.url, c.title.toLowerCase()];
    if (!c.title || keys.some((k) => seen.has(k))) return false;
    keys.forEach((k) => seen.add(k));
    return true;
  });
}

/**
 * Fetches recent articles. Waits between calls and retries when GDELT says
 * to slow down. Returns GDELT's raw article objects.
 */
export async function fetchArticles(query, { timespan = '1d', max = 25, retries = 6 } = {}) {
  const url = `${ENDPOINT}?${new URLSearchParams({
    query,
    mode: 'artlist',
    format: 'json',
    sort: 'datedesc',
    timespan,
    maxrecords: String(max),
  })}`;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const wait = lastRequestAt + MIN_GAP_MS * (attempt + 1) - Date.now();
    if (wait > 0) await sleep(wait);
    lastRequestAt = Date.now();

    const res = await fetch(url, { headers: { 'user-agent': 'deeper-news-ingest/0.1' } });
    const text = await res.text();
    if (text.startsWith(RATE_LIMIT_TEXT)) continue;
    if (!res.ok) throw new Error(`GDELT returned ${res.status} for ${query}`);
    if (!text.trim()) return [];
    try {
      return JSON.parse(text).articles ?? [];
    } catch {
      throw new Error(`GDELT sent something that isn't JSON for ${query}: ${text.slice(0, 120)}`);
    }
  }
  throw new Error(`GDELT kept asking us to slow down for ${query}. Try again in a few minutes.`);
}
