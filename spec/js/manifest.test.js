const { describe, it } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')

describe('manifest background', { concurrency: false }, function () {
  it('keeps a Chrome service worker and a Firefox script fallback', function () {
    const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, '../../manifest.json'), 'utf8'))
    assert.equal(manifest.background.service_worker, 'src/js/background.js')
    assert.deepEqual(manifest.background.scripts, ['src/js/background.js'])
    assert.equal(manifest.minimum_chrome_version, '121')
  })
})
