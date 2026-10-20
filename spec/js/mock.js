mockStorageData = {width: "100", height: "0"}

chrome = {
  storage: {
    sync: {
      set: function() {
      },
      get: function(method) {
        method(mockStorageData)
      }
    }
  }
};