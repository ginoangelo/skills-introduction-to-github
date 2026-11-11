import { distanceKm } from './places';
import type { Place } from './types';

/**
 * Live radio for "Hear it live from there". A short, hand-checked list of
 * public, news and talk stations, picked from the Radio Browser directory
 * (radio-browser.info, free, no key). Music stations are left out on purpose:
 * playing them can need music licences in some countries.
 *
 * Every stream is https so it plays on phones and on the secure website.
 * Streams, names and logos belong to the broadcasters.
 */
export type Station = {
  /** Radio Browser's id for the station, to refresh links later. */
  id: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
  lat: number;
  lng: number;
  kind: string;
  language: string;
  stream: string;
  homepage: string;
};

export const STATIONS: Station[] = [
  {
    id: '96261c69-0601-11e8-ae97-52543be04c81',
    name: 'WFPL 89.3 News',
    city: 'Louisville, Kentucky',
    country: 'United States',
    countryCode: 'US',
    lat: 38.25,
    lng: -85.76,
    kind: 'Public radio · news',
    language: 'English',
    stream: 'https://lpm.streamguys1.com/wfpl-web',
    homepage: 'https://wfpl.org/',
  },
  {
    id: '96260fdb-0601-11e8-ae97-52543be04c81',
    name: 'WKU Public Radio',
    city: 'Bowling Green, Kentucky',
    country: 'United States',
    countryCode: 'US',
    lat: 36.99,
    lng: -86.44,
    kind: 'Public radio · news',
    language: 'English',
    stream: 'https://dal-wku-stream-1.neighborhoodca.com/stream',
    homepage: 'https://www.wkyufm.org/',
  },
  {
    id: '88a782bd-c8f1-4e4c-a5c0-85862ffc6a1b',
    name: 'WKMS 91.3 FM',
    city: 'Murray, Kentucky',
    country: 'United States',
    countryCode: 'US',
    lat: 36.61,
    lng: -88.31,
    kind: 'Public radio · news',
    language: 'English',
    stream: 'https://wkms.streamguys1.com/WKMS1.mp3',
    homepage: 'https://www.wkms.org/',
  },
  {
    id: 'b9a0d793-fc6e-4ab5-b026-647054a15f06',
    name: 'WWNO 89.9',
    city: 'New Orleans, Louisiana',
    country: 'United States',
    countryCode: 'US',
    lat: 29.95,
    lng: -90.07,
    kind: 'Public radio · news',
    language: 'English',
    stream: 'https://tektite.streamguys1.com:5145/wwnolive',
    homepage: 'https://www.wwno.org/',
  },
  {
    id: '41537cc5-896b-4e5c-abf6-82449b6be5bd',
    name: 'NPO Radio 1',
    city: 'Hilversum',
    country: 'Netherlands',
    countryCode: 'NL',
    lat: 52.22,
    lng: 5.17,
    kind: 'National public radio · news and talk',
    language: 'Dutch',
    stream: 'https://icecast.omroep.nl/radio1-sb-aac',
    homepage: 'https://www.nporadio1.nl/',
  },
  {
    id: '3ac246bf-557d-4c62-ae77-e8f1f928897b',
    name: 'Radio Gelderland',
    city: 'Arnhem',
    country: 'Netherlands',
    countryCode: 'NL',
    lat: 51.98,
    lng: 5.91,
    kind: 'Regional public radio · news',
    language: 'Dutch',
    stream: 'https://d2od87akyl46nm.cloudfront.net/icecast/omroepgelderland/radiogelderland',
    homepage: 'https://www.gld.nl/radio/overzicht',
  },
  {
    id: 'da5d71d1-d8cc-4301-9f86-b6abaa1201bd',
    name: 'BNR Nieuwsradio',
    city: 'Amsterdam',
    country: 'Netherlands',
    countryCode: 'NL',
    lat: 52.37,
    lng: 4.9,
    kind: 'News and talk',
    language: 'Dutch',
    stream: 'https://stream.bnr.nl/bnr_mp3_128_20',
    homepage: 'https://www.bnr.nl/',
  },
  {
    id: '36d4a771-6a91-454d-a6e4-d55667aa6dd4',
    name: 'Nigeria Info 99.3',
    city: 'Lagos',
    country: 'Nigeria',
    countryCode: 'NG',
    lat: 6.52,
    lng: 3.38,
    kind: 'News and talk',
    language: 'English',
    stream: 'https://nigeriainfofmlagos993-atunwadigital.streamguys1.com/nigeriainfofmlagos993',
    homepage: 'https://www.nigeriainfo.fm/',
  },
  {
    id: 'e0d49458-2a02-4b6f-9349-a2059b19dc24',
    name: 'Agidigbo 88.7 FM',
    city: 'Ibadan',
    country: 'Nigeria',
    countryCode: 'NG',
    lat: 7.38,
    lng: 3.95,
    kind: 'Community radio · news and talk',
    language: 'English and Yoruba',
    stream: 'https://agidigbostream.com.ng/radio/8000/radio.mp3',
    homepage: 'https://agidigbo887fm.com/',
  },
  {
    id: 'e0dcbcd1-a426-462a-83cb-2f3807c2dc0b',
    name: 'Universal Health Radio (Bangla)',
    city: 'Bangladesh (online)',
    country: 'Bangladesh',
    countryCode: 'BD',
    lat: 23.81,
    lng: 90.41,
    kind: 'Public health news and information',
    language: 'Bengali',
    stream: 'https://radio.universalhealthradio.org/uhr-bn.mp3',
    homepage: 'https://universalhealthradio.org/',
  },
];

/** Stations in the same country as the place, nearest first (at most three). */
export function stationsNear(place: Place, max = 3): Station[] {
  return STATIONS.filter((s) => s.countryCode === place.countryCode)
    .sort((a, b) => distanceKm(place, a) - distanceKm(place, b))
    .slice(0, max);
}
