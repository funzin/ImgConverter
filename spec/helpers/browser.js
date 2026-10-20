const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')
const { JSDOM } = require('jsdom')

const root = path.resolve(__dirname, '../..')
const restorers = []

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: 'http://localhost/',
    runScripts: 'dangerously',
  })
  const window = dom.window
  global.window = window
  global.document = window.document
  global.Document = window.Document
  global.HTMLElement = window.HTMLElement
  global.HTMLInputElement = window.HTMLInputElement
  global.HTMLTextAreaElement = window.HTMLTextAreaElement
  global.HTMLFormElement = window.HTMLFormElement
  global.Node = window.Node
  global.Event = window.Event
  global.DOMParser = window.DOMParser
  global.self = global
  global.mockStorageData = { width: '100', height: '0' }
  global.chrome = {
    storage: {
      sync: {
        set() {},
        get(method) {
          method(global.mockStorageData)
        },
      },
    },
  }
  return dom
}

function loadScript(rel) {
  const file = path.join(root, rel)
  const code = fs.readFileSync(file, 'utf8')
  vm.runInThisContext(code, { filename: file })
}

function loadConverter() {
  const desc = Object.getOwnPropertyDescriptor(global.Document.prototype, 'activeElement')
  Object.defineProperty(global.Document.prototype, 'activeElement', {
    configurable: true,
    get() {
      return null
    },
  })
  loadScript('src/js/convert-to-img-tag.js')
  Object.defineProperty(global.Document.prototype, 'activeElement', desc)
  loadScript('src/js/convert-to-img-tag.js')
  const field = global.document.createElement('textarea')
  field.value = '![title](https://user-images.githubusercontent.com/test.png)'
  global.document.body.appendChild(field)
  field.focus()
  global.document.execCommand = function () {
    const command = arguments[0]
    const value = arguments[2]
    if (command === 'insertText' && global.document.activeElement) {
      global.document.activeElement.value = value
      return true
    }
    return false
  }
  loadScript('src/js/convert-to-img-tag.js')
  field.remove()
}

function spyOn(object, method) {
  const original = object[method]
  const calls = []
  function spy() {
    calls.push(Array.prototype.slice.call(arguments))
    return original.apply(this, arguments)
  }
  spy.calls = calls
  object[method] = spy
  restorers.push(function () {
    object[method] = original
  })
  return spy
}

function restoreSpies() {
  while (restorers.length) restorers.pop()()
}

function expect(actual) {
  return {
    toEqual(expected) {
      assert.deepEqual(actual, expected)
    },
    toBe(expected) {
      assert.equal(actual, expected)
    },
    toBeNull() {
      assert.equal(actual, null)
    },
    toHaveBeenCalledWith() {
      const expected = Array.prototype.slice.call(arguments)
      const calls = actual && actual.calls
      const found = calls && calls.some(function (args) {
        try {
          assert.deepEqual(args, expected)
          return true
        } catch {
          return false
        }
      })
      assert.ok(found, 'missing call ' + JSON.stringify(expected) + ' in ' + JSON.stringify(calls))
    },
    toHaveBeenCalledTimes(count) {
      assert.equal(actual.calls.length, count)
    },
    not: {
      toHaveBeenCalled() {
        assert.equal((actual.calls || []).length, 0)
      },
    },
  }
}

function readOptionsHtml() {
  return fs.readFileSync(path.join(root, 'src/html/options.html'), 'utf8')
}

module.exports = {
  installDom,
  loadScript,
  loadConverter,
  spyOn,
  restoreSpies,
  expect,
  readOptionsHtml,
  root,
}
