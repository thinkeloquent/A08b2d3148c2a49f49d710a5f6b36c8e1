/** @type {import('jest').Config} */
export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  verbose: true,
  collectCoverageFrom: ['src/**/*.mjs'],
  coverageDirectory: 'coverage',
  moduleFileExtensions: ['js', 'mjs'],
};
