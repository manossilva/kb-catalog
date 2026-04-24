export const AR_SQUARE = 'square' // 1:1
export const AR_TALL   = 'tall'   // 2:3

export function getDefaultAR(sectionName) {
  return sectionName?.toLowerCase().includes('cortina') ? AR_TALL : AR_SQUARE
}

// Converte o identificador de AR para o valor numérico usado pelo ImageEditor
export function arToRatio(ar) {
  return ar === AR_TALL ? 2 / 3 : 1
}
