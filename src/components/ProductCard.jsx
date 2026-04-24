import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ColorDot from './ColorDot'
import Lightbox from './Lightbox'
import { getImageUrl } from '../lib/imageUrl'
import styles from './ProductCard.module.css'

const FALLBACK = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%230D0D0D' width='400' height='400'/%3E%3Ctext x='50%25' y='50%25' fill='%23333' font-size='14' text-anchor='middle' dy='.3em' font-family='Inter'%3ESem imagem%3C/text%3E%3C/svg%3E"

const cardVariants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0 }
}

export default function ProductCard({ product, isAdmin, onEdit, onDelete, onToggleVisibility, onMoveLeft, onMoveRight, index = 0, aspectRatio = 'square' }) {
  const { sizes = [], colors = [] } = product
  const [lightbox, setLightbox] = useState(false)
  const [toggling, setToggling] = useState(false)
  const [selectedColorId, setSelectedColorId] = useState(null)
  const [imgLoaded, setImgLoaded] = useState(false)

  const isVisible = product.visible !== false
  const selectedColor = colors.find(c => c.id === selectedColorId) || null
  const displaySrc = selectedColor?.image_url || product.image_url

  // Primeiros 4 cards carregam com prioridade; o resto é lazy
  const isAboveFold = index < 4
  const imgLoading  = isAboveFold ? 'eager' : 'lazy'
  const imgPriority = index === 0 ? 'high' : isAboveFold ? 'auto' : 'low'

  const handleColorSelect = (id) => {
    // Só reseta o estado de carregado se a imagem vai de fato mudar.
    // Cores sem image_url caem para product.image_url (mesma src) —
    // nesse caso o onLoad nunca dispara de novo e a imagem ficaria invisível.
    const nextId    = selectedColorId === id ? null : id
    const nextColor = colors.find(c => c.id === nextId) || null
    const nextSrc   = nextColor?.image_url || product.image_url
    if (nextSrc !== displaySrc) setImgLoaded(false)
    setSelectedColorId(nextId)
  }

  const handleToggle = async (e) => {
    e.stopPropagation()
    setToggling(true)
    await onToggleVisibility(product.id, !isVisible)
    setToggling(false)
  }

  return (
    <>
      <motion.div
        className={`${styles.card} ${isAdmin && !isVisible ? styles.cardHidden : ''}`}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <div className={`${styles.imgWrap} ${aspectRatio === 'tall' ? styles.imgWrapTall : ''}`} onClick={() => setLightbox(true)} title="Ver foto completa">
          {/* Shimmer enquanto carrega */}
          {!imgLoaded && <div className={`${styles.imgShimmer} skeleton`} />}

          <AnimatePresence mode="sync" initial={false}>
            <motion.img
              key={displaySrc}
              className={styles.img}
              src={getImageUrl(displaySrc, 700)}
              alt={product.title}
              loading={imgLoading}
              fetchpriority={imgPriority}
              decoding="async"
              onLoad={() => setImgLoaded(true)}
              onError={e => { e.target.src = FALLBACK; setImgLoaded(true) }}
              initial={{ opacity: 0 }}
              animate={{ opacity: imgLoaded ? 1 : 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
            />
          </AnimatePresence>
          <div className={styles.imgOverlay} />
          <div className={styles.imgCorner} />
          <div className={styles.zoomHint}>⤢</div>
          {selectedColor && (
            <div className={styles.colorBadge}>
              {selectedColor.code} — {selectedColor.name}
            </div>
          )}
        </div>

        <div className={styles.body}>
          <div className={styles.topLine} />
          <h3 className={styles.title}>{product.title}</h3>
          <p className={styles.comp}>{product.composition}</p>

          {sizes.length > 0 && (
            <div className={styles.sizes}>
              {sizes.map(s => {
                const dims = Object.entries(s.dimensions || {}).filter(([k]) => k)
                return (
                  <div key={s.id} className={styles.sizeGroup}>
                    <div className={styles.badge}>
                      <span className={styles.badgeType}>{s.size_type}</span>
                      {s.reference && <><span className={styles.badgeSep}>·</span><span>REF {s.reference}</span></>}
                      {s.quantity > 0 && <><span className={styles.badgeSep}>·</span><span>{s.quantity} un</span></>}
                    </div>
                    {dims.length > 0 && (
                      <div className={styles.dims}>
                        {dims.map(([name, value]) => (
                          <span key={name} className={styles.dim}>
                            <span className={styles.dimLabel}>{name}</span>
                            <span className={styles.dimVal}>{value}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {colors.length > 0 && (
            <div className={styles.colors}>
              {colors.map(c => (
                <ColorDot
                  key={c.id}
                  hex={c.hex_color}
                  hex2={c.hex_color_2 || null}
                  code={c.code}
                  name={c.name}
                  patternUrl={c.pattern_url}
                  isSelected={selectedColorId === c.id}
                  onSelect={() => handleColorSelect(c.id)}
                />
              ))}
            </div>
          )}

          <div className={styles.footer}>
            {product.video_url ? (
              <a href={product.video_url} target="_blank" rel="noopener noreferrer" className={styles.video}>
                <span className={styles.videoIcon}>▶</span>
                Ver vídeo
              </a>
            ) : <span />}

            {isAdmin && (
              <div className={styles.adminBtns}>
                <button
                  className={styles.moveBtn}
                  onClick={e => { e.stopPropagation(); onMoveLeft?.() }}
                  disabled={!onMoveLeft}
                  title="Mover para a esquerda"
                >←</button>
                <button
                  className={styles.moveBtn}
                  onClick={e => { e.stopPropagation(); onMoveRight?.() }}
                  disabled={!onMoveRight}
                  title="Mover para a direita"
                >→</button>
                <button
                  className={`${styles.visibilityBtn} ${isVisible ? styles.visOn : styles.visOff}`}
                  onClick={handleToggle}
                  disabled={toggling}
                  title={isVisible ? 'Ocultar produto' : 'Mostrar produto'}
                >
                  {isVisible ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  )}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={() => onEdit(product)}>Editar</button>
                <button className="btn btn-danger btn-sm" onClick={() => onDelete(product.id)}>×</button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {lightbox && (
          <Lightbox
            src={displaySrc}
            alt={selectedColor ? `${product.title} — ${selectedColor.name}` : product.title}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
