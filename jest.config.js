const { resolve } = require('path');

// .env.test.local or .env.ci.local
require('dotenv').config({
  path: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'test'}.local`),
});
// .env
require('dotenv').config();

module.exports = {
  testMatch: ['**/__tests__/**/*-test.js'],
  collectCoverage: false,
  coverageDirectory: './coverage/',
  coveragePathIgnorePatterns: ['/node_modules/', '/__tests__/'],
  clearMocks: true,
};
