import { LOCATION_OPTIONS } from './places';
import { LAYERS, type Story } from './types';

/** A short id from the story's name, plus a random tail so two drafts never clash. */
export function newStoryId(name: string): string {
  const base =
    name
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 24) || 'story';
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

export function blankStory(): Story {
  const city = LOCATION_OPTIONS[0];
  return {
    id: '',
    draft: true,
    short: '',
    title: '',
    topic: '',
    hue: Math.floor(Math.random() * 360),
    minutes: 3,
    place: { name: city.name, region: city.region, country: city.country, countryCode: city.countryCode, lat: city.lat, lng: city.lng },
    clips: LAYERS.map(() => ({ title: '', when: '', source: '', rights: '', why: '', seconds: 20 })),
    predict: { decoys: ['', ''] },
    handoff: { question: '', paths: [] },
  };
}

/** A copy of a story to edit as your own, with a new id. */
export function copyStory(story: Story): Story {
  const copy: Story = JSON.parse(JSON.stringify(story));
  return { ...copy, id: '', draft: true, short: copy.short, title: `${copy.title} (copy)` };
}

/** Plain-language problems that stop a story from being saved. Empty when it's ready. */
export function storyProblems(story: Story, knownIds: Set<string>): string[] {
  const problems: string[] = [];
  if (!story.title.trim()) problems.push('Add a headline.');
  if (!story.short.trim()) problems.push('Add a short name for the story circle.');
  if (!story.topic.trim()) problems.push('Add a topic, like Politics or Climate.');
  story.clips.forEach((c, i) => {
    const layer = LAYERS[i]?.name ?? `Clip ${i + 1}`;
    if (!c.title.trim()) problems.push(`${layer}: add a clip title.`);
    if (!c.why.trim()) problems.push(`${layer}: say why this clip belongs in the story.`);
    if (!(c.seconds > 0)) problems.push(`${layer}: set how many seconds it plays.`);
    if (c.audio?.url.trim()) {
      if (!/^https:\/\//.test(c.audio.url.trim())) problems.push(`${layer}: the audio link must start with https://`);
      if (!c.audio.show.trim()) problems.push(`${layer}: name the show or source the audio comes from.`);
      if (!Number.isFinite(c.audio.startSeconds ?? 0)) problems.push(`${layer}: write the audio start time like 12:40.`);
    }
  });
  const decoys = story.predict?.decoys ?? ['', ''];
  if (decoys.some((d) => d.trim()) && !decoys.every((d) => d.trim())) {
    problems.push('What happens next: fill in both wrong answers, or leave both empty to skip the guess.');
  }
  if (!story.handoff.question.trim()) problems.push('Hand-off: add the question the story ends on.');
  if (story.handoff.paths.length === 0) problems.push('Hand-off: add at least one path to another story.');
  story.handoff.paths.forEach((p, i) => {
    if (!p.storyId || !knownIds.has(p.storyId)) problems.push(`Path ${i + 1}: pick the story it leads to.`);
    if (!p.reason.trim()) problems.push(`Path ${i + 1}: say how the stories connect.`);
  });
  if (story.image?.uri && !/^https:\/\//.test(story.image.uri)) problems.push('Photo: use a link that starts with https://');
  return problems;
}

/** Drops the guess when both wrong answers are empty, and trims text. */
export function cleanStory(story: Story): Story {
  const decoys = story.predict?.decoys ?? ['', ''];
  const hasPredict = decoys.every((d) => d.trim());
  return {
    ...story,
    title: story.title.trim(),
    short: story.short.trim(),
    topic: story.topic.trim(),
    predict: hasPredict ? { decoys: [decoys[0].trim(), decoys[1].trim()] } : undefined,
    clips: story.clips.map((c) => {
      const url = c.audio?.url.trim();
      const { audio: _drop, ...rest } = c;
      return url ? { ...rest, audio: { url, show: c.audio!.show.trim(), startSeconds: c.audio!.startSeconds ?? 0 } } : rest;
    }),
    image: story.image?.uri?.trim() ? { uri: story.image.uri.trim(), alt: story.image.alt.trim() || story.title.trim(), credit: story.image.credit.trim() } : undefined,
  };
}
