import { SmartHabits } from '../components/features/SmartHabits'
import { BottomNav } from '../components/ui/BottomNav'
import { useSelectedDate } from '../contexts/DateContext'

function HabitsPage() {
  const { selectedDate } = useSelectedDate()

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <p className="greeting-date" style={{ marginBottom: '12px' }}>
          {new Date(selectedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
        <SmartHabits />
      </main>

      <BottomNav />
    </div>
  )
}

export default HabitsPage
