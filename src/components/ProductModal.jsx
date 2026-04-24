import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { uploadPattern, uploadColorImage, uploadCroppedImage } from '../lib/storage'
import ImageEditor from './ImageEditor'
import ConfirmDialog from './ConfirmDialog'
import styles from './ProductModal.module.css'

const SIZE_PRESETS = ['Solteiro', 'Casal', 'Queen', 'King', '2 Lugares', '3 Lugares']
const CUSTOM_VALUE = '__custom__'

function SizeTypeField({ value, onChange }) {
  // Se o valor já for personalizado (não está nos presets), começa no modo texto
  const isCustom = value !== '' && !SIZE_PRESETS.includes(value)
  const [mode, setMode] = useState(isCustom ? 'custom' : 'select')
  const [customText, setCustomText] = useState(isCustom ? value : '')
  const inputRef = useRef()

  useEffect(() => {
    if (mode === 'custom') inputRef.current?.focus()
  }, [mode])

  const handleSelectChange = (e) => {
    const v = e.target.value
    if (v === CUSTOM_VALUE) {
      setMode('custom')
      setCustomText('')
      onChange('')
    } else {
      onChange(v)
    }
  }

  const handleCustomChange = (e) => {
    setCustomText(e.target.value)
    onChange(e.target.value)
  }

  const backToSelect = () => {
    setMode('select')
    setCustomText('')
    onChange('')
  }

  if (mode === 'custom') {
    return (
      <div className={styles.sizeTypeCustom}>
        <input
          ref={inputRef}
          value={customText}
          onChange={handleCustomChange}
          placeholder="Ex: Janela de 3m, Cama Baú..."
          className={styles.sizeTypeInput}
        />
        <button type="button" className={styles.sizeTypeBack} onClick={backToSelect} title="Voltar à lista">
          ↩
        </button>
      </div>
    )
  }

  return (
    <select value={value} onChange={handleSelectChange}>
      <option value="">Selecione</option>
      {SIZE_PRESETS.map(o => <option key={o} value={o}>{o}</option>)}
      <option value={CUSTOM_VALUE}>✏ Personalizado…</option>
    </select>
  )
}

