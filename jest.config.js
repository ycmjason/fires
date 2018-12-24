const { resolve } = require('path');

require('dotenv').config({ path: resolve(process.cwd(), '.env') });
require('dotenv').config({ path: resolve(process.cwd(), '.env.local') });

module.exports = {
  testMatch: ['**/__tests__/**/*-test.js'],
};
