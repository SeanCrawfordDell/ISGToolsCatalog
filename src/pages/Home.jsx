import { Link } from 'react-router-dom';
import { useTools } from '../hooks/useTools';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import StatusBadge from '../components/tools/StatusBadge';

const Home = () => {
  const { tools, stats, loading } = useTools();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-dell-blue"></div>
      </div>
    );
  }

  const featuredTools = tools.slice(0, 3);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-dell-blue to-blue-600 text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                ISG Tools Catalog
              </h1>
              <p className="text-xl md:text-2xl mb-8 text-blue-100">
                Discover tools designed for and by ISG support team members
              </p>
              <div className="flex justify-center space-x-4">
                <Link to="/tools" className="btn-primary bg-white text-dell-blue hover:bg-gray-100">
                  Browse Tools
                </Link>
                <Link to="/reports" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-dell-blue">
                  View Reports
                </Link>
                <Link to="/requests" className="btn-secondary bg-transparent border-2 border-white text-white hover:bg-white hover:text-dell-blue">
                  Submit Feedback or Enhancement
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        {stats && (
          <section className="py-12 bg-white dark:bg-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card text-center">
                  <div className="text-3xl font-bold text-dell-blue">{stats.total}</div>
                  <div className="text-gray-600 dark:text-gray-400">Total Tools</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-yellow-500">{stats.inDevelopment}</div>
                  <div className="text-gray-600 dark:text-gray-400">In Development</div>
                </div>
                <div className="card text-center">
                  <div className="text-3xl font-bold text-green-500">{stats.released}</div>
                  <div className="text-gray-600 dark:text-gray-400">Released</div>
              </div>
              </div>
            </div>
          </section>
        )}

        {/* Featured Tools */}
        <section className="py-16 bg-gray-50 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
              Featured Tools
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {featuredTools.map(tool => (
                <Link key={tool.id} to={`/tools/${tool.id}`} className="block">
                  <div className="card hover:shadow-lg transition-shadow h-full">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {tool.name}
                      </h3>
                      <StatusBadge status={tool.status} />
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {tool.description}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/tools" className="btn-primary">
                View All Tools
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Explore Tool Usage
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              View telemetry reports and usage statistics for all tools.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/reports" className="btn-primary">
                View Reports
              </Link>
              <Link to="/requests" className="btn-secondary">
                Submit Feedback or Enhancement
              </Link>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
