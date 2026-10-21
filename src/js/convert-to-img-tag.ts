import { classicGlobals, convertEditorText } from "../pure/convert"

const page = globalThis as typeof globalThis & {
  convertToImgTag: typeof classicGlobals.convertToImgTag
  convertOnlySelectionToImgTag: typeof classicGlobals.convertOnlySelectionToImgTag
  createParams: typeof classicGlobals.createParams
  createMarkdownImages: typeof classicGlobals.createMarkdownImages
}
page.convertToImgTag = classicGlobals.convertToImgTag
page.convertOnlySelectionToImgTag = classicGlobals.convertOnlySelectionToImgTag
page.createParams = classicGlobals.createParams
page.createMarkdownImages = classicGlobals.createMarkdownImages

chrome.storage.sync.get(function (storage) {
  const activeTextElement = document.activeElement
  if (activeTextElement == null) { return }
  const textAreaStr = controlValue(activeTextElement)
  if (textAreaStr == undefined) { return }
  const replacedText = convertEditorText(textAreaStr, storage, selectionBounds(activeTextElement))

  if (replacedText != null) {
    // Assigning value skips the editor's input handler, so React reverts
    // the conversion on preview. insertText is an undoable edit.
    callOn(activeTextElement, "focus")
    callOn(activeTextElement, "select")
    document.execCommand("insertText", false, replacedText)
  }
})

function controlValue(el: Element): string | undefined {
  if (!("value" in el)) return undefined
  const value: unknown = Reflect.get(el, "value")
  return typeof value === "string" ? value : undefined
}

function isSelectionEdge(value: unknown): value is number | null {
  return typeof value === "number" || value === null
}

function selectionBounds(el: Element): { start: number | null; end: number | null } | null {
  if (!("selectionStart" in el) || !("selectionEnd" in el)) return null
  const start: unknown = Reflect.get(el, "selectionStart")
  const end: unknown = Reflect.get(el, "selectionEnd")
  if (!isSelectionEdge(start) || !isSelectionEdge(end)) return null
  return { start, end }
}

function callOn(el: Element, name: string): void {
  const method: unknown = Reflect.get(el, name)
  if (typeof method !== "function") {
    throw new TypeError(name + " is not a function")
  }
  method.call(el)
}
