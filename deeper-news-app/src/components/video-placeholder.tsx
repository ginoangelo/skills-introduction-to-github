import { StyleSheet, Text, View } from 'react-native';

import { STORY_IMAGES } from '@/data/story-images';
import { ROOTS_LAYER, type Story } from '@/data/types';
import { storyColor, video } from '@/theme/tokens';

import { StoryArt } from './story-art';

/**
 * Shown in place of a clip until it has a YouTube id: the story's photo,
 * darkened, or its color when there's no photo. Roots clips turn warm.
 */
export function VideoPlaceholder({ story, layer }: { story: Story; layer: number }) {
  const art = STORY_IMAGES[story.id];
  if (art) {
    return (
      <StoryArt story={story} dim={0.35} style={StyleSheet.absoluteFill}>
        {layer === ROOTS_LAYER && <View style={[StyleSheet.absoluteFill, styles.sepia]} />}
        <View style={styles.label}>
          <Text style={styles.labelTop}>Video slot</Text>
          <Text style={styles.labelSub}>Illustrative photo until a clip is added</Text>
        </View>
        <Text style={styles.credit} numberOfLines={1}>
          Photo: {art.credit}
        </Text>
      </StoryArt>
    );
  }
  const h = layer === ROOTS_LAYER ? 32 : story.hue;
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
  sepia: { backgroundColor: 'rgba(120, 70, 20, 0.35)' },
  label: { position: 'absolute', top: '40%', left: 0, right: 0, alignItems: 'center', gap: 4 },
  labelTop: { color: video.ink, fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', fontWeight: '700' },
  labelSub: { color: video.muted, fontSize: 12 },
  credit: { position: 'absolute', right: 10, top: 96, maxWidth: '70%', color: video.muted, fontSize: 10 },
});
