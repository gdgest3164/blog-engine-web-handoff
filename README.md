# Blog Engine — Web Handoff (다른 AI 웹 개발자에게 전달)

> **이 문서 1쪽 = Hard Invariants. 위반 시 PR reject.**
>
> Plan: `/root/.claude/plans/refactored-tickling-scott.md`
> 검증 환경: `tools/web-validator/` (docker-compose 패키지)
> 디자인 토큰: `tools/web-design-tokens/` (Tailwind plugin + ESLint rule)
> 자가 체크리스트: `docs/02-design/blog-engine-web-PR-checklist.md`

---

## 1쪽 Hard Invariants (위반 시 PR 자동 reject)

| # | 규칙 | 강제 |
|---|---|---|
| 1 | Design Token 외 임의값 (색상/spacing/font/shadow/radius) 금지 | ESLint `design-tokens/no-arbitrary-values` 빌드 fail |
| 2 | WCAG 2.2 Level AA 미달 | axe-core violation 0 강제 (`npm run a11y`) |
| 3 | User Journey E2E 미통과 | Playwright 시나리오 100% (Owner Onboarding < 5분 등) |
| 4 | 빈상태 / 로딩 / 에러 3종 화면 미구현 | Visual Regression 5장 캡처 (`@visual` 태그) |
| 5 | Owner ↔ Client UI 동일 컴포넌트 재사용 | 정보 밀도/타깃 디바이스 명시적 차별화 |
| 6 | Visual Approval 게이트 누락 | 페이지 첫 PR: PC/모바일/빈/로딩/에러 5장 자동 첨부 |
| 7 | AI Slop 패턴 사용 | Anti-Pattern Gallery 위반 (자동 detect) |
| 8 | Lighthouse 미달 | A11y 90+ / Best Practices 90+ / Performance 80+ / SEO 90+ |
| 9 | Dead Click 존재 | 클릭 후 시각/URL/DOM 변화 없는 버튼 0 |
| 10 | Client 페이지 노출 금지 항목 누출 | agent_decisions / blueprints / KB / 모델명 / 비용 / 토큰 / 단계명 일체 |

---

## 2. 인증 / 권한 (2-tier)

**Supabase Auth** + RLS:

| Role | 권한 | 페이지 |
|---|---|---|
| **owner** (사용자 본인) | 모든 client/blueprint/agent_decisions/KB read+write | `/owner/*` |
| **client** (고객사) | 자기 `viral_client_id` 의 `blog_contents` + `blog_rank_snapshots` read-only | `/client/*` |

RLS 정책 (PR 10 마이그 07):
- owner: `auth.uid() = viral_clients.owner_user_id` → 모든 row
- client: `auth.uid() = viral_clients.client_user_id` → own viral_client_id 만

미들웨어:
- owner 페이지: admin-api 가 service_role + owner 검증
- client 페이지: anon key + RLS (백엔드 검증 불필요, RLS 가 강제)

---

## 3. 통신 채널 — Supabase 가 단일 진입점 (admin-api 외부 노출 X)

### Schema 분리 (중요)
- 신규 테이블: **`blog_engine`** 스키마 (`agent_decisions`, `post_blueprints`, `blog_profiles`, `compliance_findings`, `plagiarism_checks`, `post_assets`, `post_images` 등)
- SaaS master: **`virin`** 스키마 그대로 (`viral_clients`, `blog_contents`, `blog_rank_snapshots`)
- Supabase Dashboard > API > Settings 의 "Exposed schemas" 에 **`blog_engine`** 추가 필수 (1회 수동)
- 클라이언트 호출:
  ```ts
  // 신규 테이블
  supabase.schema('blog_engine').from('post_blueprints').select(...)
  // SaaS master
  supabase.schema('virin').from('viral_clients').select(...)
  ```


> ⚠️ **중요**: Virin 백엔드 서버 (admin-api :7317) 는 **외부 노출되지 않음**. 웹 개발 환경에서 직접 HTTP 호출 불가능.
> → 양쪽 모두 Supabase 만 본다. Supabase 가 메시지 버스 + 데이터 저장 + 인증 + Storage 단일 채널.

