import { useState } from 'react';
import { Chart } from 'react-chartjs-2';
import 'chart.js/auto';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useTools } from '../hooks/useTools';
import { useToolTelemetry } from '../hooks/useToolTelemetry';
import { createEndpointPreservingTickCallback } from '../utils/chartTicks';
import { formatReportDate as formatDate, formatReportMonth as formatMonth } from '../utils/reportFormatting';
import { filterMonthlyByYears } from '../utils/timeSavings';

const buildQuarterlySeries = (monthly) => {
  const quarters = new Map();

  monthly.forEach(({ Month, Count }) => {
    const [year, month] = Month.split('-').map(Number);
    const key = `${year}-Q${Math.ceil(month / 3)}`;
    quarters.set(key, (quarters.get(key) || 0) + (Count || 0));
  });

  return [...quarters.entries()].map(([label, Count]) => ({ label, Count }));
};

const buildTrend = (values) => {
  if (values.length < 2) return values.map(() => null);

  const meanX = (values.length - 1) / 2;
  const meanY = values.reduce((sum, value) => sum + value, 0) / values.length;
  const denominator = values.reduce((sum, _, index) => sum + (index - meanX) ** 2, 0);
  const slope = denominator
    ? values.reduce((sum, value, index) => sum + (index - meanX) * (value - meanY), 0) / denominator
    : 0;

  return values.map((_, index) => Math.max(0, meanY + slope * (index - meanX)));
};

const chartOptions = (yTitle, showLegend = false) => ({
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
  plugins: {
    legend: { display: showLegend, position: 'bottom' },
    tooltip: {
      callbacks: {
        label: (context) => `${context.dataset.label || yTitle}: ${context.parsed.y?.toLocaleString() ?? 'No data'}`
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        autoSkip: false,
        callback: createEndpointPreservingTickCallback(10),
        maxRotation: 0
      }
    },
    y: {
      beginAtZero: true,
      title: { display: true, text: yTitle }
    }
  }
});

