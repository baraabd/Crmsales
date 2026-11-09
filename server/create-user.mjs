import { parseArgs } from 'node:util';
import { loadEnvFile } from 'node:process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createInterface } from 'node:readline/promises';
import { openDatabase, createUser, hashPassword } from './app.mjs';

for (const name of ['.env.local', '.env']) {
  const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
  if (existsSync(path)) loadEnvFile(path);
}
const { values } = parseArgs({ options: { email: { type: 'string' }, name: { type: 'string' }, 'employee-id': { type: 'string' }, company: { type: 'string' }, reset: { type: 'boolean', default: false } } });
let password = process.env.CRM_USER_PASSWORD;
if (!values.email || (!values.reset && !values.name)) {
  console.error('Usage: npm run user:create -- --email user@example.com --name "Your name"\nPassword: set CRM_USER_PASSWORD, or enter it at the local prompt.\nTo reset a local account: npm run user:create -- --email user@example.com --reset');
  process.exit(1);
}
if (!password) {
  if (!process.stdin.isTTY) {
    console.error('CRM_USER_PASSWORD is required when running without an interactive terminal.');
    process.exit(1);
  }
  const readline = createInterface({ input: process.stdin, output: process.stdout });
  try { password = await readline.question('New password (at least 8 characters; input is visible): '); }
  finally { readline.close(); }
}
const db = openDatabase();
try {
  if (values.reset) {
    if (password.length < 8 || password.length > 256) throw new Error('Password must contain 8–256 characters.');
    const user = db.prepare('SELECT id FROM users WHERE email = ?').get(values.email.trim().toLowerCase());
    if (!user) throw new Error('No local account exists with that email.');
    const encoded = await hashPassword(password);
    db.exec('BEGIN');
    try {
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(encoded, user.id);
      db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
      db.exec('COMMIT');
    } catch (error) { db.exec('ROLLBACK'); throw error; }
    console.log('Local password updated. All previous sessions were revoked.');
  } else {
    const user = await createUser(db, { email: values.email, password, name: values.name, employeeId: values['employee-id'], company: values.company });
    console.log(`Local account created: ${user.email}`);
  }
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally { db.close(); }
