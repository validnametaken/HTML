import globals from "globals";

export default [
    {
        files: ["**/*.js"],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
            },
            sourceType: "module",
            ecmaVersion: 2022
        },
        rules: {
            "no-unused-vars": "warn",
            "no-undef": "off" 
        }
    }
];
