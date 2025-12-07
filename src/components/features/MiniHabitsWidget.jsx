import { useEffect, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export function MiniHabitsWidget() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [habits, setHabits] = useState([])
  const [completions, setCompletions] = useState({})

  useEffect(() => {
    if (!user?.id) return

    // Load default habits
    const DEFAULT_HABITS = [
      { id: 'water', name: '💧 Water', emoji: '💧' },
      { id: 'exercise', name: '🏃 Exercise', emoji: '🏃' },
      { id: 'reading', name: '📖 Reading', emoji: '📖' },
      { id: 'meditation', name: '🧘 Meditation', emoji: '🧘' },
    ]

    // Load custom habits
    const storageKey = `custom-habits-${user.id}`
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

    // Load today's completions
    const today = new Date().toISOString().split('T')[0]
    const completionsKey = `habit-completions-${user.id}`
    const stored = localStorage.getItem(completionsKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        const completed = {}
        parsed.forEach(item => {
          if (item.date === today) {
            completed[item.habit_id] = item.completed
          }
        })
        setCompletions(completed)
      } catch {
        // ignore
      }
    }
  }, [user?.id])

  const toggleHabit = (habitId) => {
    setCompletions(prev => ({
      ...prev,
      [habitId]: !prev[habitId]
    }))
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
