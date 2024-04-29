// jest.config.js

module.exports = {
  preset: 'ts-jest',
  collectCoverageFrom: [
    '**/*.{js,jsx,ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
  ],
  testEnvironment: 'jest-environment-jsdom',
  moduleFileExtensions: ['js', 'jsx', 'json', 'tsx', 'ts'],
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  transformIgnorePatterns: [],
  globals: {},
  // testEnvironment: 'node',
  testEnvironment: 'jsdom',
  "bail": false
};
