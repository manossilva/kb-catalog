const CACHE = 'kb-img-v2'

// Só imagens estáticas — nunca chamadas REST/auth/realtime do Supabase
function isImage(url) {
  if (url.includes('lh3.googleusercontent.com')) return true
  // Supabase Storage public object URLs: …/storage/v1/object/public/…
  if (url.includes('.supabase.co/storage/v1/object/public/')) return true
  return false
}

// Estratégia cache-first: serve do cache se disponível, senão busca e armazena
self.addEventListener('fetch', (event) => {
  if (!isImage(event.request.url)) return

  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(event.request)
      if (cached) return cached

      try {
        const response = await fetch(event.request)
        if (response.ok) cache.put(event.request, response.clone())
        return response
      } catch {
        return cached || new Response('', { status: 408 })
      }
    })
  )
})

// Limpa caches antigos ao ativar nova versão do SW
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
})
