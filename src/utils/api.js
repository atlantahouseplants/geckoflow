const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL

/**
 * Submit gecko data to the Make.com webhook
 * @param {Object} payload - The gecko submission data
 * @returns {Promise<Object>} - Response from webhook
 */
export async function submitToWebhook(payload) {
  if (!WEBHOOK_URL) {
    throw new Error('Webhook URL not configured. Please set VITE_WEBHOOK_URL in your .env file.')
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30s timeout

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`)
    }

    // Try to parse JSON response, but handle empty responses
    const text = await response.text()
    if (text) {
      try {
        return JSON.parse(text)
      } catch {
        return { success: true, raw: text }
      }
    }

    return { success: true }
  } catch (error) {
    clearTimeout(timeoutId)

    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.')
    }

    throw error
  }
}

/**
 * Check if webhook is configured
 * @returns {boolean}
 */
export function isWebhookConfigured() {
  return !!WEBHOOK_URL
}

/**
 * Retry a failed submission
 * @param {Object} submission - The submission to retry
 * @returns {Promise<Object>}
 */
export async function retrySubmission(submission) {
  if (!submission.payload) {
    throw new Error('No payload found for retry')
  }

  return submitToWebhook(submission.payload)
}
