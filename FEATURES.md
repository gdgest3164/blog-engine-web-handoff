# Blog Engine — 기능 카탈로그

다른 AI 웹 개발자 / Owner / Client 가 한눈에 보는 기능 목록. 사용자 관점 (workflow) 정리.

상태 표시: ✅ 코드+DB 완료 (dry-run 통과 직전) / 🟡 골격 완료 / ⏳ 계획만 (후속 PR)

---

## A. 글 생성 (Owner 핵심)

| ID | 기능 | 상태 | 위치 |
|---|---|---|---|
| A1 | **PostBlueprint** 입력 폼 — 글 1편 100% 커스텀 (글자수/문체/키워드밀도/이미지수/위치/role) | ✅ | `blog_engine.post_blueprints` + Zod schema |
| A2 | 3가지 채움 모드: **manual / auto / partial** | ✅ | `blueprint/auto-fill.ts` |
| A3 | **18 에이전트 자동 시퀀스** — Hunter→Architect→Writer↔Auditor→환각방어→Compliance→Plagiarism→Image→QualityScore→Approval→Publisher | ✅ | `apps/worker/src/automations/blog-engine/orchestrator.ts` |
| A4 | 발행 직전 **4중 안전 게이트** (환각/Compliance/표절/QualityScore) | ✅ | governance/* + agents/* |
| A5 | **HIGH risk 글 = Owner 승인 게이트** (24h 미응답 자동 보류) | ✅ | `governance/approval-gate.ts` |
| A6 | 네이버 SE ONE 자동 발행 (영속 프로필 + Vultr Reserved IP 1:1 + 크레딧 검사 자동) | 🟡 | `blog-engine-publisher-worker.ts` (큐 위임 OK / dry-run mode) |

## B. 황금키워드 (이미 운영 중)

| ID | 기능 | 상태 |
|---|---|---|
| B1 | 업종 1개 → AI 8단계 → **TOP 30 키워드** + 제목 3안 + LSI 5개 | ✅ (기존 `collect-golden-keywords.ts`) |
| B2 | 6차원 점수 (검색량/경쟁/주제적합/구조성/롱테일/의도) | ✅ |
| B3 | 클러스터 균형 (한 주제 몰빵 방지) | ✅ |
| B4 | 등급 분류 (Platinum 80+ / Gold 65+ / Silver 50+ / Bronze 35+) | ✅ |
| B5 | Blog Engine 통합 — Hunter agent 가 brief 의도 필터 (타 업종 오염 제거) | ✅ |

## C. 발행글 순위 추적

| ID | 기능 | 상태 |
|---|---|---|
| C1 | **인덱싱 첫 hit 감지** (+6h 자동 측정) | ⏳ Wave 5 PR 8 |
| C2 | 키워드별 **순위 추이** (+1d/+3d/+7d/+14d/+30d/weekly) | ✅ (기존 `seo-rank-check.ts`) |
| C3 | **장기 잔존** 추적 (+90d) | ⏳ Wave 5 |
| C4 | 통합검색 1페이지 진입 여부 + 평균 순위 | ✅ |
| C5 | **SmartBlock 순위 + 인플루언서 collection 순위** | ⏳ |
| C6 | 조회/공감/댓글/체류시간 추정 (engagement) | 🟡 (기존 blog_post_engagement 활용) |
| C7 | **Owner 가 blog 1개씩 토글** 로 추적 켜기 | ✅ (기존 `viral_clients.seo_tracking_enabled`) |
| C8 | 외부 발행글도 **수기 RSS import 자동** (Blog Engine 외부도 추적) | ✅ (기존 Phase 2) |

## D. 블로그 진단 (Blog Profiler)

| ID | 기능 | 상태 |
|---|---|---|
| D1 | **매주 자동 진단 cron** | 🟡 (코드 완료 / cron 등록 PR 23 후속) |
| D2 | **5단계 stage** 자동 분류 (NEW / PRE_DIA / POST_DIA / MATURE / PENALIZED) | ✅ |
| D3 | 권위 점수 추정 (estimated_authority 0~100) | ✅ |
| D4 | 어뷰징 시그널 감지 (폭증 발행 / 갑작스런 패턴 변화) | ✅ |
| D5 | **PRE_DIA → POST_DIA 12주 점진 마이그 plan** | ✅ (코드) / ⏳ (실행 추적) |
| D6 | Stage 전환 시 Owner Slack 알람 + history | ⏳ Wave 5 |
| D7 | Stage 정책 자동 적용 (NEW = 1200~1800자, POST_DIA = 2000~3000자 등) | ✅ |

## E. 알고리즘 학습 (KB)

| ID | 기능 | 상태 |
|---|---|---|
| E1 | C-Rank / D.I.A.+ 비공식 신호 큐레이션 (Algorithm Researcher 주간) | 🟡 (코드 완료, 정기 cron 미등록) |
| E2 | **베이지안 confidence 갱신** (발행 결과로 가설 검증) | 🟡 |
| E3 | validated 가설만 Writer/Auditor system prompt 에 주입 | ✅ |
| E4 | proposed → validated 승격은 **Owner 수동** (자동 승격 X — 환각 방지) | ✅ |

## F. SEO 경쟁사 분석

| ID | 기능 | 상태 |
|---|---|---|
| F1 | 타겟 키워드 1페이지 글 N개 메타 분석 | ⏳ Wave 5 PR 16 |
| F2 | 평균 글자수 / 이미지 수 / H2 패턴 / 엔터티 빈도 | ⏳ |
| F3 | **Topic gap** 추출 (1페이지에 다 빠진 토픽) — Topic Architect 가 차별화 강조 | ⏳ |
| F4 | 검색의도 분류 + intent summary | ⏳ |
| F5 | **본문 직접 입력 금지** — 메타만 활용 (표절·D.I.A.+ 차단) | ✅ (정책) |

## G. 표절 차단 (Plagiarism Detector)

| ID | 기능 | 상태 |
|---|---|---|
| G1 | **임베딩 유사도** (SERP 1~10페이지 corpus 와 cosine 0.85+ 차단) | 🟡 (N-gram 동작 / 임베딩 stub — Wave 3+ 활성) |
| G2 | **N-gram 5~7 단어 일치율** (5%+ 차단) | ✅ |
| G3 | **자기복제** 감지 (같은 client 과거 글과 30%+ 일치 차단 — C-Rank 자기잠식 방지) | ✅ |
| G4 | fail 시 재작성 가이드 자동 생성 | ✅ |

## H. 환각 차단 (5겹 방어)

| ID | 기능 | 상태 |
|---|---|---|
| H1 | **Claim Extractor** — 본문에서 사실 진술 vs 의견 분리 + risk tag (HIGH/MED/LOW) | ✅ |
| H2 | **Source Grounder** — HIGH claim 외부 1차 출처 검증 | ✅ |
| H3 | PubMed / Crossref / 식약처 / 대법원 API 실 호출 | ✅ PubMed/Crossref / 🟡 식약처/대법원 (env 발급 후 활성) |
| H4 | **Banned Pattern** — 무근거 권위 표현 detect ("한 연구에 따르면", "통계적으로", "전문가들은") | ✅ |
| H5 | **Citation Audit** — 인용 논문 DOI/PMID 실존 검증 (가짜 인용 차단) | ✅ |
| H6 | **Anti-Hallucination Score** (0~100) — 임계 미달 발행 거부. HIGH risk = 95+ 강제 | ✅ |
| H7 | rejected claim → 안전 표현 자동 치환 ("전문의 상담 권장" 등) | ✅ |

## I. Compliance (의료광고법 / 표시광고법 / 개인정보 / 저작권)

| ID | 기능 | 상태 |
|---|---|---|
| I1 | **regex 1차 marking** (속도) + **LLM 맥락 2차 판정** (정확도) — false positive 차단 | ✅ |
| I2 | "완벽한 회복" (위반) vs "완벽한 휴식" (안전) ±2문장 맥락 구분 | ✅ |
| I3 | 7개 룰 시드 (의료 효과단정 / 의료기관 비교 / 환자 사진 / 1위 단정 / 허위 할인 / 개인정보 / 저작권 인용) | ✅ |
| I4 | 위반 시 **수정 제안 + 사유** Writer 에게 회신 → 재작성 | ✅ |
| I5 | block / warn / info 3 단계 — block 1개라도 = 발행 차단 | ✅ |
| I6 | Owner 가 룰 추가/조정 가능 (DB 노출) | ✅ |

## J. 이미지 자동화 (Image Pipeline 4 에이전트)

| ID | 기능 | 상태 |
|---|---|---|
| J1 | **Visual Strategist** — outline 보고 컷 수 / role / position 결정 | ✅ |
| J2 | **Prompt Engineer** — GPT-image-1 / Gemini-image 용 prompt 생성 (style/composition/negative_prompt/seed) | ✅ |
| J3 | **Image QA** (Vision LLM) — 본문 맥락 / 텍스트 오타 / 손가락·해부학 / 브랜드 위반 검수 | ✅ |
| J4 | **ALT/Caption Writer** — SEO ALT (125자, primary keyword 포함률) + 본문 캡션 | ✅ |
| J5 | **3 source 모드** — ai_generated / client_uploaded / mixed | ✅ |
| J6 | 고객사 직접 이미지 업로드 (Supabase Storage signed-upload) | 🟡 (admin-api 엔드포인트 PR 25-ext-2) |
| J7 | 자산 라이브러리 (post_assets 재사용 가능, 30일 retention) | ✅ |
| J8 | Image QA fail → Prompt Engineer 재시도 (max 2 → cut 변경 또는 누락) | ✅ |

## K. A/B 실험 프레임워크

| ID | 기능 | 상태 |
|---|---|---|
| K1 | **1회 1축** 만 실험 (title_pattern / intro_style / image_density / kw_density / body_len / lsi_count / toc_block) | ⏳ Wave 5 PR 9 |
| K2 | stratified random 할당 (블로그 권위 편향 제거) | ⏳ |
| K3 | Mann-Whitney U 통계 분석 (alpha 0.05, power 0.8) | ⏳ |
| K4 | 승자 결정 시 KB confidence 자동 갱신 | ⏳ |
| K5 | 최소 N=30/variant × 블로그 5개 | ⏳ |

## L. 운영 거버넌스 (CEO 안전장치)

| ID | 기능 | 상태 |
|---|---|---|
| L1 | **Approval Gate** — HIGH risk 글 Owner 검토 (24h 자동 보류) | ✅ |
| L2 | **Quality Score Aggregator** — SEO + Image QA + Compliance + Anti-Hallucination 4차원 가중 평균 | ✅ |
| L3 | **Pacing Manager** — 콘텐츠 캘린더, C-Rank 주제 일관성 강제 | ⏳ Wave 5 PR 18 |
| L4 | **Keyword Lock** — 30일 동일 키워드 차단 (자기잠식 방지) | ⏳ Wave 5 PR 18 |
| L5 | **Budget Guard** — Client 별 월 예산 한도. 80% 알람 / 100% 자동 일시정지 | ⏳ Wave 5 PR 19 |
| L6 | **AI 일탈 방어 6중** — CLAUDE.md / SPEC.md / ESLint / pre-commit / DB CHECK / Drift Detector / 사용자 OK 게이트 | ✅ |
| L7 | **Drift Detector** 주간 cron (plan vs code 비교, drift 5%+ 시 발행 자동 정지) | 🟡 (코드 완료, cron 미등록) |

## M. 고객사 (Client) 페이지 노출

| ID | 기능 | 노출 | 상태 |
|---|---|---|---|
| M1 | 내 블로그 글 리스트 | ✅ | 데이터 ✅ / UI ⏳ |
| M2 | 키워드별 순위 추이 그래프 (+1d~+30d) | ✅ | 데이터 ✅ / UI ⏳ |
| M3 | 통합검색 1페이지 진입율 | ✅ | 데이터 ✅ / UI ⏳ |
| M4 | 인덱싱 상태 | ✅ | 데이터 ✅ / UI ⏳ |
| M5 | 주간 리포트 | ✅ | ⏳ Wave 5 PR 11 |
| M6 | (절대 노출 금지) agent_decisions / blueprints / KB / 모델명 / 비용 / 토큰 / 단계명 | ❌ | 정책 ✅ |

## N. 운영 대시보드 (Owner — CLI dashboard 패턴)

| ID | 기능 | 상태 |
|---|---|---|
| N1 | **18 에이전트 진행 시각화** (Cursor agent panel 패턴, monospace) | ⏳ UI |
| N2 | 발행 큐 모니터링 (post_jobs status / current_agent / attempts) | 데이터 ✅ |
| N3 | agent_decisions **타임라인** (디버깅용, owner 만) | 데이터 ✅ |
| N4 | KB 가설 검토 / 승격 게이트 (proposed → validated 수동 승인) | 데이터 ✅ / UI ⏳ |
| N5 | 실험 결과 대시보드 (experiment_results) | 데이터 ⏳ |
| N6 | 비용 / 토큰 / **캐시 히트율** (api_usage) | 데이터 ✅ |
| N7 | **Drift Report** 주간 결과 | 데이터 ✅ |
| N8 | SERP Analysis 뷰어 (topic gaps) | ⏳ |
| N9 | Pacing Calendar (주간 발행 + 클러스터 비율 시각화) | ⏳ |
| N10 | Budget Dashboard (client 별 월 사용액) | ⏳ |
| N11 | **Compliance Findings 패널** + Owner override | ✅ |
| N12 | **Anti-Hallucination Score** + 거부된 claim 목록 + 치환 사유 | ✅ |
| N13 | Image QA findings + 재시도 트리거 | ✅ |
| N14 | Stage 전환 history + 12주 마이그 진행률 | 데이터 ✅ |

## O. 인증 / 권한 (2-tier)

| ID | 기능 | 상태 |
|---|---|---|
| O1 | **Owner** (사용자 본인) — 모든 client/blueprint/KB read+write | ⏳ Wave 5 PR 10 |
| O2 | **Client** (고객사) — 자기 viral_client_id 만 read-only | ⏳ Wave 5 PR 10 |
| O3 | RLS 정책 (`owner_user_id` / `client_user_id` 매핑) | ⏳ Wave 5 PR 10 |
| O4 | 신규 15 테이블 RLS 활성화 (정책 0 = service_role 만 접근) | ✅ |
| O5 | Supabase Auth 통합 | ⏳ |

## P. 알람 / 이상 감지

| ID | 기능 | 상태 |
|---|---|---|
| P1 | rank 급락 ≥10위 5분 cron 알람 | ⏳ Wave 5 PR 11 |
| P2 | 인덱싱 실패 알람 | ⏳ |
| P3 | 측정 API 실패율 ≥5%/h 알람 | ⏳ |
| P4 | authority -5/일 알람 | ⏳ |
| P5 | drift > 5% 시 자동 발행 일시정지 | 🟡 |
| P6 | Worker 좀비 detect (20분+ processing 멈춤) | ⏳ (운영 안정성 PR) |

---

## 카테고리 한눈 요약

| 카테고리 | 인원/요소 | 핵심 |
|---|---|---|
| **A. 글 생성** | 18 에이전트 | Blueprint → 자동 18 단계 → 발행 |
| **B. 황금키워드** | 8 단계 | 업종 1개 → TOP 30 + 제목 |
| **C. 순위 추적** | rank-check + weekly | +1d~+90d 영구 추적 |
| **D. Blog Profiler** | 5 단계 stage | NEW/PRE_DIA/POST_DIA/MATURE/PENALIZED |
| **E. KB** | 베이지안 가설 | 발행 결과로 자기 학습 |
| **F. SERP 분석** | 메타만 | 본문 X, gap 추출 |
| **G. 표절 차단** | 임베딩 + N-gram + 자기복제 | 3중 검사 |
| **H. 환각 차단** | 5겹 | Claim → Source → Pattern → Citation → Score |
| **I. Compliance** | regex + LLM 맥락 | 7개 법규 룰 + 맥락 판정 |
| **J. 이미지** | 4 에이전트 | Strategist → Engineer → QA → ALT |
| **K. A/B 실험** | 1 axis at a time | Mann-Whitney U |
| **L. 거버넌스** | Approval / Quality / Pacing / Lock / Budget / 일탈 6중 | |
| **M. Client 페이지** | 5 항목 | 내부 로직 절대 노출 X |
| **N. Owner 대시보드** | 14 항목 | CLI dashboard 패턴 |
| **O. 인증** | 2-tier RLS | owner / client |
| **P. 알람** | 6 항목 | rank/index/api/drift/zombie |

---

## D+30 첫 발행 마일스톤까지 남은 작업

✅ 완료: A1~A5 / B / D2~D7 / G2~G4 / H / I / J1~J5+J7~J8 / L1~L2 / L6
🟡 골격: A6 (publisher dry-run) / D1 / E / G1 / J6 / L7
⏳ 다음: F / K / L3~L5 / M5 / N (UI 다수) / O / P

**최소 첫 발행**: A6 (publisher 실 통합) + J6 (이미지 실 호출) → D+30 가능.

---

다른 AI 웹 개발자에게 전달:
- 이 카탈로그를 보고 **Owner 대시보드 (N)** 부터 만들기
- **Client 페이지 (M)** 는 노출 금지 항목 절대 위반 X
- 데이터는 모두 `blog_engine.*` 또는 `virin.*` 에 이미 있음 (이 카탈로그 의 ✅ 표시)
