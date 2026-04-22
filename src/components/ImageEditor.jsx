import { useState, useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ConfirmDialog from './ConfirmDialog'
import styles from './ImageEditor.module.css'

const OUTPUT_WIDTH = 1200
// Container base width — CSS scales it down on mobile
const CW = 480

function getBaseScale(natW, natH, cw, ch) {
  return Math.max(cw / natW, ch / natH)
}

function getDisplaySize(natW, natH, cw, ch, zoom) {
  const base = getBaseScale(natW, natH, cw, ch)
  return { w: natW * base * zoom, h: natH * base * zoom }
}

function clamp(val, min, max) { return Math.max(min, Math.min(max, val)) }

function clampOffset(ox, oy, natW, natH, cw, ch, zoom) {
  const { w: dw, h: dh } = getDisplaySize(natW, natH, cw, ch, zoom)
  const maxX = Math.max(0, (dw - cw) / 2)
  const maxY = Math.max(0, (dh - ch) / 2)
  return { x: clamp(ox, -maxX, maxX), y: clamp(oy, -maxY, maxY) }
}

export default function ImageEditor({ src, aspectRatio = 4 / 3, label = '', onConfirm, onClose }) {
  const imgRef = useRef()
  const dragRef = useRef(null)
  const pinchRef = useRef(null)

  const CH = Math.round(CW / aspectRatio)

  const [natSize, setNatSize] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const [saving, setSaving] = useState(false)
  const [imgError, setImgError] = useState(false)
  const [showDiscard, setShowDiscard] = useState(false)

  const isDirty = zoom !== 1 || offset.x !== 0 || offset.y !== 0

  const tryClose = () => {
    if (isDirty) setShowDiscard(true)
    else onClose()
  }

  // Reset when src changes
  useEffect(() => {
    setZoom(1)
    setOffset({ x: 0, y: 0 })
    setImgError(false)
    setNatSize({ w: 0, h: 0 })
  }, [src])

  const handleImgLoad = (e) => {
    setNatSize({ w: e.target.naturalWidth, h: e.target.naturalHeight })
  }

  // ── Mouse ──────────────────────────────────
  const onMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    dragRef.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y }
  }

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragRef.current || !natSize.w) return
    const dx = e.clientX - dragRef.current.mx
    const dy = e.clientY - dragRef.current.my
    setOffset(clampOffset(
      dragRef.current.ox + dx, dragRef.current.oy + dy,
      natSize.w, natSize.h, CW, CH, zoom
    ))
  }, [dragging, natSize, zoom, CH])

  const onMouseUp = () => setDragging(false)

  const onWheel = useCallback((e) => {
    e.preventDefault()
    const factor = e.deltaY < 0 ? 1.1 : 0.9
    setZoom(z => {
      const next = clamp(z * factor, 1, 8)
      setOffset(o => clampOffset(o.x, o.y, natSize.w, natSize.h, CW, CH, next))
      return next
    })
  }, [natSize, CH])

  // ── Touch ──────────────────────────────────
  const onTouchStart = (e) => {
    if (e.touches.length === 1) {
      setDragging(true)
      dragRef.current = { mx: e.touches[0].clientX, my: e.touches[0].clientY, ox: offset.x, oy: offset.y }
    } else if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      pinchRef.current = { dist: Math.hypot(dx, dy), zoom }
    }
  }

  const onTouchMove = useCallback((e) => {
    e.preventDefault()
    if (e.touches.length === 1 && dragging && dragRef.current && natSize.w) {
      const dx = e.touches[0].clientX - dragRef.current.mx
      const dy = e.touches[0].clientY - dragRef.current.my
      setOffset(clampOffset(
        dragRef.current.ox + dx, dragRef.current.oy + dy,
        natSize.w, natSize.h, CW, CH, zoom
      ))
    } else if (e.touches.length === 2 && pinchRef.current && natSize.w) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const next = clamp(pinchRef.current.zoom * (dist / pinchRef.current.dist), 1, 8)
      setZoom(next)
      setOffset(o => clampOffset(o.x, o.y, natSize.w, natSize.h, CW, CH, next))
    }
  }, [dragging, natSize, zoom, CH])

  const onTouchEnd = () => setDragging(false)

  // ── Confirm: Canvas → Blob → upload ────────
  const handleConfirm = async () => {
    if (!natSize.w || !imgRef.current) return
    setSaving(true)
    try {
      const { w: dw, h: dh } = getDisplaySize(natSize.w, natSize.h, CW, CH, zoom)
      const imgLeft = (CW - dw) / 2 + offset.x
      const imgTop  = (CH - dh) / 2 + offset.y
      const base    = getBaseScale(natSize.w, natSize.h, CW, CH)
      const srcX    = -imgLeft / (base * zoom)
      const srcY    = -imgTop  / (base * zoom)
      const srcW    = CW / (base * zoom)
      const srcH    = CH / (base * zoom)

      const outW = OUTPUT_WIDTH
      const outH = Math.round(OUTPUT_WIDTH / aspectRatio)

      const canvas = document.createElement('canvas')
      canvas.width  = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      ctx.drawImage(imgRef.current, srcX, srcY, srcW, srcH, 0, 0, outW, outH)

      canvas.toBlob(async (blob) => {
        try {
          const file = new File([blob], `crop-${Date.now()}.webp`, { type: 'image/webp' })
          await onConfirm(file)
        } catch (err) {
          alert('Erro ao salvar: ' + err.message)
        }
        setSaving(false)
      }, 'image/webp', 0.88)
    } catch (err) {
      alert('Erro ao cortar: ' + err.message)
      setSaving(false)
    }
  }

  const handleZoomChange = (val) => {
    const next = parseFloat(val)
    setZoom(next)
    setOffset(o => clampOffset(o.x, o.y, natSize.w, natSize.h, CW, CH, next))
  }

  const handleReset = () => { setZoom(1); setOffset({ x: 0, y: 0 }) }

  // Compute image CSS position
  const loaded = natSize.w > 0
  const { w: dw, h: dh } = loaded
    ? getDisplaySize(natSize.w, natSize.h, CW, CH, zoom)
    : { w: CW, h: CH }
  const imgLeft = (CW - dw) / 2 + offset.x
  const imgTop  = (CH - dh) / 2 + offset.y

  const ratioLabel = aspectRatio === 1 ? '1:1' : aspectRatio > 1 ? '4:3' : '2:3'

  return (
    <>
    <motion.div
      className={styles.overlay}
      onClick={tryClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className={styles.panel}
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
      >
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Editar Imagem</h3>
            {label && <span className={styles.subtitle}>{label}</span>}
          </div>
          <button className={styles.closeBtn} onClick={tryClose} aria-label="Fechar">✕</button>
        </div>

        <p className={styles.hint}>Arraste para reposicionar · Scroll ou pinça para zoom</p>

        {/* ── Área de corte ── */}
        <div className={styles.cropWrap} style={{ '--cw': `${CW}px`, '--ch': `${CH}px` }}>
          <div
            className={`${styles.cropArea} ${dragging ? styles.grabbing : ''}`}
            style={{ width: CW, height: CH }}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onWheel={onWheel}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {imgError ? (
              <div className={styles.errMsg}>
                Não foi possível carregar a imagem.<br />
                <small>URLs externas podem bloquear edição.</small>
              </div>
            ) : (
              <img
                ref={imgRef}
                src={src}
                crossOrigin="anonymous"
                className={styles.cropImg}
                style={{ width: dw, height: dh, left: imgLeft, top: imgTop }}
                onLoad={handleImgLoad}
                onError={() => setImgError(true)}
                draggable={false}
                alt=""
              />
            )}

            {/* Grid (rule of thirds) */}
            <div className={styles.gridOverlay} aria-hidden="true">
              <div className={styles.gridH} style={{ top: '33.33%' }} />
              <div className={styles.gridH} style={{ top: '66.66%' }} />
              <div className={styles.gridV} style={{ left: '33.33%' }} />
              <div className={styles.gridV} style={{ left: '66.66%' }} />
            </div>

            {/* Marcadores de canto */}
            <div className={`${styles.corner} ${styles.tl}`} />
            <div className={`${styles.corner} ${styles.tr}`} />
            <div className={`${styles.corner} ${styles.bl}`} />
            <div className={`${styles.corner} ${styles.br}`} />

            {/* Rótulo proporção */}
            <div className={styles.ratioTag}>{ratioLabel}</div>
          </div>
        </div>

        {/* ── Controles de zoom ── */}
        <div className={styles.controls}>
          <span className={styles.zoomIcon}>−</span>
          <input
            type="range" min="1" max="8" step="0.05"
            value={zoom}
            onChange={e => handleZoomChange(e.target.value)}
            className={styles.slider}
          />
          <span className={styles.zoomIcon}>+</span>
          <button className="btn btn-ghost btn-sm" onClick={handleReset}>Reset</button>
          <span className={styles.zoomPct}>{Math.round(zoom * 100)}%</span>
        </div>

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <button className="btn btn-ghost" onClick={tryClose}>Cancelar</button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={saving || !loaded || imgError}
          >
            {saving ? 'Aplicando…' : 'Aplicar Corte'}
          </button>
        </div>
      </motion.div>
    </motion.div>

    <AnimatePresence>
      {showDiscard && (
        <ConfirmDialog
          message="Descartar as alterações de corte? As mudanças feitas serão perdidas."
          confirmLabel="Descartar"
          cancelLabel="Continuar editando"
          confirmVariant="btn-danger"
          onConfirm={onClose}
          onCancel={() => setShowDiscard(false)}
        />
      )}
    </AnimatePresence>
    </>
  )
}
