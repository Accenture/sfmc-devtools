#!/usr/bin/env node

/**
 * CLI entry for SFMC DevTools
 */

import { Util } from './util/util.js';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Mcdev from './index.js';

/**
 * @typedef {import('../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */
yargs(hideBin(process.argv))
    .scriptName('mcdev')
    .usage('$0 <command> [options]')
    // @ts-expect-error
    .command({
        command: 'retrieve [BU] [TYPE] [KEY]',
        aliases: ['r'],
        desc: 'retrieves metadata of a business unit',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to retrieve from (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type that shall be exclusively downloaded',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'metadata keys that shall be exclusively downloaded',
                })
                .option('metadata', {
                    type: 'string',
                    alias: 'm',
                    group: 'Options for retrieve:',
                    describe:
                        'type or type:key or type:i:id or type:n:name to retrieve; if not provided, all metadata will be retrieved',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for retrieve:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.retrieve(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.retrieve(argv.BU, typeKeyCombo);
            }
        },
    })
    // @ts-expect-error
    .command({
        command: 'deploy [BU] [TYPE] [KEY]',
        aliases: ['d'],
        desc: 'deploys local metadata to a business unit',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to deploy to (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type that shall be exclusively uploaded',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'metadata key that shall be exclusively uploaded',
                })
                .option('metadata', {
                    type: 'string',
                    alias: 'm',
                    group: 'Options for deploy:',
                    describe:
                        'type or type:key or type:i:id or type:n:name to deploy; if not provided, all metadata will be deploy',
                })
                .option('keySuffix', {
                    type: 'string',
                    alias: 'ks',
                    group: 'Options for deploy:',
                    describe:
                        'allows you to add a suffix to the key of the metadata to be deployed',
                })
                .option('noMidSuffix', {
                    type: 'boolean',
                    group: 'Options for deploy:',
                    describe:
                        'for asset: disables the automatic addition of the MID to the key of the deployed metadata when deploying cross-BU. Should be used with --keySuffix or with templating-based suffixes',
                })
                .option('changeKeyField', {
                    type: 'string',
                    alias: 'ckf',
                    group: 'Options for deploy:',
                    describe:
                        'enables updating the key of the deployed metadata with the value in provided field (e.g. c__newKey). Can be used to sync name and key fields.',
                })
                .option('changeKeyValue', {
                    type: 'string',
                    alias: 'ckv',
                    group: 'Options for deploy:',
                    describe:
                        'allows updating the key of the metadata to the provided value. Only available if a single type and key is deployed',
                })
                .option('fromRetrieve', {
                    type: 'boolean',
                    alias: 'fr',
                    group: 'Options for deploy:',
                    describe: 'deploy from retrieve folder',
                })
                .option('refresh', {
                    type: 'boolean',
                    alias: 'r',
                    group: 'Options for deploy:',
                    describe:
                        'for asset-message: runs refresh command for related triggeredSends after deploy',
                })
                .option('execute', {
                    type: 'boolean',
                    alias: 'e',
                    group: 'Options for deploy:',
                    describe: 'executes item after deploy; this will run the item once immediately',
                })
                .option('schedule', {
                    type: 'boolean',
                    alias: 's',
                    group: 'Options for deploy:',
                    describe:
                        'start existing schedule instead of running item once immediately (only works for automations)',
                })
                .option('fixShared', {
                    group: 'Options for deploy:',
                    describe:
                        "ensure that updates to shared DataExtensions become visible in child BU's data designer (SF Known issue W-11031095)",
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);

            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.deploy(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.deploy(argv.BU, typeKeyCombo);
            }
        },
    })
    // @ts-expect-error
    .command({
        command: 'init [credentialsName]',
        desc: `creates '${Util.configFileName}' in your root or adds additional credentials to the existing one`,
        builder: (yargs) => {
            yargs.positional('credentialsName', {
                type: 'string',
                describe: 'name of your installed package',
            });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.initProject(argv.credentialsName);
        },
    })
    // @ts-expect-error
    .command({
        command: 'join',
        desc: `clones an existing project from git`,
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.joinProject();
        },
    })
    // @ts-expect-error
    .command({
        command: 'reloadBUs [credentialsName]',
        aliases: ['rb'],
        desc: 'loads the list of available BUs from the server and saves it to your config',
        builder: (yargs) => {
            yargs.positional('credentialsName', {
                type: 'string',
                describe: 'name of your installed package',
            });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.findBUs(argv.credentialsName);
        },
    })
    // @ts-expect-error
    .command({
        command: 'badKeys [BU]',
        desc: 'lists metadata with random API names in specified Business Unit directory',
        builder: (yargs) => {
            yargs.positional('BU', {
                type: 'string',
                describe: 'the business unit to deploy to',
            });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.badKeys(argv.BU);
        },
    })
    // @ts-expect-error
    .command({
        command: 'document <BU> <TYPE>',
        aliases: ['doc'],
        desc: 'Creates Markdown or HTML documentation for the selected type',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to generate docs for (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe:
                        'metadata type to generate docs for; currently supported: dataExtension, role',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.document(argv.BU, argv.TYPE);
        },
    })
    // @ts-expect-error
    .command({
        command: 'delete <BU> [TYPE] [KEY]',
        aliases: ['del'],
        desc: 'deletes metadata of selected type and external key',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to delete from (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type to delete from;',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'the key to delete',
                })
                .option('metadata', {
                    type: 'string',
                    alias: 'm',
                    group: 'Options for retrieve:',
                    describe:
                        'type or type:key or type:i:id or type:n:name to retrieve; if not provided, all metadata will be retrieved',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata, ['key', 'id'], true);
            if ('undefined' === typeof typeKeyCombo) {
                if (argv.TYPE && argv.KEY) {
                    Mcdev.deleteByKey(argv.BU, argv.TYPE, argv.KEY);
                }
            } else {
                const type = Object.keys(typeKeyCombo)[0];
                Mcdev.deleteByKey(argv.BU, type, typeKeyCombo[type][0]);
            }
        },
    })
    // @ts-expect-error
    .command({
        command: 'resolveId <BU> <TYPE> <ID>',
        aliases: ['rid'],
        desc: 'resolves metadata key by ID',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to search in (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type to search in; currently supported: asset',
                })
                .positional('ID', {
                    type: 'string',
                    describe: 'the id to resolve',
                })
                .option('json', {
                    type: 'boolean',
                    group: 'Options for resolveId:',
                    describe: 'optionaly return info in json format',
                });
            // TODO: add option --metadata
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.resolveId(argv.BU, argv.TYPE, argv.ID);
        },
    })
    // @ts-expect-error
    .command({
        command: 'retrieveAsTemplate <BU> <TYPE> <NAME> <MARKET>',
        aliases: ['rt'],
        desc: '[DEPRECATED] Retrieves a specific metadata file by name from the server for templating',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to deploy to (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('NAME', {
                    type: 'string',
                    describe: 'name of the metadata component',
                })
                .positional('MARKET', {
                    type: 'string',
                    describe: 'market used for reverse building template',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.retrieveAsTemplate(argv.BU, argv.TYPE, csvToArray(argv.NAME), argv.MARKET);
        },
        deprecated: true,
    })
    // @ts-expect-error
    .command({
        command: 'buildTemplate <BU> [TYPE] [KEY] [MARKET]',
        aliases: ['bt'],
        desc: 'builds a template out of a specific metadata file already in your retrieve folder',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to deploy to (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'key(s) of the metadata component(s)',
                })
                .positional('MARKET', {
                    type: 'string',
                    describe: 'market used for reverse building template',
                })
                .option('metadata', {
                    type: 'string',
                    alias: 'm',
                    group: 'Options for buildTemplate:',
                    describe: 'type:key combos to build template for',
                })
                .option('market', {
                    type: 'string',
                    group: 'Options for buildTemplate:',
                    describe: 'market used for reverse building template',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.buildTemplate(
                    argv.BU,
                    argv.TYPE,
                    csvToArray(argv.KEY),
                    argv.MARKET || argv.market
                );
            } else {
                Mcdev.buildTemplate(argv.BU, typeKeyCombo, null, argv.MARKET || argv.market);
            }
        },
    })
    // @ts-expect-error
    .command({
        command: 'buildDefinition <BU> [TYPE] [FILENAME] [MARKET]',
        aliases: ['bd'],
        desc: 'builds metadata definition based on template',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe: 'the business unit to deploy to',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('FILENAME', {
                    type: 'string',
                    describe: 'File name of the metadata template without the extension',
                })
                .positional('MARKET', {
                    type: 'string',
                    describe: 'market used for building deployable definition',
                })
                .option('metadata', {
                    type: 'string',
                    alias: 'm',
                    group: 'Options for buildDefinition:',
                    describe: 'type:key combos to build template for',
                })
                .option('market', {
                    type: 'string',
                    group: 'Options for buildDefinition:',
                    describe: 'market used for building deployable definition',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.buildDefinition(
                    argv.BU,
                    argv.TYPE,
                    csvToArray(argv.FILENAME),
                    argv.MARKET || argv.market
                );
            } else {
                Mcdev.buildDefinition(argv.BU, typeKeyCombo, null, argv.MARKET || argv.market);
            }
            // Mcdev.buildDefinition(argv.BU, argv.TYPE, argv.FILENAME, argv.MARKET);
        },
    })
    // @ts-expect-error
    .command({
        command: 'buildDefinitionBulk <LISTNAME> <TYPE> <FILENAME>',
        aliases: ['bdb'],
        desc: 'builds metadata definition based on template en bulk',
        builder: (yargs) => {
            yargs
                .positional('LISTNAME', {
                    type: 'string',
                    describe: 'name of list of BU-market combos',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('FILENAME', {
                    type: 'string',
                    describe: 'File name of the metadata template without the extension',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.buildDefinitionBulk(argv.LISTNAME, argv.TYPE, csvToArray(argv.FILENAME));
        },
    })
    // @ts-expect-error
    .command({
        command: 'selectTypes',
        aliases: ['st'],
        desc: 'lets you choose what metadata types to retrieve',
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.selectTypes();
        },
    })
    // @ts-expect-error
    .command({
        command: 'explainTypes',
        aliases: ['et'],
        desc: 'explains metadata types that can be retrieved',
        builder: (yargs) => {
            yargs.option('json', {
                type: 'boolean',
                group: 'Options for explainTypes:',
                describe: 'optionaly return info in json format',
            });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.explainTypes();
        },
    })
    // @ts-expect-error
    .command({
        command: 'createDeltaPkg [range]',
        aliases: ['cdp'],
        desc: 'Copies commit-based file delta into deploy folder',
        builder: (yargs) => {
            yargs
                .positional('range', {
                    type: 'string',
                    describe: 'Pull Request target branch or git commit range',
                })
                .option('filter', {
                    type: 'string',
                    group: 'Options for createDeltaPkg:',
                    describe:
                        'Disable templating & instead filter by the specified BU path (comma separated), can include subtype, will be prefixed with "retrieve/"',
                })
                .option('commitHistory', {
                    type: 'number',
                    group: 'Options for createDeltaPkg:',
                    describe: 'Number of commits to look back for changes (supersedes config)',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            // @ts-expect-error - us passing in argv directly here is a bit lazy and ts warns us about it...
            Mcdev.createDeltaPkg(argv);
        },
    })
    // @ts-expect-error
    .command({
        command: 'getFilesToCommit <BU> <TYPE> <KEY>',
        aliases: ['fc'],
        desc: 'returns a list of relative paths to files one needs to include in a commit',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to deploy to (in format "credential name/BU name")',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'key(s) of the metadata component(s)',
                });
            // TODO: add option --metadata
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.getFilesToCommit(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        },
    })
    // @ts-expect-error
    .command({
        command: 'refresh <BU> [TYPE] [KEY]',
        aliases: ['re'],
        desc: 'ensures that updates are properly published',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe: 'the business unit to execute the refresh on',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'key(s) of the metadata component(s)',
                });
            // TODO: add option --metadata
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.refresh(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        },
    })
    // @ts-expect-error
    .command({
        command: 'execute <BU> <TYPE> [KEY]',
        aliases: ['exec', 'start'],
        desc: 'executes the entity (query/journey/automation etc.)',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe: 'the business unit where to start an item',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'key(s) of the metadata component(s)',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for execute:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                })
                .option('schedule', {
                    type: 'boolean',
                    group: 'Options for execute:',
                    describe:
                        'optionally start existing schedule instead of running item once immediately (only works for automations)',
                });
            // TODO: add option --metadata
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            // ! do not allow multiple types to be passed in here via csvToArray
            Mcdev.execute(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        },
    })
    // @ts-expect-error
    .command({
        command: 'schedule <BU> <TYPE> [KEY]',
        aliases: ['sched'],
        desc: 'starts the predefined schedule of the item (shortcut for running execute --schedule)',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe: 'the business unit where to start an item',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'key(s) of the metadata component(s)',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for execute:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                });
            // TODO: add option --metadata
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            // ! do not allow multiple types to be passed in here via csvToArray
            Mcdev.schedule(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        },
    })
    // @ts-expect-error
    .command({
        command: 'pause <BU> <TYPE> [KEY]',
        aliases: ['p', 'stop'],
        desc: 'pauses the entity (automation etc.)',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe: 'the business unit where to start an item',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'key(s) of the metadata component(s)',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for pause:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                });
            // TODO: add option --metadata
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            // ! do not allow multiple types to be passed in here via csvToArray
            Mcdev.pause(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        },
    })
    // @ts-expect-error
    .command({
        command: 'fixKeys <BU> [TYPE] [KEY]',
        aliases: ['fx'],
        desc: 'changes the key of the items to match the name',
        builder: (yargs) => {
            yargs
                .positional('BU', {
                    type: 'string',
                    describe: 'the business unit where to fix keys',
                })
                .positional('TYPE', {
                    type: 'string',
                    describe: 'metadata type',
                })
                .positional('KEY', {
                    type: 'string',
                    describe: 'key(s) of the metadata component(s)',
                })
                .option('metadata', {
                    type: 'string',
                    alias: 'm',
                    group: 'Options for fixKeys:',
                    describe: 'type or type:key or type:i:id or type:n:name to fix',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for fixKeys:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                })
                .option('keySuffix', {
                    type: 'string',
                    alias: 'ks',
                    group: 'Options for fixKeys:',
                    describe:
                        'allows you to add a suffix to the key of the metadata to be deployed.',
                })
                .option('execute', {
                    type: 'boolean',
                    alias: 'e',
                    group: 'Options for fixKeys:',
                    describe:
                        'optional: executes item after deploy; this will run the item once immediately',
                })
                .option('schedule', {
                    type: 'boolean',
                    alias: 's',
                    group: 'Options for fixKeys:',
                    describe:
                        'optionally start existing schedule instead of running item once immediately (only works for automations)',
                });
            // TODO: add option --metadata
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.fixKeys(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.fixKeys(argv.BU, typeKeyCombo);
            }
        },
    })
    // @ts-expect-error
    .command({
        command: 'upgrade',
        aliases: ['up'],
        desc: 'Add NPM dependencies and IDE configuration files to your project',
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.upgrade();
        },
    })
    .option('verbose', {
        type: 'boolean',
        description: 'Run with verbose CLI output',
    })
    .option('debug', {
        type: 'boolean',
        description: 'Enable developer & edge-case features',
    })
    .option('silent', {
        type: 'boolean',
        description: 'Only output errors to CLI',
    })
    .option('noLogColors', {
        type: 'boolean',
        description: 'do not use color codes in CLI log output',
    })
    .option('noLogFile', {
        type: 'boolean',
        description: 'Only output log to CLI but not to files',
    })
    .option('skipInteraction', {
        alias: ['yes', 'y'],
        description: 'Interactive questions where possible and go with defaults instead',
    })
    .option('api', {
        choices: ['log', 'cli'],
        description: 'Print API calls to log',
    })
    .option('errorLog', {
        type: 'boolean',
        description: 'Create a second log file that only contains error messages',
    })
    .demandCommand(1, 'Please enter a valid command')
    .strict()
    .recommendCommands()
    .wrap(yargs(hideBin(process.argv)).terminalWidth())
    .epilog(
        'Copyright 2024. Accenture. Get support at https://github.com/Accenture/sfmc-devtools/issues'
    )
    .help().argv;

/**
 * helper to convert CSVs into an array. if only one value was given, it's also returned as an array
 *
 * @param {string} csv potentially comma-separated value or null
 * @returns {string[]} values split into an array.
 */
function csvToArray(csv) {
    // eslint-disable-next-line unicorn/no-negated-condition
    return !csv
        ? null
        : csv.includes(',')
          ? csv
                .split(',')
                .map((item) =>
                    // allow whitespace in comma-separated lists
                    item.trim()
                )
                // make sure trailing commas are ignored
                .filter(Boolean)
          : [csv.trim()].filter(Boolean);
}
