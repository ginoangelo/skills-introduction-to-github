import { StyleSheet, Text, View } from 'react-native';

import { ROOTS_LAYER } from '@/data/types';
import { storyColor, video } from '@/theme/tokens';

/** Shown in place of a clip until it has a YouTube id. Roots clips turn warm. */
export function VideoPlaceholder({ hue, layer }: { hue: number; layer: number }) {
  const h = layer === ROOTS_LAYER ? 32 : hue;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: storyColor(h, 9) }]}>
      <View style={[styles.glow, { backgroundColor: storyColor(h, 30 - layer * 3), top: '8%', left: '-30%' }]} />
      <View style={[styles.glow, { backgroundColor: storyColor(h, 20), top: '38%', right: '-40%' }]} />
      <View style={styles.label}>
        <Text style={styles.labelTop}>Video slot</Text>
        <Text style={styles.labelSub}>Add a YouTube clip in src/data/stories.ts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', width: '130%', aspectRatio: 1, borderRadius: 9999, opacity: 0.55 },
  label: { position: 'absolute', top: '42%', left: 0, right: 0, alignItems: 'center', gap: 4 },
  labelTop: { color: video.muted, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '600' },
  labelSub: { color: video.muted, fontSize: 12 },
});
