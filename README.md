# ISG Tools Catalog

React/Vite catalog for Dell technical support tools, GitHub request submissions, and telemetry reports.

[Open the catalog](https://pages.eos2git.cec.lab.emc.com/Sean-Crawford/ISGToolsCatalog/)

## Edit the catalog

**Edit only `src/data/tools.json`.** It is the authoritative catalog, imported by `src/utils/dataHelpers.js` and embedded in the production JavaScript by Vite. Editing the JSON requires rebuilding and committing `docs/` before the deployed site changes.

Each tool contains:

- A unique, stable `id`. Existing IDs are used in detail links; do not renumber them.
- Name, description, purpose, value proposition, owner, team, status, progress (percentage or stage label), dates, tags, and roadmap.
- `category` and `regionCreated` for filtering.
- `telemetryName`: the identifier sent to the telemetry endpoint. Separate from the display name so future renames need not break reporting. Existing identifiers were retained during cleanup.
- `minutesSavedPerRun`: the default estimate used in reports. These are estimates, not measured durations. User overrides are stored per tool in their browser.
- `documentationAnchor`: an optional section anchor in the Dell ProSupport GSE Tools README. Use `null` when there is no verified section.

`npm run validate:catalog` checks unique IDs, required fields, status, percentage or named-stage progress, estimates, arrays, and URL syntax. The build runs this validation automatically; it does not validate external URL availability or tool business facts.

## Development and verification

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
npm test
npm run lint
npm run build
npm run preview
```

Tests cover catalog reconciliation, build validation, initial telemetry loading, cancellation, late responses, and unavailable results. Lint targets source, tests, scripts, and configuration, not compiled bundles.

The application uses hash routes (`#/tools`, `#/reports`, `#/requests`, `#/admin`) so direct links work with EOS GitHub Pages. The retained `/admin` route now provides catalog update links; GitHub handles authentication and request management.

## Deployment

Set `VITE_PUBLIC_BASE=/Sean-Crawford/ISGToolsCatalog/` when building for EOS GitHub Pages. The build output is **`docs/`**, which the configured Pages branch publishes.

1. Update source files or `src/data/tools.json`.
2. Run `npm test`, `npm run lint`, and `npm run build`.
3. Preview and check the affected routes.
4. Commit source changes and the regenerated `docs/` together.
5. Review and merge through the normal repository workflow. EOS GitHub Pages publishes the configured branch's `/docs` output.

Do not manually edit `docs/`, put compiled JavaScript under `public/`, or restore the old root `assets/`, root `data/`, or `dist/` folders. Vite copies `public/` into the build; it should contain only static assets such as `favicon.svg`.

## Requests and catalog updates

Requests use the templates in `.github/ISSUE_TEMPLATE/`. The site links to GitHub for feature requests, bug reports, tool additions, catalog updates, and status changes. Maintainers review requests and commit approved changes to the authoritative catalog.

The site does not edit the repository directly and does not require a browser token or a separate admin password. GitHub permissions govern who can manage issues and merge changes. Never place credentials in `VITE_*` variables because they become public browser code.

## Telemetry

`src/services/telemetryApi.js` reads the existing Azure telemetry summary endpoint. Reports use estimated minutes per run to calculate hours saved. Failed requests display an unavailable state; changing tools cancels obsolete report requests and prevents late responses from replacing the selected report.

## September 2026 cleanup and reconciliation

The pre-cleanup snapshot is commit `2bcc5ac8368dac68d1077c224506d8edaa0767a9`. A full Git bundle backup with restore instructions was created and restored successfully before editing. Git history also retains all removed tracked files.

- Preserved all 18 active catalog records and their IDs, descriptions, statuses, and progress.
- Carried the September 23 root-JSON owner edits for DART, TALI, and iDRAC Connection Manager into the active catalog: Jim Gandy.
- Added the previously unused SLIC record as `tool-019`, retaining its supplied status (testing), progress (75%), owner, dates, team, and tags. Corrected its malformed Markdown-in-URL strings to the intended GSE Tools repository. Assigned Log Analysis and the existing North America/30-minute defaults; those classifications and the inherited tags/estimates can be reviewed in the JSON.
- Retained the current DriFT record as testing/85%; cleanup does not reinterpret a commit title as approval to change its lifecycle status.
- Removed old JSON copies, embedded sample requests, disabled browser GitHub API code, the demo password gate, unused starter assets, old build locations, and generated Graphify analysis output.
- Consolidated categories, regions, documentation anchors, and report defaults into the catalog. The iDRAC report now uses its intended 10-minute default rather than the old name-mismatch fallback.

The old root-JSON IDs referred to different tools and included a duplicate `tool-008`. They were not copied over the active IDs. Older placeholder descriptions/statuses were not allowed to overwrite the active catalog; the full original files remain recoverable from the backup and Git history.
