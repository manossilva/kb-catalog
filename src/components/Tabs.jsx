import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import styles from './Tabs.module.css'

function SectionMenu({ section, onEdit, onDelete }) {
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(section.name)
  const [saving, setSaving] = useState(false)
  const [dropPos, setDropPos] = useState({ top: 0, left: 0 })
  const triggerRef = useRef()
  const inputRef = useRef()

  // Calcula posição do dropdown baseado no botão ⋮
  const openMenu = (e) => {
    e.stopPropagation()
    const rect = triggerRef.current.getBoundingClientRect()
    setDropPos({
      top: rect.bottom + 6,
      left: rect.left + rect.width / 2,
    })
    setOpen(v => !v)
  }

  // Fecha ao clicar fora
  useEffect(() => {
    if (!open) return
    const handler = () => setOpen(false)
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Foca o input ao abrir edição
  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  const handleEdit = (e) => {
    e.stopPropagation()
    setName(section.name)
    setEditing(true)
    setOpen(false)
  }

  const handleSave = async () => {
    const trimmed = name.trim()
    if (!trimmed || trimmed === section.name) { setEditing(false); return }
    setSaving(true)
    try {
      await onEdit(section.id, trimmed)
    } catch (err) {
      alert('Erro ao renomear: ' + err.message)
    }
    setSaving(false)
    setEditing(false)
  }

  const handleDelete = async (e) => {
    e.stopPropagation()
    setOpen(false)
    if (!window.confirm(`Excluir a seção "${section.name}"?\nOs produtos desta seção não serão apagados.`)) return
    try {
      await onDelete(section.id)
    } catch (err) {
      alert('Erro ao excluir: ' + err.message)
    }
  }

  return (
    <span className={styles.menuWrap} onClick={e => e.stopPropagation()}>
      {editing ? (
        <span className={styles.editInline}>
          <input
            ref={inputRef}
            className={styles.editInput}
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') setEditing(false)
            }}
            disabled={saving}
          />
          <button className={styles.editSave} onClick={handleSave} disabled={saving}>
            {saving ? '…' : '✓'}
          </button>
          <button className={styles.editCancel} onClick={() => setEditing(false)}>✕</button>
        </span>
      ) : (
        <>
          <button
            ref={triggerRef}
            className={styles.menuTrigger}
            onClick={openMenu}
            title="Opções da seção"
          >
            ⋮
          </button>

          {open && createPortal(
            <motion.div
              className={styles.dropdownPortal}
              style={{ top: dropPos.top, left: dropPos.left }}
              initial={{ opacity: 0, y: -6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.12 }}
              onMouseDown={e => e.stopPropagation()}
            >
              <button className={styles.dropItem} onClick={handleEdit}>
                <span>✏</span> Renomear
              </button>
              <div className={styles.dropSep} />
              <button className={`${styles.dropItem} ${styles.dropDanger}`} onClick={handleDelete}>
                <span>🗑</span> Excluir
              </button>
            </motion.div>,
            document.body
          )}
        </>
      )}
    </span>
  )
}

export default function Tabs({ sections, activeTab, onTabChange, isAdmin, onDeleteSection, onUpdateSection }) {
  const sorted = [...sections].sort((a, b) => a.name.localeCompare(b.name))
  const tabs = [{ id: 'all', name: 'Todos', fixed: true }, ...sorted]

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
              <SectionMenu
                section={t}
                onEdit={onUpdateSection}
                onDelete={onDeleteSection}
              />
            )}
          </button>
        ))}
      </div>
      <div className={styles.border} />
    </div>
  )
}
