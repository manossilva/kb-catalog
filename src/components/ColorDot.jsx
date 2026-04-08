import styles from './ColorDot.module.css'

export default function ColorDot({ hex, code, name, patternUrl, isSelected, onSelect }) {
  const isPattern = !!patternUrl

  return (
    <div
      className={`${styles.dot} ${isPattern ? styles.pattern : ''} ${isSelected ? styles.selected : ''}`}
      style={
        isPattern
          ? { backgroundImage: `url(${patternUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: hex }
      }
      onClick={onSelect}
    >
      <div className={styles.tooltip}>{code} — {name}</div>
    </div>
  )
}
