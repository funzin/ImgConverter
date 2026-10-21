import { canonicalSize, decideSave } from "../pure/css-size"

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

function setText(size: StorageItems): void {
  const width = document.getElementById("width")
  const height = document.getElementById("height")
  if (width instanceof HTMLInputElement) {
    width.value = canonicalSize(size.width)
  }
  if (height instanceof HTMLInputElement) {
    height.value = canonicalSize(size.height)
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
  const width = requireInput("width")
  const height = requireInput("height")
  const decision = decideSave(width.value, height.value)
  const fields = { width, height }
  width.removeAttribute("aria-invalid")
  height.removeAttribute("aria-invalid")
  if (!decision.save) {
    for (const name of decision.invalid) {
      fields[name].setAttribute("aria-invalid", "true")
    }
    fields[decision.invalid[0]].focus()
    const names = decision.invalid.map(function (name) {
      return labelName(fields[name])
    })
    const hint = document.getElementById("size-hint")
    if (!(hint instanceof HTMLElement)) {
      throw new TypeError("Cannot read properties of null (reading 'textContent')")
    }
    showStatus(names.join(" and ") + ": " + String(hint.textContent) + " Nothing was saved.")
    return
  }
  const size = {
    width: decision.width,
    height: decision.height,
  }
  chrome.storage.sync.set(size);
  (globalThis as OptionsGlobals).setText(size)
  showStatus("Saved", 2000)
}
