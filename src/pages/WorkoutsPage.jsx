import { Button } from '../components/ui/Button'
import { BottomNav } from '../components/ui/BottomNav'

function WorkoutsPage() {
  return (
    <div className="dashboard-page">
      <main className="dashboard-main">
        <section className="hero">
          <div>
            <p className="hero-eyebrow">Workouts</p>
            <h1 className="hero-title">Train with intent</h1>
            <p className="hero-subtitle">Session planning and logging coming soon.</p>
          </div>
        </section>

        <section className="next-session">
          <div>
            <p className="section-title">Next session</p>
            <h3 className="session-title">Build your plan</h3>
            <p className="session-note">Save your exercises and reps so you can focus on execution.</p>
          </div>
          <Button size="large" className="w-full" onClick={() => navigate('/dashboard')}>Back to dashboard</Button>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}

export default WorkoutsPage
