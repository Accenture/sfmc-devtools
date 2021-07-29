# Changelog

Accenture SFMC DevTools follows [semantic versioning](https://semver.org/).

---

## 3.0.2 - 2021-07-29

**Bugfixes:**

- [#26](https://github.com/Accenture/sfmc-devtools/issues/26) retrieving asset subtypes via r ... asset-xyz actually saves result to disk
- [#45](https://github.com/Accenture/sfmc-devtools/issues/45) connection errors for automations fixed
- [#46](https://github.com/Accenture/sfmc-devtools/issues/46) (temp fix) campaigns break entire retrieve - disabled for now
- [#48](https://github.com/Accenture/sfmc-devtools/issues/48) connection errors for dataExtensions and other types are now handled gracefully
- [#49](https://github.com/Accenture/sfmc-devtools/issues/49) connection errors for asset subtypes no longer restart downloading all subtypes
- [#51](https://github.com/Accenture/sfmc-devtools/issues/51) retrieving asset subtypes now always uses the default list of subtypes

---

## 3.0.1 - 2021-04-11

**Bugfixes:**

- fix [#4](https://github.com/Accenture/sfmc-devtools/issues/4): retrieveAsTemplate led to fatal error if target metadata was not found
- migration from prior internal version was not handled gracefully before

---

## 3.0.0 - 2021-03-26

Initial public release.

---

## 2.0.0 - 2020-02-03

Initial Accenture-wide release.
