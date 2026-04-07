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
      .order('sort_order')
    if (!error) setSections(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return { sections, loading, reload: load }
}
