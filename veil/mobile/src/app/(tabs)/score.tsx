import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Icon } from '@/components/icon';
import { Card, Eyebrow, Pill, Screen, ScoreRing } from '@/components/ui';
import { C } from '@/constants/theme';
import { MODES } from '@/lib/modes';
import { computeScore, riskLabel } from '@/lib/score';
import { useStore } from '@/lib/store';

export default function ScoreScreen() {
  const { report, fixes, done, mode } = useStore();
  if (!report) return <Redirect href="/" />;

  const score = computeScore(fixes, done);
  const best = computeScore(fixes, Object.fromEntries(fixes.map((f) => [f.id, true])));
  const open = fixes.filter((f) => !done[f.id]);
  const top = open[0];
  const risk = riskLabel(score);
  const tone = { ok: [C.accent, C.accentTint], warn: [C.warn, C.warnTint], danger: [C.danger, C.dangerTint] }[risk.tone];
  const passwordBreaches = report.breaches.filter((b) => b.dataClasses.includes('Passwords')).length;
  const modeName = MODES.find((m) => m.id === mode)?.name ?? 'Surface';

  return (
    <Screen>
      <View style={s.header}>
        <View style={{ gap: 2 }}>
          <Eyebrow>{report.demo ? 'SAMPLE DATA · DEMO MODE' : `LAST SCAN · ${new Date(report.scannedAt).toLocaleDateString()}`}</Eyebrow>
          <Text style={s.h1} accessibilityRole="header">
            Your exposure
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Pressable accessibilityRole="button" accessibilityLabel={`Privacy mode: ${modeName}`} onPress={() => router.push('/modes')} style={s.chip}>
            <Icon name="waves" size={16} color={C.accent} strokeWidth={2} />
            <Text style={s.chipText}>{modeName}</Text>
          </Pressable>
          <Pressable accessibilityRole="button" accessibilityLabel="Rescan" onPress={() => router.push('/scan')} style={s.iconBtn}>
            <Icon name="refresh" size={18} color={C.text} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <Card style={s.scoreCard}>
        <ScoreRing score={score} />
        <View style={{ flex: 1, gap: 8 }}>
          <Pill label={risk.label} fg={tone[0]} bg={tone[1]} />
          <Text style={s.scoreNote}>
            {open.length === 0 ? (
              'Every fix is done. Rescan monthly to stay ahead.'
            ) : (
              <>
                {open.length} {open.length === 1 ? 'fix' : 'fixes'} could raise your score to{' '}
                <Text style={{ color: C.text, fontWeight: '700' }}>{best}</Text>.
              </>
            )}
          </Text>
        </View>
      </Card>

      <View style={s.grid}>
        <Tile label="Breaches" value={String(report.breaches.length)} sub={report.breaches.length ? 'found' : 'none'} color={report.breaches.length ? C.danger : C.accent} onPress={() => router.push('/exposure')} />
        <Tile label="Leaked passwords" value={String(passwordBreaches)} sub={passwordBreaches ? 'breaches' : 'none'} color={passwordBreaches ? C.danger : C.accent} onPress={() => router.push('/exposure')} />
        <Tile label="Fixes left" value={String(open.length)} sub={`of ${fixes.length}`} color={C.warn} onPress={() => router.push('/fixes')} />
        <Tile label="Privacy mode" value={modeName} sub="tap to change" color={C.accent} onPress={() => router.push('/modes')} small />
      </View>

      {top && (
        <Pressable accessibilityRole="button" onPress={() => router.push('/fixes')} style={s.topFix}>
          <View style={s.bolt}>
            <Icon name="bolt" size={20} color={C.onAccent} strokeWidth={2} />
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={s.topFixTitle}>Top fix: {top.title}</Text>
            <Text style={s.topFixSub}>
              +{top.points} points · about {top.minutes} min
            </Text>
          </View>
        </Pressable>
      )}
    </Screen>
  );
}

function Tile(props: { label: string; value: string; sub: string; color: string; onPress: () => void; small?: boolean }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${props.label}: ${props.value} ${props.sub}`} onPress={props.onPress} style={s.tile}>
      <Text style={s.tileLabel}>{props.label}</Text>
      {props.small ? (
        <View style={{ gap: 2 }}>
          <Text style={[s.tileValue, { fontSize: 18 }]} numberOfLines={1}>
            {props.value}
          </Text>
          <Text style={[s.tileSub, { color: props.color }]}>{props.sub}</Text>
        </View>
      ) : (
        <Text style={s.tileValue} numberOfLines={1}>
          {props.value} <Text style={[s.tileSub, { color: props.color }]}>{props.sub}</Text>
        </Text>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  h1: { color: C.text, fontSize: 22, fontWeight: '600' },
  chip: { height: 44, paddingHorizontal: 12, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, flexDirection: 'row', alignItems: 'center', gap: 8 },
  chipText: { color: C.text, fontSize: 13 },
  iconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' },
  scoreCard: { flexDirection: 'row', alignItems: 'center', gap: 20, padding: 22, borderRadius: 24 },
  scoreNote: { color: C.textSoft, fontSize: 15, lineHeight: 21 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  tile: { flexBasis: '47%', flexGrow: 1, backgroundColor: C.surface, borderWidth: 1, borderColor: C.border, borderRadius: 18, padding: 16, gap: 10, minHeight: 96 },
  tileLabel: { color: C.muted, fontSize: 14 },
  tileValue: { color: C.text, fontSize: 24, fontWeight: '600' },
  tileSub: { fontSize: 13, fontWeight: '500' },
  topFix: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: 18, backgroundColor: C.accentTint, borderWidth: 1, borderColor: C.accentEdge },
  bolt: { width: 40, height: 40, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' },
  topFixTitle: { color: C.text, fontSize: 15, fontWeight: '600' },
  topFixSub: { color: C.muted, fontSize: 13 },
});
