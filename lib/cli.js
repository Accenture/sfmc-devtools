#!/usr/bin/env node

/**
 * CLI entry for SFMC DevTools
 */

import { Util } from './util/util.js';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Mcdev from './index.js';

// use this instead of setting "true" directly to more easily find deprecated commands in this file
const isDeprecated = true;
/**
 * @typedef {import('../types/mcdev.d.js').TypeKeyCombo} TypeKeyCombo
 */
yargs(hideBin(process.argv))
    .scriptName('mcdev')
    .usage('$0 <command> [options]')
    .command(
        ['retrieve [BU] [TYPE] [KEY]', 'r'],
        'retrieves metadata of a business unit',
        (yargs) =>
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
                    array: true,
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
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.retrieve(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.retrieve(argv.BU, typeKeyCombo);
            }
        }
    )
    .command(
        ['deploy [BU] [TYPE] [KEY]', 'd'],
        'deploys local metadata to a business unit',
        (yargs) =>
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
                    array: true,
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
                .option('autoMidSuffix', {
                    type: 'boolean',
                    group: 'Options for deploy:',
                    describe:
                        'for asset: enables the automatic addition of the MID to the key of the deployed metadata when deploying cross-BU. Alternatively, use --keySuffix or templating-based suffixes',
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
                })
                .option('noUpdate', {
                    group: 'Options for deploy:',
                    describe:
                        'if set, no metadata will be updated, only new metadata will be created',
                })
                .option('publish', {
                    group: 'Options for deploy:',
                    describe: 'publishes the entity after deploy (only works on journeys)',
                })
                .option('skipStatusCheck', {
                    group: 'Options for deploy:',
                    describe:
                        'only relevant if used together with --publish. if you do not care if publishing actually worked you can skip the checks with this option.',
                }),
        (argv) => {
            Mcdev.setOptions(argv);

            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.deploy(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.deploy(argv.BU, typeKeyCombo);
            }
        }
    )
    .command(
        ['init [credentialsName]'],
        `creates '${Util.configFileName}' in your root or adds additional credentials to the existing one`,
        (yargs) =>
            yargs.positional('credentialsName', {
                type: 'string',
                describe: 'name of your installed package',
            }),
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.initProject(argv.credentialsName);
        }
    )
    .command(['join'], `clones an existing project from git`, {}, (argv) => {
        Mcdev.setOptions(argv);
        Mcdev.joinProject();
    })
    .command(
        ['reloadBUs [credentialsName]', 'rb', 'refreshBUs'],
        'loads the list of available BUs from the server and saves it to your config',
        (yargs) =>
            yargs.positional('credentialsName', {
                type: 'string',
                describe: 'name of your installed package',
            }),
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.findBUs(argv.credentialsName);
        }
    )
    .command(
        ['badKeys [BU]'],
        'lists metadata with random API names in specified Business Unit directory',
        (yargs) =>
            yargs.positional('BU', {
                type: 'string',
                describe: 'the business unit to deploy to',
            }),
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.badKeys(argv.BU);
        }
    )
    .command(
        ['document <BU> <TYPE>', 'doc'],
        'Creates Markdown or HTML documentation for the selected type',
        (yargs) =>
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
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.document(argv.BU, argv.TYPE);
        }
    )
    .command(
        ['delete <BU> [TYPE] [KEY]', 'del'],
        'deletes metadata of selected type and external key',
        (yargs) =>
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
                    array: true,
                    alias: 'm',
                    group: 'Options for delete:',
                    describe: 'type or type:key or type:i:id or type:n:name to delete',
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata, ['key', 'id']);
            if ('undefined' === typeof typeKeyCombo) {
                if (argv.TYPE && argv.KEY) {
                    Mcdev.deleteByKey(argv.BU, argv.TYPE, csvToArray(argv.KEY));
                }
            } else {
                Mcdev.deleteByKey(argv.BU, typeKeyCombo, null);
            }
        }
    )
    .command(
        ['resolveId <BU> <TYPE> <ID>', 'rid'],
        'resolves metadata key by ID',
        (yargs) =>
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
                }),
        // TODO: add option --metadata
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.resolveId(argv.BU, argv.TYPE, argv.ID);
        }
    )
    .command(
        ['retrieveAsTemplate <BU> <TYPE> <NAME> <MARKET>', 'rt'],
        '[DEPRECATED] Retrieves a specific metadata file by name from the server for templating',
        (yargs) =>
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
                }),

        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.retrieveAsTemplate(argv.BU, argv.TYPE, csvToArray(argv.NAME), argv.MARKET);
        },
        [],
        isDeprecated
    )
    .command(
        ['build'],
        'runs buildTemplate followed by buildDefinition',
        (yargs) =>
            yargs
                .option('metadata', {
                    type: 'string',
                    array: true,
                    alias: 'm',
                    group: 'Required parameters for build:',
                    describe: 'type:key combos to build template for',
                    demandOption: true,
                })
                .option('buFrom', {
                    type: 'string',
                    alias: 'bf',
                    group: 'Required parameters for build:',
                    describe:
                        'the business unit to create the templates from (in format "credential name/BU name")',
                    demandOption: true,
                })
                .option('buTo', {
                    type: 'string',
                    alias: 'bt',
                    group: 'Required parameters for build:',
                    describe: 'the business unit to deploy to; required unless --bulk is set',
                })
                .option('marketFrom', {
                    type: 'string',
                    alias: 'mf',
                    group: 'Required parameters for build:',
                    describe: 'market used for reverse building template',
                    demandOption: true,
                })
                .option('marketTo', {
                    type: 'string',
                    alias: 'mt',
                    group: 'Required parameters for build:',
                    describe: 'market used for building deployable definition',
                    demandOption: true,
                })
                .option('bulk', {
                    type: 'boolean',
                    group: 'Options for build:',
                    describe:
                        'if defined, the marketTo parameter has to be a marketList and buildDefinitionBulk is executed',
                })
                .option('dependencies', {
                    type: 'boolean',
                    alias: 'D',
                    group: 'Options for build:',
                    describe: 'create templates for all dependencies of the metadata component',
                })
                .option('retrieve', {
                    type: 'boolean',
                    alias: 'r',
                    group: 'Options for build:',
                    describe:
                        're-retrieves potentially relevant metadata before running buildTemplate (all if --dependencies is used)',
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' !== typeof typeKeyCombo) {
                Mcdev.build(
                    argv.buFrom,
                    argv.buTo,
                    typeKeyCombo,
                    argv.marketFrom,
                    argv.marketTo,
                    argv.bulk
                );
            }
        }
    )
    .command(
        ['buildTemplate <BU> [TYPE] [KEY] [MARKET]', 'bt'],
        'builds a template out of a specific metadata file already in your retrieve folder',
        (yargs) =>
            yargs
                .positional('BU', {
                    type: 'string',
                    describe:
                        'the business unit to create the templates from (in format "credential name/BU name")',
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
                    array: true,
                    alias: 'm',
                    group: 'Options for buildTemplate:',
                    describe: 'type:key combos to build template for',
                })
                .option('market', {
                    type: 'string',
                    group: 'Options for buildTemplate:',
                    describe: 'market used for reverse building template',
                })
                .option('dependencies', {
                    type: 'boolean',
                    alias: 'D',
                    group: 'Options for buildTemplate:',
                    describe: 'create templates for all dependencies of the metadata component',
                })
                .option('retrieve', {
                    type: 'boolean',
                    alias: 'r',
                    group: 'Options for buildTemplate:',
                    describe:
                        're-retrieves potentially relevant metadata before building (all if --dependencies is used)',
                })
                .check((argv) => {
                    if (!argv.MARKET && !argv.market) {
                        throw new Error(
                            'Error: You need to provide a market for reverse building the template'
                        );
                    }
                    return true;
                }),
        (argv) => {
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
        }
    )
    .command(
        ['buildDefinition <BU> [TYPE] [FILENAME] [MARKET]', 'bd'],
        'builds metadata definition based on template',
        (yargs) =>
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
                    array: true,
                    alias: 'm',
                    group: 'Options for buildDefinition:',
                    describe: 'type:templateName combos to build template for',
                })
                .option('market', {
                    type: 'string',
                    group: 'Options for buildDefinition:',
                    describe: 'market used for building deployable definition',
                })
                .check((argv) => {
                    if (!argv.MARKET && !argv.market) {
                        throw new Error(
                            'Error: You need to provide a market for reverse building the template'
                        );
                    }
                    return true;
                }),
        (argv) => {
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
        }
    )
    .command(
        ['buildDefinitionBulk <LISTNAME> [TYPE] [FILENAME]', 'bdb'],
        'builds metadata definition based on template en bulk',
        (yargs) =>
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
                })
                .option('metadata', {
                    type: 'string',
                    array: true,
                    alias: 'm',
                    group: 'Options for buildDefinitionBulk:',
                    describe: 'type:templateName combos to build template for',
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.buildDefinitionBulk(argv.LISTNAME, argv.TYPE, csvToArray(argv.FILENAME));
            } else {
                Mcdev.buildDefinitionBulk(argv.LISTNAME, typeKeyCombo);
            }
        }
    )
    .command(
        ['selectTypes', 'st'],
        'lets you choose what metadata types to retrieve',
        {},
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.selectTypes();
        }
    )
    .command(
        ['explainTypes', 'et'],
        'explains metadata types that can be retrieved',
        (yargs) =>
            yargs.option('json', {
                type: 'boolean',
                group: 'Options for explainTypes:',
                describe: 'optionaly return info in json format',
            }),
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.explainTypes();
        }
    )
    .command(
        ['createDeltaPkg [range]', 'cdp'],
        'Copies commit-based file delta into deploy folder',
        (yargs) =>
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
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.createDeltaPkg(argv);
        }
    )
    .command(
        ['getFilesToCommit <BU> <TYPE> <KEY>', 'fc'],
        'returns a list of relative paths to files one needs to include in a commit',
        (yargs) =>
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
                }),
        // TODO: add option --metadata
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.getFilesToCommit(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        }
    )
    .command(
        ['refresh <BU> [TYPE] [KEY]', 're'],
        'ensures that updates are properly published',
        (yargs) =>
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
                }),
        // TODO: add option --metadata
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.refresh(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        }
    )
    .command(
        ['execute <BU> <TYPE> [KEY]', 'exec', 'start'],
        'executes the entity (query/journey/automation etc.)',
        (yargs) =>
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
                .option('metadata', {
                    type: 'string',
                    array: true,
                    alias: 'm',
                    group: 'Options for execute:',
                    describe: 'type or type:key or type:i:id or type:n:name to fix',
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
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.execute(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.execute(argv.BU, typeKeyCombo);
            }
        }
    )
    .command(
        ['publish <BU> [TYPE] [KEY]'],
        'publishes the entity',
        (yargs) =>
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
                .option('metadata', {
                    type: 'string',
                    array: true,
                    alias: 'm',
                    group: 'Options for publish:',
                    describe: 'type or type:key or type:i:id or type:n:name to fix',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for publish:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                })
                .option('skipStatusCheck', {
                    group: 'Options for publish:',
                    describe:
                        'if you don not care if publishing actually worked you can skip the checks',
                }),

        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.publish(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.publish(argv.BU, typeKeyCombo);
            }
        }
    )
    .command(
        ['schedule <BU> <TYPE> [KEY]', 'sched'],
        'starts the predefined schedule of the item (shortcut for running execute --schedule)',
        (yargs) =>
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
                .option('metadata', {
                    type: 'string',
                    array: true,
                    alias: 'm',
                    group: 'Options for schedule:',
                    describe: 'type or type:key or type:i:id or type:n:name to fix',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for schedule:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.schedule(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.schedule(argv.BU, typeKeyCombo);
            }
        }
    )
    .command(
        ['pause <BU> <TYPE> [KEY]', 'p', 'stop'],
        'pauses the entity (automation etc.)',
        (yargs) =>
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
                .option('metadata', {
                    type: 'string',
                    array: true,
                    alias: 'm',
                    group: 'Options for pause:',
                    describe: 'type or type:key or type:i:id or type:n:name to fix',
                })
                .option('like', {
                    type: 'string',
                    group: 'Options for pause:',
                    describe:
                        'filter metadata components (can include % as wildcard or _ for a single character)',
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.pause(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.pause(argv.BU, typeKeyCombo);
            }
        }
    )
    .command(
        ['fixKeys <BU> [TYPE] [KEY]', 'fx'],
        'changes the key of the items to match the name',
        (yargs) =>
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
                    array: true,
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
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            if ('undefined' === typeof typeKeyCombo) {
                Mcdev.fixKeys(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
            } else {
                Mcdev.fixKeys(argv.BU, typeKeyCombo);
            }
        }
    )
    .command(
        ['replaceContentBlock', 'rcb'],
        'Replaces ContentBlockById, ContentBlockByKey or ContentBlockByName functions with each other in AMPscript',
        (yargs) =>
            yargs
                .option('bu', {
                    type: 'string',
                    group: 'Required parameters for replaceContentBlock:',
                    describe:
                        'the business unit on which to perform the operation (in format "credential name/BU name")',
                    demandOption: true,
                })
                .option('to', {
                    type: 'string',
                    alias: 't',
                    choices: ['key', 'name', 'id'],
                    group: 'Required parameters for replaceContentBlock:',
                    describe: 'what ampscript function to replace it with (key, name, id)',
                    demandOption: true,
                })
                .option('metadata', {
                    type: 'string',
                    array: true,
                    alias: 'm',
                    group: 'Optional parameters for replaceContentBlock:',
                    describe: 'type or type:key or type:i:id or type:n:name to fix',
                })
                .option('from', {
                    type: 'string',
                    alias: 'f',
                    choices: ['key', 'name', 'id'],
                    array: true,
                    group: 'Optional parameters for replaceContentBlock:',
                    describe:
                        'what ampscript function to search for (key, name, id); automatically set to values not used by --to if not provided',
                })
                .option('skipRetrieve', {
                    type: 'boolean',
                    alias: 'sr',
                    group: 'Optional parameters for replaceContentBlock:',
                    describe:
                        'if you have already just downloaded the metadata and want to skip the retrieve step',
                })
                .option('skipDeploy', {
                    type: 'boolean',
                    group: 'Optional parameters for replaceContentBlock:',
                    describe:
                        'if you have want to carefully examine the changed files in your retrieve folder you can run this dry-run mode which skips the deploy step at the end',
                })
                .option('refresh', {
                    type: 'boolean',
                    alias: 'r',
                    group: 'Optional parameters for replaceContentBlock:',
                    describe:
                        'for asset-message: runs refresh command for related triggeredSends after deploy',
                })
                .check((argv) => {
                    if (argv.from) {
                        for (const from of argv.from) {
                            if (from == argv.to) {
                                throw new Error('Error: --from and --to cannot be the same');
                            }
                        }
                    }
                    return true;
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            const typeKeyCombo = Mcdev.metadataToTypeKey(argv.metadata);
            Mcdev.replaceCbReference(argv.bu, typeKeyCombo, argv.to, argv.from);
        }
    )
    .command(
        ['describeSoap <TYPE>', 'describe', 'soap'],
        'Contributor help: describes SOAP API objects and fields',
        (yargs) =>
            yargs
                .positional('TYPE', {
                    type: 'string',
                    describe: 'Soap object name',
                })
                .option('bu', {
                    type: 'string',
                    group: 'Optional parameters for describeSoap:',
                    describe: 'defaults to _ParentBU_ but if you',
                })
                .option('json', {
                    type: 'boolean',
                    group: 'Options for describeSoap:',
                    describe: 'optionaly return info in json format',
                }),
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.describeSoap(argv.TYPE, argv.bu);
        }
    )
    .command(
        ['upgrade', 'up'],
        'Add NPM dependencies and IDE configuration files to your project',
        {},
        (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.upgrade();
        }
    )
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
