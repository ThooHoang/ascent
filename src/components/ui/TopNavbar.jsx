import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

export function TopNavbar() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  return (
    <nav className="top-navbar" aria-label="Main navigation">
      <div className="navbar-content">
        <div className="navbar-brand">
          <h1 className="navbar-title">Ascent</h1>
        </div>
        
        <div className="navbar-links">
          <button 
            onClick={() => navigate('/dashboard')}
            className="navbar-link"
            type="button"
          >
            Dashboard
          </button>
          <button 
            onClick={() => navigate('/workouts')}
            className="navbar-link"
            type="button"
          >
            Workouts
          </button>
          <button 
            onClick={() => navigate('/habits')}
            className="navbar-link"
            type="button"
          >
            Habits
          </button>
          <button 
            onClick={() => navigate('/profile')}
            className="navbar-link profile-link"
            type="button"
            title={profile?.name || 'Profile'}
          >
            <span className="profile-avatar">{(profile?.name || 'U')[0].toUpperCase()}</span>
            <span className="profile-name">{profile?.name || 'Profile'}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}
