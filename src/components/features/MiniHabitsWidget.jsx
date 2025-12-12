import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function MiniHabitsWidget({ selectedDate: selectedDateProp }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState({})

  const today = new Date().toISOString().split('T')[0]
  const selectedDate = selectedDateProp || today

  useEffect(() => {
    const DEFAULT_HABITS = [
      { id: 'water', name: '💧 Water', emoji: '💧' },
      { id: 'exercise', name: '🏃 Exercise', emoji: '🏃' },
      { id: 'reading', name: '📖 Reading', emoji: '📖' },
      { id: 'meditation', name: '🧘 Meditation', emoji: '🧘' },
    ]

    const storageKey = user?.id ? `custom-habits-${user.id}` : 'custom-habits-guest'
    const customHabits = localStorage.getItem(storageKey)
    let allHabits = DEFAULT_HABITS
    if (customHabits) {
      try {
        const parsed = JSON.parse(customHabits)
        allHabits = [...DEFAULT_HABITS, ...parsed.slice(0, 2)] // Show max 6
      } catch {
        // ignore
      }
    }
    setHabits(allHabits.slice(0, 6))
  }, [user?.id])

  useEffect(() => {
    const fetchCompletions = async () => {
      if (!user?.id) {
        // Guest fallback: read from localStorage by date
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
        return
      }

      try {
        const { data } = await supabase
          .from('habit_completions')
          .select('habit_id, completed')
          .eq('date', selectedDate)

        if (data) {
          const completed = {}
          data.forEach(item => {
            completed[item.habit_id] = item.completed
          })
          setCompletions(completed)
        }
      } catch {
        setCompletions({})
      }
    }

    fetchCompletions()
  }, [user?.id, selectedDate])

  const toggleHabit = async (habitId) => {
    const newState = !completions[habitId]

    if (!user?.id) {
      // Guest fallback: store in localStorage keyed by date
      const guestKey = 'habit-completions-guest'
      const stored = localStorage.getItem(guestKey)
      let parsed = []
      try {
        parsed = stored ? JSON.parse(stored) : []
      } catch {
        parsed = []
      }
      const filtered = parsed.filter(item => !(item.habit_id === habitId && item.date === selectedDate))
      filtered.push({ habit_id: habitId, date: selectedDate, completed: newState })
      localStorage.setItem(guestKey, JSON.stringify(filtered))
      setCompletions(prev => ({ ...prev, [habitId]: newState }))
      return
    }

    try {
      // Update state immediately (optimistic update)
      setCompletions(prev => ({ ...prev, [habitId]: newState }))

      const { error } = await supabase
        .from('habit_completions')
        .upsert({
          user_id: user.id,
          habit_id: habitId,
          date: selectedDate,
          completed: newState,
          completed_at: newState ? new Date().toISOString() : null,
        }, { onConflict: 'user_id,habit_id,date' })

      if (error) {
        // Revert state on error
        setCompletions(prev => ({ ...prev, [habitId]: !newState }))
      }
    } catch (err) {
      // Revert state on error
      setCompletions(prev => ({ ...prev, [habitId]: !newState }))
    }
  }

  const completedCount = Object.values(completions).filter(Boolean).length

  return (
    <div className="mini-habits-widget">
      <div className="widget-header">
        <h3 className="widget-title">Today's habits</h3>
        <p className="widget-count">{completedCount}/{habits.length}</p>
      </div>

      <div className="mini-habits-grid">
        {habits.map(habit => (
          <button
            key={habit.id}
            className={`mini-habit-btn ${completions[habit.id] ? 'completed' : ''}`}
            onClick={() => toggleHabit(habit.id)}
            type="button"
            title={habit.name}
          >
            {habit.emoji || '✓'}
          </button>
        ))}
      </div>

      <div className="widget-progress">
        <div className="progress-bar-small">
          <div
            className="progress-fill-small"
            style={{ width: `${habits.length ? (completedCount / habits.length) * 100 : 0}%` }}
          />
        </div>
      </div>

      <button
        className="text-link"
        type="button"
        onClick={() => navigate('/habits')}
      >
        View all habits →
      </button>
    </div>
  )
}
