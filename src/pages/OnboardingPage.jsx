import { useNavigate } from 'react-router-dom'
import { OnboardingSlider } from '../components/features/OnboardingSlider'

function OnboardingPage() {
  const navigate = useNavigate()

  const skipOnboarding = () => {
    navigate('/login')
  }

  return (
    <div className="onboarding-screen">
      {/* Skip Button */}
      <header className="onboarding-header">
        <button onClick={skipOnboarding} className="skip-btn">
          Skip
        </button>
      </header>

      {/* Slide Content */}
      <main className="onboarding-main">
        <OnboardingSlider />
      </main>
    </div>
  )
}

export default OnboardingPage