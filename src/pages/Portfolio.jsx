import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ReportsNav from '../components/reports/ReportsNav';
import { useTools } from '../hooks/useTools';
import { getStatusColor } from '../utils/dataHelpers';
import { GROUPINGS, UNASSIGNED, columns, groups, initials, loadPortfolio, matches, owners as ownersOf, summary } from '../utils/portfolio';

const VIEWS = [['portfolio', 'Portfolio'], ['pipeline', 'Pipeline'], ['owners', 'Who owns what']];
const SEGMENT_COLORS = {
  idea: 'bg-gray-400', planning: 'bg-blue-400', development: 'bg-yellow-400', testing: 'bg-purple-400',
  'internal-testing': 'bg-purple-600', released: 'bg-green-500', maintenance: 'bg-indigo-500', other: 'bg-gray-300'
};
const AVATAR_COLORS = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600', 'bg-teal-600', 'bg-indigo-600', 'bg-rose-600'];

const Pill = ({ status, children }) => (
  <span className={`inline-block whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(status)}`}>{children}</span>
);
const Dot = ({ id }) => <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 rounded-full ${SEGMENT_COLORS[id] || SEGMENT_COLORS.other}`} />;

const Owner = ({ name, all }) => {
  const color = name === UNASSIGNED ? 'bg-gray-400' : AVATAR_COLORS[all.indexOf(name) % AVATAR_COLORS.length];
  return (
    <span className="inline-flex items-center gap-2">
      <span aria-hidden="true" className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold text-white ${color}`}>{initials(name)}</span>
      {name}
    </span>
  );
};

const OwnerList = ({ tool, all }) => (
  <span className="flex flex-col gap-1">{tool.owners.map(name => <Owner key={name} name={name} all={all} />)}</span>
);

const Progress = ({ tool }) => {
  if (tool.percent === null) return <span className="text-sm text-gray-500 dark:text-gray-400">{tool.progressLabel || '—'}</span>;
  return (
    <div className="flex items-center gap-2">
      <div role="img" aria-label={`${tool.percent}% complete`} className="h-2 w-24 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-600">
        <div className="h-full bg-dell-blue" style={{ width: `${tool.percent}%` }} />
      </div>
      <span className="text-sm text-gray-600 dark:text-gray-300">{tool.progressLabel}</span>
    </div>
  );
};

const ToolName = ({ tool }) => (
  <div>
    <Link to={`/tools/${encodeURIComponent(tool.id)}`} className="font-semibold text-dell-blue hover:underline">{tool.name}</Link>
    <div className="text-xs text-gray-500 dark:text-gray-400">{tool.category}</div>
  </div>
);

const Count = ({ children }) => <span className="ml-1 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 dark:bg-gray-600 dark:text-gray-200">{children}</span>;

const PortfolioTable = ({ list, group, all }) => (
  <div className="card overflow-x-auto p-0">
    <table className="min-w-full text-left text-sm">
      <thead className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200">
        <tr>{['Tool', 'Owner', 'Development Status', 'Progress', 'Operating system', 'Description'].map(label => <th key={label} scope="col" className="px-4 py-3 font-semibold">{label}</th>)}</tr>
      </thead>
      {groups(list, group).map(g => (
        <tbody key={g.key} className="border-t border-gray-200 dark:border-gray-700">
          <tr className="bg-gray-50 dark:bg-gray-800">
            <th colSpan={6} scope="rowgroup" className="px-4 py-2 font-semibold text-gray-900 dark:text-white">
              {group === 'Development Status' && <><Dot id={g.key} />{' '}</>}
              {group === 'Owner' && <><Owner name={g.name} all={all} />{' '}</>}
              {group !== 'Owner' && g.name}
              <Count>{g.tools.length}</Count>
            </th>
          </tr>
          {g.tools.map(tool => (
            <tr key={tool.id} className="border-t border-gray-100 align-top dark:border-gray-700">
              <td className="px-4 py-3"><ToolName tool={tool} /></td>
              <td className="px-4 py-3"><OwnerList tool={tool} all={all} /></td>
              <td className="px-4 py-3"><Pill status={tool.status}>{tool.statusLabel}</Pill></td>
              <td className="px-4 py-3"><Progress tool={tool} /></td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{tool.os || '—'}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{tool.description || '—'}</td>
            </tr>
          ))}
        </tbody>
      ))}
    </table>
  </div>
);

const Board = ({ list, all }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
    {columns(list).map(column => (
      <section key={column.id} className="rounded-lg bg-gray-100 p-3 dark:bg-gray-800">
        <h3 className="mb-3 flex items-center gap-2 font-semibold text-gray-900 dark:text-white"><Dot id={column.id} />{column.name}<Count>{column.tools.length}</Count></h3>
        {!column.tools.length && <p className="text-sm text-gray-500 dark:text-gray-400">No tools</p>}
        <div className="space-y-3">
          {column.tools.map(tool => (
            <article key={tool.id} className="card space-y-2 p-3">
              <ToolName tool={tool} />
              <OwnerList tool={tool} all={all} />
              {tool.progressLabel && tool.percent !== 100 && <Progress tool={tool} />}
            </article>
          ))}
        </div>
      </section>
    ))}
  </div>
);

