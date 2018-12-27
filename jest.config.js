const { resolve } = require('path');

const dotEnvName = `.env.${process.env.NODE_ENV || 'test'}.local`;
require('dotenv').config({ path:  resolve(process.cwd(), dotEnvName) });

module.exports = {
  testMatch: ['**/__tests__/**/*-test.js'],
  coverageDirectory: './coverage/',
  collectCoverage: false,
};
