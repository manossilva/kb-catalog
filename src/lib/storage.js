import { supabase } from './supabase'

async function uploadToPatterns(file, folder = '') {
  const ext = file.name.split('.').pop()
  const prefix = folder ? `${folder}/` : ''
  const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage
    .from('patterns')
    .upload(path, file, { cacheControl: '3600', upsert: false })

  if (error) throw error

  const { data } = supabase.storage.from('patterns').getPublicUrl(path)
  return data.publicUrl
}

// Imagem da bolinha de estampa (preview do padrão)
export const uploadPattern = (file) => uploadToPatterns(file, 'patterns')

// Foto do produto em uma cor ou estampa específica
export const uploadColorImage = (file) => uploadToPatterns(file, 'color-images')