| 작업 | 방법 |
|---|---|
| 일반 SELECT (대시보드 조회) | Supabase 직접 (anon key + RLS) — 클라이언트 페이지 / Owner BFF는 service_role |
| Storage 파일 업로드 | Supabase Storage `createSignedUploadUrl` 직접 — admin-api 불필요 |
| 자동화 트리거 (Onboarding 완료 → Strategy Lead 큐잉 등) | Supabase 테이블 INSERT/UPDATE → **Virin worker 가 3초 polling 으로 픽업** |
| KB 가설 승격 (proposed → validated) | Supabase UPDATE 직접 (RLS owner 검증) — 또는 Supabase RPC Function |
| Approval Queue 처리 | Supabase UPDATE 직접 (`approval_queue.status='approved'` → Virin worker 가 polling) |
| 복잡 비즈니스 로직 (사용자 인증 + atomic 갱신) | **Supabase Edge Function** — TypeScript Deno 함수, 양쪽에서 호출 가능 |
| 실시간 진행 표시 | Supabase Realtime 구독 (`post_jobs` 테이블 subscribe) |

### 통신 패턴 (예시)

**Owner: 신규 Blueprint 발행 의뢰**
```
1. Web → Supabase: INSERT INTO post_blueprints (...) RETURNING id
2. Web → Supabase: INSERT INTO post_jobs (blueprint_id, status='pending')
3. Virin worker (백엔드): 3초마다 SELECT * FROM post_jobs WHERE status='pending' (이미 패턴 정립)
4. Virin worker: 18 에이전트 파이프 실행 → post_jobs.status / current_agent 갱신
5. Web: Supabase Realtime 구독 → UI 진행 표시 갱신 (단계명은 추상 라벨로 변환)
```

**Client: 자기 글 순위 조회**
```
1. Web → Supabase: SELECT FROM blog_contents WHERE viral_client_id=auth.uid()'s viral_client (RLS 자동)
2. Web → Supabase: SELECT FROM blog_rank_snapshots WHERE content_id IN (...)
3. RLS 가 owner_user_id != auth.uid() AND client_user_id != auth.uid() row 자동 차단
```

**이미지 업로드**
```
1. Web → Supabase Storage: createSignedUploadUrl('post-assets/{viral_client_id}/{uuid}')
2. Web (브라우저): 직접 PUT 업로드
3. Web → Supabase: INSERT INTO post_assets (storage_path, sha256, ...)
4. Virin worker: post_assets row 감지 → 발행 시 활용
```

→ **admin-api 호출 0건**. 통신 단절 환경에서도 양쪽 동작.

---

## 4. Owner 페이지 명세

### 정보 밀도: **높음** (대시보드 패턴) | 타깃: **PC** (1280px+) | 색조: **중성 (회색조)**

