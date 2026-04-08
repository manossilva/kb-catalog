import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)

    const [prodRes, sizeRes, colorRes] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('product_sizes').select('*'),
      supabase.from('product_colors').select('*'),
    ])

    const prods = (prodRes.data || []).map(p => ({
      ...p,
      sizes: (sizeRes.data || []).filter(s => s.product_id === p.id),
      colors: (colorRes.data || []).filter(c => c.product_id === p.id),
    }))

    setProducts(prods)
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createProduct = useCallback(async (product, sizes, colors) => {
    const { data, error } = await supabase
      .from('products')
      .insert(product)
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
    return productId
  }, [load])

  const updateProduct = useCallback(async (id, product, sizes, colors) => {
    const { error } = await supabase
      .from('products')
      .update(product)
      .eq('id', id)
    if (error) throw error

    // Replace sizes and colors (delete + insert)
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
  }, [load])

  const deleteProduct = useCallback(async (id) => {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)
    if (error) throw error
    await load()
  }, [load])

  const toggleVisibility = useCallback(async (id, visible) => {
    const { error } = await supabase
      .from('products')
      .update({ visible })
      .eq('id', id)
    if (error) throw error
    // Atualiza local sem recarregar tudo
    setProducts(ps => ps.map(p => p.id === id ? { ...p, visible } : p))
  }, [])

  return { products, loading, reload: load, createProduct, updateProduct, deleteProduct, toggleVisibility }
}
