const { test, expect } = require('@playwright/test')
const path = require('path')
const { root, openExtensionPage } = require('./prepare')

test.describe('convert script when the document has no active element', () => {
  test('does not throw', async ({ page }) => {
    const errors = []
    page.on('pageerror', function (error) { errors.push(error.message) })
    await openExtensionPage(page, {})
    await page.evaluate(() => {
      const desc = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement')
      Object.defineProperty(Document.prototype, 'activeElement', {
        configurable: true,
        get: function () { return null },
      })
      window.__activeElementDesc = desc
    })
    await page.addScriptTag({ path: path.join(root, 'src/js/convert-to-img-tag.js') })
    await page.evaluate(() => {
      Object.defineProperty(Document.prototype, 'activeElement', window.__activeElementDesc)
    })
    expect(errors).toEqual([])
  })
})
