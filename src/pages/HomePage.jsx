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
import { useSelectedDate } from '../contexts/DateContext'

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
  const { selectedDate, setSelectedDate } = useSelectedDate()

  const userName = profile?.name || user?.email?.split('@')[0] || 'there'

  const loadStats = async (dateStr = null) => {
    const targetDate = dateStr || new Date().toISOString().split('T')[0]
    
    const storageKey = user?.id ? `custom-habits-${user.id}` : 'custom-habits-guest'
    const customHabits = localStorage.getItem(storageKey)
    const totalHabits = (() => {
      if (!customHabits) return 4
      try {
        const parsed = JSON.parse(customHabits)
        return 4 + parsed.length
      } catch {
        return 4
      }
    })()

    let completedCount = 0
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('habit_completions')
          .select('habit_id, completed')
          .eq('user_id', user.id)
          .eq('date', targetDate)
          .eq('completed', true)

        if (!error && data) {
          completedCount = data.length
        }
      } catch {
        completedCount = 0
      }
    } else {
      const completionsKey = 'habit-completions-guest'
      const completions = localStorage.getItem(completionsKey)
      if (completions) {
        try {
          const parsed = JSON.parse(completions)
          completedCount = parsed.filter(c => c.date === targetDate && c.completed).length
        } catch {
          completedCount = 0
        }
      }
    }

    const habitsLeft = Math.max(0, totalHabits - completedCount)

    let sleepHours = 0
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('sleep_logs')
          .select('hours')
          .eq('user_id', user.id)
          .eq('date', targetDate)
          .single()

        if (!error && data) {
          sleepHours = data.hours || 0
        }
      } catch (err) {
        // ignore - no sleep log for this date
      }
    }

    let bestStreak = 0
    if (user?.id) {
      try {
        const { data, error } = await supabase
          .from('habit_streaks')
          .select('best_streak')
          .eq('user_id', user.id)

        if (!error && data?.length) {
          bestStreak = Math.max(...data.map(s => s.best_streak || 0), 0)
        }
      } catch {
        bestStreak = 0
      }
    }

    setStats({ habitsLeft, sleepHours, bestStreak })
  }

  const handleSelectDate = (dateStr) => {
    setSelectedDate(dateStr)
  }

  useEffect(() => {
    loadStats(selectedDate)
  }, [user?.id, profile?.name, selectedDate])

  // Listen for storage changes and refetch stats
  useEffect(() => {
    const handleStorageChange = () => {
      loadStats(selectedDate)
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [user?.id, selectedDate])

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
    const key = selectedDate || new Date().toISOString().split('T')[0]
    let hash = 0
    for (let i = 0; i < key.length; i++) {
      hash = (hash * 31 + key.charCodeAt(i)) >>> 0
    }
    const idx = hash % quotes.length
    return quotes[idx]
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
              <p className="greeting-date">{new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
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

        <section className="quote-card">
          <p className="quote-text">"{getQuote()}"</p>
          <p className="quote-label">Quote of the day</p>
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

        <section className="dashboard-widgets">
          <MiniHabitsWidget selectedDate={selectedDate} />
        </section>

        <section className="dashboard-cards">
          <TodayTraining />
          <WeightProgress />
        </section>

        <section className="quick-action-buttons">
          <button className="sleep-log-card" type="button" onClick={() => navigate('/sleep')}>
            <div className="sleep-card-content">
              <div className="sleep-card-header">
                <span className="sleep-icon">😴</span>
                <span className="sleep-title">Sleep Log</span>
              </div>
              <p className="sleep-card-subtitle">Track your rest & improve your health</p>
              <div className="sleep-card-footer">
                <span className="sleep-cta">Log now →</span>
                <span className="sleep-value">{stats.sleepHours}h</span>
              </div>
            </div>
          </button>
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
        <div className="calendar-modal-overlay" onClick={() => setShowCalendar(false)}>
          <div className="calendar-modal-content" onClick={(e) => e.stopPropagation()}>
            <MiniCalendar 
              value={selectedDate}
              onSelectDate={handleSelectDate}
              onClose={() => setShowCalendar(false)}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default HomePage