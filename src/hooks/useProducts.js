import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const BROADCAST_CHANNEL = 'catalog-updates'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const reloadTimer = useRef(null)
  const broadcastChRef = useRef(null)

  const load = useCallback(async () => {
    setLoading(true)

    const [prodRes, sizeRes, colorRes] = await Promise.all([
      supabase.from('products').select('*').order('sort_order', { ascending: true }).order('created_at', { ascending: false }),
      supabase.from('product_sizes').select('*'),
      supabase.from('product_colors').select('*').order('sort_order', { ascending: true }),
    ])

    const parseCode = (code = '') => {
      const n = parseInt(code, 10)
      return isNaN(n) ? Infinity : n
    }

    const prods = (prodRes.data || []).map(p => ({
      ...p,
      sizes: (sizeRes.data || []).filter(s => s.product_id === p.id),
      colors: (colorRes.data || [])
        .filter(c => c.product_id === p.id)
        .sort((a, b) => parseCode(a.code) - parseCode(b.code) || (a.code ?? '').localeCompare(b.code ?? '')),
    }))

    setProducts(prods)
    setLoading(false)
  }, [])

  // Realtime: re-carrega automaticamente quando qualquer tabela muda.
  // Debounce de 400ms para agrupar múltiplos eventos de um mesmo save.
  useEffect(() => {
    const scheduleReload = () => {
      clearTimeout(reloadTimer.current)
      reloadTimer.current = setTimeout(load, 400)
    }

    const channel = supabase
      .channel('catalog-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_sizes' }, scheduleReload)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_colors' }, scheduleReload)
      .subscribe()

    // Canal dedicado para broadcast (notificar clientes a recarregar)
    const broadcastCh = supabase.channel(BROADCAST_CHANNEL).subscribe()
    broadcastChRef.current = broadcastCh

    return () => {
      clearTimeout(reloadTimer.current)
      supabase.removeChannel(channel)
      supabase.removeChannel(broadcastCh)
      broadcastChRef.current = null
    }
  }, [load])

  useEffect(() => { load() }, [load])

  // Envia broadcast para todos os clientes conectados recarregarem
  const broadcastUpdate = useCallback(async () => {
    try {
      await broadcastChRef.current?.send({
        type: 'broadcast',
        event: 'catalog-updated',
        payload: { ts: Date.now() },
      })
    } catch { /* ignora erros de broadcast */ }
  }, [])

  const reorderProduct = useCallback(async (idA, sortOrderA, idB, sortOrderB) => {
    // Optimistic update — troca imediata na UI
    setProducts(ps => {
      const updated = ps.map(p => {
        if (p.id === idA) return { ...p, sort_order: sortOrderB }
        if (p.id === idB) return { ...p, sort_order: sortOrderA }
        return p
      })
      return updated.sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0))
    })

    // Persiste no banco
    const [resA, resB] = await Promise.all([
      supabase.from('products').update({ sort_order: sortOrderB }).eq('id', idA),
      supabase.from('products').update({ sort_order: sortOrderA }).eq('id', idB),
    ])

    if (resA.error || resB.error) await load()
  }, [load])

  const createProduct = useCallback(async (product, sizes, colors) => {
    const { data: maxData } = await supabase
      .from('products')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
    const nextOrder = ((maxData?.[0]?.sort_order) ?? 0) + 10

    const { data, error } = await supabase
      .from('products')
      .insert({ ...product, sort_order: nextOrder })
      .select()
    if (error) throw error

    const productId = data[0].id

    if (sizes.length > 0) {
      const { error: sErr } = await supabase
        .from('product_sizes')
        .insert(sizes.map(s => ({ ...s, product_id: productId })))
      if (sErr) throw sErr
    }

    if (colors.length > 0) {
      const { error: cErr } = await supabase
        .from('product_colors')
        .insert(colors.map(c => ({ ...c, product_id: productId })))
      if (cErr) throw cErr
    }

    await load()
    await broadcastUpdate()
    return productId
  }, [load, broadcastUpdate])

  const updateProduct = useCallback(async (id, product, sizes, colors) => {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
    if (error) throw error

    await supabase.from('product_sizes').delete().eq('product_id', id)
    await supabase.from('product_colors').delete().eq('product_id', id)

    if (sizes.length > 0) {
      await supabase
        .from('product_sizes')
        .insert(sizes.map(s => ({ ...s, product_id: id })))
    }

    if (colors.length > 0) {
      await supabase
        .from('product_colors')
        .insert(colors.map(c => ({ ...c, product_id: id })))
    }

    await load()
    await broadcastUpdate()
  }, [load, broadcastUpdate])

  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
    await load()
    await broadcastUpdate()
  }, [load, broadcastUpdate])

  const toggleVisibility = useCallback(async (id, visible) => {
    const { error } = await supabase
      .from('products')
      .update({ visible })
      .eq('id', id)
    if (error) throw error
    setProducts(ps => ps.map(p => p.id === id ? { ...p, visible } : p))
    await broadcastUpdate()
  }, [broadcastUpdate])

  return { products, loading, reload: load, broadcastUpdate, createProduct, updateProduct, deleteProduct, toggleVisibility, reorderProduct }
}
