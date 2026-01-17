import { createContext, useContext, useState, useEffect } from 'react'

const GeckoContext = createContext(null)

const STORAGE_KEY = 'geckoflow_submissions'
const LAST_PRICE_KEY = 'geckoflow_last_price'

export function GeckoProvider({ children }) {
  const [photos, setPhotos] = useState([])
  const [geckoData, setGeckoData] = useState({
    morph: '',
    sex: 'unsexed',
    weight_grams: '',
    hatch_date: '',
    price: '',
    special_notes: '',
    custom_name: ''
  })
  const [aiSettings, setAiSettings] = useState({
    tone: 'fun',
    auto_publish: true,
    create_social_posts: true
  })
  const [submissions, setSubmissions] = useState([])
  const [lastPrice, setLastPrice] = useState('')

  // Load submissions and last price from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setSubmissions(JSON.parse(stored))
      }
      const storedPrice = localStorage.getItem(LAST_PRICE_KEY)
      if (storedPrice) {
        setLastPrice(storedPrice)
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e)
    }
  }, [])

  // Save submissions to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(submissions))
    } catch (e) {
      console.error('Failed to save to localStorage:', e)
    }
  }, [submissions])

  const addPhoto = (photoData) => {
    if (photos.length < 5) {
      setPhotos(prev => [...prev, photoData])
    }
  }

  const removePhoto = (index) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
  }

  const clearPhotos = () => {
    setPhotos([])
  }

  const updateGeckoData = (field, value) => {
    setGeckoData(prev => ({ ...prev, [field]: value }))
    if (field === 'price' && value) {
      setLastPrice(value)
      localStorage.setItem(LAST_PRICE_KEY, value)
    }
  }

  const updateAiSettings = (field, value) => {
    setAiSettings(prev => ({ ...prev, [field]: value }))
  }

  const addSubmission = (submission) => {
    setSubmissions(prev => [submission, ...prev])
  }

  const updateSubmissionStatus = (id, status, data = {}) => {
    setSubmissions(prev =>
      prev.map(sub =>
        sub.id === id ? { ...sub, status, ...data } : sub
      )
    )
  }

  const resetForm = () => {
    setPhotos([])
    setGeckoData({
      morph: '',
      sex: 'unsexed',
      weight_grams: '',
      hatch_date: '',
      price: lastPrice,
      special_notes: '',
      custom_name: ''
    })
    setAiSettings({
      tone: 'fun',
      auto_publish: true,
      create_social_posts: true
    })
  }

  const pendingCount = submissions.filter(s =>
    s.status === 'pending' || s.status === 'processing'
  ).length

  return (
    <GeckoContext.Provider value={{
      photos,
      addPhoto,
      removePhoto,
      clearPhotos,
      geckoData,
      updateGeckoData,
      aiSettings,
      updateAiSettings,
      submissions,
      addSubmission,
      updateSubmissionStatus,
      resetForm,
      lastPrice,
      pendingCount
    }}>
      {children}
    </GeckoContext.Provider>
  )
}

export function useGecko() {
  const context = useContext(GeckoContext)
  if (!context) {
    throw new Error('useGecko must be used within a GeckoProvider')
  }
  return context
}
