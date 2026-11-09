import { createServer as httpCreateServer } from 'node:http';
import { createHash, randomBytes, randomUUID, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { DatabaseSync } from 'node:sqlite';
import { mkdirSync, existsSync, statSync, createReadStream } from 'node:fs';
import { dirname, resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const scryptAsync = promisify(scrypt);
const projectRoot = fileURLToPath(new URL('../', import.meta.url));
const collectionNames = { accounts: 'account', visits: 'visit', appointments: 'appointment', agreements: 'agreement' };
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const DUMMY_PASSWORD = `scrypt:${'00'.repeat(16)}:${'00'.repeat(64)}`;

class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function invalid(message) { throw new HttpError(400, 'VALIDATION_ERROR', message); }

function string(value, label, { required = true, max = 1000, trim = true } = {}) {
  if (value === undefined || value === null) {
    if (!required) return undefined;
    invalid(`${label} مطلوب.`);
  }
  if (typeof value !== 'string') invalid(`${label} غير صالح.`);
  const result = trim ? value.trim() : value;
  if ((required && !result) || result.length > max) invalid(`${label} غير صالح.`);
  return result;
}

function numeric(value, label, minimum, maximum) {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < minimum || value > maximum) invalid(`${label} غير صالح.`);
  return value;
}

function enumValue(value, options, label) {
  if (!options.includes(value)) invalid(`${label} غير صالح.`);
  return value;
}

function dateTime(value, label, optional = false) {
  if (optional && (value === undefined || value === null || value === '')) return undefined;
  const candidate = string(value, label, { max: 60 });
  if (!Number.isFinite(Date.parse(candidate))) invalid(`${label} غير صالح.`);
  return candidate;
}

function identifier(value) {
  if (typeof value !== 'string' || !/^[\w.:\-]{1,160}$/.test(value)) invalid('معرّف السجل غير صالح.');
  return value;
}

function emailAddress(value) {
  const email = string(value, 'البريد الإلكتروني', { max: 254 }).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalid('أدخل بريدًا إلكترونيًا صالحًا.');
  return email;
}

function passwordValue(value) {
  const password = string(value, 'كلمة المرور', { max: 256, trim: false });
  if (password.length < 8) invalid('يجب ألا تقل كلمة المرور عن 8 أحرف.');
  return password;
}

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scryptAsync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  return `scrypt:${salt}:${derived.toString('hex')}`;
}

async function checkPassword(password, encoded) {
  const [, salt, hash] = encoded.split(':');
  const derived = await scryptAsync(password, salt, 64, { N: 32768, r: 8, p: 1, maxmem: 64 * 1024 * 1024 });
  const expected = Buffer.from(hash, 'hex');
  return derived.length === expected.length && timingSafeEqual(derived, expected);
}

function tokenHash(token) { return createHash('sha256').update(token).digest('hex'); }

function publicUser(row) {
  return { id: row.id, email: row.email, name: row.name, employeeId: row.employee_id, company: row.company };
}

export function openDatabase(databasePath = process.env.DATABASE_PATH || resolve(projectRoot, 'data/crmsales.sqlite')) {
  if (databasePath !== ':memory:') mkdirSync(dirname(resolve(databasePath)), { recursive: true, mode: 0o700 });
  const db = new DatabaseSync(databasePath);
  db.exec(`
    PRAGMA foreign_keys = ON;
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE,
      password_hash TEXT NOT NULL, name TEXT NOT NULL,
      employee_id TEXT NOT NULL, company TEXT NOT NULL DEFAULT '', created_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at INTEGER NOT NULL, created_at TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id);
    CREATE TABLE IF NOT EXISTS records (
      user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      collection TEXT NOT NULL CHECK (collection IN ('accounts', 'visits', 'appointments', 'agreements')),
      id TEXT NOT NULL, value TEXT NOT NULL CHECK (json_valid(value)),
      created_at TEXT NOT NULL, updated_at TEXT NOT NULL,
      PRIMARY KEY(user_id, collection, id)
    );
  `);
  return db;
}

