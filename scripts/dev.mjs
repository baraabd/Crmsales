import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

if (Number(process.versions.node.split('.')[0]) !== 24) {
  console.error('CRM Sales requires Node.js 24 LTS. Run node --version to check.');
  process.exit(1);
}

const root = fileURLToPath(new URL('../', import.meta.url));
process.chdir(root);
// Environment variables supplied by the shell have priority.
for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const { values } = parseArgs({ options: {
  host: { type: 'string' },
  port: { type: 'string' },
}, strict: true });
const apiPort = Number(process.env.API_PORT || 3001);
const uiPort = Number(values.port || process.env.VITE_PORT || 5173);
for (const port of [apiPort, uiPort]) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('API_PORT and VITE_PORT must be valid TCP port numbers.');
  }
}
const { createCrmServer } = await import('../server/app.mjs');
const { createServer } = await import('vite');
const api = createCrmServer({
  databasePath: path.resolve(process.env.DATABASE_PATH || 'data/crmsales.sqlite'),
});
let vite;
let closing = false;
async function close(exitCode = 0) {
  if (closing) return;
  closing = true;
  await vite?.close();
  await api.close();
  process.exitCode = exitCode;
}

try {
  await new Promise((resolve, reject) => {
    api.server.once('error', reject);
    api.server.listen(apiPort, '127.0.0.1', resolve);
  });
  vite = await createServer({
    root,
    server: {
      host: values.host || process.env.HOST || '127.0.0.1',
      port: uiPort,
      proxy: { '/api': { target: `http://127.0.0.1:${apiPort}`, changeOrigin: false } },
    },
  });
  await vite.listen();
  console.log(`\nCRM Sales — frontend + API + persistent database\nAPI health: http://127.0.0.1:${apiPort}/api/health\n`);
  vite.printUrls();
  console.log('\nOpen the frontend URL. Choose “إنشاء حساب” on your first visit. Ctrl+C stops both servers.\n');
  process.once('SIGINT', () => void close());
  process.once('SIGTERM', () => void close());
} catch (error) {
  console.error(error?.code === 'EADDRINUSE'
    ? `Port ${apiPort} is already in use. Stop the other CRM Sales process or set API_PORT in .env.local.`
    : error);
  await close(1);
}
