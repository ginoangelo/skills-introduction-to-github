import type { Story } from './types';

export type StoryImage = {
  /** A bundled image (`require(...)`) or a photo link from the editor. */
  source: number | { uri: string };
  /** What the photo shows, for screen readers. */
  alt: string;
  /** Who made it and its license, shown on screen. */
  credit: string;
};

/**
 * Illustrative photos for the sample stories, from Wikimedia Commons. All are
 * public domain or CC0, so they need no permission; we credit them anyway.
 * They show real places and events that only resemble the fictional stories.
 */
export const STORY_IMAGES: Record<string, StoryImage> = {
  marlow: {
    source: require('../../assets/images/stories/marlow.jpg'),
    alt: 'Floodwater pouring through a breach in a river levee',
    credit: 'U.S. Army Corps of Engineers, Kansas City District · Public domain · Wikimedia Commons',
  },
  ostend: {
    source: require('../../assets/images/stories/ostend.jpg'),
    alt: 'A rebuilt levee armored with rock beside a river',
    credit: 'U.S. Army Corps of Engineers, Sacramento District · Public domain · Wikimedia Commons',
  },
  funding: {
    source: require('../../assets/images/stories/funding.jpg'),
    alt: 'The dome of a state capitol building against a blue sky',
    credit: 'Radomianin · Public domain · Wikimedia Commons',
  },
  insurers: {
    source: require('../../assets/images/stories/insurers.jpg'),
    alt: 'A house damaged by flooding, with debris piled in front',
    credit: 'Photographer not credited · Public domain · Wikimedia Commons',
  },
  grain: {
    source: require('../../assets/images/stories/grain.jpg'),
    alt: 'Boats at a river lock and dam, in an early 1900s photograph',
    credit: 'U.S. Army Corps of Engineers · Public domain · Wikimedia Commons',
  },
  port: {
    source: require('../../assets/images/stories/port.jpg'),
    alt: 'Rows of shipping containers at a large port',
    credit: 'Charles Csavossy · Public domain · Wikimedia Commons',
  },
  schools: {
    source: require('../../assets/images/stories/schools.jpg'),
    alt: 'An old schoolroom with wooden desks and a chalkboard',
    credit: 'National Park Service · Public domain · Wikimedia Commons',
  },
  'room-river': {
    source: require('../../assets/images/stories/room-river.jpg'),
    alt: 'Horses grazing on a green river floodplain under a cloudy sky',
    credit: 'Industrees · CC0 · Wikimedia Commons',
  },
  bayport: {
    source: require('../../assets/images/stories/bayport.jpg'),
    alt: 'Container cranes lit up along a harbor at night',
    credit: 'Syced · CC0 · Wikimedia Commons',
  },
};

/** A story's photo: the built-in one, else the editor's photo link, else none. */
export function storyImage(story: Story): StoryImage | undefined {
  const built = STORY_IMAGES[story.id];
  if (built) return built;
  if (story.image?.uri) return { source: { uri: story.image.uri }, alt: story.image.alt, credit: story.image.credit };
  return undefined;
}
