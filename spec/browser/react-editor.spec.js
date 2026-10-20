const { test, expect } = require('@playwright/test')
const path = require('path')
const { root, openExtensionPage } = require('./prepare')

test.describe('focused React comment editor', () => {
  test('submits the converted tag after preview', async ({ page }) => {
    const markdown = '![title](https://user-images.githubusercontent.com/test.png)'
    const expected = '<img src="https://user-images.githubusercontent.com/test.png" alt="title" width="50%">'

    await openExtensionPage(page, { width: null, height: null })
    await page.addScriptTag({ path: path.join(root, 'node_modules/react/umd/react.development.js') })
    await page.addScriptTag({ path: path.join(root, 'node_modules/react-dom/umd/react-dom.development.js') })
    await page.evaluate((startingMarkdown) => {
      const host = document.createElement('div')
      document.body.appendChild(host)

      function Editor() {
        var valueState = React.useState(startingMarkdown)
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

      ReactDOM.flushSync(function () {
        ReactDOM.createRoot(host).render(React.createElement(Editor))
      })
      document.getElementById('react-comment').focus()
    }, markdown)

    await page.addScriptTag({ path: path.join(root, 'src/js/convert-to-img-tag.js') })

    const result = await page.evaluate(() => {
      const textarea = document.getElementById('react-comment')
      ReactDOM.flushSync(function () {
        document.getElementById('react-preview').click()
      })
      const afterPreview = textarea.value
      ReactDOM.flushSync(function () {
        document.getElementById('react-submit').click()
      })
      const submitted = document.getElementById('react-submitted').textContent
      textarea.focus()
      document.execCommand('undo')
      const afterUndo = textarea.value
      const submittedAfterUndo = document.getElementById('react-submitted').textContent
      ReactDOM.flushSync(function () {
        document.getElementById('react-submit').click()
      })
      return {
        afterPreview,
        submitted,
        afterUndo,
        submittedAfterUndo,
        submittedFinal: document.getElementById('react-submitted').textContent,
      }
    })

    expect(result.afterPreview).toEqual(expected)
    expect(result.submitted).toEqual(expected)
    expect(result.afterUndo).toEqual(markdown)
    expect(result.submittedAfterUndo).toEqual(expected)
    expect(result.submittedFinal).toEqual(markdown)
  })
})
