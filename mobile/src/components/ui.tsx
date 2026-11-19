import type { ReactNode } from "react";
import { Image, Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type TextStyle, type ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { isLive } from "../lib/api";
import { fonts, space, useTheme, verdictColor } from "../lib/theme";
import { formatWhen } from "../lib/store";
import type { Entry } from "../lib/types";
import { Icon, type IconName } from "./Icon";

/** Scrollable page with the brand bar on top. Tab screens leave room for the docked tab bar. */
export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: insets.top + 6, paddingLeft: Math.max(space.gutter, insets.left), paddingRight: Math.max(space.gutter, insets.right) };
  const inner = <View style={styles.column}>{children}</View>;
  if (!scroll) return <View style={[{ flex: 1, backgroundColor: t.bg }, pad]}>{inner}</View>;
  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={[pad, { paddingBottom: insets.bottom + 40 }]} keyboardShouldPersistTaps="handled">
      {inner}
    </ScrollView>
  );
}

export function BrandBar() {
  const t = useTheme();
  return (
    <View style={styles.brandbar}>
      <View style={styles.wordmark}>
        <View style={[styles.mark, { backgroundColor: t.brand }]}>
          <View style={[styles.markLine, { width: 16, top: 9 }]} />
          <View style={[styles.markLine, { width: 10, top: 16, backgroundColor: t.markAccent }]} />
        </View>
        <Text style={[styles.wordmarkText, { color: t.ink }]}>Subtext</Text>
      </View>
      <Pressable onPress={() => router.push("/about")} style={[styles.status, { backgroundColor: t.surface2 }]} accessibilityRole="button" accessibilityLabel="Decode mode">
        <View style={[styles.dot, { backgroundColor: isLive ? t.unlikely : t.possibly }]} />
        <Text style={[styles.statusText, { color: t.ink2 }]}>{isLive ? "Live" : "Example mode"}</Text>
      </Pressable>
    </View>
  );
}

export function Title({ children, right, small, onBack }: { children: string; right?: ReactNode; small?: boolean; onBack?: () => void }) {
  const t = useTheme();
  return (
    <View style={[styles.titleRow, small && { marginTop: 10, gap: 14 }]}>
      {onBack && <RoundButton icon="back" label="Back" onPress={onBack} small />}
      <Text style={[small ? styles.titleSmall : styles.title, { color: t.ink, flex: 1 }]} accessibilityRole="header">
        {children}
      </Text>
      {right}
    </View>
  );
}

export function RoundButton({ icon, label, onPress, small }: { icon: IconName; label: string; onPress: () => void; small?: boolean }) {
  const t = useTheme();
  const size = small ? 42 : 48;
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={({ pressed }) => [{ width: size, height: size, borderRadius: size / 2, backgroundColor: t.surface2, alignItems: "center", justifyContent: "center", opacity: pressed ? 0.7 : 1 }]}>
      <Icon name={icon} color={t.ink} size={small ? 20 : 22} />
    </Pressable>
  );
}

export function Section({ title, right, children, style }: { title?: string; right?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View style={[styles.section, style]}>
      {title && (
        <View style={styles.sectionHead}>
          <Text style={[styles.h2, { color: t.ink }]} accessibilityRole="header">
            {title}
          </Text>
          {right}
        </View>
      )}
      {children}
    </View>
  );
}

type PillKind = "light" | "dark" | "ghost" | "danger";
export function Pill({ label, onPress, kind = "dark", block, disabled }: { label: string; onPress: () => void; kind?: PillKind; block?: boolean; disabled?: boolean }) {
  const t = useTheme();
  const bg = kind === "light" ? t.onColor : kind === "dark" ? t.pill : "transparent";
  const fg = kind === "light" ? t.onColorInk : kind === "dark" ? t.pillInk : kind === "danger" ? t.likely : t.ink;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: bg, borderWidth: kind === "ghost" || kind === "danger" ? 1.5 : 0, borderColor: t.line, opacity: disabled ? 0.55 : 1, transform: [{ scale: pressed ? 0.97 : 1 }] },
        block && { alignSelf: "stretch", minHeight: 54 },
      ]}
    >
      <Text numberOfLines={1} style={[styles.pillText, { color: fg }, block && { fontSize: 16 }]}>{label}</Text>
    </Pressable>
  );
}

export function PromoCard({ tone, text, action, art, hint }: { tone: "brand" | "peach" | "butter"; text: string; action: ReactNode; art: ReactNode; hint?: string }) {
  const t = useTheme();
  const bg = tone === "brand" ? t.brand : tone === "peach" ? t.peach : t.butter;
  const fg = tone === "brand" ? t.onColor : t.ink;
  return (
    <View style={[styles.promo, { backgroundColor: bg, minHeight: tone === "peach" ? 140 : 168 }]}>
      <View style={styles.promoCopy}>
        <Text style={[styles.promoText, { color: fg }]}>{text}</Text>
        {action}
        {hint && <Text style={[styles.promoHint, { color: fg }]}>{hint}</Text>}
      </View>
      <View>{art}</View>
    </View>
  );
}

