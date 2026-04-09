import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '../lib/imageUrl'
import styles from './Lightbox.module.css'

export default function Lightbox({ src, alt, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    // Bloqueia scroll do body enquanto lightbox está aberto
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return createPortal(
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        {/* Botão voltar — renderizado ANTES do imgWrap para não ser coberto */}
        <motion.button
          className={styles.backBtn}
          onClick={e => { e.stopPropagation(); onClose() }}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Voltar
        </motion.button>

        <motion.button
          className={styles.closeBtn}
          onClick={e => { e.stopPropagation(); onClose() }}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileTap={{ scale: 0.92 }}
        >
          ✕
        </motion.button>

        <motion.div
          className={styles.imgWrap}
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <img
            src={getImageUrl(src, 1400)}
            alt={alt}
            className={styles.img}
            onError={e => { e.target.style.opacity = 0.3 }}
          />
          <div className={styles.topBar}>
            <span className={styles.label}>{alt}</span>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  )
}
