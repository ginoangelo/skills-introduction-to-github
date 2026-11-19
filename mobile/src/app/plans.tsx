import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "../components/Icon";
import { Body, Pill, Screen, Section, Title } from "../components/ui";
import { fonts, useTheme } from "../lib/theme";

// Draft pricing. Purchases connect to App Store and Google Play billing (through RevenueCat) before launch.
type PlanKey = "free" | "student" | "pro";
const PLANS: Record<PlanKey, { name: string; forWho: string; monthly: number; yearly: number; tag?: string; features: string[] }> = {
  free: { name: "Free", forWho: "Try it on the posts that matter", monthly: 0, yearly: 0, features: ["3 decodes a day", "The full read: meaning, aim, evidence", "History kept on your phone"] },
  student: { name: "Student", forWho: "For college and grad students", monthly: 3.99, yearly: 29.99, tag: "Best for students", features: ["15 decodes a day", "Ask a follow-up about any read", "Share a read with names and faces blurred", "Verify with your school email"] },
  pro: {
    name: "Pro",
    forWho: "For creators, social media managers, and anyone who reads tone for a living",
    monthly: 9.99,
    yearly: 79.99,
    tag: "Most popular",
    features: ["50 decodes a day", "Decode whole comment threads, up to 10 screenshots", "Ask a follow-up about any read", "Share a read with names and faces blurred", "Copy and export clean summaries", "Faster decodes at busy times"],
  },
};
const money = (n: number) => `$${n.toFixed(2)}`;
const save = (k: PlanKey) => Math.round((1 - PLANS[k].yearly / (PLANS[k].monthly * 12)) * 100);

const FAQ = [
  ["How does student pricing work?", "Verify once a year with your school email. If you graduate, you keep Student until your next renewal."],
  ["Why is there a daily limit on paid plans?", "Each decode runs a full AI read. A daily limit keeps reads fast and prices low. Most people never reach it."],
  ["Can I cancel any time?", "Yes. Cancel in your App Store or Google Play subscriptions. You keep your plan until the period you paid for ends."],
  ["What happens to my history if I cancel?", "Nothing. Your decodes live on your phone, so they stay right where they are."],
];

