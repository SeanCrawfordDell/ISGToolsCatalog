import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) =>
  `rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${isActive ? 'bg-dell-blue text-white' : 'bg-gray-100 text-gray-700 hover:bg-blue-100 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`;

const ReportsNav = () => (
  <nav className="mb-6 flex flex-wrap gap-2" aria-label="Reporting sections">
    <NavLink to="/reports" end className={linkClass}>Telemetry</NavLink>
    <NavLink to="/reports/portfolio" className={linkClass}>Portfolio</NavLink>
  </nav>
);

export default ReportsNav;
