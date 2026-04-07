import { motion } from 'framer-motion'
import styles from './Header.module.css'

const LOGO_URL = import.meta.env.VITE_LOGO_URL

export default function Header({ user, onLogin, onLogout, onNewProduct }) {
  return (
    <motion.header
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={styles.logoWrap}>
        {LOGO_URL ? (
          <motion.img
            src={LOGO_URL}
            alt="KB Supreme"
            className={styles.logoImg}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
        ) : (
          <motion.h1
            className={styles.logo}
            initial={{ opacity: 0, letterSpacing: '8px' }}
            animate={{ opacity: 1, letterSpacing: '4px' }}
            transition={{ duration: 1, delay: 0.2 }}
          >
            KB Supreme
          </motion.h1>
        )}
        <div className={styles.logoLine} />
      </div>

      <div className={styles.actions}>
        {user ? (
          <>
            <motion.button
              className="btn btn-primary"
              onClick={onNewProduct}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              + Novo Produto
            </motion.button>
            <motion.button
              className="btn btn-ghost btn-sm"
              onClick={onLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Sair
            </motion.button>
          </>
        ) : (
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={onLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            Admin
          </motion.button>
        )}
      </div>
    </motion.header>
  )
}
