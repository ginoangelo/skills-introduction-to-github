import type { Breach } from './types';

/** Raw breach object from the Have I Been Pwned v3 API (fields we use). */
type HibpBreach = {
  Name: string;
  Title: string;
  Domain: string;
  BreachDate: string;
  DataClasses: string[];
};

export class UpstreamBusyError extends Error {}
export class UpstreamError extends Error {}

export type BreachLookup = (email: string) => Promise<Breach[]>;

/**
 * Looks an email up in Have I Been Pwned. Docs: https://haveibeenpwned.com/API/v3
 * A 404 means the address is in no known breach.
 */
export function hibpLookup(getApiKey: () => Promise<string>, fetchImpl: typeof fetch = fetch): BreachLookup {
  return async (email) => {
    const url = `https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(email)}?truncateResponse=false`;
    const res = await fetchImpl(url, {
      headers: { 'hibp-api-key': await getApiKey(), 'user-agent': 'Veil-Privacy-App' },
    });
    if (res.status === 404) return [];
    if (res.status === 429) throw new UpstreamBusyError('Breach database rate limit reached');
    if (!res.ok) throw new UpstreamError(`Breach database returned ${res.status}`);
    const raw = (await res.json()) as HibpBreach[];
    return raw
      .map((b) => ({
        name: b.Name,
        title: b.Title,
        domain: b.Domain,
        breachDate: b.BreachDate,
        dataClasses: b.DataClasses ?? [],
      }))
      .sort((a, b) => b.breachDate.localeCompare(a.breachDate))
      .slice(0, 50);
  };
}
