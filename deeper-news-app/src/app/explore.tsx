import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Ellipse, Path } from 'react-native-svg';

import { StoryArt } from '@/components/story-art';
import { exploreLayout, type RingId } from '@/data/explore-layout';
import { distanceKm, placeLabel } from '@/data/places';
import { getStory, STORIES } from '@/data/stories';
import { PATH_LABELS, type Story } from '@/data/types';
import { useAppState } from '@/state/app-state';
import { useTokens, WIDE_BREAKPOINT, type Tokens } from '@/theme/tokens';

export default function ExploreScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const { location, seen, startChain } = useAppState();
  const [area, setArea] = useState({ w: 0, h: 0 });
  const [selected, setSelected] = useState<string | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);

  const focus = hovered ?? selected;
  const layout = exploreLayout(STORIES, location, area.w, area.h);
  const byId = new Map(layout.nodes.map((n) => [n.story.id, n]));
  const linked = new Set<string>();
  if (focus) {
    for (const e of layout.edges) {
      if (e.from === focus) linked.add(e.to);
      if (e.to === focus) linked.add(e.from);
    }
  }
  const selectedStory = selected ? getStory(selected) : undefined;

  const onLayout = (e: LayoutChangeEvent) => {
    const { width: w, height: h } = e.nativeEvent.layout;
    if (Math.abs(w - area.w) > 1 || Math.abs(h - area.h) > 1) setArea({ w, h });
  };
  const watch = (id: string) => {
    startChain(id);
    router.push({ pathname: '/story/[id]', params: { id } });
  };
  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));

  const ringLabel: Record<RingId, string> = {
    near: location ? `Near ${location.name}` : 'Near you',
    country: 'Your country',
    world: 'Around the world',
    all: 'Today',
  };
  const cx = area.w / 2;
  const cy = area.h / 2;

  return (
    <View style={[styles.fill, { backgroundColor: t.bg, paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Pressable onPress={back} accessibilityRole="button" style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]}>
          <Text style={{ color: t.ink, fontWeight: '600' }}>← Today</Text>
        </Pressable>
        <View style={{ flex: 1, minWidth: 160 }}>
          <Text style={[styles.h1, { color: t.ink }]}>Explore</Text>
          <Text style={{ color: t.muted, fontSize: 13 }}>
            {location ? `Stories around ${location.name}, and how they connect.` : 'Today’s stories and how they connect.'}{' '}
            {wide ? 'Hover a story to see its links.' : 'Tap a story to see its links.'}
          </Text>
        </View>
        <Text style={[styles.count, { color: t.muted }]}>
          {seen.size} of {STORIES.length} watched
        </Text>
      </View>
      {layout.rings.length > 1 && (
        <Text style={[styles.key, { color: t.muted }]}>
          {layout.rings.map((r, i) => `${['Inner', 'Middle', 'Outer'][i]} ring: ${ringLabel[r.id]}`).join('   ·   ')}
        </Text>
      )}

      <View style={[styles.fill, wide && styles.row]}>
        <View style={styles.fill} onLayout={onLayout}>
          {area.w > 0 && (
            <>
              <Svg width={area.w} height={area.h} style={StyleSheet.absoluteFill}>
                {layout.rings.map((r) =>
                  r.rx > 0 ? (
                    <Ellipse key={r.id} cx={cx} cy={cy} rx={r.rx} ry={r.ry} stroke={t.line} strokeWidth={1.5} strokeDasharray="4 6" fill="none" />
                  ) : null,
                )}
                {layout.edges.map((e) => {
                  const a = byId.get(e.from)!;
                  const b = byId.get(e.to)!;
                  const on = !!focus && (e.from === focus || e.to === focus);
                  // Bend each line toward the center so links read as arcs, not spokes.
                  const qx = (a.x + b.x) / 2 + (cx - (a.x + b.x) / 2) * 0.35;
                  const qy = (a.y + b.y) / 2 + (cy - (a.y + b.y) / 2) * 0.35;
                  return (
                    <Path
                      key={`${e.from}-${e.to}`}
                      d={`M${a.x},${a.y} Q${qx},${qy} ${b.x},${b.y}`}
                      stroke={on ? t.accent : t.muted}
                      strokeOpacity={on ? 1 : focus ? 0.15 : 0.35}
                      strokeWidth={on ? 3 : 1.5}
                      fill="none"
                    />
                  );
                })}
              </Svg>

              {layout.nodes.map((n) => {
                const id = n.story.id;
                const isFocus = focus === id;
                const dim = !!focus && !isFocus && !linked.has(id);
                const s = layout.size;
                return (
                  <Pressable
                    key={id}
                    onPress={() => setSelected(selected === id ? null : id)}
                    onHoverIn={() => setHovered(id)}
                    onHoverOut={() => setHovered(null)}
                    accessibilityRole="button"
                    accessibilityLabel={`${n.story.title}. ${seen.has(id) ? 'Watched.' : ''}`}
                    style={[styles.node, { left: n.x - s / 2 - 20, top: n.y - s / 2, width: s + 40, opacity: dim ? 0.35 : 1 }]}>
                    <View
                      style={[
                        styles.ring,
                        {
                          width: s,
                          height: s,
                          borderRadius: s / 2,
                          borderColor: isFocus ? t.accent : seen.has(id) ? t.warm : t.surface,
                          borderWidth: isFocus ? 4 : 3,
                        },
                        seen.has(id) && { shadowColor: t.warm, shadowOpacity: 0.7, shadowRadius: 10, shadowOffset: { width: 0, height: 0 } },
                      ]}>
                      <StoryArt story={n.story} style={{ flex: 1, borderRadius: s / 2 }} />
                    </View>
                    <Text numberOfLines={1} style={[styles.nodeLabel, { color: t.ink, fontWeight: isFocus ? '800' : '600' }]}>
                      {n.story.short}
                    </Text>
                  </Pressable>
                );
              })}
            </>
          )}
        </View>

        {wide ? (
          <View style={[styles.panel, { backgroundColor: t.surface, borderColor: t.line }]}>
            {selectedStory ? (
              <Preview story={selectedStory} t={t} km={location ? distanceKm(location, selectedStory.place) : undefined} onWatch={watch} onPick={setSelected} />
            ) : (
              <View style={styles.panelEmpty}>
                <Text style={[styles.panelTitle, { color: t.ink }]}>Pick a story</Text>
                <Text style={{ color: t.muted }}>
                  Click any circle to preview it and see where it leads. Stories you’ve watched glow orange, so you can see how much ground you’ve covered.
                </Text>
                <View style={styles.legend}>
                  <Legend color={t.accent} label="Selected and its links" t={t} />
                  <Legend color={t.warm} label="Watched" t={t} />
                </View>
              </View>
            )}
          </View>
        ) : (
          selectedStory && (
            <View style={[styles.sheet, { backgroundColor: t.surface, borderColor: t.line, paddingBottom: insets.bottom + 12 }]}>
              <Preview
                story={selectedStory}
                t={t}
                compact
                km={location ? distanceKm(location, selectedStory.place) : undefined}
                onWatch={watch}
                onPick={setSelected}
                onClose={() => setSelected(null)}
              />
            </View>
          )
        )}
      </View>
    </View>
  );
}

