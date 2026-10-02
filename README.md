# ISG Tools Catalog

React/Vite catalog for Dell technical support tools, GitHub request submissions, and telemetry reports.


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


Tests cover catalog reconciliation, build validation, initial telemetry loading, cancellation, late responses, and unavailable results. Lint targets source, tests, scripts, and configuration, not compiled bundles.


Do not manually edit `docs/`, put compiled JavaScript under `public/`, or restore the old root `assets/`, root `data/`, or `dist/` folders. Vite copies `public/` into the build; it should contain only static assets such as `favicon.svg`.

## Requests and catalog updates

Requests use the templates in `.github/ISSUE_TEMPLATE/`. The site links to GitHub for feature requests, bug reports, tool additions, catalog updates, and status changes. Maintainers review requests and commit approved changes to the authoritative catalog.

The site does not edit the repository directly and does not require a browser token or a separate admin password. GitHub permissions govern who can manage issues and merge changes. Never place credentials in `VITE_*` variables because they become public browser code.

## Telemetry

`src/services/telemetryApi.js` reads the existing Azure telemetry summary endpoint. Reports use estimated minutes per run to calculate hours saved. Failed requests display an unavailable state; changing tools cancels obsolete report requests and prevents late responses from replacing the selected report.

