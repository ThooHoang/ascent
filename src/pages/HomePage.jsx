import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Bell, Calendar, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { TodayTraining } from '../components/features/TodayTraining'
import { WeightProgress } from '../components/features/WeightProgress'
import { MiniCalendar } from '../components/features/MiniCalendar'
import { MiniHabitsWidget } from '../components/features/MiniHabitsWidget'
import { BottomNav } from '../components/ui/BottomNav'
import { StatCard } from '../components/ui/StatCard'
import { useSelectedDate } from '../contexts/DateContext'

function HomePage() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [showCalendar, setShowCalendar] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const [stats, setStats] = useState({
    habitsLeft: 0,
    sleepHours: 0,
    currentStreak: 0,
  })
  const { selectedDate, setSelectedDate } = useSelectedDate()

  const userName = profile?.name || user?.email?.split('@')[0] || 'there'

  // Load avatar from profile or localStorage
  useEffect(() => {
    if (profile?.avatar_url) {
      setAvatarUrl(profile.avatar_url)
    } else {
      const storageKey = user?.id ? `avatar-${user.id}` : 'avatar-guest'
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        setAvatarUrl(stored)
      }
    }
  }, [profile?.avatar_url, user?.id])

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
          .eq('date', targetDate)
          .single()

        if (!error && data) {
          sleepHours = data.hours || 0
        }
      } catch (err) {
        // ignore - no sleep log for this date
      }
    }

    // Calculate current streak with carry-over: if selectedDate has no logs but yesterday does, show yesterday's streak; otherwise 0
    const anchor = new Date(selectedDate || new Date().toISOString().split('T')[0])
    const toISO = (d) => new Date(d.getTime() - d.getTimezoneOffset()*60000).toISOString().split('T')[0]
    const computeStreakFrom = (startDate, dateSet) => {
      let count = 0
      const cursor = new Date(startDate)
      while (true) {
        const key = toISO(cursor)
        if (dateSet.has(key)) {
          count += 1
          cursor.setDate(cursor.getDate() - 1)
        } else {
          break
        }
      }
      return count
    }

    let currentStreak = 0
    if (user?.id) {
      try {
        const { data: allCompletions, error } = await supabase
          .from('habit_completions')
          .select('date, completed')
          .eq('completed', true)

        if (!error && allCompletions?.length) {
          const dateSet = new Set(allCompletions.map(c => c.date))
          const todayKey = toISO(anchor)
          const y = new Date(anchor); y.setDate(y.getDate() - 1)
          const yKey = toISO(y)
          if (dateSet.has(todayKey)) {
            currentStreak = computeStreakFrom(anchor, dateSet)
          } else if (dateSet.has(yKey)) {
            currentStreak = computeStreakFrom(y, dateSet)
          } else {
            currentStreak = 0
          }
        }
      } catch {
        currentStreak = 0
      }
    } else {
      // guest mode
      const completionsKey = 'habit-completions-guest'
      const completions = localStorage.getItem(completionsKey)
      if (completions) {
        try {
          const parsed = JSON.parse(completions).filter(c => c.completed)
          const dateSet = new Set(parsed.map(c => c.date))
          const todayKey = toISO(anchor)
          const y = new Date(anchor); y.setDate(y.getDate() - 1)
          const yKey = toISO(y)
          if (dateSet.has(todayKey)) {
            currentStreak = computeStreakFrom(anchor, dateSet)
          } else if (dateSet.has(yKey)) {
            currentStreak = computeStreakFrom(y, dateSet)
          } else {
            currentStreak = 0
          }
        } catch {
          currentStreak = 0
        }
      }
    }

    setStats({ habitsLeft, sleepHours, currentStreak })
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

  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) {
      return 'Good morning,'
    } else if (hour < 18) {
      return 'Good afternoon,'
    } else {
      return 'Good evening,'
    }
  }

  return (
    <div className="dashboard-page">
      <main className="dashboard-main-compact">
        <section className="dashboard-header">
          <div className="header-greeting">
            <div className="avatar-mini">
              {avatarUrl ? (
                <img src={avatarUrl} alt={profile?.name || 'Avatar'} className="avatar-mini-image" />
              ) : (
                (userName || 'U')[0].toUpperCase()
              )}
            </div>
            <div>
              <p className="greeting-text">{getTimeBasedGreeting()}</p>
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
          <StatCard value={stats.habitsLeft} label="Habits left" />
          <StatCard value={stats.sleepHours || '—'} label="Sleep (h)" />
          <StatCard value={`🔥 ${stats.currentStreak}`} label="Current streak" />
        </section>

        <section className="dashboard-widgets">
          <MiniHabitsWidget selectedDate={selectedDate} />
        </section>

        <section className="dashboard-cards">
          <TodayTraining />
          <WeightProgress />
        </section>

        <section className="quick-action-buttons">
          <div className="sleep-card">
            <div className="sleep-header">
              <div>
                <p className="section-title">Sleep</p>
                <div className="sleep-display">
                  <p className="sleep-hours">{stats.sleepHours || '—'}h</p>
                </div>
              </div>
              <div className="sleep-actions">
                <button className="btn-link-secondary" type="button" onClick={() => navigate('/sleep')}>
                  See details →
                </button>
                <button className="btn btn-sm" type="button" onClick={() => navigate('/sleep')}>
                  Log now
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />

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