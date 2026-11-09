import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { createCrmServer } from '../server/app.mjs';

const directory = mkdtempSync(join(tmpdir(), 'crmsales-browser-'));
const app = createCrmServer({ databasePath: join(directory, 'test.sqlite'), staticDir: resolve('dist') });
await new Promise(resolve => app.server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${app.server.address().port}`;
let browser;
let page;
const pageErrors = [];
const externalRequests = [];
const serverErrors = [];
const resultsDir = resolve('test-results');
mkdirSync(resultsDir, { recursive: true });
const password = 'Browser-test-only-passphrase-2026';
const email = 'browser-test@example.com';
const clientName = 'عميل اختبار المتصفح';
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function eventually(check, description) {
  const until = Date.now() + 12000;
  let failure;
  while (Date.now() < until) {
    try { const result = await check(); if (result) return result; } catch (error) { failure = error; }
    await delay(100);
  }
  throw new Error(`${description}${failure ? `: ${failure.message}` : ''}`);
}
async function session() {
  return page.evaluate(() => {
    const key = Object.keys(localStorage).find(key => key.startsWith('crm:v2:') && key.endsWith(':session'));
    return key ? JSON.parse(localStorage.getItem(key)) : null;
  });
}
async function records(collection, token) {
  const response = await fetch(`${base}/api/${collection}`, { headers: { Authorization: `Bearer ${token}` } });
  assert.equal(response.status, 200);
  return (await response.json())[collection];
}
async function login(userEmail = email, userPassword = password) {
  await page.getByLabel('البريد الإلكتروني', { exact: true }).fill(userEmail);
  await page.getByLabel('كلمة المرور', { exact: true }).fill(userPassword);
  await page.getByRole('button', { name: 'تسجيل الدخول', exact: true }).click();
}
async function addClient(name) {
  await page.getByRole('link', { name: 'إضافة عميل', exact: true }).click();
  await page.getByLabel('اسم العميل', { exact: true }).fill(name);
  await page.getByLabel('اسم مسؤول التواصل').fill('مسؤول الاختبار');
  await page.getByLabel('رقم الهاتف').fill('0501234567');
  await page.getByLabel('العنوان', { exact: true }).fill('عنوان الاختبار');
  await page.getByLabel('خط العرض', { exact: true }).fill('24.7136');
  await page.getByLabel('خط الطول', { exact: true }).fill('46.6753');
  await page.getByRole('button', { name: 'حفظ العميل', exact: true }).click();
  await page.getByRole('heading', { name, exact: true }).waitFor();
}
async function beginVisit() {
  await page.getByRole('link', { name: 'بدء زيارة لهذا العميل', exact: true }).click();
  await page.getByLabel('خط عرض الزيارة').fill('24.7136');
  await page.getByLabel('خط طول الزيارة').fill('46.6753');
  await page.getByRole('button', { name: 'تسجيل بدء الزيارة' }).click();
  await page.getByRole('heading', { name: 'الزيارة جارية' }).waitFor();
  await page.getByLabel('ملاحظات الزيارة', { exact: true }).fill('ملاحظات محفوظة من اختبار المتصفح');
  await page.getByRole('link', { name: 'إنهاء الزيارة وتحديد النتيجة' }).click();
}

try {
  browser = await chromium.launch({ headless: true, executablePath: process.env.CRM_CHROMIUM_PATH || undefined });
  const context = await browser.newContext({ viewport: { width: 393, height: 852 }, locale: 'ar-SA' });
  page = await context.newPage();
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('response', response => { if (response.status() >= 500) serverErrors.push(`${response.status()} ${response.url()}`); });
  await context.route('**/*', route => {
    if (route.request().url().startsWith(base + '/')) return route.continue();
    externalRequests.push(route.request().url());
    return route.abort();
  });
  await page.goto(`${base}/app/leads-new`);
  await page.waitForURL('**/auth/login');
  const loginButtonPadding = await page.getByRole('button', { name: 'تسجيل الدخول', exact: true })
    .evaluate(button => Number.parseFloat(getComputedStyle(button).paddingTop));
  assert.ok(loginButtonPadding >= 10, 'Global CSS must not override Tailwind button spacing');
  const loginField = await page.getByLabel('البريد الإلكتروني', { exact: true }).boundingBox();
  assert.ok(loginField.x >= 20 && loginField.width < 360, 'Mobile forms need readable horizontal spacing');
  await page.screenshot({ path: join(resultsDir, 'login.png'), fullPage: true });
  console.log('PASS: unauthenticated routes are protected; login screen rendered.');

  await page.getByRole('link', { name: /إنشاء حساب/ }).click();
  await page.getByLabel('الاسم الكامل').fill('مندوب الاختبار');
  await page.getByLabel('البريد الإلكتروني', { exact: true }).fill(email);
  await page.getByLabel('الشركة (اختياري)').fill('شركة الاختبار');
  await page.getByLabel('كلمة المرور', { exact: true }).fill(password);
  await page.getByLabel('تأكيد كلمة المرور').fill(password);
  await page.getByRole('button', { name: 'إنشاء الحساب', exact: true }).click();
  await page.waitForURL('**/app/home-new');
  const firstSession = await session();
  assert.ok(firstSession?.accessToken);
  const token = firstSession.accessToken;
  await page.getByRole('button', { name: 'بدء الدوام', exact: true }).click();
  await addClient(clientName);
  const account = await eventually(async () => (await records('accounts', token)).find(a => a.name === clientName), 'Customer was not persisted');
  await page.reload();
  await page.getByRole('heading', { name: clientName, exact: true }).waitFor();
  console.log('PASS: real signup, clock-in, customer creation and persistence after reload.');

  await beginVisit();
  await page.getByRole('link', { name: /حجز موعد/ }).click();
  const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  await page.getByLabel('تاريخ الموعد').fill(tomorrow);
  await page.getByLabel('وقت الموعد').fill('12:30');
  await page.getByLabel('سبب الموعد').fill('مراجعة العرض');
  await page.getByLabel('ملاحظات الموعد').fill('موعد حقيقي للاختبار');
  await page.getByRole('button', { name: 'حفظ الموعد', exact: true }).click();
  await page.waitForURL('**/app/calendar-new');
  await eventually(async () => (await records('appointments', token)).length === 1 && (await records('visits', token)).some(v => v.outcome === 'appointment' && v.endTime), 'Appointment or completed visit did not reach database');
  console.log('PASS: appointment and visit outcome saved through the UI to the API/database.');

  await page.goto(`${base}/app/leads/${account.id}`);
  await beginVisit();
  await page.getByRole('link', { name: /اتفاق على خدمات/ }).click();
  await page.getByLabel('كمية باقة أساسية', { exact: true }).fill('1');
  await page.getByLabel('نسبة الخصم (%)').fill('5');
  await page.getByLabel('شروط وملاحظات إضافية').fill('اتفاق الاختبار مع جدول الدفع');
  const canvas = page.locator('canvas[aria-label="توقيع العميل"]');
  await canvas.scrollIntoViewIfNeeded();
  const box = await canvas.boundingBox();
  assert.ok(box);
  await page.mouse.move(box.x + 40, box.y + 80);
  await page.mouse.down();
  await page.mouse.move(box.x + 100, box.y + 35, { steps: 8 });
  await page.mouse.move(box.x + 180, box.y + 100, { steps: 8 });
  await page.mouse.up();
  await page.getByRole('checkbox', { name: /أوافق على الخدمات/ }).check();
  await page.getByRole('button', { name: 'حفظ الاتفاق وإنهاء الزيارة' }).click();
  await page.waitForURL('**/app/agreements/*');
  const agreement = await eventually(async () => (await records('agreements', token))[0], 'Signed agreement did not reach database');
  assert.match(agreement.signatureData, /^data:image\/png;base64,/);
  assert.equal(agreement.total, agreement.subtotal - agreement.discount);
  assert.equal(agreement.paymentDates.reduce((sum, item) => sum + item.amount, 0), agreement.total);
  await page.reload();
  await page.getByRole('img', { name: 'توقيع العميل المحفوظ على الاتفاق' }).waitFor();
  await page.screenshot({ path: join(resultsDir, 'signed-agreement.png'), fullPage: true });
  console.log('PASS: signed agreement, prices, installments and deal persisted; signature survives reload.');

  await page.goto(`${base}/app/leads/${account.id}`);
  await beginVisit();
  await page.getByRole('link', { name: /غير مهتم/ }).click();
  await page.getByLabel('سبب الرفض', { exact: true }).selectOption('لا توجد حاجة حالياً');
  await page.getByLabel('تفاصيل الرفض').fill('نتيجة زيارة لاحقة للاختبار');
  await page.getByRole('button', { name: 'حفظ النتيجة وإنهاء الزيارة' }).click();
  await page.waitForURL(`${base}/app/leads/${account.id}`);
  await eventually(async () => (await records('visits', token)).some(v => v.outcome === 'rejected'), 'Rejected visit did not reach database');
  console.log('PASS: rejection is saved and navigates to the customer instead of a stale-visit redirect.');

  await page.goto(`${base}/app/home-new`);
  await page.getByRole('heading', { name: /مرحباً/ }).waitFor();
  await context.setOffline(true);
  await addClient('عميل محفوظ أثناء انقطاع الشبكة');
  assert.equal((await records('accounts', token)).length, 1);
  await context.setOffline(false);
  await eventually(async () => (await records('accounts', token)).length === 2, 'Offline customer was not retried');
  await page.reload();
  await page.getByRole('heading', { name: 'عميل محفوظ أثناء انقطاع الشبكة', exact: true }).waitFor();
  console.log('PASS: offline write is retained, then synchronized when connection returns.');

  await page.goto(`${base}/app/profile-new`);
  await page.getByLabel('الاسم الكامل').fill('مندوب بعد التعديل');
  await page.getByRole('button', { name: 'حفظ بيانات الحساب' }).click();
  await page.getByRole('status').filter({ hasText: 'تم حفظ بيانات الحساب' }).waitFor();
  await page.getByRole('button', { name: 'تسجيل الخروج', exact: true }).click();
  await page.waitForURL('**/auth/login');
  await eventually(async () => (await fetch(`${base}/api/auth/user`, { headers: { Authorization: `Bearer ${token}` } })).status === 401, 'Logout did not revoke server session');
  await page.reload();
  await page.getByRole('heading', { name: 'تسجيل الدخول', exact: true }).waitFor();
  await login(email, 'Wrong-password');
  await page.getByRole('alert').filter({ hasText: 'غير صحيحة' }).waitFor();
  await page.route('**/api/auth/login', route => route.abort('failed'));
  await login();
  await page.getByRole('alert').filter({ hasText: 'تعذر الاتصال بالخادم' }).waitFor();
  await page.unroute('**/api/auth/login');
  let releaseInitialLoad;
  let waitingForAccounts = false;
  const initialLoad = new Promise(resolve => { releaseInitialLoad = resolve; });
  const holdInitialAccounts = async route => {
    if (route.request().method() === 'GET') {
      waitingForAccounts = true;
      await initialLoad;
    }
    await route.continue();
  };
  await page.route('**/api/accounts', holdInitialAccounts);
  await login();
  await eventually(() => waitingForAccounts, 'Initial account load did not start');
  // Allow React to paint while the database response is deliberately held open.
  await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
  assert.equal(await page.getByRole('heading', { name: 'مرحباً مندوب بعد التعديل' }).count(), 0,
    'The dashboard must wait for initial data hydration');
  assert.equal(await page.getByRole('button', { name: 'بدء الدوام', exact: true }).count(), 0,
    'Clock-in must not invalidate the initial data read');
  releaseInitialLoad();
  await page.waitForURL('**/app/home-new');
  await page.unroute('**/api/accounts', holdInitialAccounts);
  await page.getByRole('heading', { name: 'مرحباً مندوب بعد التعديل' }).waitFor();
  await page.getByRole('button', { name: 'بدء الدوام', exact: true }).click();
  await page.getByRole('link', { name: 'العملاء', exact: true }).click();
  await page.getByText(clientName, { exact: true }).waitFor();
  await page.getByText('عميل محفوظ أثناء انقطاع الشبكة', { exact: true }).waitFor();
  assert.equal((await records('accounts', (await session()).accessToken)).length, 2);
  console.log('PASS: profile update, logout/revocation, error types, and re-login waits for initial data before clock-in.');

  for (const route of ['map-new', 'calendar-new', 'leads-new', 'stats-new', 'profile-new', 'notifications-new', 'services-new', 'timesheet', 'sync-status', 'settings', 'help']) {
    await page.goto(`${base}/app/${route}`);
    await page.locator('h1').first().waitFor();
    assert.ok(!await page.getByText('تعذر عرض الصفحة', { exact: true }).count(), `Route failed: ${route}`);
  }
  await page.goto(`${base}/app/home-new`);
  await page.getByRole('heading', { name: /مرحباً/ }).waitFor();
  await page.screenshot({ path: join(resultsDir, 'dashboard.png'), fullPage: true });
  assert.deepEqual(pageErrors, []);
  assert.deepEqual(externalRequests, []);
  assert.deepEqual(serverErrors, []);
  console.log('PASS: all main routes render without JavaScript exceptions, external backend calls or HTTP 5xx.');
  console.log('Browser journey passed. Test database was isolated and will be removed.');
} catch (error) {
  if (page) {
    await page.screenshot({ path: join(resultsDir, 'failure.png'), fullPage: true }).catch(() => {});
    console.error('PAGE URL:', page.url());
    console.error('PAGE TEXT:', (await page.locator('body').innerText().catch(() => '')).slice(-6000));
  }
  throw error;
} finally {
  await browser?.close();
  await app.close();
  rmSync(directory, { recursive: true, force: true });
}
