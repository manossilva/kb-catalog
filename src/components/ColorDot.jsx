import { useState } from 'react'
import styles from './ColorDot.module.css'

export default function ColorDot({ hex, code, name, patternUrl }) {
  const isPattern = !!patternUrl
  const [selected, setSelected] = useState(false)

  return (
    <div
      className={`${styles.dot} ${isPattern ? styles.pattern : ''} ${selected ? styles.selected : ''}`}
      style={
        isPattern
          ? { backgroundImage: `url(${patternUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { backgroundColor: hex }
      }
      onClick={() => setSelected(s => !s)}
    >
      <div className={styles.tooltip}>{code} — {name}</div>
    </div>
  )
}
