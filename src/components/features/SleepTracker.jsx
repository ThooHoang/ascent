import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'

export function SleepTracker() {
  const { user } = useAuth()
  const [sleepHours, setSleepHours] = useState(7.5)
  const [sleepQuality, setSleepQuality] = useState('good')
  const [lastSleepDate, setLastSleepDate] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchTodaySleep()
    }
  }, [user?.id])

  const fetchTodaySleep = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('sleep_logs')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', today)
        .single()

      if (data) {
        setSleepHours(data.hours)
        setSleepQuality(data.quality || 'good')
        setLastSleepDate(data.date)
      }
    } catch (err) {
      console.log('No sleep data for today yet')
    } finally {
      setLoading(false)
    }
  }

  const saveSleep = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      
      const { error } = await supabase
        .from('sleep_logs')
        .upsert(
          {
            user_id: user.id,
            date: today,
            hours: sleepHours,
            quality: sleepQuality,
          },
          { onConflict: 'user_id,date' }
        )

      if (!error) {
        setLastSleepDate(today)
        alert('Sleep logged successfully!')
      }
    } catch (err) {
      console.error('Error logging sleep:', err)
      alert('Failed to log sleep')
    }
  }

  const getSleepStatus = () => {
    if (sleepHours < 6) return '😴 Need more sleep'
    if (sleepHours < 7) return '😕 Below recommended'
    if (sleepHours <= 9) return '😴 Perfect!'
    return '😴 Too much?'
  }

  if (loading) {
    return <div className="sleep-loading">Loading sleep data...</div>
  }

  return (
    <article className="sleep-card">
      <div className="sleep-header">
        <div>
          <p className="card-label">Sleep Tracking</p>
          <p className="card-value">{sleepHours.toFixed(1)}h</p>
        </div>
        <div className="sleep-status">{getSleepStatus()}</div>
      </div>

      <div className="sleep-controls">
        <div className="sleep-input-group">
          <label className="sleep-label">Hours slept</label>
          <div className="sleep-time-input">
            <button 
              onClick={() => setSleepHours(Math.max(0, sleepHours - 0.5))}
              type="button"
              className="time-btn"
            >
              −
            </button>
            <span className="time-display">{sleepHours.toFixed(1)}</span>
            <button 
              onClick={() => setSleepHours(Math.min(12, sleepHours + 0.5))}
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
            {['poor', 'fair', 'good', 'excellent'].map(quality => (
              <button
                key={quality}
                onClick={() => setSleepQuality(quality)}
                className={`quality-btn ${sleepQuality === quality ? 'active' : ''}`}
                type="button"
              >
                {quality === 'poor' && '😴'}
                {quality === 'fair' && '😴'}
                {quality === 'good' && '😊'}
                {quality === 'excellent' && '😴'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button onClick={saveSleep} className="sleep-save-btn" type="button">
        💾 Log Sleep
      </button>

      {lastSleepDate && (
        <p className="sleep-hint">Last logged: {lastSleepDate}</p>
      )}
    </article>
  )
}
