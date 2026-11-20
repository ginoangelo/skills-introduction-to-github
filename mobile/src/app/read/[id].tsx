import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pressable, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import * as Clipboard from "expo-clipboard";
import { ResultView } from "../../components/ResultView";
import { Body, Empty, Pill, RoundButton, Screen, Title } from "../../components/ui";
import { pickAndStart } from "../../lib/pick";
import { flagRead, type FlagReason } from "../../lib/api";
import { useBilling } from "../../lib/billing";
import { fonts, useTheme } from "../../lib/theme";
import { useStore } from "../../lib/store";

export default function Read() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getEntry, setPending } = useStore();
  const entry = id ? getEntry(id) : undefined;
  const [copied, setCopied] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagNote, setFlagNote] = useState("");
  const t = useTheme();

  const sendFlag = async (reason: FlagReason) => {
    if (!entry) return;
    try {
      await flagRead(reason, entry.result.refused ? "Not read" : entry.result.aimed_at_you.verdict);
      setFlagNote("Thanks. Reports like this help make reads fairer.");
      setFlagOpen(false);
    } catch (e) {
      setFlagNote((e as Error).message);
    }
  };

  const { isPro } = useBilling();

  // After someone's first real read, show the plans once, so they've seen the value first.
  const FIRST_READ_KEY = "subtext.paywall.first-read.v1";
  const done = async () => {
    if (entry?.mode === "live" && !isPro) {
      const seen = await AsyncStorage.getItem(FIRST_READ_KEY).catch(() => "1");
      if (!seen) {
        AsyncStorage.setItem(FIRST_READ_KEY, "1").catch(() => {});
        router.replace({ pathname: "/plans", params: { from: "first-read" } });
        return;
      }
    }
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const copy = async () => {
    if (!entry || entry.result.refused) return;
    const r = entry.result;
    const text = [
      "Subtext read",
      `Aimed at you? ${r.aimed_at_you.verdict}. ${r.aimed_at_you.reason}`,
      "",
      `What it means: ${r.meaning}`,
      "",
      "Evidence:",
      ...r.evidence.map((e) => `- ${e.cue}: ${e.why}`),
    ].join("\n");
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Screen>
      <Title small onBack={done} right={entry && !entry.result.refused ? <RoundButton small icon={copied ? "check" : "copy"} label={copied ? "Copied" : "Copy summary"} onPress={copy} /> : undefined}>
        Your read
      </Title>
      {entry ? <ResultView entry={entry} /> : <Empty title="This read isn't available" text="It may have been deleted from your history." />}
      <View style={{ flexDirection: "row", gap: 10, marginTop: 24 }}>
        <View style={{ flex: 1 }}>
          <Pill kind="ghost" block label="Done" onPress={done} />
        </View>
        <View style={{ flex: 1 }}>
          <Pill kind="dark" block label="Decode another" onPress={() => pickAndStart(setPending)} />
        </View>
      </View>
      <Body muted style={{ textAlign: "center", fontSize: 13, marginTop: 22 }}>
        An interpretation with evidence, not a fact.
      </Body>
      {entry && entry.mode === "live" && (
        <View style={{ alignItems: "center", marginTop: 10, gap: 10 }}>
          {!flagOpen && !flagNote && (
            <Pressable onPress={() => setFlagOpen(true)} accessibilityRole="button" hitSlop={8}>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: t.ink2, textDecorationLine: "underline" }}>Flag this read</Text>
            </Pressable>
          )}
          {flagOpen && (
            <View style={{ alignSelf: "stretch", backgroundColor: t.surface2, borderRadius: 18, padding: 16, gap: 12 }}>
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 15.5, color: t.ink }}>What's wrong with this read?</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                {([["wrong", "It's wrong"], ["biased", "It feels biased"], ["offensive", "It's offensive"], ["other", "Something else"]] as [FlagReason, string][]).map(([r, label]) => (
                  <Pressable key={r} onPress={() => sendFlag(r)} accessibilityRole="button" style={{ borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: t.surface, borderWidth: 1.5, borderColor: t.line }}>
                    <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: t.ink }}>{label}</Text>
                  </Pressable>
                ))}
              </View>
              <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: t.ink2 }}>Only the reason is sent. Your screenshot and the read stay on your phone.</Text>
            </View>
          )}
          {flagNote ? <Body muted style={{ fontSize: 13, textAlign: "center" }}>{flagNote}</Body> : null}
        </View>
      )}
    </Screen>
  );
}
