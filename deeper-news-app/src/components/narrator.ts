import * as Speech from 'expo-speech';

import { LAYERS, PATH_LABELS, type Story } from '@/data/types';

/**
 * Reads text aloud with the device's built-in voice (free, no account) and
 * calls `onEnd` once when it finishes. A safety timer also ends it, so a
 * device with no voice, or one that never reports finishing, can't stall the
 * story. Returns a function that stops speaking without calling `onEnd`.
 */
export function narrate(text: string, onEnd: () => void): () => void {
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(safety);
    onEnd();
  };
  const words = text.split(/\s+/).length;
  const safety = setTimeout(finish, Math.max(4000, words * 420 + 2000));
  try {
    Speech.speak(text, { rate: 1, onDone: finish, onStopped: finish, onError: finish });
  } catch {
    finish();
  }
  return () => {
    finished = true;
    clearTimeout(safety);
    Speech.stop().catch(() => {});
  };
}

export function stopNarration() {
  Speech.stop().catch(() => {});
}

/** What the narrator says when a clip starts. The first clip also names the story. */
export function clipNarration(story: Story, index: number): string {
  const clip = story.clips[index];
  const intro = index === 0 ? `${story.title}. ` : '';
  return `${intro}${LAYERS[index].name}. ${clip.title}. ${clip.why}`;
}

/** What the narrator says at the end: the question, then each path. */
export function handoffNarration(story: Story, titleOf: (id: string) => string | undefined): string {
  const paths = story.handoff.paths.map((p) => `${PATH_LABELS[p.kind]}: ${titleOf(p.storyId) ?? ''}.`).join(' ');
  return `${story.handoff.question} ${paths}`;
}

export function predictNarration(options: string[]): string {
  return `Before you see what followed: what do you think happened next? ${options.map((o, i) => `${i + 1}. ${o}.`).join(' ')}`;
}
