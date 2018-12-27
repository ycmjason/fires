const { resolve } = require('path');

require('dotenv').config(); // load .env

require('dotenv').config({
  path: resolve(process.cwd(), `.env.${process.env.NODE_ENV || 'test'}.local`),
});

module.exports = {
  testMatch: ['**/__tests__/**/*-test.js'],
  coverageDirectory: './coverage/',
  collectCoverage: false,
};
