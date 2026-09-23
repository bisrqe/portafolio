// Small, stable string hash (djb2) used to detect when the English base text changed
export function textHash(text = '') {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}