export async function createUser(db, input) {
  const email = emailAddress(input.email);
  const name = string(input.name, 'الاسم', { max: 120 });
  const password = passwordValue(input.password);
  const company = string(input.company, 'اسم الشركة', { required: false, max: 160 }) || '';
  const employeeId = string(input.employeeId, 'رقم الموظف', { required: false, max: 120 }) || randomUUID().slice(0, 8);
  const passwordHash = await hashPassword(password);
  const id = randomUUID();
  try {
    db.prepare('INSERT INTO users (id, email, password_hash, name, employee_id, company, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, email, passwordHash, name, employeeId, company, new Date().toISOString());
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: users.email')) {
      throw new HttpError(409, 'ACCOUNT_EXISTS', 'تعذر إنشاء الحساب بهذا البريد. إذا كان لديك حساب، سجّل الدخول.');
    }
    throw error;
  }
  return publicUser(db.prepare('SELECT * FROM users WHERE id = ?').get(id));
}

function issueSession(db, user) {
  const token = randomBytes(32).toString('base64url');
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
  db.prepare('INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)')
    .run(tokenHash(token), user.id, Date.now() + SESSION_DURATION, new Date().toISOString());
  return { success: true, user, accessToken: token };
}

async function readBody(req) {
  if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
    throw new HttpError(415, 'JSON_REQUIRED', 'يجب إرسال الطلب بصيغة JSON.');
  }
  if (Number(req.headers['content-length']) > MAX_BODY_BYTES) throw new HttpError(413, 'BODY_TOO_LARGE', 'حجم الطلب أكبر من المسموح.');
  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw new HttpError(413, 'BODY_TOO_LARGE', 'حجم الطلب أكبر من المسموح.');
    chunks.push(chunk);
  }
  let body;
  try { body = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
  catch { invalid('صيغة JSON غير صحيحة.'); }
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalid('يجب أن يحتوي الطلب على كائن JSON.');
  return body;
}

function sendJson(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
  res.end(JSON.stringify(body));
}

