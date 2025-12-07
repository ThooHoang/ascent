import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function TodayTraining() {
  const { user } = useAuth()
  const [workout, setWorkout] = useState(null)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Placeholder workout data
    setWorkout({
      name: 'Chest, Biceps',
      exercises: 6,
      completed: 0,
      duration: '1hr',
      time: 'Today',
    })
  }, [user?.id])

  const handleStartWorkout = () => {
    alert('Workout timer starting...')
  }

  if (!workout) {
    return (
      <div className="training-card">
        <p className="card-label">Today's training</p>
        <p className="text-secondary">No workout planned</p>
      </div>
    )
  }

  const progressPercent = (workout.completed / workout.exercises) * 100

  return (
    <div className="training-card">
      <div className="training-header">
        <div>
          <p className="section-title">{workout.name}</p>
          <p className="training-detail">{workout.completed} of {workout.exercises} exercise</p>
        </div>
        <p className="training-time">{workout.duration}</p>
      </div>

      <div className="training-progress">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progressPercent}%` }} />
        </div>
      </div>

      <button className="btn btn-primary w-full" type="button" onClick={handleStartWorkout}>
        Start training
      </button>
    </div>
  )
}
