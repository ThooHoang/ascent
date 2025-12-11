import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useSelectedDate } from '../../contexts/DateContext'

const DEFAULT_HABITS = [
  { id: 'water', name: '💧 Drink water', target: 8 },
  { id: 'exercise', name: '🏃 Exercise', target: 30 },
  { id: 'reading', name: '📖 Reading', target: 20 },
  { id: 'meditation', name: '🧘 Meditation', target: 10 },
]

export function SmartHabits() {
  const { user } = useAuth()
  const [habits, setHabits] = useState(DEFAULT_HABITS)
  const [completions, setCompletions] = useState({})
  const [streaks, setStreaks] = useState({})
  const [loading, setLoading] = useState(true)
  const [showAddHabit, setShowAddHabit] = useState(false)
  const [newHabitName, setNewHabitName] = useState('')
  const [newHabitTarget, setNewHabitTarget] = useState(10)

  const { selectedDate } = useSelectedDate()

  useEffect(() => {
    if (!user?.id) {
      setLoading(false)
      const guestKey = 'habit-completions-guest'
      const stored = localStorage.getItem(guestKey)
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          const completed = {}
          parsed.forEach(item => {
            if (item.date === selectedDate) {
              completed[item.habit_id] = item.completed
            }
          })
          setCompletions(completed)
        } catch {
          setCompletions({})
        }
      } else {
        setCompletions({})
      }
    }
  }, [user?.id, selectedDate])

  const storageKey = user?.id ? `custom-habits-${user.id}` : 'custom-habits-guest'

  useEffect(() => {
    if (user?.id) {
      loadHabits()
      fetchCompletionsForDate(selectedDate)
      fetchStreaks()
    }
  }, [user?.id])

  useEffect(() => {
    if (!user?.id) return
    fetchCompletionsForDate(selectedDate)
  }, [user?.id, selectedDate])

  const loadHabits = () => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setHabits([...DEFAULT_HABITS, ...parsed])
      } catch (err) {
        setHabits(DEFAULT_HABITS)
      }
    } else {
      setHabits(DEFAULT_HABITS)
    }
  }

  const persistHabits = (updated) => {
    const custom = updated.filter(habit => !DEFAULT_HABITS.find(d => d.id === habit.id))
    localStorage.setItem(storageKey, JSON.stringify(custom))
  }

  const fetchCompletionsForDate = async (dateStr) => {
    try {
      const { data } = await supabase
        .from('habit_completions')
        .select('habit_id, completed')
        .eq('date', dateStr)

      if (data) {
        const completed = {}
        data.forEach(item => {
          completed[item.habit_id] = item.completed
        })
        setCompletions(completed)
      }
    } catch (err) {
      // ignore error
    } finally {
      setLoading(false)
    }
  }

  const fetchStreaks = async () => {
    try {
      const { data } = await supabase
        .from('habit_streaks')
        .select('habit_id, current_streak, best_streak, last_completed_date')

      if (data) {
        const streakMap = {}
        data.forEach(item => {
          streakMap[item.habit_id] = item
        })
        setStreaks(streakMap)
      }
    } catch (err) {
      // ignore error
    }
  }

  const toggleHabit = async (habitId) => {
    const isCompleted = completions[habitId]
    const newState = !isCompleted

    try {
      if (newState) {
        const { error } = await supabase
          .from('habit_completions')
          .upsert(
            {
              user_id: user.id,
              habit_id: habitId,
              date: selectedDate,
              completed: true,
              completed_at: new Date().toISOString(),
            },
            { onConflict: 'user_id,habit_id,date' }
          )

        if (!error) {
          setCompletions(prev => ({ ...prev, [habitId]: true }))
          await updateStreak(habitId, true)
        }
      } else {
        const { error } = await supabase
          .from('habit_completions')
          .update({ completed: false })
          .eq('habit_id', habitId)
          .eq('date', selectedDate)

        if (!error) {
          setCompletions(prev => ({ ...prev, [habitId]: false }))
          await reduceStreakOnUndo(habitId, selectedDate)
        }
      }
    } catch (err) {
      // ignore error
    }
  }

  const updateStreak = async (habitId, isCompleting) => {
    try {
      const targetDate = new Date(selectedDate)
      
      let { data: streakData } = await supabase
        .from('habit_streaks')
        .select('*')
        .eq('habit_id', habitId)
        .single()

      const currentStreak = streakData?.current_streak || 0
      const bestStreak = streakData?.best_streak || 0
      const lastCompleted = streakData?.last_completed_date ? new Date(streakData.last_completed_date) : null

      let newStreak = currentStreak
      const daysDiff = lastCompleted ? Math.floor((targetDate - lastCompleted) / (1000 * 60 * 60 * 24)) : 0

      if (isCompleting) {
        if (daysDiff === 1 || !lastCompleted) {
          newStreak = currentStreak + 1
        } else if (daysDiff > 1) {
          newStreak = 1
        }
      }

      const newBestStreak = Math.max(newStreak, bestStreak)

      const { error } = await supabase
        .from('habit_streaks')
        .upsert(
          {
            user_id: user.id,
            habit_id: habitId,
            current_streak: newStreak,
            best_streak: newBestStreak,
            last_completed_date: targetDate.toISOString(),
          },
          { onConflict: 'habit_id' }
        )

      if (!error) {
        setStreaks(prev => ({
          ...prev,
          [habitId]: {
            habit_id: habitId,
            current_streak: newStreak,
            best_streak: newBestStreak,
            last_completed_date: today.toISOString(),
          }
        }))
      }
    } catch (err) {
      // ignore error
    }
  }

  const reduceStreakOnUndo = async (habitId, dateString) => {
    try {
      const { data, error } = await supabase
        .from('habit_streaks')
        .select('*')
        .eq('user_id', user.id)
        .eq('habit_id', habitId)
        .single()

      if (error && error.code !== 'PGRST116') {
        // ignore error
        return
      }

      if (!data) return

      const lastDate = data.last_completed_date ? data.last_completed_date.split('T')[0] : null
      const newCurrent = lastDate === dateString ? Math.max(0, (data.current_streak || 1) - 1) : data.current_streak || 0
      const updated = {
        current_streak: newCurrent,
        best_streak: data.best_streak || 0,
        last_completed_date: lastDate === dateString ? null : data.last_completed_date,
      }

      const { error: updateError } = await supabase
        .from('habit_streaks')
        .update(updated)
        .eq('user_id', user.id)
        .eq('habit_id', habitId)

      if (!updateError) {
        setStreaks(prev => ({
          ...prev,
          [habitId]: {
            habit_id: habitId,
            ...updated,
          },
        }))
      }
    } catch (err) {
      // ignore error
    }
  }

  const addHabit = () => {
    if (!newHabitName.trim()) return
    const id = `custom-${Date.now()}`
    const habit = {
      id,
      name: newHabitName.trim(),
      target: Math.max(5, Number(newHabitTarget) || 10),
    }

    const updated = [...habits, habit]
    setHabits(updated)
    persistHabits(updated)
    setNewHabitName('')
    setNewHabitTarget(10)
    setShowAddHabit(false)
  }

  const hasHabits = habits && habits.length > 0

  const completedCount = Object.values(completions).filter(Boolean).length
  const completionPercentage = habits.length ? Math.round((completedCount / habits.length) * 100) : 0


  if (loading) {
    return <div className="habits-loading">Loading habits...</div>
  }

  return (
    <article className="habits-card">
      <div className="habits-header">
        <div>
          <p className="card-label">Daily Habits</p>
          <p className="card-value">{completedCount}/{habits.length}</p>
        </div>
        <div className="habits-badge">{completionPercentage}%</div>
      </div>

      <div className="card-bar">
        <span style={{ width: `${completionPercentage}%` }} />
      </div>

      <div className="habits-list">
        {hasHabits ? habits.map(habit => {
          const isCompleted = completions[habit.id]
          const streak = streaks[habit.id]
          
          return (
            <div key={habit.id} className="habit-item">
              <button
                className={`habit-checkbox ${isCompleted ? 'completed' : ''}`}
                onClick={() => toggleHabit(habit.id)}
                type="button"
                aria-label={`Toggle ${habit.name}`}
              >
                {isCompleted && '✓'}
              </button>
              
              <div className="habit-info">
                <p className="habit-name">{habit.name}</p>
                <p className="habit-target">{habit.target} min</p>
              </div>

              {streak && (
                <div className="habit-streak">
                  <span className="streak-icon">🔥</span>
                  <span className="streak-count">{streak.current_streak}</span>
                </div>
              )}
            </div>
          )
        }) : (
          <p className="habits-empty">Add your first habit to start a streak.</p>
        )}
      </div>

      <div className="habit-add">
        {showAddHabit ? (
          <div className="habit-add-form">
            <input
              type="text"
              className="input-field"
              placeholder="Habit name (e.g. Stretch)"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
            />
            <input
              type="number"
              className="input-field"
              min="5"
              max="240"
              value={newHabitTarget}
              onChange={(e) => setNewHabitTarget(e.target.value)}
              placeholder="Minutes"
            />
            <div className="habit-add-actions">
              <button className="btn" type="button" onClick={() => setShowAddHabit(false)}>Cancel</button>
              <button className="btn btn-primary" type="button" onClick={addHabit}>Save</button>
            </div>
          </div>
        ) : (
          <button className="btn btn-primary w-full" type="button" onClick={() => setShowAddHabit(true)}>
            + Add habit
          </button>
        )}
      </div>

      <p className="habits-tip">✨ Complete all habits to build momentum</p>
    </article>
  )
}
