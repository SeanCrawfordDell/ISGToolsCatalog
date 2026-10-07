import { useEffect, useState } from 'react';
import { getToolTelemetry } from '../services/telemetryApi.js';

export const useToolTelemetry = (toolName) => {
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (!toolName) return;
    let active = true;
    const controller = new AbortController();
    getToolTelemetry(toolName, { signal: controller.signal }).then(data => {
      if (active) setResult({ toolName, data });
    });
    return () => {
      active = false;
      controller.abort();
    };
  }, [toolName]);

  const matches = Boolean(result && result.toolName === toolName);
  return {
    telemetry: matches ? result.data : null,
    loading: Boolean(toolName && !matches),
    error: matches && !result.data ? 'Telemetry is unavailable. Please try again later.' : null
  };
};
