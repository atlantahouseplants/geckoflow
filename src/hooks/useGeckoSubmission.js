import { useState, useCallback } from 'react'
import { useGecko } from '../context/GeckoContext'
import { submitToWebhook } from '../utils/api'

export function useGeckoSubmission() {
  const {
    photos,
    geckoData,
    aiSettings,
    addSubmission,
    updateSubmissionStatus,
    resetForm
  } = useGecko()

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  const submit = useCallback(async () => {
    if (photos.length === 0) {
      setSubmitError('At least one photo is required')
      return false
    }

    setIsSubmitting(true)
    setSubmitError(null)
    setSubmitSuccess(false)

    // Create submission record
    const submissionId = `gecko_${Date.now()}`
    const submission = {
      id: submissionId,
      timestamp: new Date().toISOString(),
      thumbnail: photos[0],
      morph: geckoData.morph || 'Analyzing...',
      status: 'pending',
      photos: photos.length
    }

    addSubmission(submission)

    try {
      // Build payload
      const payload = {
        timestamp: new Date().toISOString(),
        images: photos.map((base64, index) => ({
          order: index + 1,
          base64
        })),
        gecko_data: {
          morph: geckoData.morph || null,
          sex: geckoData.sex,
          weight_grams: geckoData.weight_grams ? Number(geckoData.weight_grams) : null,
          hatch_date: geckoData.hatch_date || null,
          price: geckoData.price ? Number(geckoData.price) : null,
          special_notes: geckoData.special_notes || null,
          custom_name: geckoData.custom_name || null
        },
        ai_settings: {
          tone: aiSettings.tone,
          auto_publish: aiSettings.auto_publish,
          create_social_posts: aiSettings.create_social_posts
        }
      }

      updateSubmissionStatus(submissionId, 'processing')

      const response = await submitToWebhook(payload)

      updateSubmissionStatus(submissionId, 'complete', {
        response,
        morph: geckoData.morph || response?.morph || 'Unknown'
      })

      setSubmitSuccess(true)
      return true
    } catch (err) {
      console.error('Submission error:', err)

      // Store for retry if offline
      if (!navigator.onLine) {
        updateSubmissionStatus(submissionId, 'pending', {
          error: 'Queued for retry when online'
        })
      } else {
        updateSubmissionStatus(submissionId, 'failed', {
          error: err.message
        })
      }

      setSubmitError(err.message || 'Submission failed. Please try again.')
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [photos, geckoData, aiSettings, addSubmission, updateSubmissionStatus])

  const reset = useCallback(() => {
    resetForm()
    setSubmitError(null)
    setSubmitSuccess(false)
  }, [resetForm])

  return {
    submit,
    reset,
    isSubmitting,
    submitError,
    submitSuccess,
    canSubmit: photos.length > 0
  }
}