export function VerdictChip({ verdict }: { verdict: string }) {
  const t = useTheme();
  const c = verdictColor(t, verdict);
  return (
    <View style={[styles.chip, { backgroundColor: c + "22" }]}>
      <View style={[styles.chipDot, { backgroundColor: c }]} />
      <Text style={[styles.chipText, { color: c }]}>{verdict}</Text>
    </View>
  );
}

export function EntryRow({ entry, onDelete }: { entry: Entry; onDelete: () => void }) {
  const t = useTheme();
  const r = entry.result;
  const verdict = r.refused ? "Not read" : r.aimed_at_you.verdict;
  return (
    <View style={[styles.row, { backgroundColor: t.surface, borderColor: t.line }]}>
      <Pressable style={styles.rowOpen} onPress={() => router.push({ pathname: "/read/[id]", params: { id: entry.id } })} accessibilityRole="button" accessibilityLabel={`Open read: ${verdict}`}>
        <Image source={{ uri: entry.thumb }} style={[styles.rowImg, { backgroundColor: t.surface2 }]} />
        <View style={{ flex: 1, gap: 4 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <VerdictChip verdict={verdict} />
            <Text style={[styles.small, { color: t.ink2 }]}>{formatWhen(entry.when)}</Text>
          </View>
          <Text numberOfLines={2} style={[styles.rowText, { color: t.ink2 }]}>
            {r.refused ? r.refusal_reason : r.meaning}
          </Text>
        </View>
      </Pressable>
      <Pressable onPress={onDelete} accessibilityRole="button" accessibilityLabel="Delete this decode" style={styles.del} hitSlop={6}>
        <Icon name="close" color={t.ink2} size={18} />
      </Pressable>
    </View>
  );
}

export function Empty({ title, text }: { title: string; text: string }) {
  const t = useTheme();
  return (
    <View style={[styles.empty, { backgroundColor: t.surface2 }]}>
      <Text style={[styles.emptyTitle, { color: t.ink }]}>{title}</Text>
      <Text style={[styles.body, { color: t.ink2 }]}>{text}</Text>
    </View>
  );
}

export function Body({ children, style, muted }: { children: ReactNode; style?: StyleProp<TextStyle>; muted?: boolean }) {
  const t = useTheme();
  return <Text style={[styles.body, { color: muted ? t.ink2 : t.ink }, style]}>{children}</Text>;
}

export const styles = StyleSheet.create({
  column: { width: "100%", maxWidth: 480, alignSelf: "center" },
  brandbar: { height: 48, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  wordmark: { flexDirection: "row", alignItems: "center", gap: 9 },
  mark: { width: 28, height: 28, borderRadius: 8 },
  markLine: { position: "absolute", left: 6, height: 3, borderRadius: 2, backgroundColor: "#ffffff" },
  wordmarkText: { fontFamily: fonts.display, fontSize: 18, letterSpacing: -0.4 },
  status: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontFamily: fonts.bodySemi, fontSize: 12.5 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 12, marginTop: 22, marginBottom: 6 },
  title: { fontFamily: fonts.display, fontSize: 38, letterSpacing: -1.3, lineHeight: 42 },
  titleSmall: { fontFamily: fonts.display, fontSize: 26, letterSpacing: -0.8 },
  section: { gap: 14, marginTop: space.section },
  sectionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  h2: { fontFamily: fonts.displayBold, fontSize: 21, letterSpacing: -0.4, lineHeight: 26, flexShrink: 1 },
  pill: { minHeight: 44, borderRadius: 999, paddingHorizontal: 18, paddingVertical: 11, alignItems: "center", justifyContent: "center", alignSelf: "flex-start" },
  pillText: { fontFamily: fonts.displayBold, fontSize: 15 },
  promo: { borderRadius: space.radius, padding: space.card, flexDirection: "row", alignItems: "center", gap: 14, overflow: "hidden" },
  promoCopy: { flex: 1, gap: 18, alignItems: "flex-start" },
  promoText: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 23 },
  promoHint: { fontFamily: fonts.body, fontSize: 12.5, opacity: 0.78, marginTop: -8 },
  chip: { flexDirection: "row", alignItems: "center", gap: 6, paddingLeft: 8, paddingRight: 10, paddingVertical: 3, borderRadius: 999 },
  chipDot: { width: 7, height: 7, borderRadius: 4 },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 12 },
  row: { flexDirection: "row", alignItems: "center", borderRadius: 18, borderWidth: 1, paddingVertical: 12, paddingLeft: 12, paddingRight: 4 },
  rowOpen: { flex: 1, flexDirection: "row", alignItems: "center", gap: 14 },
  rowImg: { width: 52, height: 68, borderRadius: 10 },
  rowText: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  del: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  small: { fontFamily: fonts.body, fontSize: 12 },
  empty: { borderRadius: 18, padding: 20, gap: 4 },
  emptyTitle: { fontFamily: fonts.displayBold, fontSize: 16 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
});
