import { motion } from 'framer-motion'
import styles from './Header.module.css'

const LOGO_DARK  = import.meta.env.VITE_LOGO_URL       || '/logo.png'
const LOGO_LIGHT = import.meta.env.VITE_LOGO_LIGHT_URL || '/logo-light.png'

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Header({ user, onLogin, onLogout, onNewProduct, theme, onToggleTheme, onForceRefresh }) {
  const logoSrc = theme === 'light' ? LOGO_LIGHT : LOGO_DARK

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className={styles.logoWrap}>
        <motion.img
          src={logoSrc}
          alt="KB Supreme"
          className={styles.logoImg}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        />
        <div className={styles.logoLine} />
      </div>

      <div className={styles.actions}>
        <button
          className={styles.themeBtn}
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

        {user ? (
          <>
            <motion.button
              className={`btn btn-primary ${styles.newBtn}`}
              onClick={onNewProduct}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              <span className={styles.newBtnFull}>+ Novo Produto</span>
              <span className={styles.newBtnShort}>+</span>
            </motion.button>
            <motion.button
              className={`btn btn-ghost btn-sm ${styles.publishBtn}`}
              onClick={onForceRefresh}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              title="Força todos os clientes a recarregarem o catálogo"
            >
              ↻ Publicar
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
