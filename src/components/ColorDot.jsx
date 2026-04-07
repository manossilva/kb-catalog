import styles from './ColorDot.module.css'

export default function ColorDot({ hex, code, name, patternUrl }) {
  const isPattern = !!patternUrl

  return (
    <div
      className={`${styles.dot} ${isPattern ? styles.pattern : ''}`}
      style={
        isPattern
          ? { backgroundImage: `url(${patternUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: hex }
      }
    >
      <div className={styles.tooltip}>{code} — {name}</div>
    </div>
  )
}
