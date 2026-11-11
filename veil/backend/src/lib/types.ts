/** Response shapes for `POST /scan`. Keep in sync with veil/mobile/src/lib/types.ts. */
export type Severity = 'critical' | 'high' | 'low';

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
};