function Preview({
  story,
  t,
  km,
  compact,
  onWatch,
  onPick,
  onClose,
}: {
  story: Story;
  t: Tokens;
  km?: number;
  compact?: boolean;
  onWatch: (id: string) => void;
  onPick: (id: string) => void;
  onClose?: () => void;
}) {
  return (
    <ScrollView contentContainerStyle={{ gap: 10, padding: compact ? 16 : 0 }}>
      {!compact && <StoryArt story={story} style={styles.banner} />}
      <View style={styles.previewHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: t.muted }]}>{story.topic}</Text>
          <Text style={[styles.previewTitle, { color: t.ink }]}>{story.title}</Text>
        </View>
        {onClose && (
          <Pressable onPress={onClose} accessibilityLabel="Close preview" style={[styles.close, { backgroundColor: t.bg }]}>
            <Text style={{ color: t.ink }}>✕</Text>
          </Pressable>
        )}
      </View>
      <Text style={{ color: t.muted, fontSize: 13 }}>
        {placeLabel(story.place)}
        {km !== undefined ? ` · ${km < 10 ? 'nearby' : `${Math.round(km).toLocaleString('en-US')} km away`}` : ''} · {story.minutes} min
      </Text>
      <Pressable onPress={() => onWatch(story.id)} accessibilityRole="button" style={[styles.watch, { backgroundColor: t.accent }]}>
        <Text style={{ color: t.accentInk, fontWeight: '700' }}>Watch this story</Text>
      </Pressable>
      <Text style={[styles.eyebrow, { color: t.muted, marginTop: 4 }]}>Where it leads</Text>
      {story.handoff.paths.map((p) => (
        <Pressable key={p.storyId} onPress={() => onPick(p.storyId)} style={[styles.link, { borderColor: t.line, backgroundColor: t.bg }]}>
          <Text style={[styles.eyebrow, { color: t.accent }]}>{PATH_LABELS[p.kind]}</Text>
          <Text style={{ color: t.ink, fontWeight: '600' }}>{getStory(p.storyId)?.title}</Text>
          <Text style={{ color: t.muted, fontSize: 12 }}>{p.reason}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Legend({ color, label, t }: { color: string; label: string; t: Tokens }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <View style={{ width: 14, height: 14, borderRadius: 7, borderWidth: 3, borderColor: color }} />
      <Text style={{ color: t.ink, fontSize: 13 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  row: { flexDirection: 'row' },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 12 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
  count: { fontSize: 12 },
  key: { paddingHorizontal: 16, fontSize: 12, fontWeight: '600' },
  node: { position: 'absolute', alignItems: 'center', gap: 4 },
  ring: { overflow: 'hidden' },
  nodeLabel: { fontSize: 11, textAlign: 'center' },
  panel: { width: 340, margin: 16, marginLeft: 0, borderWidth: 1, borderRadius: 16, padding: 18 },
  panelEmpty: { gap: 12 },
  panelTitle: { fontSize: 19, fontWeight: '800' },
  legend: { gap: 8, marginTop: 4 },
  banner: { height: 150, borderRadius: 12 },
  previewHead: { flexDirection: 'row', gap: 10, alignItems: 'flex-start' },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  previewTitle: { fontSize: 19, fontWeight: '800', lineHeight: 23 },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  watch: { borderRadius: 999, paddingVertical: 11, alignItems: 'center' },
  link: { borderWidth: 1, borderRadius: 10, padding: 10, gap: 2 },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '58%', borderTopWidth: 1, borderTopLeftRadius: 16, borderTopRightRadius: 16 },
});
