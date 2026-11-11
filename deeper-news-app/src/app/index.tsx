import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryCard, StoryRing, ThreadCard } from '@/components/home-parts';
import { StoryArt } from '@/components/story-art';
import { puzzleFor } from '@/data/daily-thread';
import { bucketStories, distanceKm, type UserLocation } from '@/data/places';
import type { Story } from '@/data/types';
import { useAppState } from '@/state/app-state';
import { useContent } from '@/state/content';
import { useTokens, WIDE_BREAKPOINT, type Tokens } from '@/theme/tokens';

export default function HomeScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const { seen, followed, toggleFollow, startChain, location, locationReady, guesses } = useAppState();
  const { stories: STORIES, threads: THREADS } = useContent();
  const rightGuesses = [...guesses.values()].filter(Boolean).length;

  const open = (id: string) => {
    startChain(id);
    router.push({ pathname: '/story/[id]', params: { id } });
  };
  const pickLocation = () => router.push('/location');

  const buckets = location ? bucketStories(STORIES, location) : null;
  const trayOrder = buckets ? [...buckets.near, ...buckets.country, ...buckets.world] : STORIES;

  const section = (title: string, stories: Story[], empty: string) => (
    <View style={styles.section}>
      <Text style={[styles.h2, { color: t.ink }]}>{title}</Text>
      {stories.length === 0 ? (
        <Text style={{ color: t.muted }}>{empty}</Text>
      ) : (
        stories.map((s) => (
          <StoryCard
            key={s.id}
            story={s}
            seen={seen.has(s.id)}
            t={t}
            km={location ? distanceKm(location, s.place) : undefined}
            onPress={() => open(s.id)}
          />
        ))
      )}
    </View>
  );

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }}>
      <View style={styles.page}>
        <View style={styles.topbar}>
          <Text style={[styles.brand, { color: t.ink }]}>
            Deeper<Text style={{ color: t.accent }}>.</Text>News
          </Text>
          <View style={styles.topRight}>
            <Text style={[styles.sample, { color: t.warm, borderColor: t.warm }]}>Sample stories · fictional</Text>
            <Pressable
              onPress={() => router.push('/explore')}
              accessibilityRole="button"
              style={[styles.locBtn, { borderColor: t.accent, backgroundColor: t.accent }]}>
              <Text style={{ color: t.accentInk, fontSize: 13, fontWeight: '700' }}>Explore the map</Text>
            </Pressable>
            <LocationButton t={t} location={location} onPress={pickLocation} />
          </View>
        </View>

        <DailyCard t={t} />

        {locationReady && !location && (
          <View style={[styles.prompt, { backgroundColor: t.surface, borderColor: t.accent }]}>
            <View style={{ flex: 1, minWidth: 200, gap: 2 }}>
              <Text style={[styles.promptTitle, { color: t.ink }]}>See what’s happening near you</Text>
              <Text style={{ color: t.muted }}>Pick your city and we’ll put local stories first, then your country, then the world.</Text>
            </View>
            <Pressable onPress={pickLocation} style={[styles.primaryBtn, { backgroundColor: t.accent }]} accessibilityRole="button">
              <Text style={{ color: t.accentInk, fontWeight: '700' }}>Choose your location</Text>
            </Pressable>
          </View>
        )}

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tray}>
          {trayOrder.map((s) => (
            <StoryRing key={s.id} story={s} seen={seen.has(s.id)} t={t} onPress={() => open(s.id)} />
          ))}
        </ScrollView>

        <View style={[styles.cols, wide && styles.colsWide]}>
          <View style={styles.main}>
            <Text style={{ color: t.muted, fontSize: 12, alignSelf: 'flex-end' }}>
              {seen.size} of {STORIES.length} watched
              {guesses.size > 0 ? ` · you called ${rightGuesses} of ${guesses.size}` : ''}
            </Text>
            {buckets && location ? (
              <>
                {section(`Near ${location.name}`, buckets.near, `No stories near ${location.name} today. We’ll show local stories here as they come in.`)}
                {section(`Elsewhere in ${countryName(location)}`, buckets.country, `Nothing else from ${countryName(location)} today.`)}
                {section('Around the world', buckets.world, 'Nothing from other countries today.')}
              </>
            ) : (
              section('Today', STORIES, '')
            )}
            <View style={[styles.done, { borderColor: t.line }]}>
              <Text style={[styles.doneTitle, { color: t.ink }]}>You’re caught up.</Text>
              <Text style={{ color: t.muted }}>
                That’s every story today. New chapters on threads you follow will show up here.
              </Text>
            </View>
            <Pressable onPress={() => router.push('/editor')} accessibilityRole="button" style={{ alignSelf: 'flex-start' }}>
              <Text style={{ color: t.accent, fontWeight: '700' }}>Open the story editor →</Text>
            </Pressable>
          </View>

          <View style={[styles.side, wide && { width: 320 }]}>
            <Text style={[styles.h3, { color: t.ink }]}>Threads</Text>
            <Text style={{ color: t.muted, fontSize: 13 }}>
              A place, a person or a decision that runs through several stories. Follow one to hear about each new chapter.
            </Text>
            {THREADS.map((th) => (
              <ThreadCard
                key={th.id}
                thread={th}
                following={followed.has(th.id)}
                t={t}
                onToggle={() => toggleFollow(th.id)}
                onOpenStory={open}
              />
            ))}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

