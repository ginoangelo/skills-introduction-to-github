import { Pressable, StyleSheet, Text, View } from 'react-native';

import { placeLabel } from '@/data/places';
import { getStory } from '@/data/stories';
import { LAYERS, type Story, type Thread } from '@/data/types';
import { storyColor, video, type Tokens } from '@/theme/tokens';

export function StoryRing({ story, seen, t, onPress }: { story: Story; seen: boolean; t: Tokens; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={`Watch ${story.title}`} style={styles.ring}>
      <View style={[styles.ringOuter, { borderColor: seen ? t.line : t.accent }]}>
        <View style={[styles.ringInner, { backgroundColor: storyColor(story.hue), borderColor: t.bg }]} />
      </View>
      <Text numberOfLines={2} style={[styles.ringLabel, { color: t.ink }]}>
        {story.short}
      </Text>
    </Pressable>
  );
}

export function StoryCard({
  story,
  seen,
  t,
  onPress,
  km,
}: {
  story: Story;
  seen: boolean;
  t: Tokens;
  onPress: () => void;
  /** Distance from the viewer, when they've chosen a location. */
  km?: number;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, { backgroundColor: t.surface, borderColor: pressed ? t.accent : t.line }]}>
      <View style={[styles.thumb, { backgroundColor: storyColor(story.hue) }]}>
        <View style={styles.thumbBars}>
          {story.clips.map((_, i) => (
            <View key={i} style={styles.thumbBar} />
          ))}
        </View>
        <Text style={styles.thumbLen}>{story.minutes} min</Text>
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.eyebrow, { color: t.muted }]}>{story.topic}</Text>
        <Text style={[styles.cardTitle, { color: seen ? t.muted : t.ink }]}>{story.title}</Text>
        <Text style={[styles.place, { color: t.muted }]}>
          {placeLabel(story.place)}
          {km !== undefined ? ` · ${formatKm(km)}` : ''}
        </Text>
        <View style={styles.chips}>
          {LAYERS.map((l) => (
            <Text key={l.name} style={[styles.chip, { color: t.muted, borderColor: t.line }]}>
              {l.name}
            </Text>
          ))}
        </View>
        <Text style={[styles.connects, { color: t.muted }]}>
          Connects to{' '}
          {story.handoff.paths.map((p, i) => (
            <Text key={p.storyId} style={{ color: t.ink, fontWeight: '600' }}>
              {i ? ', ' : ''}
              {getStory(p.storyId)?.short}
            </Text>
          ))}
        </Text>
      </View>
    </Pressable>
  );
}

export function ThreadCard({
  thread,
  following,
  t,
  onToggle,
  onOpenStory,
}: {
  thread: Thread;
  following: boolean;
  t: Tokens;
  onToggle: () => void;
  onOpenStory: (id: string) => void;
}) {
  return (
    <View style={[styles.thread, { backgroundColor: t.surface, borderColor: t.line }]}>
      <View style={styles.threadHead}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.eyebrow, { color: t.muted }]}>{thread.kind}</Text>
          <Text style={[styles.threadName, { color: t.ink }]}>{thread.name}</Text>
        </View>
        <Pressable
          onPress={onToggle}
          accessibilityRole="button"
          accessibilityState={{ selected: following }}
          style={[styles.follow, { borderColor: t.accent, backgroundColor: following ? t.accent : 'transparent' }]}>
          <Text style={{ color: following ? t.accentInk : t.accent, fontWeight: '700', fontSize: 13 }}>
            {following ? 'Following' : 'Follow'}
          </Text>
        </Pressable>
      </View>
      <View style={styles.chips}>
        {thread.storyIds.map((id) => (
          <Pressable key={id} onPress={() => onOpenStory(id)} style={[styles.mini, { backgroundColor: t.bg }]}>
            <Text style={{ color: t.ink, fontSize: 13 }}>{getStory(id)?.short}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function formatKm(km: number): string {
  if (km < 10) return 'nearby';
  return `${Math.round(km).toLocaleString('en-US')} km away`;
}

const styles = StyleSheet.create({
  place: { fontSize: 13 },
  ring: { width: 78, alignItems: 'center', gap: 6 },
  ringOuter: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, padding: 2 },
  ringInner: { flex: 1, borderRadius: 999, borderWidth: 2 },
  ringLabel: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
  card: { flexDirection: 'row', gap: 14, borderWidth: 1, borderRadius: 12, padding: 12 },
  thumb: { width: 104, aspectRatio: 9 / 13, borderRadius: 8, overflow: 'hidden' },
  thumbBars: { position: 'absolute', top: 6, left: 6, right: 6, flexDirection: 'row', gap: 3 },
  thumbBar: { flex: 1, height: 3, borderRadius: 2, backgroundColor: video.line },
  thumbLen: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    color: video.ink,
    fontSize: 11,
    backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  cardBody: { flex: 1, minWidth: 0, gap: 6 },
  eyebrow: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  cardTitle: { fontSize: 18, lineHeight: 21, fontWeight: '800', letterSpacing: -0.3 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { fontSize: 11, borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 1 },
  connects: { fontSize: 13 },
  thread: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 10 },
  threadHead: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  threadName: { fontSize: 15, fontWeight: '700' },
  follow: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 4 },
  mini: { borderRadius: 4, paddingHorizontal: 8, paddingVertical: 4 },
});
