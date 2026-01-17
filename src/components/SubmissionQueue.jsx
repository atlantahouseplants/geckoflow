import { useGecko } from '../context/GeckoContext'

const STATUS_CONFIG = {
  pending: { label: 'Pending', class: 'badge-pending' },
  processing: { label: 'Processing', class: 'badge-processing' },
  complete: { label: 'Complete', class: 'badge-complete' },
  failed: { label: 'Failed', class: 'badge-failed' }
}

export default function SubmissionQueue() {
  const { submissions } = useGecko()

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🦎</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Submissions Yet</h3>
        <p className="text-gray-500">Your gecko listings will appear here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => {
        const status = STATUS_CONFIG[submission.status] || STATUS_CONFIG.pending

        return (
          <div
            key={submission.id}
            className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4"
          >
            {/* Thumbnail */}
            <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
              {submission.thumbnail ? (
                <img
                  src={submission.thumbnail}
                  alt="Gecko"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl">
                  🦎
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-gray-900 truncate">
                {submission.morph || 'Analyzing...'}
              </h4>
              <p className="text-sm text-gray-500">
                {new Date(submission.timestamp).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
              <p className="text-xs text-gray-400">
                {submission.photos} photo{submission.photos !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Status Badge */}
            <span className={`badge ${status.class}`}>
              {status.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
