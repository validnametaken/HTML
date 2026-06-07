const globals = require("globals");
const js = require("@eslint/js");

module.exports = [
    js.configs.recommended,
    {
        "languageOptions": {
            "globals": {
                ...globals.browser,
                ...globals.node
            },
            "parserOptions": {
                "ecmaVersion": 2022,
                "sourceType": "module"
            }
        },
        "rules": {
            "no-unused-vars": "warn",
            "no-undef": "off"
        }
    }
];
