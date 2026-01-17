import { Link, useLocation } from 'react-router-dom'
import { useGecko } from '../context/GeckoContext'

export default function Layout({ children, hideNav = false, fullScreen = false }) {
  const location = useLocation()
  const { pendingCount } = useGecko()

  if (fullScreen) {
    return <div className="h-full">{children}</div>
  }

  return (
    <div className="min-h-full bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🦎</span>
          <span className="text-xl font-bold text-gray-900">GeckoFlow</span>
        </Link>
        {!hideNav && (
          <Link
            to="/queue"
            className="relative touch-target flex items-center justify-center"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-gecko-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </Link>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4">
        {children}
      </main>
    </div>
  )
}
