import { Redirect, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, Eyebrow, Screen } from '@/components/ui';
import { C } from '@/constants/theme';
import { useStore } from '@/lib/store';

const SENSITIVE = new Set(['Passwords', 'Phone numbers', 'Physical addresses', 'Dates of birth', 'Government issued IDs', 'Social security numbers']);

export default function ExposureScreen() {
  const { report } = useStore();
  if (!report) return <Redirect href="/" />;
  const { breaches } = report;
  const leakedPassword = breaches.some((b) => b.dataClasses.includes('Passwords'));

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Eyebrow>EXPOSURE · BREACHES</Eyebrow>
        <Text style={s.h1} accessibilityRole="header">
          Breach report
        </Text>
      </View>

      {leakedPassword && (
        <View style={s.alert}>
          <Icon name="alert" size={22} color={C.danger} strokeWidth={2} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={{ color: C.text, fontWeight: '600', fontSize: 15 }}>A password of yours was leaked</Text>
            <Text style={{ color: '#D9B8AE', fontSize: 13, lineHeight: 19 }}>
              Change it anywhere you reused it. Your Fix list has the steps.
            </Text>
          </View>
        </View>
      )}

      {breaches.length === 0 ? (
        <Card>
          <Text style={{ color: C.text, fontSize: 16, fontWeight: '600' }}>No breaches found</Text>
          <Text style={{ color: C.muted, fontSize: 14 }}>Your email isn’t in any known breach. Veil will tell you if that changes.</Text>
        </Card>
      ) : (
        <>
          <Eyebrow>
            {breaches.length} {breaches.length === 1 ? 'BREACH' : 'BREACHES'} · NEWEST FIRST
          </Eyebrow>
          <View style={s.list}>
            {breaches.map((b, i) => (
              <View key={b.name} style={[s.row, i < breaches.length - 1 && s.rowBorder]}>
                <View style={s.initial}>
                  <Text style={{ color: C.textSoft, fontSize: 16, fontWeight: '600' }}>{b.title.charAt(0)}</Text>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ color: C.text, fontSize: 15, fontWeight: '600', flexShrink: 1 }}>{b.title}</Text>
                    <Text style={{ color: C.faint, fontSize: 12 }}>{b.breachDate.slice(0, 4)}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                    {b.dataClasses.slice(0, 5).map((d) => {
                      const hot = SENSITIVE.has(d);
                      return (
                        <Text key={d} style={[s.tag, hot ? { backgroundColor: C.dangerTint, color: C.dangerSoft } : { backgroundColor: C.surface2, color: C.textSoft }]}>
                          {d}
                        </Text>
                      );
                    })}
                  </View>
                </View>
              </View>
            ))}
          </View>
        </>
      )}

      {breaches.length > 0 && <Button label="Secure these accounts" onPress={() => router.push('/fixes')} />}
      <Text style={{ color: C.faint, fontSize: 11, textAlign: 'center' }}>
        {report.demo ? 'Sample data shown (demo mode).' : 'Breach data from Have I Been Pwned.'}
      </Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  h1: { color: C.text, fontSize: 22, fontWeight: '600' },
  alert: { flexDirection: 'row', gap: 14, padding: 16, borderRadius: 18, backgroundColor: '#1A0F0B', borderWidth: 1, borderColor: '#5A2A1C' },
  list: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, overflow: 'hidden' },
  row: { flexDirection: 'row', gap: 14, padding: 16 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: C.divider },
  initial: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' },
  tag: { fontSize: 11, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, overflow: 'hidden' },
});
