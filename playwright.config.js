const { defineConfig } = require('@playwright/test')

module.exports = defineConfig({
  testDir: 'spec/browser',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'line',
  use: {
    headless: true,
  },
})
