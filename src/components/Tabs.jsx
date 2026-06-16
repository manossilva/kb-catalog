import { useState, useRef, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import styles from './Tabs.module.css'

function SectionMenu({ section, arRatio, onARChange, onEdit, onDelete, canMoveLeft, onMoveLeft, canMoveRight, onMoveRight }) {
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
              {/* Reordenação */}
              <button
                className={styles.dropItem}
                disabled={!canMoveLeft}
                onClick={(e) => { e.stopPropagation(); onMoveLeft?.(); setOpen(false) }}
              >
                <span>←</span> Mover para esquerda
              </button>
              <button
                className={styles.dropItem}
                disabled={!canMoveRight}
                onClick={(e) => { e.stopPropagation(); onMoveRight?.(); setOpen(false) }}
              >
                <span>→</span> Mover para direita
              </button>
              <div className={styles.dropSep} />

              <button className={styles.dropItem} onClick={handleEdit}>
                <span>✏</span> Renomear
              </button>
              <div className={styles.dropSep} />
              <button
                className={`${styles.dropItem} ${arRatio === 'square' ? styles.dropActive : ''}`}
                onClick={(e) => { e.stopPropagation(); onARChange(section.id, 'square'); setOpen(false) }}
              >
                <span>⬜</span> Foto 1:1 (quadrada)
              </button>
              <button
                className={`${styles.dropItem} ${arRatio === 'tall' ? styles.dropActive : ''}`}
                onClick={(e) => { e.stopPropagation(); onARChange(section.id, 'tall'); setOpen(false) }}
              >
                <span>▯</span> Foto 2:3 (retrato)
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

export default function Tabs({ sections, activeTab, onTabChange, isAdmin, onDeleteSection, onUpdateSection, getAR, onUpdateSectionAR, onReorderSection }) {
  // sections já vêm ordenadas por sort_order do Supabase — não reordenar aqui
  const tabsRef = useRef(null)
  const trackRef = useRef(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [thumb, setThumb] = useState({ left: 0, width: 100, visible: false })

  const tabsDrag = useRef({ active: false, moved: false, startX: 0, startScroll: 0 })
  const thumbDrag = useRef({ active: false, startX: 0, startScroll: 0 })

  const updateScroll = useCallback(() => {
    const el = tabsRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2)

    const ratio = clientWidth / scrollWidth
    if (ratio >= 0.99) {
      setThumb({ visible: false, left: 0, width: 100 })
    } else {
      const w = Math.max(ratio * 100, 10)
      const maxScroll = scrollWidth - clientWidth
      const l = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - w) : 0
      setThumb({ visible: true, left: l, width: w })
    }
  }, [])

  useEffect(() => {
    const el = tabsRef.current
    if (!el) return
    updateScroll()
    el.addEventListener('scroll', updateScroll, { passive: true })
    const ro = new ResizeObserver(updateScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', updateScroll)
      ro.disconnect()
    }
  }, [updateScroll, sections])

  // Handlers globais de mouse/touch para arrastar abas e thumb
  useEffect(() => {
    const onMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX

      if (tabsDrag.current.active) {
        const dx = clientX - tabsDrag.current.startX
        if (Math.abs(dx) > 5) {
          tabsDrag.current.moved = true
          if (tabsRef.current) tabsRef.current.scrollLeft = tabsDrag.current.startScroll - dx
        }
      }

      if (thumbDrag.current.active && tabsRef.current && trackRef.current) {
        const el = tabsRef.current
        const trackWidth = trackRef.current.clientWidth
        const thumbWidthPx = (el.clientWidth / el.scrollWidth) * trackWidth
        const maxThumbLeft = trackWidth - thumbWidthPx
        const scrollRange = el.scrollWidth - el.clientWidth
        const dxPx = clientX - thumbDrag.current.startX
        const scrollPerPx = maxThumbLeft > 0 ? scrollRange / maxThumbLeft : 1
        el.scrollLeft = Math.max(0, Math.min(scrollRange, thumbDrag.current.startScroll + dxPx * scrollPerPx))
      }
    }

    const onUp = () => {
      tabsDrag.current.active = false
      thumbDrag.current.active = false
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    window.addEventListener('touchmove', onMove, { passive: true })
    window.addEventListener('touchend', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onUp)
    }
  }, [])

  const onTabsMouseDown = (e) => {
    if (e.button !== 0) return
    tabsDrag.current = { active: true, moved: false, startX: e.clientX, startScroll: tabsRef.current.scrollLeft }
  }

  // Bloqueia click nos tabs quando houve arrasto real
  const onTabsClickCapture = (e) => {
    if (tabsDrag.current.moved) {
      e.stopPropagation()
      e.preventDefault()
      tabsDrag.current.moved = false
    }
  }

  const onThumbMouseDown = (e) => {
    e.stopPropagation()
    e.preventDefault()
    thumbDrag.current = { active: true, startX: e.clientX, startScroll: tabsRef.current.scrollLeft }
  }

  const onThumbTouchStart = (e) => {
    e.stopPropagation()
    thumbDrag.current = { active: true, startX: e.touches[0].clientX, startScroll: tabsRef.current.scrollLeft }
  }

  const onTrackClick = (e) => {
    const track = trackRef.current
    const el = tabsRef.current
    if (!track || !el) return
    const rect = track.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth)
  }

  const scrollBy = (dir) => {
    tabsRef.current?.scrollBy({ left: dir * 160, behavior: 'smooth' })
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.tabsOuter}>
        {canScrollLeft && (
          <div className={`${styles.fade} ${styles.fadeLeft}`}>
            <button className={styles.arrowBtn} onClick={() => scrollBy(-1)} tabIndex={-1}>‹</button>
          </div>
        )}

        <div
          ref={tabsRef}
          className={styles.tabs}
          onMouseDown={onTabsMouseDown}
          onClickCapture={onTabsClickCapture}
        >
          {/* Aba "Todos" — sempre primeira e fixa */}
          <button
            className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
            onClick={() => onTabChange('all')}
          >
            {activeTab === 'all' && (
              <motion.span
                className={styles.pill}
                layoutId="tab-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={styles.label}>Todos</span>
          </button>

          {/* Abas de seções — ordenadas por sort_order, reordenáveis pelo admin */}
          {sections.map((t, i) => (
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

              {isAdmin && (
                <SectionMenu
                  section={t}
                  arRatio={getAR(t.id, t.name)}
                  onARChange={onUpdateSectionAR}
                  onEdit={onUpdateSection}
                  onDelete={onDeleteSection}
                  canMoveLeft={i > 0}
                  onMoveLeft={() => onReorderSection(
                    t.id, t.sort_order ?? (i + 1) * 10,
                    sections[i - 1].id, sections[i - 1].sort_order ?? i * 10
                  )}
                  canMoveRight={i < sections.length - 1}
                  onMoveRight={() => onReorderSection(
                    t.id, t.sort_order ?? (i + 1) * 10,
                    sections[i + 1].id, sections[i + 1].sort_order ?? (i + 2) * 10
                  )}
                />
              )}
            </button>
          ))}
        </div>

        {canScrollRight && (
          <div className={`${styles.fade} ${styles.fadeRight}`}>
            <button className={styles.arrowBtn} onClick={() => scrollBy(1)} tabIndex={-1}>›</button>
          </div>
        )}
      </div>

      {thumb.visible && (
        <div
          ref={trackRef}
          className={styles.scrollTrack}
          onClick={onTrackClick}
        >
          <div
            className={styles.scrollThumb}
            style={{ left: `${thumb.left}%`, width: `${thumb.width}%` }}
            onMouseDown={onThumbMouseDown}
            onTouchStart={onThumbTouchStart}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}

      <div className={styles.border} />
    </div>
  )
}
