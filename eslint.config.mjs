export default [{
  files: ['src/**/*.{js,mjs}', 'scripts/**/*.mjs', 'tests/**/*.mjs'],
  languageOptions: {
    ecmaVersion: 'latest', sourceType: 'module',
    globals: Object.fromEntries(['window', 'document', 'localStorage', 'navigator', 'HTMLElement', 'HTMLButtonElement', 'HTMLImageElement', 'HTMLDialogElement', 'requestAnimationFrame', 'innerWidth', 'getComputedStyle', 'process', 'console', 'URL', 'setTimeout'].map((name) => [name, 'readonly'])),
  },
  rules: { 'no-unused-vars': 'error', 'no-undef': 'error', 'no-unreachable': 'error', 'no-constant-condition': 'error', 'eqeqeq': 'error' },
}];
