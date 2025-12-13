import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useSelectedDate } from '../../contexts/DateContext'
import { Button } from '../ui/Button'

export function TodayTraining() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedDate } = useSelectedDate()
  const [todayTraining, setTodayTraining] = useState(null)
  const [workoutLogged, setWorkoutLogged] = useState(false)
  const [logging, setLogging] = useState(false)

  useEffect(() => {
    const today = new Date(selectedDate).getDay()
    const trainingMap = {
      0: { name: 'Rest Day', emoji: '😴', type: null },     // Sunday
      1: { name: 'Rest Day', emoji: '😴', type: null },     // Monday
      2: { name: 'Upper Body', emoji: '💪', type: 'upper-body' }, // Tuesday
      3: { name: 'Rest Day', emoji: '😴', type: null },     // Wednesday
      4: { name: 'Lower Body', emoji: '🦵', type: 'lower-body' }, // Thursday
      5: { name: 'Upper Body', emoji: '💪', type: 'upper-body' }, // Friday
      6: { name: 'Lower Body', emoji: '🦵', type: 'lower-body' }, // Saturday
    }
    setTodayTraining(trainingMap[today])
    checkIfLogged()
  }, [user?.id, selectedDate])

  const checkIfLogged = async () => {
    if (!user?.id) return
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data } = await supabase
        .from('workout_logs')
        .select('id')
        .eq('user_id', user.id)
        .eq('date', today)
        .limit(1)
      setWorkoutLogged(data && data.length > 0)
    } catch (err) {
      console.error('Error checking workout:', err)
    }
  }

  const startWorkout = () => {
    if (todayTraining?.type) {
      navigate(`/workout/${todayTraining.type}`)
    }
  }

  const logWorkoutQuick = async () => {
    if (!user?.id || !todayTraining) return
    try {
      setLogging(true)
      const today = new Date().toISOString().split('T')[0]
      
      const { error } = await supabase
        .from('workout_logs')
        .insert([
          {
            user_id: user.id,
            date: today,
            type: todayTraining.name,
            completed: true,
          },
        ])
      
      if (!error) {
        setWorkoutLogged(true)
      }
    } catch (err) {
      console.error('Error logging workout:', err)
    } finally {
      setLogging(false)
    }
  }

  return (
    <div className="training-card">
      <p className="card-label">Today's training</p>
      {todayTraining && (
        <>
          <div className="training-display">
            <p className="training-emoji">{todayTraining.emoji}</p>
            <p className="section-title">{todayTraining.name}</p>
          </div>
          
          {todayTraining.name !== 'Rest Day' ? (
            <div className="training-action">
              {workoutLogged ? (
                <Button 
                  size="small" 
                  variant="secondary"
                  onClick={startWorkout}
                  className="w-full"
                >
                  View workout
                </Button>
              ) : (
                <Button 
                  size="small" 
                  variant="primary"
                  onClick={startWorkout}
                  className="w-full"
                >
                  Start workout
                </Button>
              )}
            </div>
          ) : (
            <p className="text-secondary">Recover and prepare for tomorrow</p>
          )}
        </>
      )}
    </div>
  )
}

