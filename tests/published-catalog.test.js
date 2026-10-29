import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Other pages (the ProSupportTSA Tool Portfolio) read docs/tools.json, so the committed copy must match the source.
test('the published docs/tools.json matches src/data/tools.json', () => {
  const source = JSON.parse(readFileSync(new URL('../src/data/tools.json', import.meta.url), 'utf8'));
  const published = JSON.parse(readFileSync(new URL('../docs/tools.json', import.meta.url), 'utf8'));
  assert.deepEqual(published, source, 'run npm run build and commit docs/ after editing src/data/tools.json');
  assert.match(readFileSync(new URL('../vite.config.js', import.meta.url), 'utf8'), /fileName: 'tools\.json'/);
});
