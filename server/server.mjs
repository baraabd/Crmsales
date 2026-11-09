import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { createCrmServer } from './app.mjs';

for (const name of ['.env.local', '.env']) {
  const path = fileURLToPath(new URL(`../${name}`, import.meta.url));
  if (existsSync(path)) loadEnvFile(path);
}
const host = process.env.HOST || '127.0.0.1';
const port = Number(process.env.PORT || process.env.API_PORT || 3001);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer between 1 and 65535.');
const app = createCrmServer({ staticDir: fileURLToPath(new URL('../dist', import.meta.url)) });
app.server.once('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is already in use. Stop the existing API or change API_PORT.` : error.message);
  process.exitCode = 1;
  app.close().catch(() => {});
});
app.server.listen(port, host, () => {
  console.log(`CRM API ready: http://${host}:${port}/api/health`);
  console.log('Database: persistent SQLite. Create your account from the registration screen.');
});
let closing = false;
async function stop() {
  if (closing) return;
  closing = true;
  await app.close();
}
process.once('SIGINT', stop);
process.once('SIGTERM', stop);
