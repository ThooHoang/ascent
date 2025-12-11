import { useAuth } from '../../hooks/useAuth'

export function TodayTraining() {
  const { user } = useAuth()

  return (
    <div className="training-card">
      <p className="card-label">Today's training</p>
      <p className="section-title">No active workouts</p>
      <p className="text-secondary">Start logging your workouts to track progress</p>
    </div>
  )
}

