import { motion } from 'framer-motion'
import styles from './Header.module.css'

export default function Header({ user, onLogin, onLogout, onNewProduct }) {
  return (
    <motion.header
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={styles.logoWrap}>
        <motion.h1
          className={styles.logo}
          initial={{ opacity: 0, letterSpacing: '6px' }}
          animate={{ opacity: 1, letterSpacing: '3px' }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          KB Supreme
        </motion.h1>
        <div className={styles.logoLine} />
      </div>

      <div className={styles.actions}>
        {user ? (
          <>
            <motion.button
              className="btn btn-primary"
              onClick={onNewProduct}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              + Novo Produto
            </motion.button>
            <motion.button
              className="btn btn-ghost btn-sm"
              onClick={onLogout}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Sair
            </motion.button>
          </>
        ) : (
          <motion.button
            className="btn btn-ghost btn-sm"
            onClick={onLogin}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Admin
          </motion.button>
        )}
      </div>
    </motion.header>
  )
}
