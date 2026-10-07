import test from 'node:test';
import assert from 'node:assert/strict';
import { createEndpointPreservingTickCallback } from '../src/utils/chartTicks.js';

test('chart tick selection keeps the latest period label on long timelines', () => {
  const ticks = Array.from({ length: 75 }, (_, index) => ({ value: index }));
  const callback = createEndpointPreservingTickCallback(10);
  const visibleLabels = ticks
    .map((tick, index) => callback.call({ getLabelForValue: value => `period-${value}` }, tick.value, index, ticks))
    .filter(Boolean);

  assert.equal(visibleLabels.at(-1), 'period-74');
  assert.ok(visibleLabels.length <= 10);
});

test('chart tick selection keeps all labels when they fit', () => {
  const ticks = Array.from({ length: 5 }, (_, index) => ({ value: index }));
  const callback = createEndpointPreservingTickCallback(10);
  const visibleLabels = ticks
    .map((tick, index) => callback.call({ getLabelForValue: value => `period-${value}` }, tick.value, index, ticks))
    .filter(Boolean);

  assert.deepEqual(visibleLabels, ['period-0', 'period-1', 'period-2', 'period-3', 'period-4']);
});
