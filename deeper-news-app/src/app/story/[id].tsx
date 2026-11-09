import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import { PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClipPlayer } from '@/components/clip-player';
import { StoryArt } from '@/components/story-art';
import { StoryMap } from '@/components/story-map';
import { getStory } from '@/data/stories';
import { LAYERS, PATH_LABELS, ROOTS_LAYER, type Story } from '@/data/types';
import { useAppState } from '@/state/app-state';
import { useTokens, video, WIDE_BREAKPOINT } from '@/theme/tokens';

/** Clips without a YouTube id play as placeholders for this long. */
const PLACEHOLDER_SECONDS = 7;
/** Countdown before the first hand-off path starts on its own. */
const HANDOFF_SECONDS = 6;
const TICK = 0.1;

type Playback = { clipIndex: number; elapsed: number; ending: boolean; handoff: number };
type PlaybackAction =
  | { type: 'tick'; durations: number[] }
  | { type: 'next'; last: number }
  | { type: 'prev' }
  | { type: 'pick'; index: number }
  | { type: 'end' };

const INITIAL: Playback = { clipIndex: 0, elapsed: 0, ending: false, handoff: 0 };

function advance(s: Playback, last: number): Playback {
  return s.clipIndex < last ? { ...s, clipIndex: s.clipIndex + 1, elapsed: 0 } : { ...s, ending: true, handoff: 0 };
}

/** Clip progress and the hand-off countdown, moved forward one tick at a time. */
function playback(s: Playback, a: PlaybackAction): Playback {
  switch (a.type) {
    case 'tick': {
      if (s.ending) return { ...s, handoff: s.handoff + TICK };
      const elapsed = s.elapsed + TICK;
      return elapsed < a.durations[s.clipIndex] ? { ...s, elapsed } : advance(s, a.durations.length - 1);
    }
    case 'next':
      return s.ending ? s : advance(s, a.last);
    case 'prev':
      if (s.ending) return { ...s, ending: false, elapsed: 0 };
      if (s.elapsed > 1.5 || s.clipIndex === 0) return { ...s, elapsed: 0 };
      return { ...s, clipIndex: s.clipIndex - 1, elapsed: 0 };
    case 'pick':
      return { clipIndex: a.index, elapsed: 0, ending: false, handoff: 0 };
    case 'end':
      return { ...s, ending: true, handoff: 0 };
  }
}

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const story = getStory(String(id ?? ''));
  if (!story) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: video.bg }]}>
        <Text style={{ color: video.ink, fontSize: 18 }}>We couldn’t find that story.</Text>
        <Pressable onPress={() => router.replace('/')} style={[styles.btn, { marginTop: 16 }]}>
          <Text style={styles.btnText}>Back to Today</Text>
        </Pressable>
      </View>
    );
  }
  return <Player key={story.id} story={story} />;
}