export default function Plans() {
  const t = useTheme();
  const insets = useSafeAreaInsets();
  const [audience, setAudience] = useState<"pro" | "student">("pro");
  const [yearly, setYearly] = useState(true);
  const [selected, setSelected] = useState<PlanKey>("pro");
  const [open, setOpen] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const paid: PlanKey = audience;
  const sel = selected === "free" ? "free" : paid;

  const card = (k: PlanKey) => {
    const p = PLANS[k];
    const colored = k !== "free";
    const fg = colored ? t.onColor : t.ink;
    const on = sel === k;
    return (
      <Pressable
        key={k}
        onPress={() => setSelected(k)}
        accessibilityRole="radio"
        accessibilityState={{ checked: on }}
        style={{ borderRadius: 22, padding: 22, gap: 14, backgroundColor: k === "pro" ? t.brand : k === "student" ? t.plum : t.surface, borderWidth: on ? 3 : colored ? 0 : 1.5, borderColor: on ? t.ink : t.line }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: fg }}>{p.name}</Text>
          <View style={{ flexDirection: "row", gap: 10, alignItems: "center" }}>
            {p.tag && (
              <View style={{ backgroundColor: t.onColor, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, letterSpacing: 0.6, color: t.onColorInk }}>{p.tag.toUpperCase()}</Text>
              </View>
            )}
            <View style={{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: fg, opacity: on ? 1 : 0.55, alignItems: "center", justifyContent: "center" }}>
              {on && <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: fg }} />}
            </View>
          </View>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 14, color: fg, opacity: 0.85, marginTop: -8 }}>{p.forWho}</Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6 }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 40, letterSpacing: -1.4, color: fg }}>{!p.monthly ? "$0" : yearly ? money(p.yearly / 12) : money(p.monthly)}</Text>
          <Text style={{ fontFamily: fonts.bodyMedium, fontSize: 15, color: fg, opacity: 0.85 }}>{p.monthly ? "/ month" : "forever"}</Text>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 13.5, color: fg, opacity: 0.85, marginTop: -8 }}>
          {!p.monthly ? "No card needed." : yearly ? `${money(p.yearly)} billed yearly. Save ${save(k)}% over monthly.` : "Billed monthly. Cancel any time."}
        </Text>
        <View style={{ gap: 9 }}>
          {p.features.map((f) => (
            <View key={f} style={{ flexDirection: "row", gap: 10, alignItems: "flex-start" }}>
              <Icon name="check" color={colored ? fg : t.brand} size={20} />
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
          Start free. Upgrade when you decode often, need whole threads, or want to share a read.
        </Body>

        <View style={{ flexDirection: "row", backgroundColor: t.surface2, borderRadius: 999, padding: 4, gap: 4, marginTop: 22 }}>
          {(["pro", "student"] as const).map((a) => (
            <Pressable
              key={a}
              onPress={() => {
                setAudience(a);
                if (selected !== "free") setSelected(a);
              }}
              accessibilityRole="button"
              accessibilityState={{ selected: audience === a }}
              style={{ flex: 1, borderRadius: 999, paddingVertical: 11, alignItems: "center", backgroundColor: audience === a ? t.surface : "transparent" }}
            >
              <Text style={{ fontFamily: fonts.displayBold, fontSize: 15, color: audience === a ? t.ink : t.ink2 }}>{a === "pro" ? "Professionals" : "Students"}</Text>
            </Pressable>
          ))}
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 18 }}>
          <Text style={{ fontFamily: fonts.bodySemi, color: yearly ? t.ink2 : t.ink }}>Monthly</Text>
          <Switch value={yearly} onValueChange={setYearly} trackColor={{ true: t.brand, false: t.line }} thumbColor="#ffffff" accessibilityLabel="Bill yearly" />
          <Text style={{ fontFamily: fonts.bodySemi, color: yearly ? t.ink : t.ink2 }}>Yearly</Text>
          {yearly && (
            <View style={{ backgroundColor: t.unlikely + "24", borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 }}>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: t.unlikely }}>Save {save(paid)}%</Text>
            </View>
          )}
        </View>

        <View style={{ gap: 14, marginTop: 22 }}>
          {card(paid)}
          {card("free")}
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
          Draft pricing in USD. Subscriptions renew automatically through the App Store or Google Play until you cancel.
        </Body>
        <Pressable onPress={() => setNote("Restore purchases connects with store billing before launch.")} accessibilityRole="button" style={{ alignSelf: "center", marginTop: 10 }}>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 13, color: t.ink2, textDecorationLine: "underline" }}>Restore purchases</Text>
        </Pressable>
        <View style={{ height: 120 }} />
      </Screen>

      <View style={{ position: "absolute", left: 0, right: 0, bottom: 0, backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 12, paddingBottom: insets.bottom + 12, paddingHorizontal: 20 }}>
        <View style={{ width: "100%", maxWidth: 480, alignSelf: "center", gap: 8 }}>
          <Pill kind="dark" block label={sel === "free" ? "Continue with Free" : "Start 7-day free trial"} onPress={() => (sel === "free" ? router.back() : setNote("Checkout connects with App Store and Google Play billing before launch."))} />
          <Text style={{ textAlign: "center", fontFamily: fonts.body, fontSize: 12.5, color: t.ink2 }}>
            {note || (sel === "free" ? "3 decodes a day, no card needed." : `Then ${yearly ? money(PLANS[sel].yearly) + " a year" : money(PLANS[sel].monthly) + " a month"}. Cancel any time.`)}
          </Text>
        </View>
      </View>
    </View>
  );
}
