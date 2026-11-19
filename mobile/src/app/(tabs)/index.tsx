import { useState } from "react";
import { Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import { Art, Icon } from "../../components/Icon";
import { BrandBar, Empty, EntryRow, Pill, PromoCard, RoundButton, Screen, Section, Title, Body } from "../../components/ui";
import { pickAndStart } from "../../lib/pick";
import { newId, useStore } from "../../lib/store";
import { EXAMPLE_RESULT } from "../../lib/example";
import { fonts, useTheme } from "../../lib/theme";
import { Asset } from "expo-asset";

export default function Home() {
  const t = useTheme();
  const { recent, setPending, removeEntry, addEntry } = useStore();
  const [error, setError] = useState<string | null>(null);

  const choose = async () => setError(await pickAndStart(setPending));

  const showExample = async () => {
    const asset = Asset.fromModule(require("../../../assets/example-story.png"));
    await asset.downloadAsync().catch(() => {});
    const entry = { id: newId(), when: new Date().toISOString(), thumb: asset.localUri ?? asset.uri, context: "", mode: "example" as const, result: EXAMPLE_RESULT };
    addEntry(entry);
    router.push({ pathname: "/read/[id]", params: { id: entry.id } });
  };

  return (
    <Screen>
      <BrandBar />
      <Title right={<RoundButton icon="plus" label="Decode a screenshot" onPress={choose} />}>For you</Title>

      <Section title="Is this post about you?">
        <PromoCard
          tone="brand"
          text="Share a screenshot of a post, story, or reply. Get what it means, whether it's aimed at you, and the evidence."
          action={<Pill kind="light" label="Choose a screenshot" onPress={choose} />}
          hint="Or share one to Subtext from any app."
          art={<Art name="hero" color={t.onColor} accent={t.brand} />}
        />
        {error && <Body style={{ color: t.likely }}>{error}</Body>}
        <PromoCard
          tone="mist"
          text="Not sure what a read looks like? Try one on an example story."
          action={<Pill kind="dark" label="See an example" onPress={showExample} />}
          art={<Art name="bubble" color={t.ink} accent={t.brand} />}
        />
      </Section>

      <Section
        title="Recent decodes"
        right={
          recent.length > 3 ? (
            <Pressable onPress={() => router.push("/history")} accessibilityRole="button" hitSlop={8}>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 14, color: t.brand }}>See all</Text>
            </Pressable>
          ) : undefined
        }
      >
        {recent.length === 0 ? (
          <Empty title="No decodes yet" text="Your reads show up here, kept on this phone only." />
        ) : (
          <View style={{ gap: 10 }}>
            {recent.slice(0, 3).map((e) => (
              <EntryRow key={e.id} entry={e} onDelete={() => removeEntry(e.id)} />
            ))}
          </View>
        )}
      </Section>

      <Section title="Go further">
        <Pressable onPress={() => router.push("/plans")} accessibilityRole="button" style={({ pressed }) => [{ flexDirection: "row", alignItems: "center", gap: 14, padding: 18, borderRadius: 20, borderWidth: 1, borderColor: t.line, opacity: pressed ? 0.8 : 1 }]}>
          <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: t.mist, alignItems: "center", justifyContent: "center" }}>
            <Icon name="tag" color={t.brand} size={20} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: fonts.displayBold, fontSize: 16, color: t.ink }}>Plans for students and pros</Text>
            <Body muted style={{ fontSize: 14 }}>More decodes, whole threads, and sharing.</Body>
          </View>
        </Pressable>
      </Section>

      <Section title="How Subtext reads">
        <PromoCard
          tone="plum"
          text="Subtext reads posts, not people. Every read cites its evidence and shows other ways to take it."
          action={<Pill kind="light" label="Our principles" onPress={() => router.push("/about")} />}
          art={<Art name="quote" color={t.onColor} accent={t.plum} />}
        />
      </Section>
      <Body muted style={{ textAlign: "center", fontSize: 12.5, marginTop: 30 }}>
        Nothing about the post is stored on a server.
      </Body>
    </Screen>
  );
}
