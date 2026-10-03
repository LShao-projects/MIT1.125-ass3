export function isEditorId(id: string, allowlist = "", isDevelopment = false) {
  if (id === "local_seedy" && !isDevelopment) return false;
  return allowlist.split(",").map(x => x.trim()).filter(Boolean).includes(id);
}
