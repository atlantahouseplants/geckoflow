import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import CapturePage from './pages/CapturePage'
import ReviewPage from './pages/ReviewPage'
import QueuePage from './pages/QueuePage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/capture" element={<CapturePage />} />
      <Route path="/review" element={<ReviewPage />} />
      <Route path="/queue" element={<QueuePage />} />
    </Routes>
  )
}
