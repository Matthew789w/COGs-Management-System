export function resolveProfilePhotoUrl(url) {
  if (!url) return null

  if (url.startsWith('/storage/')) {
    return url
  }

  try {
    const parsed = new URL(url, window.location.origin)

    if (parsed.pathname.startsWith('/storage/')) {
      return `${parsed.pathname}${parsed.search}`
    }
  } catch {
    return url
  }

  return url
}
