import { useEffect, useRef } from 'react'
import styles from './GoldenLoader.module.css'

export default function GoldenLoader({ visible }) {
  return (
    <div className={`${styles.wrap} ${visible ? styles.visible : styles.hidden}`}>
      <div className={styles.track}>
        <div className={styles.beam} />
      </div>
      <div className={styles.glow} />
    </div>
  )
}
