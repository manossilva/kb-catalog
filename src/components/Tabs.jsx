import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './Tabs.module.css'

export default function Tabs({ sections, activeTab, onTabChange, isAdmin, onDeleteSection }) {
  const sorted = [...sections].sort((a, b) => a.name.localeCompare(b.name))
  const tabs = [{ id: 'all', name: 'Todos', fixed: true }, ...sorted]
  const [deletingId, setDeletingId] = useState(null)

  const handleDelete = async (e, id) => {
    e.stopPropagation()
    if (!window.confirm('Excluir esta seção? Os produtos não serão apagados.')) return
    setDeletingId(id)
    try {
      await onDeleteSection(id)
    } catch (err) {
      alert('Erro ao excluir seção: ' + err.message)
    }
    setDeletingId(null)
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {activeTab === t.id && (
              <motion.span
                className={styles.pill}
                layoutId="tab-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={styles.label}>{t.name}</span>

            {isAdmin && !t.fixed && (
              <span
                className={styles.deleteBtn}
                onClick={e => handleDelete(e, t.id)}
                title="Excluir seção"
                aria-label="Excluir seção"
              >
                {deletingId === t.id ? '…' : '×'}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className={styles.border} />
    </div>
  )
}
