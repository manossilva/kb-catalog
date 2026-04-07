import styles from './Header.module.css'

export default function Header({ user, onLogin, onLogout, onNewProduct }) {
  return (
    <header className={styles.header}>
      <h1 className={styles.logo}>KB Supreme</h1>
      <div className={styles.actions}>
        {user ? (
          <>
            <button className="btn btn-primary" onClick={onNewProduct}>+ Novo Produto</button>
            <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sair</button>
          </>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={onLogin}>Admin</button>
        )}
      </div>
    </header>
  )
}
