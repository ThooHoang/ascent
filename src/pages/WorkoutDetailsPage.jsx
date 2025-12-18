import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Check, Pause, Play, X, Edit, Trash2, Plus, Clock } from 'lucide-react'
import { useState, useEffect, useMemo } from 'react'
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
  const [benchMilestoneActive, setBenchMilestoneActive] = useState(false)
  const [finishConfirmActive, setFinishConfirmActive] = useState(false)
  const [finishSuccessActive, setFinishSuccessActive] = useState(false)
  const [sessionInputs, setSessionInputs] = useState({})
  const [history, setHistory] = useState([])
  const historyKey = useMemo(() => `exercise-history-${user?.id || 'guest'}`, [user?.id])
  const formatShortDate = (value) => {
    if (!value) return '—'
    const d = new Date(value)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

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

  // Close dialogs/break on Escape for accessibility
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (deletingExerciseId) setDeletingExerciseId(null)
        else if (addingExerciseActive) setAddingExerciseActive(false)
        else if (finishConfirmActive) setFinishConfirmActive(false)
        else if (finishSuccessActive) setFinishSuccessActive(false)
        else if (breakActive) stopBreak()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [deletingExerciseId, addingExerciseActive, finishConfirmActive, finishSuccessActive, breakActive])

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
    try {
      const stored = localStorage.getItem(historyKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed)) {
          setHistory(parsed)
        } else {
          setHistory([])
        }
      } else {
        setHistory([])
      }
    } catch {
      setHistory([])
    }
  }, [historyKey])

  const lastEntries = useMemo(() => {
    const map = {}
    history.forEach((entry) => {
      if (entry.trainingType !== trainingType) return
      const key = (entry.name || '').toLowerCase()
      const current = map[key]
      if (!current || new Date(entry.date) > new Date(current.date)) {
        map[key] = entry
      }
    })
    return map
  }, [history, trainingType])

  const getLastEntry = (name) => lastEntries[(name || '').toLowerCase()] || null

  const historyByExercise = useMemo(() => {
    const map = {}
    history
      .filter((entry) => entry.trainingType === trainingType)
      .forEach((entry) => {
        const key = (entry.name || '').toLowerCase()
        if (!map[key]) map[key] = []
        map[key].push(entry)
      })
    Object.keys(map).forEach((key) => {
      map[key] = map[key]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 3)
    })
    return map
  }, [history, trainingType])

  const recentTrainingSummary = useMemo(() => {
    const sessions = history
      .filter((h) => h.trainingType === trainingType)
      .reduce((acc, cur) => {
        const key = cur.date
        if (!acc[key]) acc[key] = { date: cur.date, items: [] }
        acc[key].items.push(cur)
        return acc
      }, {})
    const sorted = Object.values(sessions).sort((a, b) => new Date(b.date) - new Date(a.date))
    return sorted.slice(0, 2)
  }, [history, trainingType])

  const hasHistory = useMemo(() => history.some((h) => h.trainingType === trainingType), [history, trainingType])

  useEffect(() => {
    const data = exerciseData[trainingType] || []
    setExercises(data)
    setSessionInputs({})
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

  useEffect(() => {
    setSessionInputs((prev) => {
      const next = { ...prev }
      exercises.forEach((ex) => {
        if (!next[ex.id]) {
          const last = getLastEntry(ex.name)
          if (last) {
            next[ex.id] = { weight: last.weight || '', reps: last.reps || '' }
          }
        }
      })
      return next
    })
  }, [exercises, lastEntries])

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

  const updateSessionInput = (id, field, value) => {
    setSessionInputs((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
  }


  const finishWorkout = async () => {
    try {
      const today = new Date(selectedDate).toISOString().split('T')[0]
      const trainingName = trainingNames[trainingType]?.name || 'Workout'
      const progressEntries = exercises.map((ex) => {
        const input = sessionInputs[ex.id] || {}
        const weight = (input.weight || ex.weight || '').toString().trim()
        const reps = (input.reps || ex.reps || '').toString().trim()
        return { name: ex.name, trainingType, date: today, weight, reps }
      })

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
      try {
        const prevHistory = localStorage.getItem(historyKey)
        const parsed = prevHistory ? JSON.parse(prevHistory) : []
        const nextHistory = Array.isArray(parsed) ? [...parsed, ...progressEntries] : progressEntries
        localStorage.setItem(historyKey, JSON.stringify(nextHistory))
        setHistory(nextHistory)
      } catch {}

      progressEntries.forEach((entry) => maybeTriggerBenchMilestone(entry))
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

  const maybeTriggerBenchMilestone = (exerciseLike) => {
    try {
      if (trainingType !== 'upper-body') return
      const name = (exerciseLike?.name || '').toLowerCase()
      if (!name.includes('bench')) return
      const w = (exerciseLike?.weight || '').toString().trim()
      if (!w || w.toLowerCase() === 'bw') return
      const numeric = parseFloat(w)
      if (Number.isNaN(numeric)) return
      const key = `bench-100kg-celebrated-${user?.id || 'guest'}`
      const already = localStorage.getItem(key)
      if (!already && numeric >= 100) {
        localStorage.setItem(key, 'true')
        setBenchMilestoneActive(true)
        document.documentElement.classList.add('egg-mode')
        setTimeout(() => {
          document.documentElement.classList.remove('egg-mode')
        }, 10000)
      }
    } catch {}
  }

  const handleEdit = (exercise) => {
    setEditingExercise(exercise.id)
    setEditForm({ name: exercise.name, sets: exercise.sets, reps: exercise.reps, weight: exercise.weight || '' })
  }

  const saveEdit = () => {
    if (!editForm.name.trim() || !editForm.sets.trim() || !editForm.reps.trim() || !editForm.weight.trim()) {
      return
    }
    const updatedList = exercises.map(ex => 
      ex.id === editingExercise 
        ? { ...ex, name: editForm.name, sets: editForm.sets, reps: editForm.reps, weight: editForm.weight }
        : ex
    )
    setExercises(updatedList)
    setEditingExercise(null)
    setEditForm({ name: '', sets: '', reps: '', weight: '' })
    // Milestone: Bench Press 100kg+
    maybeTriggerBenchMilestone({ name: editForm.name, weight: editForm.weight })
  }

  const deleteExercise = (id) => {
    setExercises(exercises.filter(ex => ex.id !== id))
    setDeletingExerciseId(null)
    const newCompleted = new Set(completed)
    newCompleted.delete(id)
    setCompleted(newCompleted)
    setSessionInputs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
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

        <section className="progress-summary">
          <div className="progress-header" style={{ marginBottom: '12px' }}>
            <div>
              <h2 className="section-title">Recent sessions</h2>
              <p className="text-secondary">Last two sessions for this plan</p>
            </div>
          </div>
          {recentTrainingSummary.length > 0 ? (
            <div className="progress-cards">
              {recentTrainingSummary.map((session) => (
                <div key={session.date} className="progress-card">
                  <div className="progress-card-header">
                    <div>
                      <p>{formatShortDate(session.date)}</p>
                    </div>
                  </div>
                  <ul className="progress-list compact">
                    {session.items.slice(0, 3).map((item, idx) => (
                      <li key={`${session.date}-${item.name}-${idx}`} className="progress-list-row">
                        <div className="progress-meta">
                          <span className="progress-exercise" style={{ display: 'block', marginBottom: '2px' }}>{item.name}</span>
                          <span className="progress-metric">Weight: {item.weight || '—'} · Reps: {item.reps || '—'}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <div className="progress-empty">
              {hasHistory
                ? 'Not enough sessions yet—finish another workout to see the trend.'
                : 'Log a workout to see your recent weights and reps.'}
            </div>
          )}
        </section>

        <section className="exercises-section simplified">
          <div className="exercises-list">
            {exercises.map((exercise) => (
              <div key={exercise.id} className={`exercise-card ${completed.has(exercise.id) ? 'completed' : ''}`}>
                <div className="exercise-card-top" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                  <div className="exercise-main-info">
                    <p className="exercise-name">{exercise.name}</p>
                    <p className="exercise-details subtle">{exercise.sets} × {exercise.reps} @ {exercise.weight ? (exercise.weight === 'BW' ? 'BW' : `${exercise.weight} kg`) : '—'}</p>
                    {getLastEntry(exercise.name) && (
                      <p className="exercise-details subtle">Prev: {getLastEntry(exercise.name)?.weight || '—'} kg · {getLastEntry(exercise.name)?.reps || '—'} reps</p>
                    )}
                  </div>
                  <div
                    className="exercise-actions-right"
                    style={{ marginLeft: 'auto', display: 'flex', gap: '0.35rem', alignItems: 'flex-start' }}
                  >
                    <button
                      className="exercise-checkbox-btn large"
                      onClick={() => toggleExercise(exercise.id)}
                      type="button"
                      aria-label={`Mark ${exercise.name} as ${completed.has(exercise.id) ? 'incomplete' : 'complete'}`}
                      style={{ height: '48px', width: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {completed.has(exercise.id) && <Check size={20} />}
                    </button>
                      <button 
                        className="exercise-action-btn edit-btn" 
                        type="button" 
                        onClick={() => handleEdit(exercise)}
                        aria-label={`Edit ${exercise.name}`}
                        style={{ height: '48px', width: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      >
                        <Edit size={16} />
                      </button>
                    <button 
                      className="exercise-action-btn delete-btn" 
                      type="button" 
                      onClick={() => setDeletingExerciseId(exercise.id)}
                      aria-label={`Delete ${exercise.name}`}
                        style={{ height: '48px', width: '48px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="exercise-input-row compact">
                  <Input 
                    placeholder="Weight"
                    value={sessionInputs[exercise.id]?.weight || ''}
                    onChange={(e) => updateSessionInput(exercise.id, 'weight', e.target.value)}
                  />
                  <Input 
                    placeholder="Reps"
                    value={sessionInputs[exercise.id]?.reps || ''}
                    onChange={(e) => updateSessionInput(exercise.id, 'reps', e.target.value)}
                  />
                </div>

                {historyByExercise[(exercise.name || '').toLowerCase()] && (
                  <div className="exercise-history">
                    <p className="exercise-history-label">Recent</p>
                    <div className="exercise-history-chips">
                      {historyByExercise[(exercise.name || '').toLowerCase()].map((entry, idx) => (
                        <span key={`${entry.date}-${idx}`} className="history-chip">
                          {formatShortDate(entry.date)} · {entry.weight || '—'} kg · {entry.reps || '—'} reps
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {editingExercise === exercise.id && (
                  <div className="exercise-edit-sheet">
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
                        placeholder="Weight (kg or BW)"
                        value={editForm.weight}
                        onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                      />
                    </div>
                    <div className="edit-form-actions">
                      <Button size="small" variant="primary" onClick={saveEdit}>Save</Button>
                      <Button size="small" variant="secondary" onClick={() => setEditingExercise(null)}>Cancel</Button>
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
          <div className="modal-container delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" aria-describedby="delete-desc">
            <h2 id="delete-title" className="modal-title">Delete Exercise?</h2>
            <p id="delete-desc" className="modal-description">
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
          <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="add-title">
            <h2 id="add-title" className="modal-title">Add Exercise</h2>
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
                placeholder="Weight (kg or BW)"
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
                // Milestone: Bench Press 100kg+
                maybeTriggerBenchMilestone(newExercise)
              }}>Add</Button>
            </div>
          </div>
        </div>
      )}

        <section className="workout-actions">
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
                  <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="finish-title" aria-describedby="finish-desc">
                    <h2 id="finish-title" className="modal-title">Finish workout?</h2>
                    <p id="finish-desc" className="modal-description">We'll log this session to your workouts.</p>
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
                  <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="success-title" aria-describedby="success-desc">
                    <h2 id="success-title" className="modal-title">Workout logged 🎉</h2>
                    <p id="success-desc" className="modal-description">Nice work! Keep the momentum going.</p>
                    <div className="modal-actions">
                      <Button size="large" variant="primary" onClick={() => { setFinishSuccessActive(false); navigate('/workouts') }}>Go to Workouts</Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bench 100kg Milestone Modal */}
              {benchMilestoneActive && (
                <div className="modal-overlay">
                  <div className="modal-container" role="dialog" aria-modal="true" aria-labelledby="bench-title" aria-describedby="bench-desc">
                    <h2 id="bench-title" className="modal-title">100kg Club 🏆</h2>
                    <p id="bench-desc" className="modal-description">Massive milestone on Bench Press. Welcome to the 100kg club!</p>
                    <div className="modal-actions">
                      <Button size="large" variant="primary" onClick={() => setBenchMilestoneActive(false)}>Awesome!</Button>
                    </div>
                  </div>
                </div>
              )}
        </section>
      </main>

      {breakActive && (
        <div className="break-modal-overlay">
          <div className="break-modal-container" role="dialog" aria-modal="true" aria-labelledby="break-label" aria-describedby="break-time-desc">
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
                <p className="break-time" id="break-time-desc" aria-live="polite">{formatTime(breakTimeLeft)}</p>
                <p className="break-label" id="break-label">Rest</p>
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

      <button
        type="button"
        className="break-fab"
        onClick={startBreak}
        aria-label="Start break timer"
        title="Start break"
      >
        <Clock size={22} />
      </button>

      <BottomNav />
    </div>
  )
}

export default WorkoutDetailsPage