function ColorEntry({ c, i, total, onUpdate, onRemove, onMoveUp, onMoveDown, onOpenEditor }) {
  const [uploadingPattern, setUploadingPattern] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const patternRef = useRef()
  const imgRef = useRef()
  const isPattern = c.type === 'pattern'
  const hasSecond = !!c.hex_color_2

  const toggleSecond = () => {
    onUpdate(i, 'hex_color_2', hasSecond ? '' : '#CCCCCC')
  }

  const handlePatternFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPattern(true)
    try {
      const url = await uploadPattern(file)
      onUpdate(i, 'pattern_url', url)
    } catch (err) {
      alert('Erro ao subir estampa: ' + err.message)
    }
    setUploadingPattern(false)
  }

  const handleImgFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    try {
      const url = await uploadColorImage(file)
      onUpdate(i, 'image_url', url)
    } catch (err) {
      alert('Erro ao subir foto: ' + err.message)
    }
    setUploadingImg(false)
  }

  return (
    <div className="sub-section">
      <div className={styles.colorEntryHeader}>
        <span className={styles.colorEntryLabel}>
          {isPattern ? 'Estampa' : 'Cor'} {i + 1}
        </span>
        <div className={styles.orderBtns}>
          <button type="button" className={styles.orderBtn} onClick={onMoveUp} disabled={i === 0} title="Mover para cima">↑</button>
          <button type="button" className={styles.orderBtn} onClick={onMoveDown} disabled={i === total - 1} title="Mover para baixo">↓</button>
        </div>
      </div>
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
        <button type="button" className={`${styles.toggleBtn} ${!isPattern ? styles.toggleActive : ''}`} onClick={() => onUpdate(i, 'type', 'solid')}>Cor Sólida</button>
        <button type="button" className={`${styles.toggleBtn} ${isPattern ? styles.toggleActive : ''}`} onClick={() => onUpdate(i, 'type', 'pattern')}>Estampa</button>
      </div>

      {!isPattern ? (
        <>
          <div className="field">
            <label>Cor HEX</label>
            <div className={styles.colorPicker}>
              <input type="color" value={c.hex_color || '#CCCCCC'} onChange={e => onUpdate(i, 'hex_color', e.target.value)} className={styles.colorInput} />
              <input value={c.hex_color || ''} onChange={e => onUpdate(i, 'hex_color', e.target.value)} placeholder="#CCCCCC" style={{ flex: 1 }} />
            </div>
          </div>

          <label className={styles.secondColorToggle}>
            <input type="checkbox" checked={hasSecond} onChange={toggleSecond} />
            <span>Segunda cor</span>
          </label>

          {hasSecond && (
            <div className="field">
              <label>Segunda Cor HEX</label>
              <div className={styles.colorPicker}>
                <input type="color" value={c.hex_color_2 || '#CCCCCC'} onChange={e => onUpdate(i, 'hex_color_2', e.target.value)} className={styles.colorInput} />
                <input value={c.hex_color_2 || ''} onChange={e => onUpdate(i, 'hex_color_2', e.target.value)} placeholder="#CCCCCC" style={{ flex: 1 }} />
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="field">
          <label>Imagem da Estampa <span className={styles.reqNote}>(bolinha)</span></label>
          <div className={styles.patternUpload}>
            {c.pattern_url && <img src={c.pattern_url} alt="Estampa" className={styles.patternPreview} />}
            <button type="button" className={`btn btn-ghost btn-sm ${styles.uploadBtn}`} onClick={() => patternRef.current?.click()} disabled={uploadingPattern}>
              {uploadingPattern ? 'Enviando...' : c.pattern_url ? 'Trocar' : 'Selecionar'}
            </button>
            {c.pattern_url && (
              <button type="button" className={`btn btn-ghost btn-sm ${styles.editImgBtn}`}
                onClick={() => onOpenEditor(c.pattern_url, 1, `Estampa ${i + 1}`, url => onUpdate(i, 'pattern_url', url))}>
                ✂ Editar
              </button>
            )}
            <input ref={patternRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePatternFile} />
          </div>
        </div>
      )}

      {/* Foto do produto nesta cor — obrigatória para todos */}
      <div className="field">
        <label>
          Foto do produto nesta {isPattern ? 'estampa' : 'cor'}
          <span className={styles.reqLabel}> *obrigatório</span>
        </label>
        <div className={styles.patternUpload}>
          {c.image_url && <img src={c.image_url} alt="Foto da cor" className={styles.patternPreview} />}
          <button type="button" className={`btn btn-ghost btn-sm ${styles.uploadBtn} ${!c.image_url ? styles.uploadRequired : ''}`} onClick={() => imgRef.current?.click()} disabled={uploadingImg}>
            {uploadingImg ? 'Enviando...' : c.image_url ? 'Trocar foto' : 'Selecionar foto'}
          </button>
          {c.image_url && (
            <button type="button" className={`btn btn-ghost btn-sm ${styles.editImgBtn}`}
              onClick={() => onOpenEditor(c.image_url, 4 / 3, `Foto — ${isPattern ? 'Estampa' : 'Cor'} ${i + 1}`, url => onUpdate(i, 'image_url', url))}>
              ✂ Editar
            </button>
          )}
          <input ref={imgRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImgFile} />
        </div>
      </div>

      <button className="btn btn-danger btn-sm" style={{ marginTop: 8 }} onClick={() => onRemove(i)}>Remover</button>
    </div>
  )
}

export default function ProductModal({ product, sections, onClose, onSave, onCreateSection, getAR }) {
  const isEdit = !!product?.id

  const sortedSections = [...sections].sort((a, b) => a.name.localeCompare(b.name))

  const [form, setForm] = useState({
    title: product?.title || '',
    image_url: product?.image_url || '',
    video_url: product?.video_url || '',
    composition: product?.composition || '100% Poliéster',
    section_id: product?.section_id || sortedSections[0]?.id || '',
  })

  const [sizes, setSizes] = useState(
    product?.sizes?.map(s => ({
      size_type: s.size_type,
      reference: s.reference,
      quantity: s.quantity,
      // converte { Largura: '2m' } → [{ name: 'Largura', value: '2m' }]
      dims: Object.entries(s.dimensions || {}).map(([name, value]) => ({ name, value }))
    })) || []
  )

  const [colors, setColors] = useState(
    product?.colors?.map(c => ({ code: c.code, name: c.name, hex_color: c.hex_color || '#CCCCCC', hex_color_2: c.hex_color_2 || '', pattern_url: c.pattern_url || '', image_url: c.image_url || '', type: c.pattern_url ? 'pattern' : 'solid' })) || []
  )

  const [saving, setSaving] = useState(false)
  const [newSectionName, setNewSectionName] = useState('')
  const [creatingSection, setCreatingSection] = useState(false)
  const [showNewSection, setShowNewSection] = useState(false)
  const [editingImg, setEditingImg] = useState(null)
  const [showDiscard, setShowDiscard] = useState(false)
  const dirtyRef = useRef(false)

  const markDirty = () => { dirtyRef.current = true }

  const tryClose = () => {
    if (dirtyRef.current) setShowDiscard(true)
    else onClose()
  }

  const set = (k, v) => { markDirty(); setForm(f => ({ ...f, [k]: v })) }

  const openEditor = (src, aspectRatio, label, onDone) => {
    if (!src) return
    setEditingImg({ src, aspectRatio, label, onDone })
  }

  const handleEditorConfirm = async (file) => {
    const url = await uploadCroppedImage(file)
    editingImg.onDone(url)
    setEditingImg(null)
  }

  const currentSection = sections.find(s => s.id === form.section_id)
  const mainAspectRatio = getAR
    ? (getAR(form.section_id, currentSection?.name) === 'tall' ? 2 / 3 : 1)
    : (currentSection?.name?.toLowerCase().includes('cortina') ? 2 / 3 : 1)

  const addSize    = () => { markDirty(); setSizes(s => [...s, { size_type: '', reference: '', quantity: 0, dims: [] }]) }
  const removeSize = i  => { markDirty(); setSizes(s => s.filter((_, idx) => idx !== i)) }
  const updateSize = (i, k, v) => { markDirty(); setSizes(s => s.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  const addDim    = (si)           => { markDirty(); setSizes(s => s.map((x, idx) => idx === si ? { ...x, dims: [...x.dims, { name: '', value: '' }] } : x)) }
  const removeDim = (si, di)       => { markDirty(); setSizes(s => s.map((x, idx) => idx === si ? { ...x, dims: x.dims.filter((_, di2) => di2 !== di) } : x)) }
  const updateDim = (si, di, k, v) => { markDirty(); setSizes(s => s.map((x, idx) => idx === si ? { ...x, dims: x.dims.map((d, di2) => di2 === di ? { ...d, [k]: v } : d) } : x)) }

  const addColor = () => { markDirty(); setColors(c => [...c, { code: '', name: '', hex_color: '#CCCCCC', hex_color_2: '', pattern_url: '', type: 'solid' }]) }
  const removeColor = i => { markDirty(); setColors(c => c.filter((_, idx) => idx !== i)) }
  const updateColor = (i, k, v) => { markDirty(); setColors(c => c.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }
  const moveColor = (i, dir) => { markDirty(); setColors(c => {
    const next = [...c]
    const swap = i + dir
    if (swap < 0 || swap >= next.length) return c
    ;[next[i], next[swap]] = [next[swap], next[i]]
    return next
  }) }

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) return
    setCreatingSection(true)
    try {
      const created = await onCreateSection(newSectionName.trim())
      set('section_id', created.id)
      setNewSectionName('')
      setShowNewSection(false)
    } catch (err) {
      alert('Erro ao criar seção: ' + err.message)
    }
    setCreatingSection(false)
  }

  const handleSave = async () => {
    if (!form.title.trim() || !form.image_url.trim()) {
      alert('Título e URL da imagem são obrigatórios.')
      return
    }
    setSaving(true)
    try {
      const cleanColors = colors.map(({ type, ...rest }, idx) => ({
        ...rest,
        hex_color: type === 'pattern' ? null : rest.hex_color,
        hex_color_2: type === 'pattern' ? null : (rest.hex_color_2 || null),
        pattern_url: type === 'pattern' ? rest.pattern_url : null,
        sort_order: idx,
      }))
      // converte [{ name, value }] → { name: value } antes de salvar
      const cleanSizes = sizes.map(({ dims, ...rest }) => ({
        ...rest,
        dimensions: Object.fromEntries(
          (dims || []).filter(d => d.name.trim()).map(d => [d.name.trim(), d.value])
        )
      }))
      await onSave(product?.id, form, cleanSizes, cleanColors)
      onClose()
    } catch (err) {
      alert('Erro ao salvar: ' + err.message)
    }
    setSaving(false)
  }

  return (
    <>
    <motion.div className="modal-overlay" onClick={tryClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
      <motion.div className="modal" onClick={e => e.stopPropagation()} initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20 }} transition={{ type: 'spring', stiffness: 380, damping: 30 }}>
        <h2>{isEdit ? 'Editar Produto' : 'Novo Produto'}</h2>

        <div className="field">
          <label>Título</label>
          <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="Protetor para Sofá Linho" />
        </div>

        {/* ── Seção ── */}
        <div className="field">
          <label>Seção</label>
          <div className={styles.sectionRow}>
            <select value={form.section_id} onChange={e => set('section_id', e.target.value)} style={{ flex: 1 }}>
              {sortedSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <button
              type="button"
              className={`btn btn-ghost btn-sm ${styles.newSectionBtn}`}
              onClick={() => setShowNewSection(v => !v)}
            >
              {showNewSection ? '✕' : '+ Nova'}
            </button>
          </div>
        </div>

        {showNewSection && (
          <motion.div
            className={styles.newSectionBox}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className={styles.newSectionInner}>
              <input
                className={styles.newSectionInput}
                value={newSectionName}
                onChange={e => setNewSectionName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateSection()}
                placeholder="Nome da nova seção (ex: Cortina)"
                autoFocus
              />
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCreateSection}
                disabled={creatingSection || !newSectionName.trim()}
              >
                {creatingSection ? '...' : 'Criar'}
              </button>
            </div>
          </motion.div>
        )}

        <div className="field">
          <label>URL da Imagem</label>
          <div className={styles.imgFieldRow}>
            <input value={form.image_url} onChange={e => set('image_url', e.target.value)} placeholder="https://..." style={{ flex: 1 }} />
            {form.image_url && (
              <button type="button" className={`btn btn-ghost btn-sm ${styles.editImgBtn}`}
                onClick={() => openEditor(form.image_url, mainAspectRatio, 'Imagem principal', url => set('image_url', url))}>
                ✂ Editar
              </button>
            )}
          </div>
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
                  <SizeTypeField
                    value={s.size_type}
                    onChange={v => updateSize(i, 'size_type', v)}
                  />
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

              {/* ── Medidas opcionais ── */}
              {s.dims.length > 0 && (
                <div className={styles.dimsBlock}>
                  {s.dims.map((d, di) => (
                    <div key={di} className={styles.dimRow}>
                      <input
                        className={styles.dimName}
                        value={d.name}
                        onChange={e => updateDim(i, di, 'name', e.target.value)}
                        placeholder="Ex: Largura"
                      />
                      <span className={styles.dimSep}>:</span>
                      <input
                        className={styles.dimValue}
                        value={d.value}
                        onChange={e => updateDim(i, di, 'value', e.target.value)}
                        placeholder="Ex: 2,30m"
                      />
                      <button
                        type="button"
                        className={styles.dimRemove}
                        onClick={() => removeDim(i, di)}
                        title="Remover medida"
                      >×</button>
                    </div>
                  ))}
                </div>
              )}

              <div className={styles.sizeActions}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => addDim(i)}>
                  + Medida
                </button>
                <button className="btn btn-danger btn-sm" onClick={() => removeSize(i)}>Remover tamanho</button>
              </div>
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
            <ColorEntry
              key={i}
              c={c}
              i={i}
              total={colors.length}
              onUpdate={updateColor}
              onRemove={removeColor}
              onMoveUp={() => moveColor(i, -1)}
              onMoveDown={() => moveColor(i, 1)}
              onOpenEditor={openEditor}
            />
          ))}
        </div>

        <div className={styles.footer}>
          <button className="btn btn-ghost" onClick={tryClose}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando...' : isEdit ? 'Salvar Alterações' : 'Criar Produto'}
          </button>
        </div>
      </motion.div>
    </motion.div>

    <AnimatePresence>
      {editingImg && (
        <ImageEditor
          key="img-editor"
          src={editingImg.src}
          aspectRatio={editingImg.aspectRatio}
          label={editingImg.label}
          onConfirm={handleEditorConfirm}
          onClose={() => setEditingImg(null)}
        />
      )}
      {showDiscard && (
        <ConfirmDialog
          key="discard-dialog"
          message="Descartar as alterações? Todas as mudanças feitas serão perdidas."
          confirmLabel="Descartar"
          cancelLabel="Continuar editando"
          confirmVariant="btn-danger"
          onConfirm={onClose}
          onCancel={() => setShowDiscard(false)}
        />
      )}
    </AnimatePresence>
    </>
  )
}
