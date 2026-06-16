import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useSections() {
  const [sections, setSections] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('sections')
      .select('*')
      .order('sort_order', { ascending: true })
    if (!error) setSections(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createSection = useCallback(async (name) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')

    const { data: maxData } = await supabase
      .from('sections')
      .select('sort_order')
      .order('sort_order', { ascending: false })
      .limit(1)
    const nextOrder = ((maxData?.[0]?.sort_order) ?? 0) + 10

    const { data, error } = await supabase
      .from('sections')
      .insert({ name: name.trim(), slug, sort_order: nextOrder })
      .select()
    if (error) throw error
    await load()
    return data[0]
  }, [load])

  const updateSection = useCallback(async (id, name) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const { error } = await supabase
      .from('sections')
      .update({ name: name.trim(), slug })
      .eq('id', id)
    if (error) throw error
    await load()
  }, [load])

  const deleteSection = useCallback(async (id) => {
    const { error } = await supabase
      .from('sections')
      .delete()
      .eq('id', id)
    if (error) throw error
    await load()
  }, [load])

  const updateSectionAR = useCallback(async (id, ar_ratio) => {
    const { error } = await supabase
      .from('sections')
      .update({ ar_ratio })
      .eq('id', id)
    if (error) throw error
    await load()
  }, [load])

  const reorderSection = useCallback(async (idA, sortOrderA, idB, sortOrderB) => {
    // Optimistic update — troca imediata na UI
    setSections(ss => {
      const updated = ss.map(s => {
        if (s.id === idA) return { ...s, sort_order: sortOrderB }
        if (s.id === idB) return { ...s, sort_order: sortOrderA }
        return s
      })
      return updated.sort((x, y) => (x.sort_order ?? 0) - (y.sort_order ?? 0))
    })

    const [resA, resB] = await Promise.all([
      supabase.from('sections').update({ sort_order: sortOrderB }).eq('id', idA),
      supabase.from('sections').update({ sort_order: sortOrderA }).eq('id', idB),
    ])

    if (resA.error || resB.error) await load()
  }, [load])

  return { sections, loading, reload: load, createSection, updateSection, deleteSection, updateSectionAR, reorderSection }
}
