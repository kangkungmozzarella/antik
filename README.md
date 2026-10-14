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
- **Demo library**: playlist contoh supaya aplikasi bisa dicoba sebelum ada layanan yang terhubung. Semua item demo diberi label "Demo" dan tidak memiliki audio. Bisa dimatikan di Connect.

## Batasan per layanan

Lagu selalu diputar lewat player resmi tiap layanan; tidak ada layanan yang mengizinkan aplikasi lain mengambil file audionya.

- **Spotify**: playlist bisa dibaca lewat Spotify Web API. Pemutaran penuh butuh Spotify Premium. Aplikasi di Spotify Developer awalnya dibatasi untuk pengguna yang didaftarkan manual; cek Spotify Developer Policy sebelum rilis publik.
- **YouTube / YouTube Music**: playlist dibaca lewat YouTube Data API. YouTube Music tidak punya API resmi; playlist-nya dibaca sebagai playlist YouTube. Pemutaran harus memakai player YouTube yang terlihat (tidak boleh audio di background) agar sesuai ketentuan YouTube dan Google Play.
- **Apple Music**: butuh Apple Developer Program dan langganan Apple Music. Direncanakan untuk tahap berikutnya.

## Rencana berikutnya

1. Login Spotify (PKCE lewat `expo-auth-session`) dan impor playlist.
2. Login Google untuk YouTube dan impor playlist, dengan pemutaran lewat player YouTube.
3. Ikon dan identitas aplikasi.
4. Build Android lewat EAS untuk pengujian internal di Google Play.

## Struktur

```text
src/app/          Layar (Expo Router): (tabs)/ Home, Library, Connect; playlist/[id]; player; settings
src/components/   Artwork, background, tab bar dan mini player, ikon, label sumber
src/state/        Tipe data, store, dan demo library
src/theme/        Token desain (warna, font, jarak)
```
