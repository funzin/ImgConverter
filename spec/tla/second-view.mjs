export const title = "Two clicks before the first one finishes"

export const colors = {
  Waiting: "tan",
  Reading: "yellow",
  Converted: "teal",
}

export const state = (v) => {
  const queued = v.queued
  if (queued > 0 && v.field === "converted") return "Converted, and a click is still reading"
  if (queued > 1) return "Two clicks are reading"
  if (queued === 1) return "Reading the saved size"
  if (v.field === "converted") return "Field converted"
  return "Waiting for a click"
}

export const group = (v) => {
  const label = state(v)
  if (label === "Field converted") return "Converted"
  if (label === "Waiting for a click") return "Waiting"
  return "Reading"
}

export const step = (action, from, to) => {
  if (action === "Click") return "you click the icon"
  if (action === "Deliver" && from.field === "picture" && to.field === "converted") {
    return "the field converts"
  }
  if (action === "Deliver") return "the field stays as it is"
  return null
}
