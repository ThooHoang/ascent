import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function MiniCalendar() {
  const [date, setDate] = useState(new Date())

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1)
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const startDate = new Date(firstDay)
  startDate.setDate(startDate.getDate() - firstDay.getDay())

  const calendarDays = useMemo(() => {
    const days = []
    let currentDate = new Date(startDate)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return days
  }, [startDate])

  const previousMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() - 1))
  }

  const nextMonth = () => {
    setDate(new Date(date.getFullYear(), date.getMonth() + 1))
  }

  const isToday = (d) => {
    const today = new Date()
    return d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
  }

  const isCurrentMonth = (d) => d.getMonth() === date.getMonth()

  return (
    <div className="mini-calendar">
      <div className="calendar-header">
        <h3 className="calendar-month">
          {months[date.getMonth()]} {date.getFullYear()}
        </h3>
        <div className="calendar-nav">
          <button
            type="button"
            onClick={previousMonth}
            className="calendar-btn"
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="calendar-btn"
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="calendar-weekdays">
        {days.map(day => (
          <div key={day} className="calendar-weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="calendar-days">
        {calendarDays.map((d, i) => (
          <div
            key={i}
            className={`calendar-day ${
              isToday(d) ? 'today' : ''
            } ${
              isCurrentMonth(d) ? 'current-month' : 'other-month'
            }`}
          >
            {d.getDate()}
          </div>
        ))}
      </div>
    </div>
  )
}
