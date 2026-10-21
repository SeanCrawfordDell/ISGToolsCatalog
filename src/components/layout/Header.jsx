import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useDarkMode } from '../../hooks/useDarkMode';

const Header = () => {
  const { isDark, toggle } = useDarkMode();
  const [aiResourcesOpen, setAiResourcesOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setAiResourcesOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-dell-blue rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">ISG Tools Catalog</span>
            </Link>
          </div>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-dell-blue dark:hover:text-dell-blue px-3 py-2 rounded-md font-medium">
              Home
            </Link>
            <Link to="/tools" className="text-gray-700 dark:text-gray-300 hover:text-dell-blue dark:hover:text-dell-blue px-3 py-2 rounded-md font-medium">
              Tools
            </Link>
            
            {/* AI Resources Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setAiResourcesOpen(!aiResourcesOpen)}
                className="text-gray-700 dark:text-gray-300 hover:text-dell-blue dark:hover:text-dell-blue px-3 py-2 rounded-md font-medium flex items-center"
              >
                AI Resources
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {aiResourcesOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                  <div className="py-2">
                    <Link
                      to="/ai-skills"
                      onClick={() => setAiResourcesOpen(false)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      AI Skills
                    </Link>
                    <a
                      href="https://dell.sharepoint.com/sites/AICentral"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAiResourcesOpen(false)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Primary Dell AI Information Hub
                    </a>
                    <a
                      href="https://mcp-registry.cec.delllabs.net/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAiResourcesOpen(false)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      MCP Catalog
                    </a>
                    <a
                      href="https://web-app-hydra-harness-backend-prod.does-p2.kob.dell.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAiResourcesOpen(false)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      AI Resource Links
                    </a>
                    <a
                      href="https://servicesagenticcatalog.prod-a4.kob.dell.com/catalog?type=agent"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAiResourcesOpen(false)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Agentic AI Tool Catalog
                    </a>
                    <a
                      href="https://dell.sharepoint.com/sites/Prompt-Hub/SitePages/Prompt-Hub.aspx"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setAiResourcesOpen(false)}
                      className="block px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      AI Prompt Hub
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <Link to="/reports" className="text-gray-700 dark:text-gray-300 hover:text-dell-blue dark:hover:text-dell-blue px-3 py-2 rounded-md font-medium">
              Reporting
            </Link>
            <Link to="/requests" className="text-gray-700 dark:text-gray-300 hover:text-dell-blue dark:hover:text-dell-blue px-3 py-2 rounded-md font-medium">
              Feedback & Enhancements
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <a
              href="https://pages.eos2git.cec.lab.emc.com/Sean-Crawford/ProSupportTSA/index.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-300 hover:text-dell-blue dark:hover:text-dell-blue px-3 py-2 rounded-md font-medium transition-colors"
            >
              Technical Support Assistant
            </a>
            <button 
              onClick={toggle}
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
              {isDark ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
