import { readFile } from 'node:fs/promises';

try {
  const path = process.argv[2] || new URL('../src/data/tools.json', import.meta.url);
  const { tools } = JSON.parse(await readFile(path, 'utf8'));
  if (!Array.isArray(tools) || !tools.length) throw new Error('Catalog must contain tools');
  const ids = new Set();
  const statuses = new Set(['planning', 'development', 'testing', 'internal-testing', 'released', 'maintenance']);
  for (const tool of tools) {
    if (ids.has(tool.id)) throw new Error(`Duplicate tool id: ${tool.id}`);
    ids.add(tool.id);
    for (const field of ['id', 'name', 'description', 'whatItDoes', 'valueProposition', 'owner', 'team', 'category', 'regionCreated', 'telemetryName']) {
      if (typeof tool[field] !== 'string' || !tool[field].trim()) throw new Error(`${tool.id}: missing ${field}`);
    }
    if (!statuses.has(tool.status)) throw new Error(`${tool.id}: invalid status`);
    const validProgress = Number.isFinite(tool.progress)
      ? tool.progress >= 0 && tool.progress <= 100
      : typeof tool.progress === 'string' && Boolean(tool.progress.trim());
    if (!validProgress) throw new Error(`${tool.id}: progress must be 0–100 or a non-empty stage label`);
    if (!Number.isFinite(tool.minutesSavedPerRun) || tool.minutesSavedPerRun < 0) throw new Error(`${tool.id}: invalid minutesSavedPerRun`);
    if (!Array.isArray(tool.operatingSystem) || !tool.operatingSystem.length || !tool.operatingSystem.every(os => typeof os === 'string' && os.trim())) throw new Error(`${tool.id}: operatingSystem must be a non-empty array of strings`);
    if (!Array.isArray(tool.tags) || !tool.tags.every(tag => typeof tag === 'string')) throw new Error(`${tool.id}: tags must be an array of strings`);
    if (tool.aiIntegration !== undefined && typeof tool.aiIntegration !== 'boolean') throw new Error(`${tool.id}: aiIntegration must be true or false`);
    const tagLower = new Set();
    for (const tag of tool.tags) {
      if (tagLower.has(tag.toLowerCase())) throw new Error(`${tool.id}: duplicate tag (case-insensitive): ${tag}`);
      tagLower.add(tag.toLowerCase());
    }
    for (const field of ['repository', 'documentation']) {
      if (!tool[field]) continue;
      const url = new URL(tool[field]);
      if (!['http:', 'https:'].includes(url.protocol) || /[[\]\s]/.test(tool[field])) throw new Error(`${tool.id}: invalid ${field} URL`);
    }
  }
  console.log(`Catalog valid: ${tools.length} unique tools`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
