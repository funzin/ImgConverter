export type CssSize = string & { readonly __brand: "CssSize" }

export type StorageRecord = { readonly [key: string]: unknown }

export type SizeParams = {
  readonly width: CssSize | null
  readonly height: CssSize | null
}

export type AppliedSize =
  | { readonly width: CssSize; readonly height: CssSize | null }
  | { readonly width: null; readonly height: CssSize }

export type FieldName = "width" | "height"

export type SaveDecision =
  | {
      readonly save: true
      readonly width: "" | CssSize
      readonly height: "" | CssSize
    }
  | {
      readonly save: false
      readonly invalid: readonly [FieldName, ...FieldName[]]
    }

const sizePattern = /^(\d+)(px|%)?$/i

function parseCssSize(raw: unknown): CssSize | null {
  if (raw == null) return null
  const text = String(raw).trim()
  const match = sizePattern.exec(text)
  if (match == null || match[1] == null) return null
  return (match[1] + (match[2] ? match[2].toLowerCase() : "")) as CssSize
}

function storedSize(text: string): "" | CssSize | null {
  if (String(text).trim() === "") return ""
  return parseCssSize(text)
}

export function canonicalSize(raw: unknown): CssSize | "" {
  return parseCssSize(raw) ?? ""
}

export function decideSave(widthText: string, heightText: string): SaveDecision {
  const width = storedSize(widthText)
  const height = storedSize(heightText)
  if (width == null && height == null) {
    return { save: false, invalid: ["width", "height"] }
  }
  if (width == null) {
    return { save: false, invalid: ["width"] }
  }
  if (height == null) {
    return { save: false, invalid: ["height"] }
  }
  return { save: true, width, height }
}

export function createParams(storage: StorageRecord): AppliedSize {
  const width = parseCssSize(storage.width)
  const height = parseCssSize(storage.height)
  if (width == null) {
    if (height == null) {
      const fallback = parseCssSize("50%")
      if (fallback == null) {
        throw new Error("50% is a valid size")
      }
      return { width: fallback, height: null }
    }
    return { width: null, height }
  }
  return { width, height }
}
