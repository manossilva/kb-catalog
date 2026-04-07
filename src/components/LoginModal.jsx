import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './LoginModal.module.css'

export default function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      await onLogin(email, password)
      onClose()
    } catch (err) {
      setError(err.message || 'Erro no login')
    }
    setLoading(false)
  }

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="modal"
        onClick={e => e.stopPropagation()}
        style={{ maxWidth: 400 }}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.97 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <div className={styles.logoLine} />
        <h2>Login Admin</h2>

        {error && (
          <motion.div
            className={styles.error}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {error}
          </motion.div>
        )}

        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="admin@exemplo.com"
            autoFocus
          />
        </div>

        <div className="field">
          <label>Senha</label>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <div className={styles.actions}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Verificando...' : 'Entrar'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
