import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import SubmissionQueue from '../components/SubmissionQueue'

export default function QueuePage() {
  return (
    <Layout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submissions</h1>
        <Link
          to="/capture"
          className="bg-gecko-green text-white font-semibold py-2 px-4 rounded-xl touch-target flex items-center gap-1"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New
        </Link>
      </div>

      <SubmissionQueue />
    </Layout>
  )
}
