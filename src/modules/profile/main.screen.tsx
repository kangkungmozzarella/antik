import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Avatar } from '@/common/components/avatar';
import { BackButton } from '@/common/components/back-button';
import { Icon } from '@/common/components/icon';
import { Screen } from '@/common/components/screen';
import { Heading, Muted, Title } from '@/common/components/text';
import { useStore, type Backdrop } from '@/common/store/store';
import { makeStyles, useTheme } from '@/common/theme/theme';
import { themeList, type Theme } from '@/common/theme/themes';
import { space } from '@/common/theme/tokens';
import { pickAndKeepImage } from '@/utils/images';

import { ProfileRow } from './components/profile-row';
import { ThemeCard } from './components/theme-card';

function backdropName(backdrop: Backdrop, theme: Theme) {
  if (backdrop.kind === 'photo') return 'Your photo';
  if (backdrop.kind === 'album') return "What's playing";
  return `${(theme.backdrops[backdrop.preset] ?? theme.backdrops[theme.defaultBackdrop]).label} aurora`;
}

export default function ProfileScreen() {
  const styles = useStyles();
  const theme = useTheme();
  const { state, dispatch } = useStore();
  const { profile } = state;
  const [error, setError] = useState<string | null>(null);
  const connectedCount = Object.values(state.connected).filter(Boolean).length;

  async function pickPhoto() {
    setError(null);
    try {
      const uri = await pickAndKeepImage('avatar', [1, 1]);
      if (uri) dispatch({ type: 'setProfile', profile: { photoUri: uri } });
    } catch {
      setError('Could not open your photos. Check that AnTik is allowed to access them.');
    }
  }

  return (
    <View style={styles.fill}>
      <Screen withTabBar={false} keyboardShouldPersistTaps="handled">
        <View style={styles.identity}>
          <Pressable onPress={pickPhoto} accessibilityRole="button" accessibilityLabel={profile.photoUri ? 'Change profile photo' : 'Add a profile photo'}>
            <Avatar profile={profile} size={96} />
            <View style={styles.photoBadge}>
              <Icon name="image" size={16} tint={theme.color.accentInk} />
            </View>
          </Pressable>
          {profile.photoUri && (
            <Pressable onPress={() => dispatch({ type: 'setProfile', profile: { photoUri: undefined } })} hitSlop={8} accessibilityRole="button">
              <Text style={styles.link}>Remove photo</Text>
            </Pressable>
          )}
          {error && <Text style={styles.error} accessibilityLiveRegion="polite">{error}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label} nativeID="profile-name">Your name</Text>
          <TextInput
            value={profile.name}
            onChangeText={(name) => dispatch({ type: 'setProfile', profile: { name } })}
            placeholder="What should AnTik call you?"
            placeholderTextColor={theme.color.textMuted}
            style={styles.input}
            accessibilityLabel="Your name"
            accessibilityLabelledBy="profile-name"
            autoCapitalize="words"
            autoComplete="name"
            returnKeyType="done"
            maxLength={40}
          />
          <Muted>Saved on this device only.</Muted>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Title style={styles.sectionTitle}>Appearance</Title>
            <Muted>A theme changes colours, type, icons and the Now Playing motif.</Muted>
          </View>
          <Heading>Theme</Heading>
          <View style={styles.themes}>
            {themeList.map((item) => (
              <ThemeCard key={item.id} item={item} selected={item.id === theme.id} onPress={() => dispatch({ type: 'setTheme', themeId: item.id })} />
            ))}
          </View>
          <ProfileRow icon="image" title="Background" detail={backdropName(state.backdrop, theme)} href="/appearance" />
        </View>

        <View style={styles.section}>
          <Heading>Services</Heading>
          <ProfileRow icon="link" title="Connected services" detail={connectedCount ? `${connectedCount} connected` : 'None yet'} href="/connect" />
        </View>
      </Screen>
      <BackButton />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  fill: { flex: 1, backgroundColor: t.color.bg },
  identity: { alignItems: 'center', gap: space.sm, marginTop: 56 },
  photoBadge: { position: 'absolute', right: -2, bottom: -2, width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: t.color.accent, borderWidth: 3, borderColor: t.color.bg },
  link: { ...t.text.strong, fontSize: 13, color: t.color.accentSoft, paddingVertical: space.xs },
  error: { ...t.text.body, color: t.color.danger, fontSize: 13, textAlign: 'center' },
  field: { gap: space.sm },
  label: { ...t.text.strong, fontSize: 13, color: t.color.textSoft },
  input: { ...t.text.body, fontSize: 16, color: t.color.text, minHeight: 48, paddingHorizontal: space.md, borderRadius: t.radius.md, backgroundColor: t.color.surface },
  section: { gap: space.md },
  sectionHead: { gap: space.xs },
  sectionTitle: { fontSize: 26, lineHeight: 32 },
  themes: { flexDirection: 'row', gap: space.md },
}));
