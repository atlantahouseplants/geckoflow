import { useState, useMemo } from 'react'
import { useGecko } from '../context/GeckoContext'
import ToneSelector from './ToneSelector'

const MORPH_SUGGESTIONS = [
  'Harlequin', 'Flame', 'Dalmatian', 'Pinstripe', 'Lilly White', 'Phantom',
  'Tiger', 'Tricolor', 'Cream', 'Red', 'Orange', 'Yellow', 'Bi-Color',
  'Extreme Harlequin', 'Super Dalmatian', 'Partial Pinstripe', 'Full Pinstripe',
  'Brindle', 'Chevron', 'Halloween', 'Lavender', 'Mocha', 'Olive', 'Tangerine', 'White Wall'
]

export default function GeckoForm() {
  const { geckoData, updateGeckoData, aiSettings, updateAiSettings, lastPrice } = useGecko()
  const [showMorphSuggestions, setShowMorphSuggestions] = useState(false)

  const filteredMorphs = useMemo(() => {
    if (!geckoData.morph) return MORPH_SUGGESTIONS
    const search = geckoData.morph.toLowerCase()
    return MORPH_SUGGESTIONS.filter(m => m.toLowerCase().includes(search))
  }, [geckoData.morph])

  const calculateAge = (hatchDate) => {
    if (!hatchDate) return null
    const hatch = new Date(hatchDate)
    const now = new Date()
    const months = Math.floor((now - hatch) / (1000 * 60 * 60 * 24 * 30))
    if (months < 1) {
      const weeks = Math.floor((now - hatch) / (1000 * 60 * 60 * 24 * 7))
      return `${weeks} week${weeks !== 1 ? 's' : ''} old`
    }
    return `${months} month${months !== 1 ? 's' : ''} old`
  }

  return (
    <div className="space-y-6">
      {/* Quick Info Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Quick Info (Optional)</h3>

        {/* Morph with autocomplete */}
        <div className="mb-4 relative">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Morph / Genetics
          </label>
          <input
            type="text"
            value={geckoData.morph}
            onChange={(e) => updateGeckoData('morph', e.target.value)}
            onFocus={() => setShowMorphSuggestions(true)}
            onBlur={() => setTimeout(() => setShowMorphSuggestions(false), 200)}
            placeholder="e.g., Harlequin Pinstripe"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gecko-green focus:ring-1 focus:ring-gecko-green outline-none"
          />
          {showMorphSuggestions && filteredMorphs.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
              {filteredMorphs.slice(0, 8).map((morph) => (
                <button
                  key={morph}
                  onClick={() => {
                    updateGeckoData('morph', geckoData.morph ? `${geckoData.morph} ${morph}` : morph)
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl"
                >
                  {morph}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sex selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sex
          </label>
          <div className="segmented-control">
            {['male', 'female', 'unsexed'].map((sex) => (
              <button
                key={sex}
                onClick={() => updateGeckoData('sex', sex)}
                className={geckoData.sex === sex ? 'active' : ''}
              >
                {sex.charAt(0).toUpperCase() + sex.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Weight and Price row */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Weight (grams)
            </label>
            <input
              type="number"
              value={geckoData.weight_grams}
              onChange={(e) => updateGeckoData('weight_grams', e.target.value)}
              placeholder="45"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gecko-green focus:ring-1 focus:ring-gecko-green outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price ($)
            </label>
            <input
              type="number"
              value={geckoData.price}
              onChange={(e) => updateGeckoData('price', e.target.value)}
              placeholder={lastPrice || '350'}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gecko-green focus:ring-1 focus:ring-gecko-green outline-none"
            />
          </div>
        </div>

        {/* Hatch Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hatch Date
          </label>
          <input
            type="date"
            value={geckoData.hatch_date}
            onChange={(e) => updateGeckoData('hatch_date', e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gecko-green focus:ring-1 focus:ring-gecko-green outline-none"
          />
          {geckoData.hatch_date && (
            <p className="text-sm text-gecko-green mt-1">
              {calculateAge(geckoData.hatch_date)}
            </p>
          )}
        </div>
      </div>

      {/* AI Settings Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">AI Settings</h3>

        <ToneSelector />

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Auto-publish to store</span>
            <button
              onClick={() => updateAiSettings('auto_publish', !aiSettings.auto_publish)}
              className={`toggle ${aiSettings.auto_publish ? 'active' : ''}`}
            />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Create social media posts</span>
            <button
              onClick={() => updateAiSettings('create_social_posts', !aiSettings.create_social_posts)}
              className={`toggle ${aiSettings.create_social_posts ? 'active' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-4">Notes (Optional)</h3>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Custom Name
          </label>
          <input
            type="text"
            value={geckoData.custom_name}
            onChange={(e) => updateGeckoData('custom_name', e.target.value)}
            placeholder="Override AI-generated name"
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gecko-green focus:ring-1 focus:ring-gecko-green outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Special Notes
          </label>
          <textarea
            value={geckoData.special_notes}
            onChange={(e) => updateGeckoData('special_notes', e.target.value)}
            placeholder="Anything unique about this gecko..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-gecko-green focus:ring-1 focus:ring-gecko-green outline-none resize-none"
          />
        </div>
      </div>
    </div>
  )
}
