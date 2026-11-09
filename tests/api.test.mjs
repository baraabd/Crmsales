import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createCrmServer } from '../server/app.mjs';

async function start(options = {}) {
  const app = createCrmServer({ databasePath: ':memory:', logError: () => {}, ...options });
  await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
  const base = `http://127.0.0.1:${app.server.address().port}`;
  async function call(path, { method = 'GET', token, body, headers } = {}) {
    const response = await fetch(base + path, { method, headers: { ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: body === undefined ? undefined : JSON.stringify(body) });
    return { status: response.status, data: await response.json(), headers: response.headers };
  }
  return { ...app, call, base };
}

const signupInput = (email = 'rep@example.com') => ({ email, password: 'Test-only-passphrase-8', name: 'مندوب الاختبار' });
const accountInput = { id: 'client-1', name: 'عميل الاختبار', phone: '0501234567', address: 'الرياض', latitude: 24.7, longitude: 46.7, lifecycle: 'prospect', pinColor: 'blue' };
const visitInput = { id: 'visit-1', accountId: 'client-1', startTime: '2026-11-09T10:00:00.000Z', latitude: 24.7, longitude: 46.7 };
const pngSignature = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jz1sAAAAASUVORK5CYII=';

test('health checks the database and never masks a missing schema', async () => {
  const app = await start();
  try {
    const healthy = await app.call('/api/health');
    assert.equal(healthy.status, 200);
    assert.deepEqual(healthy.data, { status: 'ok', database: 'ok' });
    app.db.exec('ALTER TABLE users RENAME TO unavailable_users');
    const unhealthy = await app.call('/api/health');
    assert.equal(unhealthy.status, 503);
    assert.equal(unhealthy.data.database, 'error');
    assert.doesNotMatch(JSON.stringify(unhealthy.data), /no such table|SELECT/i);
  } finally { await app.close(); }
});

test('registration, login, profile, expiration and logout use real persisted sessions', async () => {
  const app = await start();
  try {
    assert.equal((await app.call('/api/accounts')).status, 401);
    const registered = await app.call('/api/auth/signup', { method: 'POST', body: signupInput('REP@example.com') });
    assert.equal(registered.status, 201);
    const { accessToken: token, user } = registered.data;
    assert.equal(user.email, 'rep@example.com');
    assert.equal(user.name, 'مندوب الاختبار');
    assert.equal(token.length, 43);
    assert.equal(user.password_hash, undefined);
    const stored = app.db.prepare('SELECT password_hash FROM users WHERE id = ?').get(user.id);
    assert.match(stored.password_hash, /^scrypt:/);
    assert.ok(!stored.password_hash.includes(signupInput().password));
    const storedSession = app.db.prepare('SELECT token_hash FROM sessions WHERE user_id = ?').get(user.id);
    assert.notEqual(storedSession.token_hash, token);
    assert.equal((await app.call('/api/auth/user', { token })).data.user.id, user.id);
    const updated = await app.call('/api/auth/user', { method: 'PATCH', token, body: { name: 'اسم جديد', company: 'شركة الاختبار', email: 'ignored@example.com' } });
    assert.equal(updated.data.user.name, 'اسم جديد');
    assert.equal(updated.data.user.email, 'rep@example.com');
    const bad = await app.call('/api/auth/login', { method: 'POST', body: { email: user.email, password: 'wrong' } });
    const unknown = await app.call('/api/auth/login', { method: 'POST', body: { email: 'unknown@example.com', password: 'wrong' } });
    assert.equal(bad.status, 401);
    assert.deepEqual(bad.data, unknown.data);
    assert.equal((await app.call('/api/auth/signup', { method: 'POST', body: signupInput() })).status, 409);
    await app.call('/api/auth/logout', { method: 'POST', token });
    assert.equal((await app.call('/api/auth/user', { token })).status, 401);
    const login = await app.call('/api/auth/login', { method: 'POST', body: signupInput() });
    assert.equal(login.status, 200);
    assert.notEqual(login.data.accessToken, token);
    app.db.prepare('UPDATE sessions SET expires_at = 0 WHERE user_id = ?').run(user.id);
    assert.equal((await app.call('/api/auth/user', { token: login.data.accessToken })).status, 401);
  } finally { await app.close(); }
});

test('records persist after restarting, retries upsert, and another user cannot access them', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'crmsales-api-'));
  const databasePath = join(directory, 'crm.sqlite');
  let app = await start({ databasePath });
  try {
    const first = (await app.call('/api/auth/signup', { method: 'POST', body: signupInput() })).data;
    const second = (await app.call('/api/auth/signup', { method: 'POST', body: signupInput('other@example.com') })).data;
    const token = first.accessToken;
    const anotherToken = second.accessToken;
    assert.equal((await app.call('/api/accounts', { method: 'POST', token, body: accountInput })).status, 201);
    assert.equal((await app.call('/api/accounts', { method: 'POST', token, body: accountInput })).status, 200);
    assert.equal((await app.call('/api/accounts', { token })).data.accounts.length, 1);
    assert.equal((await app.call('/api/accounts', { token: anotherToken })).data.accounts.length, 0);
    assert.equal((await app.call('/api/accounts/client-1', { token: anotherToken })).status, 404);
    assert.equal((await app.call('/api/accounts/client-1', { method: 'PATCH', token: anotherToken, body: { name: 'malicious update' } })).status, 404);
    assert.equal((await app.call('/api/accounts/client-1', { method: 'DELETE', token: anotherToken })).status, 404);
    assert.equal((await app.call('/api/visits', { method: 'POST', token: anotherToken, body: visitInput })).status, 404);
    const started = await app.call('/api/visits', { method: 'POST', token, body: visitInput });
    assert.equal(started.status, 201);
    const completed = await app.call('/api/visits', { method: 'POST', token, body: { ...visitInput, endTime: '2026-11-09T10:30:00.000Z', duration: 30, outcome: 'appointment', notes: 'تمت الزيارة' } });
    assert.equal(completed.status, 200);
    assert.equal(completed.data.visit.outcome, 'appointment');
    const appointment = { id: 'appointment-1', accountId: 'client-1', visitId: 'visit-1', date: '2026-11-10', time: '09:00', reason: 'مراجعة العرض', status: 'scheduled' };
    assert.equal((await app.call('/api/appointments', { method: 'POST', token, body: appointment })).status, 201);
    const agreement = { id: 'agreement-1', accountId: 'client-1', visitId: 'visit-1', agreementNumber: 'CRM-1', services: [{ name: 'استشارة', price: 100, quantity: 1 }], subtotal: 100, discount: 10, total: 90, status: 'active', signatureData: pngSignature };
    assert.equal((await app.call('/api/agreements', { method: 'POST', token, body: agreement })).status, 201);
    assert.equal((await app.call('/api/accounts/client-1', { method: 'DELETE', token })).status, 409);
    const updated = await app.call('/api/accounts/client-1', { method: 'PATCH', token, body: { lifecycle: 'warm', userId: second.user.id } });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.account.userId, undefined);
    await app.close();
    app = await start({ databasePath });
    assert.equal((await app.call('/api/auth/user', { token })).data.user.id, first.user.id);
    assert.equal((await app.call('/api/accounts', { token })).data.accounts[0].lifecycle, 'warm');
    assert.equal((await app.call('/api/visits', { token })).data.visits[0].notes, 'تمت الزيارة');
    assert.equal((await app.call('/api/appointments', { token })).data.appointments[0].reason, appointment.reason);
    assert.equal((await app.call('/api/agreements', { token })).data.agreements[0].total, 90);
    for (const collection of ['accounts', 'visits', 'appointments', 'agreements']) {
      assert.equal((await app.call(`/api/${collection}`, { token: anotherToken })).data[collection].length, 0);
    }
  } finally { await app.close(); rmSync(directory, { recursive: true, force: true }); }
});

