const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    {
        files: ["src/**/*.js"],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: "script",
            globals: {
                // Browser
                window: "readonly",
                document: "readonly",
                console: "readonly",
                setTimeout: "readonly",
                clearTimeout: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                URL: "readonly",
                URLSearchParams: "readonly",
                MutationObserver: "readonly",
                Image: "readonly",
                HTMLElement: "readonly",
                EyeDropper: "readonly",
                fetch: "readonly",
                navigator: "readonly",
                location: "readonly",
                Event: "readonly",
                CustomEvent: "readonly",
                Set: "readonly",
                confirm: "readonly",
                // Chrome Extension
                chrome: "readonly",
                // Modules globaux de l'extension
                globalThis: "readonly",
            },
        },
        rules: {
            "no-unused-vars": ["warn", { argsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" }],
            "no-undef": "error",
            "no-console": "off",
            "no-duplicate-case": "error",
            "no-unreachable": "error",
            "no-constant-condition": "warn",
            "eqeqeq": ["warn", "always"],
        },
    },
];
