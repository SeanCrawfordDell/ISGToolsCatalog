import test from 'node:test';
import assert from 'node:assert/strict';
import { formatReportMonth, formatReportDate } from '../src/utils/reportFormatting.js';

test('report month labels stay in the month recorded by telemetry', () => {
  assert.equal(formatReportMonth('2026-09'), 'Sep 2026');
});

test('report date labels stay on the day recorded by telemetry', () => {
  assert.equal(formatReportDate('2026-09-01'), 'Sep 1');
});
