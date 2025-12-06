import { useNavigate, useLocation } from 'react-router-dom'
import { Home, Dumbbell, ListTodo, User as UserIcon } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { useState } from 'react'

function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut, updateProfile } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    const { error } = await updateProfile({ name })
    if (!error) {
      setIsEditing(false)
    }
    setSaving(false)
  }

  const handleSignOut = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      const { error } = await signOut()
      if (!error) {
        navigate('/')
      } else {
        alert('Error signing out: ' + error.message)
      }
    }
  }

  return (
    <div className="profile-page">
      <main className="profile-main">
        <section className="profile-header">
          <div className="profile-avatar-large">
            {(profile?.name || 'U')[0].toUpperCase()}
          </div>
          
          {isEditing ? (
            <div className="profile-edit-section">
              <Input
                id="name-input"
                label="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <div className="profile-edit-actions">
                <Button onClick={() => setIsEditing(false)}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="profile-name-title">{profile?.name || 'User'}</h1>
              <p className="profile-email">{user?.email}</p>
              <Button size="default" onClick={() => { setName(profile?.name || ''); setIsEditing(true); }}>
                Edit name
              </Button>
            </>
          )}
        </section>

        <section className="profile-section">
          <h2 className="section-title">Account Settings</h2>
          
          <div className="setting-item">
            <div className="setting-label">
              <p className="setting-name">Email</p>
              <p className="setting-value">{user?.email}</p>
            </div>
          </div>

          <div className="setting-item">
            <div className="setting-label">
              <p className="setting-name">Joined</p>
              <p className="setting-value">
                {new Date(user?.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </section>

        <section className="profile-section">
          <h2 className="section-title">About Ascent</h2>
          <p className="about-text">
            Ascent helps you stay consistent, avoid burnout, and climb steadily towards your goals. Track your habits, log your sleep, and watch your streaks grow.
          </p>
          <div className="about-features">
            <div className="feature-item">
              <span className="feature-emoji">📊</span>
              <p className="feature-text">Track daily habits with streak counter</p>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">😴</span>
              <p className="feature-text">Monitor your sleep patterns</p>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">🎯</span>
              <p className="feature-text">Build consistency with daily goals</p>
            </div>
            <div className="feature-item">
              <span className="feature-emoji">🔥</span>
              <p className="feature-text">Maintain streaks to stay motivated</p>
            </div>
          </div>
        </section>

        <section className="profile-actions">
          <Button 
            onClick={handleSignOut}
            variant="danger"
            size="large"
            className="w-full"
          >
            Sign Out
          </Button>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Primary navigation">
        <button
          className={`nav-item ${location.pathname === '/dashboard' ? 'active' : ''}`}
          onClick={() => navigate('/dashboard')}
          type="button"
          aria-label="Dashboard"
        >
          <Home size={22} />
        </button>
        <button
          className={`nav-item ${location.pathname === '/workouts' ? 'active' : ''}`}
          onClick={() => navigate('/workouts')}
          type="button"
          aria-label="Workouts"
        >
          <Dumbbell size={22} />
        </button>
        <button
          className={`nav-item ${location.pathname === '/habits' ? 'active' : ''}`}
          onClick={() => navigate('/habits')}
          type="button"
          aria-label="Habits"
        >
          <ListTodo size={22} />
        </button>
        <button
          className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}
          onClick={() => navigate('/profile')}
          type="button"
          aria-label="Profile"
        >
          <UserIcon size={22} />
        </button>
      </nav>
    </div>
  )
}

export default ProfilePage
