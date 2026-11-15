export const title = "Toolbar click when the tab has no id"

export const colors = {
  Waiting: "tan",
  Injected: "teal",
  Ignored: "orange",
}

export const state = (v) => {
  if (v.script === "injected") return "Converter script injected"
  if (v.script === "ignored" && v.tab) return "Tab is back"
  if (v.script === "ignored") return "Click ignored"
  if (v.tab) return "Waiting for a click"
  return "This tab has no id"
}

export const group = (v) => {
  const label = state(v)
  if (label === "Converter script injected") return "Injected"
  if (label === "Click ignored" || label === "Tab is back") return "Ignored"
  return "Waiting"
}

export const step = (action, _from, to) => {
  if (action === "Click" && to.script === "injected") return "you click the icon"
  if (action === "Click" && to.script === "ignored") return "you click the icon [and this tab has no id]"
  if (action === "HideTab") return "the tab goes away"
  if (action === "ShowTab") return "a tab is current"
  return null
}
