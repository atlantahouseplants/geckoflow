import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '../components/Layout'
import GeckoForm from '../components/GeckoForm'
import { useGecko } from '../context/GeckoContext'
import { useGeckoSubmission } from '../hooks/useGeckoSubmission'

export default function ReviewPage() {
  const navigate = useNavigate()
  const { photos, removePhoto } = useGecko()
  const { submit, reset, isSubmitting, submitError, submitSuccess, canSubmit } = useGeckoSubmission()
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)

  // Redirect if no photos
  useEffect(() => {
    if (photos.length === 0 && !showSuccess) {
      navigate('/capture')
    }
  }, [photos.length, navigate, showSuccess])

  const handleSubmit = async () => {
    const success = await submit()
    if (success) {
      setShowSuccess(true)
    }
  }

  const handleAddAnother = () => {
    reset()
    setShowSuccess(false)
    navigate('/capture')
  }

  const handleViewQueue = () => {
    reset()
    setShowSuccess(false)
    navigate('/queue')
  }

  // Success screen
  if (showSuccess) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
          <div className="celebrate">
            <div className="text-8xl mb-6">✨🦎✨</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Submitted!</h1>
            <p className="text-gray-500 mb-8">Your gecko is being processed by AI magic</p>
          </div>

          <div className="w-full max-w-xs space-y-3">
            <button
              onClick={handleAddAnother}
              className="w-full bg-gecko-green text-white text-lg font-semibold py-4 px-8 rounded-2xl touch-target"
            >
              Add Another Gecko
            </button>
            <button
              onClick={handleViewQueue}
              className="w-full bg-gray-100 text-gray-700 text-lg font-semibold py-4 px-8 rounded-2xl touch-target"
            >
              View Queue
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      {/* Photo Carousel */}
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
        <div className="relative">
          <div className="carousel">
            {photos.map((photo, index) => (
              <div
                key={index}
                className="carousel-item relative"
                style={{ display: index === currentPhotoIndex ? 'block' : 'none' }}
              >
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-full aspect-square object-cover"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full touch-target"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Photo indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
              {photos.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentPhotoIndex(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentPhotoIndex ? 'bg-white' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Add more photos button */}
        {photos.length < 5 && (
          <button
            onClick={() => navigate('/capture')}
            className="w-full p-3 text-gecko-green font-medium flex items-center justify-center gap-2 border-t border-gray-100"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add More Photos ({photos.length}/5)
          </button>
        )}
      </div>

      {/* Form */}
      <GeckoForm />

      {/* Error message */}
      {submitError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          {submitError}
        </div>
      )}

      {/* Submit Button */}
      <div className="mt-6 pb-6">
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className="w-full bg-gecko-green text-white text-lg font-semibold py-4 px-8 rounded-2xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed touch-target flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <div className="spinner" />
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <span>Submit to GeckoFlow</span>
              <span>✨</span>
            </>
          )}
        </button>
      </div>
    </Layout>
  )
}
