import { useParams, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { loadTools } from '../utils/dataHelpers';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StatusBadge from '../components/tools/StatusBadge';
import { formatDate } from '../utils/dataHelpers';
import { getToolTelemetry } from '../services/telemetryApi';
import { getToolInstructions, README_URL } from '../services/githubDocumentation';
import { githubIssueFormUrl, githubToolChangeProposalUrl } from '../utils/githubLinks';
import { createEndpointPreservingTickCallback } from '../utils/chartTicks';
import { formatReportMonth as formatMonth } from '../utils/reportFormatting';
import { Chart } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js/auto';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  LineController,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
  Filler
);

const currentMonth = () => new Date().toISOString().slice(0, 7);

const detailMarkdownComponents = {
  p: ({ children }) => <p className="mb-3 last:mb-0">{children}</p>,
  ul: ({ children }) => <ul className="mb-3 list-disc space-y-1 pl-6 last:mb-0">{children}</ul>,
  li: ({ children }) => <li>{children}</li>,
  h4: ({ children }) => <h3 className="mt-5 mb-2 text-lg font-semibold text-gray-900 dark:text-white">{children}</h3>,
};

const monthSpan = (monthly) => {
  if (!monthly.length) return [];

  const start = new Date(`${monthly[0].Month}-01T00:00:00Z`);
  const end = new Date(`${monthly[monthly.length - 1].Month}-01T00:00:00Z`);
  const values = new Map(monthly.map(row => [row.Month, row.Count]));
  const rows = [];

  for (const date = new Date(start); date <= end; date.setUTCMonth(date.getUTCMonth() + 1)) {
    const month = date.toISOString().slice(0, 7);
    rows.push({
      Month: month,
      Count: values.has(month) ? values.get(month) : null,
      complete: month < currentMonth()
    });
  }

  return rows;
};

const linearTrend = (rows) => {
  const points = rows
    .map((row, index) => ({ x: index, y: row.Count }))
    .filter(point => point.y !== null);

  if (points.length < 2) return rows.map(() => null);

  const meanX = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const meanY = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const denominator = points.reduce((sum, point) => sum + (point.x - meanX) ** 2, 0);
  if (!denominator) return rows.map(() => null);

  const slope = points.reduce(
    (sum, point) => sum + (point.x - meanX) * (point.y - meanY),
    0
  ) / denominator;
  const firstComplete = points[0].x;
  const lastComplete = points.at(-1).x;

  return rows.map((row, index) => (
    index < firstComplete || index > lastComplete
      ? null
      : Math.max(0, meanY + slope * (index - meanX))
  ));
};

const quarterlyUsage = (monthly) => {
  const quarters = new Map();

  monthSpan(monthly).forEach(({ Month, Count }) => {
    if (Count === null) return;

    const [year, month] = Month.split('-').map(Number);
    const quarter = Math.ceil(month / 3);
    const key = `${year}-Q${quarter}`;
    const current = quarters.get(key) || { year, quarter, runs: 0, reportedMonths: 0 };

    current.runs += Count;
    current.reportedMonths += 1;
    quarters.set(key, current);
  });

  return [...quarters.values()].sort((a, b) => (
    a.year - b.year || a.quarter - b.quarter
  ));
};

const getDocumentationUrl = (tool) => {
  const anchor = tool.documentationAnchor;
  return anchor ? `https://github.com/DellProSupportGse/Tools#${anchor}` : tool.documentation;
};

