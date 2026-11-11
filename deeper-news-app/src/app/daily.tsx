import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryArt } from '@/components/story-art';
import { puzzleFor, shareText } from '@/data/daily-thread';
import { PATH_LABELS, type Story } from '@/data/types';
import { useAppState } from '@/state/app-state';
import { useContent } from '@/state/content';
import { useTokens, type Tokens } from '@/theme/tokens';

const SAVE_KEY = 'deeper-news:daily';
const MAX_STEPS = 8;

type Saved = { day: string; route: string[]; gaveUp: boolean };

export default function DailyThreadScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { stories, getStory } = useContent();
  const { startChain } = useAppState();
  // Only built-in stories, so everyone gets the same puzzle.
  const shared = useMemo(() => stories.filter((s) => !s.draft), [stories]);
  const puzzle = useMemo(() => puzzleFor(shared, new Date()), [shared]);
  const [route, setRoute] = useState<string[]>(puzzle ? [puzzle.startId] : []);
  const [gaveUp, setGaveUp] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [didShare, setDidShare] = useState(false);

  // Pick up where you left off today.
  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(SAVE_KEY)
      .then((raw) => {
        const s = raw ? (JSON.parse(raw) as Saved) : null;
        if (!cancelled && s && puzzle && s.day === puzzle.day && s.route[0] === puzzle.startId) {
          setRoute(s.route);
          setGaveUp(s.gaveUp);
        }
      })
      .catch(() => {})
      .finally(() => !cancelled && setLoaded(true));
    return () => {
      cancelled = true;
    };
  }, [puzzle]);

  useEffect(() => {
    if (!loaded || !puzzle) return;
    AsyncStorage.setItem(SAVE_KEY, JSON.stringify({ day: puzzle.day, route, gaveUp } satisfies Saved)).catch(() => {});
  }, [loaded, puzzle, route, gaveUp]);

  if (!puzzle) {
    return (
      <View style={[styles.fill, styles.center, { backgroundColor: t.bg }]}>
        <Text style={{ color: t.ink }}>There aren’t enough connected stories for a puzzle today.</Text>
      </View>
    );
  }

  const start = getStory(puzzle.startId)!;
  const target = getStory(puzzle.targetId)!;
  const here = getStory(route[route.length - 1])!;
  const steps = route.length - 1;
  const best = puzzle.best.length - 1;
  const solved = here.id === target.id;
  const outOfSteps = !solved && steps >= MAX_STEPS;
  const over = solved || gaveUp || outOfSteps;

  const share = async () => {
    const text = shareText(puzzle, steps, solved);
    try {
      const nav = typeof navigator !== 'undefined' ? navigator : undefined;
      // Browsers without a share sheet get the result copied instead.
      if (Platform.OS === 'web' && nav && typeof nav.share !== 'function') await nav.clipboard.writeText(text);
      else await Share.share({ message: text });
      setDidShare(true);
    } catch {
      setDidShare(false);
    }
  };

  const watch = (id: string) => {
    startChain(id);
    router.push({ pathname: '/story/[id]', params: { id } });
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }}>
      <View style={styles.page}>
        <View style={styles.head}>
          <Pressable
            onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
            style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]}
            accessibilityRole="button">
            <Text style={{ color: t.ink, fontWeight: '600' }}>← Today</Text>
          </Pressable>
          <View style={{ flex: 1, minWidth: 180 }}>
            <Text style={[styles.h1, { color: t.ink }]}>Daily Thread</Text>
            <Text style={{ color: t.muted }}>Follow the connections from the first story to the second. Fewer steps is better.</Text>
          </View>
        </View>

        <View style={[styles.goal, { backgroundColor: t.surface, borderColor: t.line }]}>
          <Endpoint story={start} label="Start" t={t} />
          <Text style={[styles.arrow, { color: t.accent }]} accessibilityElementsHidden>
            →
          </Text>
          <Endpoint story={target} label="Reach" t={t} />
        </View>
        <Text style={{ color: t.muted, textAlign: 'center' }}>
          Shortest route: {best} steps · You: {steps} {steps === 1 ? 'step' : 'steps'} so far
        </Text>

        <View style={styles.trail} accessibilityLabel={`Your route: ${route.map((id) => getStory(id)?.short).join(', then ')}`}>
          {route.map((id, i) => (
            <View key={`${id}-${i}`} style={styles.trailItem}>
              {i > 0 && <Text style={{ color: t.muted }}>›</Text>}
              <Text style={[styles.trailChip, { borderColor: id === target.id ? t.accent : t.line, color: t.ink }]}>{getStory(id)?.short}</Text>
            </View>
          ))}
        </View>

        {over ? (
          <View style={[styles.result, { backgroundColor: t.surface, borderColor: solved ? t.accent : t.warm }]}>
            <Text style={[styles.resultTitle, { color: solved ? t.accent : t.warm }]}>
              {solved
                ? steps <= best
                  ? `Perfect. You found the shortest route in ${steps} steps.`
                  : `Connected in ${steps} steps. The shortest takes ${best}.`
                : gaveUp
                  ? 'Here’s the shortest route.'
                  : `Out of steps after ${MAX_STEPS}. Here’s the shortest route.`}
            </Text>
            <Text style={[styles.label, { color: t.muted }]}>Shortest route</Text>
            {puzzle.best.map((id, i) => {
              const s = getStory(id)!;
              const path = i > 0 ? getStory(puzzle.best[i - 1])!.handoff.paths.find((p) => p.storyId === id) : undefined;
              return (
                <Pressable key={id} onPress={() => watch(id)} accessibilityRole="button" style={[styles.routeRow, { borderColor: t.line }]}>
                  <StoryArt story={s} style={styles.routeThumb} />
                  <View style={{ flex: 1, minWidth: 0 }}>
                    {path && <Text style={[styles.kind, { color: t.accent }]}>{PATH_LABELS[path.kind]}</Text>}
                    <Text style={{ color: t.ink, fontWeight: '700' }}>{s.title}</Text>
                    {path && <Text style={{ color: t.muted, fontSize: 13 }}>{path.reason}</Text>}
                  </View>
                  <Text style={{ color: t.accent, fontWeight: '700' }}>Watch</Text>
                </Pressable>
              );
            })}
            <View style={styles.actions}>
              <Pressable onPress={share} style={[styles.primary, { backgroundColor: t.accent }]} accessibilityRole="button">
                <Text style={{ color: t.accentInk, fontWeight: '700' }}>{didShare ? (Platform.OS === 'web' ? 'Copied to share' : 'Shared') : 'Share my result'}</Text>
              </Pressable>
              <Text style={{ color: t.muted, alignSelf: 'center' }}>A new thread tomorrow.</Text>
            </View>
          </View>
        ) : (
          <View style={[styles.here, { backgroundColor: t.surface, borderColor: t.line }]}>
            <Text style={[styles.label, { color: t.muted }]}>You’re at</Text>
            <View style={styles.hereRow}>
              <StoryArt story={here} style={styles.hereThumb} />
              <View style={{ flex: 1, minWidth: 0, gap: 4 }}>
                <Text style={[styles.hereTitle, { color: t.ink }]}>{here.title}</Text>
                <Text style={{ color: t.muted, fontSize: 13 }}>{here.handoff.question}</Text>
              </View>
            </View>
            <Text style={[styles.label, { color: t.muted }]}>Where do you go next?</Text>
            {here.handoff.paths.map((p) => {
              const next = getStory(p.storyId);
              if (!next) return null;
              const visited = route.includes(p.storyId);
              return (
                <Pressable
                  key={p.storyId}
                  onPress={() => setRoute((r) => [...r, p.storyId])}
                  accessibilityRole="button"
                  style={[styles.choice, { borderColor: t.line, backgroundColor: t.bg, opacity: visited ? 0.6 : 1 }]}>
                  <Text style={[styles.kind, { color: t.accent }]}>
                    {PATH_LABELS[p.kind]}
                    {visited ? ' · already visited' : ''}
                  </Text>
                  <Text style={{ color: t.ink, fontWeight: '700' }}>{next.title}</Text>
                  <Text style={{ color: t.muted, fontSize: 13 }}>{p.reason}</Text>
                </Pressable>
              );
            })}
            <View style={styles.actions}>
              {route.length > 1 && (
                <Pressable onPress={() => setRoute((r) => r.slice(0, -1))} style={[styles.pill, { borderColor: t.line }]} accessibilityRole="button">
                  <Text style={{ color: t.ink, fontWeight: '600' }}>Undo step</Text>
                </Pressable>
              )}
              <Pressable onPress={() => setGaveUp(true)} style={[styles.pill, { borderColor: t.line }]} accessibilityRole="button">
                <Text style={{ color: t.muted, fontWeight: '600' }}>Show me the route</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Endpoint({ story, label, t }: { story: Story; label: string; t: Tokens }) {
  return (
    <View style={styles.endpoint}>
      <StoryArt story={story} style={styles.endThumb} />
      <Text style={[styles.label, { color: t.muted }]}>{label}</Text>
      <Text style={[styles.endTitle, { color: t.ink }]} numberOfLines={3}>
        {story.title}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', padding: 24 },
  page: { width: '100%', maxWidth: 720, alignSelf: 'center', paddingHorizontal: 16, gap: 14 },
  head: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  primary: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  goal: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, borderWidth: 1, borderRadius: 14, padding: 14 },
  endpoint: { flex: 1, minWidth: 0, gap: 6, alignItems: 'center' },
  endThumb: { width: 88, height: 88, borderRadius: 44 },
  endTitle: { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  arrow: { fontSize: 28, fontWeight: '800', marginTop: 28 },
  label: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  trail: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  trailItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  trailChip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, fontSize: 13, fontWeight: '600' },
  here: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  hereRow: { flexDirection: 'row', gap: 12 },
  hereThumb: { width: 64, height: 88, borderRadius: 8 },
  hereTitle: { fontSize: 18, fontWeight: '800', lineHeight: 22 },
  choice: { borderWidth: 1, borderRadius: 12, padding: 12, gap: 2 },
  kind: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  result: { borderWidth: 2, borderRadius: 14, padding: 14, gap: 10 },
  resultTitle: { fontSize: 19, fontWeight: '800' },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 10, padding: 8 },
  routeThumb: { width: 40, height: 54, borderRadius: 6 },
});
