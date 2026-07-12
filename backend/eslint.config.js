const js = require('@eslint/js');
const globals = require('globals');

// Minimal backend lint config (Phase 11 — CI readiness). Intentionally
// just eslint:recommended + Node/CommonJS globals — no stylistic rules,
// no auto-fixing of pre-existing code. The goal is giving CI a real lint
// step to run, not retroactively enforcing a style guide across a
// codebase that predates this config; see .github/workflows/ci.yml for
// how this is run non-blocking (reports issues without failing the build).
module.exports = [
  {
    ignores: ['node_modules/**', 'coverage/**', 'tests/**'],
  },
  {
    files: ['**/*.js'],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: { ...globals.node },
    },
    rules: {
      ...js.configs.recommended.rules,
      'no-unused-vars': 'warn',
      'no-console': 'off',
    },
  },
];
