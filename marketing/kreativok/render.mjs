/**
 * Kreatívok PNG-be renderelése.
 *   node render.mjs          → mindhárom kreatív a png/ mappába
 * Előfeltétel: playwright + Chromium (npm i -g playwright && npx playwright install chromium)
 */
import { chromium } from 'playwright';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const files = [
  ['kreativ-1-ingyenes-elso-alkalom.html', 1080, 1350],
  ['kreativ-2-kezdoknek.html',             1080, 1080],
  ['kreativ-3-csomag-story.html',          1080, 1920],
];

const browser = await chromium.launch();
for (const [file, w, h] of files) {
  const page = await browser.newPage({ viewport: { width: w + 120, height: h + 120 }, deviceScaleFactor: 1 });
  await page.goto(pathToFileURL(join(here, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const out = join(here, 'png', file.replace(/\.html$/, '.png'));
  await page.locator('.kreativ').screenshot({ path: out });
  console.log(`✓ ${out} (${w}×${h})`);
  await page.close();
}
await browser.close();
