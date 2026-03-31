/**
 * Downloads a file by creating a temporary link and triggering a click
 * @param data - The file content
 * @param filename - The name of the file to download
 * @param mimeType - The MIME type of the file (default: 'text/csv;charset=utf-8;')
 */
export function downloadFile(data: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;'): void {
    const blob = new Blob([data], { type: mimeType })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    // Clean up the URL object
    URL.revokeObjectURL(url)
}

/**
 * Generates a filename with current date
 * @param prefix - The prefix for the filename (e.g., 'projects_export')
 * @param extension - The file extension (default: 'csv')
 * @returns Filename in format: prefix_YYYY-MM-DD.extension
 */
export function generateDateFilename(prefix: string, extension: string = 'csv'): string {
    const date = new Date().toISOString().split('T')[0]
    return `${prefix}_${date}.${extension}`
}
