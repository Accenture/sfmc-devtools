# Migrating to v10

## Scope

Starting with v10, mcdev uses the tooling and migration requirements described in this guide. For v9 behavior, refer to the v9 release notes.

The v10 tooling baseline uses `eslint-plugin-sfmc` 5.0.0 and JSDoc 64.3.6. Generated versions are derived from mcdev's package manifest using the existing array of dependency names, not an independent version map. Refer to the installed mcdev package's manifest for its Unicorn version.

## Upgrade Node before upgrading tooling

The Node.js range is `^22.22.2 || >=24.15.0`:

- Node 22.22.2 and later Node 22 patches are supported.
- Node 24.15.0 and newer stable versions are supported.
- Node 20, 21, all Node 23 versions, earlier Node 22/24 patches and prereleases are unsupported.

Check `node --version` in the terminal, CI runner and containers. Both CLI usage and programmatic imports require a runtime that satisfies the package's engine range.

The editor ESLint extension can use a different runtime from the terminal. If needed, set its `eslint.runtime` setting to the absolute path of a supported Node executable, then restart the ESLint server. Do not assume upgrading the terminal also upgrades the editor's runtime.

CI is configured to exercise the exact Node 22.22.2 and 24.15.0 floors alongside the current Node 25 patch.

## Review and approve the coupled migration

Before running the v10 `mcdev upgrade` or initializing an existing project, save project-specific configuration and review the changes on a branch. Required migration destinations include:

- `eslint.config.js`
- `.prettierrc`
- `.prettierignore`
- `.vscode/settings.json`
- mcdev-managed scripts and tooling dependencies in `package.json`

Missing or identical required files do not require replacement approval. Differing required files need explicit interactive approval, including editor settings. `--yes` and `--skipInteraction` must not silently authorize those replacements. Review custom scripts, dependency conflicts and backup destinations as part of the same preflight, before any tooling mutation or retirement.

Declining a required change leaves the migration incomplete; do not interpret a partial installation as success. Optional-file declines may still succeed. Do not overwrite a pre-existing backup to force progress: inspect it and resolve the conflict first. On retry after an npm failure, identical replacement files can be accepted despite an existing backup; a missing destination can be recreated without overwriting its backup. Completion/version persistence belongs only at the end, after all required steps and the final save succeed.

## Linting and formatting are separate

Generated projects use these commands:

- `npm run lint`: diagnostics without automatic fixes.
- `npm run lint:fix`: apply ESLint fixes.
- `npm run format`: apply Prettier formatting.
- `npm run format:check`: check formatting without writing.

Replace old CI invocations of `eslint-check` with `lint`, and run `format:check` separately. Collisions with the managed `lint`, `lint:fix`, `format` and `format:check` scripts require explicit approval before replacement.

For pre-v10 migrations and their retries, retired tooling dependencies are removed from both `dependencies` and `devDependencies`, including `eslint-config-ssjs`, generated `eslint-plugin-prettier` and `prettier-plugin-sql`. Already-current projects do not undergo perpetual dependency retirement. The dependency-name array continues to include `sfmc-boilerplate`, using the existing version fallback when mcdev does not declare its version. Review the installed package and lockfile changes. mcdev's own contributor formatting policy is separate from the generated-project policy.

The generated ESLint configuration uses canonical SFMC presets for standalone and embedded server-side code, with scoped Unicorn recommended rules and SFMC compatibility overrides. Generic core/JSDoc/browser layers must not override SSJS parsing, globals or ES5 script semantics. Browser ESM rules cover real JavaScript files under `retrieve/` and `deploy/`, not extracted server blocks. Node ESM rules cover `.mcdev-validations.js`, recursive `lib/**/*.js` helpers and `eslint.config.js`.

Prettier with `prettier-plugin-sfmc` owns formatting. `eslint-config-prettier` runs last to disable conflicting lint rules; it does not execute Prettier. Review editor language associations and preserve custom settings when approving replacement: HTML stays HTML, standalone AMPscript uses `ampscript`, and SSJS uses `ssjs`.

## Migrate asset files separately

**v10 preparation, not a release announcement:** the local migration command and delta compatibility described below are implemented and locally verified on the development branch. v10 remains unreleased; local verification does not establish CI, minimum-runtime or release verification.

The email grouping changes from selector `asset-message`, directory `asset/message/` and suffix `.asset-message-meta.*` to `asset-email`, `asset/email/` and `.asset-email-meta.*`. This changes mcdev's grouping, not Salesforce's `assetType.name` or IDs: `templatebasedemail`, `htmlemail`, `textonlyemail` and base `message` (ID 5) remain the email members.

Run `mcdev upgrade` first when the project-version check requires it, then review and commit its changes. Upgrade refreshes `.mcdevrc.json` subtype selections to current defaults; review them and reapply intended custom scope. It does **not** move asset files. Update custom selectors, scripts, CI paths and type/path filters separately. Obsolete `asset-message`, `asset-cloudpage` and `asset-coderesource` selectors have no operational alias; broad historical groups can split across multiple current groups, so do not blindly replace strings. `asset-asset` remains valid for its current members.

