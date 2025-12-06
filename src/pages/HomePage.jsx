import { useNavigate, useLocation } from 'react-router-dom'
import { useRef } from 'react'
import { Home, Dumbbell, ListTodo, User } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { SmartHabits } from '../components/features/SmartHabits'
import { SleepTracker } from '../components/features/SleepTracker'
import { ProgressTracker } from '../components/features/ProgressTracker'

function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const progressRef = useRef(null)

  const nextSession = {
    title: 'Push Day · 6:30 PM',
    note: 'Bench 4x6 @ 75%, Dips 3x10, Plank 3x45s',
  }

  const goToSleep = () => navigate('/sleep')
  const goToProgress = () => progressRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="hero">
          <div>
            <p className="hero-eyebrow">Ascent</p>
            <h1 className="hero-title">Hi {profile?.name || user?.email?.split('@')[0] || 'there'} 👋</h1>
            <p className="hero-subtitle">Stay consistent, avoid burnout, climb steadily.</p>
          </div>
        </section>

        <section className="quick-actions">
          <p className="section-title">Quick actions</p>
          <div className="actions-row">
            <Button className="w-full" size="large" onClick={() => navigate('/workouts')}>Start workout</Button>
            <Button className="w-full" size="large" onClick={goToSleep}>Log sleep</Button>
            <Button className="w-full" size="large" onClick={goToProgress}>Add weight</Button>
            <Button className="w-full" size="large" onClick={goToProgress}>Add photo</Button>
          </div>
        </section>

        <section className="today-strip">
          <div>
            <p className="metric-label">Tasks left</p>
            <p className="metric-value">3</p>
          </div>
          <div>
            <p className="metric-label">Minutes</p>
            <p className="metric-value">45</p>
          </div>
          <div>
            <p className="metric-label">Completed</p>
            <p className="metric-value">2</p>
          </div>
        </section>

        <section className="card-grid">
          <SmartHabits />
          <SleepTracker />
        </section>

        <section ref={progressRef}>
          <ProgressTracker />
        </section>

        <section className="quick-actions">
          <p className="section-title">Upcoming</p>
          <div className="actions-row">
            <Button className="w-full" size="large" onClick={() => navigate('/sleep')}>Sleep dashboard</Button>
            <Button className="w-full" size="large" onClick={goToProgress}>Progress check-in</Button>
          </div>
        </section>

        <section className="next-session">
          <div>
            <p className="section-title">Next session</p>
            <h3 className="session-title">{nextSession.title}</h3>
            <p className="session-note">{nextSession.note}</p>
          </div>
          <Button size="large" className="w-full">Open plan</Button>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
          type="button"
          aria-label="Dashboard"
        >
          <Home size={22} />
        </button>
        <button
          className={`nav-item ${location.pathname === '/workouts' ? 'active' : ''}`}
          onClick={() => navigate('/workouts')}
          type="button"
          aria-label="Workouts"
        >
          <Dumbbell size={22} />
        </button>
        <button
          className={`nav-item ${location.pathname === '/habits' ? 'active' : ''}`}
          onClick={() => navigate('/habits')}
          type="button"
          aria-label="Habits"
        >
          <ListTodo size={22} />
        </button>
        <button
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
          type="button"
          aria-label="Profile"
        >
          <User size={22} />
        </button>
      </nav>
    </div>
  )
}

export default HomePage