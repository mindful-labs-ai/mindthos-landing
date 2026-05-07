#!/usr/bin/env node
/* Mobile responsive QA — fullPage screenshots + horizontal-overflow + touch-target audit. */
import puppeteer from 'puppeteer-core';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '..', '..');
const OUT_DIR = resolve(REPO_ROOT, 'web/.qa/screenshots/mobile-qa');
const REPORT_PATH = resolve(REPO_ROOT, 'web/.qa/mobile-qa-audit.json');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const BASE = process.env.QA_BASE ?? 'http://localhost:3000';
const VARIANT = process.env.QA_VARIANT ?? 'before';

const VIEWPORTS = [
  { label: 'galaxy', w: 360, h: 800 },
  { label: 'iphone-se', w: 375, h: 667 },
  { label: 'iphone-14', w: 390, h: 844 },
  { label: 'iphone-plus', w: 414, h: 896 },
  { label: 'mobile-landscape', w: 720, h: 360 },
  { label: 'tablet-portrait', w: 768, h: 1024 },
  { label: 'tablet-large', w: 880, h: 1180 },
];

const ROUTES = [
  { name: 'home', path: '/' },
  { name: 'blog', path: '/blog' },
  { name: 'blog-detail', path: '/blog/clinical-counseling-school-counselor-guide' },
  { name: 'security', path: '/security' },
  { name: 'education', path: '/education' },
];

const auditScript = () => {
  const result = {
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollHeight: document.documentElement.scrollHeight,
    overflow: false,
    overflowingNodes: [],
    smallTouchTargets: [],
    fontFloor: [],
  };
  result.overflow = result.scrollWidth > result.clientWidth + 1;

  const vw = result.clientWidth;
  const all = document.querySelectorAll('*');
  const seenSel = new Set();
  for (const el of all) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (r.right > vw + 2) {
      const cs = window.getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') continue;
      const tag = el.tagName.toLowerCase();
      const cls = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 3).join('.')
        : '';
      const key = tag + cls;
      if (seenSel.has(key)) continue;
      seenSel.add(key);
      const txt = (el.textContent || '').trim().slice(0, 60);
      result.overflowingNodes.push({
        sel: key,
        rect: { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) },
        right: Math.round(r.right),
        text: txt,
      });
      if (result.overflowingNodes.length >= 25) break;
    }
  }

  const tappables = document.querySelectorAll('a[href], button, [role="button"], input, select, textarea, summary');
  for (const el of tappables) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    const cs = window.getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') continue;
    /* Skip skip-to-content links (sr-only by default — only visible on focus). */
    if (el.matches('[class*="sr-only"]')) continue;
    const w = Math.round(r.width);
    const h = Math.round(r.height);
    if (w < 44 || h < 44) {
      const tag = el.tagName.toLowerCase();
      const cls = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.')
        : '';
      const txt = (el.textContent || '').trim().slice(0, 40);
      const aria = el.getAttribute('aria-label') || '';
      const isInline = (() => {
        /* WCAG 2.5.5 inline-text exemption — applies to links inside prose,
           NOT to <li> nav lists. Footer column links live in <ul><li><a> and
           are navigation, not prose. .prose is the blog post body container. */
        const parent = el.closest('p, blockquote, .post-body, .post-content, .markdown-body, .prose, td, th, h1, h2, h3, h4, h5, figcaption');
        if (parent && (tag === 'a' || tag === 'button')) return true;
        return false;
      })();
      result.smallTouchTargets.push({
        sel: tag + cls,
        text: txt || aria,
        w, h,
        href: el.getAttribute('href') || '',
        inline: isInline,
      });
      if (result.smallTouchTargets.length >= 60) break;
    }
  }

  const textNodes = document.querySelectorAll('p, li, span, h1, h2, h3, h4');
  let smallText = 0;
  for (const el of textNodes) {
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) continue;
    if (!(el.textContent || '').trim()) continue;
    const cs = window.getComputedStyle(el);
    const fs = parseFloat(cs.fontSize);
    if (fs > 0 && fs < 13) {
      smallText += 1;
      if (result.fontFloor.length < 10) {
        result.fontFloor.push({
          tag: el.tagName.toLowerCase(),
          fs: Math.round(fs * 10) / 10,
          text: (el.textContent || '').trim().slice(0, 40),
        });
      }
    }
  }
  result.smallTextCount = smallText;
  return result;
};

async function main() {
  mkdirSync(resolve(OUT_DIR, VARIANT), { recursive: true });
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--hide-scrollbars'],
  });

  const audit = { variant: VARIANT, base: BASE, capturedAt: new Date().toISOString(), entries: [] };

  try {
    for (const route of ROUTES) {
      for (const vp of VIEWPORTS) {
        const page = await browser.newPage();
        await page.setViewport({
          width: vp.w,
          height: vp.h,
          isMobile: true,
          hasTouch: true,
          deviceScaleFactor: 2,
        });
        await page.setUserAgent(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        );
        const url = BASE + route.path;
        let status = 0;
        try {
          const resp = await page.goto(url, { waitUntil: 'networkidle2', timeout: 45000 });
          status = resp ? resp.status() : 0;
        } catch (err) {
          console.error(`[FAIL goto] ${url} (${vp.label}): ${err.message}`);
        }
        try { await page.evaluate(() => document.fonts && document.fonts.ready); } catch {}
        await new Promise(r => setTimeout(r, 1200));

        const data = await page.evaluate(auditScript).catch((err) => ({ error: err.message }));
        const filename = `${route.name}-${vp.label}.png`;
        const filepath = resolve(OUT_DIR, VARIANT, filename);
        try {
          await page.screenshot({ path: filepath, fullPage: true });
        } catch (err) {
          console.error(`[FAIL screenshot] ${filename}: ${err.message}`);
        }

        const entry = {
          route: route.name,
          path: route.path,
          viewport: vp.label,
          w: vp.w,
          h: vp.h,
          status,
          file: `web/.qa/screenshots/mobile-qa/${VARIANT}/${filename}`,
          ...data,
        };
        audit.entries.push(entry);
        const overflowFlag = data.overflow ? '❌ OVERFLOW' : '✓';
        const ttCount = (data.smallTouchTargets || []).length;
        console.log(`${overflowFlag}  ${route.name.padEnd(13)}  ${vp.label.padEnd(12)} (${vp.w}x${vp.h})  small-tt=${ttCount} small-text=${data.smallTextCount ?? 0}`);
        await page.close();
      }
    }
  } finally {
    await browser.close();
  }

  writeFileSync(REPORT_PATH, JSON.stringify(audit, null, 2));
  console.log(`\nAudit JSON: ${REPORT_PATH}`);
  console.log(`Screenshots: ${OUT_DIR}/${VARIANT}/`);

  const failed = audit.entries.filter(e => e.overflow);
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${audit.entries.length}, overflow: ${failed.length}`);
  if (failed.length) {
    console.log('\nOverflow routes:');
    for (const e of failed) {
      console.log(`  ${e.route}/${e.viewport}: scrollWidth=${e.scrollWidth} > clientWidth=${e.clientWidth}`);
      for (const n of (e.overflowingNodes || []).slice(0, 5)) {
        console.log(`    └─ ${n.sel} (right=${n.right}) "${n.text}"`);
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
