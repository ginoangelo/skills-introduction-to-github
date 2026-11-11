import { Redirect } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, Eyebrow, Screen } from '@/components/ui';
import { C, Font, severityColor } from '@/constants/theme';
import { computeScore } from '@/lib/score';
import { useStore } from '@/lib/store';

type Filter = 'all' | 'critical' | 'quick';

export default function FixesScreen() {
  const { report, fixes, done, toggleFix } = useStore();
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<string | null>(null);
  if (!report) return <Redirect href="/" />;

  const score = computeScore(fixes, done);
  const doneCount = fixes.filter((f) => done[f.id]).length;
  const shown = fixes.filter((f) =>
    filter === 'critical' ? f.severity === 'critical' : filter === 'quick' ? f.minutes <= 3 : true,
  );

  return (
    <Screen>
      <View style={{ gap: 2 }}>
        <Eyebrow>ADVISOR</Eyebrow>
        <Text style={s.h1} accessibilityRole="header">
          Fix list
        </Text>
      </View>

      <Card>
        <View style={s.rowBetween}>
          <Text style={{ color: C.muted, fontSize: 14 }}>Your score</Text>
          <Text style={s.big}>
            {score}
            <Text style={{ color: C.faint, fontSize: 14 }}> / 100</Text>
          </Text>
        </View>
        <View style={s.barTrack}>
          <View style={[s.barFill, { width: `${score}%` }]} />
        </View>
        <Text style={s.mono}>
          {doneCount} OF {fixes.length} FIXES DONE · TAP A FIX TO MARK IT
        </Text>
      </Card>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        {(
          [
            ['all', 'All'],
            ['critical', 'Critical'],
            ['quick', 'Quick wins'],
          ] as const
        ).map(([id, label]) => {
          const on = filter === id;
          return (
            <Pressable
              key={id}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => setFilter(id)}
              style={[s.filter, on && { backgroundColor: C.text, borderColor: C.text }]}>
              <Text style={{ color: on ? C.bg : C.textSoft, fontSize: 13, fontWeight: on ? '600' : '400' }}>{label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={{ gap: 10 }}>
        {shown.map((f) => {
          const isDone = !!done[f.id];
          const color = isDone ? '#5C6875' : severityColor[f.severity];
          const expanded = open === f.id;
          return (
            <View key={f.id} style={s.fix}>
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isDone }}
                accessibilityLabel={f.title}
                onPress={() => toggleFix(f.id)}
                style={s.fixMain}>
                <View style={[s.box, isDone ? { backgroundColor: C.accent, borderColor: C.accent } : { borderColor: color }]}>
                  {isDone && <Icon name="check" size={16} color={C.onAccent} strokeWidth={3} />}
                </View>
                <View style={{ flex: 1, gap: 3 }}>
                  <Text style={[s.fixTitle, isDone && { color: C.faint, textDecorationLine: 'line-through' }]}>{f.title}</Text>
                  <Text style={s.fixMeta}>
                    {f.severity === 'critical' ? 'Critical' : f.severity === 'high' ? 'High' : 'Quick win'} · {f.minutes} min
                  </Text>
                </View>
                <Text style={[s.points, { color }]}>+{f.points}</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                accessibilityState={{ expanded }}
                onPress={() => setOpen(expanded ? null : f.id)}
                style={s.howBtn}>
                <Text style={s.howText}>{expanded ? 'Hide steps' : 'How to fix'}</Text>
              </Pressable>
              {expanded && <Text style={s.detail}>{f.detail}</Text>}
            </View>
          );
        })}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  h1: { color: C.text, fontSize: 22, fontWeight: '600' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  big: { color: C.text, fontSize: 28, fontWeight: '700' },
  barTrack: { height: 8, borderRadius: 4, backgroundColor: '#1A222C', overflow: 'hidden' },
  barFill: { height: 8, borderRadius: 4, backgroundColor: C.accent },
  mono: { color: C.faint, fontFamily: Font.mono, fontSize: 11 },
  filter: { paddingHorizontal: 12, minHeight: 36, justifyContent: 'center', borderRadius: 999, borderWidth: 1, borderColor: C.border },
  fix: { backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  fixMain: { flexDirection: 'row', alignItems: 'center', gap: 14, minHeight: 44 },
  box: { width: 26, height: 26, borderRadius: 8, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  fixTitle: { color: C.text, fontSize: 15, fontWeight: '500' },
  fixMeta: { color: C.faint, fontSize: 12 },
  points: { fontFamily: Font.mono, fontSize: 13 },
  howBtn: { alignSelf: 'flex-start', marginLeft: 40, minHeight: 36, justifyContent: 'center' },
  howText: { color: C.accent, fontSize: 13 },
  detail: { color: C.textSoft, fontSize: 14, lineHeight: 20, marginLeft: 40, paddingBottom: 10 },
});
