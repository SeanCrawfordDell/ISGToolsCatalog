import test from 'node:test';
import assert from 'node:assert/strict';
import React, { useEffect } from 'react';
import { act, create } from 'react-test-renderer';
import { useToolTelemetry } from '../src/hooks/useToolTelemetry.js';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

test('telemetry hook handles catalog loading before a tool is selected', async () => {
  let state;
  function Probe() {
    const result = useToolTelemetry(undefined);
    useEffect(() => { state = result; }, [result]);
    return null;
  }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Probe)); });
  assert.deepEqual(state, { telemetry: null, loading: false, error: null });
  await act(async () => renderer.unmount());
});

test('switching tools hides old data and ignores an obsolete response even if fetch ignores abort', async (t) => {
  const pending = new Map();
  t.mock.method(globalThis, 'fetch', (url, options) => new Promise(resolve => {
    pending.set(new URL(url).searchParams.get('tool'), { resolve, signal: options.signal });
  }));
  let state;
  function Probe({ name }) {
    const result = useToolTelemetry(name);
    useEffect(() => { state = result; }, [result]);
    return null;
  }
  let renderer;
  const response = count => ({ ok: true, json: async () => ({ rowCount: count, monthly: [] }) });
  try {
    await act(async () => { renderer = create(React.createElement(Probe, { name: 'A' })); });
    await act(async () => pending.get('A').resolve(response(10)));
    assert.equal(state.telemetry.rowCount, 10);
    await act(async () => renderer.update(React.createElement(Probe, { name: 'B' })));
    assert.equal(state.telemetry, null);
    assert.equal(state.loading, true);
    await act(async () => renderer.update(React.createElement(Probe, { name: 'C' })));
    assert.equal(pending.get('B').signal.aborted, true);
    await act(async () => pending.get('C').resolve(response(30)));
    await act(async () => pending.get('B').resolve(response(20)));
    assert.equal(state.telemetry.rowCount, 30);
    assert.equal(state.loading, false);
  } finally { if (renderer) await act(async () => renderer.unmount()); }
});

test('failed telemetry is unavailable rather than a successful zero-run report', async (t) => {
  t.mock.method(globalThis, 'fetch', async () => ({ ok: false, status: 503 }));
  t.mock.method(console, 'error', () => {});
  let state;
  function Probe() {
    const result = useToolTelemetry('BOILER');
    useEffect(() => { state = result; }, [result]);
    return null;
  }
  let renderer;
  await act(async () => { renderer = create(React.createElement(Probe)); });
  assert.equal(state.telemetry, null);
  assert.equal(state.loading, false);
  assert.match(state.error, /unavailable/);
  await act(async () => renderer.unmount());
});
