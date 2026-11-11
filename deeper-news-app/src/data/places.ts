import type { Place, Story } from './types';

/** A place someone can pick as "where I am". */
export type UserLocation = Place & { id: string };

/**
 * Starter list for the location picker. Phase 2 swaps this for a real place
 * search, and phones can offer "use my current location" as an option.
 */
export const LOCATION_OPTIONS: UserLocation[] = [
  { id: 'louisville', name: 'Louisville', region: 'Kentucky', country: 'United States', countryCode: 'US', lat: 38.25, lng: -85.76 },
  { id: 'chicago', name: 'Chicago', region: 'Illinois', country: 'United States', countryCode: 'US', lat: 41.88, lng: -87.63 },
  { id: 'new-york', name: 'New York', region: 'New York', country: 'United States', countryCode: 'US', lat: 40.71, lng: -74.01 },
  { id: 'new-orleans', name: 'New Orleans', region: 'Louisiana', country: 'United States', countryCode: 'US', lat: 29.95, lng: -90.07 },
  { id: 'los-angeles', name: 'Los Angeles', region: 'California', country: 'United States', countryCode: 'US', lat: 34.05, lng: -118.24 },
  { id: 'toronto', name: 'Toronto', region: 'Ontario', country: 'Canada', countryCode: 'CA', lat: 43.65, lng: -79.38 },
  { id: 'mexico-city', name: 'Mexico City', country: 'Mexico', countryCode: 'MX', lat: 19.43, lng: -99.13 },
  { id: 'sao-paulo', name: 'São Paulo', country: 'Brazil', countryCode: 'BR', lat: -23.55, lng: -46.63 },
  { id: 'london', name: 'London', region: 'England', country: 'United Kingdom', countryCode: 'GB', lat: 51.51, lng: -0.13 },
  { id: 'amsterdam', name: 'Amsterdam', country: 'Netherlands', countryCode: 'NL', lat: 52.37, lng: 4.9 },
  { id: 'lagos', name: 'Lagos', country: 'Nigeria', countryCode: 'NG', lat: 6.52, lng: 3.38 },
  { id: 'nairobi', name: 'Nairobi', country: 'Kenya', countryCode: 'KE', lat: -1.29, lng: 36.82 },
  { id: 'dhaka', name: 'Dhaka', country: 'Bangladesh', countryCode: 'BD', lat: 23.81, lng: 90.41 },
  { id: 'mumbai', name: 'Mumbai', country: 'India', countryCode: 'IN', lat: 19.08, lng: 72.88 },
  { id: 'tokyo', name: 'Tokyo', country: 'Japan', countryCode: 'JP', lat: 35.68, lng: 139.69 },
  { id: 'sydney', name: 'Sydney', region: 'New South Wales', country: 'Australia', countryCode: 'AU', lat: -33.87, lng: 151.21 },
];

/** Stories within this distance count as "near you". */
export const NEAR_KM = 400;

/** Great-circle distance in kilometres. */
export function distanceKm(a: Pick<Place, 'lat' | 'lng'>, b: Pick<Place, 'lat' | 'lng'>): number {
  const rad = (d: number) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

export type Buckets = { near: Story[]; country: Story[]; world: Story[] };

/** Splits stories into near you, elsewhere in your country, and the rest of the world. */
export function bucketStories(stories: Story[], where: UserLocation): Buckets {
  const out: Buckets = { near: [], country: [], world: [] };
  const sorted = [...stories].sort((a, b) => distanceKm(where, a.place) - distanceKm(where, b.place));
  for (const s of sorted) {
    if (distanceKm(where, s.place) <= NEAR_KM) out.near.push(s);
    else if (s.place.countryCode === where.countryCode) out.country.push(s);
    else out.world.push(s);
  }
  return out;
}

export function placeLabel(p: Place): string {
  return [p.name, p.region, p.country].filter(Boolean).join(', ');
}
