import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ISG Tools Catalog</h3>
            <p className="text-gray-400 text-sm">
              Tracking tools designed for ISG support engineers.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li><Link to="/tools" className="hover:text-white transition-colors">Tools Catalog</Link></li>
              <li><Link to="/reports" className="hover:text-white transition-colors">Reporting</Link></li>
              <li><Link to="/requests" className="hover:text-white transition-colors">Feedback & Enhancements</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400 text-sm">
              For questions or support, contact sean.crawford@dell.com
            </p>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
          <p>&copy; 2026 ISG Tools Catalog. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
