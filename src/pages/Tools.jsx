import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTools } from '../hooks/useTools';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StatusBadge from '../components/tools/StatusBadge';
import { githubIssueFormUrl } from '../utils/githubLinks';

const REGION_OPTIONS = ['North America', 'EMEA', 'LATAM', 'ANZ', 'APJ'];
const OPERATING_SYSTEM_OPTIONS = ['Windows', 'Linux', 'Nutanix', 'Azure Local', 'ESX'];

const Tools = () => {
  const { tools, filteredTools, loading, filters, sortBy, setSortBy, updateFilters, clearFilters } = useTools();
  const navigate = useNavigate();
  const [view, setView] = useState('grid');
  const categories = useMemo(
    () => [...new Set(tools.map(tool => tool.category))].sort(),
    [tools]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dell-blue"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Tools Catalog
              </h1>
            </div>
            
            {/* Search and Filters */}
            <div className="card mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search tools..."
                    value={filters.search}
                    onChange={(e) => updateFilters({ search: e.target.value })}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => updateFilters({ status: e.target.value })}
                    className="input-field"
                  >
                    <option value="">All Statuses</option>
                    <option value="idea">Idea</option>
                    <option value="planning">Planning</option>
                    <option value="development">Development</option>
                    <option value="testing">Testing</option>
                    <option value="internal-testing">Internal Testing</option>
                    <option value="released">Released</option>
                    <option value="maintenance">Maintenance</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Region Created</label>
                  <select value={filters.regionCreated} onChange={(e) => updateFilters({ regionCreated: e.target.value })} className="input-field">
                    <option value="">All Regions</option>
                    {REGION_OPTIONS.map(region => <option key={region} value={region}>{region}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Operating System</label>
                  <select value={filters.operatingSystem} onChange={(e) => updateFilters({ operatingSystem: e.target.value })} className="input-field">
                    <option value="">All Operating Systems</option>
                    {OPERATING_SYSTEM_OPTIONS.map(os => <option key={os} value={os}>{os}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="input-field"
                  >
                    <option value="date">Last Updated</option>
                    <option value="name">Name</option>
                  </select>
                </div>
              </div>

              <section className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-5" aria-labelledby="category-filter-heading">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 id="category-filter-heading" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Category
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Filter by each tool’s primary purpose.
                    </p>
                  </div>
                  <div className="inline-flex rounded-lg shadow-sm" role="group" aria-label="Catalog view">
                    <button
                      type="button"
                      onClick={() => setView('grid')}
                      aria-pressed={view === 'grid'}
                      className={`rounded-l-lg border px-3 py-2 text-sm font-medium ${view === 'grid' ? 'border-dell-blue bg-dell-blue text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'}`}
                    >
                      Grid
                    </button>
                    <button
                      type="button"
                      onClick={() => setView('list')}
                      aria-pressed={view === 'list'}
                      className={`rounded-r-lg border border-l-0 px-3 py-2 text-sm font-medium ${view === 'list' ? 'border-dell-blue bg-dell-blue text-white' : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100'}`}
                    >
                      List
                    </button>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => updateFilters({ category: '' })}
                    aria-pressed={!filters.category}
                    className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${!filters.category ? 'bg-dell-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    All categories
                  </button>
                  {categories.map(category => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => updateFilters({ category })}
                      aria-pressed={filters.category === category}
                      className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${filters.category === category ? 'bg-dell-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </section>
              
              {(filters.search || filters.status || filters.regionCreated || filters.category || filters.operatingSystem) && (
                <button
                  onClick={clearFilters}
                  className="mt-4 text-sm text-dell-blue hover:underline"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>

          {/* Tools catalog */}
          {filteredTools.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No tools found matching your criteria.
              </p>
            </div>
          ) : (
            <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-3'}>
              {filteredTools.map(tool => (
                <div
                  key={tool.id}
                  role="link"
                  tabIndex={0}
                  aria-label={`View details for ${tool.name}`}
                  onClick={() => navigate(`/tools/${tool.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      navigate(`/tools/${tool.id}`);
                    }
                  }}
                  className={`card cursor-pointer hover:shadow-lg transition-shadow focus:outline-none focus:ring-2 focus:ring-dell-blue focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${view === 'grid' ? 'h-full' : 'sm:flex sm:items-center sm:gap-6'}`}
                >
                    <div className={view === 'grid' ? '' : 'sm:min-w-0 sm:flex-1'}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {tool.name}
                          </h3>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-sm text-dell-blue dark:text-blue-300">
                            <span>{tool.category}</span>
                            <span><span className="font-semibold">Operating System:</span> {tool.operatingSystem.join(', ')}</span>
                            <span><span className="font-semibold">Owner:</span> {tool.owner}</span>
                          </div>
                        </div>
                        <StatusBadge status={tool.status} />
                      </div>
                      <p className={`text-gray-600 dark:text-gray-400 ${view === 'grid' ? 'mb-4 line-clamp-3' : 'sm:mb-0'}`}>
                        {tool.description}
                      </p>
                    </div>
                    {view === 'grid' && <div className="flex flex-wrap gap-2 mb-4">
                      {tool.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">{tag}</span>
                      ))}
                    </div>}
                    <div className={`flex flex-wrap gap-2 ${view === 'grid' ? 'mt-4' : 'mt-4 sm:mt-0 sm:flex-none sm:justify-end'}`}>
                      <a onClick={(event) => event.stopPropagation()} href={githubIssueFormUrl('bug', tool.name)} target="_blank" rel="noopener noreferrer" className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700">
                        Submit a Bug
                      </a>
                      <a onClick={(event) => event.stopPropagation()} href={githubIssueFormUrl('feature', tool.name)} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm">
                        Feature Request
                      </a>
                    </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Tools;
