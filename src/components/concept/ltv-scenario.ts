// A compressed illustrative timeline. Geometry is event-based, not a live price feed.
export const DURATION = 11200;
export function progressAt(ms: number) {
  if (ms <= 3000) return Math.max(0, ms / 3000);
  if (ms <= 4200) return 1;
  if (ms <= 6000) return 1 + (ms - 4200) / 1800;
  if (ms <= 9200) return 2 + (ms - 6000) / 3200;
  return 3;
}
export function valuesAt(p: number) {
  const t = Math.max(0, Math.min(3, p));
  if (t <= 1) return { protected: 50 + 20 * t * t, exposed: 50 + 20 * t * t };
  if (t <= 2) return { protected: 70 - 20 * (1 - (2 - t) ** 2), exposed: 70 + 4 * (t - 1) };
  return { protected: 50, exposed: 74 + 12 * (t - 2) };
}
