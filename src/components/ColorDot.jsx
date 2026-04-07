import styles from './ColorDot.module.css'

export default function ColorDot({ hex, code, name }) {
  return (
    <div className={styles.dot} style={{ backgroundColor: hex }}>
      <div className={styles.tooltip}>{code} — {name}</div>
    </div>
  )
}
