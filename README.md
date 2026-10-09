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

Starting with v10, mcdev requires Node.js `^22.22.2 || >=24.15.0`: Node 22.22.2 or newer within Node 22, or Node 24.15.0 and newer. Node 20, 21, 23 and earlier patches of Node 22/24 are unsupported. Update terminal, CI/container and editor ESLint runtimes before migrating.

See [Migrating to v10](https://github.com/Accenture/sfmc-devtools/wiki/03.a-~-Migrating-to-v10) for tooling changes, file-replacement behavior, script migration and asset regrouping.

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

That will load `node_modules/mcdev/lib/index.js`. It can make sense to directly include other files if you have a special scenario. We've done that in our example for [retrieveChangelog.js](https://github.com/Accenture/sfmc-devtools/blob/main/lib/retrieveChangelog.js) or in more detail, in our child-project [sfmc-devtools-copado](https://github.com/Accenture/sfmc-devtools-copado) to get full control over certain aspects.

## Documentation

Please checkout the [GitHub wiki](https://github.com/Accenture/sfmc-devtools/wiki) for the full documentation.

Content block refresh discovery verifies literal first arguments in `ContentBlockByKey`, `ContentBlockById`, and `ContentBlockByName`, including nested asset content, either quote style, whitespace, and optional arguments. Name references must use the full Content Builder folder path with backslash separators (escaped backslashes in SSJS), not just the block name. Dynamic first arguments, such as variables, concatenation, or function calls, are not evaluated and cannot be discovered this way.

Asset refresh requires an explicit array of asset keys. Direct `Asset.refresh()` calls with omitted or `null` keys reject before caching; an empty array returns `[]` without requests. No matching emails, no legacy email IDs, or no valid matching triggered sends also return `[]`, without refreshing unrelated sends. Discovery and refresh exceptions propagate to the existing refresh/deploy failure handler; failed individual triggered sends retain their error signal and are omitted from the returned refreshed-key list. With `deploy --refresh`, refresh runs only when assets were updated: a refresh failure marks the deployment as failed, but does not roll back assets already deployed.

### Editable SMS and push assets

For Content Builder `jsonmessage` assets, `asset-mobile` extracts SMS message text and push title/message text from `views.<channel>.meta.options.customBlockData` into `.amp` files. Each asset uses an `asset/mobile/<customerKey>/` directory, with field-named files beside its JSON. Colons in field names are encoded as `%3A` for Windows-safe filenames. These files participate in templating, content-block reference replacement, dependency discovery, and Git file discovery like other extracted asset code.

Edit the `.amp` files rather than `views.sms.content` or `views.push.content`: those HTML strings are generated GUI previews. Their original layout, styling, and media are retained. Preview text slots that exactly match the HTML-escaped source are replaced by field-specific, non-Mustache tokens during retrieval and restored from the final source during predeployment. Tokens survive Mustache-based templating; stale or unmatched preview text stays unchanged, and absent previews are not generated. Equal `:display` companion values are extracted only once and restored from the edited source during reassembly. Different companion values remain in JSON without being overwritten and are checked independently for content-block references. Local duplicate/preview bookkeeping is removed before deployment; missing extracted source files cause an error rather than deploying incomplete content. Existing JSON-only assets remain readable. WhatsApp assets are not extracted by this implementation.

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

Copyright (c) 2020-2026 Accenture. [MIT licensed](https://github.com/Accenture/sfmc-devtools/blob/main/LICENSE).
