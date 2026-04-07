import { motion } from 'framer-motion'
import styles from './Tabs.module.css'

export default function Tabs({ sections, activeTab, onTabChange }) {
  const tabs = [{ id: 'all', name: 'Todos' }, ...sections]

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`${styles.tab} ${activeTab === t.id ? styles.active : ''}`}
            onClick={() => onTabChange(t.id)}
          >
            {activeTab === t.id && (
              <motion.span
                className={styles.pill}
                layoutId="tab-pill"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className={styles.label}>{t.name}</span>
          </button>
        ))}
      </div>
      <div className={styles.border} />
    </div>
  )
}
