export const title = "Which saved size a click uses"

export const colors = {
  Waiting: "tan",
  Reading: "yellow",
  Converted: "teal",
}

export const state = (v) => {
  if (v.phase !== "idle" && v.holding) return "Converted, and a click is still reading"
  if (v.phase !== "idle") return "Reading the saved size"
  if (v.holding && v.applied === "width") return "Converted with the saved width"
  if (v.holding) return "Converted with the default width"
  return "Waiting for a click"
}

export const group = (v) => {
  const label = state(v)
  if (label === "Waiting for a click") return "Waiting"
  if (label === "Reading the saved size" || label === "Converted, and a click is still reading") return "Reading"
  return "Converted"
}

const sizeWord = {
  default: "the default width",
  width: "the saved width",
}

export const step = (action, _from, to) => {
  if (action === "ClickIcon") return "you click the icon"
  if (action === "EditBack") return "you change the text"
  if (action === "ApplyConversion") {
    if (to.note === "skipped") return "the field stays as it is"
    const size = sizeWord[to.applied] ?? "the saved size"
    return `the field converts [with ${size}]`
  }
  return null
}
