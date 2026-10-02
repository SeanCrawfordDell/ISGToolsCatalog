import catalog from '../data/tools.json' with { type: 'json' };

// The catalog has one editable source; Vite embeds this JSON during the build.
export const loadTools = async () => catalog.tools;

// Tool filtering and sorting
export const filterTools = (tools, filters) => {
  return tools.filter(tool => {
    if (filters.search && !tool.name.toLowerCase().includes(filters.search.toLowerCase()) &&
        !tool.description.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.status && tool.status !== filters.status) {
      return false;
    }
    if (filters.regionCreated && tool.regionCreated !== filters.regionCreated) {
      return false;
    }
    if (filters.category && tool.category !== filters.category) {
      return false;
    }
    if (filters.tags && filters.tags.length > 0) {
      const hasTag = filters.tags.some(tag => tool.tags.includes(tag));
      if (!hasTag) return false;
    }
    if (filters.operatingSystem && !tool.operatingSystem.includes(filters.operatingSystem)) {
      return false;
    }
    return true;
  });
};

export const sortTools = (tools, sortBy) => {
  const sorted = [...tools];
  switch (sortBy) {
    case 'name':
      sorted.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'date':
      sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
      break;
    default:
      break;
  }
  return sorted;
};

// Status color mapping
export const getStatusColor = (status) => {
  const colors = {
    idea: 'bg-gray-100 text-gray-800',
    planning: 'bg-blue-100 text-blue-800',
    development: 'bg-yellow-100 text-yellow-800',
    testing: 'bg-purple-100 text-purple-800',
    'internal-testing': 'bg-purple-100 text-purple-800',
    released: 'bg-green-100 text-green-800',
    maintenance: 'bg-indigo-100 text-indigo-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

// Date formatting
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Statistics calculations
export const calculateStats = (tools) => {
  const stats = {
    total: tools.length,
    byStatus: {},
    inDevelopment: 0,
    released: 0
  };

  tools.forEach(tool => {
    // By status
    stats.byStatus[tool.status] = (stats.byStatus[tool.status] || 0) + 1;
    
    // Development count
    if (tool.status === 'development' || tool.status === 'testing' || tool.status === 'internal-testing') {
      stats.inDevelopment++;
    }
    
    // Released count
    if (tool.status === 'released') {
      stats.released++;
    }
  });

  return stats;
};
