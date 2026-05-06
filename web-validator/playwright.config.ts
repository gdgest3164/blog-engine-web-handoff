/**
 * Playwright 설정 — Blog Engine Web Validator.
 *
 * - Owner 시나리오: PC viewport (1280×800) + 키보드 네비
 * - Client 시나리오: 모바일 viewport (390×844) — 모바일 우선 강제
 * - User Journey 합격 기준 (web-handoff.md):
 *     Owner Onboarding < 5분 / 30클릭 / 키보드 가능
 *     Client 로그인→내 글 순위 < 30초 / 2클릭 / 모바일 우선
 *     Approval Queue 처리 1건 < 30초 / 3클릭
 */
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  fullyParallel: false,             // User Journey 는 순차 (단일 owner 계정)
  retries: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/playwright', open: 'never' }],
    ['json', { outputFile: 'reports/playwright.json' }],
  ],
  use: {
    baseURL: process.env.TARGET_URL ?? 'http://localhost:3000',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'owner-pc',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
      grep: /@owner|@journey-owner/,
    },
    {
      name: 'client-mobile',
      use: { ...devices['Pixel 7'] },
      grep: /@client|@journey-client/,
    },
    {
      name: 'visual',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } },
      grep: /@visual/,
    },
  ],
});
