import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Body, Button, Screen } from '@/components/ui';
import { C, Font } from '@/constants/theme';
import { useStore } from '@/lib/store';

export default function Welcome() {
  const { ready, report } = useStore();
  if (!ready) return <View style={{ flex: 1, backgroundColor: C.bg }} />;
  if (report) return <Redirect href="/score" />;

  return (
    <Screen scroll={false}>
      <View style={s.brand}>
        <Icon name="shield" size={28} color={C.accent} />
        <Text style={s.brandText}>VEIL</Text>
      </View>

      <View style={s.hero}>
        <View style={s.heroTile}>
          <Icon name="phone" size={56} color={C.accent} strokeWidth={1.4} />
        </View>
      </View>

      <View style={{ gap: 14 }}>
        <Text style={s.kicker}>PRIVACY ADVISOR</Text>
        <Text style={s.headline} accessibilityRole="header">
          See what your phone gives away. Then shut it down.
        </Text>
        <Body>One scan checks data breaches and your phone’s settings, then hands you a fix list.</Body>
      </View>

      <View style={{ gap: 12, marginTop: 8 }}>
        <Button
          label="Run my free scan"
          onPress={() => router.push('/scan')}
          icon={<Icon name="arrow-right" size={18} color={C.onAccent} strokeWidth={2} />}
        />
        <View style={s.footnote}>
          <Icon name="lock" size={14} color={C.faint} strokeWidth={2} />
          <Text style={s.footnoteText}>No ads. No tracking. Your data is never sold.</Text>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  brand: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  brandText: { color: C.text, fontSize: 22, fontWeight: '700', letterSpacing: 1 },
  hero: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroTile: {
    width: 112,
    height: 112,
    borderRadius: 32,
    backgroundColor: C.surface,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: C.accent,
    shadowOpacity: 0.25,
    shadowRadius: 30,
  },
  kicker: { color: C.accent, fontFamily: Font.mono, fontSize: 12, letterSpacing: 1.6 },
  headline: { color: C.text, fontSize: 36, lineHeight: 40, fontWeight: '700', letterSpacing: -0.6 },
  footnote: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 },
  footnoteText: { color: C.faint, fontSize: 12 },
});
