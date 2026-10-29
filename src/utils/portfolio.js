export const STATUSES = [
  { id: 'idea', label: 'Idea' },
  { id: 'planning', label: 'Planning' },
  { id: 'development', label: 'Development' },
  { id: 'testing', label: 'Testing' },
  { id: 'internal-testing', label: 'Internal Testing' },
  { id: 'released', label: 'Released' },
  { id: 'maintenance', label: 'Maintenance' }
];
export const GROUPINGS = ['Development Status', 'Owner', 'Category'];
export const UNASSIGNED = 'Unassigned';
const UNCATEGORIZED = 'Uncategorized';
const OTHER = { id: 'other', label: 'Other' };
const IN_DEVELOPMENT = ['idea', 'planning', 'development'];
const IN_TESTING = ['testing', 'internal-testing'];
const LIVE = ['released', 'maintenance'];

const text = value => String(value ?? '').trim();
const statusOf = id => STATUSES.find(s => s.id === id) || OTHER;
const statusIndex = id => {
  const index = STATUSES.findIndex(s => s.id === id);
  return index < 0 ? STATUSES.length : index;
};

export function ownerName(owner) {
  const value = text(owner);
  const email = /^([^@\s]+)@[^@\s]+$/.exec(value);
  if (!email) return value || UNASSIGNED;
  return email[1].split(/[._-]+/).filter(Boolean).map(p => p[0].toUpperCase() + p.slice(1).toLowerCase()).join(' ');
}

export function ownerNames(owner) {
  const names = [...new Set(text(owner).split(/\s*[,;/]\s*|\s+and\s+|\s*&\s*/i).map(text).filter(Boolean).map(ownerName))];
  return names.length ? names : [UNASSIGNED];
}

export function normalize(tool, index = 0) {
  const statusId = text(tool?.status).toLowerCase();
  const status = statusOf(statusId);
  const progressValue = tool?.progress;
  const percent = Number.isFinite(progressValue) ? Math.max(0, Math.min(100, Math.round(progressValue))) : null;
  const owners = ownerNames(tool?.owner);
  return {
    id: text(tool?.id) || `tool-${index + 1}`,
    name: text(tool?.name) || 'Untitled tool',
    category: text(tool?.category) || UNCATEGORIZED,
    description: text(tool?.description),
    owners,
    owner: owners.join(', '),
    status: status.id,
    statusLabel: status === OTHER && statusId ? statusId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : status.label,
    percent,
    progressLabel: percent === null ? text(progressValue) : `${percent}%`,
    os: (Array.isArray(tool?.operatingSystem) ? tool.operatingSystem : [tool?.operatingSystem]).map(text).filter(Boolean).join(', '),
    aiIntegration: tool?.aiIntegration === true,
    platform: (Array.isArray(tool?.platform) ? tool.platform : []).map(text).filter(Boolean).join(', ')
  };
}

export const loadPortfolio = tools => (Array.isArray(tools) ? tools : []).filter(t => t && typeof t === 'object').map(normalize);

export const order = (a, b) => statusIndex(a.status) - statusIndex(b.status) || a.name.localeCompare(b.name);

export function matches(tool, query) {
  const term = text(query).toLowerCase();
  if (!term) return true;
  return [tool.name, tool.category, tool.description, tool.owner, tool.statusLabel, tool.os, tool.platform, tool.progressLabel].join(' ').toLowerCase().includes(term);
}

const usedStatuses = tools => [...STATUSES, OTHER].filter(s => s !== OTHER || tools.some(t => t.status === 'other'));

export function summary(tools) {
  const count = ids => tools.filter(t => ids.includes(t.status)).length;
  return {
    total: tools.length,
    released: count(LIVE),
    testing: count(IN_TESTING),
    inDevelopment: count(IN_DEVELOPMENT),
    owners: new Set(tools.flatMap(t => t.owners).filter(o => o !== UNASSIGNED)).size,
    statuses: usedStatuses(tools).map(s => ({ id: s.id, label: s.label, count: tools.filter(t => t.status === s.id).length }))
  };
}

export function owners(tools) {
  return [...new Set(tools.flatMap(t => t.owners))].map(name => {
    const mine = tools.filter(t => t.owners.includes(name)).sort(order);
    const byStatus = usedStatuses(mine).map(s => ({ id: s.id, label: s.label, count: mine.filter(t => t.status === s.id).length })).filter(s => s.count);
    return { name, tools: mine, byStatus };
  }).sort((a, b) => (b.name === UNASSIGNED) - (a.name === UNASSIGNED) || b.tools.length - a.tools.length || a.name.localeCompare(b.name));
}

export function groups(tools, by = 'Development Status') {
  if (by === 'Owner') return owners(tools).map(o => ({ key: o.name, name: o.name, tools: o.tools }));
  if (by === 'Category') {
    const names = [...new Set(tools.map(t => t.category))].sort((a, b) => (a === UNCATEGORIZED) - (b === UNCATEGORIZED) || a.localeCompare(b));
    return names.map(name => ({ key: name, name, tools: tools.filter(t => t.category === name).sort(order) }));
  }
  return usedStatuses(tools).map(s => ({ key: s.id, name: s.label, tools: tools.filter(t => t.status === s.id).sort(order) })).filter(g => g.tools.length);
}

export const columns = tools => usedStatuses(tools).map(s => ({ id: s.id, name: s.label, tools: tools.filter(t => t.status === s.id).sort(order) }));

export const initials = name => name === UNASSIGNED ? '?' : text(name).split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0].toUpperCase()).join('');
