import { bucketStories, type UserLocation } from './places';
import type { Story } from './types';

export type RingId = 'near' | 'country' | 'world' | 'all';

export type ExploreNode = { story: Story; x: number; y: number; ring: RingId };
/** Rings are ovals on tall, narrow screens: rx across, ry down. */
export type ExploreRing = { id: RingId; rx: number; ry: number };
export type ExploreEdge = { from: string; to: string };
/** On narrow screens each group is a labelled row instead of a ring. */
export type ExploreBand = { id: RingId; y: number };
export type ExploreLayout = {
  nodes: ExploreNode[];
  rings: ExploreRing[];
  bands: ExploreBand[];
  edges: ExploreEdge[];
  size: number;
  /** Total drawing height; taller than the screen when rows need to scroll. */
  height: number;
};

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

  const edges = connections(stories, new Set(groups.flatMap((g) => g.stories.map((s) => s.id))));

  // Phones: rings would squeeze the nearby stories together, so stack the groups as rows.
  if (width < 600) {
    const size = 52;
    const cellW = size + 40;
    const cols = Math.max(2, Math.floor(width / cellW));
    const rowH = size + 44;
    const nodes: ExploreNode[] = [];
    const bands: ExploreBand[] = [];
    let y = 8;
    for (const g of groups) {
      bands.push({ id: g.id, y });
      y += 26;
      for (let i = 0; i < g.stories.length; i += cols) {
        const row = g.stories.slice(i, i + cols);
        const x0 = (width - row.length * cellW) / 2 + cellW / 2;
        row.forEach((story, j) => nodes.push({ story, ring: g.id, x: x0 + j * cellW, y: y + size / 2 }));
        y += rowH;
      }
      y += 14;
    }
    const shift = Math.max(0, (height - y) / 2);
    return {
      nodes: nodes.map((n) => ({ ...n, y: n.y + shift })),
      bands: bands.map((b) => ({ ...b, y: b.y + shift })),
      rings: [],
      edges,
      size,
      height: Math.max(height, y),
    };
  }

  const size = 68;
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

  return { nodes, rings: groups.map((g, i) => ({ id: g.id, rx: r[i] * sx, ry: r[i] * sy })), bands: [], edges, size, height };
}

/** One line per pair of stories joined by a hand-off path. */
function connections(stories: Story[], ids: Set<string>): ExploreEdge[] {
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
  return edges;
}
