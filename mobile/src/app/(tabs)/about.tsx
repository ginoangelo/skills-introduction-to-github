import { useState } from "react";
import { Text, View } from "react-native";
import { router } from "expo-router";
import { Icon, type IconName } from "../../components/Icon";
import { Body, BrandBar, Pill, Screen, Section, Title } from "../../components/ui";
import { isLive } from "../../lib/api";
import { useStore } from "../../lib/store";
import { fonts, useTheme } from "../../lib/theme";

function Principle({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  const t = useTheme();
  return (
    <View style={{ flexDirection: "row", gap: 12, alignItems: "flex-start" }}>
      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: t.mist, alignItems: "center", justifyContent: "center" }}>
        <Icon name={icon} color={t.brand} size={18} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: fonts.displayBold, fontSize: 15.5, color: t.ink }}>{title}</Text>
        <Body muted style={{ fontSize: 14, lineHeight: 20 }}>
          {text}
        </Body>
      </View>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return <View style={{ borderRadius: 20, borderWidth: 1, borderColor: t.line, padding: 18, gap: 14 }}>{children}</View>;
}

export default function About() {
  const { recent, clearHistory } = useStore();
  const [confirm, setConfirm] = useState(false);
  const [cleared, setCleared] = useState(false);

  const onClear = () => {
    if (!recent.length) return;
    if (!confirm) return setConfirm(true);
    clearHistory();
    setConfirm(false);
    setCleared(true);
  };

  return (
    <Screen>
      <BrandBar />
      <Title>About</Title>
      <Body muted>Read between the lines. Subtext decodes a screenshot of a post into a plain read with its evidence.</Body>

      <Section title="Decodes on this phone">
        <Card>
          {isLive ? (
            <Principle icon="check" title="Live" text="Each decode sends your screenshot to Subtext once for the read. Nothing is kept after." />
          ) : (
            <Principle icon="info" title="Example mode" text="This build isn't connected to the decode service yet, so reads show an example." />
          )}
        </Card>
      </Section>

      <Section title="Our principles">
        <Card>
          <Principle icon="check" title="Evidence or nothing" text="Every claim points at something in the screenshot or your context." />
          <Principle icon="check" title="Calibrated by default" text={'Without your context, "aimed at you" tops out at Possibly. "Not enough to tell" is a real answer.'} />
          <Principle icon="check" title="Posts, not people" text="No labels on the poster, and no guesses about identity, health, or beliefs." />
          <Principle icon="check" title="Some screenshots stay unread" text="Posts about minors, sexual content, or private medical details get no read." />
        </Card>
      </Section>

      <Section title="Privacy">
        <Card>
          <Principle icon="lock" title="Nothing stored on a server" text="Your screenshot goes to the AI once for the read and is not kept." />
          <Principle icon="clock" title="History stays on this phone" text="Recent decodes live on this device. Clear them any time." />
          <Pill kind="danger" label={!recent.length ? (cleared ? "History cleared" : "History is empty") : confirm ? "Tap again to clear all" : "Clear history"} onPress={onClear} />
        </Card>
      </Section>

      <Section title="Plans">
        <Pill kind="dark" label="See plans and pricing" onPress={() => router.push("/plans")} />
      </Section>
    </Screen>
  );
}