const OwnerCards = ({ list, all }) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
    {ownersOf(list).map(person => (
      <section key={person.name} className="card">
        <div className="flex items-center gap-3">
          <Owner name={person.name} all={all} />
          <span className="text-sm text-gray-500 dark:text-gray-400">{person.tools.length} tool{person.tools.length === 1 ? '' : 's'}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">{person.byStatus.map(s => <Pill key={s.id} status={s.id}>{s.count} {s.label}</Pill>)}</div>
        <ul className="mt-3 space-y-2">
          {person.tools.map(tool => (
            <li key={tool.id} className="flex items-center justify-between gap-2 text-sm">
              <Link to={`/tools/${encodeURIComponent(tool.id)}`} className="text-gray-800 hover:text-dell-blue hover:underline dark:text-gray-200">{tool.name}</Link>
              <Pill status={tool.status}>{tool.statusLabel}</Pill>
            </li>
          ))}
        </ul>
      </section>
    ))}
  </div>
);

const Portfolio = () => {
  const { tools, loading, error } = useTools();
  const [view, setView] = useState('portfolio');
  const [group, setGroup] = useState('Development Status');
  const [query, setQuery] = useState('');
  const portfolio = useMemo(() => loadPortfolio(tools), [tools]);
  const all = useMemo(() => ownersOf(portfolio).map(o => o.name), [portfolio]);
  const stats = useMemo(() => summary(portfolio), [portfolio]);
  const list = useMemo(() => portfolio.filter(tool => matches(tool, query)), [portfolio, query]);

  const metrics = [
    ['Tools', stats.total, 'in the catalog'],
    ['Released', stats.released, 'released or in maintenance'],
    ['In testing', stats.testing, 'testing or internal testing'],
    ['In development', stats.inDevelopment, 'idea, planning or development'],
    ['Owners', stats.owners, 'people or teams']
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-widest text-dell-blue">Reporting</p>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tool Portfolio</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Development status, progress and owner for every tool in the ISG Tools Catalog.</p>
          </div>
          <ReportsNav />

          {error && <p role="alert" className="card mb-6">{error}</p>}
          {loading && <p role="status" className="card mb-6">Loading tools…</p>}
          {!loading && !error && !portfolio.length && <p className="card">The ISG Tools Catalog has no tools to show.</p>}
          {!loading && !error && portfolio.length > 0 && <>
            <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5" aria-label="Portfolio summary">
              {metrics.map(([label, value, note]) => (
                <article key={label} className="card">
                  <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                  <strong className="block text-3xl text-gray-900 dark:text-white">{value}</strong>
                  <small className="text-gray-500 dark:text-gray-400">{note}</small>
                </article>
              ))}
            </div>

            <section className="card mb-6" aria-labelledby="stage-heading">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 id="stage-heading" className="text-lg font-semibold text-gray-900 dark:text-white">Tools by development status</h2>
                <span className="text-xs text-gray-500 dark:text-gray-400">Idea → Planning → Development → Testing → Internal Testing → Released → Maintenance</span>
              </div>
              <div aria-hidden="true" className="mt-3 flex h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                {stats.statuses.filter(s => s.count).map(s => <span key={s.id} title={`${s.label}: ${s.count}`} className={SEGMENT_COLORS[s.id] || SEGMENT_COLORS.other} style={{ flexGrow: s.count }} />)}
              </div>
              <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
                {stats.statuses.map(s => <li key={s.id} className="flex items-center gap-2"><Dot id={s.id} />{s.label} <strong>{s.count}</strong></li>)}
              </ul>
            </section>

            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div role="tablist" aria-label="Portfolio views" className="flex flex-wrap gap-2">
                {VIEWS.map(([id, label]) => (
                  <button key={id} type="button" role="tab" aria-selected={view === id} onClick={() => setView(id)} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${view === id ? 'bg-dell-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}>{label}</button>
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <label className="sr-only" htmlFor="portfolio-filter">Filter tools</label>
                <input id="portfolio-filter" type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Filter tools, owners or statuses" autoComplete="off" className="input-field w-64" />
                {view === 'portfolio' && (
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">Group by
                    <select value={group} onChange={e => setGroup(e.target.value)} className="input-field w-auto">{GROUPINGS.map(g => <option key={g} value={g}>{g}</option>)}</select>
                  </label>
                )}
              </div>
            </div>
            <p role="status" className="mb-4 text-sm text-gray-500 dark:text-gray-400">{query ? `${list.length} of ${portfolio.length} tools match` : `${portfolio.length} tools`}</p>

            {!list.length ? <p className="card">No tools match this filter.</p>
              : view === 'portfolio' ? <PortfolioTable list={list} group={group} all={all} />
              : view === 'pipeline' ? <Board list={list} all={all} />
              : <OwnerCards list={list} all={all} />}
          </>}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Portfolio;
