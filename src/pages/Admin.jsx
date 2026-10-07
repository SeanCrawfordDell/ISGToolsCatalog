import { useTools } from '../hooks/useTools';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StatusBadge from '../components/tools/StatusBadge';
import { githubNewToolRequestUrl, githubToolUpdateUrl, githubIssuesUrl } from '../utils/githubLinks';

const Admin = () => {
  const { tools, loading, error } = useTools();

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Catalog Updates</h1>
          <p className="mt-3 text-gray-600 dark:text-gray-400">Propose changes on GitHub. Maintainers review requests before updating the catalog. Sign in to GitHub to submit or manage a request.</p>
          <div className="my-6 flex flex-wrap gap-3">
            <a className="btn-primary" href={githubNewToolRequestUrl} target="_blank" rel="noopener noreferrer">Add a Tool</a>
            <a className="btn-secondary" href={githubIssuesUrl} target="_blank" rel="noopener noreferrer">Manage Requests on GitHub</a>
          </div>
          {loading && <p role="status">Loading catalog…</p>}
          {error && <p role="alert">Unable to load catalog: {error}</p>}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tools.map(tool => (
              <article key={tool.id} className="card">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{tool.name}</h2>
                  <StatusBadge status={tool.status} />
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{tool.description}</p>
                <a className="mt-4 inline-block text-dell-blue hover:underline" href={githubToolUpdateUrl(tool)} target="_blank" rel="noopener noreferrer">Request an update ↗</a>
              </article>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
