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

function storedSize(text) {
  if (String(text).trim() === "") return ""
  return acceptedSize(text)
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

var statusTimer = null

function showStatus(text, clearAfterMs) {
  clearTimeout(statusTimer)
  statusTimer = null
  document.getElementById('status').textContent = text
  if (clearAfterMs) {
    statusTimer = setTimeout(function () {
      showStatus('')
    }, clearAfterMs)
  }
}

document.addEventListener('submit', function (event) {
  if (event.target.id !== 'size-form') return
  event.preventDefault()
  saveSize()
})

function saveSize() {
  var fields = [
    document.getElementById('width'),
    document.getElementById('height')
  ]
  var stored = []
  var rejected = []
  for (var i = 0; i < fields.length; i++) {
    var value = storedSize(fields[i].value)
    stored.push(value)
    if (value == null) {
      fields[i].setAttribute('aria-invalid', 'true')
      rejected.push(fields[i])
    } else {
      fields[i].removeAttribute('aria-invalid')
    }
  }
  if (rejected.length) {
    rejected[0].focus()
    var names = rejected.map(function (field) {
      return field.labels[0].textContent
    })
    var hint = document.getElementById('size-hint').textContent
    showStatus(names.join(' and ') + ': ' + hint + ' Nothing was saved.')
    return
  }
  var size = {
    width: stored[0],
    height: stored[1]
  }
  chrome.storage.sync.set(size)
  setText(size)
  showStatus('Saved', 2000)
}
