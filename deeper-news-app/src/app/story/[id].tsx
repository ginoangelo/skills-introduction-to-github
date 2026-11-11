import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { AccessibilityInfo, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ClipPlayer } from '@/components/clip-player';
import { StoryArt } from '@/components/story-art';
import { clipNarration, handoffNarration, narrate, predictNarration } from '@/components/narrator';
import { LiveRadio } from '@/components/live-radio';
import { StoryMap } from '@/components/story-map';
import { distanceKm } from '@/data/places';
import { stationsNear } from '@/data/stations';
import { LAYERS, PATH_LABELS, ROOTS_LAYER, type Story } from '@/data/types';
import { useAppState } from '@/state/app-state';
import { useContent } from '@/state/content';
import { useTokens, video, WIDE_BREAKPOINT } from '@/theme/tokens';

/** Clips without a YouTube id play as placeholders for this long. */
const PLACEHOLDER_SECONDS = 7;
/** Countdown before the first hand-off path starts on its own. */
const HANDOFF_SECONDS = 6;
const TICK = 0.1;

type Playback = { clipIndex: number; elapsed: number; ending: boolean; handoff: number; predicting: boolean };
/** `predictAt`: the clip to pause before for "What happens next?", or null when there's nothing to guess. */
type PlaybackAction =
  | { type: 'tick'; durations: number[]; predictAt: number | null }
  | { type: 'next'; last: number; predictAt: number | null }
  | { type: 'prev' }
  | { type: 'pick'; index: number }
  | { type: 'end' }
  | { type: 'guessed' };

const INITIAL: Playback = { clipIndex: 0, elapsed: 0, ending: false, handoff: 0, predicting: false };

function advance(s: Playback, last: number, predictAt: number | null): Playback {
  if (predictAt !== null && s.clipIndex + 1 === predictAt) return { ...s, predicting: true };
  return s.clipIndex < last ? { ...s, clipIndex: s.clipIndex + 1, elapsed: 0 } : { ...s, ending: true, handoff: 0 };
}

/** Clip progress, the guessing pause and the hand-off countdown, moved forward one tick at a time. */
function playback(s: Playback, a: PlaybackAction): Playback {
  switch (a.type) {
    case 'tick': {
      if (s.predicting) return s;
      if (s.ending) return { ...s, handoff: s.handoff + TICK };
      const elapsed = s.elapsed + TICK;
      return elapsed < a.durations[s.clipIndex] ? { ...s, elapsed } : advance(s, a.durations.length - 1, a.predictAt);
    }
    case 'next':
      return s.ending || s.predicting ? s : advance(s, a.last, a.predictAt);
    case 'prev':
      if (s.predicting) return { ...s, predicting: false, elapsed: 0 };
      if (s.ending) return { ...s, ending: false, elapsed: 0 };
      if (s.elapsed > 1.5 || s.clipIndex === 0) return { ...s, elapsed: 0 };
      return { ...s, clipIndex: s.clipIndex - 1, elapsed: 0 };
    case 'pick':
      return { clipIndex: a.index, elapsed: 0, ending: false, handoff: 0, predicting: false };
    case 'end':
      return { ...s, ending: true, handoff: 0, predicting: false };
    case 'guessed':
      return { ...s, predicting: false, clipIndex: s.clipIndex + 1, elapsed: 0 };
  }
}

/** The real outcome plus two decoys, in an order that's fixed per story but not always first. */
function predictionOptions(story: Story): { text: string; correct: boolean }[] {
  if (!story.predict) return [];
  const real = story.clips[story.clips.length - 1].title;
  const all = [{ text: real, correct: true }, ...story.predict.decoys.map((text) => ({ text, correct: false }))];
  const shift = [...story.id].reduce((n, ch) => n + ch.charCodeAt(0), 0) % all.length;
  return [...all.slice(shift), ...all.slice(0, shift)];
}

