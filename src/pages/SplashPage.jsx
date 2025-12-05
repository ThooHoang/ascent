import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function SplashPage() {
  const navigate = useNavigate()

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/onboarding')
    }, 2000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="splash-screen">
      <div className="splash-content">
        <h1 className="splash-title">Ascent</h1>
      </div>
    </div>
  )
}

export default SplashPage