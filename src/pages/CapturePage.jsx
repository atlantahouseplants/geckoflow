import { useNavigate } from 'react-router-dom'
import PhotoCapture from '../components/PhotoCapture'

export default function CapturePage() {
  const navigate = useNavigate()

  return (
    <div className="h-screen">
      <PhotoCapture onNext={() => navigate('/review')} />
    </div>
  )
}
