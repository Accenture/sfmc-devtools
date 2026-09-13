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

Replace old CI invocations of `eslint-check` with `lint`, and run `format:check` separately. Only exact legacy boilerplate commands are retired: `build: sfmc-build all`, `build-cp: sfmc-build cloudPages`, `build-email: sfmc-build emails` and `eslint-check: eslint`. Custom or chained build commands are preserved. Collisions with the managed `lint`, `lint:fix`, `format` and `format:check` scripts require explicit approval before replacement.

For pre-v10 migrations and their retries, retired tooling dependencies are removed from both `dependencies` and `devDependencies`, including `eslint-config-ssjs`, generated `eslint-plugin-prettier` and `prettier-plugin-sql`. Already-current projects do not undergo perpetual dependency retirement. The dependency-name array continues to include `sfmc-boilerplate`, using the existing version fallback when mcdev does not declare its version. Review the installed package and lockfile changes. mcdev's own contributor formatting policy is separate from the generated-project policy.

The generated ESLint configuration uses canonical SFMC presets for standalone and embedded server-side code, with scoped Unicorn recommended rules and SFMC compatibility overrides. Generic core/JSDoc/browser layers must not override SSJS parsing, globals or ES5 script semantics. Browser ESM rules cover real JavaScript files under `retrieve/` and `deploy/`, not extracted server blocks. Node ESM rules cover `.mcdev-validations.js`, recursive `lib/**/*.js` helpers and `eslint.config.js`.

Prettier with `prettier-plugin-sfmc` owns formatting. `eslint-config-prettier` runs last to disable conflicting lint rules; it does not execute Prettier. Review editor language associations and preserve custom settings when approving replacement: HTML stays HTML, standalone AMPscript uses `ampscript`, and SSJS uses `ssjs`.

## Validate your migrated project

Run `npm run lint` and `npm run format:check` first. Inspect diagnostics before choosing fixes; avoid a blanket autofix of retrieved assets. Review any deliberate formatting changes, especially mixed-language assets and comments. Repeat checks after resolving issues, and run your project's own build/deploy validation separately.

## Migrate asset groupings

Historical asset group folders are renamed in v10. Run `mcdev migrate <cred/bu>` to move the selected Business Unit's existing retrieve tree into the current layout:

| Historical group | Asset types | Current group |
|---|---|---|
| `message` | `templatebasedemail`, `htmlemail`, `textonlyemail`, `message` | `email` |
| `message`, `asset` | `jsonmessage` | `mobile` |
| `asset` | `webpage`, `webtemplate` | `webstudio` |
| `cloudpage` | `cloudpages`, `landingpage`, `microsite`, `interactivecontent` | `webstudio` |
| `coderesource` | `jscoderesource`, `csscoderesource`, `jsoncoderesource`, `rsscoderesource`, `textcoderesource`, `xmlcoderesource` | `webstudio` |

`jsonmessagetemplate` keeps the `template` group. The destination group is resolved from each asset's owner JSON, so a historical group that holds several asset types is split correctly.

Example: `mcdev migrate MyProject/DEV`.

Only the retrieve tree of the single selected credential/Business Unit is touched. Deploy and template trees are not migrated and no server call is made. Moves are conflict-safe: if any destination path already exists, the whole asset is left in place and reported instead of being moved partially. Resolve the reported conflicts and re-run, then review and commit the moved files before migrating another Business Unit.

`createDeltaPkg` ignores byte-identical regrouping moves, so a path change without an edit produces neither an addition nor a deletion. An asset that was moved and edited stays actionable as a change in its new location instead of appearing as a logical deletion in the old one.
