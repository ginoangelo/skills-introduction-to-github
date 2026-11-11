import { describe, expect, it } from 'vitest';

import { fixesForBreaches } from '../src/lib/report';
import type { Breach } from '../src/lib/types';

const breach = (dataClasses: string[], name = 'x'): Breach => ({
  name,
  title: name,
  domain: 'example.com',
  breachDate: '2024-01-01',
  dataClasses,
});

describe('fixesForBreaches', () => {
  it('returns no fixes when there are no breaches', () => {
    expect(fixesForBreaches([])).toEqual([]);
  });

  it('always recommends two-factor when the email is in any breach', () => {
    const ids = fixesForBreaches([breach(['Email addresses'])]).map((f) => f.id);
    expect(ids).toEqual(['breach-2fa']);
  });

  it('counts password breaches and caps the points at 24', () => {
    const two = fixesForBreaches([breach(['Passwords'], 'a'), breach(['Passwords'], 'b')]);
    expect(two[0]).toMatchObject({ id: 'breach-passwords', title: 'Change passwords exposed in 2 breaches', points: 12 });

    const many = fixesForBreaches(Array.from({ length: 6 }, (_, i) => breach(['Passwords'], `p${i}`)));
    expect(many.find((f) => f.id === 'breach-passwords')?.points).toBe(24);
  });

  it('uses singular wording for one breach', () => {
    expect(fixesForBreaches([breach(['Passwords'])])[0].title).toBe('Change passwords exposed in 1 breach');
  });

  it('adds carrier PIN, credit freeze and aliases when the data calls for it', () => {
    const ids = fixesForBreaches([
      breach(['Phone numbers'], 'a'),
      breach(['Dates of birth'], 'b'),
      breach(['Email addresses'], 'c'),
      breach(['Email addresses'], 'd'),
      breach(['Email addresses'], 'e'),
    ]).map((f) => f.id);
    expect(ids).toEqual(['breach-2fa', 'breach-carrier-pin', 'breach-credit-freeze', 'breach-aliases']);
  });
});
