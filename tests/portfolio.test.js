import test from 'node:test';
import assert from 'node:assert/strict';
import { loadTools } from '../src/utils/dataHelpers.js';
import { loadPortfolio, ownerNames, summary, groups, columns, owners, matches, UNASSIGNED } from '../src/utils/portfolio.js';

test('several owners in one field become separate owners', () => {
  assert.deepEqual(ownerNames('Jim.Gandy@dell.com, Tommy.Paulk@dell.com'), ['Jim Gandy', 'Tommy Paulk']);
  assert.deepEqual(ownerNames(''), [UNASSIGNED]);
  assert.deepEqual(ownerNames('APJ Microsoft Team'), ['APJ Microsoft Team']);
});

test('portfolio covers every catalog tool and keeps named progress stages', async () => {
  const tools = await loadTools();
  const portfolio = loadPortfolio(tools);
  assert.equal(portfolio.length, tools.length);
  const investigator = portfolio.find(t => t.name === 'Windows Update Investigator');
  assert.equal(investigator.percent, null);
  assert.equal(investigator.progressLabel, 'Working Prototype');
  assert.equal(investigator.statusLabel, 'Internal Testing');
});

test('summary, groups, columns and owners account for each tool', async () => {
  const portfolio = loadPortfolio(await loadTools());
  const stats = summary(portfolio);
  assert.equal(stats.statuses.reduce((sum, s) => sum + s.count, 0), portfolio.length);
  assert.equal(stats.released + stats.testing + stats.inDevelopment, portfolio.length);
  assert.equal(groups(portfolio).reduce((sum, g) => sum + g.tools.length, 0), portfolio.length);
  assert.equal(columns(portfolio).reduce((sum, c) => sum + c.tools.length, 0), portfolio.length);
  const cluchk = portfolio.find(t => t.name === 'CluChk');
  assert.ok(owners(portfolio).filter(o => o.tools.includes(cluchk)).length >= 2);
});

test('filter matches names, owners and statuses', () => {
  const [tool] = loadPortfolio([{ id: 'x', name: 'Alpha', owner: 'a.b@dell.com', status: 'released', category: 'Utility', description: 'd' }]);
  assert.ok(matches(tool, 'alpha'));
  assert.ok(matches(tool, 'a b'));
  assert.ok(matches(tool, 'released'));
  assert.ok(!matches(tool, 'zzz'));
});
