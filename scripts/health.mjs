import { existsSync } from 'node:fs';

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) process.loadEnvFile(file);
}
const base = process.argv[2] || `http://127.0.0.1:${process.env.API_PORT || process.env.PORT || 3001}`;
try {
  const response = await fetch(`${base.replace(/\/$/, '')}/api/health`, { signal: AbortSignal.timeout(5000) });
  const result = await response.json();
  if (!response.ok || result.status !== 'ok' || result.database !== 'ok') {
    throw new Error(`API/database not ready: HTTP ${response.status} ${JSON.stringify(result)}`);
  }
  console.log('PASS: API responded and the database query succeeded.');
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error(`FAIL: ${base}/api/health — ${error.message}`);
  console.error('Start the application with npm run dev (or npm start after npm run build).');
  process.exitCode = 1;
}
