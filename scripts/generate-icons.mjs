/**
 * @file generate-icons.mjs
 * @brief Renders the PWA / iOS icons (PNG) from the single source SVG `public/icon.svg`.
 *
 * Usage: `npm run icons`. Re-run whenever the SVG changes and commit the resulting PNGs.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = `${root}public/icon.svg`;
const outDir = `${root}public/icons`;
const WHITE = { r: 255, g: 255, b: 255, alpha: 1 };

/**
 * @brief Icon variants to render.
 * @details `scale` is the share of the canvas the artwork occupies. Maskable icons need extra
 * padding so the artwork stays inside the 80 % safe zone after the OS crops it.
 */
const variants = [
  { file: 'apple-touch-icon.png', size: 180, scale: 0.96 },
  { file: 'pwa-192.png', size: 192, scale: 0.96 },
  { file: 'pwa-512.png', size: 512, scale: 0.96 },
  { file: 'pwa-maskable-512.png', size: 512, scale: 0.74 },
];

/**
 * @brief Renders one icon variant: scaled artwork centred on an opaque white square.
 * @param svg Raw SVG source.
 * @param variant Target file name, edge length in px and artwork scale.
 * @returns Promise that resolves once the PNG is written.
 */
async function renderVariant(svg, { file, size, scale }) {
  const inner = Math.round(size * scale);
  const pad = Math.floor((size - inner) / 2);
  await sharp(svg, { density: 300 })
    .resize(inner, inner)
    .extend({
      top: pad,
      left: pad,
      bottom: size - inner - pad,
      right: size - inner - pad,
      background: WHITE,
    })
    .flatten({ background: WHITE })
    .png({ compressionLevel: 9 })
    .toFile(`${outDir}/${file}`);
  console.log(`✓ ${file} (${size}×${size})`);
}

const svg = await readFile(source);
await Promise.all(variants.map((variant) => renderVariant(svg, variant)));