| 페이지 | 핵심 |
|---|---|
| **Client Onboarding 인터뷰 폼** (`/owner/clients/{id}/intake`) | `client_intake` 테이블. Curator follow-up 인라인. 미완료 client = 발행 비활성 |
| **PostBlueprint 입력 폼** (`/owner/blueprints/new`) | manual/auto/partial 토글. 모든 필드 (risk_level/approval_required/min_*_score). 좌 sidebar = 18 에이전트 진행, 중앙 = 폼 sectioned, 우 = Live Quality Score |
| **이미지 입력 영역** | 3 source 모드: ai_generated (컷별 prompt) / client_uploaded (드래그&드롭) / mixed |
| **Asset Library** (`/owner/assets`) | post_assets, viral_client별, 재사용 가능 |
| **Approval Queue** (`/owner/approvals`) | risk_level=HIGH 글 승인/거부/수정요청. 24h 미승인 자동 보류 표시 |
| **Quality Score / Anti-Hallucination 패널** (글 상세) | 글당 5겹 통과율, 거부된 claim 목록, 치환 사유 |
| **Compliance Findings** (글 상세) | 위반 항목, LLM 맥락 판정 사유, 제안 수정안. owner override |
| **SERP Analysis 뷰어** (`/owner/serp/{keyword}`) | 1페이지 분석 + topic gaps 제안 |
| **Blog Stage 패널** (`/owner/blogs/{id}`) | NEW/PRE_DIA/POST_DIA/MATURE/PENALIZED + 권위 추정 + 다음 진단일 + stage 전환 히스토리. PRE_DIA = 12주 마이그 진행률 |
| **Pacing Calendar** (`/owner/calendar`) | 클라이언트별 주간 발행 + 클러스터 비율 |
| **Budget Dashboard** (`/owner/budget`) | client별 월 사용액/예산/80%·100% 알람 |
| **post_jobs 모니터링** | status / current_agent / attempts / agent_decisions 타임라인 (디버그) |
| **KB 검토** (`/owner/kb`) | 가설 proposed → validated 승격 게이트 |
| **실험 결과** (`/owner/experiments`) | experiment_results |

---

## 5. Client 페이지 명세 ⚠️ 노출 금지 항목 명시

### 정보 밀도: **낮음** (이해 우선) | 타깃: **모바일 우선** (390px) | 색조: **따뜻함 (브랜드 컬러)**

### ✅ 노출 OK
- 내 블로그 글 리스트 (`blog_contents`, `viral_client_id` 필터)
- 키워드별 순위 추이 그래프 (`blog_rank_snapshots`, +1d/+3d/+7d/+14d/+30d/weekly)
- 통합검색 1페이지 진입 여부, 인덱싱 상태
- 주간 리포트 (`seo_reports.scope='weekly'`)

### ❌ 절대 노출 금지 (강제)
- `agent_decisions` / `post_blueprints` / `seo_algorithm_hypotheses` / `compliance_findings` / `plagiarism_checks` 일체
- 모델명 / 파이프라인 단계명 / 비용 / 토큰 / 캐시 히트율
- post_jobs.current_agent (구체 에이전트명) — 노출 시 progress bar **0~100% + 추상 라벨 ("준비 중", "분석 중", "발행 준비") 만**
- KB 가설 / SERP 분석 / Quality Score 내부값

이유: 내부 로직 노출 = 경쟁사 복제. (Plan §피드백 강제)

---

## 6. Owner vs Client UI 차별화 (명시 표 — 동일 컴포넌트 재사용 금지)

| 항목 | Owner | Client |
|---|---|---|
| 타깃 디바이스 | PC 우선 (1280px+) | **모바일 우선 (390px)** |
| 정보 밀도 | 높음 (대시보드) | 낮음 (이해하기 쉬움) |
| 시각화 | 데이터 테이블 + 필터 + 정렬 | 차트 우선, 테이블 최소화 |
| 액션 | 키보드 단축키 + bulk 가능 | 1-3 클릭 안에 핵심 정보 |
| 빈 상태 | 다음 액션 명시 ("client 추가하기") | "조금만 기다려주세요" 톤 (안심) |
| 색조 | 중성 (`neutral-*` 위주) | 따뜻함 (브랜드 컬러 강조) |
| 로딩 | skeleton + percent 진행 | spinner + 안심 메시지 |
| 에러 | 상세 + 재시도 버튼 | "잠시 후 다시" + 운영자 자동 알림 |

---

## 7. Owner 핵심 페이지 텍스트 와이어프레임 (5개)

### 7-1. Owner > Blueprint Editor (`/owner/blueprints/new`) — PC 1280px+

