import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from './useAuth'

const defaultRoutine = [
  { dayKey: 'mon', label: 'Monday', type: 'rest' },
  { dayKey: 'tue', label: 'Tuesday', type: 'upper-body' },
  { dayKey: 'wed', label: 'Wednesday', type: 'rest' },
  { dayKey: 'thu', label: 'Thursday', type: 'lower-body' },
  { dayKey: 'fri', label: 'Friday', type: 'upper-body' },
  { dayKey: 'sat', label: 'Saturday', type: 'lower-body' },
  { dayKey: 'sun', label: 'Sunday', type: 'rest' },
]

const typeMeta = {
  'upper-body': { name: 'Upper Body', emoji: '💪', type: 'upper-body' },
  'lower-body': { name: 'Lower Body', emoji: '🦵', type: 'lower-body' },
  rest: { name: 'Rest Day', emoji: '😴', type: null },
}

const dayIndex = {
  mon: 0,
  tue: 1,
  wed: 2,
  thu: 3,
  fri: 4,
  sat: 5,
  sun: 6,
}

const mondayFirstIndex = (date) => {
  const jsDay = new Date(date).getDay() // 0 = Sun
  return (jsDay + 6) % 7 // 0 = Mon, 6 = Sun
}

export function useRoutine() {
  const { user } = useAuth()
  const storageKey = useMemo(() => `routine-${user?.id || 'guest'}`, [user?.id])
  const [routine, setRoutine] = useState(defaultRoutine)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length === defaultRoutine.length) {
          setRoutine(parsed)
        }
      } else {
        setRoutine(defaultRoutine)
      }
    } catch {
      setRoutine(defaultRoutine)
    }
  }, [storageKey])

  const persist = useCallback((nextRoutine) => {
    setRoutine(nextRoutine)
    try {
      localStorage.setItem(storageKey, JSON.stringify(nextRoutine))
    } catch {}
  }, [storageKey])

  const updateDayType = useCallback((dayKey, type) => {
    persist(routine.map(day => day.dayKey === dayKey ? { ...day, type } : day))
  }, [persist, routine])

  const resetToDefault = useCallback(() => {
    persist([...defaultRoutine])
  }, [persist])

  const trainingForDate = useCallback((dateValue) => {
    const idx = mondayFirstIndex(dateValue)
    const day = routine[idx] || defaultRoutine[idx]
    const meta = typeMeta[day?.type || 'rest'] || typeMeta.rest
    return {
      ...meta,
      dayKey: day?.dayKey,
      day: day?.label,
    }
  }, [routine])

  const planForDayKey = useCallback((dayKey) => {
    const day = routine.find(d => d.dayKey === dayKey)
    const meta = typeMeta[day?.type || 'rest'] || typeMeta.rest
    return { ...meta, dayKey: day?.dayKey, day: day?.label }
  }, [routine])

  const sortedRoutine = useMemo(() => {
    return [...routine].sort((a, b) => dayIndex[a.dayKey] - dayIndex[b.dayKey])
  }, [routine])

  return {
    routine: sortedRoutine,
    trainingForDate,
    planForDayKey,
    updateDayType,
    resetToDefault,
    typeMeta,
  }
}
