import test from 'node:test';
import assert from 'node:assert/strict';
import { githubToolChangeProposalUrl } from '../src/utils/githubLinks.js';

test('tool change proposals preserve metadata and use the proposed catalog fields', () => {
  const tool = {
    id: 'tool-001',
    name: 'Example Tool',
    team: 'Platform',
    regionCreated: 'North America',
    category: 'Tool Access',
    status: 'released',
    progress: 100,
    repository: 'https://example.test/repository',
    documentation: 'https://example.test/documentation',
    description: 'Current description',
    whatItDoes: 'Current overview',
    valueProposition: 'Current value',
    tags: ['current']
  };
  const url = new URL(githubToolChangeProposalUrl(tool, {
    description: 'Proposed description',
    overview: 'Proposed overview',
    valueProposition: 'Proposed value',
    tags: ['proposed', 'catalog']
  }));

  assert.equal(url.searchParams.get('template'), 'tool_update.md');
  assert.equal(url.searchParams.get('title'), 'Catalog update: Example Tool');
  assert.equal(url.searchParams.get('body'), `## Tool update

- **Tool ID**: tool-001
- **Team**: Platform
- **Region Created**: North America
- **Category**: Tool Access
- **Status**: released
- **Progress**: 100%
- **Repository**: https://example.test/repository
- **Documentation**: https://example.test/documentation
- **Tags**: proposed, catalog

## Description

Proposed description

## Overview

Proposed overview

## Value proposition

Proposed value`);
});
