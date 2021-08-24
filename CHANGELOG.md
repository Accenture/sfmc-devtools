# Changelog

Accenture SFMC DevTools follows [semantic versioning](https://semver.org/).

---

## [3.1.0](https://github.com/Accenture/sfmc-devtools/compare/v3.0.3...v3.1.0) - 2021-??-??

**Features:**

- [#103](https://github.com/Accenture/sfmc-devtools/issues/103) Add rename Data Extension Field option (via Name_new)

**Bugfixes:**

- [#119](https://github.com/Accenture/sfmc-devtools/issues/119) fixed list dependency for importFile

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
