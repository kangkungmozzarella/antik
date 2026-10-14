# AnTik

Aplikasi musik yang mengumpulkan playlist dari beberapa layanan (Spotify, YouTube dan YouTube Music, lalu Apple Music) ke satu tempat, dengan tampilan yang bisa kamu atur sendiri. Dibuat dengan React Native, Expo, dan TypeScript, dengan target Android (Google Play) dan versi web.

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

- **Home** dengan background yang bisa diganti: empat preset aurora, foto dari galeri, atau cover lagu yang sedang diputar (diburamkan).
- **Library** dengan pencarian dan filter per sumber.
- **Detail playlist** dan **Now Playing** dengan piringan hitam yang berputar hanya saat audio benar-benar diputar (diam jika "kurangi gerakan" aktif).
- **Connect** untuk mengelola layanan yang terhubung.
- **Profile** (avatar di pojok Home): nama dan foto yang disimpan di perangkat, pilihan tema, dan background.
- **Tema** yang mengganti seluruh tampilan: warna, font, sudut, ikon, background, dan motif di Now Playing. Saat ini ada *Antik* (gelap, piringan hitam) dan *Puding* (krem, maskot puding buatan sendiri).
- **Demo library**: playlist contoh supaya aplikasi bisa dicoba sebelum ada layanan yang terhubung. Semua item demo diberi label "Demo" dan tidak memiliki audio. Bisa dimatikan di Connect.

## Prototipe: streaming YouTube Music (branch `proto/youtube-music`)

