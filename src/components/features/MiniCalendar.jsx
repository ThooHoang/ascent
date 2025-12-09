import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function MiniCalendar({ onSelectDate, onClose }) {
  const [date, setDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  const days = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']
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

  const isSelected = (d) => {
    const dateStr = d.toISOString().split('T')[0]
    return dateStr === selectedDate
  }

  const handleSelectDay = (d) => {
    setSelectedDate(d.toISOString().split('T')[0])
  }

  const handleConfirm = () => {
    onSelectDate(selectedDate)
    onClose()
  }

  return (
    <div className="calendar-picker">
      <div className="calendar-container">
        <div className="calendar-header">
          <h3 className="calendar-month">
            {months[date.getMonth()]} {date.getFullYear()}
          </h3>
          <div className="calendar-nav">
            <button
              type="button"
              onClick={previousMonth}
              className="calendar-nav-btn"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="calendar-nav-btn"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
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
            <button
              key={i}
              type="button"
              onClick={() => handleSelectDay(d)}
              className={`calendar-day ${
                isToday(d) ? 'today' : ''
              } ${
                isCurrentMonth(d) ? 'current-month' : 'other-month'
              } ${
                isSelected(d) ? 'selected' : ''
              }`}
              aria-label={`Select ${d.toLocaleDateString()}`}
            >
              {d.getDate()}
            </button>
          ))}
        </div>

        <button 
          type="button" 
          onClick={handleConfirm}
          className="calendar-confirm"
        >
          Confirm
        </button>
      </div>
    </div>
  )
}

