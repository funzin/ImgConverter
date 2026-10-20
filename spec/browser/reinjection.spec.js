const { test, expect } = require('@playwright/test')
const path = require('path')
const { root, openExtensionPage } = require('./prepare')

test.describe('convert-to-img-tag.js', () => {
  test('can be injected again into the same page', async ({ page }) => {
    const errors = []
    page.on('pageerror', function (error) { errors.push(error.message) })
    await openExtensionPage(page, { width: null, height: null })
    const scriptPath = path.join(root, 'src/js/convert-to-img-tag.js')
    await page.addScriptTag({ path: scriptPath })
    await page.addScriptTag({ path: scriptPath })
    expect(errors).toEqual([])
  })
})