### Option A: local command

Run `mcdev migrate cred/bu` from the project root with one exact configured credential/BU. Wildcards, omitted BUs and interactive BU selection are not supported. It only migrates that BU's `asset/` tree under `directories.retrieve`; deploy and template trees require the manual procedure below.

- Start on a named, committed Git branch with no unfinished merge, rebase, cherry-pick, revert, sequencer or bisect operation. The **whole repository** must be clean, including staged, unstaged, conflicted, untracked and submodule changes, even outside the selected BU. Otherwise: "Commit your work before running mcdev migrate."
- The command prints the repository, branch, BU, version groups and owner/file-move counts. Its interactive confirmation defaults to **No** and asks you to confirm that you do not need to switch branches first. Global `--yes` / `--skipInteraction` do not approve this prompt; unattended mutation is refused. Cancellation makes no changes; already-current assets are a no-op.
- It uses owning JSON `assetType.name` and `customerKey` and a migration-only wrapper around `Asset.getFilesToCommit()` to find companions. IDs are not required or added. Observed key spelling, nested component paths, bytes and modes are preserved; JSON is not rewritten.
- Existing destinations block the move even when identical or ignored by Git. Case-insensitive collisions, unsafe symlinks, missing committed sources, ambiguous ownership, incomplete layouts and unresolved encodings also block rather than guessing. Resolve and commit these issues before retrying. Branch, HEAD, cleanliness and source fingerprints are checked again after confirmation.
- Moves require filesystem hard-link support. Unsupported filesystems fail safely rather than using an overwrite-prone fallback. Ordinary failures trigger an in-memory rollback attempt; an incomplete rollback is reported for manual recovery. This is **not crash-atomic** across files: after interruption, inspect both paths against the clean committed baseline before restoring or retrying. Cleanup removes only empty source directories; review any cleanup warnings.
- After success, **review the diff and create a separate migration commit before `createDeltaPkg`, switching branches, or migrating another BU**. Commit after **each** BU: the first successful run makes the tree dirty and blocks the next run until committed.

The command does not authenticate, retrieve, call servers, update packages/configuration, fetch/pull, switch branches, stage, stash, reset or commit. Project-version prerequisites remain separate: run upgrade when instructed; if the project requires a newer mcdev version, install that version first.

### Option B: manual moves and renames

Manual migration is equally supported. Start from a clean committed snapshot, inventory each owning JSON and its extracted companions, and apply these mappings in each configured retrieve, deploy and template tree that you use:

- `templatebasedemail`, `htmlemail`, `textonlyemail`, `message`: `asset/message/` → `asset/email/`; `.asset-message-meta.*` → `.asset-email-meta.*`.
- `jsonmessage`: `asset/message/` **or older** `asset/asset/` → `asset/mobile/`; matching `.asset-message-meta.*` or `.asset-asset-meta.*` → `.asset-mobile-meta.*`. `jsonmessagetemplate` stays in `asset/template/` and is not migrated.
- `webpage`, `webtemplate`: `asset/asset/` → `asset/webstudio/`; `.asset-asset-meta.*` → `.asset-webstudio-meta.*`.
- `cloudpages`, `landingpage`, `microsite`, `interactivecontent`: `asset/cloudpage/` → `asset/webstudio/`; `.asset-cloudpage-meta.*` → `.asset-webstudio-meta.*`.
- `jscoderesource`, `csscoderesource`, `jsoncoderesource`, `rsscoderesource`, `textcoderesource`, `xmlcoderesource`: `asset/coderesource/` → `asset/webstudio/`; `.asset-coderesource-meta.*` → `.asset-webstudio-meta.*`.

Classify by the exact owning `assetType.name`, not the old folder alone. Move the owner and **all** nested HTML, text, extracted code and binary companions together; change only the subtype directory and exact metadata suffix. Preserve `customerKey`, API names/IDs, existing encoding, child-relative paths, bytes and modes. Leave non-migrating files alone. Resolve duplicate destinations manually without overwriting either copy; complete both directory and suffix changes before packaging.

Review the result with Git, verify content is unchanged and commit mechanical changes separately from real edits. Avoid formatting during these moves. `mcdev retrieve cred/bu -m asset` is a technically valid alternative for obtaining the new layout, but downloads **current server content**: it can introduce unexpected changes or replace pending local versions and does not preserve your Git snapshots. Review obsolete leftovers and collisions; retrieval is not a reconciliation guarantee. Prefer local moves for divergent promotion branches. If a BU was already refreshed, separate server-derived edits from mechanical moves and resolve duplicates first.

### Pending promotions and delta compatibility

