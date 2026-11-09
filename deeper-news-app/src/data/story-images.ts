export type StoryImage = {
  /** A bundled image: `require('../../assets/images/stories/<id>.jpg')`. */
  source: number;
  /** What the photo shows, for screen readers. */
  alt: string;
  /** Who made it and its license, shown on screen. */
  credit: string;
};

/** Illustrative photos for the sample stories. Filled in below. */
export const STORY_IMAGES: Record<string, StoryImage> = {};
