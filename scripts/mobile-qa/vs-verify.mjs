#!/usr/bin/env node
import puppeteer from 'puppeteer-core';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = resolve(__dirname, '..', '..', 'web/.qa/screenshots/vs-verify');
mkdirSync(OUT_DIR, { recursive: true });

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1280, height: 1600, deviceScaleFactor: 2 });
await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0', timeout: 60_000 });

// scroll to and force vs-in-view to be applied
await page.evaluate(async () => {
  const el = document.querySelector('.vs-compare');
  if (!el) return;
  el.scrollIntoView({ block: 'center' });
  el.classList.add('vs-in-view');
  await new Promise(r => setTimeout(r, 1500));
});

const el = await page.$('.vs-compare');
if (!el) {
  console.error('vs-compare not found');
  process.exit(1);
}

await el.screenshot({ path: resolve(OUT_DIR, 'vs-compare-after.png') });

// measure dividers (border-top of each .vs-row, ignoring first which has border-top:0)
const measurements = await page.evaluate(() => {
  const generic = [...document.querySelectorAll('.vs-side-generic .vs-row')];
  const mindthos = [...document.querySelectorAll('.vs-side-mindthos .vs-row')];
  const get = (els) => els.map((r, i) => {
    const rect = r.getBoundingClientRect();
    return { i, top: Math.round(rect.top) };
  });
  return { generic: get(generic), mindthos: get(mindthos) };
});

console.log('Generic row tops:', measurements.generic.map(r => r.top).join(', '));
console.log('Mindthos row tops:', measurements.mindthos.map(r => r.top).join(', '));
const diffs = measurements.generic.map((g, i) => measurements.mindthos[i].top - g.top);
console.log('Diff (Mindthos - Generic):', diffs.join(', '), 'px');

await browser.close();
console.log('Saved:', resolve(OUT_DIR, 'vs-compare-after.png'));