function validateRecord(collection, input, previous, db, userId) {
  const record = { ...previous, ...input };
  // Ownership and timestamps always come from the server, never client JSON.
  delete record.userId;
  delete record.user_id;
  delete record.createdAt;
  delete record.updatedAt;
  record.id = identifier(record.id || randomUUID());

  const ensureOwned = (target, id) => {
    identifier(id);
    const found = db.prepare('SELECT value FROM records WHERE user_id = ? AND collection = ? AND id = ?').get(userId, target, id);
    if (!found) throw new HttpError(404, 'RELATED_RECORD_NOT_FOUND', 'العميل أو الزيارة المرتبطة غير موجودة في حسابك.');
    return JSON.parse(found.value);
  };
  if (collection === 'accounts') {
    record.name = string(record.name, 'اسم العميل', { max: 200 });
    for (const field of ['contactPerson', 'phone', 'address', 'photoUrl']) {
      if (record[field] !== undefined) record[field] = string(record[field], field, { required: false, max: 2000 });
    }
    record.latitude = numeric(record.latitude ?? 0, 'خط العرض', -90, 90);
    record.longitude = numeric(record.longitude ?? 0, 'خط الطول', -180, 180);
    record.lifecycle = enumValue(record.lifecycle ?? 'prospect', ['prospect', 'cold', 'warm', 'customer', 'lost'], 'حالة العميل');
    record.pinColor = enumValue(record.pinColor ?? 'blue', ['green', 'blue', 'yellow', 'gray'], 'لون العلامة');
    if (record.nextAction != null) {
      if (typeof record.nextAction !== 'object' || Array.isArray(record.nextAction)) invalid('الإجراء القادم غير صالح.');
      record.nextAction = {
        type: enumValue(record.nextAction.type, ['appointment', 'followUp', 'none'], 'الإجراء القادم'),
        datetime: dateTime(record.nextAction.datetime, 'موعد الإجراء القادم', true),
        notes: string(record.nextAction.notes, 'ملاحظات الإجراء القادم', { required: false, max: 10000 }),
      };
    }
    if (record.lastVisit) record.lastVisit = dateTime(record.lastVisit, 'آخر زيارة');
  } else {
    record.accountId = identifier(record.accountId);
    ensureOwned('accounts', record.accountId);
    if (record.visitId) {
      const visit = ensureOwned('visits', record.visitId);
      if (visit.accountId !== record.accountId) invalid('الزيارة لا تخص هذا العميل.');
    }
    if (record.notes !== undefined) record.notes = string(record.notes, 'الملاحظات', { required: false, max: 10000 });
    if (collection === 'visits') {
      record.startTime = dateTime(record.startTime, 'وقت بدء الزيارة');
      record.endTime = dateTime(record.endTime, 'وقت انتهاء الزيارة', true);
      record.latitude = numeric(record.latitude ?? 0, 'خط العرض', -90, 90);
      record.longitude = numeric(record.longitude ?? 0, 'خط الطول', -180, 180);
      if (record.endTime && Date.parse(record.endTime) < Date.parse(record.startTime)) invalid('نهاية الزيارة يجب أن تكون بعد بدايتها.');
      if (record.outcome !== undefined) record.outcome = enumValue(record.outcome, ['deal', 'appointment', 'busy', 'rejected'], 'نتيجة الزيارة');
      if (record.duration !== undefined) record.duration = numeric(record.duration, 'مدة الزيارة', 0, 10000000);
    }
    if (collection === 'appointments') {
      record.date = string(record.date, 'تاريخ الموعد', { max: 60 });
      const datePart = record.date.slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2}))?$/.test(record.date) || !Number.isFinite(Date.parse(record.date)) || new Date(datePart).toISOString().slice(0, 10) !== datePart) invalid('تاريخ الموعد غير صالح.');
      record.time = string(record.time, 'وقت الموعد', { max: 5 });
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(record.time)) invalid('وقت الموعد غير صالح.');
      record.reason = string(record.reason, 'سبب الموعد', { max: 1000 });
      record.status = enumValue(record.status ?? 'scheduled', ['scheduled', 'completed', 'cancelled'], 'حالة الموعد');
    }
    if (collection === 'agreements') {
      record.agreementNumber = string(record.agreementNumber, 'رقم الاتفاقية', { max: 120 });
      if (!Array.isArray(record.services) || record.services.length === 0 || record.services.length > 100) invalid('أضف خدمة واحدة على الأقل إلى الاتفاقية.');
      let packageCount = 0;
      record.services = record.services.map(service => {
        if (!service || typeof service !== 'object' || Array.isArray(service)) invalid('الخدمة غير صالحة.');
        const quantity = numeric(service.quantity, 'كمية الخدمة', 1, 100);
        if (!Number.isInteger(quantity)) invalid('كمية الخدمة يجب أن تكون عدداً صحيحاً.');
        if (service.category === 'package') {
          packageCount += 1;
          if (packageCount > 1 || quantity !== 1) invalid('يمكن اختيار باقة واحدة فقط لكل اتفاق.');
        }
        return { ...service, name: string(service.name, 'اسم الخدمة', { max: 200 }), price: numeric(service.price, 'سعر الخدمة', 0, 1000000000), quantity };
      });
      record.subtotal = numeric(record.subtotal, 'المجموع', 0, 1000000000);
      record.discount = numeric(record.discount ?? 0, 'الخصم', 0, record.subtotal);
      record.total = numeric(record.total, 'الإجمالي', 0, 1000000000);
      const serviceTotal = Math.round(record.services.reduce((sum, service) => sum + service.price * service.quantity, 0) * 100) / 100;
      if (Math.abs(record.subtotal - serviceTotal) > 0.02) invalid('المجموع لا يطابق أسعار الخدمات وكمياتها.');
      if (record.discount > Math.round(record.subtotal * 10) / 100 + 0.001) invalid('الخصم الأقصى المتاح هو 10%.');
      if (Math.abs(record.subtotal - record.discount - record.total) > 0.02) invalid('الإجمالي لا يطابق المجموع بعد الخصم.');
      record.status = enumValue(record.status ?? 'active', ['active', 'completed', 'cancelled'], 'حالة الاتفاقية');
      for (const field of ['duration', 'durationLabel', 'implementation', 'payment', 'customNotes']) {
        if (record[field] !== undefined) record[field] = string(record[field], field, { required: false, max: 10000 });
      }
      if (record.startDate) record.startDate = dateTime(record.startDate, 'تاريخ بدء الاتفاقية');
      if (record.endDate) record.endDate = dateTime(record.endDate, 'تاريخ انتهاء الاتفاقية');
      if (record.startDate && record.endDate && Date.parse(record.endDate) < Date.parse(record.startDate)) invalid('نهاية الاتفاقية يجب أن تكون بعد بدايتها.');
      if (record.paymentDates !== undefined) {
        if (!Array.isArray(record.paymentDates) || !record.paymentDates.length || record.paymentDates.length > 100) invalid('جدول الدفع غير صالح.');
        record.paymentDates = record.paymentDates.map(payment => ({
          date: dateTime(payment?.date, 'تاريخ الدفعة'),
          amount: numeric(payment?.amount, 'قيمة الدفعة', 0, 1000000000),
          percentage: numeric(payment?.percentage, 'نسبة الدفعة', 0, 100),
        }));
        const paymentTotal = record.paymentDates.reduce((sum, payment) => sum + payment.amount, 0);
        const percentageTotal = record.paymentDates.reduce((sum, payment) => sum + payment.percentage, 0);
        if (Math.abs(paymentTotal - record.total) > 0.02 || Math.abs(percentageTotal - 100) > 0.001) invalid('جدول الدفع لا يطابق قيمة الاتفاقية.');
      }
      record.signatureData = string(record.signatureData, 'التوقيع', { max: 1000000 });
      if (!/^data:image\/png;base64,[A-Za-z0-9+/=]+$/.test(record.signatureData)) invalid('صيغة التوقيع غير صالحة.');
      const signature = Buffer.from(record.signatureData.slice('data:image/png;base64,'.length), 'base64');
      if (signature.length < 32 || !signature.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')) || !signature.subarray(-8, -4).equals(Buffer.from('IEND'))) invalid('يجب أن يكون التوقيع صورة PNG صالحة.');
    }
  }
  return record;
}

