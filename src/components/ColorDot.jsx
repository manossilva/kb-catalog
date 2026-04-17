import { getImageUrl } from '../lib/imageUrl'
import styles from './ColorDot.module.css'

export default function ColorDot({ hex, hex2, code, name, patternUrl, isSelected, onSelect }) {
  const isPattern = !!patternUrl
  const isTwoTone = !isPattern && !!hex2

  let style
  if (isPattern) {
    style = { backgroundImage: `url(${getImageUrl(patternUrl, 120)})`, backgroundSize: 'cover', backgroundPosition: 'center' }
  } else if (isTwoTone) {
    style = { background: `linear-gradient(135deg, ${hex} 50%, ${hex2} 50%)` }
  } else {
    style = { backgroundColor: hex }
  }

  return (
    <div
      className={`${styles.dot} ${isPattern ? styles.pattern : ''} ${isSelected ? styles.selected : ''}`}
      style={style}
      onClick={onSelect}
    >
      <div className={styles.tooltip}>{code} — {name}</div>
    </div>
  )
}
