# Blog Engine Web Validator

다른 AI 웹 개발자에게 **가이드 + 검증 환경 + 토큰 패키지**를 함께 전달하여 환경 차이 변명 불가.

## 가져가서 쓰는 법 (다른 레포)

```bash
cp -r tools/web-validator <your-web-repo>/web-validator
cd <your-web-repo>/web-validator

# 환경 변수
cat > .env <<EOF
TARGET_URL=http://localhost:3000
OWNER_TEST_USER_EMAIL=...
OWNER_TEST_USER_PASSWORD=...
CLIENT_TEST_USER_EMAIL=...
CLIENT_TEST_USER_PASSWORD=...
EOF

# 검증 페이지 목록
cat > pages.json <<EOF
["/", "/login", "/owner/clients", "/owner/blueprint", "/client/posts"]
EOF

# 한 번 실행 (docker)
docker compose up

# 또는 npm 직접
npm install
npm run validate
```

## 통과 기준 — 모두 만족 못하면 PR reject

| 검사 | 기준 | 명령 |
|---|---|---|
| **Playwright E2E** | User Journey 시나리오 100%. Owner Onboarding < 5분/30클릭/키보드 가능. Client 내 글 순위 < 30초/2클릭/모바일 우선. Approval 1건 < 30초/3클릭 | `npm run e2e` |
| **axe-core a11y** | WCAG 2.2 Level AA violation 0 | `npm run a11y` |
| **Lighthouse** | Accessibility 90+ / Best Practices 90+ / Performance 80+ / SEO 90+ | `npm run lighthouse` |
| **Visual Regression** | PC/모바일/빈상태/로딩/에러 5장 baseline 일치 | `npm run visual` |
| **Dead Click** | 클릭 후 시각/URL/DOM 변화 없는 버튼 0 | `npm run dead-click` |
| **Token Lint** | Tailwind 임의값 (`text-[#ff0000]` 등) 0 — `tools/web-design-tokens/eslint-rule.cjs` | (별도 패키지) |

## tests/ 디렉토리 구조 (다른 AI 가 만들 시나리오)

```
tests/
├── owner/
│   ├── onboarding.spec.ts        @owner @journey-owner
│   ├── blueprint-editor.spec.ts  @owner
│   ├── approval-queue.spec.ts    @owner
│   ├── upload-image.spec.ts      @owner
│   └── kb-review.spec.ts         @owner
├── client/
│   ├── login.spec.ts             @client @journey-client
│   ├── post-list.spec.ts         @client
│   ├── rank-trend.spec.ts        @client
│   └── weekly-report.spec.ts     @client
└── visual/
    ├── owner-pages.spec.ts       @visual
    └── client-pages.spec.ts      @visual
```

각 spec 파일 첫 줄에 `test.describe('...', { tag: '@owner' }, ...)` 등 태그 지정.
샘플 spec 은 다른 AI 웹 개발자가 작성. 본 환경은 실행/검증 인프라만 제공.

## 리포트

`./reports/` 디렉토리:
- `playwright/` — HTML 리포트 + 스크린샷 + 비디오
- `axe.json` — a11y violation 상세
- `lighthouse/` — Lighthouse 점수
- `dead-click.json` — dead click 목록

## 참조

- Plan: `/root/.claude/plans/refactored-tickling-scott.md`
- Web Handoff: `docs/02-design/blog-engine-web-handoff.md`
- Web PR 자가 체크리스트: `docs/02-design/blog-engine-web-PR-checklist.md`
- Design Token: `tools/web-design-tokens/`
