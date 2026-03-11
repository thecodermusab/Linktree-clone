export const PUBLIC_SITE_ORIGIN = 'https://maahir03.me'

export function getProfileHandle(displayName?: string | null) {
  const normalized = (displayName || 'maahir')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')

  return normalized || 'maahir'
}

export function getProfilePath(displayName?: string | null) {
  return `/${getProfileHandle(displayName)}`
}

export function getPublicProfileUrl(displayName?: string | null, origin = PUBLIC_SITE_ORIGIN) {
  return `${origin.replace(/\/+$/, '')}${getProfilePath(displayName)}`
}
