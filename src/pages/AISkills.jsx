import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AISkills = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-grow bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              AI Skills
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Explore AI-powered capabilities and skills available in the ISG Tools Catalog.
            </p>
          </div>

          <div className="card">
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto text-dell-blue mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                Coming Soon
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                AI Skills content is being developed. Check back soon for updates.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default AISkills;
