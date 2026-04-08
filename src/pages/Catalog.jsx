import { useState, lazy, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '../components/Header'
import Tabs from '../components/Tabs'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import GoldenLoader from '../components/GoldenLoader'
import styles from './Catalog.module.css'

const ProductModal = lazy(() => import('../components/ProductModal'))
const LoginModal   = lazy(() => import('../components/LoginModal'))
const ConfirmDialog = lazy(() => import('../components/ConfirmDialog'))

const SKELETON_COUNT = 8

export default function Catalog({ user, sections, products, loading, signIn, signOut, createProduct, updateProduct, deleteProduct, createSection, updateSection, deleteSection }) {
  const [activeTab, setActiveTab] = useState('all')
  const [showLogin, setShowLogin] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editProduct, setEditProduct] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  const filtered = activeTab === 'all'
    ? products
    : products.filter(p => p.section_id === activeTab)

  const handleLogin = async (email, password) => {
    await signIn(email, password)
    setShowLogin(false)
  }

  const handleNew = () => { setEditProduct(null); setShowForm(true) }
  const handleEdit = (p) => { setEditProduct(p); setShowForm(true) }

  const handleSave = async (id, form, sizes, colors) => {
    if (id) await updateProduct(id, form, sizes, colors)
    else     await createProduct(form, sizes, colors)
  }

  const handleConfirmDelete = async () => {
    if (deleteId) { await deleteProduct(deleteId); setDeleteId(null) }
  }

  return (
    <div className={styles.root}>
      {/* ── Background decorativo ── */}
      <div className={styles.bgLayer} aria-hidden="true">
        <div className={styles.bgGlow1} />
        <div className={styles.bgGlow2} />
        <div className={styles.bgGlow3} />
        <div className={styles.bgWatermark}>KB</div>
        <div className={styles.bgGrid} />
      </div>

      <GoldenLoader visible={loading} />

      <Header
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={signOut}
        onNewProduct={handleNew}
      />

      <Tabs sections={sections} activeTab={activeTab} onTabChange={setActiveTab} isAdmin={!!user} onDeleteSection={deleteSection} onUpdateSection={updateSection} />

      {/* Skeleton — mostra enquanto carrega sem bloquear */}
      {loading ? (
        <div className={styles.grid}>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.div
              key="empty"
              className={styles.empty}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className={styles.emptyIcon}>◈</div>
              <p className={styles.emptyText}>Nenhum produto encontrado</p>
              {user && (
                <button className="btn btn-primary" style={{ marginTop: 24 }} onClick={handleNew}>
                  Adicionar produto
                </button>
              )}
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              className={styles.grid}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              {filtered.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isAdmin={!!user}
                  onEdit={handleEdit}
                  onDelete={setDeleteId}
                  index={i}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      <Suspense fallback={null}>
        <AnimatePresence>
          {showLogin && (
            <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
          )}
          {showForm && (
            <ProductModal
              product={editProduct}
              sections={sections}
              onClose={() => setShowForm(false)}
              onSave={handleSave}
              onCreateSection={createSection}
            />
          )}
          {deleteId && (
            <ConfirmDialog
              message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteId(null)}
            />
          )}
        </AnimatePresence>
      </Suspense>
    </div>
  )
}
