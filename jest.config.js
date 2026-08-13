/** @type {import('jest').Config} */
module.exports = {
  rootDir: '.',

  moduleFileExtensions: ['js', 'json', 'ts'],

  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  testEnvironment: 'node',

  testRegex: '.*\\.spec\\.ts$',
};