```
┌──────────────────────────────────────────────────────────────────────┐
│ Header: client 선택 dropdown │ Save Draft │ Submit                  │
├────────────┬─────────────────────────────────┬──────────────────────┤
│ Sidebar    │ Tabs: 본문 / 이미지 / 키워드 / │ Live Preview         │
│ 18-agent   │       리스크 / 페이싱           │ ▸ Quality Score: --  │
│ progress   │ ┌─────────────────────────────┐ │ ▸ Anti-Halluc:   --  │
│ ▢ Strategy│ │ Section: 본문 구조           │ │ ▸ Compliance:    --  │
│ ▢ Hunter   │ │  word_count: [1200]-[2500] │ │ ▸ Plagiarism:    --  │
│ ▢ Architect│ │  intro_style: ◉problem      │ │                      │
│ ▢ Writer   │ │              ○story...      │ │ Stage policy applied:│
│ ▢ Auditor  │ │  paragraph_count: [12]     │ │  NEW (1200~1800자)   │
│ ▢ Image    │ └─────────────────────────────┘ │  override: 없음       │
│ ▢ Publisher│ Section: 키워드 / 이미지 / ...   │                      │
├────────────┴─────────────────────────────────┴──────────────────────┤
│ Sticky bottom: fill_mode (manual/auto/partial) │ 검증 / 제출       │
└──────────────────────────────────────────────────────────────────────┘
```

### 7-2. Owner > Approval Queue (`/owner/approvals`) — PC

```
┌──────────────────────────────────────────────────────────────────────┐
│ Filter: [risk_level ▾] [client ▾] [status ▾]    Auto-hold: 2 (24h+) │
├──────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────────────────────────────────┐│
│ │ #1234 │ HIGH │ 디데이성형외과 │ "양악수술 회복기간"            ││
│ │ Anti-Halluc 92 | Compliance: 1 warn | Plagiarism pass            ││
│ │                              [Preview] [Approve] [Changes] [✗]   ││
│ ├──────────────────────────────────────────────────────────────────┤│
│ │ #1233 │ MED  │ ...                                                ││
│ └──────────────────────────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────┘
```

### 7-3. Owner > Blog Stage 패널 (`/owner/blogs/{id}`) — PC

```
┌──────────────────────────────────────────────────────────────────────┐
│ ddayps1                          Stage: PRE_DIA  Authority: 52      │
│ Founded: 2018-03 | Posts: 432 | Last 30d: 14                        │
├──────────────────────────────────────────────────────────────────────┤
│ Migration Plan (12주)                                                │
│  Week 1-4 [메타정리]  ████████░░ 80%                                │
│  Week 5-8 [신규는 신기준]  ░░░░░░░░░░ 0%                            │
│  Week 9-12 [옛글 리뉴얼]  ░░░░░░░░░░ 0%                             │
├──────────────────────────────────────────────────────────────────────┤
│ Stage Transitions                                                    │
│  2026-04-01  NEW → PRE_DIA   (auto, abuse=none)                     │
│  2026-04-15  ack by owner                                            │
├──────────────────────────────────────────────────────────────────────┤
│ Stage Policy Override                                                │
│  word_count: [stage default 1800-2500] [override ▢]                  │
│  kw_density: [1.2%]                    [override ▢]                  │
└──────────────────────────────────────────────────────────────────────┘
```

### 7-4. Client > 내 블로그 글 순위 (`/client/posts`) — 모바일 390px

```
┌────────────────────────┐
│ 디데이성형외과         │
│ ▾ 최근 30일 ▾          │
├────────────────────────┤
│ ✅ 1페이지 진입: 12편   │
│ 🟡 인덱싱 대기: 3편    │
│ 📈 평균 순위: 17위 ↑   │
├────────────────────────┤
│ 글 1  "양악수술 비용"  │
│ ─── 차트 ───           │
│ 통합 8위 ▸ 그래프 ▾    │
├────────────────────────┤
│ 글 2  ...              │
└────────────────────────┘
```

### 7-5. Client > 주간 리포트 (`/client/reports/weekly`) — 모바일

```
┌────────────────────────┐
│ 5월 1주 리포트         │
│                        │
│ 📊 발행 5편            │
│ 🎯 1페이지 12편 (+2)   │
│ 📈 평균 순위 17위↑     │
│                        │
│ ─ 가장 잘된 글 ─       │
│ "양악수술 비용" 8위    │
│                        │
│ [상세 보기]            │
└────────────────────────┘
```

