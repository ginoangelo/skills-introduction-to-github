import type { ComponentProps } from "react";
import { Pressable, Text, View } from "react-native";
import { Tabs } from "expo-router";
import { Icon, type IconName } from "../../components/Icon";
import { useStore } from "../../lib/store";
import { pickAndStart } from "../../lib/pick";
import { fonts, useTheme } from "../../lib/theme";

type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>["tabBar"]>>[0];

const TABS: Record<string, { label: string; icon: IconName }> = {
  index: { label: "Home", icon: "home" },
  new: { label: "Decode", icon: "plusCircle" },
  history: { label: "History", icon: "clock" },
  about: { label: "About", icon: "info" },
};

// Docked to the very bottom, full width, same on iPhone, Android, and web.
function TabBar({ state, navigateToTab, insets }: TabBarProps) {
  const t = useTheme();
  const { setPending } = useStore();
  return (
    <View style={{ backgroundColor: t.surface, borderTopWidth: 1, borderTopColor: t.line, paddingTop: 6, paddingBottom: Math.max(insets.bottom, 6) + 2, paddingHorizontal: 12 }}>
      <View style={{ flexDirection: "row", gap: 4, width: "100%", maxWidth: 480, alignSelf: "center" }}>
        {state.routes.map((route, i) => {
          const tab = TABS[route.name];
          if (!tab) return null;
          const active = state.index === i;
          const color = active ? t.ink : t.ink2;
          const onPress = () => {
            if (route.name === "new") {
              pickAndStart(setPending);
              return;
            }
            if (!active) navigateToTab(route.key);
          };
          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={tab.label}
              style={({ pressed }) => ({ flex: 1, alignItems: "center", gap: 3, paddingTop: 8, paddingBottom: 7, borderRadius: 22, backgroundColor: active ? t.surface2 : "transparent", opacity: pressed ? 0.7 : 1 })}
            >
              <Icon name={tab.icon} color={color} size={24} />
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11.5, color }}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const t = useTheme();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: t.bg } }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="new" options={{ title: "Decode" }} />
      <Tabs.Screen name="history" options={{ title: "History" }} />
      <Tabs.Screen name="about" options={{ title: "About" }} />
    </Tabs>
  );
}