const Reports = () => {
  const { tools, loading: catalogLoading, error: catalogError } = useTools();
  const [selectedId, setSelectedId] = useState(null);
  const selectedTool = tools.find(tool => tool.id === selectedId)
    || tools.find(tool => tool.name === 'iDRAC Connection Manager') || tools[0];
  const { telemetry, loading, error: telemetryError } = useToolTelemetry(selectedTool?.telemetryName);
  const [estimates, setEstimates] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('toolSavingsEstimates') || '{}');
      return stored && typeof stored === 'object' && !Array.isArray(stored) ? stored : {};
    } catch { return {}; }
  });
  const estimate = estimates[selectedTool?.id];
  const minutesPerRun = Number.isFinite(estimate) && estimate >= 0
    ? estimate : selectedTool?.minutesSavedPerRun ?? 30;
  const setMinutesPerRun = (value) => {
    const next = { ...estimates, [selectedTool.id]: Math.max(0, value) };
    setEstimates(next);
    try { localStorage.setItem('toolSavingsEstimates', JSON.stringify(next)); } catch { /* Storage may be disabled. */ }
  };
  const [savingsView, setSavingsView] = useState('monthly');
  const [usagePeriod, setUsagePeriod] = useState('monthly');
  const [showTrend, setShowTrend] = useState(true);
  const [selectedYears, setSelectedYears] = useState([]);

  const monthly = telemetry?.monthly || [];
  const years = [...new Set(monthly.map(({ Month }) => Month.slice(0, 4)))].sort();
  const savingsMonthly = filterMonthlyByYears(monthly, selectedYears);
  const quarterly = buildQuarterlySeries(monthly);
  const usage = usagePeriod === 'monthly'
    ? monthly.map(({ Month, Count }) => ({ label: formatMonth(Month), Count }))
    : quarterly;
  const totalRuns = savingsMonthly.reduce((sum, item) => sum + (item.Count || 0), 0);
  const savedHours = (totalRuns * minutesPerRun) / 60;
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const latestCompleteMonth = savingsMonthly.filter(item => item.Month < currentMonthKey).at(-1);
  const currentMonth = savingsMonthly.find(item => item.Month === currentMonthKey);

  const setTool = (tool) => {
    setSelectedId(tool.id);
    setSelectedYears([]);
    setSavingsView('monthly');
  };

  const toggleYear = (year) => {
    setSelectedYears(current => current.includes(year)
      ? current.filter(item => item !== year)
      : [...current, year]);
  };

  const monthlyHours = savingsMonthly.map(item => ((item.Count || 0) * minutesPerRun) / 60);
  const cumulativeHours = monthlyHours.reduce((values, hours) => [...values, (values.at(-1) || 0) + hours], []);
  const savingsData = savingsView === 'quarterly'
    ? buildQuarterlySeries(savingsMonthly).map(item => ({ label: item.label, Count: (item.Count * minutesPerRun) / 60 }))
    : savingsMonthly.map((item, index) => ({
      label: formatMonth(item.Month),
      Count: savingsView === 'cumulative' ? cumulativeHours[index] : monthlyHours[index]
    }));


  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-dell-blue">Analytics</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Telemetry Reports</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Tool adoption, estimated impact, and telemetry storage coverage.</p>
          </div>

          <section className="card mb-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <nav className="flex flex-wrap gap-2" aria-label="Select a telemetry tool">
                {[...tools].sort((a, b) => a.name.localeCompare(b.name)).map(tool => (
                  <button key={tool.id} type="button" onClick={() => setTool(tool)} aria-pressed={selectedTool?.id === tool.id} className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${selectedTool?.id === tool.id ? 'bg-dell-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>
                    {tool.name}
                  </button>
                ))}
              </nav>
            </div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Select a tool to view its telemetry report.</p>
          </section>

          {(catalogError || telemetryError) && <p role="alert" className="card mb-6">{catalogError || telemetryError}</p>}
          {(catalogLoading || loading) && <p role="status" className="card mb-6">Loading telemetry…</p>}
          {!catalogLoading && !loading && !catalogError && telemetry && <>
          <section className="card mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedTool?.name} Estimated Time Savings</h2><span className="text-sm text-gray-500 dark:text-gray-400">All countries</span></div>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <details className="relative">
                <summary aria-label="Filter estimated time savings by year" className="cursor-pointer rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200">{selectedYears.length ? selectedYears.join(', ') : 'All years'}</summary>
                <fieldset className="absolute z-10 mt-1 w-48 rounded-lg border border-gray-300 bg-white p-3 shadow-lg dark:border-gray-600 dark:bg-gray-800">
                  <button type="button" onClick={() => setSelectedYears([])} className="mb-2 text-sm text-dell-blue hover:underline">All years</button>
                  {years.map(year => <label key={year} className="flex gap-2 py-1 text-sm"><input type="checkbox" checked={!selectedYears.length || selectedYears.includes(year)} onChange={() => toggleYear(year)} />{year}</label>)}
                </fieldset>
              </details>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-3"><label htmlFor="minutes-per-run" className="text-sm font-medium text-gray-700 dark:text-gray-300">Minutes saved per run</label><input id="minutes-per-run" type="number" min="0" step="1" value={minutesPerRun} onChange={(event) => setMinutesPerRun(Number(event.target.value) || 0)} className="input-field w-24" /><span className="text-sm text-gray-500 dark:text-gray-400">Editable estimate · saved in this browser for each tool</span></div>
            <div className="mt-5 grid grid-cols-1 gap-4 rounded-lg bg-blue-50 p-5 dark:bg-gray-700 md:grid-cols-3">
              <div><span className="block text-sm text-gray-500 dark:text-gray-400">Total estimated hours</span><strong className="mt-1 block text-3xl text-gray-900 dark:text-white">{savedHours.toFixed(1)}</strong><small className="text-gray-500 dark:text-gray-400">From total runs</small></div>
              <div><span className="block text-sm text-gray-500 dark:text-gray-400">Equivalent engineer-days</span><strong className="mt-1 block text-3xl text-gray-900 dark:text-white">{(savedHours / 8).toFixed(1)}</strong><small className="text-gray-500 dark:text-gray-400">8 hours per day · equivalent capacity</small></div>
              <div><span className="block text-sm text-gray-500 dark:text-gray-400">Latest complete month · {latestCompleteMonth ? formatMonth(latestCompleteMonth.Month) : 'Unavailable'}</span><strong className="mt-1 block text-3xl text-gray-900 dark:text-white">{latestCompleteMonth ? `${((latestCompleteMonth.Count || 0) * minutesPerRun / 60).toFixed(1)} h` : '—'}</strong><small className="text-gray-500 dark:text-gray-400">{currentMonth ? `${currentMonth.Count || 0} runs in the current month` : 'No data reported for the current month'}</small></div>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Time savings views">
              {[['monthly', 'Monthly impact'], ['quarterly', 'Quarterly impact'], ['cumulative', 'Accumulated value'], ['detail', 'Visual detail']].map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={savingsView === value} onClick={() => setSavingsView(value)} className={`rounded-lg border px-3 py-2 text-sm font-medium ${savingsView === value ? 'border-dell-blue bg-dell-blue text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'}`}>{label}</button>)}
            </div>
            {savingsView === 'detail' ? (
              <div className="mt-5 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700"><table className="min-w-full text-sm"><thead className="bg-gray-50 dark:bg-gray-800"><tr><th className="px-4 py-3 text-left">Month</th><th className="px-4 py-3 text-right">Runs</th><th className="px-4 py-3 text-right">Estimated hours saved</th></tr></thead><tbody>{savingsMonthly.map(item => <tr key={item.Month} className="border-t border-gray-200 dark:border-gray-700"><td className="px-4 py-3">{formatMonth(item.Month)}</td><td className="px-4 py-3 text-right">{(item.Count || 0).toLocaleString()}</td><td className="px-4 py-3 text-right">{((item.Count || 0) * minutesPerRun / 60).toFixed(1)}</td></tr>)}</tbody><tfoot className="border-t border-gray-200 bg-gray-50 font-semibold dark:border-gray-700 dark:bg-gray-800"><tr><td className="px-4 py-3">Total</td><td className="px-4 py-3 text-right">{totalRuns.toLocaleString()}</td><td className="px-4 py-3 text-right">{savedHours.toFixed(1)} h</td></tr></tfoot></table></div>
            ) : <div className="mt-5 h-80"><Chart type={savingsView === 'monthly' || savingsView === 'quarterly' ? 'bar' : 'line'} data={{ labels: savingsData.map(item => item.label), datasets: [{ label: savingsView === 'cumulative' ? 'Accumulated hours saved' : 'Estimated hours saved', data: savingsData.map(item => item.Count), backgroundColor: '#91c9ef', borderColor: '#0076ce', borderWidth: 2, borderRadius: 4, fill: false, tension: 0 }] }} options={chartOptions('Estimated hours saved')} /></div>}
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">Estimated hours = runs × minutes saved per run ÷ 60. Missing months are not assumed to be zero.</p>
          </section>

          <section className="card mb-6">
            <div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">{usagePeriod === 'monthly' ? 'Monthly' : 'Quarterly'} usage</h2><span className="text-sm text-gray-500 dark:text-gray-400">All countries</span></div>
            <div className="mt-4 flex flex-wrap items-center gap-4"><div className="flex gap-2" role="group" aria-label="Usage period"><button type="button" aria-pressed={usagePeriod === 'monthly'} onClick={() => setUsagePeriod('monthly')} className={`rounded-lg border px-3 py-2 text-sm font-medium ${usagePeriod === 'monthly' ? 'border-dell-blue bg-dell-blue text-white' : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'}`}>Monthly</button><button type="button" aria-pressed={usagePeriod === 'quarterly'} onClick={() => setUsagePeriod('quarterly')} className={`rounded-lg border px-3 py-2 text-sm font-medium ${usagePeriod === 'quarterly' ? 'border-dell-blue bg-dell-blue text-white' : 'border-gray-300 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200'}`}>Quarterly</button></div><label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"><input type="checkbox" checked={showTrend} onChange={(event) => setShowTrend(event.target.checked)} />Show trend line</label></div>
            <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">{usage.reduce((sum, item) => sum + (item.Count || 0), 0).toLocaleString()} reported runs across all years. Gaps indicate missing periods, not zero runs. The dashed trend is not a forecast.</p>
            <div className="mt-4 h-80"><Chart type="line" data={{ labels: usage.map(item => item.label), datasets: [{ label: 'Reported runs', data: usage.map(item => item.Count), borderColor: '#0076ce', backgroundColor: '#0076ce', borderWidth: 2, pointRadius: 3, tension: 0 }, ...(showTrend ? [{ label: 'Linear trend', data: buildTrend(usage.map(item => item.Count || 0)), borderColor: '#d07816', borderDash: [7, 5], borderWidth: 2, pointRadius: 0, tension: 0 }] : [])] }} options={chartOptions('Runs', showTrend)} /></div>
          </section>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <section className="card"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Daily usage</h2><span className="text-sm text-gray-500 dark:text-gray-400">All countries</span></div><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Reported daily usage for the current telemetry period.</p><div className="mt-4 h-72"><Chart type="bar" data={{ labels: (telemetry?.daily || []).map(item => formatDate(item.label)), datasets: [{ label: 'Runs', data: (telemetry?.daily || []).map(item => item.Count), backgroundColor: '#0076ce', borderRadius: 4 }] }} options={chartOptions('Runs')} /></div></section>
            <section className="card"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold text-gray-900 dark:text-white">Versions · top 10 reported</h2><span className="text-sm text-gray-500 dark:text-gray-400">All countries</span></div><p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Usage grouped by reported tool version.</p><div className="mt-4 h-72"><Chart type="bar" data={{ labels: (telemetry?.versions || []).slice(0, 10).map(item => item.label), datasets: [{ label: 'Runs', data: (telemetry?.versions || []).slice(0, 10).map(item => item.Count), backgroundColor: '#0076ce', borderRadius: 4 }] }} options={chartOptions('Runs')} /></div></section>
          </div>
          </> }
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Reports;
