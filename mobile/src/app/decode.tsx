import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, TextInput, View } from "react-native";
import { router } from "expo-router";
import { Body, Pill, Screen, Title } from "../components/ui";
import { DecodeError, decodeScreenshot, giveAiConsent, hasAiConsent, isLive } from "../lib/api";
import { EXAMPLE_RESULT } from "../lib/example";
import { newId, useStore } from "../lib/store";
import { fonts, useTheme } from "../lib/theme";
import type { Entry } from "../lib/types";

const CHIPS = ["We argued recently", "We stopped talking", "They're my ex", "We work together", "We're close friends"];

export default function Decode() {
  const t = useTheme();
  const { pending, addEntry } = useStore();
  const [context, setContext] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consented, setConsented] = useState<boolean | null>(null);
  const ctl = useRef<AbortController | null>(null);

  useEffect(() => {
    hasAiConsent().then(setConsented);
  }, []);

  useEffect(() => {
    if (!pending) router.replace("/");
  }, [pending]);
  useEffect(() => () => ctl.current?.abort(), []);
  if (!pending) return null;

  const finish = (entry: Entry) => {
    addEntry(entry);
    router.replace({ pathname: "/read/[id]", params: { id: entry.id } });
  };

  const run = async () => {
    const ctx = context.trim().slice(0, 280);
    setError(null);
    setBusy(true);
    const base = { id: newId(), when: new Date().toISOString(), thumb: pending.thumb, context: ctx };
    if (!isLive) {
      setTimeout(() => finish({ ...base, mode: "example", result: EXAMPLE_RESULT }), 1100);
      return;
    }
    ctl.current = new AbortController();
    try {
      const result = await decodeScreenshot(pending.base64, ctx, ctl.current.signal);
      finish({ ...base, mode: "live", result });
    } catch (e) {
      setBusy(false);
      const err = e as DecodeError;
      if (err.code !== "cancelled") setError(err.message);
      if (err.code === "free_limit") router.push({ pathname: "/plans", params: { from: "limit" } });
    }
  };

  const stop = () => {
    ctl.current?.abort();
    setBusy(false);
  };

  if (busy) {
    return (
      <Screen scroll={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 22 }}>
          <View style={{ width: 220, borderRadius: 18, overflow: "hidden", backgroundColor: t.mist }}>
            <Image source={{ uri: pending.uri }} style={{ width: 220, height: 300 }} resizeMode="cover" />
          </View>
          <ActivityIndicator color={t.brand} />
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: t.ink, letterSpacing: -0.4 }}>Reading between the lines</Text>
          <Body muted style={{ textAlign: "center", maxWidth: 260 }}>
            Looking at the words, the timing, and who it's for.
          </Body>
          <Pill kind="ghost" label="Stop" onPress={stop} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <Title small onBack={() => router.back()}>
        Add context
      </Title>
      <View style={{ backgroundColor: t.mist, borderRadius: 22, padding: 18, alignItems: "center", marginTop: 18 }}>
        <Image source={{ uri: pending.uri }} style={{ width: "70%", aspectRatio: 9 / 16, borderRadius: 14 }} resizeMode="contain" accessibilityLabel="Your screenshot" />
      </View>

      <View style={{ gap: 10, marginTop: 26 }}>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: 18, color: t.ink }}>
          What's going on? <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: t.ink2 }}>Optional</Text>
        </Text>
        <TextInput
          value={context}
          onChangeText={setContext}
          maxLength={280}
          placeholder="e.g. we stopped talking last week"
          placeholderTextColor={t.ink2}
          returnKeyType="go"
          onSubmitEditing={run}
          style={{ backgroundColor: t.surface2, borderRadius: 14, paddingVertical: 15, paddingHorizontal: 16, fontSize: 16, fontFamily: fonts.body, color: t.ink }}
        />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          {CHIPS.map((c) => {
            const on = context.trim().toLowerCase() === c.toLowerCase();
            return (
              <Pressable
                key={c}
                onPress={() => setContext(on ? "" : c)}
                accessibilityRole="button"
                accessibilityState={{ selected: on }}
                style={{ borderRadius: 999, paddingVertical: 8, paddingHorizontal: 14, backgroundColor: on ? t.pill : t.surface, borderWidth: on ? 0 : 1.5, borderColor: t.line }}
              >
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: on ? t.pillInk : t.ink }}>{c}</Text>
              </Pressable>
            );
          })}
        </View>
        <Body muted style={{ fontSize: 13.5 }}>
          Timing against your context is the strongest signal there is.
        </Body>
      </View>

      {error && <Body style={{ color: t.likely, marginTop: 14 }}>{error}</Body>}
      {consented === false && isLive ? (
        <View style={{ marginTop: 26, backgroundColor: t.mist, borderRadius: 20, padding: 20, gap: 14 }}>
          <Text style={{ fontFamily: fonts.displayBold, fontSize: 17, color: t.ink }}>Before your first decode</Text>
          <Body>
            To write the read, Subtext sends this screenshot and your context to Claude, an AI made by Anthropic. It's used for this one read and isn't stored afterward.
          </Body>
          <Pill
            kind="dark"
            block
            label="Allow and decode"
            onPress={async () => {
              await giveAiConsent();
              setConsented(true);
              run();
            }}
          />
          <Pill kind="ghost" block label="Not now" onPress={() => router.back()} />
        </View>
      ) : (
        <View style={{ marginTop: 26 }}>
          <Pill kind="dark" block label="Decode" onPress={run} disabled={consented === null && isLive} />
        </View>
      )}
    </Screen>
  );
}
