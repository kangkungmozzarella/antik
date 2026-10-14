# AnTik

Aplikasi musik pribadi: cari dan putar lagu dari YouTube Music di player AnTik sendiri, dengan tampilan yang bisa kamu atur sendiri. Dibuat dengan React Native, Expo, dan TypeScript, untuk Android (dibagikan sebagai APK, bukan lewat Google Play) dan versi web.

## Menjalankan

Butuh Node.js 20 atau lebih baru.

```sh
npm install
npm start          # lalu tekan a (Android), w (web), atau scan QR dengan Expo Go
npm run web        # langsung buka versi web
```

Pemeriksaan sebelum commit:

```sh
npm run typecheck
npm run lint
```

## Yang sudah ada

- **Search**: cari lagu di YouTube Music dan putar utuh di player AnTik, termasuk lanjut otomatis ke lagu berikutnya.
- **Home**:
  - background yang bisa diganti (aurora, foto dari galeri, atau cover lagu yang sedang diputar)
  - **Baru diputar**: grid 2 kolom dari 30 lagu terakhir yang diputar, disimpan di HP
  - **chip filter** All / Songs / Playlists
  - section dari home feed YouTube Music (Quick picks, playlist trending, dan lainnya), mengikuti wilayah HP
  - **lonceng notifikasi** dengan badge
- **Notifikasi**: kejadian nyata di aplikasi, saat ini lagu yang gagal diputar beserta alasannya. Disimpan di HP; belum ada notifikasi dari server.
- **Detail playlist dan album**: dari library atau dari YouTube Music (`/playlist/yt:playlist:<id>`, `/playlist/yt:album:<id>`).
- **Now Playing**: progress bar yang bisa di-tap untuk lompat. Motifnya (piringan hitam atau maskot) hanya bergerak saat audio benar-benar berbunyi, dan diam jika "kurangi gerakan" aktif.
- **Library** dengan pencarian dan filter per sumber.
- **Connect** untuk mengelola layanan yang terhubung.
- **Profile** (avatar di pojok Home): nama dan foto yang disimpan di HP, pilihan tema, dan background.
- **Tema** yang mengganti seluruh tampilan: warna, font, sudut, ikon, background, dan motif di Now Playing. Saat ini ada *Antik* (gelap, piringan hitam) dan *Puding* (krem, maskot puding buatan sendiri).
- **Demo library**: playlist contoh berlabel "Demo" tanpa audio. Bisa dimatikan di Connect.

## Streaming YouTube Music

