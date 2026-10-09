# Contributing to NORTH

Read the [development guide](site/docs/development.md), [architecture](site/docs/architecture.md), and [evidence policy](site/docs/evidence-policy.md) before making changes. Product copy, documentation, commit subjects, and review descriptions are written in English.

## Working principles

1. Keep observed material and generated scenes distinguishable throughout exploration.
2. Preserve source dates and original locations. A selected year does not change a photograph's capture date.
3. Associate a building with a photograph through a reviewed explicit record, not proximity.
4. Keep fictional identities and thoughts labeled as reconstruction. Model output is not evidence.
5. Preserve a usable place list and the current image when map or asset loading fails.
6. Update the relevant documentation and review record when behavior or evidence changes.

## Changes and validation

Create a descriptive branch, such as `codex/improve-building-cards`, and keep commits focused. Separate product behavior, evidence updates, and documentation when each can be reviewed independently. Do not rewrite existing deployment history just to rename generated commit subjects.

Run checks from `site/`:

```sh
npx tsc --noEmit
node scripts/check-content.mjs
node scripts/check-residents.mjs
npm run build
```

For a documentation-only change, inspect the edited text, relative links, commands, and consistency with source. Reuse passing application checks when implementation and build inputs are unchanged. For interaction changes, follow the affected paths in the [validation checklist](site/docs/validation.md).

A review description should explain the problem, resulting behavior, validation performed, and any remaining limitations. Report an untested condition as untested rather than treating code inspection or a test double as an end-to-end result.

See [repository workflow](site/docs/repository-workflow.md) for the distinction between project commits, Sites source history, and deployment.
