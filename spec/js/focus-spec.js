describe('convert script when the document has no active element', function () {
  it('does not throw', function (done) {
    var errors = []
    var onError = function (event) { errors.push(event.message) }
    var desc = Object.getOwnPropertyDescriptor(Document.prototype, 'activeElement')
    window.addEventListener('error', onError)
    Object.defineProperty(Document.prototype, 'activeElement', {
      configurable: true,
      get: function () { return null },
    })

    var script = document.createElement('script')
    script.onload = function () {
      window.removeEventListener('error', onError)
      Object.defineProperty(Document.prototype, 'activeElement', desc)
      expect(errors).toEqual([])
      done()
    }
    script.onerror = function () {
      window.removeEventListener('error', onError)
      Object.defineProperty(Document.prototype, 'activeElement', desc)
      done.fail('converter script failed to load')
    }
    script.src = '/base/src/js/convert-to-img-tag.js?' + Date.now()
    document.head.appendChild(script)
  })
})
