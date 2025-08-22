module.exports = {
  entry: [
    // Main application entry points
    'app/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'lib/**/*.{ts,tsx}',
    'hooks/**/*.{ts,tsx}',
    'types/**/*.{ts,tsx}',
  ],

  project: [
    // Include primary source and explicit test/scripts
    'app/**/*.{ts,tsx,js}',
    'components/**/*.{ts,tsx,js}',
    'lib/**/*.{ts,tsx,js}',
    'hooks/**/*.{ts,tsx,js}',
    'types/**/*.{ts,tsx,js}',

    // Excludes
    '!node_modules/**',
    '!.next/**',
    '!dist/**',
    '!build/**',
    '!ai-subtree/**',
    '!test/**',
    '!.windsurf/**',
  ],

  // Include script-specific dependencies
  ignore: [
    // Intentionally left empty; prefer explicit scopes above
  ],

  // Include dependencies used by scripts
  ignoreDependencies: [
    // Intentionally left empty; prefer explicit scopes above
  ]
};
