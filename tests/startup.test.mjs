import test from 'node:test';
import assert from 'node:assert/strict';
import { copyFileSync, existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

test('a fresh source download without dependencies explains installation before opening the database', () => {
  const root = mkdtempSync(join(tmpdir(), 'crm-source-download-'));
  try {
    mkdirSync(join(root, 'scripts'));
    copyFileSync(new URL('../scripts/dev.mjs', import.meta.url), join(root, 'scripts/dev.mjs'));
    const result = spawnSync(process.execPath, ['scripts/dev.mjs'], {
      cwd: root, encoding: 'utf8', timeout: 10000,
    });
    assert.ifError(result.error);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /dependencies are missing: vite/);
    assert.match(result.stderr, /npm install --include=dev/);
    assert.match(result.stderr, /start-windows\.cmd/);
    assert.doesNotMatch(result.stderr, /ERR_MODULE_NOT_FOUND|node:internal\/|\bat ModuleLoader/);
    assert.equal(existsSync(join(root, 'data')), false);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
