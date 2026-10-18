describe('manifest background', function () {
  it('keeps a Chrome service worker and a Firefox script fallback', function (done) {
    fetch('/base/manifest.json').then(function (response) {
      return response.json()
    }).then(function (manifest) {
      expect(manifest.background.service_worker).toEqual('src/js/background.js')
      expect(manifest.background.scripts).toEqual(['src/js/background.js'])
      expect(manifest.minimum_chrome_version).toEqual('121')
      done()
    }).catch(function (error) {
      done.fail(error)
    })
  })
})
