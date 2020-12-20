'use strict';
module.exports = ( _wallaby ) => {
  process.env.NODE_ENV = 'development';
  
  return {
    testFramework: 'mocha',

    files: [
      './src/**/*.ts',
      '!./src/.dev/tests/**/*.ts'
    ],

    tests: [
      './src/.dev/tests/**/*.ts'
    ],

    env: {
      type: 'node',
      runner: 'node',
      params: {
        runner: `-r ${require.resolve('esm')}`
      }
    }
  }
};
