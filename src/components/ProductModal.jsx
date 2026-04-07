import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { uploadPattern } from '../lib/storage'
import styles from './ProductModal.module.css'

const SIZE_OPTIONS = ['Solteiro', 'Casal', 'Queen', 'King', '2 Lugares', '3 Lugares', 'Outro']

function ColorEntry({ c, i, onUpdate, onRemove }) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()
  const isPattern = c.type === 'pattern'

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadPattern(file)
      onUpdate(i, 'pattern_url', url)
    } catch (err) {
      alert('Erro ao subir imagem: ' + err.message)
    }
    setUploading(false)
  }

  return (
    <div className="sub-section">
      <div className="row">
        <div className="field">
          <label>Código</label>
          <input value={c.code} onChange={e => onUpdate(i, 'code', e.target.value)} placeholder="02" />
        </div>
        <div className="field">
          <label>Nome</label>
          <input value={c.name} onChange={e => onUpdate(i, 'name', e.target.value)} placeholder="Marfim" />
        </div>
      </div>

      <div className={styles.colorTypeToggle}>
        <button
          type="button"
          className={`${styles.toggleBtn} ${!isPattern ? styles.toggleActive : ''}`}
          onClick={() => onUpdate(i, 'type', 'solid')}
        >
          Cor Sólida
        </button>
        <button
          type="button"
          className={`${styles.toggleBtn} ${isPattern ? styles.toggleActive : ''}`}
          onClick={() => onUpdate(i, 'type', 'pattern')}
        >
          Estampa
        </button>
      </div>

      {!isPattern ? (
        <div className="field">
          <label>Cor HEX</label>
          <div className={styles.colorPicker}>
            <input
              type="color"
              value={c.hex_color || '#CCCCCC'}
              onChange={e => onUpdate(i, 'hex_color', e.target.value)}
              className={styles.colorInput}
            />
            <input
              value={c.hex_color || ''}
              onChange={e => onUpdate(i, 'hex_color', e.target.value)}
              placeholder="#CCCCCC"
              style={{ flex: 1 }}
            />
          </div>
        </div>
      ) : (
        <div className="field">
          <label>Imagem da Estampa</label>
          <div className={styles.patternUpload}>
            {c.pattern_url && (
              <img src={c.pattern_url} alt="Estampa" className={styles.patternPreview} />
            )}
            <button
              type="button"
              className={`btn btn-ghost btn-sm ${styles.uploadBtn}`}
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? 'Enviando...' : c.pattern_url ? 'Trocar imagem' : 'Selecionar imagem'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </div>
        </div>
      )}

      <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => onRemove(i)}>
        Remover
      </button>
    </div>
  )
}

export default function ProductModal({ product, sections, onClose, onSave }) {
  const isEdit = !!product?.id

  const [form, setForm] = useState({
    title: product?.title || '',
    image_url: product?.image_url || '',
    video_url: product?.video_url || '',
    composition: product?.composition || '100% Poliéster',
    section_id: product?.section_id || sections[0]?.id || '',
  })

  const [sizes, setSizes] = useState(
    product?.sizes?.map(s => ({
      size_type: s.size_type,
      reference: s.reference,
      quantity: s.quantity,
      dimensions: s.dimensions || {}
    })) || []
  )

  const [colors, setColors] = useState(
    product?.colors?.map(c => ({
      code: c.code,
      name: c.name,
      hex_color: c.hex_color || '#CCCCCC',
      pattern_url: c.pattern_url || '',
      type: c.pattern_url ? 'pattern' : 'solid',
    })) || []
  )

  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addSize = () => setSizes(s => [...s, { size_type: '', reference: '', quantity: 0, dimensions: {} }])
  const removeSize = i => setSizes(s => s.filter((_, idx) => idx !== i))
  const updateSize = (i, k, v) => setSizes(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x))

  const addColor = () => setColors(c => [...c, { code: '', name: '', hex_color: '#CCCCCC', pattern_url: '', type: 'solid' }])
  const removeColor = i => setColors(c => c.filter((_, idx) => idx !== i))
  const updateColor = (i, k, v) => setColors(c => c.map((x, idx) => idx === i ? { ...x, [k]: v } : x))

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      alert('Título e URL da imagem são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      // strip the `type` field before saving — it's UI-only
      const cleanColors = colors.map(({ type, ...rest }) => ({
        ...rest,
        hex_color: type === 'pattern' ? null : rest.hex_color,
        pattern_url: type === 'pattern' ? rest.pattern_url : null,
      }))
      await onSave(product?.id, form, sizes, cleanColors)
      onClose()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <motion.div
      className="modal-overlay"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <motion.div
        className="modal"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 40, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <h2>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>

        <div className="field">
          <label>Título</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Protetor para Sofá Linho" />
        </div>

        <div className="field">
          <label>Seção</label>
          <select value={form.section_id} onChange={e => set('section_id', e.target.value)}>
            {sections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>

        <div className="field">
          <label>URL da Imagem</label>
          <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." />
        </div>

        <div className="field">
          <label>URL do Vídeo</label>
          <input value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://youtube.com/..." />
        </div>

        <div className="field">
          <label>Composição</label>
          <input value={form.composition} onChange={e => set('composition', e.target.value)} />
        </div>

        {/* ===== SIZES ===== */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Tamanhos / Referências</span>
            <button className="btn btn-ghost btn-sm" onClick={addSize}>+ Tamanho</button>
          </div>

          {sizes.map((s, i) => (
            <div key={i} className="sub-section">
              <div className="row">
                <div className="field">
                  <label>Tipo</label>
                  <select value={s.size_type} onChange={e => updateSize(i, 'size_type', e.target.value)}>
                    <option value="">Selecione</option>
                    {SIZE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Referência</label>
                  <input value={s.reference} onChange={e => updateSize(i, 'reference', e.target.value)} placeholder="6970" />
                </div>
                <div className="field">
                  <label>Qtd</label>
                  <input type="number" value={s.quantity} onChange={e => updateSize(i, 'quantity', parseInt(e.target.value) || 0)} />
                </div>
              </div>
              <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => removeSize(i)}>Remover</button>
            </div>
          ))}
        </div>

        {/* ===== COLORS ===== */}
        <div className={styles.sectionBlock}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionLabel}>Cores / Estampas</span>
            <button className="btn btn-ghost btn-sm" onClick={addColor}>+ Cor</button>
          </div>

          {colors.map((c, i) => (
            <ColorEntry key={i} c={c} i={i} onUpdate={updateColor} onRemove={removeColor} />
          ))}
        </div>

        {/* ===== FOOTER ===== */}
        <div className={styles.footer}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
