import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LAYERS, PATH_LABELS, ROOTS_LAYER, type Story } from '@/data/types';
import { useContent } from '@/state/content';
import type { Tokens } from '@/theme/tokens';

/** Every layer of the current story plus the stories it connects to. */
export function StoryMap({
  story,
  clipIndex,
  ending,
  t,
  onPickClip,
  onPickStory,
}: {
  story: Story;
  clipIndex: number;
  ending: boolean;
  t: Tokens;
  onPickClip: (i: number) => void;
  onPickStory: (id: string) => void;
}) {
  const { getStory } = useContent();
  return (
    <ScrollView contentContainerStyle={styles.wrap}>
      <Text style={[styles.h, { color: t.ink }]}>In this story</Text>
      <View>
        <View style={[styles.spine, { backgroundColor: t.line }]} />
        {story.clips.map((clip, i) => {
          const on = i === clipIndex && !ending;
          const done = i < clipIndex || ending;
          const ring = on ? t.accent : i === ROOTS_LAYER ? t.warm : t.muted;
          return (
            <Pressable key={i} onPress={() => onPickClip(i)} style={styles.row} accessibilityRole="button">
              <View style={[styles.dot, { borderColor: ring, backgroundColor: on ? t.accent : done ? t.muted : t.surface }]} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.small, { color: t.muted }]}>
                  {LAYERS[i].name} · {clip.when}
                </Text>
                <Text style={[styles.clipTitle, { color: on ? t.accent : t.ink }]}>{clip.title}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>
      <Text style={[styles.h, { color: t.ink }]}>Where it leads</Text>
      {story.handoff.paths.map((p) => (
        <Pressable
          key={p.storyId}
          onPress={() => onPickStory(p.storyId)}
          style={[styles.link, { borderColor: t.line, backgroundColor: t.bg }]}
          accessibilityRole="button">
          <Text style={[styles.small, { color: t.accent }]}>{PATH_LABELS[p.kind]}</Text>
          <Text style={{ color: t.ink, fontSize: 15, fontWeight: '600' }}>{getStory(p.storyId)?.title}</Text>
          <Text style={{ color: t.muted, fontSize: 13 }}>{p.reason}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  wrap: { padding: 20, gap: 14 },
  h: { fontSize: 17, fontWeight: '800' },
  spine: { position: 'absolute', left: 5, top: 18, bottom: 18, width: 2 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 8 },
  dot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, marginTop: 4 },
  small: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', fontWeight: '600' },
  clipTitle: { fontSize: 15, fontWeight: '500', lineHeight: 20 },
  link: { borderWidth: 1, borderRadius: 10, padding: 12, gap: 2 },
});
