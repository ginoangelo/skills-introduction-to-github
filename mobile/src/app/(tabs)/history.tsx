import { useMemo, useState } from "react";
import { TextInput, View } from "react-native";
import { Icon } from "../../components/Icon";
import { Body, BrandBar, Empty, EntryRow, RoundButton, Screen, Title } from "../../components/ui";
import { useStore } from "../../lib/store";
import { fonts, useTheme } from "../../lib/theme";

export default function History() {
  const t = useTheme();
  const { recent, removeEntry } = useStore();
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return recent;
    return recent.filter((e) => [e.result.meaning, e.result.literal, e.result.platform, e.context, e.result.aimed_at_you.verdict].join(" ").toLowerCase().includes(s));
  }, [recent, q]);

  return (
    <Screen>
      <BrandBar />
      <Title
        right={
          <RoundButton
            icon={searching ? "close" : "search"}
            label={searching ? "Close search" : "Search decodes"}
            onPress={() => {
              setSearching(!searching);
              setQ("");
            }}
          />
        }
      >
        History
      </Title>
      <Body muted>Every decode you've made, kept on this phone only.</Body>
      {searching && (
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: t.surface2, borderRadius: 14, paddingHorizontal: 14, marginTop: 18 }}>
          <Icon name="search" color={t.ink2} size={18} />
          <TextInput
            autoFocus
            value={q}
            onChangeText={setQ}
            placeholder="Search meaning or context"
            placeholderTextColor={t.ink2}
            style={{ flex: 1, paddingVertical: 14, fontSize: 16, fontFamily: fonts.body, color: t.ink }}
          />
        </View>
      )}
      <View style={{ gap: 10, marginTop: 20 }}>
        {recent.length === 0 ? (
          <Empty title="Nothing here yet" text="Decode a screenshot and it will be listed here." />
        ) : list.length === 0 ? (
          <Empty title="No matches" text="Try a different word." />
        ) : (
          list.map((e) => <EntryRow key={e.id} entry={e} onDelete={() => removeEntry(e.id)} />)
        )}
      </View>
    </Screen>
  );
}
