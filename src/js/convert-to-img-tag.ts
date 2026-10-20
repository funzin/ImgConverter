chrome.storage.sync.get(function (storage) {
  const activeTextElement = document.activeElement
  if (activeTextElement == null) { return }
  const textAreaStr = controlValue(activeTextElement)
  if (textAreaStr == undefined) { return }
  const params = createParams(storage)

  let replacedText: string | null
  const bounds = selectionBounds(activeTextElement)
  if (bounds != null && bounds.start !== bounds.end) {
    replacedText = convertOnlySelectionToImgTag(textAreaStr, params, bounds.start, bounds.end)
  } else {
    replacedText = convertToImgTag(textAreaStr, params)
  }

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

type SizeParams = { width: CssSize | null; height: CssSize | null }
type ConvertParams = SizeParams | "" | null | undefined

function convertOnlySelectionToImgTag(text: string, params: ConvertParams, start: number | null, end: number | null): string | null {
  const selectedText = text.substring(start ?? 0, end ?? 0)
  const imgTagText = convertToImgTag(selectedText, params)
  if (imgTagText == null) {
    return null
  }
  return text.substring(0, start ?? 0) + imgTagText + text.substring(end ?? 0)
}

function convertToImgTag(text: string, params: ConvertParams): string | null {
  let replacedText = text
  const mdImageArray = createMarkdownImages(text, params)

  if (mdImageArray == null) { return null }

  for (const mdImage of mdImageArray) {
    replacedText = replacedText.replace(mdImage.mdImageText, () => mdImage.imageTag)
  }

  return replacedText
}

function isParsedSize(input: string): input is CssSize {
  return /^(\d+)(px|%)?$/.test(input)
}

function parseSize(raw: unknown): CssSize | null {
  if (raw == null) return null
  const text = String(raw).trim()
  const match = /^(\d+)(px|%)?$/i.exec(text)
  if (match == null || match[1] == null) return null
  const canonical = match[1] + (match[2] ? match[2].toLowerCase() : "")
  if (!isParsedSize(canonical)) return null
  return canonical
}

function escapeAttr(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

function decodeAttr(value: string): string {
  return String(value)
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
}

function asSize(params: ConvertParams): SizeParams {
  if (params == null || params === "") return { width: null, height: null }
  return {
    width: params.width || null,
    height: params.height || null,
  }
}

function imageTag(url: string, alt: string, size: SizeParams): string {
  const attrs = [
    'src="' + escapeAttr(url) + '"',
    'alt="' + escapeAttr(alt) + '"',
  ]
  if (size.width) attrs.push('width="' + size.width + '"')
  if (size.height) attrs.push('height="' + size.height + '"')
  return "<img " + attrs.join(" ") + ">"
}

function namedGroup(match: RegExpMatchArray, name: string): string | null {
  const groups = match.groups
  if (groups == null) return null
  const value = groups[name]
  if (value == null) return null
  return value
}

function createMarkdownImages(text: string, params: ConvertParams): Array<{ url: string; mdImageText: string; imageTag: string }> | null {
  const markdownImageArray: Array<{ url: string; mdImageText: string; imageTag: string }> = []
  const size = asSize(params)

  function pushImage(url: string, sourceText: string, alt: string): void {
    markdownImageArray.push({
      url: url,
      mdImageText: sourceText,
      imageTag: imageTag(url, alt, size),
    })
  }

  const markdownImagePattern = /!\[(?<alt>(?:(?!\]\().)*)\]\((?<url>https:(?:[^\s()]|\((?:[^\s()]|\([^\s()]*\))*\))+)\)/gi
  for (const match of text.matchAll(markdownImagePattern)) {
    const markdownUrl = namedGroup(match, "url")
    const markdownAlt = namedGroup(match, "alt")
    if (markdownUrl == null || markdownAlt == null) continue
    pushImage(markdownUrl, match[0], markdownAlt)
  }

  const githubUploadPattern = /<img width="\d+" height="\d+" alt="(?<alt>[^"]*)" src="(?<url>https:\/\/github\.com\/user-attachments\/assets\/[0-9a-fA-F-]+)" \/>/gi
  for (const match of text.matchAll(githubUploadPattern)) {
    const uploadUrl = namedGroup(match, "url")
    const uploadAlt = namedGroup(match, "alt")
    if (uploadUrl == null || uploadAlt == null) continue
    pushImage(uploadUrl, match[0], decodeAttr(uploadAlt))
  }

  if (markdownImageArray.length == 0) { return null }
  return markdownImageArray
}

function createParams(storage: { [key: string]: unknown }): SizeParams {
  let width = parseSize(storage.width)
  const height = parseSize(storage.height)
  if (width == null && height == null) {
    const fallback = parseSize("50%")
    if (fallback == null) {
      throw new Error("50% is a valid size")
    }
    width = fallback
  }
  return { width: width, height: height }
}
