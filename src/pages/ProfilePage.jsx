import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { BottomNav } from '../components/ui/BottomNav'

function ProfilePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut, updateProfile } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Sync name when profile updates
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
    }
  }, [profile?.name])

  const handleSave = async () => {
    if (!name.trim()) {
      setErrorMsg('Name cannot be empty')
      return
    }
    setSaving(true)
    setErrorMsg('')
    const { error } = await updateProfile({ name: name.trim() })
    if (!error) {
      setIsEditing(false)
      setErrorMsg('')
    } else {
      setErrorMsg(error?.message || 'Failed to save name. Please try again.')
    }
    setSaving(false)
  }

  const handleCancel = () => {
    setName(profile?.name || '')
    setIsEditing(false)
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
                autoFocus
              />
              {errorMsg && <p className="error-message">{errorMsg}</p>}
              <div className="profile-edit-actions">
                <Button onClick={handleCancel}>Cancel</Button>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="profile-name-title">{profile?.name || 'User'}</h1>
              <p className="profile-email">{user?.email}</p>
              <Button size="default" onClick={() => setIsEditing(true)}>
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

      <BottomNav />
    </div>
  )
}

export default ProfilePage
