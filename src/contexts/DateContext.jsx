import { createContext, useContext, useMemo, useState, useCallback, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'

const DateContext = createContext(null)

const formatLocalDate = (date = new Date()) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function DateProvider({ children }) {
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState(formatLocalDate())

  const setDate = useCallback((date) => {
    if (typeof date === 'string') {
      setSelectedDate(date)
    } else if (date instanceof Date) {
      setSelectedDate(formatLocalDate(date))
    }
  }, [])

  const changeDateByDays = useCallback((delta) => {
    const d = new Date(selectedDate)
    d.setDate(d.getDate() + delta)
    setSelectedDate(formatLocalDate(d))
  }, [selectedDate])

  const value = useMemo(() => ({
    selectedDate,
    setSelectedDate: setDate,
    changeDateByDays,
    formatLocalDate,
  }), [selectedDate, setDate, changeDateByDays])

  // Always reset to today on mount or when auth user changes (sign in/out)
  useEffect(() => {
    setDate(formatLocalDate())
  }, [user?.id, setDate])

  return (
    <DateContext.Provider value={value}>
      {children}
    </DateContext.Provider>
  )
}

export function useSelectedDate() {
  const ctx = useContext(DateContext)
  if (!ctx) throw new Error('useSelectedDate must be used within DateProvider')
  return ctx
}
