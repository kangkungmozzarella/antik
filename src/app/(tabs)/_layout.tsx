import { Tabs } from 'expo-router';

import { TabBar } from '@/common/components/tab-bar';
import { useTheme } from '@/common/theme/theme';

export default function TabsLayout() {
  const theme = useTheme();
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: theme.color.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="search" options={{ title: 'Search' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="connect" options={{ title: 'Connect' }} />
    </Tabs>
  );
}
