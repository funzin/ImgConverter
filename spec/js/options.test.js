const { describe, it, beforeEach, afterEach, mock } = require('node:test')
const { installDom, loadScript, expect, spyOn, restoreSpies, readOptionsHtml } = require('../helpers/browser')

installDom()
loadScript('src/js/options.js')
const optionsHtml = readOptionsHtml()

describe('Storage', { concurrency: false }, function () {
  var spyObj
  afterEach(restoreSpies)
  beforeEach(function () {
    document.body.innerHTML = optionsHtml;
  })
  describe('when initialize', { concurrency: false }, function () {
    beforeEach(function () {
      spyObj = spyOn(self, "setText")
    })
    describe('when storage has save data', { concurrency: false }, function () {
      beforeEach(function () {
        mockStorageData = { width: "10", height: "100" }
        loadStorage()
      })
      it('should set value', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "10", height: "100" })
      });
    });

    describe('when storage does not have save data', { concurrency: false }, function () {
      beforeEach(function () {
        mockStorageData = {}
        loadStorage()
      })
      it('should not set', function () {
        expect(spyObj).toHaveBeenCalledWith({})
      });
    });
  });

  describe('when tap save button', { concurrency: false }, function () {
    describe('when no input', { concurrency: false }, function () {
      beforeEach(function () {
        spyObj = spyOn(chrome.storage.sync, "set")
        document.getElementById("save").click()
      })
      it('should not save', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "", height: "" })
      });
    });
    describe('when input width only', { concurrency: false }, function () {
      beforeEach(function () {
        document.getElementById("width").value = "200"
        spyObj = spyOn(chrome.storage.sync, "set")
        document.getElementById("save").click()
      })
      it('should save width', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "" })
      });
    });
  });
  describe('when input height only', { concurrency: false }, function () {
    beforeEach(function () {
      document.getElementById("height").value = "200"
      spyObj = spyOn(chrome.storage.sync, "set")
      document.getElementById("save").click()
    })
    it('should save height', function () {
      expect(spyObj).toHaveBeenCalledWith({ width: "", height: "200" })
    })
  })
  describe('when input width and height', { concurrency: false }, function () {
    beforeEach(function () {
      document.getElementById("width").value = "200"
      document.getElementById("height").value = "200"
      spyObj = spyOn(chrome.storage.sync, "set")
      document.getElementById("save").click()
    })
    it('should save width and height', function () {
      expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "200" })
    });
  })

  describe('when storage text is applied to the fields', { concurrency: false }, function () {
    it('should write width and height', function () {
      setText({ width: "10", height: "100" })
      expect(document.getElementById("width").value).toBe("10")
      expect(document.getElementById("height").value).toBe("100")
    })

    it('should clear fields when storage omits them', function () {
      document.getElementById("width").value = "old"
      document.getElementById("height").value = "old"
      setText({})
      expect(document.getElementById("width").value).toBe("")
      expect(document.getElementById("height").value).toBe("")
    })

    it('should leave the page without fields when they are missing', function () {
      document.body.textContent = ""
      setText({ width: "10", height: "100" })
      expect(document.getElementById("width")).toBeNull()
      expect(document.getElementById("height")).toBeNull()
    })
  })

  describe('when the saved size is not a number with an optional unit', { concurrency: false }, function () {
    beforeEach(function () {
      document.getElementById("width").value = "100 onerror=x"
      document.getElementById("height").value = "200px"
      spyObj = spyOn(chrome.storage.sync, "set")
      document.getElementById("save").click()
    })
    it('keeps the typed size and explains the width', function () {
      expect(spyObj).not.toHaveBeenCalled()
      expect(document.getElementById("width").value).toBe("100 onerror=x")
      expect(document.getElementById("height").value).toBe("200px")
      expect(document.getElementById("width").getAttribute("aria-invalid")).toBe("true")
      expect(document.getElementById("height").hasAttribute("aria-invalid")).toBe(false)
      expect(document.activeElement).toBe(document.getElementById("width"))
      var status = document.getElementById("status")
      expect(status && status.textContent).toBe("Width: Use digits, optionally followed by px or %, like 200px or 50%. Nothing was saved.")
    })
  })

  describe('when both sizes are rejected', { concurrency: false }, function () {
    beforeEach(function () {
      document.getElementById("width").value = "nope"
      document.getElementById("height").value = "10.5"
      spyObj = spyOn(chrome.storage.sync, "set")
      document.getElementById("save").click()
    })
    it('names both fields and saves nothing', function () {
      expect(spyObj).not.toHaveBeenCalled()
      var status = document.getElementById("status")
      expect(status && status.textContent).toBe("Width and Height: Use digits, optionally followed by px or %, like 200px or 50%. Nothing was saved.")
      expect(document.getElementById("width").getAttribute("aria-invalid")).toBe("true")
      expect(document.getElementById("height").getAttribute("aria-invalid")).toBe("true")
      expect(document.activeElement).toBe(document.getElementById("width"))
    })
  })

  describe('when a valid size is saved', { concurrency: false }, function () {
    it('shows Saved and then clears it', function () {
      mock.timers.enable({ apis: ['setTimeout'] })
      try {
        document.getElementById("width").value = "200"
        document.getElementById("height").value = ""
        spyObj = spyOn(chrome.storage.sync, "set")
        document.getElementById("save").click()
        var status = document.getElementById("status")
        expect(status && status.textContent).toBe("Saved")
        expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "" })
        mock.timers.tick(2000)
        status = document.getElementById("status")
        expect(status && status.textContent).toBe("")
      } finally {
        mock.timers.reset()
      }
    })
  })

  describe('when enter submits the form', { concurrency: false }, function () {
    it('saves the height', function () {
      document.getElementById("height").value = "50%"
      spyObj = spyOn(chrome.storage.sync, "set")
      document.getElementById("height").form.requestSubmit()
      expect(spyObj).toHaveBeenCalledTimes(1)
      expect(spyObj).toHaveBeenCalledWith({ width: "", height: "50%" })
      var status = document.getElementById("status")
      expect(status && status.textContent).toBe("Saved")
    })
  })

  describe('when the fields are labeled', { concurrency: false }, function () {
    it('names each field and points at the hint', function () {
      var width = document.getElementById("width")
      var height = document.getElementById("height")
      expect(width.labels[0] && width.labels[0].textContent).toBe("Width")
      expect(height.labels[0] && height.labels[0].textContent).toBe("Height")
      expect(width.getAttribute("aria-describedby")).toBe("size-hint")
      expect(height.getAttribute("aria-describedby")).toBe("size-hint")
    })
  })

  describe('when the options document is parsed', { concurrency: false }, function () {
    it('loads one deferred options script', function () {
      var doc = new DOMParser().parseFromString(optionsHtml, 'text/html')
      var scripts = doc.querySelectorAll('script')
      expect(scripts.length).toBe(1)
      expect(scripts[0].getAttribute('src')).toBe('../js/options.js')
      expect(scripts[0].defer).toBe(true)
      expect(scripts[0].textContent).toBe('')
    })
  })

  describe('when the typed size has surrounding spaces or an uppercase unit', { concurrency: false }, function () {
    beforeEach(function () {
      document.getElementById("width").value = " 200PX "
      document.getElementById("height").value = " 50% "
      spyObj = spyOn(chrome.storage.sync, "set")
      document.getElementById("save").click()
    })
    it('stores the trimmed lowercase size', function () {
      expect(spyObj).toHaveBeenCalledWith({ width: "200px", height: "50%" })
    })
  })

  describe('when storage holds an invalid width', { concurrency: false }, function () {
    it('shows an empty width field', function () {
      setText({ width: "100 onerror=x", height: "80" })
      expect(document.getElementById("width").value).toBe("")
      expect(document.getElementById("height").value).toBe("80")
    })
  })

})
