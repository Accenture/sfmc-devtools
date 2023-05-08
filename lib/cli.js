#!/usr/bin/env node

/**
 * CLI entry for SFMC DevTools
 */

import { Util } from './util/util.js';

import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import Mcdev from './index.js';
yargs(hideBin(process.argv))
    .scriptName('mcdev')
    .usage('$0 <command> [options]')
    .command({
        command: 'retrieve [BU] [TYPE] [KEY]',
        aliases: ['r'],
        desc: 'retrieves metadata of a business unit',
        // @ts-ignore
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
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.retrieve(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY));
        },
    })
    .command({
        command: 'deploy [BU] [TYPE] [KEY] [--fromRetrieve] [--refresh]',
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
                .option('fromRetrieve', {
                    type: 'boolean',
                    describe: 'optionally deploy from retrieve folder',
                })
                .option('refresh', {
                    type: 'boolean',
                    describe:
                        'optional for asset-message: runs refresh command for related triggeredSends after deploy',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);

            Mcdev.deploy(argv.BU, csvToArray(argv.TYPE), csvToArray(argv.KEY), argv.fromRetrieve);
        },
    })
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
    .command({
        command: 'join',
        desc: `clones an existing project from git`,
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.joinProject();
        },
    })
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
    .command({
        command: 'delete <BU> <TYPE> <EXTERNALKEY>',
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
                    describe: 'metadata type to delete from; currently supported: dataExtension',
                })
                .positional('EXTERNALKEY', {
                    type: 'string',
                    describe: 'the key to delete',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.deleteByKey(argv.BU, argv.TYPE, argv.EXTERNALKEY);
        },
    })
    .command({
        command: 'retrieveAsTemplate <BU> <TYPE> <NAME> <MARKET>',
        aliases: ['rt'],
        desc: 'Retrieves a specific metadata file by name from the server for templating',
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
    })
    .command({
        command: 'buildTemplate <BU> <TYPE> <KEY> <MARKET>',
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
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.buildTemplate(argv.BU, argv.TYPE, csvToArray(argv.KEY), argv.MARKET);
        },
    })
    .command({
        command: 'buildDefinition <BU> <TYPE> <NAME> <MARKET>',
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
                .positional('NAME', {
                    type: 'string',
                    describe: 'name of the metadata component',
                })
                .positional('MARKET', {
                    type: 'string',
                    describe: 'the business unit to deploy to',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.buildDefinition(argv.BU, argv.TYPE, argv.NAME, argv.MARKET);
        },
    })
    .command({
        command: 'buildDefinitionBulk <LISTNAME> <TYPE> <NAME>',
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
                .positional('NAME', {
                    type: 'string',
                    describe: 'name of the metadata component',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.buildDefinitionBulk(argv.LISTNAME, argv.TYPE, argv.NAME);
        },
    })
    .command({
        command: 'selectTypes',
        aliases: ['st'],
        desc: 'lets you choose what metadata types to retrieve',
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.selectTypes();
        },
    })
    .command({
        command: 'explainTypes',
        aliases: ['et'],
        desc: 'explains metadata types that can be retrieved',
        builder: (yargs) => {
            yargs.option('json', {
                type: 'boolean',
                describe: 'optionaly return info in json format',
            });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.explainTypes();
        },
    })
    .command({
        command: 'createDeltaPkg [range] [--filter <BU>] [--commitHistory <number>]',
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
                    describe:
                        'Disable templating & instead filter by the specified BU path (comma separated), can include subtype, will be prefixed with "retrieve/"',
                })
                .option('commitHistory', {
                    type: 'number',
                    describe: 'Number of commits to look back for changes (supersedes config)',
                });
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.createDeltaPkg(argv);
        },
    })
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
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.getFilesToCommit(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        },
    })
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
        },
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.refresh(argv.BU, argv.TYPE, csvToArray(argv.KEY));
        },
    })
    .command({
        command: 'upgrade',
        aliases: ['up'],
        desc: 'Add NPM dependencies and IDE configuration files to your project',
        handler: (argv) => {
            Mcdev.setOptions(argv);
            Mcdev.upgrade(argv.skipInteraction);
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
    .option('skipInteraction', {
        alias: ['yes', 'y'],
        description: 'Interactive questions where possible and go with defaults instead',
    })
    .option('api', {
        description: 'Print API calls to log ',
        choices: ['log', 'cli'],
    })
    .demandCommand(1, 'Please enter a valid command')
    .strict()
    .recommendCommands()
    .wrap(yargs(hideBin(process.argv)).terminalWidth())
    .epilog(
        'Copyright 2023. Accenture. Get support at https://github.com/Accenture/sfmc-devtools/issues'
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
        ? csv.split(',').map((item) =>
              // allow whitespace in comma-separated lists
              item.trim()
          )
        : [csv.trim()];
}
