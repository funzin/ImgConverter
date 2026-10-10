describe('convert-to-img-tag.js', function () {
  it('can be injected again into the same page', function (done) {
    var script = document.createElement('script')
    var errors = []
    var onError = function (event) { errors.push(event.message) }
    window.addEventListener('error', onError)
    script.onload = function () {
      window.removeEventListener('error', onError)
      expect(errors).toEqual([])
      done()
    }
    script.src = '/base/src/js/convert-to-img-tag.js'
    document.head.appendChild(script)
  })
})
