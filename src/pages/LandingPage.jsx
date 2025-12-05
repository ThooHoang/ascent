import { Link } from 'react-router-dom'
import { useState } from 'react'

function LandingPage() {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: "🏋️",
      title: "Smart Workouts",
      subtitle: "Progressive Overload Tracking",
      description: "Log sets, reps, and weights with built-in rest timers. Track your strength gains over time with intelligent analytics.",
      highlight: "Never miss a rep"
    },
    {
      icon: "😴", 
      title: "Sleep Quality",
      subtitle: "Recovery Insights",
      description: "Monitor your sleep patterns and see how they directly impact your workout performance and habit consistency.",
      highlight: "Better sleep, better gains"
    },
    {
      icon: "🔗",
      title: "Connected Insights", 
      subtitle: "Holistic Analytics",
      description: "Discover powerful correlations between your sleep, habits, and gym performance to optimize your entire routine.",
      highlight: "See the bigger picture"
    }
  ]

  const nextFeature = () => {
    setCurrentFeature((prev) => (prev + 1) % features.length)
  }

  const prevFeature = () => {
    setCurrentFeature((prev) => (prev - 1 + features.length) % features.length)
  }

  return (
    <div className="onboarding-container">
      {/* Header */}
      <header className="onboarding-header">
        <div className="brand-container">
          <h1 className="brand-title">Ascent</h1>
          <p className="brand-tagline">Holistic Self-Improvement</p>
        </div>
      </header>

      {/* Feature Showcase */}
      <main className="onboarding-main">
        <div className="feature-showcase">
          <div className="feature-card-large">
            <div className="feature-icon-large">
              {features[currentFeature].icon}
            </div>
            <div className="feature-content">
              <span className="feature-highlight">
                {features[currentFeature].highlight}
              </span>
              <h2 className="feature-title">
                {features[currentFeature].title}
              </h2>
              <p className="feature-subtitle">
                {features[currentFeature].subtitle}
              </p>
              <p className="feature-description">
                {features[currentFeature].description}
              </p>
            </div>
          </div>

          {/* Feature Navigation */}
          <div className="feature-navigation">
            <button 
              onClick={prevFeature}
              className="nav-arrow"
              aria-label="Previous feature"
            >
              ←
            </button>
            
            <div className="feature-dots">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFeature(index)}
                  className={`feature-dot ${index === currentFeature ? 'active' : ''}`}
                  aria-label={`Go to feature ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              onClick={nextFeature}
              className="nav-arrow"
              aria-label="Next feature"
            >
              →
            </button>
          </div>
        </div>

        {/* Value Props */}
        <div className="value-props">
          <div className="value-item">
            <span className="value-icon">🎯</span>
            <span className="value-text">Stop fragmented tracking</span>
          </div>
          <div className="value-item">
            <span className="value-icon">🧠</span>
            <span className="value-text">AI-powered insights</span>
          </div>
          <div className="value-item">
            <span className="value-icon">📱</span>
            <span className="value-text">Mobile-first design</span>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="onboarding-footer">
        <div className="action-buttons">
          <Link to="/login?mode=signup" className="btn btn-primary btn-large">
            Join Ascent
          </Link>
          <Link to="/login" className="btn btn-secondary btn-large">
            Sign In
          </Link>
        </div>
        <p className="footer-text">
          Start your holistic self-improvement journey today
        </p>
      </footer>
    </div>
  )
}

export default LandingPage