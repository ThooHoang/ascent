import { useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Home, Dumbbell, ListTodo, User, Bell, Calendar, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { TodayTraining } from '../components/features/TodayTraining'
import { WeightProgress } from '../components/features/WeightProgress'
import { MiniCalendar } from '../components/features/MiniCalendar'
import { MiniHabitsWidget } from '../components/features/MiniHabitsWidget'

function HomePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile } = useAuth()
  const [showCalendar, setShowCalendar] = useState(false)
  const [stats, setStats] = useState({
    habitsLeft: 0,
    sleepHours: 0,
    bestStreak: 0,
  })

  const userName = profile?.name || user?.email?.split('@')[0] || 'there'

  const loadStats = async () => {
    const today = new Date().toISOString().split('T')[0]
    
    // Load habits data
    const storageKey = user?.id ? `custom-habits-${user.id}` : 'custom-habits-guest'
    const customHabits = localStorage.getItem(storageKey)
    let habitsLeft = 4 // default habits
    if (customHabits) {
      try {
        const parsed = JSON.parse(customHabits)
        habitsLeft = 4 + parsed.length // default + custom
      } catch {
        // ignore
      }
    }

    // Load today's completions to subtract from habits left
    const completionsKey = `habit-completions-${user?.id}`
    const completions = localStorage.getItem(completionsKey)
    if (completions) {
      try {
        const parsed = JSON.parse(completions)
        const todayCompletions = parsed.filter(c => c.date === today && c.completed)
        habitsLeft = Math.max(0, habitsLeft - todayCompletions.length)
      } catch {
        // ignore
      }
    }

    // Load today's sleep entry from Supabase
    let sleepHours = 0
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('sleep_logs')
          .select('hours')
          .eq('user_id', user.id)
          .eq('date', today)
          .single()

        if (!error && data) {
          sleepHours = data.hours || 0
        }
      } catch (err) {
        // ignore - no sleep log for today
      }
    }

    // Load best streak
    const streakKey = `habit-streaks-${user?.id}`
    const streaks = localStorage.getItem(streakKey)
    let bestStreak = 0
    if (streaks) {
      try {
        const parsed = JSON.parse(streaks)
        bestStreak = Math.max(...parsed.map(s => s.best_streak || 0), 0)
      } catch {
        // ignore
      }
    }

    setStats({ habitsLeft, sleepHours, bestStreak })
  }

  useEffect(() => {
    loadStats()
  }, [user?.id, profile?.name])

  // Listen for storage changes and refetch stats
  useEffect(() => {
    const handleStorageChange = () => {
      loadStats()
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user?.id])

  // Subscribe to real-time sleep log updates
  useEffect(() => {
    if (!user?.id) return

    const channel = supabase
      .channel(`sleep-logs:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sleep_logs',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadStats()
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [user?.id])

  const getQuote = () => {
    const quotes = [
      "The only way to do great work is to love what you do.",
      "Progress over perfection.",
      "Your future self will thank you.",
      "Small steps lead to big changes.",
      "Consistency is key.",
      "You've got this!",
      "Every day is a fresh start.",
      "Build momentum, one habit at a time.",
    ]
    return quotes[Math.floor(Math.random() * quotes.length)]
  }

  return (
    <div className="dashboard-page">
      <main className="dashboard-main-compact">
        <section className="dashboard-header">
          <div className="header-greeting">
            <div className="avatar-mini">
              {(userName || 'U')[0].toUpperCase()}
            </div>
            <div>
              <p className="greeting-text">Good morning,</p>
              <h1 className="greeting-name">{userName}</h1>
            </div>
          </div>
          <div className="header-icons">
            <button className="icon-btn" type="button" aria-label="Calendar" onClick={() => setShowCalendar(true)}>
              <Calendar size={20} />
            </button>
            <button className="icon-btn" type="button" aria-label="Notifications">
              <Bell size={20} />
            </button>
          </div>
        </section>

        <section className="quick-stats">
          <div className="stat-pill">
            <p className="stat-value">{stats.habitsLeft}</p>
            <p className="stat-label">Habits left</p>
          </div>
          <div className="stat-pill">
            <p className="stat-value">{stats.sleepHours || '—'}</p>
            <p className="stat-label">Sleep (h)</p>
          </div>
          <div className="stat-pill">
            <p className="stat-value">🔥 {stats.bestStreak}</p>
            <p className="stat-label">Best streak</p>
          </div>
        </section>

        <section className="quote-card">
          <p className="quote-text">"{getQuote()}"</p>
          <p className="quote-label">Quote of the day</p>
        </section>

        <section className="quick-action-buttons">
          <div className="action-btn-pair">
            <button className="action-btn" type="button" onClick={() => navigate('/habits')}>
              <span className="action-icon">📋</span>
              <span className="action-text">Habits</span>
              <span className="action-count">{stats.habitsLeft}</span>
            </button>
            <button className="action-btn" type="button" onClick={() => navigate('/sleep')}>
              <span className="action-icon">😴</span>
              <span className="action-text">Sleep log</span>
              <span className="action-count">Quick log</span>
            </button>
          </div>
        </section>

        <section className="dashboard-cards">
          <TodayTraining />
          <WeightProgress />
        </section>

        <section className="dashboard-widgets">
          <MiniHabitsWidget />
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

      {/* Calendar Modal */}
      {showCalendar && (
        <div className="modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={() => setShowCalendar(false)}
              type="button"
              aria-label="Close calendar"
            >
              <X size={24} />
            </button>
            <MiniCalendar />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage