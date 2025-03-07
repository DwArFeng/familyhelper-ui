import pluginJs from '@eslint/js'
import tseslint from 'typescript-eslint'

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ['**/*.{js,mjs,cjs,ts}'] },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,

  // Ignore scripts directory.
  {
    name: 'app/scripts-to-ignore',
    ignores: ['scripts/**'],
  },
]
