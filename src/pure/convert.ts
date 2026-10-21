import { createParams, type AppliedSize, type SizeParams, type StorageRecord } from "./css-size"

export type TextRange = {
  readonly start: number | null
  readonly end: number | null
}

export type ConvertParams = SizeParams | "" | null | undefined

export type RenderedImage = {
  url: string
  mdImageText: string
  imageTag: string
}

export function convertEditorText(
  text: string,
  storage: StorageRecord,
  bounds: TextRange | null,
): string | null {
  const params = createParams(storage)
  if (bounds != null && bounds.start !== bounds.end) {
    return convertOnlySelectionToImgTag(text, params, bounds.start, bounds.end)
  }
  return convertToImgTag(text, params)
}

function convertOnlySelectionToImgTag(
  text: string,
  params: ConvertParams,
  start: number | null,
  end: number | null,
): string | null {
  const selectedText = text.substring(start ?? 0, end ?? 0)
  const imgTagText = convertToImgTag(selectedText, params)
  if (imgTagText == null) return null
  return text.substring(0, start ?? 0) + imgTagText + text.substring(end ?? 0)
}

function convertToImgTag(text: string, params: ConvertParams): string | null {
  let replacedText = text
  const mdImageArray = createMarkdownImages(text, params)
  if (mdImageArray == null) return null
  for (const mdImage of mdImageArray) {
    replacedText = replacedText.replace(mdImage.mdImageText, () => mdImage.imageTag)
  }
  return replacedText
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

function createMarkdownImages(text: string, params: ConvertParams): RenderedImage[] | null {
  const markdownImageArray: RenderedImage[] = []
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

  if (markdownImageArray.length == 0) return null
  return markdownImageArray
}

export const classicGlobals: {
  readonly convertToImgTag: (text: string, params: ConvertParams) => string | null
  readonly convertOnlySelectionToImgTag: (
    text: string,
    params: ConvertParams,
    start: number | null,
    end: number | null,
  ) => string | null
  readonly createParams: (storage: StorageRecord) => AppliedSize
  readonly createMarkdownImages: (
    text: string,
    params: ConvertParams,
  ) => RenderedImage[] | null
} = {
  convertToImgTag,
  convertOnlySelectionToImgTag,
  createParams,
  createMarkdownImages,
}
