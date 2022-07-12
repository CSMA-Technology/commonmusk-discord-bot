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
  ]
};