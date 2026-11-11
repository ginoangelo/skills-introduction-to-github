import type { ScanReport } from './types';

/**
 * Base URL of the deployed Veil API (the `ApiUrl` output of `sam deploy`).
 * Set it in veil/mobile/.env.local as EXPO_PUBLIC_API_URL=https://xxxx.execute-api.us-east-1.amazonaws.com
 * When it is not set the app runs in demo mode with sample data.
 */
const API_URL = process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, '');

export const isDemoMode = !API_URL;

export class ScanError extends Error {}

export async function runScan(email: string): Promise<ScanReport> {
  if (!API_URL) {
    await new Promise((resolve) => setTimeout(resolve, 2200));
    return demoReport();
  }
  let res: Response;
  try {
    res = await fetch(`${API_URL}/scan`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email }),
    });
  } catch {
    throw new ScanError('Could not reach Veil. Check your connection and try again.');
  }
  const body = (await res.json().catch(() => ({}))) as Partial<ScanReport> & { message?: string };
  if (!res.ok) {
    throw new ScanError(body.message ?? `Scan failed (${res.status}). Try again in a minute.`);
  }
  return body as ScanReport;
}

/** Sample data for demo mode. Breach names are generic on purpose. */
function demoReport(): ScanReport {
  return {
    demo: true,
    scannedAt: new Date().toISOString(),
    breaches: [
      { name: 'demo-shop', title: 'Shopping site (sample)', domain: 'example.com', breachDate: '2025-03-02', dataClasses: ['Email addresses', 'Passwords', 'Physical addresses'] },
      { name: 'demo-fit', title: 'Fitness app (sample)', domain: 'example.org', breachDate: '2024-08-19', dataClasses: ['Email addresses', 'Passwords'] },
      { name: 'demo-tel', title: 'Telecom provider (sample)', domain: 'example.net', breachDate: '2023-11-07', dataClasses: ['Phone numbers', 'Dates of birth', 'Physical addresses'] },
    ],
    fixes: [
      { id: 'breach-passwords', title: 'Change passwords exposed in 2 breaches', detail: 'Use a password manager so every site gets a unique password.', points: 12, severity: 'critical', minutes: 10, source: 'breach' },
      { id: 'breach-2fa', title: 'Turn on two-factor sign-in for your email', detail: 'Your email appeared in breaches. Two-factor stops someone using a leaked password.', points: 8, severity: 'critical', minutes: 3, source: 'breach' },
      { id: 'breach-carrier-pin', title: 'Add a PIN to your phone carrier account', detail: 'Your phone number leaked. A carrier PIN blocks SIM-swap scams.', points: 5, severity: 'high', minutes: 5, source: 'breach' },
      { id: 'breach-credit-freeze', title: 'Freeze your credit at all 3 bureaus', detail: 'Your address or birth date leaked. A freeze is free and stops new accounts in your name.', points: 6, severity: 'high', minutes: 15, source: 'breach' },
    ],
  };
}
