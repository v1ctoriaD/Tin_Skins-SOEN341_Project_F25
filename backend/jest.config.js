export default {
  testEnvironment: 'node',
  transform: {},
  moduleFileExtensions: ['js', 'json'],
  testPathIgnorePatterns: [
    '/node_modules/',
    // Skip integration tests in CI (require real DATABASE_URL)
    process.env.CI ? '/__tests__/analytics.test.js' : '',
  ],
}
