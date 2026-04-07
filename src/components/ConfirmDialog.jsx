import styles from './ConfirmDialog.module.css'

export default function ConfirmDialog({ message, onConfirm, onCancel }) {
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className={styles.box} onClick={e => e.stopPropagation()}>
        <p className={styles.msg}>{message}</p>
        <div className={styles.actions}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancelar</button>
          <button className="btn btn-danger" onClick={onConfirm}>Excluir</button>
        </div>
      </div>
    </div>
  )
}
