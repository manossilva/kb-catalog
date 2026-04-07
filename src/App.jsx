import { useAuth } from './hooks/useAuth'
import { useSections } from './hooks/useSections'
import { useProducts } from './hooks/useProducts'
import Catalog from './pages/Catalog'

export default function App() {
  const { user, loading: authLoading, signIn, signOut } = useAuth()
  const { sections, createSection } = useSections()
  const { products, loading: prodLoading, createProduct, updateProduct, deleteProduct } = useProducts()

  return (
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
      createSection={createSection}
    />
  )
}
