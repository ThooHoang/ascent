import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Dumbbell, ListTodo, User } from 'lucide-react'
import { Button } from '../components/ui/Button'

function WorkoutsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="hero">
          <div>
            <p className="hero-eyebrow">Workouts</p>
            <h1 className="hero-title">Train with intent</h1>
            <p className="hero-subtitle">Session planning and logging coming soon.</p>
          </div>
        </section>

        <section className="next-session">
          <div>
            <p className="section-title">Next session</p>
            <h3 className="session-title">Build your plan</h3>
            <p className="session-note">Save your exercises and reps so you can focus on execution.</p>
          </div>
          <Button size="large" className="w-full" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
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

export default WorkoutsPage
