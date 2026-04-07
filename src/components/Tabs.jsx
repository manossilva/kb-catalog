import styles from './Tabs.module.css'

export default function Tabs({ sections, activeTab, onTabChange }) {
  return (
    <div className={styles.tabs}>
      <button
        className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
        onClick={() => onTabChange('all')}
      >
        Todos
      </button>
      {sections.map(s => (
        <button
          key={s.id}
          className={`${styles.tab} ${activeTab === s.id ? styles.active : ''}`}
          onClick={() => onTabChange(s.id)}
        >
          {s.name}
        </button>
      ))}
    </div>
  )
}
