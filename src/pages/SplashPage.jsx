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
        <div className="logo-container">
          <svg 
            className="ascent-logo" 
            viewBox="0 0 120 120" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="60" cy="60" r="50" stroke="#16A34A" strokeWidth="3" fill="none"/>
            <path 
              d="M35 75 L60 40 L85 75" 
              stroke="#16A34A" 
              strokeWidth="4" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
            <path 
              d="M45 65 L60 55 L75 65" 
              stroke="#16A34A" 
              strokeWidth="3" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="splash-title">Ascent</h1>
      </div>
    </div>
  )
}

export default SplashPage