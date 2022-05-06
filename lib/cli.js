#!/usr/bin/env node
'use strict';

/**
 * CLI entry for SFMC DevTools
 */

const Util = require('./util/util');
const yargs = require('yargs');
const Mcdev = require('./index');

yargs
    .scriptName('mcdev')
    .usage('$0 <command> [options]')
    .command({
        command: 'retrieve [BU] [TYPE]',
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
                });
        },
        handler: (argv) => {
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.retrieve(argv.BU, argv.TYPE ? argv.TYPE.split(',') : null);
        },
    })
    .command({
        command: 'deploy [BU] [TYPE]',
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
                });
        },
        handler: (argv) => {
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.deploy(
                argv.BU,
                argv.TYPE ? argv.TYPE.split(',').map((item) => item.split('-')[0]) : null
            );
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.initProject(argv.credentialsName, argv.skipInteraction);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.retrieveAsTemplate(argv.BU, argv.TYPE, argv.NAME, argv.MARKET);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.buildTemplate(argv.BU, argv.TYPE, argv.KEY, argv.MARKET);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
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
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.buildDefinitionBulk(argv.LISTNAME, argv.TYPE, argv.NAME);
        },
    })
    .command({
        command: 'selectTypes',
        aliases: ['st'],
        desc: 'lets you choose what metadata types to retrieve',
        handler: (argv) => {
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.selectTypes();
        },
    })
    .command({
        command: 'explainTypes',
        aliases: ['et'],
        desc: 'explains metadata types that can be retrieved',
        handler: (argv) => {
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.explainTypes();
        },
    })
    .command({
        command: 'createDeltaPkg [range] [filter]',
        aliases: ['cdp'],
        desc: 'Copies commit-based file delta into deploy folder',
        builder: (yargs) => {
            yargs
                .positional('range', {
                    type: 'string',
                    describe: 'Pull Request target branch or git commit range',
                })
                .positional('filter', {
                    type: 'string',
                    describe:
                        'Disable templating & instead filter by the specified file path (comma separated)',
                });
        },
        handler: (argv) => {
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
            Mcdev.createDeltaPkg(argv);
        },
    })
    .command({
        command: 'upgrade',
        aliases: ['up'],
        desc: 'Add NPM dependencies and IDE configuration files to your project',
        handler: (argv) => {
            Mcdev.setSkipInteraction(!!argv.skipInteraction);
            Util.setLoggingLevel(argv);
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
    .demandCommand(1, 'Please enter a valid command')
    .strict()
    .recommendCommands()
    .wrap(yargs.terminalWidth())
    .epilog(
        'Copyright 2022. Accenture. Get support at https://github.com/Accenture/sfmc-devtools/issues'
    )
    .help().argv;
