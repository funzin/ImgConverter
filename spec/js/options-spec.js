describe('Storage', function () {
  var spyObj
  beforeEach(function () {
    document.body.innerHTML = __html__['src/html/options.html'];
  })
  describe('when initialize', function () {
    beforeEach(function () {
      spyObj = spyOn(self, "setText")
    })
    describe('when storage has save data', function () {
      beforeEach(function () {
        mockStorageData = { width: "10", height: "100" }
        loadStorage()
      })
      it('should set value', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "10", height: "100" })
      });
    });

    describe('when storage does not have save data', function () {
      beforeEach(function () {
        mockStorageData = {}
        loadStorage()
      })
      it('should not set', function () {
        expect(spyObj).toHaveBeenCalledWith({})
      });
    });
  });

  describe('when tap save button', function () {
    describe('when no input', function () {
      beforeEach(function () {
        spyObj = spyOn(chrome.storage.sync, "set")
        document.getElementById("save").click()
      })
      it('should not save', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "", height: "" })
      });
    });
    describe('when input width only', function () {
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
  describe('when input height only', function () {
    beforeEach(function () {
      document.getElementById("height").value = "200"
      spyObj = spyOn(chrome.storage.sync, "set")
      document.getElementById("save").click()
    })
    it('should save height', function () {
      expect(spyObj).toHaveBeenCalledWith({ width: "", height: "200" })
    })
  })
  describe('when input width and height', function () {
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

  describe('when storage text is applied to the fields', function () {
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

  describe('when save is added after startup', function () {
    beforeEach(function () {
      document.getElementById("save").remove()
      document.getElementById("width").value = "200"
      document.getElementById("height").value = "80"
      var save = document.createElement("input")
      save.id = "save"
      save.type = "button"
      document.body.appendChild(save)
      spyObj = spyOn(chrome.storage.sync, "set")
      save.click()
    })
    it('should save from the replacement button once', function () {
      expect(spyObj).toHaveBeenCalledTimes(1)
      expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "80" })
    })
  })

  describe('when the saved size is not a number with an optional unit', function () {
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

  describe('when both sizes are rejected', function () {
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

  describe('when a valid size is saved', function () {
    it('shows Saved and then clears it', function () {
      jasmine.clock().install()
      try {
        document.getElementById("width").value = "200"
        document.getElementById("height").value = ""
        spyObj = spyOn(chrome.storage.sync, "set")
        document.getElementById("save").click()
        var status = document.getElementById("status")
        expect(status && status.textContent).toBe("Saved")
        expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "" })
        jasmine.clock().tick(2000)
        status = document.getElementById("status")
        expect(status && status.textContent).toBe("")
      } finally {
        jasmine.clock().uninstall()
      }
    })
  })

  describe('when enter submits the form', function () {
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

  describe('when the fields are labeled', function () {
    it('names each field and points at the hint', function () {
      var width = document.getElementById("width")
      var height = document.getElementById("height")
      expect(width.labels[0] && width.labels[0].textContent).toBe("Width")
      expect(height.labels[0] && height.labels[0].textContent).toBe("Height")
      expect(width.getAttribute("aria-describedby")).toBe("size-hint")
      expect(height.getAttribute("aria-describedby")).toBe("size-hint")
    })
  })

  describe('when the options document is parsed', function () {
    it('loads one deferred options script', function () {
      var doc = new DOMParser().parseFromString(__html__['src/html/options.html'], 'text/html')
      var scripts = doc.querySelectorAll('script')
      expect(scripts.length).toBe(1)
      expect(scripts[0].getAttribute('src')).toBe('../js/options.js')
      expect(scripts[0].defer).toBe(true)
      expect(scripts[0].textContent).toBe('')
    })
  })

  describe('when the typed size has surrounding spaces or an uppercase unit', function () {
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

  describe('when storage holds an invalid width', function () {
    it('shows an empty width field', function () {
      setText({ width: "100 onerror=x", height: "80" })
      expect(document.getElementById("width").value).toBe("")
      expect(document.getElementById("height").value).toBe("80")
    })
  })

  describe('when the click lands inside save', function () {
    beforeEach(function () {
      document.getElementById("save").remove()
      document.getElementById("width").value = "200"
      document.getElementById("height").value = ""
      var save = document.createElement("button")
      save.id = "save"
      var label = document.createElement("span")
      label.textContent = "Save"
      save.appendChild(label)
      document.body.appendChild(save)
      spyObj = spyOn(chrome.storage.sync, "set")
      label.click()
    })
    it('should save from the inner target once', function () {
      expect(spyObj).toHaveBeenCalledTimes(1)
      expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "" })
    })
  })
})
