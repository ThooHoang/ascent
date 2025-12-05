import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function OnboardingPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  const slides = [
    {
      emoji: "📝",
      title: "Log Your Journey",
      description: "Track workouts, sleep, and habits in less than 2 mins.",
      gradient: "from-blue-50 to-indigo-50"
    },
    {
      emoji: "📊",
      title: "Gather Your Data", 
      description: "See how sleep impacts your gym performance.",
      gradient: "from-green-50 to-emerald-50"
    },
    {
      emoji: "🚀",
      title: "Ascent Together",
      description: "Use your own data to build a sustainable lifestyle.",
      gradient: "from-purple-50 to-pink-50"
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const skipOnboarding = () => {
    navigate('/login')
  }

  const getStarted = () => {
    navigate('/login?mode=signup')
  }

  const isLastSlide = currentSlide === slides.length - 1

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
        <div className="slide-container">
          <div className="slide-content">
            <div className="slide-emoji">
              {slides[currentSlide].emoji}
            </div>
            <h2 className="slide-title">
              {slides[currentSlide].title}
            </h2>
            <p className="slide-description">
              {slides[currentSlide].description}
            </p>
          </div>
        </div>

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
            />
          ))}
        </div>
      </main>

      {/* Navigation */}
      <footer className="onboarding-footer">
        {isLastSlide ? (
          <button onClick={getStarted} className="btn btn-primary btn-large">
            Get Started
          </button>
        ) : (
          <button onClick={nextSlide} className="btn btn-primary btn-large">
            Next
          </button>
        )}
      </footer>
    </div>
  )
}

export default OnboardingPage