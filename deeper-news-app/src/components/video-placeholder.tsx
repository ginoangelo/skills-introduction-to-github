import { useEffect, useState } from 'react';
import { AccessibilityInfo, Animated, Easing, Platform, StyleSheet, Text, View } from 'react-native';

import { storyImage } from '@/data/story-images';
import type { Clip, Story } from '@/data/types';
import { storyColor, video } from '@/theme/tokens';

import { StoryArt } from './story-art';

const SURFACE = 0;
const FOOTAGE = 1;
const VOICES = 2;
const ROOTS = 3;
const RIPPLES = 4;

/**
 * What a clip shows until it has video: each layer gets its own look, so going
 * deeper feels like going somewhere.
 * - Surface: the full photo.
 * - Footage: the photo, closer, slowly zooming.
 * - Voices: a quote card.
 * - Roots: a sepia archive card with the year in large type.
 * - Ripples: a calendar tab with when it happened.
 */
export function VideoPlaceholder({ story, clip, layer }: { story: Story; clip: Clip; layer: number }) {
  const art = storyImage(story);
  const reduceMotion = useReduceMotion();
  const [zoom] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (layer !== FOOTAGE || reduceMotion) return;
    zoom.setValue(1.08);
    const anim = Animated.timing(zoom, { toValue: 1.22, duration: 9000, easing: Easing.out(Easing.quad), useNativeDriver: Platform.OS !== 'web' });
    anim.start();
    return () => anim.stop();
  }, [layer, reduceMotion, zoom]);

  const dim = layer === SURFACE ? 0.15 : layer === FOOTAGE ? 0.1 : 0.6;
  const year = /\b(1[89]\d\d|20\d\d)\b/.exec(clip.when)?.[1];

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: storyColor(layer === ROOTS ? 32 : story.hue, 9), overflow: 'hidden' }]}>
      <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale: layer === FOOTAGE ? zoom : 1 }] }]}>
        <StoryArt story={story} dim={dim} style={StyleSheet.absoluteFill} />
      </Animated.View>
      {layer === ROOTS && <View style={[StyleSheet.absoluteFill, styles.sepia]} />}

      {layer === VOICES && (
        <View style={styles.center}>
          <Text style={styles.quoteMark} accessibilityElementsHidden>
            “
          </Text>
          <Text style={styles.quote}>{clip.quote?.text ?? clip.title}</Text>
          <Text style={styles.who}>— {clip.quote?.who ?? clip.source}</Text>
        </View>
      )}

      {layer === ROOTS && (
        <View style={styles.center}>
          <Text style={styles.archive}>From the archive</Text>
          <Text style={[styles.year, !year && styles.yearLong]}>{year ?? clip.when}</Text>
        </View>
      )}

      {layer === RIPPLES && (
        <View style={styles.center}>
          <View style={styles.calendar}>
            <Text style={styles.calTop}>What followed</Text>
            <Text style={styles.calDay}>{clip.when}</Text>
          </View>
        </View>
      )}

      {art && (
        <Text style={styles.credit} numberOfLines={1}>
          Photo: {art.credit}
        </Text>
      )}
    </View>
  );
}

function useReduceMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduce).catch(() => {});
  }, []);
  return reduce;
}

const serif = Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, "Times New Roman", serif' });

const styles = StyleSheet.create({
  sepia: { backgroundColor: 'rgba(120, 70, 20, 0.45)' },
  center: { position: 'absolute', left: 28, right: 28, top: '20%', alignItems: 'center', gap: 10 },
  quoteMark: { color: video.accent, fontSize: 96, lineHeight: 96, fontFamily: serif, marginBottom: -30 },
  quote: { color: video.ink, fontSize: 26, lineHeight: 34, fontFamily: serif, fontStyle: 'italic', textAlign: 'center' },
  who: { color: video.muted, fontSize: 14, fontWeight: '600', textAlign: 'center' },
  archive: { color: video.warm, fontSize: 12, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  year: { color: '#F3E2C7', fontSize: 120, lineHeight: 124, fontFamily: serif, fontWeight: '700' },
  yearLong: { fontSize: 56, lineHeight: 62 },
  calendar: { backgroundColor: video.ink, borderRadius: 14, overflow: 'hidden', minWidth: 170, alignItems: 'center' },
  calTop: { backgroundColor: video.accent, color: video.bg, alignSelf: 'stretch', textAlign: 'center', fontSize: 12, fontWeight: '800', letterSpacing: 1.5, textTransform: 'uppercase', paddingVertical: 8 },
  calDay: { color: video.bg, fontSize: 40, fontWeight: '800', paddingHorizontal: 18, paddingVertical: 14, textAlign: 'center' },
  credit: { position: 'absolute', right: 10, top: 112, maxWidth: '70%', color: video.muted, fontSize: 10 },
});
