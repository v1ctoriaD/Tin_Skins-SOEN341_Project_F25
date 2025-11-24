const ignore = ['/node_modules/']

if (process.env.CI) {
  ignore.push('/__tests__/analytics.test.js')
}

export default {
  testEnvironment: 'node',
  transform: {},
  testMatch: ['**/__tests__/**/*.test.js'],
  moduleFileExtensions: ['js', 'mjs'],
  testPathIgnorePatterns: ignore,
}