/** Today's Daily Thread puzzle, as a card at the top of Home. */
function DailyCard({ t }: { t: Tokens }) {
  const { stories, getStory } = useContent();
  const puzzle = puzzleFor(stories.filter((s) => !s.draft), new Date());
  if (!puzzle) return null;
  const start = getStory(puzzle.startId);
  const target = getStory(puzzle.targetId);
  if (!start || !target) return null;
  return (
    <Pressable
      onPress={() => router.push('/daily')}
      accessibilityRole="button"
      accessibilityLabel={`Daily Thread: connect ${start.short} to ${target.short}`}
      style={[styles.daily, { backgroundColor: t.surface, borderColor: t.line }]}>
      <StoryArt story={start} style={styles.dailyThumb} />
      <Text style={{ color: t.accent, fontSize: 20, fontWeight: '800' }}>→</Text>
      <StoryArt story={target} style={styles.dailyThumb} />
      <View style={{ flex: 1, minWidth: 160 }}>
        <Text style={{ color: t.accent, fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>Daily Thread · today’s puzzle</Text>
        <Text style={{ color: t.ink, fontSize: 16, fontWeight: '800' }}>
          Connect {start.short} to {target.short}
        </Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>Follow the money, people and places. Fewest steps wins.</Text>
      </View>
      <Text style={{ color: t.accent, fontWeight: '700' }}>Play →</Text>
    </Pressable>
  );
}

function countryName(loc: UserLocation): string {
  return loc.countryCode === 'US' ? 'the US' : loc.countryCode === 'GB' ? 'the UK' : loc.country;
}

function LocationButton({ t, location, onPress }: { t: Tokens; location: UserLocation | null; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={location ? `Location: ${location.name}. Change` : 'Choose your location'}
      style={[styles.locBtn, { borderColor: t.line, backgroundColor: t.surface }]}>
      <View style={[styles.pin, { borderColor: t.accent }]} />
      <Text style={{ color: t.ink, fontSize: 13, fontWeight: '600' }}>{location ? location.name : 'Set location'}</Text>
      {location && <Text style={{ color: t.accent, fontSize: 13 }}>Change</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 16, gap: 22 },
  topbar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  topRight: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  brand: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  sample: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', borderWidth: 1, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 2 },
  locBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, borderWidth: 1, borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  pin: { width: 10, height: 10, borderRadius: 5, borderWidth: 3 },
  daily: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, borderWidth: 1, borderRadius: 12, padding: 12 },
  dailyThumb: { width: 44, height: 44, borderRadius: 22 },
  prompt: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 14, borderWidth: 1, borderRadius: 12, padding: 16 },
  promptTitle: { fontSize: 17, fontWeight: '800' },
  primaryBtn: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  tray: { gap: 12, paddingVertical: 4 },
  cols: { gap: 28 },
  colsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1, gap: 14, minWidth: 0 },
  section: { gap: 14 },
  h2: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  h3: { fontSize: 19, fontWeight: '800' },
  done: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 18, gap: 4, marginTop: 6 },
  doneTitle: { fontSize: 19, fontWeight: '800' },
  side: { gap: 10 },
});
