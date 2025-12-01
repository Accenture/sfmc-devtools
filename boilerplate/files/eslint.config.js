import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import globals from 'globals';
import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';
import sfmcSsjs from 'eslint-config-ssjs';

export default [
    {
        ignores: ['deploy/**/*', 'docs/**/*', 'logs/**/*', 'node_modules/**/*', 'template/**/*']
    },
    js.configs.recommended,
    eslintPluginPrettierRecommended,
    jsdoc.configs['flat/recommended'],
    eslintPluginUnicorn.configs['flat/recommended'],
    {
        plugins: { jsdoc },
        rules: {
            'unicorn/better-regex': 'off',
            'unicorn/prefer-string-raw': 'off',
            'unicorn/catch-error-name': [
                'error',
                {
                    name: 'ex'
                }
            ],
            'unicorn/explicit-length-check': 'off',
            'unicorn/no-null': 'off',
            'unicorn/prefer-module': 'off',
            'unicorn/prevent-abbreviations': 'off',
            'unicorn/filename-case': 'off',
            'unicorn/no-array-callback-reference': 'off',
            'unicorn/no-array-reduce': 'off',
            'unicorn/no-await-expression-member': 'off',
            'unicorn/no-hex-escape': 'off',
            'unicorn/no-nested-ternary': 'off',
            'unicorn/no-static-only-class': 'off',
            'unicorn/no-unused-properties': 'warn',
            'unicorn/numeric-separators-style': 'off',
            'unicorn/prefer-array-some': 'off',
            'unicorn/prefer-set-has': 'off',
            'unicorn/prefer-spread': 'off',
            'unicorn/prefer-string-replace-all': 'error',
            'padded-blocks': 'off',
            'prefer-rest-params': 'off',
            'prefer-spread': 'off',

            'jsdoc/require-jsdoc': [
                'warn',
                {
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                        ArrowFunctionExpression: false,
                        FunctionExpression: true
                    }
                }
            ],

            'valid-jsdoc': 'off',

            'spaced-comment': [
                'warn',
                'always',
                {
                    block: {
                        exceptions: ['*'],
                        balanced: true
                    }
                }
            ]
        }
    },
    {
        ...sfmcSsjs.configs.recommended,
        files: ['**/*.ssjs'],
        rules: {
            'unicorn/text-encoding-identifier-case': 'off',
            'unicorn/prefer-string-replace-all': 'off'
        }
    },
    {
        files: ['**/*.js'],

        languageOptions: {
            globals: {
                ...globals.browser
            },
            ecmaVersion: 2022
        },

        rules: {
            'no-var': 'error',
            'prefer-const': 'error',
            'prettier/prettier': 'warn'
        }
    },
    {
        files: ['lib/**.js', '.mcdev-validations.js'],

        languageOptions: {
            globals: {
                ...globals.nodeBuiltin
            },

            ecmaVersion: 2022,
            sourceType: 'module'
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
                    'Promise<>': 'Promise.<>'
                }
            }
        },

        rules: {
            'logical-assignment-operators': ['error', 'always'],
            'arrow-body-style': ['error', 'as-needed'],
            curly: 'error',

            'jsdoc/check-line-alignment': 2,

            'jsdoc/require-jsdoc': [
                'warn',
                {
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                        ArrowFunctionExpression: false,
                        FunctionExpression: true
                    }
                }
            ],

            'jsdoc/require-param-type': 'error',

            'jsdoc/tag-lines': [
                'warn',
                'any',
                {
                    startLines: 1
                }
            ],

            'jsdoc/no-undefined-types': 'off',
            'jsdoc/valid-types': 'off',

            'spaced-comment': [
                'warn',
                'always',
                {
                    block: {
                        exceptions: ['*'],
                        balanced: true
                    }
                }
            ],
            'no-var': 'error',
            'prefer-const': 'error',
            'prettier/prettier': 'warn'
        }
    },
    {
        files: ['eslint.config.js'],

        languageOptions: {
            globals: { ...globals.node },
            ecmaVersion: 2022
        },

        rules: {
            'no-var': 'error',
            'prefer-const': 'error',
            'prettier/prettier': 'warn'
        }
    }
];
