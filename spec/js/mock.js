var mockStorageData = {width: "100", height: "0"}

chrome = {
  storage: {
    sync: {
      set: function(size) {
      },
      get: function(method) {
        method(mockStorageData)
      }
    }
  }
};