import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useGecko } from '../context/GeckoContext'

export default function HomePage() {
  const { submissions, pendingCount } = useGecko()
  const completedCount = submissions.filter(s => s.status === 'complete').length

  return (
    <Layout>
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        {/* Hero */}
        <div className="text-8xl mb-6">🦎</div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">GeckoFlow</h1>
        <p className="text-gray-500 mb-8">Quick gecko listings, powered by AI</p>

        {/* Main CTA */}
        <Link
          to="/capture"
          className="w-full max-w-xs bg-gecko-green text-white text-lg font-semibold py-4 px-8 rounded-2xl shadow-lg hover:bg-gecko-green-dark transition-colors touch-target flex items-center justify-center gap-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Gecko
        </Link>

        {/* Stats */}
        {submissions.length > 0 && (
          <Link
            to="/queue"
            className="mt-6 text-gray-600 hover:text-gecko-green transition-colors"
          >
            <div className="flex items-center gap-4 text-sm">
              {pendingCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
                  {pendingCount} processing
                </span>
              )}
              {completedCount > 0 && (
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gecko-green rounded-full" />
                  {completedCount} completed
                </span>
              )}
            </div>
            <p className="mt-1 font-medium">View Submissions →</p>
          </Link>
        )}
      </div>

      {/* Tips */}
      <div className="mt-8 bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="font-semibold text-gray-900 mb-3">Quick Tips</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-gecko-green">1.</span>
            <span>Take 1-5 clear photos of your gecko</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gecko-green">2.</span>
            <span>Add optional details like morph, weight, and price</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-gecko-green">3.</span>
            <span>Choose a tone and hit submit - AI does the rest!</span>
          </li>
        </ul>
      </div>
    </Layout>
  )
}
