import imageCompression from 'browser-image-compression'

const MAX_SIZE_KB = 800
const MAX_WIDTH = 1920

/**
 * Compress an image from a data URL
 * @param {string} dataUrl - Base64 data URL of the image
 * @returns {Promise<string>} - Compressed base64 data URL
 */
export async function compressImage(dataUrl) {
  try {
    // Convert data URL to File
    const response = await fetch(dataUrl)
    const blob = await response.blob()
    const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' })

    const options = {
      maxSizeMB: MAX_SIZE_KB / 1024,
      maxWidthOrHeight: MAX_WIDTH,
      useWebWorker: true,
      fileType: 'image/jpeg',
      initialQuality: 0.8
    }

    const compressedFile = await imageCompression(file, options)

    // Convert back to data URL
    return await fileToDataUrl(compressedFile)
  } catch (error) {
    console.error('Image compression failed:', error)
    // Return original if compression fails
    return dataUrl
  }
}

/**
 * Convert a File to data URL
 * @param {File} file - File object
 * @returns {Promise<string>} - Base64 data URL
 */
export function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * Get image dimensions from a data URL
 * @param {string} dataUrl - Base64 data URL
 * @returns {Promise<{width: number, height: number}>}
 */
export function getImageDimensions(dataUrl) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve({ width: img.width, height: img.height })
    img.onerror = reject
    img.src = dataUrl
  })
}

/**
 * Get file size in KB from a data URL
 * @param {string} dataUrl - Base64 data URL
 * @returns {number} - Size in KB
 */
export function getDataUrlSizeKB(dataUrl) {
  // Remove data URL prefix
  const base64 = dataUrl.split(',')[1]
  // Calculate size: base64 is 4/3 the size of binary
  const sizeBytes = (base64.length * 3) / 4
  return Math.round(sizeBytes / 1024)
}

/**
 * Process image from file input
 * @param {File} file - Image file
 * @returns {Promise<string>} - Compressed base64 data URL
 */
export async function processImageFile(file) {
  const options = {
    maxSizeMB: MAX_SIZE_KB / 1024,
    maxWidthOrHeight: MAX_WIDTH,
    useWebWorker: true,
    fileType: 'image/jpeg',
    initialQuality: 0.8
  }

  const compressedFile = await imageCompression(file, options)
  return await fileToDataUrl(compressedFile)
}
