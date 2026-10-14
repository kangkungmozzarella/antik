import { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton } from '@/common/components/back-button';
import { Icon } from '@/common/components/icon';
import { Screen } from '@/common/components/screen';
import { Body, Muted, Title } from '@/common/components/text';
import { useStore } from '@/common/store/store';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { space } from '@/common/theme/tokens';
import { timeAgo } from '@/utils/format';

export default function Notifications() {
  const styles = useStyles();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { state, dispatch } = useStore();
  const { notifications } = state;

  // Seeing the list counts as reading it; the badge on Home clears.
  useEffect(() => {
    dispatch({ type: 'readNotifications' });
  }, [dispatch, notifications.length]);

  return (
    <View style={styles.fill}>
      <Screen withTabBar={false}>
        <View style={styles.head}>
          <Title>Notifications</Title>
          <Muted>Things that happened while you listened, kept on this device.</Muted>
        </View>

        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Icon name="bell" size={32} tint={theme.color.textMuted} />
            <Muted style={styles.center}>Nothing yet. If a song cannot be played, you will find out why here.</Muted>
          </View>
        ) : (
          <View style={styles.list}>
            {notifications.map((notice) => (
              <View key={notice.id} style={styles.item}>
                <View style={styles.mark}>
                  <Icon name={notice.kind === 'playback' ? 'alert' : 'link'} size={18} tint={theme.color.accentSoft} />
                </View>
                <View style={styles.text}>
                  <Body style={styles.title}>{notice.title}</Body>
                  <Muted>{notice.body}</Muted>
                  <Text style={styles.time}>{timeAgo(notice.at)}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </Screen>
      <BackButton />
      {notifications.length > 0 && (
        <Pressable
          onPress={() => dispatch({ type: 'clearNotifications' })}
          accessibilityRole="button"
          hitSlop={8}
          style={[styles.clear, { top: insets.top + space.sm }]}>
          <Text style={styles.clearText}>Clear all</Text>
        </Pressable>
      )}
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.color.bg },
  head: { gap: space.sm, marginTop: 56 },
  empty: { alignItems: 'center', gap: space.md, paddingVertical: space.xxl },
  center: { textAlign: 'center' },
  list: { gap: space.sm },
  item: { flexDirection: 'row', gap: space.md, padding: space.lg, borderRadius: t.radius.lg, backgroundColor: t.color.bgRaised, borderWidth: 1, borderColor: t.color.line },
  mark: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color.surface },
  text: { flex: 1, gap: 2 },
  title: t.text.bold,
  time: { ...t.text.body, fontSize: 12, color: t.color.textMuted, marginTop: space.xs },
  clear: { position: 'absolute', right: space.lg, minHeight: 44, justifyContent: 'center' },
  clearText: { ...t.text.bold, fontSize: 14, color: t.color.accentSoft },
}));
