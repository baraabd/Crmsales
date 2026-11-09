import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';

const compiled = await build({
  entryPoints: ['src/app/services/syncService.ts'], bundle: true, write: false,
  format: 'esm', platform: 'node', define: { 'import.meta.env': '{}' },
});
let sequence = 0;
async function fixture(fetch) {
  const values = new Map();
  const events = new EventTarget();
  globalThis.localStorage = {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
    key: index => [...values.keys()][index] ?? null,
    get length() { return values.size; },
  };
  globalThis.window = {
    setTimeout, clearTimeout, setInterval: () => 1, clearInterval() {},
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    dispatchEvent: events.dispatchEvent.bind(events),
  };
  globalThis.fetch = fetch;
  const source = `${compiled.outputFiles[0].text}\n// fixture ${sequence++}`;
  const { syncService, SyncService } = await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`);
  syncService.configureSession('alice', 'token-a');
  return { service: syncService, values, events, SyncService };
}
const ok = () => new Response(JSON.stringify({ success: true }), { headers: { 'content-type': 'application/json' } });
const account = id => ({ type: 'account', operation: 'create', data: { id, name: id } });

test('queue keeps writes added while a request is in flight and honors references', async () => {
  const requests = [];
  let release;
  const first = new Promise(resolve => { release = resolve; });
  const { service } = await fixture(async (url, options) => {
    requests.push({ url, data: JSON.parse(options.body) });
    if (requests.length === 1) await first;
    return ok();
  });
  service.addToQueue(account('customer'));
  const pending = service.processSyncQueue();
  service.addToQueue({ type: 'appointment', operation: 'create', data: { id: 'appointment', accountId: 'customer', visitId: 'visit' } });
  service.addToQueue({ type: 'visit', operation: 'create', data: { id: 'visit', accountId: 'customer' } });
  release();
  await pending;
  assert.deepEqual(requests.map(request => request.url), ['/api/accounts', '/api/visits', '/api/appointments']);
  assert.equal(service.getQueueSize(), 0);
  service.destroy();
});

test('failed requests survive more than three attempts and can be retried', async () => {
  let available = false;
  const { service } = await fixture(async () => {
    if (!available) throw new TypeError('Network failed');
    return ok();
  });
  service.addToQueue(account('retained'));
  for (let attempt = 0; attempt < 5; attempt++) await assert.rejects(service.processSyncQueue(), /تعذر الاتصال/);
  assert.equal(service.getQueueSize(), 1);
  assert.ok(service.getItems()[0].retryCount >= 5);
  available = true;
  await service.processSyncQueue();
  assert.equal(service.getQueueSize(), 0);
  service.destroy();
});

test('logout preserves pending writes only for their owner', async () => {
  const { service } = await fixture(async () => { throw new TypeError('offline'); });
  service.addToQueue(account('alice-only'));
  await assert.rejects(service.processSyncQueue());
  service.configureSession(null, null);
  assert.equal(service.getQueueSize(), 0);
  service.configureSession('bob', 'token-b');
  assert.equal(service.getQueueSize(), 0);
  service.configureSession('alice', 'new-token-a');
  assert.equal(service.getItems()[0].data.id, 'alice-only');
  service.destroy();
});

test('a later update cannot be removed by an earlier request acknowledgement', async () => {
  const writes = [];
  let release;
  const first = new Promise(resolve => { release = resolve; });
  const { service } = await fixture(async (_url, options) => {
    writes.push(JSON.parse(options.body));
    if (writes.length === 1) await first;
    return ok();
  });
  service.addToQueue(account('customer'));
  const pending = service.processSyncQueue();
  service.addToQueue({ type: 'account', operation: 'update', data: { id: 'customer', name: 'Updated' } });
  release();
  await pending;
  assert.equal(writes.length, 2);
  assert.equal(writes[1].name, 'Updated');
  assert.equal(service.getQueueSize(), 0);
  service.destroy();
});

test('unsupported payloads stay visibly failed instead of being reported as synced', async () => {
  let requests = 0;
  const { service } = await fixture(async () => { requests++; return ok(); });
  service.addToQueue({ type: 'media', operation: 'create', data: { id: 'photo' } });
  await assert.rejects(service.processSyncQueue(), /غير مدعوم/);
  assert.equal(requests, 0);
  assert.equal(service.getItems()[0].status, 'failed');
  service.destroy();
});

test('an acknowledged completion supersedes a failed earlier open visit', async () => {
  const writes = [];
  let release;
  const first = new Promise(resolve => { release = resolve; });
  const { service } = await fixture(async (_url, options) => {
    writes.push(JSON.parse(options.body));
    if (writes.length === 1) {
      await first;
      return new Response(JSON.stringify({ error: 'Temporary failure' }), {
        status: 500, headers: { 'content-type': 'application/json' },
      });
    }
    return ok();
  });
  service.addToQueue({ type: 'visit', operation: 'create', data: { id: 'visit', startTime: '2026-01-01T12:00:00Z' } });
  const pending = service.processSyncQueue();
  service.addToQueue({ type: 'visit', operation: 'update', data: { id: 'visit', startTime: '2026-01-01T12:00:00Z', endTime: '2026-01-01T12:10:00Z' } });
  release();
  await pending.catch(() => {});
  assert.equal(service.getQueueSize(), 0);
  await service.processSyncQueue();
  assert.equal(writes.length, 2, 'old open visit must never be retried after successful completion');
  assert.equal(writes[1].endTime, '2026-01-01T12:10:00Z');
  service.destroy();
});

test('two tabs cannot overwrite one another\'s offline queue', async () => {
  const { service: tabA, SyncService } = await fixture(async () => { throw new TypeError('offline'); });
  const tabB = new SyncService();
  tabB.configureSession('alice', 'token-a');
  tabA.addToQueue(account('from-tab-a'));
  await assert.rejects(tabA.processSyncQueue());
  tabB.addToQueue(account('from-tab-b'));
  await assert.rejects(tabB.processSyncQueue());
  tabA.destroy();
  tabB.destroy();
  const reopened = new SyncService();
  reopened.configureSession('alice', 'token-a');
  assert.deepEqual(reopened.getItems().map(item => item.data.id).sort(), ['from-tab-a', 'from-tab-b']);
  reopened.destroy();
});

test('storage exhaustion rejects a new write without changing the durable queue', async () => {
  const { service } = await fixture(async () => ok());
  const setItem = localStorage.setItem;
  localStorage.setItem = () => { throw new DOMException('Quota exceeded', 'QuotaExceededError'); };
  assert.throws(() => service.addToQueue(account('not-saved')), /مساحة التخزين/);
  assert.equal(service.getQueueSize(), 0);
  localStorage.setItem = setItem;
  service.destroy();
});
