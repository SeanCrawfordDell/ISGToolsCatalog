import test from 'node:test';
import assert from 'node:assert/strict';
import { filterMonthlyByYears } from '../src/utils/timeSavings.js';

const monthly = [
  { Month: '2024-12', Count: 4 },
  { Month: '2025-01', Count: 7 },
  { Month: '2025-09', Count: 3 }
];

test('filters time-savings months to selected years', () => {
  assert.deepEqual(filterMonthlyByYears(monthly, ['2025']), monthly.slice(1));
});

test('uses all months when no year is selected', () => {
  assert.deepEqual(filterMonthlyByYears(monthly, []), monthly);
});
