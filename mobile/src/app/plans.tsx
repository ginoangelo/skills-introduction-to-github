import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { Body, Pill, Screen, Section, Title } from "../components/ui";
import { fonts, useTheme } from "../lib/theme";

// Draft pricing: one Pro plan with a 3-day free trial. Purchases connect to App Store and
// Google Play billing (through RevenueCat) before launch. The trial length itself is set on
// the subscription products in App Store Connect and Google Play Console.
const PRO = {
  monthly: 10,
  yearly: 30,
  trialDays: 3,
  features: ["30 decodes a day", "Decode whole comment threads, up to 10 screenshots", "Ask a follow-up about any read", "Share a read with names and faces blurred", "Copy and export clean summaries", "Faster decodes at busy times"],
};
const FREE_FEATURES = ["3 decodes a day", "The full read: meaning, aim, evidence", "History kept on your phone"];
const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
const SAVE = Math.round((1 - PRO.yearly / (PRO.monthly * 12)) * 100);

const FAQ = [
  ["How does the free trial work?", "You get Pro free for 3 days. Cancel before the trial ends and you won't be charged. Otherwise it renews at the plan you picked."],
  ["Why is there a daily limit on Pro?", "Each decode runs a full AI read. A daily limit keeps reads fast and the price low. Most people never reach it."],
  ["Can I cancel any time?", "Yes. Cancel in your App Store or Google Play subscriptions. You keep Pro until the period you paid for ends."],
  ["What happens to my history if I cancel?", "Nothing. Your decodes live on your phone, so they stay right where they are."],
];

export default function Plans() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [yearly, setYearly] = useState(true);
  const [selected, setSelected] = useState<"pro" | "free">("pro");
  const [open, setOpen] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const card = (k: "pro" | "free") => {
    const pro = k === "pro";
    const fg = pro ? t.onColor : t.ink;
    const on = selected === k;
    const features = pro ? PRO.features : FREE_FEATURES;
    return (
      <Pressable
        key={k}
        onPress={() => setSelected(k)}
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        style={{ borderRadius: 22, padding: 22, gap: 14, backgroundColor: pro ? t.brand : t.surface, borderWidth: on ? 3 : pro ? 0 : 1.5, borderColor: on ? t.ink : t.line }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: fg }}>{pro ? "Pro" : "Free"}</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            {pro && (
              <View style={{ backgroundColor: t.tagBg, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.6, color: t.onColorInk }}>{`${PRO.trialDays} DAYS FREE`}</Text>
              </View>
            )}
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: fg, opacity: on ? 1 : 0.55, alignItems: "center", justifyContent: "center" }}>
              {on && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: fg }} />}
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: fg, opacity: 0.85, marginTop: -8 }}>
          {pro ? "For anyone who reads a lot of posts, from the group chat to the comment section" : "Try it on the posts that matter"}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 40, letterSpacing: -1.4, color: fg }}>{!pro ? "$0" : yearly ? money(PRO.yearly / 12) : money(PRO.monthly)}</Text>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: fg, opacity: 0.85 }}>{pro ? "/ month" : "forever"}</Text>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: fg, opacity: 0.85, marginTop: -8 }}>
          {!pro ? "No card needed." : yearly ? `${money(PRO.yearly)} billed yearly after your free trial. Save ${SAVE}% over monthly.` : "Billed monthly after your free trial. Cancel any time."}
        </Text>
        <View style={{ gap: 9 }}>
          {features.map((f) => (
            <View key={f} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Icon name="check" color={pro ? fg : t.brand} size={20} />
              <Text style={{ flex: 1, fontFamily: fonts.body, fontSize: 15, lineHeight: 21, color: fg }}>{f}</Text>
            </View>
          ))}
        </View>
      </Pressable>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <Screen>
        <Title small onBack={() => router.back()}>
          Plans
        </Title>
        <Text style={{ fontFamily: fonts.display, fontSize: 34, letterSpacing: -1.2, lineHeight: 38, color: t.ink, marginTop: 14 }}>Read every post clearly</Text>
        <Body muted style={{ marginTop: 8 }}>
          Start free. Go Pro when you decode often, need whole threads, or want to share a read.
        </Body>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 22 }}>
          <Text style={{ fontFamily: fonts.bodySemi, color: yearly ? t.ink2 : t.ink }}>Monthly</Text>
          <Switch value={yearly} onValueChange={setYearly} trackColor={{ true: t.brand, false: t.line }} thumbColor="#ffffff" {...({ activeThumbColor: "#ffffff" } as object)} accessibilityLabel="Bill yearly" />
          <Text style={{ fontFamily: fonts.bodySemi, color: yearly ? t.ink : t.ink2 }}>Yearly</Text>
          {yearly && (
            <View style={{ backgroundColor: t.unlikely + "24", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: t.unlikely }}>Save {SAVE}%</Text>
            </View>
          )}
        </View>

        <View style={{ gap: 14, marginTop: 22 }}>
          {card("pro")}
          {card("free")}
        </View>

        <View style={{ marginTop: 18, borderRadius: 18, backgroundColor: t.peach, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: t.ink, lineHeight: 30 }}>{PRO.trialDays}</Text>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 10.5, letterSpacing: 0.8, color: t.ink }}>DAYS FREE</Text>
          </View>
          <Body style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>Try every Pro feature free for 3 days. Cancel before it ends and you pay nothing.</Body>
        </View>

        <Section title="Questions">
          {FAQ.map(([q, a], i) => (
            <Pressable key={q} onPress={() => setOpen(open === i ? null : i)} accessibilityRole="button" accessibilityState={{ expanded: open === i }} style={{ backgroundColor: t.surface2, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 15, gap: 8 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", gap: 12 }}>
                <Text style={{ flex: 1, fontFamily: fonts.displayBold, fontSize: 15.5, color: t.ink }}>{q}</Text>
                <Text style={{ fontSize: 20, color: t.ink2 }}>{open === i ? "−" : "+"}</Text>
              </View>
              {open === i && <Body muted style={{ fontSize: 14.5 }}>{a}</Body>}
            </Pressable>
          ))}
        </Section>

        <Body muted style={{ textAlign: "center", fontSize: 12.5, marginTop: 24 }}>
          Draft pricing in USD. After the free trial, Pro renews automatically through the App Store or Google Play until you cancel.
        </Body>
        <Pressable onPress={() => setNote("Restore purchases connects with store billing before launch.")} accessibilityRole="button" style={{ alignSelf: "center", marginTop: 10 }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: t.ink2, textDecorationLine: "underline" }}>Restore purchases</Text>
        </Pressable>
        <View style={{ height: 120 }} />
      </Screen>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 12, paddingBottom: insets.bottom + 12, paddingHorizontal: 20 }}>
        <View style={{ width: "100%", maxWidth: 480, alignSelf: "center", gap: 8 }}>
          <Pill
            kind="dark"
            block
            label={selected === "free" ? "Continue with Free" : `Start ${PRO.trialDays}-day free trial`}
            onPress={() => (selected === "free" ? router.back() : setNote("Checkout connects with App Store and Google Play billing before launch."))}
          />
          <Text style={{ textAlign: "center", fontFamily: fonts.body, fontSize: 12.5, color: t.ink2 }}>
            {note || (selected === "free" ? "3 decodes a day, no card needed." : `Free for ${PRO.trialDays} days, then ${yearly ? money(PRO.yearly) + " a year" : money(PRO.monthly) + " a month"}. Cancel any time.`)}
          </Text>
        </View>
      </View>
    </View>
  );
}
