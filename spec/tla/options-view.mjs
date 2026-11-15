export const title = "ImgConverter options"

export const colors = {
  Closed: "tan",
  Loading: "yellow",
  Editing: "blue",
  Saved: "teal",
  Rejected: "orange",
  Ready: "purple",
}

export const state = (v) => {
  if (!v.open) return "Options closed"
  if (v.status === "rejected") return "Save rejected"
  if (v.draft) return "Editing a size"
  if (v.status === "saved") return "Saved"
  if (v.loading && !v.hydrated) return "Loading the stored size"
  return "Shows the stored size"
}

export const group = (v) => {
  const label = state(v)
  if (label === "Options closed") return "Closed"
  if (label === "Editing a size") return "Editing"
  if (label === "Save rejected") return "Rejected"
  if (label === "Saved") return "Saved"
  if (label === "Shows the stored size") return "Ready"
  return "Loading"
}

export const step = (action) => {
  if (action === "OpenOptions") return "you open options"
  if (action === "LoadReturns") return "the stored size appears"
  if (action === "EditFields") return "you type a size"
  if (action === "SaveSize") return "you click Save [and the size is valid]"
  if (action === "RejectSize") return "you click Save [and the size is not a number]"
  if (action === "FadeSaved") return "the Saved message fades"
  return null
}
