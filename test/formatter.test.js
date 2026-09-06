import * as chai from 'chai';
const assert = chai.assert;
const expect = chai.expect;

import * as testUtils from './utils.js';
import '../lib/index.js';
import File from '../lib/util/file.js';
import config from '../lib/util/config.js';
import Init from '../lib/util/init.js';
import InitConfig from '../lib/util/init.config.js';
import InitNpm from '../lib/util/init.npm.js';
import TransactionalSMS from '../lib/metadataTypes/TransactionalSMS.js';
import { Util } from '../lib/util/util.js';

const DEFAULT_PROPERTIES = {
    options: {
        formatOnSave: true,
        formatErrorLog: false,
    },
};

describe('FORMATTER', () => {
    beforeEach(() => {
        testUtils.mockSetup();
        config.properties = structuredClone(DEFAULT_PROPERTIES);
    });

    afterEach(() => {
        testUtils.mockReset();
        config.properties = null;
    });

    it('maps every supported extension to the intended parser', () => {
        for (const filetype of ['amp', 'ampscript', 'html', 'htm', 'hbs']) {
            assert.equal(File._getPrettierParser(filetype), 'ampscript-parse');
        }
        assert.equal(File._getPrettierParser('ssjs'), 'babel');
        assert.equal(File._getPrettierParser('js'), 'babel');
        assert.equal(File._getPrettierParser('sql'), 'sql');
        assert.equal(File._getPrettierParser('jsonc'), 'jsonc');
        assert.equal(File._getPrettierParser('xml'), undefined);
        assert.equal(File._getPrettierParser('csv'), undefined);
        assert.equal(File._getPrettierParser('rss'), undefined);
        assert.equal(File._getPrettierParser('txt'), undefined);
        assert.equal(File._getPrettierParser('sass'), undefined);
        assert.equal(File._getPrettierParser('unknown'), undefined);
    });

    it('formats AMPscript, mixed HTML, Handlebars, SQL, and SSJS', async () => {
        const amp = (await TransactionalSMS.prepExtractedCode('%%[set @x=1]%%')).code;
        const html = await File._beautify_prettier(
            '',
            'html',
            'html',
            '<div>%%[set @x=1]%%<script runat="server">var x={a:1,b:2};</script></div>'
        );
        const hbs = await File._beautify_prettier('', 'hbs', 'hbs', '<div>{{  firstName  }}</div>');
        const sql = await File._beautify_prettier('', 'sql', 'sql', 'select a,b from t where a=1');
        const ssjs = await File._beautify_prettier('', 'ssjs', 'ssjs', 'var x={a:1,b:2};');

        assert.include(amp, 'set @x = 1');
        assert.include(html, '<script runat="server">');
        assert.include(html, 'var x = { a: 1, b: 2 };');
        assert.include(hbs, '{{firstName}}');
        assert.include(sql, 'SELECT');
        assert.include(sql, 'FROM');
        assert.include(sql, '    t');
        assert.include(ssjs, 'var x = { a: 1, b: 2 };\n');
    });

    it('passes through unsupported text formats without JavaScript formatting or error logs', async () => {
        config.properties.options.formatErrorLog = true;
        const examples = {
            xml: '<xml>test</xml>\n',
            csv: 'name,value\nalpha,1\n',
            rss: '<rss/>\n',
            txt: 'var value={nested:true};\n',
            sass: '.item\n    color: red\n',
        };

        for (const [filetype, source] of Object.entries(examples)) {
            assert.equal(
                await File._beautify_prettier('logs', `sample-${filetype}`, filetype, source),
                source
            );
            expect(await File.pathExists(`logs/sample-${filetype}.error.log`)).to.equal(false);
        }
    });

    it('formats JSONC while preserving comments', async () => {
        const source = '{// keep this comment\n"test":true}';
        assert.equal(
            await File._beautify_prettier('', 'settings', 'jsonc', source),
            '{\n    // keep this comment\n    "test": true\n}\n'
        );
    });

    it('uses filepath inference for unknown extensions without falling back to Babel', async () => {
        const javascript = 'var value={nested:true};';
        assert.equal(
            await File._beautify_prettier('', 'script', 'mjs', javascript),
            'var value = { nested: true };\n'
        );
        assert.equal(
            await File._beautify_prettier('', 'script', 'unknown', javascript),
            javascript
        );
    });

    it('honors canonical SQL and project SSJS options', async () => {
        await File.writeFile(
            '.prettierrc',
            JSON.stringify({
                plugins: ['prettier-plugin-sfmc'],
                singleQuote: false,
                sqlKeywordCase: 'lower',
            })
        );
        File.prettierConfigCache.clear();

        const sql = await File._beautify_prettier('', 'sql', 'sql', 'SELECT A FROM T');
        const ssjs = await File._beautify_prettier('', 'ssjs', 'ssjs', "var x='value';");

        assert.include(sql, 'select');
        assert.include(sql, 'from');
        assert.include(ssjs, 'var x = "value";');
    });

    it('preserves root-level and filetype parser overrides with mapped fallback', async () => {
        await File.writeFile('.prettierrc', JSON.stringify({ parser: 'json' }));
        File.prettierConfigCache.clear();
        assert.equal(await File._beautify_prettier('', 'root', 'amp', '{"a":1}'), '{ "a": 1 }\n');

        await File.writeFile(
            '.prettierrc',
            JSON.stringify({ overrides: [{ files: '*.sql', options: { parser: 'json' } }] })
        );
        File.prettierConfigCache.clear();
        assert.equal(
            await File._beautify_prettier('', 'override', 'sql', '{"b":2}'),
            '{ "b": 2 }\n'
        );

        await File.writeFile('.prettierrc', '{}');
        File.prettierConfigCache.clear();
        assert.include(
            await File._beautify_prettier('', 'fallback', 'amp', '%%[set @x=1]%%'),
            'set @x = 1'
        );
    });

    it('keeps parser-specific immutable configs isolated sequentially and concurrently', async () => {
        const sequential = [];
        for (const filetype of ['sql', 'ssjs', 'html', 'sql', 'html', 'ssjs']) {
            sequential.push(
                await File._beautify_prettier(
                    '',
                    filetype,
                    filetype,
                    {
                        sql: 'select a from t',
                        ssjs: 'var x={a:1};',
                        html: '<p>%%[set @x=1]%%</p>',
                    }[filetype]
                )
            );
        }
        const concurrent = await Promise.all([
            File._beautify_prettier('', 'sql2', 'sql', 'select b from t'),
            File._beautify_prettier('', 'ssjs2', 'ssjs', 'var y={b:2};'),
            File._beautify_prettier('', 'html2', 'html', '<p>%%[set @y=2]%%</p>'),
        ]);

        assert.include(sequential[0], 'SELECT');
        assert.include(sequential[1], 'var x = { a: 1 };');
        assert.include(sequential[2], 'set @x = 1');
        assert.include(concurrent[0], 'SELECT');
        assert.include(concurrent[1], 'var y = { b: 2 };');
        assert.include(concurrent[2], 'set @y = 2');
        assert.sameMembers([...File.prettierConfigCache.keys()], ['sql', 'ssjs', 'html']);
        for (const entry of File.prettierConfigCache.values()) {
            if (entry) {
                expect(Object.isFrozen(entry)).to.equal(true);
            }
        }
    });

    it('does not expose removed SFMC formatter APIs', () => {
        const removedLegacyMethod = ['beautify', 'beauty', 'Amp'].join('_').replace('_Amp', 'Amp');
        const removedReviewMethod = ['beautify', 'Sfmc'].join('');
        expect(File).not.to.have.property(removedLegacyMethod);
        expect(File).not.to.have.property(removedReviewMethod);
    });

    it('preserves malformed content and logs the effective local parser', async () => {
        config.properties.options.formatErrorLog = true;
        const source = 'var = ;';
        const result = await File._beautify_prettier('logs', 'broken', 'ssjs', source);
        const errorLog = await File.readFile('logs/broken.error.log', 'utf8');

        assert.equal(result, source);
        assert.include(errorLog, 'Parser: babel');
        assert.notInclude(errorLog, '\u001B');
    });

    it('formats TransactionalSMS AMPscript without prior explicit initialization', async () => {
        const source = 'line1\n%%[set @x=1]%%\nline2';
        const result = await TransactionalSMS.prepExtractedCode(source);
        assert.equal(result.fileExt, 'amp');
        assert.include(result.code, 'set @x = 1');
        assert.include(result.code, 'line1\n%%[');
    });

    it('preserves TransactionalSMS content when formatting is disabled or config is missing', async () => {
        const source = '%%[set @x=1]%%';
        Util.OPTIONS.format = false;
        assert.equal((await TransactionalSMS.prepExtractedCode(source)).code, source);

        delete Util.OPTIONS.format;
        await File.unlink('.prettierrc');
        File.prettierConfigCache.clear();
        assert.equal((await TransactionalSMS.prepExtractedCode(source)).code, source);
    });

    it('preserves malformed TransactionalSMS content when formatting fails', async () => {
        const source = '%%[ set @x = ]%%';
        await File.writeFile('.prettierrc', JSON.stringify({ parser: 'invalid-parser' }));
        File.prettierConfigCache.clear();

        const result = await TransactionalSMS.prepExtractedCode(source);
        assert.equal(result.fileExt, 'amp');
        assert.equal(result.code, source);
    });

    it('reports a failed IDE config upgrade without overwriting an existing backup', async () => {
        await File.writeFile('.beautyamp.json', '{}');
        await File.writeFile('.beautyamp.json.BAK', '{"existing":true}');

        expect(await InitConfig.createIdeConfigFiles('9.0.3')).to.equal(false);
        expect(await File.pathExists('.beautyamp.json')).to.equal(true);
        assert.equal(await File.readFile('.beautyamp.json.BAK', 'utf8'), '{"existing":true}');
    });

    it('aborts project upgrade before dependency installation when config migration fails', async () => {
        const checkPathForCloudOriginal = Init._checkPathForCloud;
        const createIdeConfigFilesOriginal = InitConfig.createIdeConfigFiles;
        const installDependenciesOriginal = InitNpm.installDependencies;
        let installAttempted = false;

        Init._checkPathForCloud = async () => true;
        InitConfig.createIdeConfigFiles = async () => false;
        InitNpm.installDependencies = async () => {
            installAttempted = true;
            return true;
        };

        try {
            const properties = /** @type {import('../types/mcdev.d.js').Mcdevrc} */ ({
                version: '9.0.3',
            });
            expect(await Init.upgradeProject(properties, true)).to.equal(false);
        } finally {
            Init._checkPathForCloud = checkPathForCloudOriginal;
            InitConfig.createIdeConfigFiles = createIdeConfigFilesOriginal;
            InitNpm.installDependencies = installDependenciesOriginal;
        }

        expect(installAttempted).to.equal(false);
    });

    it('aborts project upgrade when the intermediate migrated config cannot be saved', async () => {
        const properties = await File.readJSON(Util.configFileName);
        properties.version = '9.0.3';

        const checkPathForCloudOriginal = Init._checkPathForCloud;
        const saveConfigFileOriginal = File.saveConfigFile;
        const upgradeAuthFileOriginal = InitConfig.upgradeAuthFile;
        const createIdeConfigFilesOriginal = InitConfig.createIdeConfigFiles;
        const installDependenciesOriginal = InitNpm.installDependencies;
        let authUpgradeAttempted = false;
        let ideUpgradeAttempted = false;
        let dependencyInstallAttempted = false;

        Init._checkPathForCloud = async () => true;
        File.saveConfigFile = async () => false;
        InitConfig.upgradeAuthFile = async () => {
            authUpgradeAttempted = true;
            return true;
        };
        InitConfig.createIdeConfigFiles = async () => {
            ideUpgradeAttempted = true;
            return true;
        };
        InitNpm.installDependencies = async () => {
            dependencyInstallAttempted = true;
            return true;
        };

        try {
            expect(await Init.upgradeProject(properties, false)).to.equal(false);
        } finally {
            Init._checkPathForCloud = checkPathForCloudOriginal;
            File.saveConfigFile = saveConfigFileOriginal;
            InitConfig.upgradeAuthFile = upgradeAuthFileOriginal;
            InitConfig.createIdeConfigFiles = createIdeConfigFilesOriginal;
            InitNpm.installDependencies = installDependenciesOriginal;
        }

        expect(authUpgradeAttempted).to.equal(false);
        expect(ideUpgradeAttempted).to.equal(false);
        expect(dependencyInstallAttempted).to.equal(false);
    });

    it('keeps pre-10 version gating retry-safe after a dependency upgrade failure', async () => {
        const properties = await File.readJSON(Util.configFileName);
        properties.version = '9.0.3';
        await File.writeJSON(Util.configFileName, properties, { spaces: 2 });
        await File.writeFile('.beautyamp.json', '{}');
        await File.writeJSON(
            'package.json',
            {
                name: 'legacy-project',
                devDependencies: { 'prettier-plugin-sql': '0.18.1' },
            },
            { spaces: 2 }
        );

        const checkPathForCloudOriginal = Init._checkPathForCloud;
        const execSyncOriginal = Util.execSync;
        const dependencyVersions = [];
        let installAttempt = 0;
        Init._checkPathForCloud = async () => true;
        Util.execSync = (command, args) => {
            if (command === 'npm' && args[0] === 'uninstall') {
                const packageJson = File.readJSONSync('package.json');
                dependencyVersions.push(properties.version);
                delete packageJson.devDependencies['prettier-plugin-sql'];
                File.writeJSONSync('package.json', packageJson, { spaces: 2 });
                return '';
            }
            if (command === 'npm' && args[0] === 'install') {
                installAttempt++;
                return installAttempt === 1 ? null : '';
            }
            return '';
        };

        try {
            expect(await Init.upgradeProject(properties, false)).to.equal(false);
            assert.equal((await File.readJSON(Util.configFileName)).version, '9.0.3');
            expect(await File.pathExists('.beautyamp.json')).to.equal(false);
            expect(await File.pathExists('.beautyamp.json.BAK')).to.equal(true);
            expect((await File.readJSON('package.json')).devDependencies).not.to.have.property(
                'prettier-plugin-sql'
            );

            // retry directly from the failed state without restoring migrated files or dependencies
            expect(await Init.upgradeProject(properties, false)).to.equal(true);
        } finally {
            Init._checkPathForCloud = checkPathForCloudOriginal;
            Util.execSync = execSyncOriginal;
        }

        assert.deepEqual(dependencyVersions, ['9.0.3']);
        expect(await File.pathExists('.beautyamp.json')).to.equal(false);
        expect(await File.pathExists('.beautyamp.json.BAK')).to.equal(true);
        assert.equal(
            (await File.readJSON(Util.configFileName)).version,
            Util.packageJsonMcdev.version
        );
    });

    it('fails project upgrade when final version persistence cannot be written', async () => {
        const oldVersion = '9.0.3';
        const properties = await File.readJSON(Util.configFileName);
        properties.version = oldVersion;
        await File.writeJSON(Util.configFileName, properties, { spaces: 2 });

        const checkPathForCloudOriginal = Init._checkPathForCloud;
        const fixMcdevConfigOriginal = InitConfig.fixMcdevConfig;
        const upgradeAuthFileOriginal = InitConfig.upgradeAuthFile;
        const createIdeConfigFilesOriginal = InitConfig.createIdeConfigFiles;
        const installDependenciesOriginal = InitNpm.installDependencies;
        const writeJSONToFileOriginal = File.writeJSONToFile;
        const loggerInfoOriginal = Util.logger.info;
        const infoLogs = [];

        Init._checkPathForCloud = async () => true;
        InitConfig.fixMcdevConfig = async () => true;
        InitConfig.upgradeAuthFile = async () => true;
        InitConfig.createIdeConfigFiles = async () => true;
        InitNpm.installDependencies = async () => true;
        File.writeJSONToFile = async () => false;
        Util.logger.info = (message) => {
            infoLogs.push(message);
            return Util.logger;
        };

        try {
            expect(await Init.upgradeProject(properties, false)).to.equal(false);
        } finally {
            Init._checkPathForCloud = checkPathForCloudOriginal;
            InitConfig.fixMcdevConfig = fixMcdevConfigOriginal;
            InitConfig.upgradeAuthFile = upgradeAuthFileOriginal;
            InitConfig.createIdeConfigFiles = createIdeConfigFilesOriginal;
            InitNpm.installDependencies = installDependenciesOriginal;
            File.writeJSONToFile = writeJSONToFileOriginal;
            Util.logger.info = loggerInfoOriginal;
        }

        assert.equal(properties.version, oldVersion);
        assert.equal((await File.readJSON(Util.configFileName)).version, oldVersion);
        expect(infoLogs).not.to.include(
            `✔️  ${Util.configFileName} and ${Util.authFileName} saved successfully`
        );
    });

    it('removes the legacy SQL formatter only during the 10.0.0 dependency upgrade', async () => {
        const packageJson = {
            name: 'legacy-project',
            devDependencies: {
                'prettier-plugin-sql': '0.18.1',
                'prettier-plugin-sfmc': '2.0.0',
            },
        };
        await File.writeJSON('package.json', packageJson, { spaces: 2 });
        const execSyncOriginal = Util.execSync;
        const calls = [];
        Util.execSync = (command, args) => {
            calls.push([command, args]);
            if (args[0] === 'uninstall') {
                delete packageJson.devDependencies['prettier-plugin-sql'];
                File.writeJSONSync('package.json', packageJson, { spaces: 2 });
            }
            return '';
        };

        try {
            expect(await InitNpm.installDependencies(undefined, '9.0.3')).to.equal(true);
        } finally {
            Util.execSync = execSyncOriginal;
        }

        const updatedPackageJson = await File.readJSON('package.json');
        expect(updatedPackageJson.devDependencies).not.to.have.property('prettier-plugin-sql');
        expect(updatedPackageJson.devDependencies).to.have.property(
            'prettier-plugin-sfmc',
            '2.0.0'
        );
        assert.deepInclude(calls, ['npm', ['uninstall', '--save-dev', 'prettier-plugin-sql']]);
    });

    it('fails dependency upgrade when install fails after removing the legacy SQL formatter', async () => {
        const packageJson = {
            name: 'legacy-project',
            devDependencies: {
                'prettier-plugin-sql': '0.18.1',
            },
        };
        await File.writeJSON('package.json', packageJson, { spaces: 2 });
        const execSyncOriginal = Util.execSync;
        const loggerInfoOriginal = Util.logger.info;
        const loggerErrorOriginal = Util.logger.error;
        const calls = [];
        const infoLogs = [];
        const errorLogs = [];
        Util.execSync = (command, args, hideOutput) => {
            calls.push([command, args, hideOutput]);
            if (args[0] === 'uninstall') {
                delete packageJson.devDependencies['prettier-plugin-sql'];
                File.writeJSONSync('package.json', packageJson, { spaces: 2 });
                return '';
            }
            return null;
        };
        Util.logger.info = /** @type {typeof Util.logger.info} */ (
            (message) => {
                infoLogs.push(message);
            }
        );
        Util.logger.error = /** @type {typeof Util.logger.error} */ (
            (message) => {
                errorLogs.push(message);
            }
        );

        try {
            expect(await InitNpm.installDependencies(undefined, '9.0.3')).to.equal(false);
        } finally {
            Util.execSync = execSyncOriginal;
            Util.logger.info = loggerInfoOriginal;
            Util.logger.error = loggerErrorOriginal;
        }

        const updatedPackageJson = await File.readJSON('package.json');
        expect(updatedPackageJson.devDependencies).not.to.have.property('prettier-plugin-sql');
        assert.deepEqual(calls[0], [
            'npm',
            ['uninstall', '--save-dev', 'prettier-plugin-sql'],
            true,
        ]);
        assert.equal(calls[1][0], 'npm');
        assert.deepEqual(calls[1][1].slice(0, 2), ['install', '--save-dev']);
        expect(calls[1][1]).to.include('prettier-plugin-sfmc@2.0.0');
        expect(calls[1][2]).to.equal(true);
        expect(infoLogs).not.to.include('✔️  Dependencies installed.');
        expect(errorLogs).to.include('Could not install/update dependencies.');
    });

    it('declares the TransactionalSMS formatter helper in the public File types', () => {
        /** @type {import('../@types/lib/util/file.js').default['_formatTransactionalSmsContent']} */
        const formatTransactionalSmsContent = File._formatTransactionalSmsContent;
        expect(formatTransactionalSmsContent).to.be.a('function');
    });

    it('ships boilerplate that discovers only the SFMC formatter plugin', async () => {
        const prettierConfig = JSON.parse(
            await File.readFile('boilerplate/files/.prettierrc', 'utf8')
        );
        const npmDependencies = await File.readJSON('boilerplate/npm-dependencies.json');

        assert.deepEqual(prettierConfig.plugins, ['prettier-plugin-sfmc']);
        assert.deepEqual(prettierConfig.overrides, [
            {
                files: '.mcdev-validations.js',
                options: { trailingComma: 'es5' },
            },
        ]);
        assert.include(npmDependencies, 'prettier-plugin-sfmc');
        assert.notInclude(npmDependencies, 'prettier-plugin-sql');
    });
});