---

## 8. User Journey 합격 기준 (정량)

| Journey | 시간 | 클릭 | a11y |
|---|---|---|---|
| Owner: 신규 client 등록 → Onboarding 완료 | < 5분 | < 30 | 키보드 가능 |
| Owner: 1편 발행 (manual blueprint → publish) | < 10분 | < 50 | 키보드 가능 |
| Owner: Approval Queue 1건 처리 | < 30초 | 3 | 키보드 가능 |
| Client: 로그인 → 내 글 순위 확인 | < 30초 | 2 | 모바일 우선 |
| Client: 주간 리포트 열람 | < 1분 | 3 | 모바일 우선 |

미달 = Playwright fail = PR reject.

---

## 9. Supabase Storage 업로드 흐름

### admin-api 신규 엔드포인트

```
POST /api/blog-engine/assets/sign-upload
Body: { viral_client_id, mime, byte_size }
Resp: { signed_url, asset_id, storage_bucket, storage_path, expires_at }
```

```
POST /api/blog-engine/assets/:id/finalize
Body: { sha256, width, height, original_filename }
Resp: { asset_id, public_url, retention_until }
```

- 화이트리스트 mime: `image/jpeg | image/png | image/webp`
- 최대 10MB (config 가능)
- 미사용 자산 retention: 30일 (cron 정리)

---

## 10. AI Slop Anti-Pattern Gallery (절대 금지)

| 금지 패턴 | 이유 | 대안 |
|---|---|---|
| 무의미한 그라디언트 hero | "AI가 만든 거" 즉시 들킴 | 단색 배경 + 명확한 카피 |
| 모든 카드에 lucide icon | 정보 없는 장식 | 의미 있는 곳만 |
| 통계 4개 그리드 (실데이터 무관) | 가짜 대시보드 | 실제 KPI 만 |
| "Welcome to {Service}" | 무의미 헤딩 | 사용자 다음 액션 명시 |
| 글래스모피즘 / neumorphism 남용 | 트렌드 카피 | 명확한 위계 |
| 모든 버튼 primary 컬러 | 위계 부재 | primary 1개, secondary 회색 |
| 색 5개 이상 동시 | 시각 혼란 | 토큰 12개 한정 |
| 의미 없는 emoji 도배 | 신뢰성 저하 | 절제 |
| 무한 스크롤 hero with parallax | a11y/성능 자살 | 정적 hero |
| `<div>` 클릭 (button 아님) | 키보드/스크린리더 미동작 | `<button>` 사용 |
| placeholder 만 있는 폼 라벨 | a11y 실패 | `<label>` 명시 |
| 색만으로 정보 전달 | 색맹 사용자 차별 | 색 + 아이콘/텍스트 동시 |

---

## 11. 에러 처리 / 빈 상태 / 로딩

각 페이지마다 **3종 화면 필수 구현** — Visual Regression 캡처:

| 상태 | Owner | Client |
|---|---|---|
| 로딩 | skeleton + percent | spinner + "불러오는 중..." |
| 빈 | "다음 액션 명시" + CTA | "조금만 기다려주세요" + 안심 |
| 에러 | 상세 + 재시도 | "잠시 후 다시" + 운영자 알림 자동 |

이미지 QA fail 재시도 UX (Owner): 재시도 트리거 + max_attempt 표시 + Visual Strategist 가 cut 변경 결정 시 owner 알림.

---

## 12. 체크리스트 (PR 올리기 전 자가 검증)

→ `docs/02-design/blog-engine-web-PR-checklist.md` 참조 (별도 문서, 간단한 항목별 체크).

---

## 참조

- Plan: `/root/.claude/plans/refactored-tickling-scott.md`
- Backend SPEC: `/root/virin/packages/blog-engine/SPEC.md`
- 검증 환경: `/root/virin/tools/web-validator/`
- 디자인 토큰: `/root/virin/tools/web-design-tokens/`
