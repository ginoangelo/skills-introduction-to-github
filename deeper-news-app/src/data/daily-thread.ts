import type { Story } from './types';

/**
 * The Daily Thread: connect today's start story to today's target story by
 * following hand-off paths, in as few steps as you can.
 */
export type Puzzle = {
  /** The day this puzzle belongs to, as YYYY-MM-DD. */
  day: string;
  startId: string;
  targetId: string;
  /** One shortest route, start to target. */
  best: string[];
};

/** Shortest route from one story to another along hand-off paths, or null. */
export function shortestPath(stories: Story[], from: string, to: string): string[] | null {
  const byId = new Map(stories.map((s) => [s.id, s]));
  const prev = new Map<string, string | null>([[from, null]]);
  const queue = [from];
  while (queue.length) {
    const id = queue.shift()!;
    if (id === to) break;
    for (const p of byId.get(id)?.handoff.paths ?? []) {
      if (!prev.has(p.storyId) && byId.has(p.storyId)) {
        prev.set(p.storyId, id);
        queue.push(p.storyId);
      }
    }
  }
  if (!prev.has(to)) return null;
  const path: string[] = [];
  for (let at: string | null = to; at !== null; at = prev.get(at) ?? null) path.unshift(at);
  return path;
}

export function dayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** A small, stable number from text, so everyone gets the same puzzle on the same day. */
function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * Today's puzzle: a pair whose shortest route takes 3 or 4 steps if one exists
 * (2 as a fallback), picked the same way for everyone on the same day.
 */
export function puzzleFor(stories: Story[], date: Date): Puzzle | null {
  const day = dayKey(date);
  const pairs: { startId: string; targetId: string; best: string[] }[] = [];
  const ids = stories.map((s) => s.id).sort();
  for (const a of ids) {
    for (const b of ids) {
      if (a === b) continue;
      const best = shortestPath(stories, a, b);
      if (best) pairs.push({ startId: a, targetId: b, best });
    }
  }
  const steps = (p: { best: string[] }) => p.best.length - 1;
  const pool = pairs.filter((p) => steps(p) >= 3 && steps(p) <= 4);
  const fallback = pairs.filter((p) => steps(p) >= 2);
  const choices = pool.length ? pool : fallback;
  if (!choices.length) return null;
  const pick = choices[hash(day) % choices.length];
  return { day, ...pick };
}

/** Text to share a result, without giving away the route. */
export function shareText(puzzle: Puzzle, steps: number, solved: boolean): string {
  const best = puzzle.best.length - 1;
  const marks = solved ? Array.from({ length: steps }, (_, i) => (i < best ? '●' : '○')).join('') : '✕';
  return `Deeper News · Daily Thread ${puzzle.day}\n${solved ? `Connected in ${steps} ${steps === 1 ? 'step' : 'steps'} (best ${best})` : 'Not connected today'}\n${marks}`;
}
