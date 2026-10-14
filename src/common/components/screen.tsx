import { ScrollView, StyleSheet, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { space } from '@/common/theme/tokens';

/** Space kept free under scrolling content for the tab bar and mini player. */
export const TAB_BAR_SPACE = 190;

export function Screen({ children, contentContainerStyle, withTabBar = true, ...props }: ScrollViewProps & { withTabBar?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      {...props}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + space.lg, paddingBottom: (withTabBar ? TAB_BAR_SPACE : space.xxl) + insets.bottom },
        contentContainerStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({ content: { paddingHorizontal: space.lg, gap: space.xl } });
