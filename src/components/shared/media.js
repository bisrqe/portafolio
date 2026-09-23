// Supports both the legacy single `image` field and the `images` array
export function getImages(item) {
  if (Array.isArray(item?.images) && item.images.length > 0) return item.images.filter(Boolean)
  return item?.image ? [item.image] : []
}

// Framing chosen in the admin (drag + zoom) applied to the <img>
export function framingStyle(item) {
  const x = item?.positionX || 0
  const y = item?.positionY || 0
  const zoom = item?.zoom || 1
  if (!x && !y && zoom === 1) return undefined
  return { transform: `translate(${x}%, ${y}%) scale(${zoom})` }
}