export default function StoryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getStory, ready } = useContent();
  const story = getStory(String(id ?? ''));
  if (!story && !ready) return <View style={[styles.fill, { backgroundColor: video.bg }]} />;
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
  const { chain, markSeen, startChain, pushChain, popChain, guesses, recordGuess, listen, toggleListen, classMode } = useAppState();
  const { getStory } = useContent();

  const [{ clipIndex, elapsed, ending, handoff, predicting }, dispatch] = useReducer(playback, INITIAL);
  const [paused, setPaused] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [radioOpen, setRadioOpen] = useState(false);
  const stations = useMemo(() => stationsNear(story.place), [story.place]);
  const radioPlace = stations[0] && distanceKm(story.place, stations[0]) < 400 ? story.place.name : story.place.country;
  const openRadio = () => {
    setPaused(true); // the story waits while you listen
    setRadioOpen(true);
  };

  const durations = useMemo(() => story.clips.map((c) => (c.youtubeId || c.audio?.url ? c.seconds : PLACEHOLDER_SECONDS)), [story]);
  const clip = story.clips[clipIndex];
  const layer = LAYERS[clipIndex];
  const duration = durations[clipIndex];
  const lastClip = story.clips.length - 1;
  // Ask "What happens next?" before the last clip: once per story, or every time in class mode.
  const predictAt = story.predict && (classMode || !guesses.has(story.id)) ? lastClip : null;
  // Listen mode: each clip, guess and hand-off is read aloud, and the story
  // waits until the narrator finishes that part before moving on.
  const segmentKey = `${story.id}:${clipIndex}:${ending ? 'end' : predicting ? 'guess' : 'clip'}`;
  const [narratedKey, setNarratedKey] = useState<string | null>(null);
  const speaking = listen && !paused && narratedKey !== segmentKey;
  const running = !paused && !(mapOpen && !wide) && !speaking;

  useEffect(() => {
    if (!listen || paused) return;
    const text = predicting
      ? predictNarration(predictionOptions(story).map((o) => o.text))
      : ending
        ? handoffNarration(story, (id) => getStory(id)?.title)
        : clipNarration(story, clipIndex);
    return narrate(text, () => setNarratedKey(segmentKey));
  }, [listen, paused, segmentKey, predicting, ending, clipIndex, story, getStory]);

  // Someone landing here from a shared link has no chain yet, so start one.
  useEffect(() => {
    markSeen(story.id);
    if (chain.length === 0) startChain(story.id);
  }, [story.id, chain.length, markSeen, startChain]);

  useEffect(() => {
    if (!running) return;
    const timer = setInterval(() => dispatch({ type: 'tick', durations, predictAt }), TICK * 1000);
    return () => clearInterval(timer);
  }, [running, durations, predictAt]);

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

  const next = useCallback(() => dispatch({ type: 'next', last: lastClip, predictAt }), [lastClip, predictAt]);
  const prev = useCallback(() => dispatch({ type: 'prev' }), []);
  const heldPause = useRef(false);
  const holdStart = () => {
    if (paused) return;
    heldPause.current = true;
    setPaused(true);
  };
  const holdEnd = () => {
    if (!heldPause.current) return;
    heldPause.current = false;
    setPaused(false);
  };

  const pickClip = (index: number) => {
    dispatch({ type: 'pick', index });
    setMapOpen(false);
  };

  // "Stay here" stops the countdown. With the device's reduce-motion setting on,
  // there's no countdown at all: people pick a path when they're ready.
  const [stayHere, setStayHere] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion).catch(() => {});
  }, []);
  const autoNext = !stayHere && !reduceMotion && !classMode;

  // When the countdown runs out, the first path plays.
  useEffect(() => {
    if (autoNext && ending && handoff >= HANDOFF_SECONDS) goToStory(story.handoff.paths[0].storyId);
  }, [autoNext, ending, handoff, goToStory, story]);

  // Swipe left: next connected story. Swipe right: back along the chain. Swipe down: close.
  const pan = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > 24 || Math.abs(g.dy) > 24,
        onPanResponderRelease: (_, g) => {
          if (Math.abs(g.dx) > 60 && Math.abs(g.dx) > Math.abs(g.dy)) {
            if (g.dx < 0) goToStory(story.handoff.paths[0].storyId);
            else goBackInChain();
          } else if (g.dy > 100 && Math.abs(g.dy) > Math.abs(g.dx)) close();
          else if (g.dy < -70 && Math.abs(g.dy) > Math.abs(g.dx)) next(); // swipe up = go deeper
        },
      }),
    [goToStory, goBackInChain, close, story, next],
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

  return (
    <View style={[styles.fill, styles.root, { backgroundColor: wide ? video.scrim : video.bg }]}>
      <StatusBar style="light" />
      <View
        {...pan.panHandlers}
        style={[styles.screen, wide ? { height: screenHeight, width: (screenHeight * 9) / 16, borderRadius: 16 } : styles.fill]}>
        <ClipPlayer clip={clip} story={story} layer={clipIndex} playing={running && !ending && !predicting} />

        {/* Tap zones sit at the edges so YouTube's own controls stay usable in the middle. */}
        <Pressable accessibilityLabel="Previous clip" onPress={prev} onLongPress={holdStart} onPressOut={holdEnd} delayLongPress={250} style={[styles.tapZone, { left: 0 }]} />
        <Pressable accessibilityLabel="Next clip" onPress={next} onLongPress={holdStart} onPressOut={holdEnd} delayLongPress={250} style={[styles.tapZone, { right: 0 }]} />
        {!clip.youtubeId && (
          <Pressable
            accessibilityLabel="Press and hold to pause"
            onLongPress={holdStart}
            onPressOut={holdEnd}
            delayLongPress={250}
            style={styles.holdZone}
          />
        )}

        <View style={[styles.top, { paddingTop: (wide ? 0 : insets.top) + 12 }]}>
          <View style={styles.segs} accessibilityLabel={`Layer ${clipIndex + 1} of ${story.clips.length}: ${layer.name}`}>
            {story.clips.map((_, i) => (
              <View key={i} style={styles.segCol}>
                <View style={styles.seg}>
                  <View
                    style={[
                      styles.segFill,
                      { width: `${i < clipIndex || ending ? 100 : i === clipIndex ? Math.min(100, (elapsed / duration) * 100) : 0}%` },
                    ]}
                  />
                </View>
                <Text style={[styles.segLabel, i === clipIndex && !ending && styles.segLabelOn]} numberOfLines={1}>
                  {LAYERS[i].name}
                </Text>
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
            <Pressable
              onPress={toggleListen}
              accessibilityRole="switch"
              accessibilityState={{ checked: listen }}
              accessibilityLabel="Listen mode: read the story aloud"
              style={[styles.listenBtn, listen && styles.listenOn]}>
              <Text style={[styles.listenText, listen && { color: video.bg }]}>{speaking ? 'Reading…' : listen ? 'Listening' : 'Listen'}</Text>
            </Pressable>
            <Pressable onPress={close} style={styles.iconBtn} accessibilityLabel="Close story">
              <Text style={styles.iconText}>✕</Text>
            </Pressable>
          </View>
        </View>

        <LinearGradient
          colors={['rgba(0,0,0,0)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)']}
          locations={[0, 0.3, 1]}
          style={[styles.bottom, { paddingBottom: (wide ? 0 : insets.bottom) + 16 }]}
          pointerEvents="box-none">
          <Text style={[styles.layerChip, { backgroundColor: clipIndex === ROOTS_LAYER ? video.warm : video.accent }]}>
            {layer.name} · {layer.depth}
          </Text>
          <Text style={styles.clipTitle}>{clip.title}</Text>
          <Text style={styles.meta}>
            {clip.when} · {clip.source} · {clip.rights}
          </Text>
          <Text style={styles.why}>{clip.why}</Text>
          <View style={styles.secondary}>
            {!wide && (
              <Pressable onPress={() => setMapOpen(true)} style={styles.smallBtn} accessibilityRole="button">
                <Text style={styles.smallBtnText}>Map</Text>
              </Pressable>
            )}
            {stations.length > 0 && (
              <Pressable onPress={openRadio} style={styles.smallBtn} accessibilityRole="button" accessibilityLabel={`Hear live radio from ${radioPlace}`}>
                <Text style={styles.smallBtnText}>Hear it live</Text>
              </Pressable>
            )}
            {clipIndex < lastClip && (
              <Pressable onPress={() => dispatch({ type: 'end' })} style={styles.smallBtn} accessibilityRole="button">
                <Text style={styles.smallBtnText}>Leads to →</Text>
              </Pressable>
            )}
          </View>
          <Pressable onPress={next} style={styles.deeper} accessibilityRole="button">
            <Text style={styles.deeperText}>{clipIndex < lastClip ? `Deeper ↓ ${LAYERS[clipIndex + 1].name}` : 'Where it leads →'}</Text>
          </Pressable>
          {!wide && <Text style={[styles.hint, { textAlign: 'center' }]}>Swipe up to go deeper · hold to pause · swipe left for the next story</Text>}
        </LinearGradient>

        {predicting && (
          <PredictOverlay
            story={story}
            topInset={wide ? 0 : insets.top}
            bottomInset={wide ? 0 : insets.bottom}
            onGuess={(correct) => recordGuess(story.id, correct)}
            onContinue={() => dispatch({ type: 'guessed' })}
          />
        )}

        {ending && (
          <ScrollView
            style={[StyleSheet.absoluteFill, styles.handoffScroll]}
            contentContainerStyle={[styles.handoff, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
            <Text style={styles.eyebrow}>
              {chain.length > 1 ? `Story ${chain.length} in your chain` : 'End of story'} · up next
            </Text>
            <Text style={styles.question}>{story.handoff.question}</Text>
            {classMode && (
              <View style={styles.discuss}>
                <Text style={styles.discussTitle}>Discuss</Text>
                <Text style={styles.discussLine}>1. In your own words: what happened, and why does it matter?</Text>
                <Text style={styles.discussLine}>2. Which clip gave you the strongest evidence, and why?</Text>
                <Text style={styles.discussLine}>3. Who is affected by this story, and who gets to decide what happens next?</Text>
              </View>
            )}
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
                    {i === 0 && autoNext && <View style={[styles.countdown, { width: `${Math.min(100, (handoff / HANDOFF_SECONDS) * 100)}%` }]} />}
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              {!autoNext
                ? 'Pick a path when you’re ready.'
                : paused
                  ? 'Paused'
                  : `${PATH_LABELS[story.handoff.paths[0].kind]} starts in ${Math.max(0, Math.ceil(HANDOFF_SECONDS - handoff))} s`}
            </Text>
            <View style={styles.actions}>
              {autoNext && (
                <Pressable onPress={() => setStayHere(true)} style={[styles.btn, styles.btnPrimary]} accessibilityRole="button">
                  <Text style={[styles.btnText, { color: video.bg }]}>Stay here</Text>
                </Pressable>
              )}
              <Pressable onPress={() => pickClip(0)} style={styles.btn}>
                <Text style={styles.btnText}>Watch again</Text>
              </Pressable>
              <Pressable onPress={close} style={styles.btn}>
                <Text style={styles.btnText}>Back to Today</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}

        {radioOpen && (
          <LiveRadio stations={stations} place={radioPlace} bottomInset={wide ? 0 : insets.bottom} onClose={() => setRadioOpen(false)} />
        )}

        {!wide && mapOpen && (
          <View style={[styles.sheet, { backgroundColor: t.surface, paddingBottom: insets.bottom }]}>
            <Pressable onPress={() => setMapOpen(false)} style={[styles.sheetClose, { backgroundColor: t.bg }]} accessibilityLabel="Close story map">
              <Text style={{ color: t.ink, fontSize: 16 }}>✕</Text>
            </Pressable>
            <StoryMap story={story} clipIndex={clipIndex} ending={ending} hideLast={predicting} t={t} onPickClip={pickClip} onPickStory={goToStory} />
          </View>
        )}
      </View>

      {wide && (
        <View style={[styles.side, { height: screenHeight, backgroundColor: t.surface, borderColor: t.line }]}>
          <StoryMap story={story} clipIndex={clipIndex} ending={ending} hideLast={predicting} t={t} onPickClip={pickClip} onPickStory={goToStory} />
        </View>
      )}
    </View>
  );
}

function PredictOverlay({
  story,
  topInset,
  bottomInset,
  onGuess,
  onContinue,
}: {
  story: Story;
  topInset: number;
  bottomInset: number;
  onGuess: (correct: boolean) => void;
  onContinue: () => void;
}) {
  const options = useMemo(() => predictionOptions(story), [story]);
  const [chosen, setChosen] = useState<number | null>(null);
  const answered = chosen !== null;
  const right = answered && options[chosen].correct;

  const choose = (i: number) => {
    if (answered) return;
    setChosen(i);
    onGuess(options[i].correct);
  };

  return (
    <ScrollView
      style={[StyleSheet.absoluteFill, styles.handoffScroll]}
      contentContainerStyle={[styles.handoff, { paddingTop: topInset + 24, paddingBottom: bottomInset + 24 }]}>
      <Text style={styles.eyebrow}>Before you see what followed</Text>
      <Text style={styles.question}>What do you think happened next?</Text>
      <View style={{ gap: 10 }}>
        {options.map((o, i) => {
          const isChosen = chosen === i;
          const showRight = answered && o.correct;
          const showWrong = isChosen && !o.correct;
          return (
            <Pressable
              key={o.text}
              onPress={() => choose(i)}
              disabled={answered}
              accessibilityRole="button"
              accessibilityState={{ selected: isChosen, disabled: answered }}
              style={[
                styles.guess,
                showRight && { borderColor: video.accent, backgroundColor: 'rgba(79, 209, 197, 0.16)' },
                showWrong && { borderColor: video.warm },
                answered && !showRight && !showWrong && { opacity: 0.45 },
              ]}>
              <Text style={styles.guessText}>{o.text}</Text>
              {showRight && <Text style={[styles.guessTag, { color: video.accent }]}>{isChosen ? 'Your guess · what happened' : 'What happened'}</Text>}
              {showWrong && <Text style={[styles.guessTag, { color: video.warm }]}>Your guess</Text>}
            </Pressable>
          );
        })}
      </View>
      {answered ? (
        <>
          <Text style={[styles.verdict, { color: right ? video.accent : video.warm }]}>
            {right ? 'You called it.' : 'Not quite. Here’s what really happened.'}
          </Text>
          <View style={styles.actions}>
            <Pressable onPress={onContinue} style={[styles.btn, styles.btnPrimary]} accessibilityRole="button">
              <Text style={[styles.btnText, { color: video.bg }]}>See what happened →</Text>
            </Pressable>
          </View>
        </>
      ) : (
        <Text style={styles.hint}>Pick one. Then watch the real outcome.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  listenBtn: { height: 36, borderRadius: 18, paddingHorizontal: 12, justifyContent: 'center', backgroundColor: video.glass },
  listenOn: { backgroundColor: video.accent },
  listenText: { color: video.ink, fontSize: 13, fontWeight: '700' },
  guess: { borderWidth: 1, borderColor: video.line, backgroundColor: video.card, borderRadius: 12, padding: 14, gap: 4 },
  guessText: { color: video.ink, fontSize: 16, fontWeight: '600', lineHeight: 21 },
  guessTag: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  verdict: { fontSize: 20, fontWeight: '800' },
  center: { alignItems: 'center', justifyContent: 'center' },
  root: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  screen: { overflow: 'hidden', backgroundColor: video.bg, alignSelf: 'stretch' },
  holdZone: { position: 'absolute', top: 110, bottom: 300, left: '24%', right: '24%' },
  tapZone: { position: 'absolute', top: 110, bottom: 280, width: '22%' },
  top: { position: 'absolute', top: 0, left: 0, right: 0, paddingHorizontal: 14, gap: 10, backgroundColor: 'rgba(0,0,0,0.28)', paddingBottom: 10 },
  segs: { flexDirection: 'row', gap: 4 },
  segCol: { flex: 1, gap: 4 },
  segLabel: { color: video.muted, fontSize: 9, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase', textAlign: 'center' },
  segLabelOn: { color: video.ink, fontWeight: '800' },
  secondary: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  smallBtn: { borderWidth: 1, borderColor: video.line, backgroundColor: video.glass, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8, minHeight: 36, justifyContent: 'center' },
  smallBtnText: { color: video.ink, fontSize: 13, fontWeight: '600' },
  deeper: { alignSelf: 'center', backgroundColor: video.ink, borderRadius: 999, paddingHorizontal: 28, paddingVertical: 14, minWidth: 220, alignItems: 'center' },
  deeperText: { color: video.bg, fontSize: 17, fontWeight: '800' },
  discuss: { borderWidth: 1, borderColor: video.accent, borderRadius: 12, padding: 14, gap: 6, backgroundColor: 'rgba(79, 209, 197, 0.08)' },
  discussTitle: { color: video.accent, fontSize: 12, fontWeight: '800', letterSpacing: 1.2, textTransform: 'uppercase' },
  discussLine: { color: video.ink, fontSize: 15, lineHeight: 21 },
  seg: { flex: 1, height: 3, borderRadius: 2, backgroundColor: video.line, overflow: 'hidden' },
  segFill: { height: '100%', backgroundColor: video.ink },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: video.accent },
  headTitle: { color: video.ink, fontSize: 14, fontWeight: '700' },
  headSub: { color: video.muted, fontSize: 12 },
  iconBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: video.glass, alignItems: 'center', justifyContent: 'center' },
  iconText: { color: video.ink, fontSize: 14 },
  bottom: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 16, paddingTop: 90, gap: 10 },
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
  pathThumb: { width: 72, height: 100, borderRadius: 8 },
  pathKind: { color: video.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  pathTitle: { color: video.ink, fontSize: 16, fontWeight: '700', lineHeight: 20 },
  pathReason: { color: video.muted, fontSize: 13 },
  countdown: { position: 'absolute', left: 0, bottom: 0, height: 3, backgroundColor: video.accent },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '78%', borderTopLeftRadius: 16, borderTopRightRadius: 16 },
  sheetClose: { position: 'absolute', right: 12, top: 12, zIndex: 1, width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  side: { width: 340, borderRadius: 16, borderWidth: 1, overflow: 'hidden' },
});
