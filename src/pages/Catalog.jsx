import { useState } from 'react'
import Header from '../components/Header'
import Tabs from '../components/Tabs'
import ProductCard from '../components/ProductCard'
import ProductModal from '../components/ProductModal'
import LoginModal from '../components/LoginModal'
import ConfirmDialog from '../components/ConfirmDialog'
import styles from './Catalog.module.css'

export default function Catalog({ user, sections, products, loading, signIn, signOut, createProduct, updateProduct, deleteProduct }) {
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
    if (id) {
      await updateProduct(id, form, sizes, colors)
    } else {
      await createProduct(form, sizes, colors)
    }
  }

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deleteProduct(deleteId)
      setDeleteId(null)
    }
  }

  return (
    <div className={styles.root}>
      <Header
        user={user}
        onLogin={() => setShowLogin(true)}
        onLogout={signOut}
        onNewProduct={handleNew}
      />

      <Tabs sections={sections} activeTab={activeTab} onTabChange={setActiveTab} />

      {loading ? (
        <div className={styles.center}><div className="spinner" /></div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>Nenhum produto encontrado.</p>
          {user && (
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleNew}>
              Adicionar primeiro produto
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              isAdmin={!!user}
              onEdit={handleEdit}
              onDelete={setDeleteId}
            />
          ))}
        </div>
      )}

      {showLogin && (
        <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />
      )}

      {showForm && (
        <ProductModal
          product={editProduct}
          sections={sections}
          onClose={() => setShowForm(false)}
          onSave={handleSave}
        />
      )}

      {deleteId && (
        <ConfirmDialog
          message="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
          onConfirm={handleConfirmDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  )
}
