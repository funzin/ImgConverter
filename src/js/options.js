loadStorage()

function loadStorage() {
  chrome.storage.sync.get(function (size) {
    setText(size)
  })
}

function acceptedSize(raw) {
  if (raw == null) return null
  var text = String(raw).trim()
  var match = /^(\d+)(px|%)?$/i.exec(text)
  if (!match) return null
  return match[1] + (match[2] ? match[2].toLowerCase() : "")
}

function setText(size) {
  const width = document.getElementById('width');
  const height = document.getElementById('height');
  if (width) {
    var parsedWidth = acceptedSize(size.width)
    width.value = parsedWidth == null ? '' : parsedWidth
  }
  if (height) {
    var parsedHeight = acceptedSize(size.height)
    height.value = parsedHeight == null ? '' : parsedHeight
  }
}

document.addEventListener('click', function (event) {
  const target = event.target;
  if (target && target.closest && target.closest('#save')) {
    saveSize();
  }
});

function saveSize() {
  const size = {
    width: acceptedSize(document.getElementById('width').value) || "",
    height: acceptedSize(document.getElementById('height').value) || "",
  }
  chrome.storage.sync.set(size)
  setText(size)
}
