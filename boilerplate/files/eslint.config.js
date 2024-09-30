import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import jsdoc from 'eslint-plugin-jsdoc';
import js from '@eslint/js';
import sfmcSsjs from 'eslint-config-ssjs';
import globals from 'globals';

export default [
    {
        ignores: ['deploy/**/*', 'docs/**/*', 'logs/**/*', 'node_modules/**/*', 'template/**/*']
    },
    js.configs['recommended'],
    eslintPluginPrettierRecommended,
    jsdoc.configs['flat/recommended'],
    {
        plugins: { jsdoc },
        rules: {
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
        files: ['**/*.ssjs']
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
        files: ['.mcdev-validations.js'],

        languageOptions: {
            globals: {
                ...globals.nodeBuiltin
            },

            ecmaVersion: 2022,
            sourceType: 'module'
        },

        rules: {
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
