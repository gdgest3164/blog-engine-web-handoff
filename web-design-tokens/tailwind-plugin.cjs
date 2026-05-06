/**
 * Tailwind plugin — Blog Engine Design Token 잠금.
 *
 * 사용 (다른 AI 웹 레포의 tailwind.config.js):
 *
 *   const blogEngineTokens = require('./tools/web-design-tokens/tailwind-plugin.cjs');
 *
 *   module.exports = {
 *     content: [...],
 *     ...blogEngineTokens.tailwindConfig,   // colors / spacing / fontSize / shadow / radius 잠금
 *     theme: {
 *       extend: {
 *         // 임의 값 추가 금지 — eslint-rule.cjs 가 빌드 fail
 *       }
 *     }
 *   };
 *
 * 임의 값 사용 시 (예: text-[#ff0000]) ESLint rule 빌드 fail.
 * tokens 자체 변경은 사용자 OK 게이트 통과 후만 허용.
 */

const tokens = require('./tokens.json');

// $comment 같은 메타 키 제거
function clean(obj) {
  if (Array.isArray(obj)) return obj.map(clean);
  if (obj && typeof obj === 'object') {
    const out = {};
    for (const k of Object.keys(obj)) {
      if (k.startsWith('$')) continue;
      out[k] = clean(obj[k]);
    }
    return out;
  }
  return obj;
}

const cleaned = clean(tokens);

const tailwindConfig = {
  theme: {
    // 잠금 — extend 가 아니라 root replacement (그래서 임의값 못 들어옴)
    colors: cleaned.colors,
    spacing: cleaned.spacing,
    fontSize: cleaned.fontSize,
    boxShadow: cleaned.shadow,
    borderRadius: cleaned.radius,
    fontFamily: cleaned.fontFamily,
  },
  // arbitrary values 비활성 (text-[#ff0000] 류 차단)
  // Tailwind 자체 옵션은 없음 — ESLint rule (eslint-rule.cjs) 가 빌드 fail 로 강제.
};

module.exports = {
  tailwindConfig,
  tokens: cleaned,
};