Tab **Search** mencari lagu di YouTube Music dan memutarnya utuh di player AnTik sendiri, dengan cara yang sama seperti [BitChord](https://github.com/kushagrasinghx/BitChord). BitChord hanya dipakai sebagai referensi cara kerja; kodenya tidak disalin karena berlisensi GPLv3.

**Ini tidak sesuai ketentuan YouTube dan tidak bisa dirilis di Google Play.** Hanya untuk dicoba sendiri atau dibagikan sebagai APK. YouTube sering mengubah proteksinya, jadi bagian ini bisa berhenti bekerja kapan saja.

Cara kerja:

1. `src/common/youtube/client.ts` memakai `youtubei.js` untuk search dan meminta URL audio. Client YTMUSIC, MWEB, dan WEB dicoba berurutan, karena tiap client ditolak untuk sebagian lagu.
2. Tanpa PoToken, googlevideo hanya mengirim 1 MB pertama (±1 menit). PoToken dibuat oleh BotGuard milik Google yang berjalan di WebView tersembunyi (`engine-view.tsx`, script di `scripts/youtube-engine/entry.js`). Request ke Google (`/api/jnn/v1/Create` dan `GenerateIT`) dikirim dari sisi aplikasi (`potoken.ts`), bukan dari WebView, karena WebView Android menandai request-nya dan Google lalu menahan token.
3. Kode dekripsi URL dari player YouTube juga dijalankan di WebView, bukan di runtime aplikasi.
4. `src/common/playback/playback.tsx` memutar URL itu dengan `expo-audio` dan pindah ke lagu berikutnya otomatis.

Home di branch ini juga memakai YouTube Music:
- **Baru diputar**: grid 2 kolom dari riwayat putar (30 lagu terakhir, disimpan di HP).
- **Chip filter** All / Songs / Playlists.
- **Section dari home feed YouTube Music** (Quick picks, playlist trending, dan lainnya), mengikuti wilayah HP. Tanpa wilayah Indonesia, Quick picks tidak dikirim. Playlist dan album bisa dibuka (`/playlist/yt:playlist:<id>`) dan diputar.
- **Notifikasi**: lonceng dengan badge di header. Isinya kejadian nyata di aplikasi, saat ini lagu yang gagal diputar. Disimpan di HP; belum ada notifikasi dari server.

Setelah mengubah `scripts/youtube-engine/entry.js`, jalankan `npm run build:youtube-engine`.

Belum ada:
- Kontrol lock screen dan pemutaran di background hanya jalan di development build (`npx expo run:android`), tidak di Expo Go.
- Sebagian lagu meminta login dan belum bisa diputar.
- Belum ada download offline atau cache.

## Batasan per layanan

Lagu selalu diputar lewat player resmi tiap layanan; tidak ada layanan yang mengizinkan aplikasi lain mengambil file audionya.

- **Spotify**: playlist bisa dibaca lewat Spotify Web API. Pemutaran penuh butuh Spotify Premium. Aplikasi di Spotify Developer awalnya dibatasi untuk pengguna yang didaftarkan manual; cek Spotify Developer Policy sebelum rilis publik.
- **YouTube / YouTube Music**: playlist dibaca lewat YouTube Data API. YouTube Music tidak punya API resmi; playlist-nya dibaca sebagai playlist YouTube. Pemutaran harus memakai player YouTube yang terlihat (tidak boleh audio di background) agar sesuai ketentuan YouTube dan Google Play.
- **Apple Music**: butuh Apple Developer Program dan langganan Apple Music. Direncanakan untuk tahap berikutnya.

## Rencana berikutnya

1. Login Spotify (PKCE lewat `expo-auth-session`) dan impor playlist.
2. Login Google untuk YouTube dan impor playlist, dengan pemutaran lewat player YouTube.
3. Build Android lewat EAS untuk pengujian internal di Google Play.

## Ikon dan splash

Desain sumbernya ada di `assets/brand/`: `antik-icon.png` (huruf A pita teal) dan `antik-splash.png` (splash layar penuh). Semua aset turunan dibuat dari dua file itu dengan `npm run build:brand` (`scripts/brand/render.mjs`):

- ikon aplikasi, adaptive icon Android, ikon monokrom Android 13, dan favicon. Huruf A diangkat dari kartunya lalu ditaruh di latar penuh, karena Android dan iOS memotong ikon dengan bentuknya sendiri.
- `splash-icon.png`: huruf A saja, untuk splash native.
- `splash.png`: desain splash penuh, ditampilkan oleh `BrandSplash` di dalam aplikasi. Android 12 ke atas hanya mengizinkan ikon di tengah untuk splash native, jadi splash native menampilkan A di atas warna latar yang sama (`#040c11`), lalu langsung diganti desain penuh yang memudar saat aplikasi siap.

Untuk mengganti desain, timpa file di `assets/brand/` dengan nama yang sama, lalu jalankan `npm run build:brand`.

Expo Go selalu memakai ikonnya sendiri. Untuk melihat ikon dan splash yang sebenarnya, pakai development build: `npx expo run:android`.

## Struktur

Dibagi per fitur, mengikuti pola kurosim-mobile.

```text
src/
  app/                  Route Expo Router saja. Tiap file hanya meneruskan ke modulnya,
                        misal profile.tsx → export { ProfileScreen as default } from '@/modules/profile'
  modules/<fitur>/      main.screen.tsx, components/ khusus fitur itu, index.ts (export XxxScreen)
                        home, library, connect, playlist, player, profile, appearance
  common/
    components/         Komponen bersama: teks, ikon, artwork, avatar, maskot, tab bar, dll.
    store/              Store, tipe data, demo library
    theme/              themes.ts (definisi tema), theme.tsx (useTheme, makeStyles), tokens.ts
  utils/                images.ts (simpan foto), format.ts
```

Layar baru: buat `src/modules/<fitur>/` dengan `main.screen.tsx` dan `index.ts`, lalu satu file route di `src/app/` yang meneruskan ke sana.

### Menambah tema

1. Tambahkan objek `Theme` baru di `src/common/theme/themes.ts` dan daftarkan di `themes`. TypeScript akan menandai field yang belum diisi.
2. Glyph ikon yang ingin digambar ulang cukup ditulis di `icon.paths`; sisanya memakai set bawaan.
3. Font baru dimuat di `src/app/_layout.tsx`.
4. Di komponen, pakai `makeStyles((t) => ...)` atau `useTheme()`, jangan warna yang ditulis langsung.
