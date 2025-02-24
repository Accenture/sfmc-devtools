import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import mochaPlugin from 'eslint-plugin-mocha';
import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';

export default [
    {
        ignores: ['docs/**/*', 'node_modules/**/*', 'retrieve/**/*'],
    },
    js.configs.recommended,
    eslintPluginPrettierRecommended,
    mochaPlugin.configs.flat.recommended,
    jsdoc.configs['flat/recommended'],
    eslintPluginUnicorn.configs['flat/recommended'],
    {
        languageOptions: {
            globals: {
                ...globals.nodeBuiltin,
                Atomics: 'readonly',
                SharedArrayBuffer: 'readonly',
            },

            ecmaVersion: 2022,
            sourceType: 'module',
        },

        settings: {
            jsdoc: {
                mode: 'typescript',

                preferredTypes: {
                    array: 'Array',
                    'array.<>': '[]',
                    'Array.<>': '[]',
                    'array<>': '[]',
                    'Array<>': '[]',
                    Object: 'object',
                    'object.<>': 'Object.<>',
                    'object<>': 'Object.<>',
                    'Object<>': 'Object.<>',
                    set: 'Set',
                    'set.<>': 'Set.<>',
                    'set<>': 'Set.<>',
                    'Set<>': 'Set.<>',
                    promise: 'Promise',
                    'promise.<>': 'Promise.<>',
                    'promise<>': 'Promise.<>',
                    'Promise<>': 'Promise.<>',
                },
            },
        },

        rules: {
            'logical-assignment-operators': ['error', 'always'],
            'unicorn/better-regex': 'off',

            'unicorn/catch-error-name': [
                'error',
                {
                    name: 'ex',
                },
            ],

            'unicorn/explicit-length-check': 'off',
            'unicorn/filename-case': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/no-await-expression-member': 'off',
            'unicorn/no-empty-file': 'off',
            'unicorn/no-hex-escape': 'off',
            'unicorn/no-nested-ternary': 'off',
            'unicorn/no-null': 'off',
            'unicorn/no-static-only-class': 'off',
            'unicorn/no-unused-properties': 'warn',
            'unicorn/numeric-separators-style': 'off',
            'unicorn/prefer-array-some': 'off',
            'unicorn/prefer-module': 'off',
            'unicorn/prefer-set-has': 'off',
            'unicorn/prefer-spread': 'off',
            'unicorn/prefer-string-replace-all': 'error',
            'unicorn/prevent-abbreviations': 'off',
            'arrow-body-style': ['error', 'as-needed'],
            curly: 'error',
            'no-console': 'error',
            'jsdoc/check-line-alignment': 2,

            'jsdoc/require-jsdoc': [
                'warn',
                {
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                        ArrowFunctionExpression: false,
                        FunctionExpression: true,
                    },
                },
            ],

            'jsdoc/require-param-type': 'error',

            'jsdoc/tag-lines': [
                'warn',
                'any',
                {
                    startLines: 1,
                },
            ],

            'jsdoc/no-undefined-types': 'off',
            'jsdoc/valid-types': 'off',

            'spaced-comment': [
                'warn',
                'always',
                {
                    block: {
                        exceptions: ['*'],
                        balanced: true,
                    },
                },
            ],
        },
    },
    {
        files: ['**/*.js'],

        rules: {
            'no-var': 'error',
            'prefer-const': 'error',
            'prettier/prettier': 'warn',
            'prefer-arrow-callback': 'warn',
        },
    },
    {
        files: ['test/*.js'],
        rules: {
            'mocha/no-mocha-arrows': 'off',
            'mocha/no-pending-tests': 'off',
        },
    },
];
