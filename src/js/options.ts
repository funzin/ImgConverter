type StorageItems = { [key: string]: unknown }

type OptionsGlobals = typeof globalThis & {
  loadStorage: () => void
  setText: (size: StorageItems) => void
}

(globalThis as OptionsGlobals).loadStorage = loadStorage;
(globalThis as OptionsGlobals).setText = setText;

loadStorage()

function loadStorage(): void {
  chrome.storage.sync.get(function (size) {
    (globalThis as OptionsGlobals).setText(size)
  })
}

function isAcceptedSize(input: string): input is CssSize {
  return /^(\d+)(px|%)?$/.test(input)
}

function acceptedSize(raw: unknown): CssSize | null {
  if (raw == null) return null
  const text = String(raw).trim()
  const match = /^(\d+)(px|%)?$/i.exec(text)
  if (match == null || match[1] == null) return null
  const canonical = match[1] + (match[2] ? match[2].toLowerCase() : "")
  if (!isAcceptedSize(canonical)) return null
  return canonical
}

function storedSize(text: string): "" | CssSize | null {
  if (String(text).trim() === "") return ""
  return acceptedSize(text)
}

function setText(size: StorageItems): void {
  const width = document.getElementById("width")
  const height = document.getElementById("height")
  if (width instanceof HTMLInputElement) {
    const parsedWidth = acceptedSize(size.width)
    width.value = parsedWidth == null ? "" : parsedWidth
  }
  if (height instanceof HTMLInputElement) {
    const parsedHeight = acceptedSize(size.height)
    height.value = parsedHeight == null ? "" : parsedHeight
  }
}

let statusTimer: ReturnType<typeof setTimeout> | null = null

function showStatus(text: string, clearAfterMs?: number): void {
  if (statusTimer != null) clearTimeout(statusTimer)
  statusTimer = null
  const status = document.getElementById("status")
  if (!(status instanceof HTMLElement)) {
    throw new TypeError("Cannot read properties of null (reading 'textContent')")
  }
  status.textContent = text
  if (clearAfterMs) {
    statusTimer = setTimeout(function () {
      showStatus("")
    }, clearAfterMs)
  }
}

document.addEventListener("submit", function (event) {
  const target = event.target
  if (!(target instanceof HTMLFormElement)) return
  if (target.id !== "size-form") return
  event.preventDefault()
  saveSize()
})

function requireInput(id: string): HTMLInputElement {
  const el = document.getElementById(id)
  if (el instanceof HTMLInputElement) return el
  throw new TypeError("Cannot read properties of null (reading 'value')")
}

function labelName(field: HTMLInputElement): string {
  const labels = field.labels
  if (labels == null) {
    throw new TypeError("Cannot read properties of null (reading '0')")
  }
  const label = labels[0]
  if (label == null) {
    throw new TypeError("Cannot read properties of undefined (reading 'textContent')")
  }
  return label.textContent ?? ""
}

function saveSize(): void {
  const fields = [requireInput("width"), requireInput("height")]
  const stored: Array<"" | CssSize | null> = []
  const rejected: HTMLInputElement[] = []
  for (let i = 0; i < fields.length; i++) {
    const field = fields[i]
    const value = storedSize(field.value)
    stored.push(value)
    if (value == null) {
      field.setAttribute("aria-invalid", "true")
      rejected.push(field)
    } else {
      field.removeAttribute("aria-invalid")
    }
  }
  if (rejected.length) {
    rejected[0].focus()
    const names = rejected.map(function (rejectedField) {
      return labelName(rejectedField)
    })
    const hint = document.getElementById("size-hint")
    if (!(hint instanceof HTMLElement)) {
      throw new TypeError("Cannot read properties of null (reading 'textContent')")
    }
    showStatus(names.join(" and ") + ": " + String(hint.textContent) + " Nothing was saved.")
    return
  }
  const savedWidth = stored[0]
  const savedHeight = stored[1]
  if (savedWidth == null || savedHeight == null) return
  const size = {
    width: savedWidth,
    height: savedHeight,
  }
  chrome.storage.sync.set(size);
  (globalThis as OptionsGlobals).setText(size)
  showStatus("Saved", 2000)
}
