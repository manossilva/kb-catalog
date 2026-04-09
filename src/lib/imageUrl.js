/**
 * Retorna URL otimizada da imagem com largura máxima para economizar banda.
 * @param {string} url  — URL original
 * @param {number} width — largura máxima desejada (default 800px para cards)
 */
export function getImageUrl(url, width = 800) {
  if (!url) return ''

  // ── Google Drive ──────────────────────────────────────────────────────────
  // lh3.googleusercontent.com suporta =w{N} para limitar a largura
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}=w${width}`

  const openMatch = url.match(/drive\.google\.com\/open\?.*?id=([^&]+)/)
  if (openMatch) return `https://lh3.googleusercontent.com/d/${openMatch[1]}=w${width}`

  const ucMatch = url.match(/drive\.google\.com\/uc\?.*?id=([^&]+)/)
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}=w${width}`

  // Já convertido para lh3 (ex: /logo.png passada direto)
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([^=?]+)/)
  if (lh3Match) return `https://lh3.googleusercontent.com/d/${lh3Match[1]}=w${width}`

  // ── Supabase Storage ──────────────────────────────────────────────────────
  // Serve direto — as imagens já chegam comprimidas em WebP pelo Canvas no upload.
  // O endpoint /render/image/ só existe no plano Pro; no free retorna 400.
  if (url.includes('.supabase.co/storage/')) {
    return url
  }

  return url
}
