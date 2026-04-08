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
      .order('name')
    if (!error) setSections(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createSection = useCallback(async (name) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const { data, error } = await supabase
      .from('sections')
      .insert({ name: name.trim(), slug })
      .select()
    if (error) throw error
    await load()
    return data[0]
  }, [load])

  const updateSection = useCallback(async (id, name) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
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

  return { sections, loading, reload: load, createSection, updateSection, deleteSection }
}
