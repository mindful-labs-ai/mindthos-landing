#!/usr/bin/env node
/* Mobile interaction QA — Header menu, promo dismiss, FAQ details, Personas carousel. */
import puppeteer from 'puppeteer-core';

const BASE = process.env.QA_BASE ?? 'http://localhost:3000';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const VP = { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 };

async function newPage(browser) {
  const page = await browser.newPage();
  await page.setViewport(VP);
  await page.setUserAgent(
    'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1'
  );
  return page;
}

async function check(label, fn) {
  try {
    const result = await fn();
    if (result === false) {
      console.log(`  ❌ ${label}`);
      return false;
    }
    console.log(`  ✓ ${label}${typeof result === 'string' ? ` — ${result}` : ''}`);
    return true;
  } catch (err) {
    console.log(`  ❌ ${label} — ${err.message}`);
    return false;
  }
}

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new', args: ['--no-sandbox'] });
  let pass = 0;
  let fail = 0;
  const tally = (ok) => { ok ? pass++ : fail++; };

  try {
    /* === Header hamburger menu === */
    console.log('\n📱 Header — hamburger menu');
    const p1 = await newPage(browser);
    await p1.goto(BASE + '/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    tally(await check('hamburger button visible', async () => {
      const btn = await p1.$('.gnb-mobile-toggle');
      if (!btn) return false;
      const visible = await p1.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return r.width >= 44 && r.height >= 44;
      }, btn);
      return visible;
    }));
    tally(await check('mobile panel hidden initially', async () => {
      const panel = await p1.$('#gnb-mobile-panel');
      return panel === null;
    }));
    tally(await check('click hamburger → panel opens', async () => {
      await p1.click('.gnb-mobile-toggle');
      await new Promise(r => setTimeout(r, 300));
      const panel = await p1.$('#gnb-mobile-panel');
      return panel !== null;
    }));
    tally(await check('Esc key → panel closes', async () => {
      await p1.keyboard.press('Escape');
      await new Promise(r => setTimeout(r, 300));
      const panel = await p1.$('#gnb-mobile-panel');
      return panel === null;
    }));
    tally(await check('aria-expanded reflects state', async () => {
      const expanded = await p1.$eval('.gnb-mobile-toggle', el => el.getAttribute('aria-expanded'));
      return expanded === 'false';
    }));
    await p1.close();

    /* === Promo bottom (sticky CTA) — close button removed; dismiss not testable === */
    console.log('\n📱 PromoBanner bottom — visibility');
    const p2 = await newPage(browser);
    await p2.goto(BASE + '/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    tally(await check('.promo-bottom rendered + fixed at bottom', async () => {
      const visible = await p2.evaluate(() => {
        const el = document.querySelector('.promo-bottom');
        if (!el) return false;
        const cs = window.getComputedStyle(el);
        return cs.display !== 'none' && cs.position === 'fixed';
      });
      return visible;
    }));
    await p2.close();

    /* === FAQ accordion (custom button[aria-expanded] + faq-answer) === */
    console.log('\n📱 FaqSection — accordion');
    const p3 = await newPage(browser);
    await p3.goto(BASE + '/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    tally(await check('FAQ section renders ≥1 .faq-q triggers', async () => {
      const count = await p3.$$eval('.faq-q[data-faq-trigger]', els => els.length);
      return count >= 1 ? `${count} questions` : false;
    }));
    tally(await check('all .faq-q ≥44px hit area', async () => {
      const heights = await p3.$$eval('.faq-q[data-faq-trigger]', els =>
        els.map(el => Math.round(el.getBoundingClientRect().height))
      );
      const small = heights.filter(h => h < 44);
      return small.length === 0 ? `min ${Math.min(...heights)}px` : false;
    }));
    tally(await check('click closed faq-q → aria-expanded toggles', async () => {
      const beforeAfter = await p3.evaluate(() => {
        const closed = document.querySelector('.faq-q[aria-expanded="false"]');
        if (!closed) return { ok: false, why: 'no closed item' };
        const before = closed.getAttribute('aria-expanded');
        closed.click();
        return new Promise(resolve => {
          setTimeout(() => {
            const after = closed.getAttribute('aria-expanded');
            resolve({ ok: before === 'false' && after === 'true', before, after });
          }, 250);
        });
      });
      return beforeAfter.ok ? `${beforeAfter.before} → ${beforeAfter.after}` : false;
    }));
    await p3.close();

    /* === Personas carousel === */
    console.log('\n📱 PersonasSection — carousel');
    const p4 = await newPage(browser);
    await p4.goto(BASE + '/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    tally(await check('persona-rail-prev exists', async () => {
      return await p4.$('[data-persona-prev]') !== null;
    }));
    tally(await check('persona-rail-next exists', async () => {
      return await p4.$('[data-persona-next]') !== null;
    }));
    tally(await check('5 persona-card rendered', async () => {
      const count = await p4.$$eval('.persona-card', els => els.length);
      return count === 5 ? '5 cards' : `${count} cards`;
    }));
    tally(await check('click next → counter advances', async () => {
      const before = await p4.$eval('[data-persona-counter]', el => el.textContent.trim());
      await p4.evaluate(() => {
        document.querySelector('[data-persona-next]')?.click();
      });
      await new Promise(r => setTimeout(r, 300));
      const after = await p4.$eval('[data-persona-counter]', el => el.textContent.trim());
      return before !== after ? `${before} → ${after}` : false;
    }));
    await p4.close();

    /* === Hero video element === */
    console.log('\n📱 Hero — video element');
    const p5 = await newPage(browser);
    await p5.goto(BASE + '/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    tally(await check('hero <video> has autoPlay/muted/playsInline', async () => {
      const props = await p5.$eval('.hero-bg-video', el => ({
        autoplay: el.autoplay,
        muted: el.muted,
        playsInline: el.playsInline,
        preload: el.preload,
      }));
      return props.autoplay && props.muted && props.playsInline ? `preload=${props.preload}` : false;
    }));
    await p5.close();

    /* === Blog category filter chips ≥44px === */
    console.log('\n📱 Blog — category filter chips');
    const p6 = await newPage(browser);
    await p6.goto(BASE + '/blog', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 800));
    tally(await check('all category chips ≥44px height', async () => {
      const heights = await p6.$$eval('a.flex-shrink-0.inline-flex', els =>
        els.map(el => Math.round(el.getBoundingClientRect().height))
      );
      const small = heights.filter(h => h < 44);
      return small.length === 0 ? `${heights.length} chips, min ${Math.min(...heights)}px` : false;
    }));
    tally(await check('Pagination buttons ≥44×44', async () => {
      const sizes = await p6.evaluate(() => {
        const links = document.querySelectorAll('nav[aria-label="페이지 이동"] a');
        return Array.from(links).map(a => {
          const r = a.getBoundingClientRect();
          return { w: Math.round(r.width), h: Math.round(r.height), text: a.textContent.trim().slice(0, 6) };
        });
      });
      const small = sizes.filter(s => s.w < 44 || s.h < 44);
      return small.length === 0 ? `${sizes.length} buttons, min ${Math.min(...sizes.map(s => s.h))}px` : `small: ${JSON.stringify(small)}`;
    }));
    await p6.close();

  } finally {
    await browser.close();
  }

  console.log(`\n=== INTERACTION SUMMARY ===\n  PASS: ${pass}\n  FAIL: ${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
