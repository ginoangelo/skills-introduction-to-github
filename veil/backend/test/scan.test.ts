import type { APIGatewayProxyEventV2, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { describe, expect, it, vi } from 'vitest';

import { makeHandler } from '../src/handlers/scan';
import { cacheKey, type ScanCache } from '../src/lib/cache';
import { hibpLookup, UpstreamBusyError } from '../src/lib/hibp';
import type { Breach, ScanReport } from '../src/lib/types';

const event = (body: unknown) => ({ body: typeof body === 'string' ? body : JSON.stringify(body) }) as APIGatewayProxyEventV2;

function memoryCache(): ScanCache & { store: Map<string, ScanReport> } {
  const store = new Map<string, ScanReport>();
  return { store, get: async (e) => store.get(e) ?? null, put: async (e, r) => void store.set(e, r) };
}

const sample: Breach[] = [
  { name: 'A', title: 'Site A', domain: 'a.com', breachDate: '2024-05-01', dataClasses: ['Email addresses', 'Passwords'] },
];

async function call(handler: ReturnType<typeof makeHandler>, body: unknown) {
  const res = (await handler(event(body))) as APIGatewayProxyStructuredResultV2;
  return { status: res.statusCode, body: JSON.parse(res.body ?? '{}') };
}

describe('POST /scan', () => {
  it('rejects a missing or invalid email', async () => {
    const handler = makeHandler({ lookup: vi.fn(), cache: memoryCache() });
    expect((await call(handler, {})).status).toBe(400);
    expect((await call(handler, { email: 'not-an-email' })).status).toBe(400);
    expect((await call(handler, '{bad json')).status).toBe(400);
  });

  it('normalizes the email, returns breaches + fixes, and caches the report', async () => {
    const lookup = vi.fn().mockResolvedValue(sample);
    const cache = memoryCache();
    const handler = makeHandler({ lookup, cache, now: () => new Date('2026-11-11T00:00:00Z') });

    const first = await call(handler, { email: '  Me@Example.COM ' });
    expect(first.status).toBe(200);
    expect(lookup).toHaveBeenCalledWith('me@example.com');
    expect(first.body.breaches).toHaveLength(1);
    expect(first.body.fixes.map((f: { id: string }) => f.id)).toContain('breach-passwords');
    expect(first.body.scannedAt).toBe('2026-11-11T00:00:00.000Z');

    const second = await call(handler, { email: 'me@example.com' });
    expect(second.body).toEqual(first.body);
    expect(lookup).toHaveBeenCalledTimes(1);
  });

  it('returns 503 when the breach database is rate limiting', async () => {
    const handler = makeHandler({ lookup: vi.fn().mockRejectedValue(new UpstreamBusyError('busy')), cache: memoryCache() });
    expect((await call(handler, { email: 'a@b.co' })).status).toBe(503);
  });

  it('returns 502 without leaking details on other failures', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const handler = makeHandler({ lookup: vi.fn().mockRejectedValue(new Error('boom')), cache: memoryCache() });
    const res = await call(handler, { email: 'a@b.co' });
    expect(res.status).toBe(502);
    expect(JSON.stringify(spy.mock.calls)).not.toContain('a@b.co');
    spy.mockRestore();
  });
});

describe('hibpLookup', () => {
  const key = async () => 'test-key';

  it('treats 404 as "no breaches"', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 404 }));
    expect(await hibpLookup(key, fetchImpl)('a@b.co')).toEqual([]);
  });

  it('sends the API key, encodes the email, and sorts newest first', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(
      Response.json([
        { Name: 'Old', Title: 'Old', Domain: 'o.com', BreachDate: '2019-01-01', DataClasses: ['Email addresses'] },
        { Name: 'New', Title: 'New', Domain: 'n.com', BreachDate: '2025-01-01', DataClasses: ['Passwords'] },
      ]),
    );
    const result = await hibpLookup(key, fetchImpl)('a+b@c.co');
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toContain('/breachedaccount/a%2Bb%40c.co');
    expect(init.headers['hibp-api-key']).toBe('test-key');
    expect(result.map((b) => b.name)).toEqual(['New', 'Old']);
  });

  it('throws UpstreamBusyError on 429', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(new Response(null, { status: 429 }));
    await expect(hibpLookup(key, fetchImpl)('a@b.co')).rejects.toBeInstanceOf(UpstreamBusyError);
  });
});

describe('cacheKey', () => {
  it('hashes the email so it is never stored in plain text', () => {
    const k = cacheKey('me@example.com');
    expect(k).toMatch(/^scan#[0-9a-f]{64}$/);
    expect(k).not.toContain('example');
  });
});
