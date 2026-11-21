import { useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { Icon } from "./Icon";
import { Body, Pill } from "./ui";
import { DecodeError, getWhatNow, isLive } from "../lib/api";
import { useBilling } from "../lib/billing";
import { useStore } from "../lib/store";
import { fonts, useTheme } from "../lib/theme";
import type { Entry, Tone, WhatNowOption } from "../lib/types";

const TONES: [Tone, string][] = [
  ["warm", "Warm"],
  ["direct", "Direct"],
  ["light", "Light"],
];

/** "What now?": after a read, three calm options for what to do next, with wording to copy. */
export function WhatNow({ entry }: { entry: Entry }) {
  const t = useTheme();
  const { updateEntry } = useStore();
  const { isPro } = useBilling();
  const saved = entry.whatnow;
  const [tone, setTone] = useState<Tone>(saved?.tone ?? "warm");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ code: string; message: string } | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const live = entry.mode === "live" && isLive;

  const ask = async (nextTone: Tone) => {
    setTone(nextTone);
    setBusy(true);
    setError(null);
    try {
      const result = await getWhatNow(entry.result, entry.context, nextTone, live);
      updateEntry(entry.id, { whatnow: { tone: nextTone, result } });
    } catch (e) {
      const err = e as DecodeError;
      if (saved) setTone(saved.tone); // keep the chips matching the suggestions on screen
      setError({ code: err.code ?? "server", message: err.message });
    } finally {
      setBusy(false);
    }
  };

  const copy = async (o: WhatNowOption) => {
    await Clipboard.setStringAsync(o.message);
    setCopied(o.kind);
    setTimeout(() => setCopied(null), 1500);
  };

  const toneChips = (
    <View style={s.chips} accessibilityRole="radiogroup" accessibilityLabel="Tone for suggested messages">
      {TONES.map(([value, label]) => {
        const on = value === tone;
        return (
          <Pressable
            key={value}
            onPress={() => (saved ? ask(value) : setTone(value))}
            disabled={busy}
            accessibilityRole="radio"
            accessibilityState={{ checked: on, disabled: busy }}
            style={[s.chip, { backgroundColor: on ? t.pill : t.surface, borderColor: on ? t.pill : t.line }]}
          >
            <Text style={[s.chipText, { color: on ? t.pillInk : t.ink }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  const result = saved?.result;

  return (
    <View style={{ marginTop: 28, gap: 12 }}>
      <Text style={[s.title, { color: t.ink }]} accessibilityRole="header">
        What now?
      </Text>

      {!result && (
        <View style={[s.card, { backgroundColor: t.peach }]}>
          <Text style={[s.lead, { color: t.ink }]}>Not sure what to do? Get three calm options, with words you can send.</Text>
          <Text style={[s.small, { color: t.ink2 }]}>Pick a tone for the messages</Text>
          {toneChips}
          <Pill kind="dark" block label={busy ? "Thinking it over…" : "Show me options"} onPress={() => ask(tone)} disabled={busy} />
          {live && !isPro && <Text style={[s.small, { color: t.ink2, textAlign: "center" }]}>Free: 1 a day. Pro: unlimited.</Text>}
        </View>
      )}

      {result && result.refused && (
        <View style={[s.card, { backgroundColor: t.surface2 }]}>
          <Body>{result.refusal_reason || "Aimed can't suggest a next step for this one."}</Body>
        </View>
      )}

      {result && !result.refused && (
        <View style={{ gap: 12 }}>
          {!live && (
            <View style={[s.tag, { backgroundColor: t.tagBg }]}>
              <Text style={[s.tagText, { color: t.onColorInk }]}>Example suggestions</Text>
            </View>
          )}
          <Text style={[s.headline, { color: t.ink }]}>{result.headline}</Text>
          {result.options.map((o) => {
            const best = o.kind === result.recommended;
            return (
              <View key={o.kind} style={[s.option, { backgroundColor: t.surface, borderColor: best ? t.brand : t.line, borderWidth: best ? 2 : 1 }]}>
                <View style={s.optionHead}>
                  <Text style={[s.optionTitle, { color: t.ink }]}>{o.title}</Text>
                  {best && (
                    <View style={[s.best, { backgroundColor: t.brand }]}>
                      <Text style={[s.bestText, { color: t.onColor }]}>Best fit</Text>
                    </View>
                  )}
                </View>
                {o.why ? <Text style={[s.why, { color: t.ink2 }]}>{o.why}</Text> : null}
                {o.message ? (
                  <View style={[s.message, { backgroundColor: t.mist }]}>
                    <Text style={[s.messageText, { color: t.ink }]}>{`“${o.message}”`}</Text>
                    <Pressable onPress={() => copy(o)} accessibilityRole="button" accessibilityLabel={`Copy the ${o.title} message`} hitSlop={8} style={s.copy}>
                      <Icon name={copied === o.kind ? "check" : "copy"} color={t.brand} size={18} />
                      <Text style={[s.copyText, { color: t.brand }]}>{copied === o.kind ? "Copied" : "Copy"}</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          })}
          <Text style={[s.small, { color: t.ink2 }]}>Try another tone</Text>
          {toneChips}
          {busy && <ActivityIndicator color={t.brand} style={{ marginTop: 4 }} />}
          <Text style={[s.small, { color: t.ink2 }]}>You decide what to send. Aimed never posts or messages anyone.</Text>
        </View>
      )}

      {error && (
        <View style={[s.card, { backgroundColor: t.surface2 }]}>
          <Body>{error.message}</Body>
          {error.code === "whatnow_free_limit" && <Pill kind="dark" block label="See Pro" onPress={() => router.push({ pathname: "/plans", params: { from: "whatnow" } })} />}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  title: { fontFamily: fonts.displayBold, fontSize: 19, letterSpacing: -0.3 },
  card: { borderRadius: 22, padding: 18, gap: 14 },
  lead: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 22 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  chips: { flexDirection: "row", gap: 8 },
  chip: { borderRadius: 999, borderWidth: 1.5, paddingVertical: 8, paddingHorizontal: 16 },
  chipText: { fontFamily: fonts.bodySemi, fontSize: 14 },
  headline: { fontFamily: fonts.displayBold, fontSize: 18, lineHeight: 24, letterSpacing: -0.3 },
  option: { borderRadius: 20, padding: 16, gap: 8 },
  optionHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  optionTitle: { fontFamily: fonts.displayBold, fontSize: 16 },
  best: { borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  bestText: { fontFamily: fonts.bodySemi, fontSize: 12 },
  why: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  message: { borderRadius: 14, padding: 14, gap: 10, marginTop: 4 },
  messageText: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21 },
  copy: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start" },
  copyText: { fontFamily: fonts.bodySemi, fontSize: 14 },
  tag: { alignSelf: "flex-start", borderRadius: 999, paddingVertical: 4, paddingHorizontal: 10 },
  tagText: { fontFamily: fonts.bodySemi, fontSize: 12 },
});