const readmeAssetUrl = (src) => {
  if (!src || /^(?:[a-z]+:|#|\/\/)/i.test(src)) return src;
  return new URL(src, README_URL).href;
};

const CopyableCodeBlock = ({ children }) => {
  const [copied, setCopied] = useState(false);
  const code = Array.isArray(children) ? children[0] : children;
  const codeText = String(code?.props?.children ?? '').replace(/\n$/, '');

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = codeText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      textArea.remove();
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="relative my-5">
      <button
        type="button"
        onClick={copyCode}
        className="absolute right-3 top-3 rounded border border-gray-600 bg-gray-800 px-2.5 py-1 text-xs font-medium text-gray-100 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-300"
      >
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto rounded-lg bg-gray-950 p-4 pr-20 text-sm leading-6 text-gray-100">{children}</pre>
    </div>
  );
};

const instructionComponents = {
  h1: ({ children }) => <h2 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white first:mt-0">{children}</h2>,
  h2: ({ children }) => <h3 className="mt-7 text-xl font-semibold text-gray-900 dark:text-white">{children}</h3>,
  h3: ({ children }) => <h4 className="mt-6 text-lg font-semibold text-gray-900 dark:text-white">{children}</h4>,
  p: ({ children }) => <p className="my-4 leading-7 text-gray-700 dark:text-gray-300">{children}</p>,
  ul: ({ children }) => <ul className="my-4 list-disc space-y-2 pl-6 text-gray-700 dark:text-gray-300">{children}</ul>,
  ol: ({ children }) => <ol className="my-4 list-decimal space-y-2 pl-6 text-gray-700 dark:text-gray-300">{children}</ol>,
  li: ({ children }) => <li className="pl-1">{children}</li>,
  a: ({ href, children }) => (
    <a href={readmeAssetUrl(href)} target="_blank" rel="noopener noreferrer" className="text-dell-blue underline hover:no-underline">
      {children}
    </a>
  ),
  img: ({ src, alt }) => (
    <img src={readmeAssetUrl(src)} alt={alt || ''} loading="lazy" className="my-5 max-h-[560px] max-w-full rounded-lg border border-gray-200 shadow-sm dark:border-gray-600" />
  ),
  pre: CopyableCodeBlock,
  code: ({ className, children }) => (
    <code className={className || 'rounded bg-gray-200 px-1.5 py-0.5 font-mono text-sm text-gray-900 dark:bg-gray-600 dark:text-gray-100'}>{children}</code>
  ),
  blockquote: ({ children }) => <blockquote className="my-5 border-l-4 border-dell-blue pl-4 italic text-gray-600 dark:text-gray-300">{children}</blockquote>,
  details: ({ children }) => <section className="my-5 rounded-lg border border-gray-200 p-4 dark:border-gray-600">{children}</section>,
  summary: ({ children }) => <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{children}</h4>,
  table: ({ children }) => <div className="my-5 overflow-x-auto"><table className="min-w-full border-collapse text-left text-sm">{children}</table></div>,
  th: ({ children }) => <th className="border border-gray-300 bg-gray-100 px-3 py-2 font-semibold dark:border-gray-600 dark:bg-gray-700">{children}</th>,
  td: ({ children }) => <td className="border border-gray-300 px-3 py-2 align-top dark:border-gray-600">{children}</td>
};

const ToolDetail = () => {
  const { id } = useParams();
  const [tool, setTool] = useState(null);
  const [loading, setLoading] = useState(true);
  const [telemetry, setTelemetry] = useState(null);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [instructions, setInstructions] = useState(null);
  const [instructionsLoading, setInstructionsLoading] = useState(false);
  const [instructionsError, setInstructionsError] = useState(null);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    const fetchTool = async () => {
      try {
        const tools = await loadTools();
        const foundTool = tools.find(t => t.id === id);
        setTool(foundTool);
        
        if (foundTool) {
          setTelemetryLoading(true);
          getToolTelemetry(foundTool.telemetryName)
            .then(setTelemetry)
            .finally(() => setTelemetryLoading(false));

          const documentationAnchor = foundTool.documentationAnchor;
          if (documentationAnchor) {
            setInstructionsLoading(true);
            getToolInstructions(documentationAnchor)
              .then(setInstructions)
              .catch(error => setInstructionsError(error.message))
              .finally(() => setInstructionsLoading(false));
          }
        }
      } catch (error) {
        console.error('Error loading tool:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTool();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dell-blue"></div>
      </div>
    );
  }

  if (!tool) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Tool Not Found
          </h1>
          <Link to="/tools" className="btn-primary">
            Back to Tools
          </Link>
        </div>
      </div>
    );
  }

  const getRoadmapStatusColor = (status) => {
    const colors = {
      planned: 'border-l-4 border-gray-400',
      'in-progress': 'border-l-4 border-blue-500',
      completed: 'border-l-4 border-green-500',
      cancelled: 'border-l-4 border-red-500'
    };
    return colors[status] || 'border-l-4 border-gray-400';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-500',
      medium: 'text-yellow-600',
      high: 'text-red-600'
    };
    return colors[priority] || 'text-gray-500';
  };

  const openProposal = () => {
    setProposal({
      description: tool.description,
      overview: tool.whatItDoes,
      valueProposition: tool.valueProposition,
      tags: tool.tags.join(', ')
    });
    setProposalOpen(true);
  };

  const submitProposal = (event) => {
    event.preventDefault();
    const tags = proposal.tags.split(',').map(tag => tag.trim()).filter(Boolean);
    window.open(githubToolChangeProposalUrl(tool, { ...proposal, tags }), '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link to="/tools" className="text-dell-blue hover:underline mb-4 inline-block">
            ← Back to Tools
          </Link>
          
          <div className="card mt-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {tool.name}
                </h1>
                <div className="flex items-center space-x-4">
                  <StatusBadge status={tool.status} />
                  <span className="text-gray-600 dark:text-gray-400">Created in: {tool.regionCreated}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Description
                </h2>
                <div className="text-gray-600 dark:text-gray-400 mb-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={detailMarkdownComponents}>
                  {tool.description}
                  </ReactMarkdown>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Overview
                </h2>
                <div className="text-gray-600 dark:text-gray-400 mb-6">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={detailMarkdownComponents}>
                  {tool.whatItDoes}
                  </ReactMarkdown>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Value Proposition
                </h2>
                <div className="text-gray-600 dark:text-gray-400 mb-6">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={detailMarkdownComponents}
                  >
                    {tool.valueProposition}
                  </ReactMarkdown>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {tool.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-dell-blue text-white text-sm rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex space-x-4">
                  {tool.repository && (
                    <a
                      href={tool.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                    >
                      View Repository
                    </a>
                  )}
                  {getDocumentationUrl(tool) && (
                    <a
                      href={getDocumentationUrl(tool)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary"
                    >
                      Documentation
                    </a>
                  )}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <a href={githubIssueFormUrl('bug', tool.name)} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white hover:bg-red-700">
                    Submit a Bug
                  </a>
                  <a href={githubIssueFormUrl('feature', tool.name)} target="_blank" rel="noopener noreferrer" className="btn-primary">
                    Feature Request
                  </a>
                  <button type="button" onClick={openProposal} className="btn-secondary">
                    Propose Changes
                  </button>
                </div>
                {proposalOpen && proposal && (
                  <form onSubmit={submitProposal} className="mt-6 rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-600 dark:bg-gray-800">
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Propose catalog changes</h2>
                        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">Your proposal opens as a GitHub request for maintainer review; it does not change the published catalog directly.</p>
                      </div>
                      <button type="button" onClick={() => setProposalOpen(false)} className="text-sm font-medium text-dell-blue hover:underline">Cancel</button>
                    </div>
                    <div className="space-y-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Description
                        <textarea value={proposal.description} onChange={event => setProposal({ ...proposal, description: event.target.value })} rows="4" required className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      </label>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Overview
                        <textarea value={proposal.overview} onChange={event => setProposal({ ...proposal, overview: event.target.value })} rows="6" required className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      </label>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Value Proposition
                        <textarea value={proposal.valueProposition} onChange={event => setProposal({ ...proposal, valueProposition: event.target.value })} rows="6" required className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      </label>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Tags
                        <input value={proposal.tags} onChange={event => setProposal({ ...proposal, tags: event.target.value })} required className="mt-1 w-full rounded border border-gray-300 bg-white p-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        <span className="mt-1 block text-xs font-normal text-gray-500 dark:text-gray-400">Separate tags with commas.</span>
                      </label>
                    </div>
                    <button type="submit" className="btn-primary mt-5">Open GitHub Proposal</button>
                  </form>
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Roadmap
                </h2>
                <div className="space-y-4">
                  {tool.roadmap.map((item, index) => (
                    <div
                      key={index}
                      className={`p-4 bg-gray-50 dark:bg-gray-700 rounded ${getRoadmapStatusColor(item.status)}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {item.feature}
                        </h3>
                        <span className={`text-sm font-medium ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.status === 'completed' ? 'bg-green-100 text-green-800' :
                          item.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          item.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {item.status}
                        </span>
                        {item.targetDate && (
                          <span>Target: {formatDate(item.targetDate)}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Timeline
                  </h3>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>Created: {formatDate(tool.createdAt)}</p>
                    <p>Last Updated: {formatDate(tool.updatedAt)}</p>
                  </div>
                </div>

                {/* Monthly Usage Chart */}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Monthly Usage
                  </h3>
                  {telemetryLoading ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Loading telemetry data...
                    </div>
                  ) : telemetry && telemetry.monthly && telemetry.monthly.length > 0 ? (
                    (() => {
                      const rows = monthSpan(telemetry.monthly);
                      const trend = linearTrend(rows);
                      const totalRuns = rows.reduce(
                        (sum, row) => sum + (row.Count ?? 0),
                        0
                      );

                      return (
                        <>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            All years · {totalRuns.toLocaleString()} reported runs. Gaps indicate missing months, not zero runs. Dashed trend uses complete reported periods only; it is not a forecast.
                          </p>
                          <div className="h-72">
                            <Chart
                              type="line"
                              data={{
                                labels: rows.map(row => formatMonth(row.Month)),
                                datasets: [
                                  {
                                    label: 'Reported runs',
                                    data: rows.map(row => row.Count),
                                    borderColor: '#0076ce',
                                    backgroundColor: '#0076ce',
                                    borderWidth: 2,
                                    pointRadius: rows.length > 35 ? 1 : 3,
                                    pointBackgroundColor: rows.map(row => (
                                      row.complete ? '#0076ce' : '#91c9ef'
                                    )),
                                    tension: 0,
                                    spanGaps: false
                                  },
                                  {
                                    label: 'Linear trend · complete periods',
                                    data: trend,
                                    borderColor: '#d07816',
                                    borderWidth: 2,
                                    borderDash: [7, 5],
                                    pointRadius: 0,
                                    tension: 0,
                                    spanGaps: true
                                  }
                                ]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: false,
                                interaction: {
                                  mode: 'index',
                                  intersect: false
                                },
                                plugins: {
                                  legend: {
                                    display: true,
                                    position: 'bottom',
                                    labels: {
                                      usePointStyle: false,
                                      boxWidth: 28,
                                      padding: 14
                                    }
                                  },
                                  tooltip: {
                                    callbacks: {
                                      label: context => (
                                        `${context.dataset.label}: ${context.parsed.y === null ? 'missing' : context.parsed.y.toLocaleString()} runs`
                                      )
                                    }
                                  }
                                },
                                scales: {
                                  x: {
                                    title: {
                                      display: true,
                                      text: 'Month'
                                    },
                                    ticks: {
                                      autoSkip: false,
                                      callback: createEndpointPreservingTickCallback(8),
                                      maxRotation: 0
                                    },
                                    grid: { display: false }
                                  },
                                  y: {
                                    beginAtZero: true,
                                    title: {
                                      display: true,
                                      text: 'Runs'
                                    }
                                  }
                                }
                              }}
                            />
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No telemetry data available for this tool.
                    </div>
                  )}
                </div>

                {/* Quarterly Usage Chart */}
                <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Quarterly Usage
                  </h3>
                  {telemetryLoading ? (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      Loading telemetry data...
                    </div>
                  ) : telemetry?.monthly?.length ? (
                    (() => {
                      const quarters = quarterlyUsage(telemetry.monthly);

                      return quarters.length > 0 ? (
                        <>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                            Totals use reported months only. A quarter with fewer than three reported months is marked as partial.
                          </p>
                          <div className="h-64">
                            <Chart
                              type="bar"
                              data={{
                                labels: quarters.map(({ year, quarter }) => `Q${quarter} ${year}`),
                                datasets: [{
                                  label: 'Reported runs',
                                  data: quarters.map(({ runs }) => runs),
                                  backgroundColor: quarters.map(({ reportedMonths }) => (
                                    reportedMonths === 3 ? '#0076ce' : '#91c9ef'
                                  )),
                                  borderRadius: 4
                                }]
                              }}
                              options={{
                                responsive: true,
                                maintainAspectRatio: false,
                                animation: false,
                                plugins: {
                                  legend: { display: false },
                                  tooltip: {
                                    callbacks: {
                                      label: context => `${context.parsed.y.toLocaleString()} reported runs`,
                                      afterLabel: context => {
                                        const { reportedMonths } = quarters[context.dataIndex];
                                        return reportedMonths === 3
                                          ? 'All three months reported'
                                          : `${reportedMonths} of 3 months reported`;
                                      }
                                    }
                                  }
                                },
                                scales: {
                                  x: {
                                    title: { display: true, text: 'Quarter' },
                                    ticks: {
                                      autoSkip: false,
                                      callback: createEndpointPreservingTickCallback(8)
                                    },
                                    grid: { display: false }
                                  },
                                  y: {
                                    beginAtZero: true,
                                    title: { display: true, text: 'Runs' }
                                  }
                                }
                              }}
                            />
                          </div>
                        </>
                      ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          No quarterly usage data available for this tool.
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      No telemetry data available for this tool.
                    </div>
                  )}
                </div>
              </div>
            </div>

            <section className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-8">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Instructions
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Loaded live from the tool's GitHub README.
                  </p>
                </div>
                {getDocumentationUrl(tool) && (
                  <a
                    href={getDocumentationUrl(tool)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-dell-blue hover:underline"
                  >
                    View source on GitHub ↗
                  </a>
                )}
              </div>
              {instructionsLoading ? (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Loading the latest instructions...
                </p>
              ) : instructionsError ? (
                <p className="text-sm text-red-600 dark:text-red-400">
                  Instructions could not be loaded from GitHub right now. Use the source link above to view them.
                </p>
              ) : instructions ? (
                <div className="max-h-[900px] overflow-auto rounded-lg bg-gray-50 p-5 dark:bg-gray-700">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    components={instructionComponents}
                  >
                    {instructions}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No instructions section is available for this tool.
                </p>
              )}
            </section>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ToolDetail;
