/**
 * ESLint custom rule — Tailwind 임의값 사용 금지.
 *
 * AI Slop 차단:
 *   - className="text-[#ff0000]"        → fail
 *   - className="bg-[rgb(0,0,0)]"       → fail
 *   - className="p-[13px]"              → fail
 *   - style={{ color: '#ff0000' }}      → fail (인라인 스타일도 차단)
 *
 * 사용 (다른 AI 웹 레포의 .eslintrc.cjs):
 *
 *   plugins: ['./tools/web-design-tokens/eslint-rule.cjs'],
 *   rules: { 'design-tokens/no-arbitrary-values': 'error' }
 */

'use strict';

const ARBITRARY_PATTERN = /-\[([^\]]+)\]/;

const rule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Blog Engine: Tailwind 임의값 / 인라인 스타일 색상·간격·폰트 사용 금지. ' +
        'tools/web-design-tokens/tokens.json 의 토큰만 사용.',
    },
    schema: [],
    messages: {
      arbitraryClass:
        '[design-tokens] Tailwind 임의값 금지: "{{value}}". tokens.json 의 정의된 토큰만 사용.',
      arbitraryStyle:
        '[design-tokens] 인라인 style 의 색상/간격/폰트 임의값 금지: {{prop}}={{value}}. Tailwind 토큰 사용.',
    },
  },

  create(context) {
    const FORBIDDEN_STYLE_PROPS = new Set([
      'color',
      'backgroundColor',
      'fontSize',
      'padding',
      'margin',
      'borderRadius',
      'boxShadow',
    ]);

    return {
      JSXAttribute(node) {
        // className="..." 또는 className={`...`}
        if (node.name && node.name.name === 'className') {
          let value = '';
          if (node.value && node.value.type === 'Literal') {
            value = String(node.value.value ?? '');
          } else if (
            node.value &&
            node.value.type === 'JSXExpressionContainer' &&
            node.value.expression.type === 'TemplateLiteral'
          ) {
            value = node.value.expression.quasis.map((q) => q.value.raw).join(' ');
          } else if (
            node.value &&
            node.value.type === 'JSXExpressionContainer' &&
            node.value.expression.type === 'Literal'
          ) {
            value = String(node.value.expression.value ?? '');
          }
          const m = value.match(ARBITRARY_PATTERN);
          if (m) {
            context.report({
              node,
              messageId: 'arbitraryClass',
              data: { value: m[0] },
            });
          }
        }

        // style={{ color: '#ff0000' }}
        if (
          node.name &&
          node.name.name === 'style' &&
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression.type === 'ObjectExpression'
        ) {
          for (const prop of node.value.expression.properties) {
            if (
              prop.type !== 'Property' ||
              !prop.key ||
              prop.key.type !== 'Identifier'
            )
              continue;
            if (FORBIDDEN_STYLE_PROPS.has(prop.key.name)) {
              context.report({
                node: prop,
                messageId: 'arbitraryStyle',
                data: {
                  prop: prop.key.name,
                  value:
                    prop.value.type === 'Literal'
                      ? String(prop.value.value)
                      : '<expression>',
                },
              });
            }
          }
        }
      },
    };
  },
};

module.exports = {
  rules: {
    'no-arbitrary-values': rule,
  },
};
