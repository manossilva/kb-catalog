import styles from './SkeletonCard.module.css'

export default function SkeletonCard() {
  return (
    <div className={styles.card}>
      <div className={styles.img} />
      <div className={styles.body}>
        <div className={styles.line} style={{ width: '65%', height: 18 }} />
        <div className={styles.line} style={{ width: '40%', height: 11, marginTop: 8 }} />
        <div className={styles.badges}>
          <div className={styles.badge} style={{ width: 80 }} />
          <div className={styles.badge} style={{ width: 64 }} />
        </div>
        <div className={styles.dots}>
          {[1, 2, 3].map(i => <div key={i} className={styles.dot} />)}
        </div>
      </div>
    </div>
  )
}