AnTik memutar lagu dari YouTube Music dengan cara yang sama seperti [BitChord](https://github.com/kushagrasinghx/BitChord). BitChord hanya dipakai sebagai referensi cara kerja; kodenya tidak disalin karena berlisensi GPLv3.

**Ini memakai API privat YouTube dan tidak sesuai ketentuan YouTube**, jadi AnTik tidak bisa dirilis di Google Play. AnTik dipakai sendiri dan dibagikan sebagai APK. YouTube sering mengubah proteksinya, jadi bagian ini bisa berhenti bekerja kapan saja.

Cara kerja:

1. `src/common/youtube/client.ts` memakai `youtubei.js` untuk search, home feed, playlist, album, dan meminta URL audio. Client YTMUSIC, MWEB, dan WEB dicoba berurutan, karena tiap client ditolak untuk sebagian lagu.
2. Tanpa PoToken, googlevideo hanya mengirim 1 MB pertama (±1 menit). PoToken dibuat oleh BotGuard milik Google yang berjalan di WebView tersembunyi (`engine-view.tsx`, script di `scripts/youtube-engine/entry.js`). Request ke Google (`/api/jnn/v1/Create` dan `GenerateIT`) dikirim dari sisi aplikasi (`potoken.ts`), bukan dari WebView, karena WebView Android menandai request-nya dan Google lalu menahan token.
3. Kode dekripsi URL dari player YouTube juga dijalankan di WebView, bukan di runtime aplikasi.
4. `src/common/playback/playback.tsx` memutar URL itu dengan `expo-audio` dan pindah ke lagu berikutnya otomatis.

Setelah mengubah `scripts/youtube-engine/entry.js`, jalankan `npm run build:youtube-engine`.

Batasan:
- Kontrol lock screen dan pemutaran di background hanya jalan di development build atau APK (`npx expo run:android`), tidak di Expo Go.
- Sebagian lagu meminta login dan belum bisa diputar.
- Tanpa wilayah Indonesia di setelan HP, YouTube Music tidak mengirim Quick picks.
- Belum ada download offline atau cache.

## Rencana berikutnya

1. Login Spotify (PKCE lewat `expo-auth-session`) untuk mengimpor playlist, yang lalu diputar lewat YouTube Music.
2. Build APK lewat EAS (`eas build --profile preview`) untuk dipasang di HP sendiri.

## Ikon dan splash

Desain sumbernya ada di `assets/brand/`: `antik-icon.png` (huruf A pita teal) dan `antik-splash.png` (splash layar penuh). Semua aset turunan dibuat dari dua file itu dengan `npm run build:brand` (`scripts/brand/render.mjs`):

- ikon aplikasi, adaptive icon Android, ikon monokrom Android 13, dan favicon. Huruf A diangkat dari kartunya lalu ditaruh di latar penuh, karena Android dan iOS memotong ikon dengan bentuknya sendiri.
- `splash-icon.png`: huruf A saja, untuk splash native.
- `splash.png`: desain splash penuh, ditampilkan oleh `BrandSplash` di dalam aplikasi. Android 12 ke atas hanya mengizinkan ikon di tengah untuk splash native, jadi splash native menampilkan A di atas warna latar yang sama (`#040c11`), lalu langsung diganti desain penuh yang memudar saat aplikasi siap.

Untuk mengganti desain, timpa file di `assets/brand/` dengan nama yang sama, lalu jalankan `npm run build:brand`.

Expo Go selalu memakai ikonnya sendiri. Untuk melihat ikon dan splash yang sebenarnya, pakai development build: `npx expo run:android`.

## Struktur

Dibagi per fitur: tiap layar punya modulnya sendiri, kode yang dipakai bersama ada di `common/`.

```text
src/
  app/                  Route Expo Router saja. Tiap file hanya meneruskan ke modulnya,
                        misal profile.tsx → export { ProfileScreen as default } from '@/modules/profile'
  modules/<fitur>/      main.screen.tsx, components/ dan hooks/ khusus fitur itu, index.ts (export XxxScreen)
                        home, search, library, connect, playlist, player, notifications, profile, appearance
  common/
    components/         Komponen bersama: teks, ikon, artwork, avatar, maskot, tab bar, splash, dll.
    store/              Store (pemutar, riwayat, notifikasi, pengaturan), tipe data, demo library
    theme/              themes.ts (definisi tema), theme.tsx (useTheme, makeStyles), tokens.ts
    youtube/            Klien YouTube Music, PoToken, dan WebView mesinnya
    playback/           Pemutaran audio (expo-audio) dan antrean
  utils/                images.ts (simpan foto), format.ts
scripts/
  brand/                Membuat ikon dan splash dari assets/brand/
  youtube-engine/       Script yang berjalan di WebView mesin YouTube
```

Layar baru: buat `src/modules/<fitur>/` dengan `main.screen.tsx` dan `index.ts`, lalu satu file route di `src/app/` yang meneruskan ke sana.

### Menambah tema

1. Tambahkan objek `Theme` baru di `src/common/theme/themes.ts` dan daftarkan di `themes`. TypeScript akan menandai field yang belum diisi.
2. Glyph ikon yang ingin digambar ulang cukup ditulis di `icon.paths`; sisanya memakai set bawaan.
3. Font baru dimuat di `src/app/_layout.tsx`.
4. Di komponen, pakai `makeStyles((t) => ...)` atau `useTheme()`, jangan warna yang ditulis langsung.
