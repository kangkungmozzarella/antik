/*
  Builds every icon and splash asset from the two source designs in assets/brand/:
  - antik-icon.png    the teal ribbon A on a dark card (2048 px)
  - antik-splash.png  the full splash screen (1536 x 2752)
  Run `npm run build:brand` after replacing either.

  The icon design has its own rounded card, border and glow. Android and iOS cut icons to
  their own shapes, so using it as-is would put a card inside a card. Instead the A is lifted
  off its card and set on a full-bleed background of the card's colour.

  Outputs in assets/images/ (the paths app.json points at):
  - icon.png                     1024 px full-bleed icon (iOS, legacy Android, stores)
  - android-icon-background.png  adaptive icon background layer
  - android-icon-foreground.png  adaptive icon foreground, the A inside the safe circle
  - android-icon-monochrome.png  Android 13 themed icon (alpha only)
  - splash-icon.png              the A alone, for the native splash
  - splash.png                   the full splash design, shown in-app as the native splash ends
  - favicon.png                  48 px for web
*/
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const path = (p) => fileURLToPath(new URL(`../../${p}`, import.meta.url));
const ICON_SOURCE = path('assets/brand/antik-icon.png');
const SPLASH_SOURCE = path('assets/brand/antik-splash.png');
const out = (name) => path(`assets/images/${name}`);

// Measured from antik-icon.png: the card's fill, and a window inside its border and glow
// that holds the whole A.
const CARD = { r: 14, g: 24, b: 34 };
const A_WINDOW = { left: 330, top: 400, width: 1390, height: 1220 };
const ICON_BACKGROUND = '#0e1822';

/** The A with an alpha channel: how far each pixel is from the card colour. */
async function liftMark() {
  const { data, info } = await sharp(ICON_SOURCE).extract(A_WINDOW).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const rgba = Buffer.alloc(info.width * info.height * 4);
  const FEATHER = 80;
  for (let i = 0, j = 0; i < data.length; i += 3, j += 4) {
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    const x = (j / 4) % info.width;
    const y = Math.floor(j / 4 / info.width);
    const distance = Math.hypot(r - CARD.r, g - CARD.g, b - CARD.b);
    // The card has a faint teal haze (up to ~28 away from its fill) that is not part of the A.
    // Above it, a soft ramp keeps the A's edges and shading smooth.
    const fromCard = Math.min(1, Math.max(0, (distance - 30) / 40));
    // Fade towards the window's edges so no trace of a rectangle survives.
    const edge = Math.min(x, y, info.width - 1 - x, info.height - 1 - y);
    const alpha = fromCard * Math.min(1, edge / FEATHER);
    rgba.set([r, g, b, Math.round(alpha * 255)], j);
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).trim({ threshold: 10 }).png().toBuffer();
}

/** The mark scaled to `width`, centred on a `size` canvas of `background` (transparent if omitted). */
async function place(mark, size, width, background) {
  const scaled = await sharp(mark).resize({ width }).toBuffer();
  const { height } = await sharp(scaled).metadata();
  return sharp({ create: { width: size, height: size, channels: 4, background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: scaled, left: Math.round((size - width) / 2), top: Math.round((size - height) / 2) }]);
}

/** Card colour with the soft teal glow the original card has behind the A. */
function iconBackground(size) {
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <defs><radialGradient id="glow" cx="0.5" cy="0.48" r="0.55">
      <stop offset="0" stop-color="#28937f" stop-opacity="0.22"/><stop offset="1" stop-color="#28937f" stop-opacity="0"/>
    </radialGradient></defs>
    <rect width="100%" height="100%" fill="${ICON_BACKGROUND}"/><rect width="100%" height="100%" fill="url(#glow)"/>
  </svg>`);
}

const mark = await liftMark();

const write = async (name, image) => {
  await image.png({ compressionLevel: 9 }).toFile(out(name));
  console.log(name);
};

await write('icon.png', sharp(iconBackground(1024)).composite([{ input: await (await place(mark, 1024, 620)).png().toBuffer() }]));
await write('android-icon-background.png', sharp(iconBackground(512)));
// Android crops the foreground to a circle of 66% of the canvas; the A's corners stay inside it.
await write('android-icon-foreground.png', await place(mark, 512, 236));
// Themed icons keep only the shape: solid white, with the A's soft edges hardened.
const monoAlpha = await sharp(await (await place(mark, 432, 200)).png().toBuffer()).extractChannel(3).linear(4, -200).raw().toBuffer();
await write('android-icon-monochrome.png', sharp({ create: { width: 432, height: 432, channels: 3, background: '#ffffff' } }).joinChannel(monoAlpha, { raw: { width: 432, height: 432, channels: 1 } }));
await write('splash-icon.png', await place(mark, 1024, 560));
await write('favicon.png', sharp(await sharp(out('icon.png')).resize(48).toBuffer()));
// Phone-sized copy of the full design; the source stays in assets/brand.
await write('splash.png', sharp(SPLASH_SOURCE).resize({ width: 1080 }));
