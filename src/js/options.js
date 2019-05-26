loadStorage()


function loadStorage() {
  chrome.storage.sync.get(function (size) {
    setText(size)
  })
}

function setText(size) {
  $("#width").val(size.width);
  $("#height").val(size.height);
}

$(document).on('click','#save', function() {
    saveSize()
})

function saveSize() {
  const width = $("#width").val();
  const height = $("#height").val();
  const size = {
    width: width,
    height: height,
  }
  chrome.storage.sync.set(size);
}