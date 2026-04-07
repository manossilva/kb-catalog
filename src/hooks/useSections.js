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
      .order('name')          // ordem alfabética no banco
    if (!error) setSections(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const createSection = useCallback(async (name) => {
    const slug = name
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // remove acentos
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

  return { sections, loading, reload: load, createSection }
}
