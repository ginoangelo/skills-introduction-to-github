import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import type { Station } from '@/data/stations';
import { video } from '@/theme/tokens';

/**
 * "Hear it live from there": plays a local news or talk station from where the
 * story happened. Starts playing when it opens; Next tries another station.
 */
export function LiveRadio({ stations, place, bottomInset, onClose }: { stations: Station[]; place: string; bottomInset: number; onClose: () => void }) {
  const [index, setIndex] = useState(0);
  const station = stations[index];
  return (
    <View style={[styles.sheet, { paddingBottom: bottomInset + 16 }]} accessibilityRole="summary" accessibilityLabel={`Live radio from ${place}`}>
      <View style={styles.head}>
        <Text style={styles.eyebrow}>Hear it live from {place}</Text>
        <Pressable onPress={onClose} accessibilityLabel="Close live radio" style={styles.close}>
          <Text style={{ color: video.ink }}>✕</Text>
        </Pressable>
      </View>
      <StationPlayer key={station.id} station={station} />
      <View style={styles.row}>
        {stations.length > 1 && (
          <Pressable onPress={() => setIndex((i) => (i + 1) % stations.length)} accessibilityRole="button" style={styles.btn}>
            <Text style={styles.btnText}>Next station</Text>
          </Pressable>
        )}
        <Pressable onPress={() => Linking.openURL(station.homepage).catch(() => {})} accessibilityRole="link" style={styles.btn}>
          <Text style={styles.btnText}>Station website</Text>
        </Pressable>
      </View>
      <Text style={styles.small}>Station list from Radio Browser. Streams belong to each broadcaster.</Text>
    </View>
  );
}

function StationPlayer({ station }: { station: Station }) {
  const player = useAudioPlayer({ uri: station.stream });
  const status = useAudioPlayerStatus(player);
  const [wantPlay, setWantPlay] = useState(true);

  useEffect(() => {
    if (!status.isLoaded) return;
    if (wantPlay) player.play();
    else player.pause();
  }, [status.isLoaded, wantPlay, player]);

  const state = status.error
    ? 'This station isn’t answering right now. Try the next one.'
    : !status.isLoaded || status.isBuffering
      ? 'Connecting…'
      : status.playing
        ? 'On air'
        : wantPlay
          ? 'Tap play to listen'
          : 'Paused';

  return (
    <View style={styles.station}>
      <Pressable
        onPress={() => {
          if (wantPlay && !status.playing) player.play();
          else setWantPlay((w) => !w);
        }}
        disabled={!!status.error}
        accessibilityRole="button"
        accessibilityLabel={status.playing ? 'Pause radio' : 'Play radio'}
        style={[styles.play, status.error && { opacity: 0.4 }]}>
        <Text style={styles.playText}>{status.playing ? '❚❚' : '▶'}</Text>
      </Pressable>
      <View style={{ flex: 1, minWidth: 0, gap: 2 }}>
        <View style={styles.nameRow}>
          {status.playing && <Text style={styles.live}>LIVE</Text>}
          <Text style={styles.name} numberOfLines={1}>
            {station.name}
          </Text>
        </View>
        <Text style={styles.meta} numberOfLines={1}>
          {station.city} · {station.kind} · {station.language}
        </Text>
        <Text style={[styles.meta, status.error && { color: video.warm }]}>{state}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 6, backgroundColor: video.card, borderTopWidth: 1, borderColor: video.line, borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingHorizontal: 16, paddingTop: 14, gap: 12 },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  eyebrow: { color: video.accent, fontSize: 12, fontWeight: '700', letterSpacing: 1.2, textTransform: 'uppercase', flex: 1 },
  close: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: video.glass },
  station: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  play: { width: 48, height: 48, borderRadius: 24, backgroundColor: video.ink, alignItems: 'center', justifyContent: 'center' },
  playText: { color: video.bg, fontSize: 16, fontWeight: '800' },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  live: { color: video.bg, backgroundColor: video.warm, fontSize: 10, fontWeight: '800', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 3, overflow: 'hidden' },
  name: { color: video.ink, fontSize: 16, fontWeight: '700', flexShrink: 1 },
  meta: { color: video.muted, fontSize: 12 },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  btn: { borderWidth: 1, borderColor: video.line, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 7 },
  btnText: { color: video.ink, fontSize: 13, fontWeight: '600' },
  small: { color: video.muted, fontSize: 11 },
});