/** Creates a real HTTP API. Tests may use :memory: or an isolated temporary file. */
export function createCrmServer({ databasePath, staticDir, rateLimit = 40, logError = console.error } = {}) {
  const db = openDatabase(databasePath);
  const limits = new Map();
  const publicDir = staticDir ? resolve(staticDir) : undefined;
  let databaseClosed = false;

  function limitAuth(req, res) {
    const key = req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    // Expired entries are pruned as requests arrive; no background timer keeps Node alive.
    for (const [ip, entry] of limits) if (entry.until <= now) limits.delete(ip);
    const entry = limits.get(key) || { count: 0, until: now + 15 * 60 * 1000 };
    entry.count += 1;
    limits.set(key, entry);
    if (entry.count > rateLimit) {
      res.setHeader('Retry-After', String(Math.ceil((entry.until - now) / 1000)));
      throw new HttpError(429, 'RATE_LIMITED', 'طلبات كثيرة لتسجيل الدخول. حاول مرة أخرى بعد بضع دقائق.');
    }
  }

  function authenticated(req) {
    const match = /^Bearer ([A-Za-z0-9_-]{43})$/.exec(req.headers.authorization || '');
    if (!match) throw new HttpError(401, 'UNAUTHENTICATED', 'يرجى تسجيل الدخول للمتابعة.');
    const session = db.prepare('SELECT users.*, sessions.token_hash FROM sessions JOIN users ON users.id = sessions.user_id WHERE token_hash = ? AND expires_at > ?')
      .get(tokenHash(match[1]), Date.now());
    if (!session) throw new HttpError(401, 'SESSION_EXPIRED', 'انتهت الجلسة. سجّل الدخول مرة أخرى.');
    return session;
  }

  function getRecord(userId, collection, id) {
    const row = db.prepare('SELECT value FROM records WHERE user_id = ? AND collection = ? AND id = ?').get(userId, collection, id);
    return row ? JSON.parse(row.value) : undefined;
  }

  const server = httpCreateServer(async (req, res) => {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = url.pathname.replace(/\/$/, '') || '/';
      if (pathname === '/api/health' && req.method === 'GET') {
        // Check an application table as well as the connection: missing schema is unhealthy.
        try {
          db.prepare('SELECT 1 AS ok FROM users LIMIT 1').all();
          return sendJson(res, 200, { status: 'ok', database: 'ok' });
        } catch (error) {
          logError('[health] Database unavailable:', error.message);
          return sendJson(res, 503, { status: 'error', database: 'error', code: 'DATABASE_UNAVAILABLE', error: 'تعذر الاتصال بقاعدة البيانات.' });
        }
      }
      if (pathname === '/api/auth/signup' && req.method === 'POST') {
        limitAuth(req, res);
        const user = await createUser(db, await readBody(req));
        return sendJson(res, 201, issueSession(db, user));
      }
      if (pathname === '/api/auth/login' && req.method === 'POST') {
        limitAuth(req, res);
        const body = await readBody(req);
        const email = emailAddress(body.email);
        const password = string(body.password, 'كلمة المرور', { max: 256, trim: false });
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
        const valid = await checkPassword(password, user?.password_hash || DUMMY_PASSWORD);
        if (!user || !valid) throw new HttpError(401, 'INVALID_CREDENTIALS', 'البريد الإلكتروني أو كلمة المرور غير صحيحة.');
        return sendJson(res, 200, issueSession(db, publicUser(user)));
      }
      if (pathname.startsWith('/api/')) {
        const user = authenticated(req);
        if (pathname === '/api/auth/user') {
          if (req.method === 'GET') return sendJson(res, 200, { success: true, user: publicUser(user) });
          if (req.method === 'PATCH') {
            const input = await readBody(req);
            const name = input.name === undefined ? user.name : string(input.name, 'الاسم', { max: 120 });
            const company = input.company === undefined ? user.company : string(input.company, 'اسم الشركة', { required: false, max: 160 }) || '';
            db.prepare('UPDATE users SET name = ?, company = ? WHERE id = ?').run(name, company, user.id);
            return sendJson(res, 200, { success: true, user: publicUser({ ...user, name, company }) });
          }
        }
        if (pathname === '/api/auth/logout' && req.method === 'POST') {
          db.prepare('DELETE FROM sessions WHERE token_hash = ?').run(user.token_hash);
          return sendJson(res, 200, { success: true });
        }
        const match = /^\/api\/(accounts|visits|appointments|agreements)(?:\/([^/]+))?$/.exec(pathname);
        if (match) {
          const [, collection, rawId] = match;
          const id = rawId ? identifier(decodeURIComponent(rawId)) : undefined;
          const singular = collectionNames[collection];
          if (req.method === 'GET') {
            if (id) {
              const record = getRecord(user.id, collection, id);
              if (!record) throw new HttpError(404, 'NOT_FOUND', 'السجل غير موجود.');
              return sendJson(res, 200, { success: true, [singular]: record });
            }
            const records = db.prepare('SELECT value FROM records WHERE user_id = ? AND collection = ? ORDER BY created_at, id').all(user.id, collection).map(row => JSON.parse(row.value));
            return sendJson(res, 200, { success: true, [collection]: records });
          }
          if ((req.method === 'POST' && !id) || (req.method === 'PATCH' && id)) {
            const body = await readBody(req);
            if (id && body.id && body.id !== id) invalid('معرّف السجل في الطلب لا يطابق الرابط.');
            const recordId = id || body.id || randomUUID();
            identifier(recordId);
            const previous = getRecord(user.id, collection, recordId);
            if (req.method === 'PATCH' && !previous) throw new HttpError(404, 'NOT_FOUND', 'السجل غير موجود.');
            const record = validateRecord(collection, { ...body, id: recordId }, previous, db, user.id);
            const now = new Date().toISOString();
            record.createdAt = previous?.createdAt || now;
            record.updatedAt = now;
            db.prepare('INSERT INTO records (user_id, collection, id, value, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(user_id, collection, id) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at')
              .run(user.id, collection, record.id, JSON.stringify(record), record.createdAt, now);
            return sendJson(res, previous ? 200 : 201, { success: true, [singular]: record });
          }
          if (req.method === 'DELETE' && id) {
            if (!getRecord(user.id, collection, id)) throw new HttpError(404, 'NOT_FOUND', 'السجل غير موجود.');
            const field = collection === 'accounts' ? '$.accountId' : collection === 'visits' ? '$.visitId' : null;
            if (field && db.prepare('SELECT 1 FROM records WHERE user_id = ? AND json_extract(value, ?) = ? LIMIT 1').get(user.id, field, id)) {
              throw new HttpError(409, 'RECORD_IN_USE', 'لا يمكن حذف سجل مرتبط بزيارات أو مواعيد أو اتفاقيات.');
            }
            db.prepare('DELETE FROM records WHERE user_id = ? AND collection = ? AND id = ?').run(user.id, collection, id);
            return sendJson(res, 200, { success: true });
          }
        }
        throw new HttpError(404, 'NOT_FOUND', 'مسار API غير موجود.');
      }
      if (publicDir && ['GET', 'HEAD'].includes(req.method)) {
        const requestedPath = decodeURIComponent(url.pathname);
        const resolvedPath = resolve(publicDir, `.${requestedPath}`);
        if (resolvedPath !== publicDir && !resolvedPath.startsWith(publicDir + sep)) throw new HttpError(404, 'NOT_FOUND', 'الملف غير موجود.');
        const file = existsSync(resolvedPath) && statSync(resolvedPath).isFile() ? resolvedPath : !extname(requestedPath) ? resolve(publicDir, 'index.html') : null;
        if (file && existsSync(file)) {
          const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.json': 'application/json' };
          res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff', 'Cache-Control': file.includes(`${sep}assets${sep}`) ? 'public, max-age=31536000, immutable' : 'no-cache' });
          if (req.method === 'HEAD') return res.end();
          const stream = createReadStream(file);
          stream.on('error', () => res.destroy());
          return stream.pipe(res);
        }
      }
      throw new HttpError(404, 'NOT_FOUND', 'المسار غير موجود.');
    } catch (error) {
      if (res.headersSent) return res.destroy();
      if (error instanceof HttpError) return sendJson(res, error.status, { success: false, code: error.code, error: error.message });
      logError('[api] Request failed:', error.message);
      sendJson(res, 500, { success: false, code: 'INTERNAL_ERROR', error: 'حدث خطأ في الخادم. حاول مرة أخرى وراجع سجل الخادم.' });
    }
  });
  server.requestTimeout = 30000;
  server.headersTimeout = 15000;

  return {
    server, db,
    async close() {
      if (server.listening) await new Promise((resolveClose, reject) => server.close(error => error ? reject(error) : resolveClose()));
      if (!databaseClosed) { db.close(); databaseClosed = true; }
    },
  };
}
