import { useMemo, useState } from 'react'
import { AlarmClock, Moon, Sun } from 'lucide-react'

export function SleepCalculator() {
  const [mode, setMode] = useState('wake') // 'wake' | 'sleep'
  const [time, setTime] = useState('07:00')

  const parseTime = (t) => {
    const [h, m] = t.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0, 0)
    return d
  }

  const formatTime = (d) => {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  const results = useMemo(() => {
    const base = parseTime(time)
    const cycle = 90 // minutes per cycle
    const fallAsleep = 15 // minutes to fall asleep
    const cycles = [6, 5, 4, 3] // 9h, 7.5h, 6h, 4.5h

    if (mode === 'wake') {
      // Suggest bedtimes
      return cycles.map(c => {
        const mins = c * cycle + fallAsleep
        const d = new Date(base)
        d.setMinutes(d.getMinutes() - mins)
        return { label: `${c} cycles`, time: formatTime(d) }
      })
    } else {
      // Suggest wake times
      return cycles.map(c => {
        const mins = c * cycle + fallAsleep
        const d = new Date(base)
        d.setMinutes(d.getMinutes() + mins)
        return { label: `${c} cycles`, time: formatTime(d) }
      })
    }
  }, [mode, time])

  return (
    <section className="sleep-calculator" aria-labelledby="sleep-calc-title">
      <div className="sleep-calc-header">
        <p className="section-title" id="sleep-calc-title">Sleep calculator</p>
        <p className="sleep-calc-subtitle">Based on 90-minute cycles + ~15m to fall asleep.</p>
      </div>

      <div className="sleep-calc-controls">
        <div className="sleep-mode-switch" role="group" aria-label="Calculator mode">
          <button
            type="button"
            className={`mode-pill ${mode==='wake'?'active':''}`}
            aria-pressed={mode==='wake'}
            onClick={() => setMode('wake')}
          >
            <Sun size={16} />
            Wake time
          </button>
          <button
            type="button"
            className={`mode-pill ${mode==='sleep'?'active':''}`}
            aria-pressed={mode==='sleep'}
            onClick={() => setMode('sleep')}
          >
            <Moon size={16} />
            Bedtime
          </button>
        </div>

        <div className="sleep-time-picker">
          <label className="sleep-time-label" htmlFor="sleep-calc-time">
            <AlarmClock size={16} />
            {mode === 'wake' ? 'Desired wake time' : 'Planned bedtime'}
          </label>
          <input
            id="sleep-calc-time"
            type="time"
            className="input-field"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            aria-label="Time"
          />
        </div>
      </div>

      <div className="sleep-calc-results" aria-live="polite">
        {results.map((r, idx) => (
          <div key={r.label} className="sleep-calc-card" title={`${r.label} • ${r.time}`}>
            <div className="sleep-calc-card-left">
              <span className="sleep-calc-badge">{r.label}</span>
              {idx === 0 && <span className="sleep-calc-reco">Recommended</span>}
            </div>
            <span className="sleep-calc-time">{r.time}</span>
          </div>
        ))}
      </div>

      <p className="sleep-calc-note">Tip: Pick the time that best fits your routine.</p>
    </section>
  )
}
