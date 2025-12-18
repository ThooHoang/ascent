import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BottomNav } from '../components/ui/BottomNav'
import { useSelectedDate } from '../contexts/DateContext'
import { useRoutine } from '../hooks/useRoutine'

function WorkoutsPage() {
  const navigate = useNavigate()
  const [todayTraining, setTodayTraining] = useState(null)
  const [trainingType, setTrainingType] = useState(null)
  const [todayIndex, setTodayIndex] = useState(null)
  const [editingRoutine, setEditingRoutine] = useState(false)
  const { selectedDate } = useSelectedDate()
  const { routine, trainingForDate, updateDayType, typeMeta } = useRoutine()

  useEffect(() => {
    const todayIdx = (new Date(selectedDate).getDay() + 6) % 7 // Monday = 0
    const training = trainingForDate(selectedDate)
    setTodayTraining(training)
    setTrainingType(training?.type)
    setTodayIndex(todayIdx)
  }, [selectedDate, trainingForDate])

  const routineOptions = [
    { value: 'rest', label: typeMeta.rest.name, emoji: typeMeta.rest.emoji },
    { value: 'upper-body', label: typeMeta['upper-body'].name, emoji: typeMeta['upper-body'].emoji },
    { value: 'lower-body', label: typeMeta['lower-body'].name, emoji: typeMeta['lower-body'].emoji },
  ]

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="workouts-header">
          <div>
            <p className="section-eyebrow">Fitness</p>
            <h1 className="hero-title">Today's Training</h1>
          </div>
        </section>

        {todayTraining && (
          <button
            className={`today-training-card ${trainingType ? 'clickable' : ''}`}
            onClick={() => trainingType && navigate(`/workout/${trainingType}`)}
            type="button"
            disabled={!trainingType}
          >
            <div className="training-card-header">
              <p className="training-badge">{todayTraining.emoji} {todayTraining.name}</p>
            </div>
          </button>
        )}

        <section className="training-schedule-section">
          <h2 className="section-title">Weekly Schedule</h2>
          <div className="training-schedule">
            {routine.map((item, idx) => {
              const meta = typeMeta[item.type || 'rest'] || typeMeta.rest
              const trainingPath = item.type && item.type !== 'rest' ? item.type : null

              if (editingRoutine) {
                return (
                  <div key={item.dayKey} className={`schedule-item ${idx === todayIndex ? 'today' : ''}`}>
                    <p className="schedule-day">{item.label}</p>
                    <div className="routine-switch">
                      {routineOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          className={`routine-pill ${item.type === opt.value ? 'active' : ''}`}
                          onClick={() => updateDayType(item.dayKey, opt.value)}
                        >
                          {opt.emoji} {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              }

              return (
                <button
                  key={item.dayKey}
                  className={`schedule-item ${trainingPath ? 'clickable' : ''} ${idx === todayIndex ? 'today' : ''}`}
                  onClick={() => trainingPath && navigate(`/workout/${trainingPath}`)}
                  type="button"
                  disabled={!trainingPath}
                >
                  <p className="schedule-day">{item.label}</p>
                  <p className="schedule-focus">{meta.emoji} {meta.name}</p>
                </button>
              )
            })}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

export default WorkoutsPage
