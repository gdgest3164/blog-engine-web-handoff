# Blog Engine Web Design Tokens

AI Slop 차단을 위한 **잠금 토큰 시스템** + Tailwind plugin + ESLint rule.

## 가져가서 쓰는 법 (다른 AI 웹 레포)

```bash
cp -r tools/web-design-tokens <your-web-repo>/design-tokens
```

### Tailwind 통합

```js
// tailwind.config.cjs
const { tailwindConfig } = require('./design-tokens/tailwind-plugin.cjs');

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  ...tailwindConfig,    // colors / spacing / fontSize / boxShadow / borderRadius / fontFamily 잠금
  theme: {
    extend: {
      // 추가 X — 토큰 변경은 design-tokens/tokens.json 직접 수정 + 사용자 OK 게이트
    },
  },
};
```

### ESLint 통합

```js
// .eslintrc.cjs
module.exports = {
  plugins: {
    'design-tokens': require('./design-tokens/eslint-rule.cjs'),
  },
  rules: {
    'design-tokens/no-arbitrary-values': 'error',
  },
};
```

## 차단 대상

| 패턴 | 결과 |
|---|---|
| `className="text-[#ff0000]"` | ❌ ESLint error |
| `className="bg-[rgb(0,0,0)]"` | ❌ |
| `className="p-[13px]"` | ❌ |
| `style={{ color: '#ff0000' }}` | ❌ |
| `style={{ padding: '13px' }}` | ❌ |
| `className="text-primary-500"` | ✅ token 사용 |
| `className="p-4"` | ✅ token spacing |

## 토큰 변경 정책

`tokens.json` 직접 수정 = **사용자 OK 게이트** (`/root/virin/CLAUDE.md` Web Invariants).
토큰 추가 / 삭제 / 색상값 변경은 owner 검토 후만.

## 토큰 정책 요약

- **colors**: 12개 한정. 의미 기반 (`neutral-*`, `primary-*`, `danger-*`, ...). 임의 hex ❌
- **spacing**: 8px 그리드 8단계 (0/1/2/3/4/6/8/12/16). 임의 px ❌
- **fontSize**: 6단계 (xs/sm/base/lg/xl/2xl)
- **shadow**: 3단계 (sm/md/lg)
- **radius**: 4단계 (none/sm/md/lg)
- **fontFamily**: Pretendard 우선 (한글)
