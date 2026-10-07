import { getStatusColor } from '../../utils/dataHelpers';

const StatusBadge = ({ status }) => {
  const statusLabels = {
    idea: 'Idea',
    planning: 'Planning',
    development: 'Development',
    testing: 'Testing',
    'internal-testing': 'Internal Testing',
    released: 'Released',
    maintenance: 'Maintenance'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {statusLabels[status] || status}
    </span>
  );
};

export default StatusBadge;
