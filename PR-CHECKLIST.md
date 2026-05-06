# Blog Engine Web — PR 자가 체크리스트

PR 올리기 전 본인이 모두 ✅ 표시. 1개라도 미달이면 PR 자체 올리지 말 것.

→ Owner (사용자 본인) 가 PR 받으면 이 체크리스트 1순위로 검증. ❌ 발견 시 즉시 reject.

---

## 1. 검증 환경 (`tools/web-validator/`)

- [ ] `docker compose up` 한 번 실행
- [ ] `npm run validate` 의 모든 항목 통과 (e2e + a11y + lighthouse + visual + dead-click)
- [ ] `./reports/` 에 결과 첨부 (PR 본문에 링크)

## 2. Hard Invariants

- [ ] **Design Token 외 임의값 0건** — `text-[#...]`, `p-[Npx]`, 인라인 style 색/간격/폰트 모두 사용 안 함
- [ ] **WCAG 2.2 Level AA violation 0** — `npm run a11y` 통과
- [ ] **Lighthouse 모두 통과** — A11y 90+ / Best Practices 90+ / Performance 80+ / SEO 90+
- [ ] **Dead Click 0건** — 클릭 후 시각/URL/DOM 변화 없는 버튼 없음
- [ ] **빈 상태 / 로딩 / 에러 3종 화면 구현** — 변경된 모든 페이지에 대해

## 3. User Journey (Playwright `@owner` / `@client` / `@journey-*`)

- [ ] Owner: 신규 client 등록 → Onboarding 완료 < 5분 / 30클릭 / 키보드 가능
- [ ] Owner: 1편 발행 (manual blueprint → publish) < 10분 / 50클릭
- [ ] Owner: Approval Queue 1건 처리 < 30초 / 3클릭
- [ ] Client: 로그인 → 내 글 순위 < 30초 / 2클릭 / 모바일 우선
- [ ] Client: 주간 리포트 < 1분 / 3클릭

## 4. Owner ↔ Client UI 차별화

- [ ] 동일 컴포넌트 양쪽 재사용 0건
- [ ] Owner = PC 1280px+, 정보 밀도 높음, 데이터 테이블, 키보드 단축키
- [ ] Client = 모바일 390px 우선, 정보 밀도 낮음, 차트, 1-3 클릭

## 5. Client 페이지 노출 금지 항목 — **누출 시 즉시 PR reject**

- [ ] `agent_decisions` row 일체 노출 0
- [ ] `post_blueprints` 노출 0
- [ ] `seo_algorithm_hypotheses` 노출 0
- [ ] `compliance_findings` / `plagiarism_checks` 노출 0
- [ ] 모델명 (claude-sonnet-4-5 등) 노출 0
- [ ] 파이프라인 단계명 (Strategy Lead 등) 노출 0
- [ ] 비용 / 토큰 / 캐시 히트율 노출 0
- [ ] post_jobs.current_agent 구체값 노출 0 (progress 0~100% + 추상 라벨만)

## 6. Visual Approval (페이지 신규 PR 만)

- [ ] PC 캡처 첨부
- [ ] 모바일 캡처 첨부
- [ ] 빈 상태 캡처 첨부
- [ ] 로딩 캡처 첨부
- [ ] 에러 캡처 첨부

## 7. AI Slop 자가 검사 (Anti-Pattern Gallery)

- [ ] 무의미한 그라디언트 hero ❌
- [ ] 모든 카드에 lucide icon ❌
- [ ] 통계 4개 그리드 (실데이터 무관) ❌
- [ ] "Welcome to {Service}" 헤딩 ❌
- [ ] 글래스모피즘 / neumorphism 남용 ❌
- [ ] 모든 버튼 primary 컬러 ❌
- [ ] 색 5개 이상 동시 사용 ❌
- [ ] 의미 없는 emoji 도배 ❌
- [ ] 무한 스크롤 hero with parallax ❌
- [ ] `<div>` 로 클릭 처리 (button 아님) ❌
- [ ] placeholder 만 있고 `<label>` 없음 ❌
- [ ] 색만으로 정보 전달 (색맹 차별) ❌

## 8. Storage 업로드 (이미지 업로드 PR 만)

- [ ] admin-api `POST /api/blog-engine/assets/sign-upload` 호출 패턴 사용
- [ ] mime whitelist: `image/jpeg | image/png | image/webp` 만
- [ ] byte_size 10MB 이하
- [ ] finalize 단계에서 sha256 / width / height 검증

## 9. 인증 / RLS

- [ ] Owner 페이지: admin-api 미들웨어 owner 검증 통과
- [ ] Client 페이지: anon key + RLS 만 (백엔드 미들웨어 의존 X)
- [ ] 다른 client 데이터 누출 0 (RLS 동작 E2E 검증)

## 10. 문서 / PR 본문

- [ ] PR 본문에 변경 페이지 목록
- [ ] PR 본문에 `./reports/` 결과 링크
- [ ] PR 본문에 5장 캡처 (페이지 신규 PR 만)
- [ ] CHANGELOG 또는 release notes 업데이트

---

## 통과 기준

10개 섹션 모두 통과 + Visual Approval 5장 첨부 (페이지 신규) → PR 가능.

미달 시 — PR 올리지 말고 본인이 수정. owner 가 reject 하기 전에 본인 1차 통과.

---

## 참조

- Plan: `/root/.claude/plans/refactored-tickling-scott.md`
- Web Handoff: `docs/02-design/blog-engine-web-handoff.md`
- Validator: `tools/web-validator/`
- Tokens: `tools/web-design-tokens/`
