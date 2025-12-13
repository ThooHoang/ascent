import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { BottomNav } from '../components/ui/BottomNav'
import { useSelectedDate } from '../contexts/DateContext'

function WorkoutsPage() {
  const navigate = useNavigate()
  const [todayTraining, setTodayTraining] = useState(null)
  const [trainingType, setTrainingType] = useState(null)
  const [todayIndex, setTodayIndex] = useState(null)
  const { selectedDate } = useSelectedDate()

  useEffect(() => {
    const today = new Date(selectedDate).getDay()
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const trainingMap = {
      0: { name: 'Rest Day', emoji: '😴', type: null },         // Sunday
      1: { name: 'Rest Day', emoji: '😴', type: null },         // Monday
      2: { name: 'Upper Body', emoji: '💪', type: 'upper-body' }, // Tuesday
      3: { name: 'Rest Day', emoji: '😴', type: null },         // Wednesday
      4: { name: 'Lower Body', emoji: '🦵', type: 'lower-body' }, // Thursday
      5: { name: 'Upper Body', emoji: '💪', type: 'upper-body' }, // Friday
      6: { name: 'Lower Body', emoji: '🦵', type: 'lower-body' }, // Saturday
    }
    const training = trainingMap[today]
    setTodayTraining(training)
    setTrainingType(training?.type)
    // Map day to schedule index (Monday = 0, Sunday = 6)
    const scheduleIndex = today === 0 ? 6 : today - 1
    setTodayIndex(scheduleIndex)
  }, [selectedDate])

  const trainingSchedule = [
    { day: 'Monday', focus: 'Rest Day', emoji: '😴' },
    { day: 'Tuesday', focus: 'Upper Body', emoji: '💪' },
    { day: 'Wednesday', focus: 'Rest Day', emoji: '😴' },
    { day: 'Thursday', focus: 'Lower Body', emoji: '🦵' },
    { day: 'Friday', focus: 'Upper Body', emoji: '💪' },
    { day: 'Saturday', focus: 'Lower Body', emoji: '🦵' },
    { day: 'Sunday', focus: 'Rest Day', emoji: '😴' },
  ]

  const getExercises = (trainingType) => {
    const exercises = {
      'Upper Body': [
        { name: 'Bench Press', sets: '4 x 8-10 reps', emoji: '🏋️' },
        { name: 'Barbell Rows', sets: '4 x 6-8 reps', emoji: '🏋️' },
        { name: 'Pull-ups', sets: '3 x 8-10 reps', emoji: '🏋️' },
        { name: 'Dips', sets: '3 x 8-10 reps', emoji: '🏋️' },
      ],
      'Lower Body': [
        { name: 'Squats', sets: '4 x 6-8 reps', emoji: '🦵' },
        { name: 'Deadlifts', sets: '4 x 4-6 reps', emoji: '🏋️' },
        { name: 'Leg Press', sets: '3 x 8-10 reps', emoji: '🦵' },
        { name: 'Leg Curls', sets: '3 x 10-12 reps', emoji: '🦵' },
      ],
      'Rest Day': [
        { name: 'Light stretching', sets: '15-20 mins', emoji: '🧘' },
        { name: 'Foam rolling', sets: '10-15 mins', emoji: '🧘' },
        { name: 'Walking', sets: '30 mins', emoji: '🚶' },
      ],
    }
    return exercises[trainingType] || []
  }

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
            {trainingSchedule.map((item, idx) => {
              const trainingType = item.focus === 'Upper Body' ? 'upper-body' : 
                                  item.focus === 'Lower Body' ? 'lower-body' : null
              
              return (
                <button
                  key={idx}
                  className={`schedule-item ${trainingType ? 'clickable' : ''} ${idx === todayIndex ? 'today' : ''}`}
                  onClick={() => trainingType && navigate(`/workout/${trainingType}`)}
                  type="button"
                  disabled={!trainingType}
                >
                  <p className="schedule-day">{item.day}</p>
                  <p className="schedule-focus">{item.emoji} {item.focus}</p>
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
