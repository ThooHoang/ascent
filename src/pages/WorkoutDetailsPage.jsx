import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Pause, Play, X, Edit, Trash2, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useSelectedDate } from '../contexts/DateContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { BottomNav } from '../components/ui/BottomNav'

function WorkoutDetailsPage() {
  const navigate = useNavigate()
  const { trainingType } = useParams()
  const { user } = useAuth()
  const { selectedDate } = useSelectedDate()
  const [exercises, setExercises] = useState([])
  const [completed, setCompleted] = useState(new Set())
  const [allCompleted, setAllCompleted] = useState(false)
  const [breakActive, setBreakActive] = useState(false)
  const [breakTime, setBreakTime] = useState(90) // 90 seconds default
  const [breakTimeLeft, setBreakTimeLeft] = useState(90)
  const [isBreakRunning, setIsBreakRunning] = useState(false)
  const [editingExercise, setEditingExercise] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', sets: '', reps: '' })
  const [deletingExerciseId, setDeletingExerciseId] = useState(null)
  const [addingExerciseActive, setAddingExerciseActive] = useState(false)
  const [addForm, setAddForm] = useState({ name: '', sets: '', reps: '', weight: '' })

  useEffect(() => {
    let interval
    if (breakActive && isBreakRunning && breakTimeLeft > 0) {
      interval = setInterval(() => {
        setBreakTimeLeft(prev => {
          if (prev <= 1) {
            setIsBreakRunning(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [breakActive, isBreakRunning, breakTimeLeft])

  const exerciseData = {
    'upper-body': [
      { id: 1, name: 'Bench Press', sets: '4', reps: '8-10', weight: '85', emoji: '🏋️' },
      { id: 2, name: 'Barbell Rows', sets: '4', reps: '6-8', weight: '95', emoji: '🏋️' },
      { id: 3, name: 'Pull-ups', sets: '3', reps: '8-10', weight: 'BW', emoji: '🏋️' },
      { id: 4, name: 'Dips', sets: '3', reps: '8-10', weight: 'BW', emoji: '🏋️' },
    ],
    'lower-body': [
      { id: 1, name: 'Squats', sets: '4', reps: '6-8', weight: '125', emoji: '🦵' },
      { id: 2, name: 'Deadlifts', sets: '4', reps: '4-6', weight: '145', emoji: '🏋️' },
      { id: 3, name: 'Leg Press', sets: '3', reps: '8-10', weight: '200', emoji: '🦵' },
      { id: 4, name: 'Leg Curls', sets: '3', reps: '10-12', weight: '80', emoji: '🦵' },
    ],
  }

  const trainingNames = {
    'upper-body': { name: 'Upper Body', emoji: '💪' },
    'lower-body': { name: 'Lower Body', emoji: '🦵' },
  }

  useEffect(() => {
    const data = exerciseData[trainingType] || []
    setExercises(data)
    // Load persisted completion state for this session
    try {
      const keyUser = user?.id || 'guest'
      const storageKey = `workout-completed-${keyUser}-${selectedDate}-${trainingType}`
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const ids = JSON.parse(stored)
        if (Array.isArray(ids)) {
          setCompleted(new Set(ids))
          setAllCompleted(ids.length === data.length && data.length > 0)
        }
      }
    } catch {}
  }, [trainingType, selectedDate, user?.id])

  const toggleExercise = (id) => {
    const newCompleted = new Set(completed)
    if (newCompleted.has(id)) {
      newCompleted.delete(id)
    } else {
      newCompleted.add(id)
    }
    setCompleted(newCompleted)
    setAllCompleted(newCompleted.size === exercises.length && exercises.length > 0)
    // Persist to localStorage
    try {
      const keyUser = user?.id || 'guest'
      const storageKey = `workout-completed-${keyUser}-${selectedDate}-${trainingType}`
      localStorage.setItem(storageKey, JSON.stringify(Array.from(newCompleted)))
    } catch {}
  }

  const [finishConfirmActive, setFinishConfirmActive] = useState(false)
  const [finishSuccessActive, setFinishSuccessActive] = useState(false)

  const finishWorkout = async () => {
    try {
      const today = new Date().toISOString().split('T')[0]
      const trainingName = trainingNames[trainingType]?.name || 'Workout'

      if (user?.id) {
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
        if (error) {
          console.error('Error finishing workout:', error)
        }
      } else {
        // Guest mode: store a simple log in localStorage
        const key = 'guest-workout-logs'
        const prev = JSON.parse(localStorage.getItem(key) || '[]')
        prev.push({ date: today, type: trainingName, completed: true })
        localStorage.setItem(key, JSON.stringify(prev))
      }
      setFinishSuccessActive(true)
    } catch (err) {
      console.error('Error finishing workout:', err)
      setFinishSuccessActive(true)
    }
  }

  const startBreak = () => {
    setBreakTimeLeft(breakTime)
    setBreakActive(true)
    setIsBreakRunning(true)
  }

  const pauseBreak = () => {
    setIsBreakRunning(!isBreakRunning)
  }

  const stopBreak = () => {
    setBreakActive(false)
    setIsBreakRunning(false)
    setBreakTimeLeft(breakTime)
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const breakProgress = ((breakTime - breakTimeLeft) / breakTime) * 100

  const training = trainingNames[trainingType]

  const handleEdit = (exercise) => {
    setEditingExercise(exercise.id)
    setEditForm({ name: exercise.name, sets: exercise.sets, reps: exercise.reps, weight: exercise.weight || '' })
  }

  const saveEdit = () => {
    if (!editForm.name.trim() || !editForm.sets.trim() || !editForm.reps.trim() || !editForm.weight.trim()) {
      return
    }
    setExercises(exercises.map(ex => 
      ex.id === editingExercise 
        ? { ...ex, name: editForm.name, sets: editForm.sets, reps: editForm.reps, weight: editForm.weight }
        : ex
    ))
    setEditingExercise(null)
    setEditForm({ name: '', sets: '', reps: '', weight: '' })
  }

  const deleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id))
    setDeletingExerciseId(null)
    const newCompleted = new Set(completed)
    newCompleted.delete(id)
    setCompleted(newCompleted)
  }

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
            <h1 className="hero-title">{training?.name}</h1>
            <p className="header-subtitle">{completed.size} of {exercises.length} exercises completed</p>
          </div>
        </section>

        <section className="exercises-section">
          <div className="exercises-list">
            {exercises.map((exercise) => (
              <div key={exercise.id}>
                {editingExercise === exercise.id ? (
                  <div className="exercise-edit-form">
                    <div className="edit-form-fields">
                      <Input 
                        placeholder="Exercise name"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      />
                      <Input 
                        placeholder="Sets (e.g., 4)"
                        value={editForm.sets}
                        onChange={(e) => setEditForm({ ...editForm, sets: e.target.value })}
                      />
                      <Input 
                        placeholder="Reps (e.g., 8-10)"
                        value={editForm.reps}
                        onChange={(e) => setEditForm({ ...editForm, reps: e.target.value })}
                      />
                      <Input 
                        placeholder="Weight (e.g., 185 or BW)"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      />
                    </div>
                    <div className="edit-form-actions">
                      <Button 
                        size="small" 
                        variant="primary"
                        onClick={saveEdit}
                      >
                        Save
                      </Button>
                      <Button 
                        size="small" 
                        variant="secondary"
                        onClick={() => setEditingExercise(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div
                    className={`exercise-row ${completed.has(exercise.id) ? 'completed' : ''}`}
                  >
                    <div className="exercise-row-content">
                      <div className="exercise-row-info">
                        <h3 className="exercise-name">{exercise.name}</h3>
                        <p className="exercise-details">{exercise.sets} sets × {exercise.reps} reps @ {exercise.weight || '—'}</p>
                      </div>
                      <button
                        className="exercise-checkbox-btn"
                        onClick={() => toggleExercise(exercise.id)}
                        type="button"
                        aria-label={`Mark ${exercise.name} as ${completed.has(exercise.id) ? 'incomplete' : 'complete'}`}
                      >
                        {completed.has(exercise.id) && <Check size={20} />}
                      </button>
                    </div>
                    <div className="exercise-row-actions">
                      <button 
                        className="exercise-action-btn edit-btn" 
                        onClick={() => handleEdit(exercise)}
                        type="button" 
                        aria-label="Edit exercise"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        className="exercise-action-btn delete-btn" 
                        onClick={() => setDeletingExerciseId(exercise.id)}
                        type="button" 
                        aria-label="Delete exercise"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <Button 
            size="large" 
            variant="secondary"
            className="w-full add-exercise-btn"
            onClick={() => setAddingExerciseActive(true)}
          >
            <Plus size={20} />
            Add Exercise
          </Button>
        </section>

      {/* Delete Confirmation Modal */}
      {deletingExerciseId && (
        <div className="modal-overlay">
          <div className="modal-container delete-modal">
            <h2 className="modal-title">Delete Exercise?</h2>
            <p className="modal-description">
              This action cannot be undone. The exercise will be removed from your workout.
            </p>
            <div className="modal-actions">
              <Button 
                size="large" 
                variant="secondary"
                onClick={() => setDeletingExerciseId(null)}
              >
                Cancel
              </Button>
              <Button 
                size="large" 
                variant="primary"
                onClick={() => deleteExercise(deletingExerciseId)}
                className="delete-confirm-btn"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add Exercise Modal */}
      {addingExerciseActive && (
        <div className="modal-overlay">
          <div className="modal-container">
            <h2 className="modal-title">Add Exercise</h2>
            <div className="edit-form-fields">
              <Input 
                placeholder="Exercise name"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
              />
              <Input 
                placeholder="Sets (e.g., 4)"
                value={addForm.sets}
                onChange={(e) => setAddForm({ ...addForm, sets: e.target.value })}
              />
              <Input 
                placeholder="Reps (e.g., 8-10)"
                value={addForm.reps}
                onChange={(e) => setAddForm({ ...addForm, reps: e.target.value })}
              />
              <Input 
                placeholder="Weight (e.g., 185 or BW)"
                value={addForm.weight}
                onChange={(e) => setAddForm({ ...addForm, weight: e.target.value })}
              />
            </div>
            <div className="modal-actions">
              <Button size="large" variant="secondary" onClick={() => { setAddingExerciseActive(false); setAddForm({ name: '', sets: '', reps: '', weight: '' }) }}>Cancel</Button>
              <Button size="large" variant="primary" onClick={() => {
                if (!addForm.name.trim() || !addForm.sets.trim() || !addForm.reps.trim() || !addForm.weight.trim()) return
                const nextId = exercises.length ? Math.max(...exercises.map(e => e.id)) + 1 : 1
                const newExercise = { id: nextId, name: addForm.name.trim(), sets: addForm.sets.trim(), reps: addForm.reps.trim(), weight: addForm.weight.trim() }
                const updated = [...exercises, newExercise]
                setExercises(updated)
                // clear completion persistence as list changed
                try {
                  const keyUser = user?.id || 'guest'
                  const storageKey = `workout-completed-${keyUser}-${selectedDate}-${trainingType}`
                  localStorage.setItem(storageKey, JSON.stringify(Array.from(completed)))
                } catch {}
                setAddingExerciseActive(false)
                setAddForm({ name: '', sets: '', reps: '', weight: '' })
              }}>Add</Button>
            </div>
          </div>
        </div>
      )}

        <section className="workout-actions">
          <Button 
            size="large" 
            variant="secondary"
            onClick={startBreak}
            className="w-full"
          >
            Take a Break
          </Button>
          <Button 
            size="large" 
            variant="primary"
            onClick={() => setFinishConfirmActive(true)}
            className="w-full"
          >
            Finish Workout
          </Button>
              {/* Finish Confirmation Modal */}
              {finishConfirmActive && (
                <div className="modal-overlay">
                  <div className="modal-container">
                    <h2 className="modal-title">Finish workout?</h2>
                    <p className="modal-description">We'll log this session to your workouts.</p>
                    <div className="modal-actions">
                      <Button size="large" variant="secondary" onClick={() => setFinishConfirmActive(false)}>Cancel</Button>
                      <Button size="large" variant="primary" onClick={() => { setFinishConfirmActive(false); finishWorkout() }}>Confirm</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Success Modal */}
              {finishSuccessActive && (
                <div className="modal-overlay">
                  <div className="modal-container">
                    <h2 className="modal-title">Workout logged 🎉</h2>
                    <p className="modal-description">Nice work! Keep the momentum going.</p>
                    <div className="modal-actions">
                      <Button size="large" variant="primary" onClick={() => { setFinishSuccessActive(false); navigate('/workouts') }}>Go to Workouts</Button>
                    </div>
                  </div>
                </div>
              )}
        </section>
      </main>

      {breakActive && (
        <div className="break-modal-overlay">
          <div className="break-modal-container">
            <button
              className="break-close-btn"
              onClick={stopBreak}
              type="button"
              aria-label="Close break timer"
            >
              <X size={24} />
            </button>

            <div className="break-timer-circle">
              <svg className="break-progress-ring" viewBox="0 0 200 200">
                <circle
                  className="break-progress-bg"
                  cx="100"
                  cy="100"
                  r="90"
                />
                <circle
                  className="break-progress-fill"
                  cx="100"
                  cy="100"
                  r="90"
                  style={{
                    strokeDasharray: `${breakProgress * 5.65} 565`,
                  }}
                />
              </svg>
              <div className="break-timer-display">
                <p className="break-time">{formatTime(breakTimeLeft)}</p>
                <p className="break-label">Rest</p>
              </div>
            </div>

            <div className="break-controls">
              <Button
                size="large"
                variant={isBreakRunning ? 'secondary' : 'primary'}
                onClick={pauseBreak}
                className="break-control-btn"
              >
                {isBreakRunning ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              <Button
                size="large"
                variant="secondary"
                onClick={stopBreak}
                className="break-control-btn"
              >
                Done
              </Button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}

export default WorkoutDetailsPage
