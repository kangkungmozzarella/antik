/*
  Draws AnTik's icon set from one definition: a record in the Antik theme's night indigo,
  its lavender label carrying the A. Run `npm run build:brand` after changing it.

  Outputs (paths are the ones app.json points at):
  - icon.png                     1024 px, full-bleed square for iOS, legacy Android, stores
  - android-icon-background.png  adaptive icon background layer
  - android-icon-foreground.png  adaptive icon foreground, kept inside the 66% safe circle
  - android-icon-monochrome.png  Android 13 themed icon: one colour, label punched out
  - splash-icon.png              transparent mark for the splash screen
  - favicon.png                  48 px for web
*/
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const out = (name) => fileURLToPath(new URL(`../../assets/images/${name}`, import.meta.url));

const color = {
  disc: '#121220',
  ink: '#14132b',
  accent: '#8f8cf6',
  accentSoft: '#c4c2ff',
  bgTop: '#3b2f8a',
  bgMid: '#1c1846',
  bgBottom: '#0b0c16',
};

const defs = `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="0.4" y2="1">
    <stop offset="0" stop-color="${color.bgTop}"/><stop offset="0.55" stop-color="${color.bgMid}"/><stop offset="1" stop-color="${color.bgBottom}"/>
  </linearGradient>
  <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="${color.accent}" stop-opacity="0.45"/><stop offset="1" stop-color="${color.accent}" stop-opacity="0"/>
  </radialGradient>
  <linearGradient id="sheen" x1="0.15" y1="0.1" x2="0.55" y2="0.6">
    <stop offset="0" stop-color="#ffffff" stop-opacity="0.14"/><stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
  </linearGradient>
  <linearGradient id="label" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${color.accentSoft}"/><stop offset="1" stop-color="${color.accent}"/>
  </linearGradient>
</defs>`;

/** The A, drawn as strokes so it needs no font. */
function letterA(cx, cy, r) {
  const apexY = cy - r * 0.24;
  const footY = cy + r * 0.2;
  const footX = r * 0.17;
  const barY = cy + r * 0.06;
  const barX = r * 0.116; // where the legs cross barY
  return `M${cx - footX} ${footY}L${cx} ${apexY}L${cx + footX} ${footY}M${cx - barX} ${barY}H${cx + barX}`;
}

/** The record: disc, grooves, a soft reflection, then the label with the A. */
function record(cx, cy, r) {
  const grooves = [0.93, 0.86, 0.79, 0.72, 0.65, 0.58]
    .map((g) => `<circle cx="${cx}" cy="${cy}" r="${r * g}" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="${r * 0.009}"/>`)
    .join('');
  return `
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="${color.disc}"/>
  ${grooves}
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#sheen)"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.76}" fill="none" stroke="#ffffff" stroke-opacity="0.07" stroke-width="${r * 0.2}" stroke-linecap="round" stroke-dasharray="${r * 0.7} ${r * 10}" transform="rotate(-145 ${cx} ${cy})"/>
  <circle cx="${cx}" cy="${cy}" r="${r * 0.42}" fill="url(#label)"/>
  <path d="${letterA(cx, cy, r)}" fill="none" stroke="${color.ink}" stroke-width="${r * 0.075}" stroke-linecap="round" stroke-linejoin="round"/>`;
}

const background = `<rect width="1024" height="1024" fill="url(#bg)"/><circle cx="512" cy="512" r="470" fill="url(#glow)"/>`;

const svg = (body) => `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">${defs}${body}</svg>`;

const files = {
  'icon.png': { size: 1024, svg: svg(`${background}${record(512, 512, 330)}`) },
  'android-icon-background.png': { size: 512, svg: svg(background) },
  // Android crops the foreground to a circle of 66% of the canvas (radius ~338 of 1024).
  'android-icon-foreground.png': { size: 512, svg: svg(record(512, 512, 320)) },
  // Themed icons use only the alpha channel, so the label is cut out and the A left solid.
  'android-icon-monochrome.png': {
    size: 432,
    svg: svg(`<mask id="mono">
      <circle cx="512" cy="512" r="320" fill="#fff"/>
      <circle cx="512" cy="512" r="${320 * 0.42}" fill="#000"/>
      <path d="${letterA(512, 512, 320)}" fill="none" stroke="#fff" stroke-width="${320 * 0.075}" stroke-linecap="round" stroke-linejoin="round"/>
    </mask><rect width="1024" height="1024" fill="#fff" mask="url(#mono)"/>`),
  },
  // Android 12+ shows the splash image inside a circle, so the record keeps a margin.
  'splash-icon.png': { size: 1024, svg: svg(record(512, 512, 340)) },
  'favicon.png': { size: 48, svg: svg(`<rect width="1024" height="1024" rx="224" fill="url(#bg)"/>${record(512, 512, 400)}`) },
};

for (const [name, { size, svg: source }] of Object.entries(files)) {
  const png = new Resvg(source, { fitTo: { mode: 'width', value: size } }).render().asPng();
  writeFileSync(out(name), png);
  console.log(`${name} ${size}px`);
}
