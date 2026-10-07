import { useSearchParams } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useTools } from '../hooks/useTools';
import { githubIssueFormUrl, githubNewToolRequestUrl, githubStatusChangeUrl, githubIssuesUrl } from '../utils/githubLinks';

const Requests = () => {
  const [params] = useSearchParams();
  const { tools } = useTools();
  const tool = tools.find(item => item.id === params.get('toolId'));

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Feature Requests</h1>
          <section className="card">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Submit and track requests on GitHub</h2>
            <p className="mt-3 text-gray-600 dark:text-gray-400">Use GitHub to submit requests, follow their status, and discuss updates with the team. Catalog changes appear after review and deployment.</p>
            {tool && <p className="mt-3 text-gray-600 dark:text-gray-400">Related tool: {tool.name}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <a className="btn-primary" href={githubIssueFormUrl('feature', tool?.name)} target="_blank" rel="noopener noreferrer">Submit Feature Request</a>
              <a className="btn-secondary" href={githubIssueFormUrl('bug', tool?.name)} target="_blank" rel="noopener noreferrer">Submit a Bug</a>
              <a className="btn-secondary" href={githubNewToolRequestUrl} target="_blank" rel="noopener noreferrer">New Tool Request</a>
              <a className="btn-secondary" href={githubStatusChangeUrl} target="_blank" rel="noopener noreferrer">Request Status Change</a>
            </div>
            <a className="mt-6 inline-block text-dell-blue hover:underline" href={githubIssuesUrl} target="_blank" rel="noopener noreferrer">View requests and discussions on GitHub ↗</a>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Requests;
