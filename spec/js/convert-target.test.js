const { describe, it } = require('node:test')
const { installDom, loadScript, expect } = require('../helpers/browser')

installDom()

const markdown = '![title](https://user-images.githubusercontent.com/test.png)'
const other = 'hello ![title](https://user-images.githubusercontent.com/other.png)'
const pair = '![a](https://example.com/a.png) and ![b](https://example.com/b.png)'

function installInsert() {
  document.execCommand = function (command, _ui, value) {
    if (command === 'insertText' && document.activeElement) {
      document.activeElement.value = value
      return true
    }
    return false
  }
}

function field(value) {
  const el = document.createElement('textarea')
  el.value = value
  document.body.appendChild(el)
  return el
}

describe('convert script while storage is loading', { concurrency: false }, function () {
  it('converts the element that was focused when the script started', function () {
    const pending = []
    chrome.storage.sync.get = function (method) { pending.push(method) }
    installInsert()
    const first = field(markdown)
    const second = field('![other](https://user-images.githubusercontent.com/other.png)')
    first.focus()
    loadScript('src/js/convert-to-img-tag.js')
    second.focus()
    pending.shift()({ width: '', height: '' })
    expect(first.value).toBe('<img src="https://user-images.githubusercontent.com/test.png" alt="title" width="50%">')
    expect(second.value).toBe('![other](https://user-images.githubusercontent.com/other.png)')
  })

  it('converts the text present when the saved size returns', function () {
    const pending = []
    chrome.storage.sync.get = function (method) { pending.push(method) }
    installInsert()
    const first = field(markdown)
    first.focus()
    loadScript('src/js/convert-to-img-tag.js')
    first.value = other
    pending.shift()({ width: '', height: '' })
    expect(first.value).toBe('hello <img src="https://user-images.githubusercontent.com/other.png" alt="title" width="50%">')
  })

  it('uses the selection present when the saved size returns', function () {
    const pending = []
    chrome.storage.sync.get = function (method) { pending.push(method) }
    installInsert()
    const first = field(pair)
    first.focus()
    loadScript('src/js/convert-to-img-tag.js')
    const token = '![a](https://example.com/a.png)'
    const start = pair.indexOf(token)
    first.selectionStart = start
    first.selectionEnd = start + token.length
    const storage = { width: '200px', height: '' }
    const expected = convertOnlySelectionToImgTag(pair, createParams(storage), start, start + token.length)
    pending.shift()(storage)
    expect(first.value).toBe(expected)
    expect(first.value).toBe('<img src="https://example.com/a.png" alt="a" width="200px"> and ![b](https://example.com/b.png)')
  })

  it('uses the size passed to the storage callback', function () {
    const pending = []
    chrome.storage.sync.get = function (method) { pending.push(method) }
    installInsert()
    const first = field(markdown)
    first.focus()
    loadScript('src/js/convert-to-img-tag.js')
    pending.shift()({ width: '200px', height: '' })
    expect(first.value).toBe('<img src="https://user-images.githubusercontent.com/test.png" alt="title" width="200px">')
  })
})
