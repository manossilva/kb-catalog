import { useState } from 'react'
import styles from './ProductModal.module.css'

const SIZE_OPTIONS = ['Solteiro', 'Casal', 'Queen', 'King', '2 Lugares', '3 Lugares', 'Outro']

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
    product?.sizes?.map(s => ({ size_type: s.size_type, reference: s.reference, quantity: s.quantity, dimensions: s.dimensions || {} })) || []
  )

  const [colors, setColors] = useState(
    product?.colors?.map(c => ({ code: c.code, name: c.name, hex_color: c.hex_color })) || []
  )

  const [saving, setSaving] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  // Sizes
  const addSize = () => setSizes(s => [...s, { size_type: '', reference: '', quantity: 0, dimensions: {} }])
  const removeSize = i => setSizes(s => s.filter((_, idx) => idx !== i))
  const updateSize = (i, k, v) => setSizes(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x))

  // Colors
  const addColor = () => setColors(c => [...c, { code: '', name: '', hex_color: '#CCCCCC' }])
  const removeColor = i => setColors(c => c.filter((_, idx) => idx !== i))
  const updateColor = (i, k, v) => setColors(c => c.map((x, idx) => idx === i ? { ...x, [k]: v } : x))

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      alert('Título e URL da imagem são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      await onSave(product?.id, form, sizes, colors)
      onClose()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
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
          <label>URL da Imagem (Google Drive público)</label>
          <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://drive.google.com/uc?export=view&id=..." />
        </div>

        <div className="field">
          <label>URL do Vídeo</label>
          <input value={form.video_url} onChange={e => set('video_url', e.target.value)} placeholder="https://youtube.com/watch?v=..." />
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
                  <label>Quantidade</label>
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
            <span className={styles.sectionLabel}>Cores</span>
            <button className="btn btn-ghost btn-sm" onClick={addColor}>+ Cor</button>
          </div>

          {colors.map((c, i) => (
            <div key={i} className="sub-section">
              <div className="row">
                <div className="field">
                  <label>Código</label>
                  <input value={c.code} onChange={e => updateColor(i, 'code', e.target.value)} placeholder="02" />
                </div>
                <div className="field">
                  <label>Nome</label>
                  <input value={c.name} onChange={e => updateColor(i, 'name', e.target.value)} placeholder="Marfim" />
                </div>
                <div className="field">
                  <label>Cor HEX</label>
                  <div className={styles.colorPicker}>
                    <input
                      type="color"
                      value={c.hex_color}
                      onChange={e => updateColor(i, 'hex_color', e.target.value)}
                      className={styles.colorInput}
                    />
                    <input
                      value={c.hex_color}
                      onChange={e => updateColor(i, 'hex_color', e.target.value)}
                      style={{ flex: 1 }}
                    />
                  </div>
                </div>
              </div>
              <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => removeColor(i)}>Remover</button>
            </div>
          ))}
        </div>

        {/* ===== FOOTER ===== */}
        <div className={styles.footer}>
          <button className="btn btn-ghost" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </div>
    </div>
  )
}
