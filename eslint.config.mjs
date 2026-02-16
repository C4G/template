import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import vitest from '@vitest/eslint-plugin';
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { defineConfig, globalIgnores } from "eslint/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all
});

export default defineConfig([globalIgnores(["**/node_modules/", "**/.next/"]), {
    extends: [...nextCoreWebVitals, ...nextTypescript, ...compat.extends("prettier")],

    plugins: {
        vitest
    },

    rules: {
        "no-unused-vars": ["error", {
            argsIgnorePattern: "^_",
            ignoreRestSiblings: true,
        }],
    },
}, {
    files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
    ...vitest.configs.recommended,
}]);