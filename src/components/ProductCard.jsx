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

export default function ProductCard({ product, isAdmin, onEdit, onDelete, index = 0 }) {
  const { sizes = [], colors = [] } = product
  const [lightbox, setLightbox] = useState(false)

  return (
    <>
      <motion.div
        className={styles.card}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.5, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
        whileHover={{ y: -6, transition: { duration: 0.3, ease: 'easeOut' } }}
      >
        <div className={styles.imgWrap} onClick={() => setLightbox(true)} title="Ver foto completa">
          <img
            className={styles.img}
            src={getImageUrl(product.image_url)}
            alt={product.title}
            loading="lazy"
            onError={e => { e.target.src = FALLBACK }}
          />
          <div className={styles.imgOverlay} />
          <div className={styles.imgCorner} />
          <div className={styles.zoomHint}>⤢</div>
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
                <ColorDot key={c.id} hex={c.hex_color} code={c.code} name={c.name} patternUrl={c.pattern_url} />
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
            src={product.image_url}
            alt={product.title}
            onClose={() => setLightbox(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
