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
