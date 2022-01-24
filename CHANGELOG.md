# Changelog

Accenture SFMC DevTools follows [semantic versioning](https://semver.org/).

---

## [3.1.1](https://github.com/Accenture/sfmc-devtools/compare/v3.1.0...v3.1.1) - 2022-01-10

**Bugfixes:**

- [#160](https://github.com/Accenture/sfmc-devtools/issues/160) mcdev outputs bogus text since dependency colorjs got corrupted ( [background story](https://www.theverge.com/2022/1/9/22874949/developer-corrupts-open-source-libraries-projects-affected))

**Chores:**

- bumped cli-progress to 3.10.0 (removes colors dependency)
- bumped winston to 3.3.4 (removes colors dependency)

---

## [3.1.0](https://github.com/Accenture/sfmc-devtools/compare/v3.0.3...v3.1.0) - 2021-12-27

**Features:**

- [#55](https://github.com/Accenture/sfmc-devtools/issues/55) added user / roles documentation
- [#64](https://github.com/Accenture/sfmc-devtools/issues/64) Added `accountUser` (system users) support (retrieve)
- [#103](https://github.com/Accenture/sfmc-devtools/issues/103) Add rename `dataExtensionField` option (via Name_new)
- [#130](https://github.com/Accenture/sfmc-devtools/issues/130) offer `retrieveChangelog` option to other node packages including mcdev (see [retrieveChangelog.js](/lib/retrieveChangelog.js) for a how-to)
- [#133](https://github.com/Accenture/sfmc-devtools/issues/133) `dataExtensionField` validation during DE update (see [README](README.md#722-addingupdating-fields-on-existing-data-extensions) for details)
- [#136](https://github.com/Accenture/sfmc-devtools/issues/136) enable including mcdev in other node packages (see [README](README.md#26-using-mcdev-in-other-node-packages) for a how-to)
- [#144](https://github.com/Accenture/sfmc-devtools/issues/144) added file type .ai to `asset` - thanks to @fbellgr

**Bugfixes:**

- [#112](https://github.com/Accenture/sfmc-devtools/issues/112) add (unknown) new type 783 to defintion of `importFile`
- [#117](https://github.com/Accenture/sfmc-devtools/issues/117) `queries` not deployable when target is `shared DE`
- [#118](https://github.com/Accenture/sfmc-devtools/issues/118) `automation` start not auto-retried during deploy
- [#119](https://github.com/Accenture/sfmc-devtools/issues/119) fixed `list` dependency for importFile
- [#122](https://github.com/Accenture/sfmc-devtools/issues/122) ECONNRESET on caching metadata during deploy
- [#128](https://github.com/Accenture/sfmc-devtools/issues/128) `dataExtension` json not equal for retrieve/deploy
- [#129](https://github.com/Accenture/sfmc-devtools/issues/129) `script` json not equal for retrieve/deploy
- [#140](https://github.com/Accenture/sfmc-devtools/issues/140) avoid issues when retrieving `dataExtensions` that do not have a folder ID (edge case) - thanks to @fbellgr
- [#144](https://github.com/Accenture/sfmc-devtools/issues/144) improved handling high volumes of `asset` - thanks to @fbellgr
- [#149](https://github.com/Accenture/sfmc-devtools/issues/149) handle errors on upsert of data extensions gracefully

**Chores:**

- [#5](https://github.com/Accenture/sfmc-devtools/issues/5) removed postinstall msg after npm 7 dropped support for that
- [#127](https://github.com/Accenture/sfmc-devtools/issues/127) bad message "info: updated automation: undefined"
- [#132](https://github.com/Accenture/sfmc-devtools/issues/132) `dataExtension.SendableSubscriberField.Name` now has a slightly more readable value
- [#137](https://github.com/Accenture/sfmc-devtools/issues/137) docs for installing a specific version were incorrect
- [#138](https://github.com/Accenture/sfmc-devtools/issues/138) make issues and pull requests clickable in gitfork
- change `mcdev document` to take the cred/BU first and then the type to align it with other commands
- improved error handling of `document role` command
- bumped cli-progress to 3.9.1
- bumped eslint to 8.4.1
- bumped eslint-plugin-mocha to 10.0.1
- bumped eslint-plugin-prettier to 4.0.0
- bumped fs-extra to 10.0.0
- bumped husky to 7.0.4
- bumped inquirer to 8.2.0
- bumped jsdoc-to-markdown to 7.1.0
- bumped lint-staged to 12.1.2
- bumped mocha to 9.1.3
- bumped mustache to 4.2.0
- bumped prettier to 2.5.1
- bumped semver to 7.3.5
- bumped simple-git to 2.48.0
- bumped yargs to 17.3.0
- [#146](https://github.com/Accenture/sfmc-devtools/issues/146) remove AccountUser retrieve as a default retrieve option

---

## [3.0.3](https://github.com/Accenture/sfmc-devtools/compare/v3.0.2...v3.0.3) - 2021-08-11

**Bugfixes:**

- [#100](https://github.com/Accenture/sfmc-devtools/issues/100) Handle ECONNRESET errors across various types (incl. Data Extensions)
- [#102](https://github.com/Accenture/sfmc-devtools/issues/102) block deployment attempt for synchronized Data Extensions with proper error message
- [#104](https://github.com/Accenture/sfmc-devtools/issues/104) block deployment of shared data extensions on child BUs (existing solution broke somewhere down the line)

**Chores:**

- [#107](https://github.com/Accenture/sfmc-devtools/issues/107) rewrite folder to use generic update/create to help with ECONNRESET issue
- [#108](https://github.com/Accenture/sfmc-devtools/issues/108) return full API error messages for create & update via SOAP
- [#110](https://github.com/Accenture/sfmc-devtools/issues/110) improve error message for missing dependencies
- bumped jsdoc-to-markdown to 7.0.1
- bumped eslint-plugin-mocha to 9.0.0
- bumped eslint-plugin-prettier to 3.4.0
- bumped eslint-config-prettier to 8.3.0
- bumped eslint to 7.32.0
- enhanced Pull Request Template with note on `npm run docs`

---

## [3.0.2](https://github.com/Accenture/sfmc-devtools/compare/v3.0.1...v3.0.2) - 2021-08-03

**Bugfixes:**

- [#26](https://github.com/Accenture/sfmc-devtools/issues/26) retrieving asset subtypes via r ... asset-xyz actually saves result to disk
- [#45](https://github.com/Accenture/sfmc-devtools/issues/45) connection errors for automations fixed
- [#46](https://github.com/Accenture/sfmc-devtools/issues/46) (temp fix) campaigns break entire retrieve - disabled for now
- [#48](https://github.com/Accenture/sfmc-devtools/issues/48) connection errors for dataExtensions and other types are now handled gracefully
- [#49](https://github.com/Accenture/sfmc-devtools/issues/49) connection errors for asset subtypes no longer restart downloading all subtypes
- [#51](https://github.com/Accenture/sfmc-devtools/issues/51) retrieving asset subtypes now always uses the default list of subtypes
- [#52](https://github.com/Accenture/sfmc-devtools/issues/52) no more endless retries in case of connection errors

---

## [3.0.1](https://github.com/Accenture/sfmc-devtools/compare/v3.0.0...v3.0.1) - 2021-04-11

**Bugfixes:**

- fix [#4](https://github.com/Accenture/sfmc-devtools/issues/4): retrieveAsTemplate led to fatal error if target metadata was not found
- migration from prior internal version was not handled gracefully before

---

## 3.0.0 - 2021-03-26

Initial public release.

---

## 2.0.0 - 2020-02-03

Initial Accenture-wide release.
