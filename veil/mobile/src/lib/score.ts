import type { Fix } from './types';

/** The score is 100 minus the points of every fix not done yet, never below 5. */
export function computeScore(fixes: Fix[], done: Record<string, boolean>): number {
  const open = fixes.filter((f) => !done[f.id]).reduce((sum, f) => sum + f.points, 0);
  return Math.max(5, Math.min(100, 100 - open));
}

export function riskLabel(score: number): { label: string; tone: 'ok' | 'warn' | 'danger' } {
  if (score >= 80) return { label: 'LOW RISK', tone: 'ok' };
  if (score >= 50) return { label: 'MODERATE RISK', tone: 'warn' };
  return { label: 'HIGH RISK', tone: 'danger' };
}