A migration commit changes layout, not the pending promotion content. For branches `dev`, `sit`, `qa`, `uat`, `prod` that each contain all five same-named BUs, configured templating compares the **same source BU path across branches**, not a lower-BU folder against a higher-BU folder. Mapping selection uses the **exact supplied range string** in `options.deployment.branchSourceTargetMapping`, with `sourceTargetMapping` as fallback. On `uat`, bare `prod` resolves to `prod..HEAD`; a mapping from `cred/uat` to `cred/prod` compares `prod:retrieve/cred/uat/**` with `uat:retrieve/cred/uat/**`, then templates UAT source content for PROD. Do not interchange `prod` and `prod..HEAD` without checking mapping keys.

For monthly promotions in order `uat → prod`, `qa → uat`, `sit → qa`, `dev → sit`, the practical migration schedule is:

- Branch `prod`: migrate and commit `cred/prod`, then migrate and commit `cred/uat`.
- Branch `uat`: migrate and commit `cred/uat`, then migrate and commit `cred/qa`.
- Branch `qa`: migrate and commit `cred/qa`, then migrate and commit `cred/sit`.
- Branch `sit`: migrate and commit `cred/sit`, then migrate and commit `cred/dev`.
- Branch `dev`: migrate and commit `cred/dev`.

The PROD BU on `prod` is extra cleanup for its own v10 operations; UAT is the BU compared for the first promotion. Other BU trees remain old until explicitly migrated. Migrating every BU everywhere is optional, not required for these four comparisons. With explicit `--filter` copy mode instead of markets, migrate the actual filtered BU paths at both endpoints.

For **each** comparison, pause edits/promotions, record baseline refs, actual range strings and expected pending changes. Independently migrate each branch's own source-BU snapshot from a clean tree, reviewing and committing each BU before continuing. Never copy, merge or cherry-pick another branch's migration content to make the baselines match. Return to the lower/source branch, run the configured comparison and confirm the same logical pending changes before using the existing promotion workflow. Do not change the team's merge/ancestry policy; verify its real ranges and saved refs.

For example, a `cred/uat` asset may contain A on `prod` and B on `uat`; migration must leave A and B unchanged, so the pending A → B edit remains. The analogous source-BU comparisons retain B → C for `cred/qa` on `uat`/`qa`, C → D for `cred/sit` on `qa`/`sit`, and D → E for `cred/dev` on `sit`/`dev`. Branch-only additions remain additions and deletions remain deletions: migration never advances a version or recreates a deleted asset.

**Locally verified v10 Git-derived delta behavior (unreleased):** compare committed endpoint blobs and suppress only unambiguous, byte-identical documented layout moves, whether Git reports renames or delete/add pairs across one or several commits. Retain genuine edits, additions, deletions and meaningful mode changes. A removed extracted child selects the surviving owner rather than falsely deleting the asset; key changes and cross-BU moves are not migration equivalents. Ambiguity blocks actionable output rather than risking contradictory deploy/delete instructions.

Git-backed packaging remains worktree-based. The selected-input preflight requires every selected owner and companion (including missing/extra files, bytes and meaningful modes/types) to match the destination endpoint before copying, templating or output cleanup. Restore/check out the selected destination state if blocked; unrelated dirty files do not block packaging. The destination need not be `HEAD` if selected inputs match it. This is not arbitrary historical snapshot packaging, and templates still use current configuration/markets. Unlike packaging, the migration command itself requires the whole repository clean.

Verified Git-backed builds use only the verified selection: they do not re-retrieve metadata or expand dependencies/references beyond it, even when build options request those operations.

**Programmatic explicit lists:** a supplied `diffArr` array without an explicit filter remains a caller-managed list of unchanged records. It skips Git comparison, migration suppression, committed-endpoint preflight and verified manifests, retaining ordinary template discovery instead. The caller is responsible for correct BU/type/key scoping, actions and current source files. Mapping lookup uses the original range string (which need not be a valid Git ref for an explicit list), with `sourceTargetMapping` as fallback. Legacy asset JSON deletion handling remains; explicit lists do not gain the Git-derived surviving-owner safety for removed asset children. An empty array (`[]`) performs no cleanup and creates no output. An explicit filter ignores `diffArr` as before and uses Git-backed copy mode and its safeguards.

Uncommitted moves are not a completed comparison baseline. Separate migration commits are still inside ranges spanning them; the temporary compatibility adapter, not the commit label, neutralizes pure moves. Even migrated branch tips may have old merge bases or saved refs. Before retiring compatibility, check every still-supported promotion range and old merge base, then remove the adapter import/call, module, dedicated tests and temporary delta guidance; retain shared command mappings and permanent manual instructions. No retirement release is selected. See the [full wiki guide](https://github.com/Accenture/sfmc-devtools/wiki/03.a-~-Migrating-to-v10) for the same operational procedure.

## Validate your migrated project

Run `npm run lint` and `npm run format:check` first. Inspect diagnostics before choosing fixes; avoid a blanket autofix of retrieved assets. Review any deliberate formatting changes, especially mixed-language assets and comments. Repeat checks after resolving issues, and run your project's own build/deploy validation separately.
