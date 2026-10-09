# Repository and commit workflow

## Two source contexts

The top-level `north` repository is the project source repository. It tracks the complete application under `site/` as ordinary files. A fresh clone needs no submodule checkout to obtain the app, content manifests, map data, or scene assets.

The original local workspace also has a separate Sites-managed Git repository at `site/.git`. It records source used by the existing private deployment. Its Git metadata is excluded from the top-level repository. This local arrangement is deployment tooling state, not a second application or a required submodule.

Work from the top-level directory for project commits. Commands run inside `site/` target its separate Git history when that local repository is present. Specify the intended working directory; do not assume both commands operate on the same repository.

```sh
# Project source history
cd north
git status --short
git log --oneline -5

# Local Sites source history, if its repository exists
cd site
git status --short
git log --oneline -5
```

Preserve the Sites Git metadata and `.openai/hosting.json`. Do not turn `site/` into a gitlink, remove its deployment history, replace the hosted project, or rewrite old deployment commits during ordinary project cleanup.

## Commit practices

Use English, action-oriented subjects. Group a commit around one coherent outcome that can be reviewed and reverted.

Examples:

```text
feat: add contextual resident thoughts
fix: prevent pedestrian clicks from selecting buildings
docs: explain evidence policy and validation limits
content: add a reviewed regional railway reference
```

A useful body explains the problem, resulting behavior, evidence changes, and validation. Separate unrelated asset/content changes from UI work when they can be assessed independently. Before committing, inspect `git diff`, `git diff --cached`, and the paths being staged. Avoid staging everything indiscriminately while research or runtime files are present.

Use descriptive branches for subsequent work, such as `codex/improve-street-selection`. Existing deployment-generated `Update Site source` commits remain an accurate record of that workflow; do not rewrite them to manufacture a cleaner history.

## What belongs in source

Commit application code, reviewed source/claim manifests, accepted service assets, map datasets with attribution, licenses, the lockfile, checks, and documentation.

Exclude dependency directories, generated build output, incremental caches, real environment values, credentials, local tool state, raw research downloads, local screenshots, and deployment archives. These exclusions preserve the files locally. Reviewed provenance belongs in `lib/content.ts` and `content/`, not only in a research download.

The current project has a root `.gitignore` for workspace/research/private files and an application `.gitignore` for runtime/build/dependency files. Keep both aligned with any future configuration convention.

## Updating source and deploying

A project commit, a Sites source commit, a build, and a deployment are distinct events. Committing documentation does not change the live application.

For a product publication:

1. Finish the change, reviewed assets, and required checks.
2. Reuse the existing Sites project and its selected source checkout.
3. Use the supported Sites workflow to prepare the exact source, build it, push it, and package the matching output.
4. Save/deploy the returned source commit and archive, preserving the current audience.
5. Verify a terminal deployment result. If a saved version's deployment fails transiently, reuse that version instead of saving the same source repeatedly.
6. Report the verified URL and remaining limits. Record source/deployment IDs only when useful for diagnostics or review.

Do not manually repoint the Sites repository at the GitHub remote or treat a GitHub push as a Sites deployment. The Sites workflow manages its own source repository.

## Documentation upkeep

- Keep README commands executable from their stated directory.
- Update architecture when a state/runtime boundary changes.
- Update evidence policy, rights, and production records when sources/assets change.
- Record actual test environments/results in `content/qa.md`; keep untested device paths explicit.
- Add notable user-visible changes to the project changelog.
- Review roadmap language so plans are not described as implemented behavior.

For docs-only work, verify text and links and preserve existing passing app checks. A new product deployment is unnecessary when the served behavior and assets have not changed.
