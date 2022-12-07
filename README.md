# Accenture SFMC DevTools

[![view on npm](https://badgen.net/github/release/Accenture/sfmc-devtools)](https://www.npmjs.org/package/mcdev)
[![view on npm](https://badgen.net/npm/node/mcdev)](https://www.npmjs.org/package/mcdev)
[![license](https://badgen.net/npm/license/mcdev)](https://www.npmjs.org/package/mcdev)
[![npm module downloads](https://badgen.net/npm/dt/mcdev)](https://www.npmjs.org/package/mcdev)
[![GitHub closed issues](https://badgen.net/github/closed-issues/Accenture/sfmc-devtools)](https://github.com/Accenture/sfmc-devtools/issues?q=is%3Aissue+is%3Aclosed)
[![GitHub releases](https://badgen.net/github/releases/Accenture/sfmc-devtools)](https://github.com/Accenture/sfmc-devtools/releases)

Accenture Salesforce Marketing Cloud DevTools (mcdev) is a rapid deployment/rollout, backup and development tool for Salesforce Marketing Cloud. It allows you to retrieve and deploy configuration and code across Business Units and instances.

## Quick start

### Install

Run the following to install Accenture SFMC DevTools on your computer:

```bash
npm install -g mcdev
```

### Include in your package

First, install it as dependency:

```bash
npm install mcdev --save
```

You can then include it in your code with:

```javascript
const mcdev = require('mcdev');
```

That will load `node_packages/mcdev/lib/index.js`. It can make sense to directly include other files if you have a special scenario. We've done that in our example for [retrieveChangelog.js](/Accenture/sfmc-devtools/blob/main/lib/retrieveChangelog.js) or in more detail, in our child-project [sfmc-devtools-copado](/Accenture/sfmc-devtools-copado) to get full control over certain aspects.

## Documentation

Please checkout the [GitHub wiki](/Accenture/sfmc-devtools/wiki) for the full documentation.

## Changelog

Find info on the latest releases with a detailed changelog in the [GitHub Releases tab](/Accenture/sfmc-devtools/releases).

## Contribute

If you want to enhance Accenture SFMC DevTools you are welcome to fork the repo and create a pull request. Please understand that we will have to conduct a code review before accepting your changes.

More details on how to best do that are described in our [wiki](/Accenture/sfmc-devtools/wiki/9.-Contribute).
