/**
 * Converts Google Drive share links to direct image URLs.
 * Passes through any other URL unchanged.
 */
export function getImageUrl(url) {
  if (!url) return ''

  // https://drive.google.com/file/d/FILE_ID/view
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`

  // https://drive.google.com/open?id=FILE_ID
  const openMatch = url.match(/drive\.google\.com\/open\?.*?id=([^&]+)/)
  if (openMatch) return `https://lh3.googleusercontent.com/d/${openMatch[1]}`

  // https://drive.google.com/uc?export=view&id=FILE_ID  (old format)
  const ucMatch = url.match(/drive\.google\.com\/uc\?.*?id=([^&]+)/)
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`

  return url
}
