/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!**/*.d.ts'
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  coverageThreshold: {
    global: {
      "branches": 100,
      "functions": 100,
      "lines": 100,
      "statements": 100
    }
  }
};