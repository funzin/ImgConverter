export const title = "ImgConverter toolbar click"

export const colors = {
  Waiting: "tan",
  Reading: "yellow",
  Converted: "teal",
  Skipped: "orange",
}

export const state = (v) => {
  if (v.phase !== "idle" && (v.field === "whole" || v.field === "selection")) {
    return "Converted, and a click is still reading"
  }
  if (v.phase !== "idle") return "Reading the saved size"
  if (v.field === "whole") return "Whole field converted"
  if (v.field === "selection") return "Selection converted"
  if (v.note === "skipped") return "Field left unchanged"
  return "Waiting for a click"
}

export const group = (v) => {
  const label = state(v)
  if (label === "Waiting for a click") return "Waiting"
  if (label === "Reading the saved size" || label === "Converted, and a click is still reading") {
    return "Reading"
  }
  if (label === "Whole field converted" || label === "Selection converted") return "Converted"
  return "Skipped"
}

export const step = (action, _from, to) => {
  if (action === "ClickIcon") return "you click the icon"
  if (action === "EditText") return "you change the text"
  if (action === "ApplyConversion") {
    if (to.note === "skipped") return "the field stays as it is"
    if (to.field === "whole") return "the whole field converts"
    if (to.field === "selection") return "the selection converts"
    return "the field stays as it is"
  }
  return null
}
