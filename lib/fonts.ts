const LOCAL_FONT_NAMES = new Set([
  'Link Sans',
  'Link Sans Product',
  'Link Sans v2.2 Variable',
])

export function buildGoogleFontsStylesheetUrl(...fonts: Array<string | null | undefined>) {
  const families = [...new Set(
    fonts
      .map(font => font?.trim())
      .filter((font): font is string => Boolean(font))
      .filter(font => !LOCAL_FONT_NAMES.has(font))
  )]

  if (families.length === 0) {
    return null
  }

  return `https://fonts.googleapis.com/css2?${families
    .map(font => `family=${encodeURIComponent(font)}`)
    .join('&')}&display=swap`
}
