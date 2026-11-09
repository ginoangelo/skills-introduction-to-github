import { bucketStories, type UserLocation } from './places';
import type { Story } from './types';

export type RingId = 'near' | 'country' | 'world' | 'all';

export type ExploreNode = { story: Story; x: number; y: number; ring: RingId };
/** Rings are ovals on tall, narrow screens: rx across, ry down. */
export type ExploreRing = { id: RingId; rx: number; ry: number };
export type ExploreEdge = { from: string; to: string };
export type ExploreLayout = { nodes: ExploreNode[]; rings: ExploreRing[]; edges: ExploreEdge[]; size: number };

/**
 * Places stories on rings around the viewer: near them in the middle, the rest
 * of their country next, the world outside. Without a location, one ring.
 * Rings grow when they hold many stories, then the whole set is scaled to fit.
 */
export function exploreLayout(stories: Story[], location: UserLocation | null, width: number, height: number): ExploreLayout {
  const groups: { id: RingId; stories: Story[] }[] = location
    ? (() => {
        const b = bucketStories(stories, location);
        return [
          { id: 'near' as const, stories: b.near },
          { id: 'country' as const, stories: b.country },
          { id: 'world' as const, stories: b.world },
        ].filter((g) => g.stories.length > 0);
      })()
    : [{ id: 'all', stories }];

  const size = width < 600 ? 52 : 68;
  const label = 26; // room for the name under each circle
  // Ring radii in pixels, before fitting them to the screen.
  const r: number[] = [];
  groups.forEach((g, i) => {
    const prev = i === 0 ? 0 : r[i - 1];
    const aroundRing = ((size + 22) * g.stories.length) / (2 * Math.PI);
    const single = g.stories.length === 1 && i === 0;
    r.push(single ? 0 : Math.max(aroundRing, prev + size + label + 14));
  });

  // Fit the outer ring to the space. Wide screens keep circles; tall, narrow
  // ones stretch the rings into ovals so stories use the height.
  const outer = r[r.length - 1] || 1;
  const fitX = Math.max(0, width / 2 - size / 2 - 24) / outer;
  const fitY = Math.max(0, height / 2 - size / 2 - label) / outer;
  const uniform = Math.min(fitX, fitY);
  const sx = uniform;
  const sy = fitY > fitX * 1.15 ? Math.min(fitY, fitX * 1.9) : uniform;

  const cx = width / 2;
  const cy = height / 2;
  const nodes: ExploreNode[] = [];
  groups.forEach((g, ring) => {
    const offset = -Math.PI / 2 + ring * 0.45;
    g.stories.forEach((story, i) => {
      const angle = offset + (2 * Math.PI * i) / g.stories.length;
      nodes.push({ story, ring: g.id, x: cx + r[ring] * sx * Math.cos(angle), y: cy + r[ring] * sy * Math.sin(angle) });
    });
  });

  const ids = new Set(nodes.map((n) => n.story.id));
  const seen = new Set<string>();
  const edges: ExploreEdge[] = [];
  for (const s of stories) {
    for (const p of s.handoff.paths) {
      const key = [s.id, p.storyId].sort().join('|');
      if (!ids.has(s.id) || !ids.has(p.storyId) || seen.has(key)) continue;
      seen.add(key);
      edges.push({ from: s.id, to: p.storyId });
    }
  }

  return { nodes, rings: groups.map((g, i) => ({ id: g.id, rx: r[i] * sx, ry: r[i] * sy })), edges, size };
}
