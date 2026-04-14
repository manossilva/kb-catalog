/**
 * Retorna URL direta da imagem normalizada para lh3 (Google Drive) ou Supabase.
 * @param {string} url — URL original
 */
export function getImageUrl(url) {
  if (!url) return ''

  // ── Google Drive ──────────────────────────────────────────────────────────
  // lh3.googleusercontent.com suporta =w{N} para limitar a largura
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}`

  const openMatch = url.match(/drive\.google\.com\/open\?.*?id=([^&]+)/)
  if (openMatch) return `https://lh3.googleusercontent.com/d/${openMatch[1]}`

  const ucMatch = url.match(/drive\.google\.com\/uc\?.*?id=([^&]+)/)
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}`

  // Já convertido para lh3 — remove qualquer =w{N} residual
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([^=?]+)/)
  if (lh3Match) return `https://lh3.googleusercontent.com/d/${lh3Match[1]}`

  // ── Supabase Storage ──────────────────────────────────────────────────────
  // Serve direto — as imagens já chegam comprimidas em WebP pelo Canvas no upload.
  // O endpoint /render/image/ só existe no plano Pro; no free retorna 400.
  if (url.includes('.supabase.co/storage/')) {
    return url
  }

  return url
}
