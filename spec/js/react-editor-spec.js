describe('focused React comment editor', function () {
  var root
  var host
  var markdown
  var expected
  var savedStorage

  beforeEach(function () {
    markdown = '![title](https://user-images.githubusercontent.com/test.png)'
    savedStorage = mockStorageData
    mockStorageData = { width: null, height: null }
    expected = '<img src=https://user-images.githubusercontent.com/test.png width=50%>'

    host = document.createElement('div')
    document.body.appendChild(host)

    function Editor() {
      var valueState = React.useState(markdown)
      var value = valueState[0]
      var setValue = valueState[1]
      var previewState = React.useState(false)
      var setPreview = previewState[1]
      var submittedState = React.useState('')
      var submitted = submittedState[0]
      var setSubmitted = submittedState[1]
      return React.createElement('form', {
        onSubmit: function (event) {
          event.preventDefault()
          setSubmitted(value)
        }
      },
        React.createElement('textarea', {
          id: 'react-comment',
          value: value,
          onChange: function (event) { setValue(event.target.value) }
        }),
        React.createElement('button', {
          id: 'react-preview',
          type: 'button',
          onClick: function () { setPreview(function (flag) { return !flag }) }
        }, 'Preview'),
        React.createElement('button', { id: 'react-submit', type: 'submit' }, 'Comment'),
        React.createElement('output', { id: 'react-submitted' }, submitted)
      )
    }

    root = ReactDOM.createRoot(host)
    ReactDOM.flushSync(function () {
      root.render(React.createElement(Editor))
    })
    document.getElementById('react-comment').focus()
  })

  afterEach(function () {
    mockStorageData = savedStorage
    root.unmount()
    host.remove()
  })

  function injectConverter(done) {
    var script = document.createElement('script')
    script.onload = function () { done() }
    script.onerror = function () { done.fail('converter script failed to load') }
    script.src = '/base/src/js/convert-to-img-tag.js?' + Date.now()
    document.head.appendChild(script)
  }

  it('submits the converted tag after preview', function (done) {
    injectConverter(function () {
      var textarea = document.getElementById('react-comment')
      ReactDOM.flushSync(function () {
        document.getElementById('react-preview').click()
      })
      expect(textarea.value).toEqual(expected)
      ReactDOM.flushSync(function () {
        document.getElementById('react-submit').click()
      })
      expect(document.getElementById('react-submitted').textContent).toEqual(expected)
      textarea.focus()
      document.execCommand('undo')
      expect(textarea.value).toEqual(markdown)
      expect(document.getElementById('react-submitted').textContent).toEqual(expected)
      ReactDOM.flushSync(function () {
        document.getElementById('react-submit').click()
      })
      expect(document.getElementById('react-submitted').textContent).toEqual(markdown)
      done()
    })
  })
})
