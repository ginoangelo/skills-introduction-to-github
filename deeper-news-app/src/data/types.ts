/** The five layers every story plays through, from the headline down. */
export const LAYERS = [
  { name: 'Surface', depth: 'the headline' },
  { name: 'Footage', depth: 'what happened' },
  { name: 'Voices', depth: 'who was there' },
  { name: 'Roots', depth: 'why it happened' },
  { name: 'Ripples', depth: 'what followed' },
] as const;

export const ROOTS_LAYER = 3;

export type Clip = {
  title: string;
  /** When it was filmed, e.g. "Day 0, 6:42 a.m." or "2019". */
  when: string;
  /** Who filmed or published it. */
  source: string;
  /** Rights status shown to viewers, e.g. "Licensed", "Public record". */
  rights: string;
  /** One sentence on why this clip belongs in the story. */
  why: string;
  /** YouTube video id (the part after watch?v=). Leave out to show a placeholder. */
  youtubeId?: string;
  /** Where in the YouTube video the clip starts, in seconds. */
  startSeconds?: number;
  /** How long to play before moving to the next clip, in seconds. */
  seconds: number;
  /**
   * A podcast or audio clip, used when there's no YouTube video. `url` is the
   * audio file itself (the episode's file from the show's public feed).
   */
  audio?: { url: string; startSeconds?: number; show: string };
};

export type PathKind = 'money' | 'people' | 'place';

export const PATH_LABELS: Record<PathKind, string> = {
  money: 'Follow the money',
  people: 'Follow the people',
  place: 'Follow the place',
};

export type HandoffPath = {
  kind: PathKind;
  storyId: string;
  /** Short line on how the next story connects. */
  reason: string;
};

/** Where a story happened. */
export type Place = {
  name: string;
  region?: string;
  country: string;
  /** ISO 3166-1 alpha-2, e.g. "US", "NG". */
  countryCode: string;
  lat: number;
  lng: number;
};

/** A photo from the web, for stories made in the editor. */
export type RemoteImage = { uri: string; alt: string; credit: string };

export type Story = {
  id: string;
  place: Place;
  /** True for stories made in the editor and saved on this device. */
  draft?: boolean;
  /** Photo link for editor stories; built-in stories use story-images.ts. */
  image?: RemoteImage;
  /** Short name for story circles. */
  short: string;
  title: string;
  topic: string;
  /** Hue (0–360) used for this story's placeholder art. */
  hue: number;
  minutes: number;
  /** One clip per layer, in layer order. */
  clips: Clip[];
  /**
   * "What happens next?": two believable outcomes that did NOT happen. The real
   * one is the Ripples clip's title. Shown before the Ripples clip plays.
   */
  predict?: { decoys: [string, string] };
  handoff: {
    /** The question the end of this story asks. The next story answers it. */
    question: string;
    /** The first path plays automatically after the countdown. */
    paths: HandoffPath[];
  };
};

export type Thread = {
  id: string;
  name: string;
  kind: 'Place' | 'Person' | 'Decision' | 'Issue';
  storyIds: string[];
};
