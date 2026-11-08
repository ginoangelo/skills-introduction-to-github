import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryCard, StoryRing, ThreadCard } from '@/components/home-parts';
import { STORIES, THREADS } from '@/data/stories';
import { useAppState } from '@/state/app-state';
import { useTokens, WIDE_BREAKPOINT } from '@/theme/tokens';

export default function HomeScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const wide = width >= WIDE_BREAKPOINT;
  const { seen, followed, toggleFollow, startChain } = useAppState();

  const open = (id: string) => {
    startChain(id);
    router.push({ pathname: '/story/[id]', params: { id } });
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }}>
      <View style={styles.page}>
        <View style={styles.topbar}>
          <Text style={[styles.brand, { color: t.ink }]}>
            Deeper<Text style={{ color: t.accent }}>.</Text>News
          </Text>
          <Text style={[styles.sample, { color: t.warm, borderColor: t.warm }]}>Sample stories · fictional</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tray}>
          {STORIES.map((s) => (
            <StoryRing key={s.id} story={s} seen={seen.has(s.id)} t={t} onPress={() => open(s.id)} />
          ))}
        </ScrollView>

        <View style={[styles.cols, wide && styles.colsWide]}>
          <View style={styles.main}>
            <View style={styles.sectionHead}>
              <Text style={[styles.h2, { color: t.ink }]}>Today</Text>
              <Text style={{ color: t.muted, fontSize: 12 }}>
                {seen.size} of {STORIES.length} watched
              </Text>
            </View>
            {STORIES.map((s) => (
              <StoryCard key={s.id} story={s} seen={seen.has(s.id)} t={t} onPress={() => open(s.id)} />
            ))}
            <View style={[styles.done, { borderColor: t.line }]}>
              <Text style={[styles.doneTitle, { color: t.ink }]}>You’re caught up.</Text>
              <Text style={{ color: t.muted }}>
                That’s every story today. New chapters on threads you follow will show up here.
              </Text>
            </View>
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

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 1120, alignSelf: 'center', paddingHorizontal: 16, gap: 22 },
  topbar: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10 },
  brand: { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  sample: { fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', borderWidth: 1, borderRadius: 3, paddingHorizontal: 8, paddingVertical: 2 },
  tray: { gap: 12, paddingVertical: 4 },
  cols: { gap: 28 },
  colsWide: { flexDirection: 'row', alignItems: 'flex-start' },
  main: { flex: 1, gap: 14, minWidth: 0 },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  h2: { fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  h3: { fontSize: 19, fontWeight: '800' },
  done: { borderWidth: 1, borderStyle: 'dashed', borderRadius: 12, padding: 18, gap: 4, marginTop: 6 },
  doneTitle: { fontSize: 19, fontWeight: '800' },
  side: { gap: 10 },
});
