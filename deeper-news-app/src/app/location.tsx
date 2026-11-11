import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LOCATION_OPTIONS, placeLabel, type UserLocation } from '@/data/places';
import { useAppState } from '@/state/app-state';
import { useTokens } from '@/theme/tokens';

export default function LocationScreen() {
  const t = useTokens();
  const insets = useSafeAreaInsets();
  const { location, setLocation } = useAppState();
  const [query, setQuery] = useState('');

  const q = query.trim().toLowerCase();
  const options = q ? LOCATION_OPTIONS.filter((o) => placeLabel(o).toLowerCase().includes(q)) : LOCATION_OPTIONS;

  const choose = (loc: UserLocation) => {
    setLocation(loc);
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };

  return (
    <View style={[styles.fill, { backgroundColor: t.bg, paddingTop: insets.top + 16 }]}>
      <View style={styles.page}>
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.h1, { color: t.ink }]}>Where are you?</Text>
            <Text style={{ color: t.muted, fontSize: 14 }}>
              We use this to show stories near you first. It stays on this device, and you can change it any time.
            </Text>
          </View>
          {location ? (
            <Pressable onPress={() => router.back()} style={[styles.close, { backgroundColor: t.surface, borderColor: t.line }]} accessibilityLabel="Close">
              <Text style={{ color: t.ink, fontSize: 16 }}>✕</Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
              accessibilityRole="button"
              style={[styles.notNow, { borderColor: t.line, backgroundColor: t.surface }]}>
              <Text style={{ color: t.ink, fontWeight: '600' }}>Not now</Text>
            </Pressable>
          )}
        </View>
        <TextInput
          id="location-search"
          value={query}
          onChangeText={setQuery}
          placeholder="Search for a city or country"
          placeholderTextColor={t.muted}
          autoCorrect={false}
          style={[styles.search, { color: t.ink, backgroundColor: t.surface, borderColor: t.line }]}
        />
        <FlatList
          data={options}
          keyExtractor={(o) => o.id}
          contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={
            <Text style={{ color: t.muted, paddingVertical: 16 }}>
              No match yet. This early list has {LOCATION_OPTIONS.length} cities; a full place search is coming.
            </Text>
          }
          renderItem={({ item }) => {
            const on = location?.id === item.id;
            return (
              <Pressable
                onPress={() => choose(item)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={[styles.row, { borderColor: t.line }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: t.ink, fontSize: 16, fontWeight: '600' }}>{item.name}</Text>
                  <Text style={{ color: t.muted, fontSize: 13 }}>{[item.region, item.country].filter(Boolean).join(', ')}</Text>
                </View>
                {on && <Text style={{ color: t.accent, fontWeight: '700' }}>Selected</Text>}
              </Pressable>
            );
          }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  page: { flex: 1, width: '100%', maxWidth: 640, alignSelf: 'center', paddingHorizontal: 16, gap: 14 },
  head: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5, marginBottom: 4 },
  notNow: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  close: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  search: { borderWidth: 1, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
});
