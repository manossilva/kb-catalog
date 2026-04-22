import { supabase } from './supabase'

/**
 * Comprime e converte qualquer imagem para WebP antes de subir.
 * Reduz tipicamente de 2–10 MB para 100–300 KB.
 */
async function compressToWebP(file, maxWidth = 1200, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const objectUrl = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(objectUrl)

      let { width, height } = img
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d').drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('Falha ao comprimir imagem')); return }
          const webpName = file.name.replace(/\.[^.]+$/, '.webp')
          resolve(new File([blob], webpName, { type: 'image/webp' }))
        },
        'image/webp',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl)
      // Se falhar a compressão, sobe o original mesmo
      resolve(file)
    }

    img.src = objectUrl
  })
}

async function uploadToPatterns(file, folder = '') {
  // Comprime para WebP antes de qualquer upload
  const compressed = await compressToWebP(file)

  const prefix = folder ? `${folder}/` : ''
  const path = `${prefix}${Date.now()}-${Math.random().toString(36).slice(2)}.webp`

  const { error } = await supabase.storage
    .from('patterns')
    .upload(path, compressed, {
      cacheControl: '31536000', // 1 ano de cache no browser
      upsert: false,
      contentType: 'image/webp',
    })

  if (error) throw error

  const { data } = supabase.storage.from('patterns').getPublicUrl(path)
  return data.publicUrl
}

// Imagem da bolinha de estampa (preview do padrão)
export const uploadPattern = (file) => uploadToPatterns(file, 'patterns')

// Foto do produto em uma cor ou estampa específica
export const uploadColorImage = (file) => uploadToPatterns(file, 'color-images')

// Imagem cortada pelo editor (qualquer tipo)
export const uploadCroppedImage = (file) => uploadToPatterns(file, 'cropped')
