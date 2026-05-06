/**
 * Lighthouse CI 설정 — Blog Engine 통과 기준.
 *
 * 임계 (web-handoff.md):
 *   - Accessibility: 90+
 *   - Best Practices: 90+
 *   - Performance: 80+
 *   - SEO: 90+
 */
module.exports = {
  ci: {
    collect: {
      url: process.env.LH_URLS
        ? process.env.LH_URLS.split(',')
        : [process.env.TARGET_URL ?? 'http://localhost:3000'],
      numberOfRuns: 2,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox',
      },
    },
    assert: {
      assertions: {
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:performance': ['error', { minScore: 0.8 }],
        'categories:seo': ['error', { minScore: 0.9 }],
      },
    },
    upload: { target: 'filesystem', outputDir: './reports/lighthouse' },
  },
};
