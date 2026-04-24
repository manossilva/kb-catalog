import { useState } from 'react'
import { getDefaultAR } from '../lib/sectionConfig'

const KEY = 'kb_section_ar'

export function useSectionARConfig() {
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}') }
    catch { return {} }
  })

  const getAR = (sectionId, sectionName) =>
    config[sectionId] ?? getDefaultAR(sectionName)

  const setAR = (sectionId, ratio) =>
    setConfig(prev => {
      const next = { ...prev, [sectionId]: ratio }
      localStorage.setItem(KEY, JSON.stringify(next))
      return next
    })

  return { getAR, setAR }
}
