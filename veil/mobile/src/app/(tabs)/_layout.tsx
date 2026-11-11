import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';

import { Icon, type IconName } from '@/components/icon';
import { C } from '@/constants/theme';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={22} color={color} />,
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.faint,
        tabBarStyle: { backgroundColor: '#080B0F', borderTopColor: C.divider },
        sceneStyle: { backgroundColor: C.bg },
      }}>
      <Tabs.Screen name="score" options={tab('Score', 'shield')} />
      <Tabs.Screen name="fixes" options={tab('Fixes', 'list')} />
      <Tabs.Screen name="modes" options={tab('Modes', 'waves')} />
      <Tabs.Screen name="exposure" options={tab('Breaches', 'mail')} />
    </Tabs>
  );
}
