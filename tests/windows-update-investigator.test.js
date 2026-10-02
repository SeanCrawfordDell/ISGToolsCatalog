import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateStats, getStatusColor, loadTools } from '../src/utils/dataHelpers.js';
import { githubToolUpdateUrl } from '../src/utils/githubLinks.js';

test('catalog records Windows Update Investigator as an APJ internal-testing prototype', async () => {
  const tools = await loadTools();
  const tool = tools.find(item => item.name === 'Windows Update Investigator');

  assert.ok(tool, 'tool should be present in the catalog');
  assert.equal(tool.id, 'tool-020');
  assert.equal(tool.team, 'APJ Microsoft Team');
  assert.equal(tool.regionCreated, 'APJ');
  assert.equal(tool.status, 'internal-testing');
  assert.equal(tool.progress, 'Working Prototype');
  assert.equal(tool.repository, '');
  assert.equal(tool.documentation, '');
  assert.equal(tool.telemetryName, 'Windows Update Investigator');
  assert.deepEqual(tool.tags, [
    'Windows Update', 'Dell TSS', 'Devin CLI', 'PowerShell', 'CBS', 'DISM',
    'Windows Server', 'Log Analysis', 'Orchestration', 'Log Collection',
    'Troubleshooting', 'Telemetry', 'Diagnostic', 'Action Plan'
  ]);
  assert.match(tool.description, /AI-assisted PowerShell tool/);
  assert.equal(tool.whatItDoes, `The tool accepts any of the following inputs:

- A complete Windows Update TSS ZIP package
- An extracted TSS log directory
- An individual Windows Update log file (limited analysis mode)

It automatically discovers, extracts, and analyzes relevant servicing evidence, including:

- CBS and CBS Persist logs
- DISM logs
- Windows Update logs
- Servicing-related Event Logs
- System information
- Installed update inventory
- Package and component state information

After correlating evidence across these data sources, the tool leverages Devin AI to determine:

- The failed update transaction
- The affected KB, package, or feature update
- The initial causal error
- The underlying root cause
- Potential relevance to known issues
- Recommended remediation actions

The solution supports both Windows Client and Windows Server investigations and runs entirely through PowerShell using the Devin CLI.

The final output is a self-contained HTML investigation report containing:

- System configuration details
- Executive summary
- Investigation findings
- Supporting evidence
- Failure timeline
- Root cause analysis
- Remediation recommendations
- Post-remediation verification steps`);
  assert.equal(tool.valueProposition, `Investigating Windows Update failures often requires engineers to manually review large volumes of CBS, DISM, Windows Update, Event Viewer, and TSS log data. Identifying the actual failed transaction and separating true installation failures from unrelated scan, download, metadata, or communication errors can be both time-consuming and error-prone.

Devin Windows Update Investigator significantly reduces this effort by automatically collecting relevant evidence, correlating events across multiple log sources, and producing a structured, evidence-based root cause analysis.

By standardizing the investigation process, the tool helps:

- Reduce analysis time
- Improve investigation consistency
- Accelerate issue resolution
- Minimize manual log review
- Deliver clear, evidence-backed remediation guidance

The solution is designed for:

- Technical Support Engineers
- Escalation Engineers
- Windows Administrators
- Supportability Teams
- Windows Server Specialists
- Customer Success and Operations Teams

Its primary goal is to help engineers move from log collection to root cause identification faster, with greater accuracy and consistency than traditional manual investigation methods.`);
});

test('Internal Testing appears as a distinct status and counts as testing work', async () => {
  const tool = (await loadTools()).find(item => item.name === 'Windows Update Investigator');

  assert.equal(getStatusColor(tool.status), 'bg-purple-100 text-purple-800');
  assert.deepEqual(calculateStats([tool]), {
    total: 1,
    byStatus: { 'internal-testing': 1 },
    inDevelopment: 1,
    released: 0,
    testing: 1
  });
});

test('tool update requests show named progress stages without a percent sign', async () => {
  const tool = (await loadTools()).find(item => item.name === 'Windows Update Investigator');
  const body = new URL(githubToolUpdateUrl(tool)).searchParams.get('body');

  assert.match(body, /\*\*Status\*\*: Internal Testing/);
  assert.match(body, /\*\*Progress\*\*: Working Prototype/);
  assert.match(body, /## Overview/);
  assert.doesNotMatch(body, /Working Prototype%/);
});
