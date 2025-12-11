import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/ui/BottomNav'
import { useSelectedDate } from '../contexts/DateContext'

function SleepPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { selectedDate, setSelectedDate } = useSelectedDate()
  const [date, setDate] = useState(selectedDate)
  const [hours, setHours] = useState(7.5)
  const [quality, setQuality] = useState('good')
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (user?.id) {
      fetchLogs(selectedDate)
    }
  }, [user?.id, selectedDate])

  const fetchLogs = async (targetDate = selectedDate) => {
    try {
      const { data, error } = await supabase
        .from('sleep_logs')
        .select('*')
        .order('date', { ascending: false })
        .limit(14)

      if (!error && data) {
        setLogs(data)
        const currentLog = data.find(log => log.date === targetDate)
        if (currentLog) {
          setHours(currentLog.hours)
          setQuality(currentLog.quality || 'good')
          setDate(currentLog.date)
        } else {
          setDate(targetDate)
          setHours(7.5)
          setQuality('good')
        }
      }
    } catch (err) {
      // ignore error
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const { error } = await supabase
        .from('sleep_logs')
        .upsert(
          {
            user_id: user.id,
            date,
            hours,
            quality,
          },
          { onConflict: 'user_id,date' }
        )

      if (!error) {
        await fetchLogs(date)
      }
    } catch (err) {
      // ignore error
    } finally {
      setSaving(false)
    }
  }

  const handleSelectDate = (newDate) => {
    setDate(newDate)
    setSelectedDate(newDate)
    const existing = logs.find(log => log.date === newDate)
    if (existing) {
      setHours(existing.hours)
      setQuality(existing.quality || 'good')
    } else {
      setHours(7.5)
      setQuality('good')
    }
  }

  const averageHours = useMemo(() => {
    if (!logs.length) return null
    const total = logs.reduce((sum, log) => sum + (log.hours || 0), 0)
    return (total / logs.length).toFixed(1)
  }, [logs])

  const bedtimeHint = useMemo(() => {
    if (!averageHours) return 'Aim for 7-9 hours per night.'
    if (averageHours < 6.5) return 'You are running short. Try a wind-down at 10:30 PM.'
    if (averageHours < 7.5) return 'Close to target. Keep a consistent bedtime around 11:00 PM.'
    return 'Great consistency. Maintain your current routine.'
  }, [averageHours])

  if (loading) {
    return <div className="sleep-loading">Loading sleep data...</div>
  }

  return (
    <div className="sleep-page">
      <main className="sleep-main">
        <section className="sleep-hero">
          <div>
            <p className="hero-eyebrow">Sleep</p>
            <h1 className="hero-title">Log and review</h1>
            <p className="hero-subtitle">See past days, log today, and keep your schedule consistent.</p>
          </div>
          <div className="sleep-avg">
            <p className="sleep-avg-label">Avg (14d)</p>
            <p className="sleep-avg-value">{averageHours ? `${averageHours}h` : '—'}</p>
            <p className="sleep-avg-hint">{bedtimeHint}</p>
          </div>
        </section>

        <section className="sleep-form">
          <div className="sleep-controls">
            <div className="sleep-input-group">
              <label className="sleep-label">Day</label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => handleSelectDate(e.target.value)}
              />
            </div>

            <div className="sleep-input-group">
              <label className="sleep-label">Hours slept</label>
              <div className="sleep-time-input">
                <button 
                  onClick={() => setHours(Math.max(0, hours - 0.5))}
                  type="button"
                  className="time-btn"
                >
                  −
                </button>
                <span className="time-display">{hours.toFixed(1)}</span>
                <button 
                  onClick={() => setHours(Math.min(12, hours + 0.5))}
                  type="button"
                  className="time-btn"
                >
                  +
                </button>
              </div>
            </div>

            <div className="sleep-quality-group">
              <label className="sleep-label">Quality</label>
              <div className="quality-options">
                {['poor', 'fair', 'good', 'excellent'].map(opt => (
                  <button
                    key={opt}
                    onClick={() => setQuality(opt)}
                    className={`quality-btn ${quality === opt ? 'active' : ''}`}
                    type="button"
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sleep-save-row">
            <Button size="large" onClick={handleSave} disabled={saving} className="w-full">
              {saving ? 'Saving...' : 'Save sleep log'}
            </Button>
          </div>
        </section>

        <section className="sleep-history">
          <p className="section-title">Recent sleep</p>
          <div className="history-list">
            {logs.length === 0 && <p className="habits-empty">No sleep logged yet.</p>}
            {logs.map(log => (
              <div key={log.date} className={`history-item ${log.date === date ? 'active' : ''}`}>
                <div>
                  <p className="history-date">{log.date}</p>
                  <p className="history-weight">{log.hours}h · {log.quality || 'good'}</p>
                </div>
                <Button size="default" onClick={() => handleSelectDate(log.date)}>
                  View
                </Button>
              </div>
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

export default SleepPage
