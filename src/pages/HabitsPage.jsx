import { SmartHabits } from '../components/features/SmartHabits'
import { BottomNav } from '../components/ui/BottomNav'
import { useSelectedDate } from '../contexts/DateContext'

function HabitsPage() {
  const { selectedDate } = useSelectedDate()

  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="habits-header">
          <div>
            <p className="section-eyebrow">Habits</p>
            <h1 className="hero-title">Daily Habits</h1>
          </div>
        </section>
        <SmartHabits />
      </main>

      <BottomNav />
    </div>
  )
}

export default HabitsPage
