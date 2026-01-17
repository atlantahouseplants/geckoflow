import { useGecko } from '../context/GeckoContext'

const TONES = [
  { id: 'fun', label: 'Fun & Playful', emoji: '🎉' },
  { id: 'professional', label: 'Professional', emoji: '💼' },
  { id: 'cute', label: 'Cute & Adorable', emoji: '💕' }
]

export default function ToneSelector() {
  const { aiSettings, updateAiSettings } = useGecko()

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        AI Tone
      </label>
      <div className="grid grid-cols-3 gap-2">
        {TONES.map((tone) => (
          <button
            key={tone.id}
            onClick={() => updateAiSettings('tone', tone.id)}
            className={`p-3 rounded-xl text-center transition-all ${
              aiSettings.tone === tone.id
                ? 'bg-gecko-green text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <div className="text-xl mb-1">{tone.emoji}</div>
            <div className="text-xs font-medium leading-tight">{tone.label}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
