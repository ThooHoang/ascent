import { useState, useMemo, useEffect } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const formatLocalDate = (d) => {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function MiniCalendar({ onSelectDate, onClose, value }) {
  const initialDate = value ? new Date(value) : new Date()
  const [date, setDate] = useState(initialDate)
  const [selectedDate, setSelectedDate] = useState(formatLocalDate(initialDate))

  useEffect(() => {
    if (!value) return
    const d = new Date(value)
    setDate(d)
    setSelectedDate(formatLocalDate(d))
  }, [value])

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

  const isToday = (d) => formatLocalDate(d) === formatLocalDate(new Date())

  const isCurrentMonth = (d) => d.getMonth() === date.getMonth()

  const isSelected = (d) => formatLocalDate(d) === selectedDate

  const handleSelectDay = (d) => {
    setSelectedDate(formatLocalDate(d))
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

