import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../ui/Button'

export function OnboardingSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const navigate = useNavigate()

  const slides = [
    {
      emoji: "📝",
      title: "Log Your Journey",
      description: "Track workouts, sleep, and habits in less than 2 mins."
    },
    {
      emoji: "📊",
      title: "Gather Your Data", 
      description: "See how sleep impacts your gym performance."
    },
    {
      emoji: "🚀",
      title: "Ascent Together",
      description: "Use your own data to build a sustainable lifestyle."
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(prev => prev + 1)
    }
  }

  const getStarted = () => {
    navigate('/login?mode=signup')
  }

  const isLastSlide = currentSlide === slides.length - 1

  return (
    <>
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

      <div className="slide-indicators">
        {slides.map((_, index) => (
          <div
            key={index}
            className={`slide-dot ${index === currentSlide ? 'active' : ''}`}
          />
        ))}
      </div>

      <div className="onboarding-footer">
        {isLastSlide ? (
          <Button onClick={getStarted} size="large" className="w-full">
            Get Started
          </Button>
        ) : (
          <Button onClick={nextSlide} size="large" className="w-full">
            Next
          </Button>
        )}
      </div>
    </>
  )
}