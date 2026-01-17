import { useEffect, useRef } from 'react'
import { useCamera } from '../hooks/useCamera'
import { useGecko } from '../context/GeckoContext'
import { compressImage } from '../utils/imageUtils'

export default function PhotoCapture({ onNext }) {
  const {
    videoRef,
    isReady,
    error,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera
  } = useCamera()

  const { photos, addPhoto, removePhoto } = useGecko()
  const fileInputRef = useRef(null)

  useEffect(() => {
    startCamera()
    return () => stopCamera()
  }, [])

  const handleCapture = async () => {
    const photoData = capturePhoto()
    if (photoData) {
      const compressed = await compressImage(photoData)
      addPhoto(compressed)
    }
  }

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = async (event) => {
        const compressed = await compressImage(event.target.result)
        addPhoto(compressed)
      }
      reader.readAsDataURL(file)
    }
    e.target.value = ''
  }

  if (error) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-gray-900">
        <div className="bg-white rounded-2xl p-6 max-w-sm">
          <div className="text-4xl mb-4">📷</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Camera Access Needed</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={startCamera}
            className="w-full bg-gecko-green text-white font-semibold py-3 px-6 rounded-xl touch-target"
          >
            Try Again
          </button>
          <div className="mt-4">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-gecko-green font-medium"
            >
              Or upload from gallery
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-black">
      {/* Camera Preview */}
      <div className="flex-1 relative camera-container">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Camera switch button */}
        <button
          onClick={switchCamera}
          className="absolute top-4 right-4 bg-black/50 text-white p-3 rounded-full touch-target"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        {/* Photo count indicator */}
        <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium">
          {photos.length}/5 photos
        </div>

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <div className="text-white text-center">
              <div className="spinner mx-auto mb-4" />
              <p>Starting camera...</p>
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {photos.length > 0 && (
        <div className="bg-black/90 p-3">
          <div className="thumbnail-strip">
            {photos.map((photo, index) => (
              <div key={index} className="relative flex-shrink-0">
                <img
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  className="w-16 h-16 object-cover rounded-lg"
                />
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-black p-6 pb-8">
        <div className="flex items-center justify-center gap-8">
          {/* Gallery button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-white/20 text-white p-4 rounded-full touch-target"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileSelect}
          />

          {/* Capture button */}
          <button
            onClick={handleCapture}
            disabled={!isReady || photos.length >= 5}
            className="capture-btn w-20 h-20 bg-white rounded-full flex items-center justify-center disabled:opacity-50 touch-target"
          >
            <div className="w-16 h-16 bg-white border-4 border-gray-300 rounded-full" />
          </button>

          {/* Next button */}
          {photos.length > 0 ? (
            <button
              onClick={onNext}
              className="bg-gecko-green text-white px-6 py-4 rounded-full font-semibold touch-target"
            >
              Next
            </button>
          ) : (
            <div className="w-20" /> // Spacer
          )}
        </div>
      </div>
    </div>
  )
}
