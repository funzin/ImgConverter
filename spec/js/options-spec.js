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

  describe('when no input', function () {
    beforeEach(function () {
    })
    describe('when tap save button', function () {
      beforeEach(function () {
        spyObj = spyOn(chrome.storage.sync, "set")
        $("#save").click()
      })
      it('should not save', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "", height: "" })
      });
    });
  });
  describe('when input width only', function () {
    beforeEach(function () {
      $("#width").val("200")
    })
    describe('when tap save button', function () {
      beforeEach(function () {
        spyObj = spyOn(chrome.storage.sync, "set")
        $("#save").click()
      })
      it('should save width', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "" })
      });
    });
  });
  describe('when input height only', function () {
    beforeEach(function () {
      $("#height").val("200")
    })
    describe('when tap save button', function () {
      beforeEach(function () {
        spyObj = spyOn(chrome.storage.sync, "set")
        $("#save").click()
      })
      it('should save height', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "", height: "200" })
      })
    })
  })
  describe('when input width and height', function () {
    beforeEach(function () {
      $("#width").val("200")
      $("#height").val("200")
    })
    describe('when tap save button', function () {
      beforeEach(function () {
        spyObj = spyOn(chrome.storage.sync, "set")
        $("#save").click()
      })
      it('should save width and height', function () {
        expect(spyObj).toHaveBeenCalledWith({ width: "200", height: "200" })
      });
    })
  })
})