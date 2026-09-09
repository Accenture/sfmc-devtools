import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsdoc from 'eslint-plugin-jsdoc';
import sfmc from 'eslint-plugin-sfmc';
import unicorn from 'eslint-plugin-unicorn';
import globals from 'globals';

const browserFiles = ['retrieve/**/*.js', 'deploy/**/*.js'];
const nodeFiles = ['.mcdev-validations.js', 'lib/**/*.js', 'eslint.config.js'];
// HTML processor children are server-side JavaScript, never browser or Node code.
const serverBlocks = ['**/*.html/*.js'];
const modernFiles = [...browserFiles, ...nodeFiles];

export default [
    {
        ignores: ['docs/**', 'logs/**', 'node_modules/**', 'template/**', '**/*.BAK', '**/*.BAK/**']
    },
    {
        ...unicorn.configs.recommended,
        files: ['**/*.{js,mjs,cjs,ssjs}'],
        // Runtime presets below supply globals, rather than Unicorn's modern builtins.
        languageOptions: { ...unicorn.configs.recommended.languageOptions, globals: {} }
    },
    ...sfmc.configs.recommended,
    ...sfmc.configs.embedded,
    sfmc.configs['unicorn-ssjs'],
    sfmc.configs['unicorn-ssjs-embedded'],
    {
        ...js.configs.recommended,
        files: modernFiles,
        ignores: serverBlocks
    },
    {
        ...jsdoc.configs['flat/recommended'],
        files: modernFiles,
        ignores: serverBlocks
    },
    {
        files: modernFiles,
        ignores: serverBlocks,
        rules: {
            'no-var': 'error',
            'prefer-const': 'error'
        }
    },
    {
        files: browserFiles,
        ignores: serverBlocks,
        languageOptions: {
            globals: globals.browser,
            ecmaVersion: 'latest',
            sourceType: 'module'
        }
    },
    {
        files: nodeFiles,
        ignores: serverBlocks,
        languageOptions: {
            globals: globals.nodeBuiltin,
            ecmaVersion: 2024,
            sourceType: 'module'
        },
        settings: { jsdoc: { mode: 'typescript' } }
    },
    // Formatting runs separately through Prettier, not as an ESLint rule.
    eslintConfigPrettier
];
