import pluginJs from '@eslint/js'
import tsEslint from 'typescript-eslint'
import pluginImportX from 'eslint-plugin-import-x'
import { createTypeScriptImportResolver } from 'eslint-import-resolver-typescript'

/**
 * @type {import('eslint').Linter.Config[]}
 */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },

  pluginJs.configs.recommended,
  ...tsEslint.configs.recommended,

  // Ignore scripts directory.
  {
    name: 'app/scripts-to-ignore',
    ignores: ['scripts/**']
  },

  // Check import like case-sensitive.
  {
    name: 'app/import-check',
    plugins: {
      'import-x': pluginImportX
    },
    settings: {
      'import-x/resolver-next': [
        createTypeScriptImportResolver({
          project: 'tsconfig.json',
          noWarnOnMultipleProjects: true
        })
      ]
    },
    rules: {
      'import-x/no-unresolved': ['error', { caseSensitive: true }],
      'import-x/consistent-type-specifier-style': ['error', 'prefer-inline']
    }
  }
]
