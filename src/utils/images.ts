import { Directory, File, Paths } from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

/**
 * Lets the user pick a photo and keeps a copy the app owns. The picker returns a file in
 * the cache, which the system may clear, so a saved background or avatar would vanish.
 * Returns null when the user cancels.
 */
export async function pickAndKeepImage(folder: string, aspect: [number, number]): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect, quality: 0.8 });
  if (result.canceled) return null;
  const picked = result.assets[0].uri;
  // On web the picker hands back a data URI, which already persists with the settings.
  if (Platform.OS === 'web') return picked;

  const dir = new Directory(Paths.document, folder);
  // Only the latest picture is used, so drop older ones instead of letting them pile up.
  if (dir.exists) dir.delete();
  dir.create({ intermediates: true });
  const source = new File(picked);
  // A fresh name per pick so expo-image does not show the cached previous picture.
  const target = new File(dir, `${Date.now()}-${source.name}`);
  await source.copy(target);
  return target.uri;
}
