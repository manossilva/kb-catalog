/**
 * Retorna URL direta da imagem normalizada para lh3 (Google Drive) ou Supabase.
 * @param {string} url  — URL original
 * @param {number} [w]  — largura máxima em px (ex: 700). lh3 redimensiona no servidor.
 */
export function getImageUrl(url, w) {
  if (!url) return ''

  const suffix = w ? `=w${w}` : ''

  // ── Google Drive ──────────────────────────────────────────────────────────
  // lh3.googleusercontent.com suporta =w{N} para limitar a largura
  const fileMatch = url.match(/drive\.google\.com\/file\/d\/([^/?]+)/)
  if (fileMatch) return `https://lh3.googleusercontent.com/d/${fileMatch[1]}${suffix}`

  const openMatch = url.match(/drive\.google\.com\/open\?.*?id=([^&]+)/)
  if (openMatch) return `https://lh3.googleusercontent.com/d/${openMatch[1]}${suffix}`

  const ucMatch = url.match(/drive\.google\.com\/uc\?.*?id=([^&]+)/)
  if (ucMatch) return `https://lh3.googleusercontent.com/d/${ucMatch[1]}${suffix}`

  // Já convertido para lh3 — remove qualquer =w{N} residual e reaplica
  const lh3Match = url.match(/lh3\.googleusercontent\.com\/d\/([^=?]+)/)
  if (lh3Match) return `https://lh3.googleusercontent.com/d/${lh3Match[1]}${suffix}`

  // ── Supabase Storage ──────────────────────────────────────────────────────
  // Serve direto — as imagens já chegam comprimidas em WebP pelo Canvas no upload.
  // O endpoint /render/image/ só existe no plano Pro; no free retorna 400.
  if (url.includes('.supabase.co/storage/')) {
    return url
  }

  return url
}
