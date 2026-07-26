/**
 * Fetches an image URL and returns it as a base64 data URL. Returns null on any
 * failure (network error, CORS, missing image) so callers can degrade
 * gracefully — e.g. omit a logo from the PDF rather than fail the export.
 */
export async function imageToDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null
  try {
    const response = await fetch(url)
    if (!response.ok) return null
    const blob = await response.blob()
    return await new Promise<string | null>((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null)
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch {
    return null
  }
}

/**
 * Loads an image URL and re-encodes it as a PNG data URL via a canvas. Use this
 * for formats jsPDF cannot embed natively (e.g. WEBP). Returns null on failure
 * so callers can omit the image gracefully.
 */
export async function imageToPngDataUrl(url: string | null | undefined): Promise<string | null> {
  if (!url) return null
  try {
    return await new Promise<string | null>((resolve) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return resolve(null)
        ctx.drawImage(img, 0, 0)
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = () => resolve(null)
      img.src = url
    })
  } catch {
    return null
  }
}
