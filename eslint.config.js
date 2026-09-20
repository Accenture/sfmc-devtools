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
    mochaPlugin.configs.recommended,
    jsdoc.configs['flat/recommended'],
    eslintPluginUnicorn.configs['recommended'],
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

            'unicorn/empty-brace-spaces': 'off',
            'unicorn/no-top-level-assignment-in-function': 'off',
            'unicorn/no-useless-else': 'off',
            'unicorn/class-reference-in-static-methods': 'off',
            'unicorn/consistent-boolean-name': 'off',
            'unicorn/consistent-compound-words': 'off',
            'unicorn/no-break-in-nested-loop': 'off',
            'unicorn/no-computed-property-existence-check': 'off',
            'unicorn/no-this-outside-of-class': 'off',
            'unicorn/prefer-object-iterable-methods': 'off',
            'unicorn/prefer-private-class-fields': 'off',
            'unicorn/prefer-simple-condition-first': 'off',
            'unicorn/consistent-class-member-order': 'off',
            'unicorn/consistent-optional-chaining': 'off',
            'unicorn/max-nested-calls': 'off',
            'unicorn/no-array-concat-in-loop': 'off',
            'unicorn/no-declarations-before-early-exit': 'off',
            'unicorn/no-duplicate-if-branches': 'off',
            'unicorn/no-duplicate-loops': 'off',
            'unicorn/no-for-each': 'off',
            'unicorn/no-top-level-side-effects': 'off',
            'unicorn/no-undeclared-class-members': 'off',
            'unicorn/no-unnecessary-array-flat-map': 'off',
            'unicorn/no-unreadable-for-of-expression': 'off',
            'unicorn/no-unsafe-string-replacement': 'off',
            'unicorn/no-unused-array-method-return': 'off',
            'unicorn/no-useless-recursion': 'off',
            'unicorn/no-useless-template-literals': 'off',
            'unicorn/prefer-early-return': 'off',
            'unicorn/prefer-hoisting-branch-code': 'off',
            'unicorn/prefer-includes-over-repeated-comparisons': 'off',
            'unicorn/prefer-iterator-to-array': 'off',
            'unicorn/prefer-number-is-safe-integer': 'off',
            'unicorn/prefer-simple-sort-comparator': 'off',
            'unicorn/prefer-smaller-scope': 'off',
            'unicorn/prefer-ternary': 'off',
            'unicorn/prefer-unicode-code-point-escapes': 'off',
            'unicorn/require-array-sort-compare': 'off',
            'no-empty': 'off',
            'unicorn/explicit-length-check': 'off',
            'unicorn/filename-case': 'off',
            'unicorn/name-replacements': 'off',
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
            'unicorn/single-line-block-comment-style': ['error', 'single-line'],
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
