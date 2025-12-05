import { useAuth } from '../hooks/useAuth'

function HomePage() {
  const { user, signOut } = useAuth()

  return (
    <main className="home-page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ margin: 0 }}>Ascent</h1>
        <button onClick={signOut} className="btn btn-danger">
          Sign Out
        </button>
      </div>
      
      <div className="status-card">
        <h2 className="text-center">🎉 Welcome to Your Journey</h2>
        <p className="text-center text-secondary">
          Hello <strong className="text-primary">{user?.email}</strong>, 
          ready to track your holistic self-improvement?
        </p>
      </div>

      <div className="status-card">
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Next Steps</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>🏋️ Build your exercise library</li>
          <li style={{ marginBottom: '0.5rem' }}>📊 Track your workouts with rest timers</li>
          <li style={{ marginBottom: '0.5rem' }}>😴 Log your sleep quality</li>
          <li style={{ marginBottom: '0.5rem' }}>📈 See correlations and insights</li>
        </ul>
      </div>

      <div className="status-card">
        <p className="text-center text-secondary" style={{ margin: 0 }}>
          <strong className="text-success">✅ Authentication Complete</strong><br/>
          Phase 1 of your Ascent journey is ready!
        </p>
      </div>
    </main>
  )
}

export default HomePage