const CACHE = 'kb-img-v1'

// Padrões de URL que devem ser cacheados
const IMG_ORIGINS = [
  'lh3.googleusercontent.com',
  '.supabase.co',
]

function isImage(url) {
  return IMG_ORIGINS.some(o => url.includes(o))
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
