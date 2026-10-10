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
