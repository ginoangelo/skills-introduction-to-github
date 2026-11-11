import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Button, Card, Eyebrow, Screen } from '@/components/ui';
import { C, Font } from '@/constants/theme';
import { MODES, type SwitchState } from '@/lib/modes';
import { useStore } from '@/lib/store';

const chip: Record<SwitchState, { bg: string; fg: string; dot: string; word: string }> = {
  on: { bg: C.accentTint, fg: '#9FF5D6', dot: C.accent, word: 'on' },
  off: { bg: '#1A0F0B', fg: '#FFB8A3', dot: C.danger, word: 'off' },
  limited: { bg: C.warnTint, fg: '#FFD596', dot: C.warn, word: 'limited' },
};

export default function ModesScreen() {
  const { mode, setMode } = useStore();
  const [selected, setSelected] = useState(mode);
  const sel = MODES.find((m) => m.id === selected) ?? MODES[0];
  const isActive = selected === mode;

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Eyebrow>PRIVACY MODES</Eyebrow>
        <Text style={s.h1} accessibilityRole="header">
          How deep today?
        </Text>
      </View>

      <View style={s.stack}>
        {MODES.map((m, i) => {
          const on = m.id === selected;
          return (
            <Pressable
              key={m.id}
              accessibilityRole="radio"
              accessibilityState={{ checked: on }}
              accessibilityLabel={`${m.name}. ${m.tagline}`}
              onPress={() => setSelected(m.id)}
              style={[
                s.band,
                { backgroundColor: on ? '#10221B' : ['#0E1A22', '#0B141C', '#080F16', '#05080C'][i], borderLeftColor: on ? C.accent : 'transparent' },
              ]}>
              <Text style={[s.depth, { color: on ? C.accent : C.faint }]}>{m.depth}</Text>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[s.modeName, { color: on ? C.text : C.textSoft }]}>{m.name}</Text>
                <Text style={s.tagline}>{m.tagline}</Text>
              </View>
              {m.id === mode && (
                <View style={s.activeDot}>
                  <Icon name="check" size={14} color={C.onAccent} strokeWidth={3} />
                </View>
              )}
            </Pressable>
          );
        })}
      </View>

      <Card>
        <Eyebrow>{sel.name.toUpperCase()} SWITCHES</Eyebrow>
        <View style={s.chips}>
          {sel.switches.map((sw) => {
            const c = chip[sw.state];
            return (
              <View key={sw.label} style={[s.chip, { backgroundColor: c.bg }]}>
                <View style={[s.dot, { backgroundColor: c.dot }]} />
                <Text style={{ color: c.fg, fontSize: 12 }}>
                  {sw.label} · {c.word}
                </Text>
              </View>
            );
          })}
        </View>
      </Card>

      <Button
        label={isActive ? `${sel.name} is on` : `Dive to ${sel.name}`}
        variant={isActive ? 'secondary' : 'primary'}
        onPress={() => setMode(sel.id)}
      />
      {sel.id !== 'surface' && (
        <Pressable accessibilityRole="button" onPress={() => Linking.openSettings()} style={s.settingsLink}>
          <Icon name="settings" size={16} color={C.accent} />
          <Text style={{ color: C.accent, fontSize: 14 }}>Open Settings to apply these switches</Text>
        </Pressable>
      )}
      <Text style={s.note}>
        Phones don’t let apps flip these switches by themselves yet. Veil keeps track of your mode and guides you; one-tap
        switching through Shortcuts (iPhone) and Do Not Disturb (Android) is coming next.
      </Text>
    </Screen>
  );
}

const s = StyleSheet.create({
  h1: { color: C.text, fontSize: 22, fontWeight: '600' },
  stack: { borderRadius: 22, overflow: 'hidden', borderWidth: 1, borderColor: C.border },
  band: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, minHeight: 76, borderLeftWidth: 4 },
  depth: { fontFamily: Font.mono, fontSize: 11, width: 40 },
  modeName: { fontSize: 18, fontWeight: '600' },
  tagline: { color: C.faint, fontSize: 12 },
  activeDot: { width: 26, height: 26, borderRadius: 13, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  settingsLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44 },
  note: { color: C.faint, fontSize: 12, lineHeight: 18, textAlign: 'center' },
});
