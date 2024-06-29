import prettier from "eslint-plugin-prettier";
import globals from "globals";
import mocha from "eslint-plugin-mocha";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default [{
    ignores: ["docs/**/*", "node_modules/**/*", "retrieve/**/*"],
}, ...compat.extends(
    "eslint:recommended",
    "ssjs",
    "plugin:jsdoc/recommended",
    "plugin:prettier/recommended",
    "plugin:unicorn/recommended",
), {
    plugins: {
        prettier,
    },

    languageOptions: {
        globals: {
            ...globals.node,
            Atomics: "readonly",
            SharedArrayBuffer: "readonly",
        },

        ecmaVersion: 2022,
        sourceType: "module",
    },

    settings: {
        jsdoc: {
            mode: "typescript",

            preferredTypes: {
                array: "Array",
                "array.<>": "[]",
                "Array.<>": "[]",
                "array<>": "[]",
                "Array<>": "[]",
                Object: "object",
                "object.<>": "Object.<>",
                "object<>": "Object.<>",
                "Object<>": "Object.<>",
                set: "Set",
                "set.<>": "Set.<>",
                "set<>": "Set.<>",
                "Set<>": "Set.<>",
                promise: "Promise",
                "promise.<>": "Promise.<>",
                "promise<>": "Promise.<>",
                "Promise<>": "Promise.<>",
            },
        },
    },

    rules: {
        "logical-assignment-operators": ["error", "always"],
        "unicorn/better-regex": "off",

        "unicorn/catch-error-name": ["error", {
            name: "ex",
        }],

        "unicorn/explicit-length-check": "off",
        "unicorn/no-null": "off",
        "unicorn/prefer-module": "off",
        "unicorn/prevent-abbreviations": "off",
        "unicorn/filename-case": "off",
        "unicorn/no-array-callback-reference": "off",
        "unicorn/no-array-reduce": "off",
        "unicorn/no-await-expression-member": "off",
        "unicorn/no-hex-escape": "off",
        "unicorn/no-nested-ternary": "off",
        "unicorn/no-static-only-class": "off",
        "unicorn/no-unused-properties": "warn",
        "unicorn/numeric-separators-style": "off",
        "unicorn/prefer-array-some": "off",
        "unicorn/prefer-set-has": "off",
        "unicorn/prefer-spread": "off",
        "unicorn/prefer-string-replace-all": "error",
        "arrow-body-style": ["error", "as-needed"],
        curly: "error",
        "no-console": "error",
        "jsdoc/check-line-alignment": 2,

        "jsdoc/require-jsdoc": ["warn", {
            require: {
                FunctionDeclaration: true,
                MethodDefinition: true,
                ClassDeclaration: true,
                ArrowFunctionExpression: false,
                FunctionExpression: true,
            },
        }],

        "jsdoc/require-param-type": "error",

        "jsdoc/tag-lines": ["warn", "any", {
            startLines: 1,
        }],

        "jsdoc/no-undefined-types": "error",
        "valid-jsdoc": "off",

        "spaced-comment": ["warn", "always", {
            block: {
                exceptions: ["*"],
                balanced: true,
            },
        }],
    },
}, {
    files: ["**/*.js"],

    rules: {
        "no-var": "error",
        "prefer-const": "error",
        "prettier/prettier": "warn",
        "prefer-arrow-callback": "warn",
    },
}, ...compat.extends("plugin:mocha/recommended").map(config => ({
    ...config,
    files: ["test/*.js"],
})), {
    files: ["test/*.js"],

    plugins: {
        mocha,
    },

    rules: {
        "mocha/no-mocha-arrows": "off",
        "mocha/no-pending-tests": "off",
    },
}];