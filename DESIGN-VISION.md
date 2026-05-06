# Blog Engine Web — Design Vision (가이드 v2)

> 이전 가이드는 "X 하지마" 만 — 결과물 평범. v2 = **명시적 reference + 차별화 시각 정체성**.

## 한 줄 정의

> **"Linear 정밀도 + Vercel 다크 + Cursor agent panel 진행 시각화 + Pretendard 한글 타이포"**

평범 SaaS 대시보드 ❌ → **개발자 도구 같은 에이전시 운영 도구** ✅
Owner 페이지 = **CLI dashboard 의 GUI 버전**.

---

## 1. Reference URL — 정확히 이런 분위기

**필수 분석 대상** (다른 AI 웹 개발자: 본인 시작 전 5분씩 각각 보고 시각 흡수):

1. **Linear** (https://linear.app) — 정밀도 + 회색조 + issue list 밀도. **Owner 페이지의 80%가 이 패턴**
2. **Vercel Dashboard** (https://vercel.com/dashboard) — 다크 default + 정보 밀도 + tabular data
3. **Cursor** (https://cursor.com) — agent panel 진행 시각화. 18 에이전트 진행 표시 = 이거 그대로 따라
4. **Raycast** (https://raycast.com) — 마이크로 인터랙션 0.1s. 즉시 반응
5. **Arc Browser** (https://arc.net) — 회색조 미니멀, primary color 절제
6. **Things 3** (https://culturedcode.com/things/) — 한 화면 한 의도. 부유한 여백 + 명확 위계
7. **Pretendard** (https://pretendard.cactus.tools/) — 한글 폰트 자체 데모 페이지. 가중치 변주

**참고만** (전체 따라하지 말것 — 아이디어만 흡수):
- Notion (정보 위계는 좋음. 단 카드/이모지는 X)
- Stripe Dashboard (테이블 패턴 OK. 단 색감은 너무 화이트)

---

## 2. Anti-Reference — 절대 NO (즉시 reject 사유)

| 패턴 | 이유 |
|---|---|
| 모든 SaaS 평균치 hero — gradient + lucide icon + "Welcome to {X}" | "AI 만든 거" 즉시 들킴 |
| 4개 통계 카드 그리드 (실데이터 무관) | 가짜 대시보드 패턴 |
| glassmorphism / neumorphism | 트렌드 카피 |
| Tailwind default blue (#3b82f6) primary | 정체성 0 |
| 모든 카드 둥근 모서리 16px+ | 평균 SaaS |
| soft shadow 도배 | 평균 SaaS |
| 따뜻한 보라/핑크 그라디언트 | 한국 SaaS 평균 |
| 모든 버튼에 emoji | 신뢰성 ↓ |
| primary color 도배 (모든 액션이 같은 강조) | 위계 부재 |

---

## 3. 시각 정체성 7요소

### 3-1. Color (다크 default)
```
배경:    #0a0a0a (거의 검정)
표면:    #1a1a1a (카드)
경계:    #262626 (1px)
텍스트:  #fafafa primary / #a3a3a3 secondary / #525252 tertiary
액션:    #3b82f6 (파랑 — 저장/발행에만)
위험:    #dc2626 (의료 reject / approval 거부)
경고:    #d97706 (compliance 위반)
성공:    #16a34a (published)
강조:    #a855f7 (드물게 — KB validated 가설 등 메타)
```

라이트 모드는 옵션 (Owner 가 토글). 토큰 색상 12개 그대로.

### 3-2. Typography (Pretendard 한글 우선)
```
font-family: 'Pretendard Variable', system-ui, sans-serif
- 본문: 14px / line-height 1.5 / weight 400
- 강조: 14px / weight 600 (700 X — 한글에서 너무 굵음)
- 헤딩 h2: 20px weight 600
- 헤딩 h1: 28px weight 700
- 코드: 'JetBrains Mono', ui-monospace
- 수치 (테이블): tabular-nums (숫자 너비 통일)
```

### 3-3. Spacing (8px grid 강제)
```
0   1=4px   2=8px   3=12px   4=16px
6=24px   8=32px   12=48px   16=64px
```
임의값 (13px, 20px) ❌ — ESLint rule 강제.

### 3-4. Border / Radius
```
1px solid #262626 — 모든 경계 통일
radius:
  none: 0px (테이블 cell)
  sm: 4px (input, badge)
  md: 8px (카드, 버튼)
  lg: 16px (모달)
shadow: 사용 안 함 또는 1px border 만 — soft shadow 평균치 X
```

### 3-5. 마이크로 인터랙션
```
hover:    transition 100ms (0.1s)
focus:    1px outline (#3b82f6) 즉시 표시
loading:  skeleton 만 — spinner X (정밀도 손상)
페이지 이동: 0ms (transition 없음 — 즉시 반응 = Linear 패턴)
```

### 3-6. Information Density (Owner = 빽빽)
- 한 화면에 정보 많이 = OK. Stripe / Notion 처럼 여백 X.
- 테이블 row height 36px (Linear 패턴). SaaS 평균 56px ❌.
- 카드 padding 16px (Linear). 평균 SaaS 24~32px ❌.

### 3-7. Agent Panel (Cursor 패턴)
18 에이전트 진행 = 코드 trace 처럼:
```
▸ keyword_hunter_title    ✓ 5.6s   602/287 tok
▸ topic_architect         ✓ 37s   1013/2275 tok
▸ writer                  ⠋ 진행 중 ...  47s
  seo_auditor (대기)
  claim_extractor (대기)
  ...
```
- 단계별 들여쓰기 (depth 표현)
- 진행 중 = ⠋ Braille spinner (작은 크기)
- 완료 = ✓ + latency + tokens
- 거부 = ✗ + reject reason
- monospace 폰트 (코드처럼)

---

## 4. Owner vs Client 차별화 (재정의)

| 항목 | Owner (CLI 같은 도구) | Client (보고서) |
|---|---|---|
| 모드 | **다크 default** | **라이트 default** |
| 폰트 본문 | 14px (빽빽) | 16px (가독성) |
| 정보 밀도 | 매우 높음 (Linear / Vercel) | 낮음 (Things / 일반 보고서) |
| 색조 | 회색조 (액션만 컬러) | 약간 따뜻 (브랜드 컬러 1개) |
| 인터랙션 | 즉시 반응 (transition 0ms) | 부드럽 (200ms ease-out) |
| 모바일 | 후순위 (PC 1280+ 우선) | **모바일 우선** (390px) |
| 가장 닮은 것 | Linear / Vercel Dashboard | Apple App Store 리뷰 / Things 3 |

---

## 5. 핵심 화면 구체 시각 명세

### 5-1. Owner > Blueprint Editor

```
┌────────────────────────────────────────────────────────────────┐
│ ▸ blog-engine                                          ⌘K  ⚙️ │  ← 헤더 (44px height, 1px border-bottom)
├──────┬──────────────────────────────────────────┬──────────────┤
│  ▸ 🏥 동환피부과    │ Blueprint: 여드름 흉터      │ ▸ 진행      │
│  ▸ 🏥 디데이성형외과 │                            │             │
│                     │ ┌──────────────────────┐ │ ✓ Hunter 5s │
│  ▸ Onboarding       │ │ Section: 본문 구조   │ │ ⠋ Architect │
│  ▸ Blueprints       │ │   word_count [1500]  │ │ Writer 대기 │
│  ▸ Approvals        │ │   intro_style ◉ ... │ │ ...         │
│  ▸ Stage Panel      │ │                      │ │             │
│  ▸ KB               │ │ Section: 키워드      │ │ Quality:    │
│  ▸ Experiments      │ │   ...                │ │ ████░░ 67   │
│  ▸ Calendar         │ └──────────────────────┘ │             │
│  ▸ Budget           │                            │ Anti-Hall:  │
│                     │                            │ ████░ 88   │
│  ─ 파이프라인 (상시)─ │                            │             │
│  ─────────────────  │                            │             │
└──────┴──────────────────────────────────────────┴──────────────┘
        ↑ 좌측 sidebar 240px,    ↑ 중앙 폼,             ↑ 우측 320px
          monospace 12px,          ←Pretendard 14px       Cursor agent panel
          회색 텍스트                 본문 흰색                 monospace 12px
```

핵심:
- 헤더 44px (작음). primary action 없음.
- 좌측 sidebar = 항상 보임 (펼침/접힘 X). 80% 회색 텍스트, hover 시 흰색.
- 중앙 = Pretendard 14px. 입력 칸 1px border, focus 시 파랑.
- 우측 panel = monospace, 코드 트레이스 처럼.
- 전체 다크 (#0a0a0a) + 카드는 #1a1a1a.

### 5-2. Client > 내 글 순위 (모바일 390px)

```
┌─────────────────────┐
│ 동환피부과 SEO      │  ← 페이지 제목 18px Pretendard 600
│ 5월 1주             │  ← secondary 14px 회색
│                     │
│ ┌─────────────────┐ │  ← 카드 1px border-bottom (라이트)
│ │ 통합검색 1페이지 │ │     padding 16px
│ │  12 / 35편      │ │     숫자 28px tabular-nums 600
│ │  ▲ 2 (지난주)   │ │     변동 14px 회색 또는 초록 (3-1 색)
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ 평균 순위        │ │
│ │  17위           │ │
│ │  ▲ 3            │ │
│ └─────────────────┘ │
│                     │
│ ─ 글별 순위 (15개) ─ │
│                     │
│ 여드름 흉터 치료    │  ← 14px / 600
│ 통합 8위 ▲          │  ← 12px 회색 / 변동 색
│ ─────────────────── │  ← 1px border 1px gap
│ 모공 축소 시술      │
│ 통합 12위 —         │
│ ─────────────────── │
└─────────────────────┘
```

핵심:
- 라이트 default. 따뜻한 흰색 (#fafafa) 배경.
- 카드 그림자 X — 1px border 만.
- 숫자 = tabular-nums (자릿수 통일 = 정밀해 보임).
- "통합검색 1페이지 12편" 같이 핵심 KPI 큰 숫자 + 변동 작게.
- 모든 정보 1-2 클릭 안에. 메뉴 X (모바일은 단일 흐름).

---

## 6. 절대 강제

위 시각 정체성 7요소 위반 시 = 즉시 PR reject.

특히:
1. **Tailwind config 의 colors / spacing / fontSize** — `tools/web-design-tokens/tokens.json` 만 사용. 임의값 = ESLint 빌드 fail.
2. **darkMode: 'class'** + Owner 페이지 default `class="dark"`.
3. **shadow 사용 금지** (3-4 명시) — `shadow-md` / `shadow-lg` Tailwind 기본 클래스 사용 X.
4. **transition 100ms** — Owner 의 hover. Client 200ms.
5. **Pretendard Variable** — 다른 폰트 import 금지.

---

## 7. 구현 순서 (다른 AI 웹 개발자에게)

1. Reference 7개 사이트 5분씩 정독 (필수)
2. `tokens.json` Tailwind config 통합
3. **Owner 페이지부터** (Client X) — Linear / Vercel 패턴으로 1페이지 (Blueprint Editor) 만들기
4. 사용자 (owner 본인) 에게 Visual Approval 요청 — 5장 캡처 (PC + 다크/라이트 + 빈/로딩/에러)
5. OK 면 다른 페이지 진행. NG 면 즉시 폐기 + 재작성 (이전 가이드 실패 = 1페이지 동작 검증 안 했기 때문)

---

## 변경 사항 (vs handoff.md v1)

| v1 | v2 |
|---|---|
| Anti-pattern Gallery (10개 NO) | Anti-reference + **명시적 reference 7개 URL** |
| Owner-Client 차별화 표 (정보 밀도/디바이스만) | **다크/라이트 default, 가장 닮은 것 명시** |
| 텍스트 와이어프레임 5개 (회색박스) | **컬러/폰트/spacing 명시 와이어프레임 + 좌표** |
| Design Token 12색 (의미만) | **각 색의 용도 + Owner/Client 별 다른 적용** |
| "AI Slop 절대 금지" (개념만) | **각 anti-pattern 의 정확한 대안 reference** |

핵심 차이: **"X 하지마" → "이렇게 하라 (URL + 좌표 + 색)"**.
