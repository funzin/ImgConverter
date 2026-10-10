loadStorage()

function loadStorage() {
  chrome.storage.sync.get(function (size) {
    setText(size)
  })
}

function setText(size) {
  const width = document.getElementById('width');
  const height = document.getElementById('height');
  if (width) {
    width.value = size.width == null ? '' : size.width;
  }
  if (height) {
    height.value = size.height == null ? '' : size.height;
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
    width: document.getElementById('width').value,
    height: document.getElementById('height').value,
  }
  chrome.storage.sync.set(size);
}
