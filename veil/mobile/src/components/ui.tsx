import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import { C, Font, Radius, Space } from '@/constants/theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollBody}>{children}</ScrollView>
      ) : (
        <View style={[styles.scrollBody, { flex: 1 }]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

/** Small uppercase monospace label used above sections ("LAST SCAN · TODAY"). */
export function Eyebrow({ children, color = C.faint }: { children: ReactNode; color?: string }) {
  return <Text style={[styles.eyebrow, { color }]}>{children}</Text>;
}

export function Title({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return (
    <Text style={[styles.title, style]} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, style }: { children: ReactNode; style?: StyleProp<TextStyle> }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, icon }: ButtonProps) {
  const primary = variant === 'primary';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, busy: !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        (pressed || disabled) && { opacity: 0.75 },
      ]}>
      {loading ? (
        <ActivityIndicator color={primary ? C.onAccent : C.text} />
      ) : (
        <>
          <Text style={[styles.buttonText, { color: primary ? C.onAccent : C.text }]}>{label}</Text>
          {icon}
        </>
      )}
    </Pressable>
  );
}

export function Pill({ label, fg, bg }: { label: string; fg: string; bg: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }]}>
      <Text style={[styles.pillText, { color: fg }]}>{label}</Text>
    </View>
  );
}

export function ScoreRing({ score, size = 132 }: { score: number; size?: number }) {
  const r = 86;
  const circumference = 2 * Math.PI * r;
  const on = (circumference * score) / 100;
  const color = score >= 80 ? C.accent : score >= 50 ? C.warn : C.danger;
  return (
    <View
      style={{ width: size, height: size }}
      accessible
      accessibilityRole="image"
      accessibilityLabel={`Privacy score ${score} out of 100`}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <Circle cx={100} cy={100} r={r} fill="none" stroke="#1A222C" strokeWidth={14} />
        <Circle
          cx={100}
          cy={100}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={14}
          strokeLinecap="round"
          strokeDasharray={`${on} ${circumference - on}`}
          transform="rotate(-90 100 100)"
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <Text style={styles.scoreNumber}>{score}</Text>
        <Text style={styles.scoreOf}>/ 100</Text>
      </View>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  scrollBody: { paddingHorizontal: Space.xl, paddingTop: Space.lg, paddingBottom: 40, gap: Space.lg },
  center: { alignItems: 'center', justifyContent: 'center' },
  eyebrow: { fontFamily: Font.mono, fontSize: 11, letterSpacing: 1.5 },
  title: { color: C.text, fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  body: { color: C.muted, fontSize: 15, lineHeight: 22 },
  card: {
    backgroundColor: C.surface,
    borderColor: C.border,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Space.lg,
    gap: Space.md,
  },
  button: {
    minHeight: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Space.sm,
    paddingHorizontal: Space.lg,
  },
  buttonPrimary: { backgroundColor: C.accent },
  buttonSecondary: { borderWidth: 1, borderColor: C.border },
  buttonText: { fontSize: 16, fontWeight: '600' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  pillText: { fontFamily: Font.mono, fontSize: 11, letterSpacing: 0.8 },
  scoreNumber: { color: C.text, fontSize: 40, fontWeight: '700' },
  scoreOf: { color: C.faint, fontFamily: Font.mono, fontSize: 11 },
});
