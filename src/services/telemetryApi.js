const API_URL = "https://gsetools-bufhdqefb8e6ecc6.centralus-01.azurewebsites.net/api/GetTelemetrySummaryFast";

/**
 * Fetch telemetry data for a specific tool
 * @param {string} toolName - The name of the tool to fetch telemetry for
 * @returns {Promise<Object>} - Normalized telemetry data
 */
export async function getToolTelemetry(toolName, { signal } = {}) {
  try {
    const url = new URL(API_URL);
    url.searchParams.set('tool', toolName);
    
    const timeout = AbortSignal.timeout(20000);
    const response = await fetch(url, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
    
    if (!response.ok) {
      throw new Error('Telemetry request failed');
    }
    
    const raw = await response.json();
    return normalizeTelemetryResponse(raw);
  } catch (error) {
    if (signal?.aborted) return null;
    console.error(`Failed to fetch telemetry for ${toolName}:`, error);
    return null;
  }
}

/**
 * Normalize the telemetry response data
 * @param {Object} raw - Raw response from API
 * @returns {Object} - Normalized telemetry data
 */
function normalizeTelemetryResponse(raw) {
  // Handle different response formats
  let data = raw;
  
  // If response has a value property (Azure Table style)
  if (raw.value && Array.isArray(raw.value)) {
    data = { value: raw.value };
  }
  
  // Extract relevant data
  const rowCount = extractRowCount(data);
  const monthly = extractMonthlyData(data);
  const latestMonth = monthly.length > 0 ? monthly[monthly.length - 1].Month : null;
  
  return {
    rowCount,
    latestMonth,
    monthly,
    daily: extractSeries(data.daily, 'Date'),
    versions: extractSeries(data.versions, 'Name'),
    countries: extractSeries(data.countries || data.top10Countries, 'Name'),
    refreshedAt: data.refreshedAt || null
  };
}

/**
 * Extract row count from response data
 * @param {Object} data - Response data
 * @returns {number|null} - Row count or null if unavailable
 */
function extractRowCount(data) {
  if (typeof data.rowCount === 'number') {
    return data.rowCount;
  }

  if (data.value && Array.isArray(data.value)) {
    const totalRow = data.value.find(row => row.RowKey === 'Total');
    return Number(totalRow?.TotalRuns ?? totalRow?.Count ?? 0);
  }

  return null;
}

/**
 * Extract monthly data from response
 * @param {Object} data - Response data
 * @returns {Array} - Array of monthly data objects
 */
function extractMonthlyData(data) {
  if (Array.isArray(data.monthly)) {
    return data.monthly
      .filter(row => /^\d{4}-(0[1-9]|1[0-2])$/.test(row.Month))
      .map(row => ({ Month: row.Month, Count: toCount(row.Count) }))
      .sort((a, b) => a.Month.localeCompare(b.Month));
  }

  const monthlyRow = data.value?.find(row => row.RowKey === 'Monthly');
  if (!monthlyRow) {
    return [];
  }

  return Object.keys(monthlyRow)
    .filter(key => /^M?\d{6}$/.test(key))
    .sort()
    .map(key => {
      const rawMonth = key.replace(/^M/, '');
      return {
        Month: `${rawMonth.slice(0, 4)}-${rawMonth.slice(4, 6)}`,
        Count: toCount(monthlyRow[key])
      };
    });
}

function extractSeries(rows, labelKey) {
  if (!Array.isArray(rows)) return [];

  return rows
    .map(row => ({ label: row[labelKey], Count: toCount(row.Count) }))
    .filter(row => typeof row.label === 'string' && row.label);
}

function toCount(value) {
  const count = Number(value);
  return Number.isFinite(count) ? Math.max(0, count) : null;
}
