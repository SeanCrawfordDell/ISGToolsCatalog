export const repositoryUrl = 'https://eos2git.cec.lab.emc.com/Sean-Crawford/ISGToolsCatalog';

export const githubIssueFormUrl = (type, toolName = '') => {
  const template = type === 'bug' ? 'bug_report.yml' : 'feature_request.yml';
  const prefix = type === 'bug' ? 'Bug' : 'Feature request';
  const title = toolName ? `${prefix}: ${toolName}` : prefix;

  return `${repositoryUrl}/issues/new?template=${template}&title=${encodeURIComponent(title)}`;
};

export const githubIssuesUrl = `${repositoryUrl}/issues`;

export const githubNewToolRequestUrl = `${repositoryUrl}/issues/new?template=new_tool.md&title=${encodeURIComponent('New tool request')}`;

const toolUpdateIssueUrl = (tool, changes = {}) => {
  const description = changes.description ?? tool.description;
  const overview = changes.overview ?? tool.whatItDoes;
  const valueProposition = changes.valueProposition ?? tool.valueProposition;
  const tags = changes.tags ?? tool.tags;
  const body = `## Tool update

- **Tool ID**: ${tool.id}
- **Team**: ${tool.team}
- **Region Created**: ${tool.regionCreated || 'North America'}
- **Category**: ${tool.category || 'Other'}
- **Status**: ${tool.status === 'internal-testing' ? 'Internal Testing' : tool.status}
- **Progress**: ${typeof tool.progress === 'number' ? `${tool.progress}%` : tool.progress || 'Not provided'}
- **Repository**: ${tool.repository || 'Not provided'}
- **Documentation**: ${tool.documentation || 'Not provided'}
- **Tags**: ${(Array.isArray(tags) ? tags.join(', ') : tags) || 'Not provided'}

## Description

${description}

## Overview

${overview}

## Value proposition

${valueProposition}`;

  return `${repositoryUrl}/issues/new?template=tool_update.md&title=${encodeURIComponent(`Catalog update: ${tool.name}`)}&body=${encodeURIComponent(body)}`;
};

export const githubToolUpdateUrl = (tool) => toolUpdateIssueUrl(tool);
