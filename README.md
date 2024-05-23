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

### VSCode Extension

We also provide a [VSCode extension](https://marketplace.visualstudio.com/items?itemName=Accenture-oss.sfmc-devtools-vscode) that integrates SFMC DevTools into your IDE. You can install it from the [VSCode Marketplace](https://marketplace.visualstudio.com/items?itemName=Accenture-oss.sfmc-devtools-vscode).

### Include in your package

First, install it as dependency:

```bash
npm install mcdev --save
```

You can then include it in your code with JavaScript/ES module imports:

```javascript
import mcdev from 'mcdev';
```

That will load `node_packages/mcdev/lib/index.js`. It can make sense to directly include other files if you have a special scenario. We've done that in our example for [retrieveChangelog.js](https://github.com/Accenture/sfmc-devtools/blob/main/lib/retrieveChangelog.js) or in more detail, in our child-project [sfmc-devtools-copado](https://github.com/Accenture/sfmc-devtools-copado) to get full control over certain aspects.

## Documentation

Please checkout the [GitHub wiki](https://github.com/Accenture/sfmc-devtools/wiki) for the full documentation.

## Changelog

Find info on the latest releases with a detailed changelog in the [GitHub Releases tab](https://github.com/Accenture/sfmc-devtools/releases).

## Contribute

If you want to enhance Accenture SFMC DevTools you are welcome to fork the repo and create a pull request. Please understand that we will have to conduct a code review before accepting your changes.

More details on how to best do that are described in our [wiki](https://github.com/Accenture/sfmc-devtools/wiki/10.-Contribute).

## Main Contacts

The people that lead this project:

<table><tbody><tr><td align="center" valign="top" width="11%">
<a href="https://www.linkedin.com/in/joernberkefeld/">
<img src="https://github.com/JoernBerkefeld.png" width="250" height="250"><br />
<b>Jörn Berkefeld</b>
</a><br>
<a href="https://github.com/JoernBerkefeld">GitHub profile</a>
</td><td align="center" valign="top" width="11%">
<a href="https://www.linkedin.com/in/douglasmidgley/">
<img src="https://github.com/DougMidgley.png" width="250" height="250"><br />
<b>Doug Midgley</b>
</a><br>
<a href="https://github.com/DougMidgley">GitHub profile</a>
</td></tr></tbody></table>

## Copyright

Copyright (c) 2020-2024 Accenture. [MIT licensed](https://github.com/Accenture/sfmc-devtools/blob/main/LICENSE).
