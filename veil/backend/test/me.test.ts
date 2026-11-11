import type { APIGatewayProxyEventV2WithJWTAuthorizer, APIGatewayProxyStructuredResultV2 } from 'aws-lambda';
import { describe, expect, it } from 'vitest';

import { makeHandler, parseProgress, type Progress, type ProgressStore } from '../src/handlers/me';

function memoryStore(): ProgressStore & { data: Map<string, Progress> } {
  const data = new Map<string, Progress>();
  return {
    data,
    get: async (id) => data.get(id) ?? null,
    put: async (id, p) => void data.set(id, p),
    delete: async (id) => void data.delete(id),
  };
}

const event = (routeKey: string, sub: string | undefined, body?: unknown) =>
  ({
    routeKey,
    body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
    requestContext: { authorizer: { jwt: { claims: sub ? { sub } : {}, scopes: [] } } },
  }) as unknown as APIGatewayProxyEventV2WithJWTAuthorizer;

async function call(handler: ReturnType<typeof makeHandler>, ...args: Parameters<typeof event>) {
  const res = (await handler(event(...args))) as APIGatewayProxyStructuredResultV2;
  return { status: res.statusCode, body: res.body ? JSON.parse(res.body) : undefined };
}

describe('/me endpoints', () => {
  const now = () => new Date('2026-11-11T12:00:00Z');

  it('rejects requests without a signed-in user', async () => {
    const res = await call(makeHandler(memoryStore()), 'GET /me/progress', undefined);
    expect(res.status).toBe(401);
  });

  it('returns empty progress for a new user', async () => {
    const res = await call(makeHandler(memoryStore()), 'GET /me/progress', 'user-1');
    expect(res).toEqual({ status: 200, body: { done: {}, mode: 'surface', updatedAt: null } });
  });

  it('saves progress per user and drops unchecked fixes', async () => {
    const store = memoryStore();
    const handler = makeHandler(store, now);
    const put = await call(handler, 'PUT /me/progress', 'user-1', { done: { 'breach-2fa': true, 'device-location': false }, mode: 'ninja' });
    expect(put.status).toBe(200);
    expect(put.body).toEqual({ done: { 'breach-2fa': true }, mode: 'ninja', updatedAt: '2026-11-11T12:00:00.000Z' });

    expect((await call(handler, 'GET /me/progress', 'user-1')).body.mode).toBe('ninja');
    expect((await call(handler, 'GET /me/progress', 'user-2')).body.mode).toBe('surface');
  });

  it('rejects bad bodies', async () => {
    const handler = makeHandler(memoryStore());
    expect((await call(handler, 'PUT /me/progress', 'u', '{oops')).status).toBe(400);
    expect((await call(handler, 'PUT /me/progress', 'u', { done: {}, mode: 'invisible' })).status).toBe(400);
    expect((await call(handler, 'PUT /me/progress', 'u', { done: { 'Bad ID!': true }, mode: 'low' })).status).toBe(400);
  });

  it('deletes all of a user’s data', async () => {
    const store = memoryStore();
    const handler = makeHandler(store, now);
    await call(handler, 'PUT /me/progress', 'user-1', { done: {}, mode: 'low' });
    expect((await call(handler, 'DELETE /me', 'user-1')).status).toBe(204);
    expect(store.data.size).toBe(0);
  });
});

describe('parseProgress', () => {
  it('caps the number of fixes', () => {
    const done = Object.fromEntries(Array.from({ length: 201 }, (_, i) => [`fix-${i}`, true]));
    expect(parseProgress({ done, mode: 'low' })).toBe('Too many fixes.');
  });
});
