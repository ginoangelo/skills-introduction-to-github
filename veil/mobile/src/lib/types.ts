import type { Severity } from '@/constants/theme';

/** Shapes returned by the Veil backend (`POST /scan`). Keep in sync with veil/backend/src/lib/types.ts. */
export type Breach = {
  name: string;
  title: string;
  domain: string;
  breachDate: string;
  dataClasses: string[];
};

export type Fix = {
  id: string;
  title: string;
  detail: string;
  points: number;
  severity: Severity;
  minutes: number;
  source: 'breach' | 'device';
};

export type ScanReport = {
  scannedAt: string;
  breaches: Breach[];
  fixes: Fix[];
  /** True when the report is sample data (no backend configured). */
  demo?: boolean;
};
