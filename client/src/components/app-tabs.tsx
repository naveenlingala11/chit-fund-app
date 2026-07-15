import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useColorScheme } from 'react-native';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme || 'light'];
  const TabTrigger = NativeTabs.Trigger as any;

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}>
      <TabTrigger name="index">
        <TabTrigger.Label>Home</TabTrigger.Label>
        <TabTrigger.Icon
          src={require('@/assets/images/tabIcons/home.png')}
          renderingMode="template"
        />
      </TabTrigger>

      <TabTrigger name="explore">
        <TabTrigger.Label>Explore</TabTrigger.Label>
        <TabTrigger.Icon
          src={require('@/assets/images/tabIcons/explore.png')}
          renderingMode="template"
        />
      </TabTrigger>
    </NativeTabs>
  );
}
