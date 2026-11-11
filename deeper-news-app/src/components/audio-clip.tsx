import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Clip, Story } from '@/data/types';
import { formatTime } from '@/data/youtube-link';
import { video } from '@/theme/tokens';

import { StoryArt } from './story-art';

const BARS = 28;

/**
 * Plays a podcast or audio clip from its start time over the story's photo,
 * with a moving sound wave. Follows the story's play/pause. If the browser
 * blocks sound until the viewer taps, it shows a "Tap to listen" button.
 */
export function AudioClip({ clip, story, playing }: { clip: Clip; story: Story; playing: boolean }) {
  const audio = clip.audio!;
  const player = useAudioPlayer({ uri: audio.url });
  const status = useAudioPlayerStatus(player);
  const [tick, setTick] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);

  // The first play always jumps to the clip's start time first. A jump made
  // earlier can be lost before the file is fully ready, so it's done here.
  const started = useRef(false);
  const startPlayback = useCallback(async () => {
    if (!started.current) {
      started.current = true;
      await player.seekTo(audio.startSeconds ?? 0).catch(() => {});
    }
    player.play();
  }, [player, audio.startSeconds]);

  // Follow the story's play and pause.
  useEffect(() => {
    if (!status.isLoaded) return;
    if (playing) void startPlayback();
    else player.pause();
  }, [playing, status.isLoaded, player, startPlayback]);

  // Animate the sound wave while sound is playing.
  useEffect(() => {
    if (!status.playing || reduceMotion) return;
    const timer = setInterval(() => setTick((n) => n + 1), 120);
    return () => clearInterval(timer);
  }, [status.playing, reduceMotion]);

  const blocked = playing && status.isLoaded && !status.playing && !status.isBuffering;

  return (
    <StoryArt story={story} dim={0.6} style={StyleSheet.absoluteFill}>
      <View style={styles.center}>
        <Text style={styles.eyebrow}>{status.playing ? 'Listening' : 'Audio clip'}</Text>
        <Text style={styles.show} numberOfLines={2}>
          {audio.show}
        </Text>
        <View style={styles.wave} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
          {Array.from({ length: BARS }, (_, i) => {
            const live = status.playing && !reduceMotion;
            const h = live ? 10 + Math.abs(Math.sin(i * 0.7 + tick * 0.55) * Math.cos(i * 0.31 - tick * 0.2)) * 46 : 8 + (i % 5) * 4;
            return <View key={i} style={[styles.bar, { height: h, opacity: status.playing ? 1 : 0.5 }]} />;
          })}
        </View>
        <Text style={styles.time}>
          {status.isLoaded ? `${formatTime(status.currentTime)} · started at ${formatTime(audio.startSeconds ?? 0)}` : status.error ? '' : 'Loading audio…'}
        </Text>
        {status.error ? (
          <Text style={styles.error}>We couldn’t load this audio. Check the link in the editor.</Text>
        ) : (
          blocked && (
            <Pressable onPress={() => void startPlayback()} accessibilityRole="button" style={styles.tapBtn}>
              <Text style={styles.tapText}>▶ Tap to listen</Text>
            </Pressable>
          )
        )}
      </View>
    </StoryArt>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', left: 24, right: 24, top: '28%', alignItems: 'center', gap: 10 },
  eyebrow: { color: video.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.5, textTransform: 'uppercase' },
  show: { color: video.ink, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  wave: { flexDirection: 'row', alignItems: 'center', gap: 4, height: 64 },
  bar: { width: 4, borderRadius: 2, backgroundColor: video.accent },
  time: { color: video.muted, fontSize: 12, fontVariant: ['tabular-nums'] },
  error: { color: video.warm, fontSize: 13, textAlign: 'center' },
  tapBtn: { backgroundColor: video.ink, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  tapText: { color: video.bg, fontWeight: '700' },
});
