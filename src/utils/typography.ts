/** Keep short English function words and numeric units with their following word.
 * Apply to authored copy before rendering, including hydrated demo states.
 */
export function keepWordsTogether(text: string): string {
  if (/https?:\/\/|^[/.#]/.test(text)) return text;
  return text.replace(/\b(a|an|the|of|to|in|on|at|by|for|and|or|with) (?=[\p{L}\d])/giu, '$1\u00a0')
    .replace(/(\d[\d.,]*%?) (USDC|WETH|ETH|BTC|NEAR|LTV|pp|seconds?|minutes?|hours?|%)(?=\b|$)/g, '$1\u00a0$2');
}

export function readableCopy<T>(value: T): T {
  if (typeof value === 'string') return keepWordsTogether(value) as T;
  if (Array.isArray(value)) return value.map(readableCopy) as T;
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, readableCopy(item)])) as T;
  return value;
}