test('validation rejects malformed data, wrong relationships and unsafe requests', async () => {
  const app = await start();
  try {
    const token = (await app.call('/api/auth/signup', { method: 'POST', body: signupInput() })).data.accessToken;
    assert.equal((await app.call('/api/auth/signup', { method: 'POST', body: { ...signupInput('x@example.com'), password: 'short' } })).status, 400);
    assert.equal((await app.call('/api/accounts', { method: 'POST', token, body: { ...accountInput, name: '' } })).status, 400);
    assert.equal((await app.call('/api/accounts', { method: 'POST', token, body: { ...accountInput, latitude: 91 } })).status, 400);
    assert.equal((await app.call('/api/accounts', { method: 'POST', token, body: { ...accountInput, lifecycle: 'admin' } })).status, 400);
    await app.call('/api/accounts', { method: 'POST', token, body: accountInput });
    await app.call('/api/accounts', { method: 'POST', token, body: { ...accountInput, id: 'client-2', name: 'Other client' } });
    assert.equal((await app.call('/api/visits', { method: 'POST', token, body: { ...visitInput, endTime: '2025-01-01T00:00:00Z' } })).status, 400);
    await app.call('/api/visits', { method: 'POST', token, body: visitInput });
    const appointment = { accountId: 'client-1', visitId: 'visit-1', date: '2026-11-10T09:00:00.000Z', time: '09:00', reason: 'Test' };
    assert.equal((await app.call('/api/appointments', { method: 'POST', token, body: appointment })).status, 201);
    assert.equal((await app.call('/api/appointments', { method: 'POST', token, body: { ...appointment, date: '2026-02-30' } })).status, 400);
    assert.equal((await app.call('/api/appointments', { method: 'POST', token, body: { ...appointment, accountId: 'client-2' } })).status, 400);
    const agreement = { id: 'agreement-1', accountId: 'client-1', visitId: 'visit-1', agreementNumber: 'CRM-1', services: [{ name: 'استشارة', price: 100, quantity: 1 }], subtotal: 100, discount: 10, total: 90, status: 'active', signatureData: pngSignature };
    assert.equal((await app.call('/api/agreements', { method: 'POST', token, body: { ...agreement, discount: 50, total: 50 } })).status, 400);
    assert.equal((await app.call('/api/agreements', { method: 'POST', token, body: { ...agreement, subtotal: 1000, total: 990 } })).status, 400);
    assert.equal((await app.call('/api/agreements', { method: 'POST', token, body: { ...agreement, signatureData: 'data:image/png;base64,AAAA' } })).status, 400);
    assert.equal((await app.call('/api/agreements', { method: 'POST', token, body: { ...agreement, paymentDates: [{ date: '2026-11-10', amount: 1, percentage: 100 }] } })).status, 400);
    const malformed = await fetch(`${app.base}/api/accounts`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: '{' });
    assert.equal(malformed.status, 400);
    const unsupported = await fetch(`${app.base}/api/accounts`, { method: 'POST', headers: { 'Content-Type': 'text/plain', Authorization: `Bearer ${token}` }, body: '{}' });
    assert.equal(unsupported.status, 415);
    const oversized = await app.call('/api/accounts', { method: 'POST', token, body: { ...accountInput, name: 'a'.repeat(2 * 1024 * 1024) } });
    assert.equal(oversized.status, 413);
  } finally { await app.close(); }
});

test('authentication endpoints are rate limited', async () => {
  const app = await start({ rateLimit: 2 });
  try {
    const body = { email: 'unknown@example.com', password: 'wrong' };
    assert.equal((await app.call('/api/auth/login', { method: 'POST', body })).status, 401);
    assert.equal((await app.call('/api/auth/login', { method: 'POST', body })).status, 401);
    const blocked = await app.call('/api/auth/login', { method: 'POST', body });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.data.code, 'RATE_LIMITED');
    assert.ok(Number(blocked.headers.get('retry-after')) > 0);
  } finally { await app.close(); }
});
