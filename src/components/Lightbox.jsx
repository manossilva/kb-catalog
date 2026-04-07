import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getImageUrl } from '../lib/imageUrl'
import styles from './Lightbox.module.css'

export default function Lightbox({ src, alt, onClose }) {
  // fechar com ESC
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <AnimatePresence>
      <motion.div
        className={styles.overlay}
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
      >
        <motion.div
          className={styles.imgWrap}
          onClick={e => e.stopPropagation()}
          initial={{ scale: 0.88, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.92, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        >
          <img
            src={getImageUrl(src)}
            alt={alt}
            className={styles.img}
            onError={e => { e.target.style.opacity = 0.3 }}
          />
          <div className={styles.topBar}>
            <span className={styles.label}>{alt}</span>
          </div>
        </motion.div>

        <motion.button
          className={styles.closeBtn}
          onClick={onClose}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
        >
          ✕
        </motion.button>
      </motion.div>
    </AnimatePresence>
  )
}
