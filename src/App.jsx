import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useAuth } from './hooks/useAuth'
import { useSections } from './hooks/useSections'
import { useProducts } from './hooks/useProducts'
import { useTheme } from './hooks/useTheme'
import { getImageUrl } from './lib/imageUrl'
import Catalog from './pages/Catalog'
import SplashScreen from './components/SplashScreen'

// Quantas imagens pré-carregar em background durante a splash
const PRELOAD_COUNT = 8

// ── Cookie helpers ──────────────────────────────
// Cookie com SameSite=Strict + Secure (em HTTPS) garante que
// o token de "já visitou" não vaze em requests cross-site.
function hasVisited() {
  try {
    if (document.cookie.split(';').some(c => c.trim().startsWith('kb-welcomed='))) return true
    return !!localStorage.getItem('kb-welcomed')
  } catch { return false }
}

function markVisited() {
  try {
    const secure = location.protocol === 'https:' ? '; Secure' : ''
    // Expira em 1 ano
    document.cookie = `kb-welcomed=1; max-age=31536000; SameSite=Strict; path=/${secure}`
    localStorage.setItem('kb-welcomed', '1')
  } catch { /* silencia em ambientes restritos */ }
}
// ───────────────────────────────────────────────

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const { sections, createSection, updateSection, deleteSection } = useSections()
  const { products, loading: prodLoading, createProduct, updateProduct, deleteProduct, toggleVisibility, reorderProduct } = useProducts()
  const { theme, toggleTheme } = useTheme()

  // Mostra a splash apenas na primeira visita ao dispositivo
  const [showSplash, setShowSplash] = useState(() => !hasVisited())

  // Pré-carrega as primeiras N imagens em background enquanto a splash está ativa.
  // O navegador coloca no cache HTTP; quando os cards renderizarem, a imagem
  // já está disponível localmente (zero latência de rede).
  useEffect(() => {
    if (products.length === 0) return
    products.slice(0, PRELOAD_COUNT).forEach(p => {
      if (p.image_url) {
        const img = new Image()
        img.src = getImageUrl(p.image_url)
      }
      // Pré-carrega também as primeiras cores de cada produto
      p.colors?.slice(0, 3).forEach(c => {
        if (c.image_url) {
          const img = new Image()
          img.src = getImageUrl(c.image_url)
        }
      })
    })
  }, [products])

  const handleEnter = () => {
    markVisited()
    setShowSplash(false)
  }

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <SplashScreen
            onEnter={handleEnter}
            productsReady={!prodLoading}
          />
        )}
      </AnimatePresence>

      <Catalog
        user={user}
        sections={sections}
        products={products}
        loading={authLoading || prodLoading}
        signIn={signIn}
        signOut={signOut}
        createProduct={createProduct}
        updateProduct={updateProduct}
        deleteProduct={deleteProduct}
        toggleVisibility={toggleVisibility}
        reorderProduct={reorderProduct}
        createSection={createSection}
        updateSection={updateSection}
        deleteSection={deleteSection}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </>
  )
}
