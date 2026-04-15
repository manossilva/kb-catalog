import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './SplashScreen.module.css'

const LOGO_URL = import.meta.env.VITE_LOGO_URL || '/logo.png'

// Tempo mínimo de exibição (deixa a animação terminar)
const MIN_MS = 2600
// Tempo máximo de espera (libera o botão mesmo com rede lenta)
const MAX_MS = 7000

export default function SplashScreen({ onEnter, productsReady }) {
  const [minPassed, setMinPassed] = useState(false)
  const [maxPassed, setMaxPassed] = useState(false)

  useEffect(() => {
    const tMin = setTimeout(() => setMinPassed(true), MIN_MS)
    const tMax = setTimeout(() => setMaxPassed(true), MAX_MS)
    return () => { clearTimeout(tMin); clearTimeout(tMax) }
  }, [])

  // Libera o botão quando: tempo mínimo passou E (produtos prontos OU timeout)
  const canEnter = minPassed && (productsReady || maxPassed)

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.015 }}
      transition={{ duration: 0.55, ease: 'easeInOut' }}
    >
      {/* Arcos dourados nos cantos — mesmo estilo do catálogo */}
      <div className={styles.arcTL} />
      <div className={styles.arcBR} />

      <div className={styles.content}>
        {/* Logo */}
        <motion.img
          src={LOGO_URL}
          alt="KB Supreme"
          className={styles.logo}
          initial={{ opacity: 0, scale: 0.72, y: 28 }}
          animate={{ opacity: 1, scale: 1,   y: 0  }}
          transition={{ duration: 1.1, delay: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        />

        {/* Linha divisória dourada */}
        <motion.div
          className={styles.divider}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 1.0, ease: 'easeOut' }}
        />

        {/* Texto de boas-vindas */}
        <motion.p
          className={styles.subtitle}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.4 }}
        >
          Seja bem vindo ao
        </motion.p>

        <motion.h1
          className={styles.title}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, delay: 1.7 }}
        >
          Catálogo KB Supreme
        </motion.h1>

        {/* Botão ou indicador de carregamento */}
        <div className={styles.action}>
          <AnimatePresence mode="wait">
            {!canEnter ? (
              <motion.div
                key="loading"
                className={styles.dots}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                transition={{ delay: 1.9, duration: 0.4 }}
              >
                <span /><span /><span />
              </motion.div>
            ) : (
              <motion.button
                key="enter"
                className={styles.enterBtn}
                onClick={onEnter}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
              >
                Ver catálogo
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}