function Player({ story }: { story: Story }) {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const { chain, markSeen, startChain, pushChain, popChain } = useAppState();

  const [{ clipIndex, elapsed, ending, handoff }, dispatch] = useReducer(playback, INITIAL);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const durations = useMemo(() => story.clips.map((c) => (c.youtubeId ? c.seconds : PLACEHOLDER_SECONDS)), [story]);
  const clip = story.clips[clipIndex];
  const duration = durations[clipIndex];
  const lastClip = story.clips.length - 1;
  const running = !paused && !(mapOpen && !wide);

  // Someone landing here from a shared link has no chain yet, so start one.
  useEffect(() => {
    markSeen(story.id);
    if (chain.length === 0) startChain(story.id);
  }, [story.id, chain.length, markSeen, startChain]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => dispatch({ type: 'tick', durations }), TICK * 1000);
    return () => clearInterval(timer);
  }, [running, durations]);

  const goToStory = useCallback(
    (nextId: string) => {
      pushChain(nextId);
      router.replace({ pathname: '/story/[id]', params: { id: nextId } });
    },
    [pushChain],
  );

  const goBackInChain = useCallback(() => {
    const previous = popChain();
    if (previous) router.replace({ pathname: '/story/[id]', params: { id: previous } });
  }, [popChain]);

  const close = useCallback(() => {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }, []);

  const next = useCallback(() => dispatch({ type: 'next', last: lastClip }), [lastClip]);
  const prev = useCallback(() => dispatch({ type: 'prev' }), []);
  const pickClip = (index: number) => {
    dispatch({ type: 'pick', index });
    setMapOpen(false);
  };

  // When the countdown runs out, the first path plays.
  useEffect(() => {
    if (ending && handoff >= HANDOFF_SECONDS) goToStory(story.handoff.paths[0].storyId);
  }, [ending, handoff, goToStory, story]);

  // Swipe left: next connected story. Swipe right: back along the chain. Swipe down: close.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 || g.dy > 24,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > 60 && Math.abs(g.dx) > Math.abs(g.dy)) {
            if (g.dx < 0) goToStory(story.handoff.paths[0].storyId);
            else goBackInChain();
          } else if (g.dy > 100 && Math.abs(g.dy) > Math.abs(g.dx)) close();
        },
      }),
    [goToStory, goBackInChain, close, story],
  );

  // Keyboard on the website.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next();
      else if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowDown') goToStory(story.handoff.paths[0].storyId);
      else if (e.key === 'ArrowUp') goBackInChain();
      else if (e.key === 'Escape') close();
      else if (e.key === ' ') {
        e.preventDefault();
        setPaused((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, goToStory, goBackInChain, close, story]);

  const screenHeight = Math.min(height - 48, 860);
  const layer = LAYERS[clipIndex];

  return (
    <View style={[styles.fill, styles.root, { backgroundColor: wide ? video.scrim : video.bg }]}>
      <StatusBar style="light" />
      <View
        {...pan.panHandlers}
        style={[styles.screen, wide ? { height: screenHeight, width: (screenHeight * 9) / 16, borderRadius: 16 } : styles.fill]}>
        <ClipPlayer clip={clip} story={story} layer={clipIndex} />

        {/* Tap zones sit at the edges so YouTube's own controls stay usable in the middle. */}
        <Pressable accessibilityLabel="Previous clip" onPress={prev} style={[styles.tapZone, { left: 0 }]} />
        <Pressable accessibilityLabel="Next clip" onPress={next} style={[styles.tapZone, { right: 0 }]} />

        <View style={[styles.top, { paddingTop: (wide ? 0 : insets.top) + 12 }]}>
          <View style={styles.segs}>
            {story.clips.map((_, i) => (
              <View key={i} style={styles.seg}>
                <View
                  style={[
                    styles.segFill,
                    { width: `${i < clipIndex || ending ? 100 : i === clipIndex ? Math.min(100, (elapsed / duration) * 100) : 0}%` },
                  ]}
                />
              </View>
            ))}
          </View>
          <View style={styles.head}>
            <StoryArt story={story} style={styles.avatar} />
            <View style={{ flex: 1, minWidth: 0 }}>
              <Text numberOfLines={1} style={styles.headTitle}>
                {story.title}
              </Text>
              <Text numberOfLines={1} style={styles.headSub}>
                {story.topic} · {story.place.name}, {story.place.country}
                {chain.length > 1 ? ` · story ${chain.length} in your chain` : ''}
              </Text>
            </View>
            <Pressable onPress={() => setPaused((p) => !p)} style={styles.iconBtn} accessibilityLabel={paused ? 'Play' : 'Pause'}>
              <Text style={styles.iconText}>{paused ? '▶' : '❚❚'}</Text>
            </Pressable>
            <Pressable onPress={close} style={styles.iconBtn} accessibilityLabel="Close story">
              <Text style={styles.iconText}>✕</Text>
            </Pressable>
          </View>
        </View>

        <View style={[styles.bottom, { paddingBottom: (wide ? 0 : insets.bottom) + 16 }]} pointerEvents="box-none">
          <Text style={[styles.layerChip, { backgroundColor: clipIndex === ROOTS_LAYER ? video.warm : video.accent }]}>
            {layer.name} · {layer.depth}
          </Text>
          <Text style={styles.clipTitle}>{clip.title}</Text>
          <Text style={styles.meta}>
            {clip.when} · {clip.source} · {clip.rights}
          </Text>
          <Text style={styles.why}>{clip.why}</Text>
          <View style={styles.actions}>
            <Pressable onPress={next} style={[styles.btn, styles.btnPrimary]}>
              <Text style={[styles.btnText, { color: video.bg }]}>
                {clipIndex < lastClip ? `Go deeper ↓ ${LAYERS[clipIndex + 1].name}` : 'Where it leads →'}
              </Text>
            </Pressable>
            {!wide && (
              <Pressable onPress={() => setMapOpen(true)} style={styles.btn}>
                <Text style={styles.btnText}>Story map</Text>
              </Pressable>
            )}
            {clipIndex < lastClip && (
              <Pressable onPress={() => dispatch({ type: 'end' })} style={styles.btn}>
                <Text style={styles.btnText}>Where it leads →</Text>
              </Pressable>
            )}
          </View>
          {!wide && <Text style={styles.hint}>Tap the edges to move between clips · swipe left for the next story</Text>}
        </View>

        {ending && (
          <ScrollView
            style={[StyleSheet.absoluteFill, styles.handoffScroll]}
            contentContainerStyle={[styles.handoff, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
            <Text style={styles.eyebrow}>
              {chain.length > 1 ? `Story ${chain.length} in your chain` : 'End of story'} · up next
            </Text>
            <Text style={styles.question}>{story.handoff.question}</Text>
            <View style={{ gap: 10 }}>
              {story.handoff.paths.map((p, i) => {
                const target = getStory(p.storyId);
                return (
                  <Pressable key={p.storyId} onPress={() => goToStory(p.storyId)} style={styles.path} accessibilityRole="button">
                    {target && <StoryArt story={target} style={styles.pathThumb} />}
                    <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
                      <Text style={styles.pathKind}>{PATH_LABELS[p.kind]}</Text>
                      <Text style={styles.pathTitle}>{target?.title}</Text>
                      <Text style={styles.pathReason}>{p.reason}</Text>
                    </View>
                    {i === 0 && <View style={[styles.countdown, { width: `${Math.min(100, (handoff / HANDOFF_SECONDS) * 100)}%` }]} />}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              {paused ? 'Paused' : `${PATH_LABELS[story.handoff.paths[0].kind]} starts in ${Math.max(0, Math.ceil(HANDOFF_SECONDS - handoff))} s`}
            </Text>
            <View style={styles.actions}>
              <Pressable onPress={() => pickClip(0)} style={styles.btn}>
                <Text style={styles.btnText}>Watch again</Text>
              </Pressable>
              <Pressable onPress={close} style={styles.btn}>
                <Text style={styles.btnText}>Back to Today</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {!wide && mapOpen && (
          <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom }]}>
            <Pressable onPress={() => setMapOpen(false)} style={[styles.sheetClose, { backgroundColor: t.bg }]} accessibilityLabel="Close story map">
              <Text style={{ color: t.ink, fontSize: 16 }}>✕</Text>
            </Pressable>
            <StoryMap story={story} clipIndex={clipIndex} ending={ending} t={t} onPickClip={pickClip} onPickStory={goToStory} />
          </View>
        )}
      </View>

      {wide && (
        <View style={[styles.side, { height: screenHeight, backgroundColor: t.surface, borderColor: t.line }]}>
          <StoryMap story={story} clipIndex={clipIndex} ending={ending} t={t} onPickClip={pickClip} onPickStory={goToStory} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  screen: { overflow: 'hidden', backgroundColor: video.bg, alignSelf: 'stretch' },
  tapZone: { position: 'absolute', top: 110, bottom: 280, width: '22%' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 14, gap: 10, backgroundColor: 'rgba(0,0,0,0.28)', paddingBottom: 10 },
  segs: { flexDirection: 'row', gap: 4 },
  seg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: video.line, overflow: 'hidden' },
  segFill: { height: '100%', backgroundColor: video.ink },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: video.accent },
  headTitle: { color: video.ink, fontSize: 14, fontWeight: '700' },
  headSub: { color: video.muted, fontSize: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: video.glass, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: video.ink, fontSize: 14 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 16, gap: 10, backgroundColor: 'rgba(0,0,0,0.5)' },
  layerChip: { alignSelf: 'flex-start', color: video.bg, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 3, overflow: 'hidden' },
  clipTitle: { color: video.ink, fontSize: 26, lineHeight: 28, fontWeight: '800', letterSpacing: -0.5 },
  meta: { color: video.muted, fontSize: 13 },
  why: { color: video.ink, fontSize: 15, lineHeight: 21, maxWidth: 420 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { borderWidth: 1, borderColor: video.line, backgroundColor: video.glass, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  btnPrimary: { backgroundColor: video.ink, borderColor: video.ink },
  btnText: { color: video.ink, fontSize: 14, fontWeight: '600' },
  hint: { color: video.muted, fontSize: 12 },
  handoffScroll: { backgroundColor: video.handoff },
  handoff: { flexGrow: 1, paddingHorizontal: 20, justifyContent: 'center', gap: 16 },
  eyebrow: { color: video.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase' },
  question: { color: video.ink, fontSize: 30, lineHeight: 33, fontWeight: '800', letterSpacing: -0.6 },
  path: { flexDirection: 'row', gap: 12, alignItems: 'center', borderWidth: 1, borderColor: video.line, backgroundColor: video.card, borderRadius: 12, padding: 10, overflow: 'hidden' },
  pathThumb: { width: 52, height: 72, borderRadius: 6 },
  pathKind: { color: video.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  pathTitle: { color: video.ink, fontSize: 16, fontWeight: '700', lineHeight: 20 },
  pathReason: { color: video.muted, fontSize: 13 },
  countdown: { position: 'absolute', left: 0, bottom: 0, height: 3, backgroundColor: video.accent },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '78%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetClose: { position: 'absolute', right: 12, top: 12, zIndex: 1, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  side: { width: 340, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
});
