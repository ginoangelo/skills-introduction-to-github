import type { Breach, Fix } from './types';

const has = (b: Breach, dataClass: string) => b.dataClasses.includes(dataClass);

/** Turns a list of breaches into a prioritized fix list. Points feed the privacy score. */
export function fixesForBreaches(breaches: Breach[]): Fix[] {
  const fixes: Fix[] = [];
  if (breaches.length === 0) return fixes;

  const withPasswords = breaches.filter((b) => has(b, 'Passwords')).length;
  if (withPasswords > 0) {
    fixes.push({
      id: 'breach-passwords',
      title: `Change passwords exposed in ${withPasswords} ${withPasswords === 1 ? 'breach' : 'breaches'}`,
      detail: 'Change the password on those sites and anywhere you reused it. A password manager gives every site its own password.',
      points: Math.min(6 * withPasswords, 24),
      severity: 'critical',
      minutes: 10,
      source: 'breach',
    });
  }

  fixes.push({
    id: 'breach-2fa',
    title: 'Turn on two-factor sign-in for your email',
    detail: 'Your email appeared in a breach. Two-factor sign-in stops someone from using a leaked password to get in.',
    points: 8,
    severity: 'critical',
    minutes: 3,
    source: 'breach',
  });

  if (breaches.some((b) => has(b, 'Phone numbers'))) {
    fixes.push({
      id: 'breach-carrier-pin',
      title: 'Add a PIN to your phone carrier account',
      detail: 'Your phone number leaked. A carrier account PIN or port-out lock blocks SIM-swap scams.',
      points: 5,
      severity: 'high',
      minutes: 5,
      source: 'breach',
    });
  }

  if (breaches.some((b) => has(b, 'Physical addresses') || has(b, 'Dates of birth') || has(b, 'Social security numbers'))) {
    fixes.push({
      id: 'breach-credit-freeze',
      title: 'Freeze your credit at all 3 bureaus',
      detail: 'Your address, birth date or SSN leaked. A credit freeze is free and stops new accounts being opened in your name.',
      points: 6,
      severity: 'high',
      minutes: 15,
      source: 'breach',
    });
  }

  if (breaches.length >= 5) {
    fixes.push({
      id: 'breach-aliases',
      title: 'Use email aliases for new sign-ups',
      detail: 'Your address is in many breaches. Aliases keep your real email out of the next one.',
      points: 3,
      severity: 'low',
      minutes: 5,
      source: 'breach',
    });
  }

  return fixes;
}
