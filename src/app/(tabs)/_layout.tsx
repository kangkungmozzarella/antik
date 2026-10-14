import { Tabs } from 'expo-router';

import { TabBar } from '@/components/tab-bar';
import { color } from '@/theme/tokens';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <TabBar {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: color.bg } }}>
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="library" options={{ title: 'Library' }} />
      <Tabs.Screen name="connect" options={{ title: 'Connect' }} />
    </Tabs>
  );
}
