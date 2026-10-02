import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { loadTools, filterTools } from '../src/utils/dataHelpers.js';

test('catalog edits reach the loader instead of a separate embedded copy', async () => {
  const source = JSON.parse(await readFile(new URL('../src/data/tools.json', import.meta.url)));
  assert.deepEqual(await loadTools(), source.tools);
});

test('existing detail links retain their identities during reconciliation', async () => {
  const tools = await loadTools();
  for (const [id, name] of [['tool-001', 'Dell ProSupport ToolBox'], ['tool-007', 'iDRAC Connection Manager'], ['tool-008', 'KeyRelay'], ['tool-017', 'CluChk'], ['tool-018', 'DriFT']]) {
    assert.equal(tools.find(tool => tool.id === id)?.name, name);
  }
  assert.equal(new Set(tools.map(tool => tool.id)).size, tools.length);
});

test('recent owner corrections and SLIC survive removal of the legacy catalog', async () => {
  const tools = await loadTools();
  for (const name of ['DART', 'TALI', 'iDRAC Connection Manager']) {
    assert.equal(tools.find(tool => tool.name === name)?.owner, 'Jim Gandy');
  }
  const slic = filterTools(tools, { search: 'SLIC' })[0];
  assert.equal(slic?.name, 'SLIC');
  assert.equal(slic.status, 'released');
  assert.equal(slic.progress, 100);
  assert.equal(new URL(slic.repository).pathname, '/DellProSupportGse/Tools');
  assert.notEqual(slic.id, 'tool-008');
});

test('catalog supplies valid report estimates without display-name lookup failures', async () => {
  const tools = await loadTools();
  const idrac = tools.find(tool => tool.name === 'iDRAC Connection Manager');
  assert.equal(idrac.minutesSavedPerRun, 10);
  for (const tool of tools) {
    assert.ok(Number.isFinite(tool.minutesSavedPerRun) && tool.minutesSavedPerRun >= 0);
    assert.ok(tool.category && tool.regionCreated && tool.telemetryName);
  }
});

test('SLIC and DriFT are released at full completion', async () => {
  const tools = await loadTools();
  for (const name of ['SLIC', 'DriFT']) {
    const tool = tools.find(item => item.name === name);
    assert.equal(tool?.status, 'released', `${name} should be released`);
    assert.equal(tool?.progress, 100, `${name} should show full completion`);
  }
});

test('DriFT description and value proposition use the approved wording', async () => {
  const drift = (await loadTools()).find(item => item.name === 'DriFT');
  assert.match(drift.description, /driver and firmware validation.*Windows and Azure Local servers/i);
  for (const detail of ['recommended code currency', 'direct links to the appropriate Dell packages', 'HTML report']) {
    assert.ok(drift.whatItDoes.toLowerCase().includes(detail.toLowerCase()), `DriFT workflow should mention ${detail}`);
  }
  assert.equal(drift.valueProposition, `Drift dramatically reduces the time required to assess server compliance and update status. Tasks that traditionally take 10 to 20 minutes per server can be completed in less than 2 minutes.

Key benefits include:

- Rapid validation of firmware and driver compliance against Dell best practices.
- Automated identification of missing updates and recommended remediation actions.
- Easy-to-share HTML reporting for customers and support teams.
- Improved visibility into the patch levels of customer environments without requiring third-party software.
- Faster identification of potential security vulnerabilities caused by missing firmware or driver updates.
- Reduced troubleshooting and assessment time, enabling support engineers to focus on resolving customer issues.

Business Impact
By automating firmware and driver validation, Drift helps support engineers quickly assess system health, improve security posture, and accelerate customer support engagements. The result is faster issue resolution, increased operational efficiency, and a more consistent approach to maintaining server compliance.`);
  assert.equal(drift.status, 'released');
  assert.equal(drift.progress, 100);
});

test('SLIC description and details use the approved wording', async () => {
  const slic = (await loadTools()).find(item => item.name === 'SLIC');
  assert.equal(slic.description, `SLIC is a Dell switch Log Collection tool designed for Azure Local environments. It parses Dell switch logs, validates switch configurations against Azure Local recommended settings, and generates a detailed HTML report for troubleshooting and compliance review.`);
  assert.equal(slic.whatItDoes, `- Reads and analyzes raw Dell switch log files.
- Extracts key events, errors, warnings, and operational status information.
- Compares switch configurations against Azure Local validated and recommended settings.
- Identifies configuration drift, misconfigurations, and compliance gaps.
- Generates a clear, easy-to-read HTML report with summarized findings, tables, and visualizations where applicable.`);
  assert.equal(slic.valueProposition, `SLIC significantly reduces the time and effort required to review and validate switch configurations in Azure Local deployments.

Key benefits include:

- Automates the analysis of large and complex switch log files.
- Quickly identifies configuration issues and deviations from validated Azure Local standards.
- Produces a shareable HTML report that simplifies troubleshooting and customer communication.
- Helps administrators and support engineers detect critical events, errors, and warnings that might otherwise be overlooked.
- Improves operational consistency by validating network configurations against known best practices.
- Accelerates root cause analysis and reduces troubleshooting time during support engagements.

#### Business Impact

By automating switch Log Collection and configuration validation, SLIC helps support teams rapidly assess network health, identify configuration drift, and ensure Azure Local environments remain aligned with recommended configurations. This leads to faster issue resolution, improved operational reliability, and a more efficient support experience.`);
});
