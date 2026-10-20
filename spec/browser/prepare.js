const path = require('path')

const root = path.resolve(__dirname, '../..')

async function openExtensionPage(page, storage) {
  await page.setContent('<!doctype html><html><body></body></html>')
  await page.evaluate((data) => {
    window.mockStorageData = data
    window.chrome = {
      storage: {
        sync: {
          set() {},
          get(callback) {
            callback(window.mockStorageData)
          },
        },
      },
    }
  }, storage)
}

module.exports = { root, openExtensionPage }
