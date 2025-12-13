import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Dumbbell, ListTodo, User, ChevronDown, X } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { useSelectedDate } from '../contexts/DateContext'

function WeightOverviewPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { selectedDate } = useSelectedDate()
  const storageKey = user?.id ? `progress-${user.id}` : 'progress-guest'

  const [entries, setEntries] = useState([])
  const [expandedWeek, setExpandedWeek] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedPhoto, setSelectedPhoto] = useState(null)

  useEffect(() => {
    loadEntries()
  }, [user?.id])

  const loadEntries = async () => {
    try {
      setLoading(true)
      if (user?.id) {
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .order('date', { ascending: false })

        if (!error && data) {
          setEntries(data)
        }
      } else {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setEntries(parsed)
          } catch {
            setEntries([])
          }
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const getWeekNumber = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() + 4 - (d.getDay() || 7))
    const yearStart = new Date(d.getFullYear(), 0, 1)
    const diff = d - yearStart
    const oneWeek = 1000 * 60 * 60 * 24 * 7
    return Math.floor(diff / oneWeek) + 1
  }

  const getGroupedByWeek = () => {
    const grouped = {}
    entries.forEach(entry => {
      const date = new Date(entry.date)
      const year = date.getFullYear()
      const week = getWeekNumber(entry.date)
      const key = `${year}-W${String(week).padStart(2, '0')}`
      
      if (!grouped[key]) {
        grouped[key] = {
          key,
          year,
          week,
          entries: [],
          minWeight: null,
          maxWeight: null,
          avgWeight: null,
        }
      }
      grouped[key].entries.push(entry)
    })

    // Calculate stats for each week
    Object.values(grouped).forEach(weekData => {
      const weights = weekData.entries.filter(e => e.weight).map(e => e.weight)
      if (weights.length) {
        weekData.minWeight = Math.min(...weights)
        weekData.maxWeight = Math.max(...weights)
        weekData.avgWeight = (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1)
      }
    })

    return Object.values(grouped).sort((a, b) => {
      if (b.year !== a.year) return b.year - a.year
      return b.week - a.week
    })
  }

  const weeks = getGroupedByWeek()

  const stats = useMemo(() => {
    const weights = entries.filter(e => e.weight).map(e => e.weight)
    
    // Current shows only selected date entry
    const currentEntry = entries.find(e => e.date === selectedDate && e.weight)
    
    // Always show min/max/trend if we have data
    if (!weights.length) {
      return { current: null, min: null, max: null, trend: '→' }
    }
    
    // Calculate trend: compare first 3 entries avg vs last 3 entries avg
    let trend = '→'
    if (weights.length >= 2) {
      const recent = weights.slice(0, Math.min(3, weights.length))
      const older = weights.slice(Math.max(0, weights.length - 3))
      const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
      const olderAvg = older.reduce((a, b) => a + b, 0) / older.length
      
      if (recentAvg < olderAvg - 0.5) trend = '↓'
      else if (recentAvg > olderAvg + 0.5) trend = '↑'
    }

    return {
      current: currentEntry?.weight || null,
      min: Math.min(...weights),
      max: Math.max(...weights),
      trend,
    }
  }, [entries, selectedDate])

  return (
    <div className="weight-overview-page">
      <main className="weight-overview-main">
        <section className="overview-header">
          <div>
            <h1 className="overview-title">Weight Progress</h1>
            <p className="overview-subtitle">Track your weight journey by week</p>
          </div>
        </section>

        <section className="overview-stats">
          {stats.current !== null && (
            <div className="stat-box">
              <p className="stat-label">Current</p>
              <p className="stat-value">{stats.current?.toFixed(1)} kg</p>
            </div>
          )}
          {stats.min !== null && (
            <div className="stat-box">
              <p className="stat-label">Lowest</p>
              <p className="stat-value">{stats.min?.toFixed(1)} kg</p>
            </div>
          )}
          {stats.max !== null && (
            <div className="stat-box">
              <p className="stat-label">Highest</p>
              <p className="stat-value">{stats.max?.toFixed(1)} kg</p>
            </div>
          )}
          {stats.min !== null && (
            <div className="stat-box">
              <p className="stat-label">Trend</p>
              <p className="stat-value trend-indicator">{stats.trend}</p>
            </div>
          )}
        </section>

        <section className="weeks-list">
          {weeks.length > 0 ? (
            weeks.map(weekData => (
              <div key={weekData.key} className="week-accordion">
                <button
                  className="week-header"
                  onClick={() => setExpandedWeek(expandedWeek === weekData.key ? null : weekData.key)}
                  type="button"
                >
                  <div className="week-info">
                    <p className="week-title">Week {weekData.week}, {weekData.year}</p>
                    {weekData.avgWeight && (
                      <p className="week-stats">
                        Avg: {weekData.avgWeight} kg • {weekData.entries.length} entry(ies)
                      </p>
                    )}
                  </div>
                  <ChevronDown
                    size={20}
                    className={`week-chevron ${expandedWeek === weekData.key ? 'expanded' : ''}`}
                  />
                </button>

                {expandedWeek === weekData.key && (
                  <div className="week-content">
                    {weekData.entries
                      .filter(e => e.weight)
                      .sort((a, b) => new Date(b.date) - new Date(a.date))
                      .map(entry => (
                        <div key={entry.date} className="week-entry">
                          <div className="entry-info">
                            <p className="entry-date">
                              {new Date(entry.date).toLocaleDateString('en-US', {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                            <p className="entry-weight">{entry.weight.toFixed(1)} kg</p>
                          </div>
                          {entry.photo_url && (
                            <img 
                              src={entry.photo_url} 
                              alt="Progress" 
                              className="entry-photo" 
                              onClick={() => setSelectedPhoto(entry.photo_url)}
                              style={{ cursor: 'pointer' }}
                            />
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">No weight entries yet. Start tracking on the dashboard!</p>
          )}
        </section>
      </main>

      {selectedPhoto && (
        <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
          <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="photo-modal-close"
              onClick={() => setSelectedPhoto(null)}
              type="button"
              aria-label="Close"
            >
              <X size={28} />
            </button>
            <img src={selectedPhoto} alt="Full preview" className="photo-modal-image" />
          </div>
        </div>
      )}

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

export default WeightOverviewPage
