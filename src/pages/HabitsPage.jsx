import { useLocation, useNavigate } from 'react-router-dom'
import { Home, Dumbbell, ListTodo, User } from 'lucide-react'
import { SmartHabits } from '../components/features/SmartHabits'

function HabitsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="hero">
          <div>
            <p className="hero-eyebrow">Habits</p>
            <h1 className="hero-title">Dial in your routine</h1>
            <p className="hero-subtitle">Add custom habits and keep streaks alive.</p>
          </div>
        </section>

        <SmartHabits />
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

export default HabitsPage
