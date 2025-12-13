import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/ui/BottomNav'

function WorkoutDetailsPage() {
  const navigate = useNavigate()
  const { trainingType } = useParams()
  const { user } = useAuth()
  const [exercises, setExercises] = useState([])
  const [completed, setCompleted] = useState(new Set())
  const [allCompleted, setAllCompleted] = useState(false)

  const exerciseData = {
    'upper-body': [
      { id: 1, name: 'Bench Press', sets: '4', reps: '8-10', emoji: '🏋️' },
      { id: 2, name: 'Barbell Rows', sets: '4', reps: '6-8', emoji: '🏋️' },
      { id: 3, name: 'Pull-ups', sets: '3', reps: '8-10', emoji: '🏋️' },
      { id: 4, name: 'Dips', sets: '3', reps: '8-10', emoji: '🏋️' },
    ],
    'lower-body': [
      { id: 1, name: 'Squats', sets: '4', reps: '6-8', emoji: '🦵' },
      { id: 2, name: 'Deadlifts', sets: '4', reps: '4-6', emoji: '🏋️' },
      { id: 3, name: 'Leg Press', sets: '3', reps: '8-10', emoji: '🦵' },
      { id: 4, name: 'Leg Curls', sets: '3', reps: '10-12', emoji: '🦵' },
    ],
    'arms-shoulders': [
      { id: 1, name: 'Shoulder Press', sets: '4', reps: '6-8', emoji: '🎯' },
      { id: 2, name: 'Barbell Curls', sets: '3', reps: '8-10', emoji: '💪' },
      { id: 3, name: 'Tricep Dips', sets: '3', reps: '8-10', emoji: '💪' },
      { id: 4, name: 'Lateral Raises', sets: '3', reps: '12-15', emoji: '🎯' },
    ],
  }

  const trainingNames = {
    'upper-body': { name: 'Upper Body', emoji: '💪' },
    'lower-body': { name: 'Lower Body', emoji: '🦵' },
    'arms-shoulders': { name: 'Arms & Shoulders', emoji: '🎯' },
  }

  useEffect(() => {
    const data = exerciseData[trainingType] || []
    setExercises(data)
  }, [trainingType])

  const toggleExercise = (id) => {
    const newCompleted = new Set(completed)
    if (newCompleted.has(id)) {
      newCompleted.delete(id)
    } else {
      newCompleted.add(id)
    }
    setCompleted(newCompleted)
    setAllCompleted(newCompleted.size === exercises.length && exercises.length > 0)
  }

  const finishWorkout = async () => {
    if (!user?.id) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const trainingName = trainingNames[trainingType]?.name || 'Workout'
      
      const { error } = await supabase
        .from('workout_logs')
        .insert([
          {
            user_id: user.id,
            date: today,
            type: trainingName,
            completed: true,
            exercises_completed: completed.size,
            total_exercises: exercises.length,
          },
        ])
      
      if (!error) {
        navigate('/workouts')
      }
    } catch (err) {
      console.error('Error finishing workout:', err)
    }
  }

  const training = trainingNames[trainingType]

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="workout-details-header">
          <button 
            className="back-button"
            onClick={() => navigate('/workouts')}
            type="button"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="header-emoji">{training?.emoji}</p>
            <h1 className="hero-title">{training?.name}</h1>
            <p className="header-subtitle">{completed.size} of {exercises.length} exercises completed</p>
          </div>
        </section>

        <section className="exercises-section">
          <div className="exercises-grid">
            {exercises.map((exercise) => (
              <div
                key={exercise.id}
                className={`exercise-card ${completed.has(exercise.id) ? 'completed' : ''}`}
                onClick={() => toggleExercise(exercise.id)}
                role="button"
                tabIndex={0}
              >
                <div className="exercise-card-header">
                  <p className="exercise-emoji">{exercise.emoji}</p>
                  <div className="exercise-checkbox">
                    {completed.has(exercise.id) && <Check size={16} />}
                  </div>
                </div>
                <p className="exercise-card-name">{exercise.name}</p>
                <p className="exercise-card-sets">{exercise.sets} sets × {exercise.reps} reps</p>
              </div>
            ))}
          </div>
        </section>

        <section className="workout-actions">
          {allCompleted && (
            <div className="completion-message">
              <p>🔥 Amazing! You've completed all exercises!</p>
            </div>
          )}
          <Button 
            size="large" 
            variant="primary"
            onClick={finishWorkout}
            className="w-full"
            disabled={!allCompleted}
          >
            {allCompleted ? 'Finish Workout' : 'Complete all exercises to finish'}
          </Button>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

export default WorkoutDetailsPage
