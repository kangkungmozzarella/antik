import type { Playlist, Track } from './types';

// A labelled sample library so the app can be explored before any service is connected.
// Every item uses the "demo" source, which the UI always marks as "Demo".
// Durations are left out on purpose: real lengths come from the connected service.
const t = (id: string, title: string, artist: string): Track => ({ id: `demo-${id}`, source: 'demo', title, artist });

export const demoPlaylists: Playlist[] = [
  {
    id: 'demo-evening',
    source: 'demo',
    name: 'Evening Drive',
    owner: 'Demo library',
    tracks: [
      t('1', 'Better Together', 'Jack Johnson'),
      t('2', 'Sunflower', 'Post Malone, Swae Lee'),
      t('3', 'Space Song', 'Beach House'),
      t('4', 'Good Days', 'SZA'),
      t('5', 'The Night We Met', 'Lord Huron'),
    ],
  },
  {
    id: 'demo-indie',
    source: 'demo',
    name: 'Indonesia Indie',
    owner: 'Demo library',
    tracks: [
      t('6', 'Secukupnya', 'Hindia'),
      t('7', 'Gala Bunga Matahari', 'Sal Priadi'),
      t('8', 'Bertaut', 'Nadin Amizah'),
      t('9', 'Zona Nyaman', 'Fourtwnty'),
    ],
  },
  {
    id: 'demo-focus',
    source: 'demo',
    name: 'Deep Focus',
    owner: 'Demo library',
    tracks: [
      t('10', 'Intro', 'The xx'),
      t('11', 'Nuvole Bianche', 'Ludovico Einaudi'),
      t('12', 'Experience', 'Ludovico Einaudi'),
    ],
  },
];
