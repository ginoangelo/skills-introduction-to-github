import { Image, StyleSheet, Text, View } from "react-native";
import { fonts, useTheme } from "../lib/theme";
import { SCALE, type Entry } from "../lib/types";
import { Body } from "./ui";

const LEGIBILITY: Record<string, string> = {
  partial: "Parts of this screenshot were hard to read, so this is a weaker read.",
  poor: "This screenshot was hard to read. Treat this as a rough read and try a clearer shot.",
};

export function ResultView({ entry }: { entry: Entry }) {
  const t = useTheme();
  const r = entry.result;

  if (r.refused) {
    return (
      <View style={[s.refused, { backgroundColor: t.surface2 }]}>
        <Text style={[s.refusedTitle, { color: t.ink }]}>No read for this one</Text>
        <Body muted>{r.refusal_reason || "Subtext doesn't read this kind of screenshot."}</Body>
      </View>
    );
  }

  const verdict = r.aimed_at_you.verdict;
  const idx = SCALE.indexOf(verdict);
  const on = t.onColor;

  return (
    <View>
      {entry.mode === "example" && (
        <View style={[s.banner, { backgroundColor: t.mist }]}>
          <Text style={[s.bannerText, { color: t.ink }]}>This is an example read. Connect the decode service to read your own screenshots.</Text>
        </View>
      )}

      <View style={[s.hero, { backgroundColor: t.brand }]}>
        <View style={s.heroTop}>
          <View style={{ flex: 1 }}>
            <Text style={[s.eyebrow, { color: on }]}>{(r.platform || "Screenshot").toUpperCase()}</Text>
            <Text style={[s.heroH2, { color: on }]}>Aimed at you?</Text>
            <Text style={[s.verdict, { color: on }]}>{verdict}</Text>
          </View>
          <Image source={{ uri: entry.thumb }} style={[s.heroImg, { borderColor: "rgba(255,255,255,0.45)" }]} />
        </View>
        <View style={{ gap: 8 }} accessibilityLabel={`Scale from Unlikely to Likely. ${verdict}.`}>
          <View style={s.scaleRow}>
            {SCALE.map((v, i) => (
              <View key={v} style={[s.bar, { backgroundColor: i <= idx ? on : "rgba(255,255,255,0.28)" }]} />
            ))}
          </View>
          <View style={s.scaleRow}>
            {SCALE.map((v, i) => (
              <Text key={v} style={[s.scaleLabel, { color: on, opacity: i === idx ? 1 : 0.7, textAlign: i === 0 ? "left" : i === 1 ? "center" : "right" }]}>
                {v}
              </Text>
            ))}
          </View>
          {idx === -1 && <Text style={[s.scaleNote, { color: on }]}>Not enough in the screenshot or your context to place it.</Text>}
        </View>
        <Text style={[s.reason, { color: on }]}>{r.aimed_at_you.reason}</Text>
      </View>

      {LEGIBILITY[r.legibility] && (
        <View style={[s.legibility, { backgroundColor: t.possibly + "24" }]}>
          <Body>{LEGIBILITY[r.legibility]}</Body>
        </View>
      )}

      <Block title="What it means">
        <View style={[s.meaning, { backgroundColor: t.mist }]}>
          <Text style={[s.meaningText, { color: t.ink }]}>{r.meaning}</Text>
        </View>
      </Block>

      <Block title="What it says">
        <Body muted>{r.literal}</Body>
      </Block>

      {r.evidence.length > 0 && (
        <Block title="Evidence">
          <View style={[s.evidence, { borderColor: t.line }]}>
            {r.evidence.map((e, i) => (
              <View key={i} style={[s.evRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.line }]}>
                <Text style={[s.cue, { color: t.ink }]}>{e.cue}</Text>
                <Text style={[s.why, { color: t.ink2 }]}>{e.why}</Text>
              </View>
            ))}
          </View>
        </Block>
      )}

      {r.other_readings.length > 0 && (
        <Block title="Other readings">
          <View style={{ gap: 10 }}>
            {r.other_readings.map((o, i) => (
              <View key={i} style={[s.reading, { backgroundColor: t.surface2 }]}>
                <Body>{o}</Body>
              </View>
            ))}
          </View>
        </Block>
      )}

      {entry.context ? (
        <Block title="Your context">
          <View style={[s.reading, { backgroundColor: t.surface2 }]}>
            <Text style={[s.quote, { color: t.ink2 }]}>{`“${entry.context}”`}</Text>
          </View>
        </Block>
      ) : null}
    </View>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: 12, marginTop: 28 }}>
      <Text style={[s.blockTitle, { color: t.ink }]} accessibilityRole="header">
        {title}
      </Text>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  banner: { marginTop: 14, borderRadius: 14, padding: 14 },
  bannerText: { fontFamily: fonts.bodyMedium, fontSize: 13.5, lineHeight: 19 },
  hero: { marginTop: 16, borderRadius: 24, padding: 22, gap: 18 },
  heroTop: { flexDirection: "row", gap: 16, alignItems: "flex-start" },
  eyebrow: { fontFamily: fonts.bodySemi, fontSize: 12, letterSpacing: 1, opacity: 0.8 },
  heroH2: { fontFamily: fonts.bodySemi, fontSize: 17, marginTop: 10, opacity: 0.92 },
  verdict: { fontFamily: fonts.display, fontSize: 40, letterSpacing: -1.4, lineHeight: 44, marginTop: 2 },
  heroImg: { width: 58, height: 76, borderRadius: 12, borderWidth: 2 },
  scaleRow: { flexDirection: "row", gap: 6 },
  bar: { flex: 1, height: 6, borderRadius: 3 },
  scaleLabel: { flex: 1, fontFamily: fonts.bodySemi, fontSize: 12 },
  scaleNote: { fontFamily: fonts.body, fontSize: 12.5, opacity: 0.85 },
  reason: { fontFamily: fonts.body, fontSize: 15.5, lineHeight: 22, opacity: 0.95 },
  legibility: { marginTop: 14, borderRadius: 14, padding: 14 },
  blockTitle: { fontFamily: fonts.displayBold, fontSize: 19, letterSpacing: -0.3 },
  meaning: { borderRadius: 20, padding: 20 },
  meaningText: { fontFamily: fonts.bodyMedium, fontSize: 17, lineHeight: 25 },
  evidence: { borderRadius: 20, borderWidth: 1, overflow: "hidden" },
  evRow: { paddingVertical: 15, paddingHorizontal: 18, gap: 3 },
  cue: { fontFamily: fonts.displayBold, fontSize: 15 },
  why: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  reading: { borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16 },
  quote: { fontFamily: fonts.body, fontStyle: "italic", fontSize: 15 },
  refused: { marginTop: 18, borderRadius: 22, padding: 22, gap: 10 },
  refusedTitle: { fontFamily: fonts.display, fontSize: 22 },
});
