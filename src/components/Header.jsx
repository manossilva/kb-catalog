import { motion } from 'framer-motion'
import styles from './Header.module.css'

const LOGO_DARK  = import.meta.env.VITE_LOGO_URL       || '/logo.png'
const LOGO_LIGHT = import.meta.env.VITE_LOGO_LIGHT_URL || '/logo-light.png'

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  )
}

function ClearIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}

export default function Header({
  user, onLogin, onLogout, onNewProduct, theme, onToggleTheme, onForceRefresh,
  sections = [], searchQuery = '', onSearchChange, searchSection = 'all', onSearchSectionChange
}) {
  const logoSrc = theme === 'light' ? LOGO_LIGHT : LOGO_DARK

  return (
    <motion.header
      className={styles.header}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* ── Linha principal: logo + pesquisa + ações ── */}
      <div className={styles.topRow}>
        <div className={styles.logoWrap}>
          <motion.img
            src={logoSrc}
            alt="KB Supreme"
            className={styles.logoImg}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
          />
          <div className={styles.logoLine} />
        </div>

        {/* ── Barra de pesquisa ── */}
        <div className={styles.searchWrap}>
          <div className={styles.searchBar}>
            {/* Filtro de seção */}
            <div className={styles.sectionFilter}>
              <select
                className={styles.sectionSelect}
                value={searchSection}
                onChange={e => onSearchSectionChange?.(e.target.value)}
                aria-label="Filtrar por seção"
              >
                <option value="all">Todas as seções</option>
                {sections.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
              <span className={styles.sectionArrow}>▾</span>
            </div>

            <div className={styles.divider} />

            {/* Campo de texto */}
            <div className={styles.searchInputWrap}>
              <span className={styles.searchIcon}><SearchIcon /></span>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="Buscar por título ou referência…"
                value={searchQuery}
                onChange={e => onSearchChange?.(e.target.value)}
                aria-label="Pesquisar produtos"
              />
              {searchQuery && (
                <button
                  className={styles.clearBtn}
                  onClick={() => onSearchChange?.('')}
                  aria-label="Limpar pesquisa"
                >
                  <ClearIcon />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Ações: tema + admin ── */}
        <div className={styles.actions}>
          <button
            className={styles.themeBtn}
            onClick={onToggleTheme}
            title={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {user ? (
            <>
              <motion.button
                className={`btn btn-primary ${styles.newBtn}`}
                onClick={onNewProduct}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                <span className={styles.newBtnFull}>+ Novo Produto</span>
                <span className={styles.newBtnShort}>+</span>
              </motion.button>
              <motion.button
                className={`btn btn-ghost btn-sm ${styles.publishBtn}`}
                onClick={onForceRefresh}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                title="Força todos os clientes a recarregarem o catálogo"
              >
                ↻ Publicar
              </motion.button>
              <motion.button
                className="btn btn-ghost btn-sm"
                onClick={onLogout}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
              >
                Sair
              </motion.button>
            </>
          ) : (
            <motion.button
              className="btn btn-ghost btn-sm"
              onClick={onLogin}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Admin
            </motion.button>
          )}
        </div>
      </div>

      {/* ── Barra de pesquisa mobile (segunda linha) ── */}
      <div className={styles.searchRowMobile}>
        <div className={styles.searchBar}>
          <div className={styles.sectionFilter}>
            <select
              className={styles.sectionSelect}
              value={searchSection}
              onChange={e => onSearchSectionChange?.(e.target.value)}
              aria-label="Filtrar por seção"
            >
              <option value="all">Todas as seções</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <span className={styles.sectionArrow}>▾</span>
          </div>

          <div className={styles.divider} />

          <div className={styles.searchInputWrap}>
            <span className={styles.searchIcon}><SearchIcon /></span>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Título ou referência…"
              value={searchQuery}
              onChange={e => onSearchChange?.(e.target.value)}
              aria-label="Pesquisar produtos"
            />
            {searchQuery && (
              <button
                className={styles.clearBtn}
                onClick={() => onSearchChange?.('')}
                aria-label="Limpar pesquisa"
              >
                <ClearIcon />
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}
