/**
 * axe-core a11y 검사 — WCAG 2.2 Level AA.
 *
 * 사용:
 *   TARGET_URL=https://... node run-axe.mjs
 *
 * violation 0 강제 (web-handoff.md Hard Invariants).
 *
 * 검사 페이지 목록은 환경변수 PAGES 또는 ./pages.json.
 */
import { chromium } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { promises as fs } from 'node:fs';

const BASE = process.env.TARGET_URL ?? 'http://localhost:3000';
const REPORT = './reports/axe.json';

async function loadPages() {
  if (process.env.PAGES) return process.env.PAGES.split(',');
  try {
    const text = await fs.readFile('./pages.json', 'utf8');
    return JSON.parse(text);
  } catch {
    return ['/']; // default
  }
}

async function main() {
  const pages = await loadPages();
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const allViolations = [];

  for (const path of pages) {
    const page = await ctx.newPage();
    const url = `${BASE}${path}`;
    await page.goto(url, { waitUntil: 'networkidle' });
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .analyze();

    if (results.violations.length > 0) {
      allViolations.push({ url, violations: results.violations });
      console.error(`❌ ${url}: ${results.violations.length} violation(s)`);
      for (const v of results.violations) {
        console.error(`  - [${v.impact}] ${v.id}: ${v.description} (${v.nodes.length} node)`);
      }
    } else {
      console.log(`✓ ${url}`);
    }
    await page.close();
  }
  await browser.close();

  await fs.mkdir('./reports', { recursive: true });
  await fs.writeFile(REPORT, JSON.stringify({ base: BASE, results: allViolations }, null, 2));

  if (allViolations.length > 0) {
    console.error(`\n🚫 a11y 검사 실패 — WCAG 2.2 AA 위반 ${allViolations.reduce((s, r) => s + r.violations.length, 0)}건. 리포트: ${REPORT}`);
    process.exit(1);
  }
  console.log(`\n✅ a11y 통과 — 모든 페이지 WCAG 2.2 AA 통과`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
