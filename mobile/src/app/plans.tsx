import { useState } from "react";
import { Linking, Platform, Pressable, Switch, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { Body, Pill, Screen, Section, Title } from "../components/ui";
import { useBilling } from "../lib/billing";
import { fonts, useTheme } from "../lib/theme";

// One Pro plan, monthly or yearly, with a 3-day free trial on yearly. Purchases go through
// RevenueCat (see src/lib/billing.native.tsx). Real prices come from the stores once RevenueCat
// is set up; until then the draft prices below are shown. The trial length is set on the yearly
// product in App Store Connect and Google Play Console.
const PRO = {
  monthly: 9.99,
  yearly: 34.99,
  trialDays: 3,
  // List only what ships. Add whole threads, follow-ups, and blurred sharing here when they're built.
  features: ["30 decodes a day", "Unlimited \u201cWhat now?\u201d next steps after any read", "Everything in Free"],
};
const FREE_FEATURES = ["2 decodes a day", "The full read: meaning, aim, evidence", "1 \u201cWhat now?\u201d a day", "History kept on your phone"];
const money = (n: number) => `$${Number.isInteger(n) ? n : n.toFixed(2)}`;
const SAVE = Math.round((1 - PRO.yearly / (PRO.monthly * 12)) * 100);

const FAQ = [
  ["How does the free trial work?", "The yearly plan starts with 3 days of Pro for free. Cancel before the trial ends and you won't be charged. Otherwise it renews yearly."],
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
  const [busy, setBusy] = useState(false);
  const { from } = useLocalSearchParams<{ from?: string }>();
  const billing = useBilling();
  const storePrices = billing.prices.monthly !== null && billing.prices.annual !== null;
  const monthlyPrice = billing.prices.monthly ?? money(PRO.monthly);
  const yearlyPrice = billing.prices.annual ?? money(PRO.yearly);

  const headline = from === "limit" ? "You've used today's free decodes" : from === "whatnow" ? "You've used today's free \u201cWhat now?\u201d" : "Read every post clearly";
  const lede =
    from === "limit"
      ? "Go Pro for 30 decodes a day, or come back tomorrow for 2 more free."
      : from === "whatnow"
        ? "Go Pro for unlimited next steps after any read, plus 30 decodes a day."
        : from === "first-read"
          ? "Liked that read? Go Pro for 30 decodes a day and unlimited next steps."
          : "Start free. Go Pro when you decode often or want help deciding what to do next.";

  const subscribe = async () => {
    if (selected === "free") return router.back();
    setBusy(true);
    setNote("");
    const r = await billing.buy(yearly ? "annual" : "monthly");
    setBusy(false);
    if (r.ok) return router.back();
    if (!r.cancelled && r.message) setNote(r.message);
  };

  const restore = async () => {
    setBusy(true);
    const r = await billing.restore();
    setBusy(false);
    setNote(r.message ?? "");
  };

  const manage = () =>
    Linking.openURL(Platform.OS === "ios" ? "https://apps.apple.com/account/subscriptions" : "https://play.google.com/store/account/subscriptions").catch(() =>
      setNote("Open your App Store or Google Play subscriptions to manage Pro."),
    );

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
            {pro && yearly && (
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
          <Text style={{ fontFamily: fonts.display, fontSize: 40, letterSpacing: -1.4, color: fg }}>
            {!pro ? "$0" : yearly ? (storePrices ? yearlyPrice : money(PRO.yearly / 12)) : monthlyPrice}
          </Text>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: fg, opacity: 0.85 }}>{!pro ? "forever" : yearly && storePrices ? "/ year" : "/ month"}</Text>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: fg, opacity: 0.85, marginTop: -8 }}>
          {!pro
            ? "No card needed."
            : yearly
              ? `${storePrices ? "Billed" : `${yearlyPrice} billed`} yearly after your free trial. Save about ${SAVE}% over monthly.`
              : "Billed monthly. Cancel any time."}
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
        {billing.isPro && (
          <View style={{ marginTop: 14, borderRadius: 16, backgroundColor: t.mist, padding: 16 }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 16, color: t.ink }}>You're on Pro</Text>
            <Body muted style={{ fontSize: 14 }}>30 decodes a day and unlimited next steps. Thanks for supporting Aimed.</Body>
          </View>
        )}
        <Text style={{ fontFamily: fonts.display, fontSize: 34, letterSpacing: -1.2, lineHeight: 38, color: t.ink, marginTop: 14 }}>{headline}</Text>
        <Body muted style={{ marginTop: 8 }}>
          {lede}
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

        {yearly && <View style={{ marginTop: 18, borderRadius: 18, backgroundColor: t.peach, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
          <View style={{ alignItems: "center" }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 28, color: t.ink, lineHeight: 30 }}>{PRO.trialDays}</Text>
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 10.5, letterSpacing: 0.8, color: t.ink }}>DAYS FREE</Text>
          </View>
          <Body style={{ flex: 1, fontSize: 14, lineHeight: 20 }}>The yearly plan starts with 3 days free. Cancel before it ends and you pay nothing.</Body>
        </View>}

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
          {billing.configured ? "Prices shown in your local currency." : "Draft pricing in USD."} Pro renews automatically through the App Store or Google Play until you cancel. The free trial applies to the yearly plan.
        </Body>
        <Pressable onPress={restore} disabled={busy} accessibilityRole="button" style={{ alignSelf: "center", marginTop: 10 }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: t.ink2, textDecorationLine: "underline" }}>Restore purchases</Text>
        </Pressable>
        <View style={{ height: 120 }} />
      </Screen>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 12, paddingBottom: insets.bottom + 12, paddingHorizontal: 20 }}>
        <View style={{ width: "100%", maxWidth: 480, alignSelf: "center", gap: 8 }}>
          {billing.isPro ? (
            <Pill kind="dark" block label="Manage subscription" onPress={manage} />
          ) : (
            <Pill
              kind="dark"
              block
              disabled={busy}
              label={busy ? "One moment" : selected === "free" ? "Continue with Free" : yearly ? `Start ${PRO.trialDays}-day free trial` : `Subscribe for ${monthlyPrice} a month`}
              onPress={subscribe}
            />
          )}
          <Text style={{ textAlign: "center", fontFamily: fonts.body, fontSize: 12.5, color: t.ink2 }}>
            {note ||
              (billing.isPro
                ? "Change or cancel Pro in your store subscriptions."
                : selected === "free"
                  ? "2 decodes a day, no card needed."
                  : yearly
                    ? `Free for ${PRO.trialDays} days, then ${yearlyPrice} a year. Cancel any time.`
                    : "Billed monthly. Cancel any time.")}
          </Text>
        </View>
      </View>
    </View>
  );
}
