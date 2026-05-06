/**
 * Dead Click Detector — 클릭한 버튼이 시각/URL/DOM 변화 없으면 violation.
 *
 * AI 웹 개발자가 "동작은 되는데 피드백 없음" 패턴 자주 만들기 때문에 추가.
 *
 * 사용:
 *   TARGET_URL=https://... node dead-click-detector.mjs
 *
 * 페이지 목록 환경변수 PAGES 또는 ./pages.json.
 */
import { chromium } from '@playwright/test';
import { promises as fs } from 'node:fs';

const BASE = process.env.TARGET_URL ?? 'http://localhost:3000';
const REPORT = './reports/dead-click.json';

async function loadPages() {
  if (process.env.PAGES) return process.env.PAGES.split(',');
  try {
    const text = await fs.readFile('./pages.json', 'utf8');
    return JSON.parse(text);
  } catch {
    return ['/'];
  }
}

async function pageSnapshot(page) {
  return {
    url: page.url(),
    title: await page.title(),
    domSize: (await page.content()).length,
    visibleText: (await page.locator('body').innerText()).slice(0, 5000),
  };
}

async function main() {
  const pages = await loadPages();
  const browser = await chromium.launch();
  const ctx = await browser.newContext();
  const dead = [];

  for (const path of pages) {
    const page = await ctx.newPage();
    await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });

    // 모든 클릭 가능한 요소 (button, a, role=button, [data-testid]) — disabled 제외
    const handles = await page
      .locator('button:not([disabled]), a[href]:not([aria-disabled="true"]), [role="button"]:not([aria-disabled="true"])')
      .elementHandles();

    for (let i = 0; i < Math.min(handles.length, 50); i++) {
      const h = handles[i];
      const text = (await h.textContent())?.trim().slice(0, 30) ?? `el[${i}]`;
      try {
        const before = await pageSnapshot(page);
        await h.click({ trial: false, timeout: 3000 });
        await page.waitForTimeout(500);
        const after = await pageSnapshot(page);

        const urlChanged = before.url !== after.url;
        const titleChanged = before.title !== after.title;
        const domChanged = Math.abs(before.domSize - after.domSize) > 50;
        const textChanged = before.visibleText !== after.visibleText;

        if (!urlChanged && !titleChanged && !domChanged && !textChanged) {
          dead.push({ page: path, element: text });
          console.error(`💀 dead click on ${path}: "${text}"`);
        }

        // 페이지 변경 시 원래 페이지로 복귀
        if (urlChanged) {
          await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
        }
      } catch {
        // 클릭 실패는 dead 와 별개 (모달 가림 등) — 무시
      }
    }

    await page.close();
  }
  await browser.close();

  await fs.mkdir('./reports', { recursive: true });
  await fs.writeFile(REPORT, JSON.stringify({ base: BASE, dead }, null, 2));

  if (dead.length > 0) {
    console.error(`\n🚫 Dead Click ${dead.length}건. 리포트: ${REPORT}`);
    process.exit(1);
  }
  console.log(`\n✅ Dead Click 0건`);
}

main().catch((err) => {
  console.error(err);
  process.exit(2);
});
