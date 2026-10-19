import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/lib/**',
      '**/coverage/**',
      'apps/mobile/android/**',
      'apps/mobile/ios/**',
      'apps/mobile/.expo/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
);
