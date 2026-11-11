import { router } from 'expo-router';
import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StoryArt } from '@/components/story-art';
import type { Story } from '@/data/types';
import { useContent } from '@/state/content';
import { useTokens, type Tokens } from '@/theme/tokens';

export default function EditorHome() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { drafts, stories } = useContent();
  const samples = stories.filter((s) => !s.draft);
  const [exported, setExported] = useState(false);

  const back = () => (router.canGoBack() ? router.back() : router.replace('/'));
  const edit = (id: string) => router.push({ pathname: '/editor/[id]', params: { id } });

  // Website only: save your stories as a file, to back them up or hand them over.
  const exportStories = () => {
    if (Platform.OS !== 'web') return;
    const blob = new Blob([JSON.stringify(drafts, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'deeper-news-stories.json';
    a.click();
    URL.revokeObjectURL(a.href);
    setExported(true);
  };

  return (
    <ScrollView style={{ backgroundColor: t.bg }} contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 48 }}>
      <View style={styles.page}>
        <View style={styles.head}>
          <Pressable onPress={back} style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]} accessibilityRole="button">
            <Text style={{ color: t.ink, fontWeight: '600' }}>← Today</Text>
          </Pressable>
          <View style={{ flex: 1, minWidth: 200 }}>
            <Text style={[styles.h1, { color: t.ink }]}>Story editor</Text>
            <Text style={{ color: t.muted }}>
              Build a story layer by layer, paste YouTube links for the clips, and connect it to other stories. It shows up in the app as soon as you save.
            </Text>
          </View>
        </View>

        <View style={[styles.note, { borderColor: t.warm, backgroundColor: t.surface }]}>
          <Text style={{ color: t.ink }}>
            <Text style={{ fontWeight: '700' }}>Saved on this device only. </Text>
            Stories you make here are visible to you, in this browser or on this phone. Publishing them for everyone comes with the online database.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable onPress={() => edit('new')} style={[styles.primary, { backgroundColor: t.accent }]} accessibilityRole="button">
            <Text style={{ color: t.accentInk, fontWeight: '700' }}>+ New story</Text>
          </Pressable>
          {Platform.OS === 'web' && drafts.length > 0 && (
            <Pressable onPress={exportStories} style={[styles.pill, { borderColor: t.line, backgroundColor: t.surface }]} accessibilityRole="button">
              <Text style={{ color: t.ink, fontWeight: '600' }}>{exported ? 'Downloaded' : 'Download my stories (.json)'}</Text>
            </Pressable>
          )}
        </View>

        <Text style={[styles.h2, { color: t.ink }]}>Your stories</Text>
        {drafts.length === 0 ? (
          <Text style={{ color: t.muted }}>None yet. Start with “New story”, or copy a sample below and change it.</Text>
        ) : (
          drafts.map((s) => <Row key={s.id} story={s} t={t} action="Edit" onPress={() => edit(s.id)} />)
        )}

        <Text style={[styles.h2, { color: t.ink }]}>Built-in samples</Text>
        <Text style={{ color: t.muted, marginTop: -6 }}>These are fictional. Copy one to see how a full story is put together.</Text>
        {samples.map((s) => (
          <Row key={s.id} story={s} t={t} action="Copy and edit" onPress={() => router.push({ pathname: '/editor/[id]', params: { id: 'new', from: s.id } })} />
        ))}
      </View>
    </ScrollView>
  );
}

function Row({ story, t, action, onPress }: { story: Story; t: Tokens; action: string; onPress: () => void }) {
  const clipsWithMedia = story.clips.filter((c) => c.youtubeId || c.audio?.url).length;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" style={[styles.row, { backgroundColor: t.surface, borderColor: t.line }]}>
      <StoryArt story={story} style={styles.thumb} />
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <Text style={{ color: t.ink, fontWeight: '700' }} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={{ color: t.muted, fontSize: 13 }}>
          {story.topic} · {story.place.name} · {clipsWithMedia} of {story.clips.length} clips have video or audio
        </Text>
      </View>
      <Text style={{ color: t.accent, fontWeight: '700' }}>{action}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  page: { width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16, gap: 14 },
  head: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 19, fontWeight: '800', marginTop: 10 },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  primary: { borderRadius: 999, paddingHorizontal: 18, paddingVertical: 10 },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  note: { borderLeftWidth: 4, borderWidth: 1, borderRadius: 10, padding: 12 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 12, padding: 10 },
  thumb: { width: 48, height: 64, borderRadius: 6 },
});
