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
      
      <div style={{ 
        backgroundColor: '#F0FDF4', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        marginBottom: '1.5rem', 
        border: '1px solid #E5E7EB' 
      }}>
        <h2 style={{ textAlign: 'center', margin: '0 0 1rem 0' }}>🎉 Welcome to Your Journey</h2>
        <p style={{ textAlign: 'center', color: '#6B7280', margin: 0 }}>
          Hello <strong style={{ color: '#16A34A' }}>{user?.email}</strong>, 
          ready to track your holistic self-improvement?
        </p>
      </div>

      <div style={{ 
        backgroundColor: '#F0FDF4', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        marginBottom: '1.5rem', 
        border: '1px solid #E5E7EB' 
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '1rem' }}>Next Steps</h3>
        <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
          <li style={{ marginBottom: '0.5rem' }}>🏋️ Build your exercise library</li>
          <li style={{ marginBottom: '0.5rem' }}>📊 Track your workouts with rest timers</li>
          <li style={{ marginBottom: '0.5rem' }}>😴 Log your sleep quality</li>
          <li style={{ marginBottom: '0.5rem' }}>📈 See correlations and insights</li>
        </ul>
      </div>

      <div style={{ 
        backgroundColor: '#F0FDF4', 
        padding: '1.5rem', 
        borderRadius: '0.75rem', 
        border: '1px solid #E5E7EB' 
      }}>
        <p style={{ textAlign: 'center', color: '#6B7280', margin: 0 }}>
          <strong style={{ color: '#16A34A' }}>✅ Authentication Complete</strong><br/>
          Phase 1 of your Ascent journey is ready!
        </p>
      </div>
    </main>
  )
}

export default HomePage