import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';

delete process.env.ANTHROPIC_API_KEY;
delete process.env.ANTHROPIC_AUTH_TOKEN;

const { createApp } = await import('../server/index.js');
const { openDb } = await import('../server/db.js');

let server;
let base;

before(async () => {
  server = createApp(openDb(':memory:')).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://localhost:${server.address().port}`;
});
after(() => server.close());

const call = async (method, path, body, token) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: res.status, body: await res.json() };
};

const signup = async (email) =>
  (await call('POST', '/api/auth/signup', { email, name: 'Test', password: 'correct-horse' })).body.token;

test('auth: signup, duplicate, login, guard', async () => {
  const first = await call('POST', '/api/auth/signup', { email: 'A@x.com', name: 'A', password: 'correct-horse' });
  assert.equal(first.status, 201);
  assert.equal(first.body.user.email, 'a@x.com');
  assert.equal((await call('POST', '/api/auth/signup', { email: 'a@x.com', name: 'A', password: 'correct-horse' })).status, 409);
  assert.equal((await call('POST', '/api/auth/signup', { email: 'b@x.com', name: 'B', password: 'short' })).status, 400);
  assert.equal((await call('POST', '/api/auth/login', { email: 'a@x.com', password: 'nope-nope' })).status, 401);
  const login = await call('POST', '/api/auth/login', { email: 'a@x.com', password: 'correct-horse' });
  assert.equal(login.status, 200);
  assert.equal((await call('GET', '/api/me', null, login.body.token)).body.user.name, 'A');
  assert.equal((await call('GET', '/api/pantry')).status, 401);
  await call('POST', '/api/auth/logout', null, login.body.token);
  assert.equal((await call('GET', '/api/me', null, login.body.token)).status, 401);
});

test('scan -> pantry -> suggest -> shopping -> stock', async () => {
  const t = await signup('flow@x.com');
  const data = 'A'.repeat(200);

  assert.equal((await call('POST', '/api/suggest', {}, t)).status, 400, 'empty pantry is rejected');

  const scan = await call('POST', '/api/scan', { location: 'fridge', images: [{ mediaType: 'image/jpeg', data }] }, t);
  assert.equal(scan.status, 200);
  assert.equal(scan.body.demo, true);
  assert.ok(scan.body.items.length > 5);
  assert.ok(scan.body.items.every((i) => i.location === 'fridge'));

  const cab = await call('POST', '/api/scan', { location: 'cabinet', images: [{ mediaType: 'image/jpeg', data }] }, t);
  const items = [...scan.body.items, ...cab.body.items].map(({ confidence, ...rest }) => rest);
  const added = await call('POST', '/api/pantry', { items }, t);
  assert.equal(added.status, 201);
  assert.equal(added.body.items.length, items.length);

  const id = added.body.items[0].id;
  const patched = await call('PATCH', `/api/pantry/${id}`, { quantity: 'lots' }, t);
  assert.equal(patched.body.items.find((i) => i.id === id).quantity, 'lots');

  const sug = await call('POST', '/api/suggest', { meal: 'dinner' }, t);
  assert.equal(sug.status, 200);
  assert.ok(sug.body.recipes.some((r) => r.status === 'ready'));
  assert.ok(sug.body.recipes.some((r) => r.status === 'almost' && r.missing.length > 0));
  assert.ok(sug.body.smartBuys.length > 0);
  assert.deepEqual((await call('GET', '/api/suggest/last', null, t)).body.recipes, sug.body.recipes);

  const saved = await call('POST', '/api/recipes', { recipe: sug.body.recipes[0] }, t);
  assert.equal(saved.body.recipes[0].title, sug.body.recipes[0].title);

  const buy = sug.body.smartBuys[0].item;
  let list = await call('POST', '/api/shopping', { items: [{ name: buy }, { name: buy }] }, t);
  assert.equal(list.body.items.length, 1, 'duplicates are collapsed');
  await call('PATCH', `/api/shopping/${list.body.items[0].id}`, { done: true }, t);
  const stocked = await call('POST', '/api/shopping/stock', null, t);
  assert.equal(stocked.body.moved, 1);
  assert.equal(stocked.body.items.length, 0);
  const pantry = await call('GET', '/api/pantry', null, t);
  assert.ok(pantry.body.items.some((i) => i.name === buy));
});

test('users cannot see or change each other\'s data', async () => {
  const a = await signup('iso-a@x.com');
  const b = await signup('iso-b@x.com');
  const added = await call('POST', '/api/pantry', { items: [{ name: 'secret truffle' }] }, a);
  const id = added.body.items[0].id;
  assert.equal((await call('GET', '/api/pantry', null, b)).body.items.length, 0);
  assert.equal((await call('PATCH', `/api/pantry/${id}`, { name: 'hacked' }, b)).status, 404);
  await call('DELETE', `/api/pantry/${id}`, null, b);
  assert.equal((await call('GET', '/api/pantry', null, a)).body.items[0].name, 'secret truffle');
});

test('validation rejects bad input', async () => {
  const t = await signup('val@x.com');
  assert.equal((await call('POST', '/api/scan', { location: 'garage', images: [] }, t)).status, 400);
  assert.equal((await call('POST', '/api/pantry', { items: [{ name: '' }] }, t)).status, 400);
  assert.equal((await call('GET', '/api/nope', null, t)).status, 404);
});
