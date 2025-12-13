import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Pencil } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { BottomNav } from '../components/ui/BottomNav'
import { supabase } from '../lib/supabase'

function ProfilePage() {
  const navigate = useNavigate()
  const { user, profile, signOut, updateProfile } = useAuth()
  
  const [isEditing, setIsEditing] = useState(false)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [activityStats, setActivityStats] = useState({
    workouts: 0,
    habitsDone: 0,
    avgSleep: '—',
  })

  const formatDate = (value) => {
    if (!value) return '—'
    return new Date(value).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const emailVerified = Boolean(user?.email_confirmed_at)
  const joinedDate = formatDate(user?.created_at)
  const lastActiveDate = formatDate(user?.last_sign_in_at)

  const daysOnAscent = (() => {
    if (!user?.created_at) return '—'
    const started = new Date(user.created_at).getTime()
    const days = Math.max(1, Math.round((Date.now() - started) / (1000 * 60 * 60 * 24)))
    return `${days}d`
  })()

  const quickLinks = [
    { label: 'Personal', detail: 'Name, email', action: () => setIsEditing(true) },
    { label: 'Account', detail: 'ID, security', action: () => window.alert('Account settings coming soon') },
    { label: 'Notifications', detail: 'Reminders, pushes', action: () => window.alert('Notification preferences coming soon') },
    { label: 'Help', detail: 'FAQs, support', action: () => window.open('mailto:support@ascent.app', '_blank') },
  ]

  const loadActivityStats = async () => {
    let workouts = 0
    let habitsDone = 0
    let avgSleep = '—'

    if (user?.id) {
      try {
        const { count: habitCount } = await supabase
          .from('habit_completions')
          .select('id', { count: 'exact', head: true })
          .eq('completed', true)
        habitsDone = habitCount || 0
      } catch {
        habitsDone = 0
      }

      try {
        const { count: workoutCount } = await supabase
          .from('workout_logs')
          .select('id', { count: 'exact', head: true })
        workouts = workoutCount || 0
      } catch {
        workouts = 0
      }

      try {
        const sinceDate = new Date()
        sinceDate.setDate(sinceDate.getDate() - 7)
        const { data: sleepData } = await supabase
          .from('sleep_logs')
          .select('hours, date')
          .gte('date', sinceDate.toISOString().split('T')[0])

        if (sleepData?.length) {
          const sum = sleepData.reduce((total, entry) => total + (entry.hours || 0), 0)
          const avg = sum / sleepData.length
          avgSleep = `${avg.toFixed(1)}h`
        }
      } catch {
        avgSleep = '—'
      }
    } else {
      const completionsKey = 'habit-completions-guest'
      const completions = localStorage.getItem(completionsKey)
      if (completions) {
        try {
          const parsed = JSON.parse(completions)
          habitsDone = parsed.filter(c => c.completed).length
        } catch {
          habitsDone = 0
        }
      }
    }

    setActivityStats({ workouts, habitsDone, avgSleep })
  }


  // Sync name when profile updates
  useEffect(() => {
    if (profile?.name) {
      setName(profile.name)
    }
  }, [profile?.name])

  useEffect(() => {
    loadActivityStats()
  }, [user?.id])

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
            {(profile?.name || user?.email || 'User')[0].toUpperCase()}
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
              <div className="profile-name-row">
                <h1 className="profile-name-title">{profile?.name || 'User'}</h1>
                <button type="button" className="edit-icon-btn" onClick={() => setIsEditing(true)} aria-label="Edit name">
                  <Pencil size={16} />
                </button>
              </div>
              <p className="profile-email">{user?.email || profile?.email || 'Guest mode'}</p>
              <div className="profile-meta-row">
                <span className={`status-pill ${user?.id && emailVerified ? 'status-success' : 'status-warning'}`}>
                  {user?.id ? (emailVerified ? 'Email verified' : 'Email not verified') : 'Guest profile'}
                </span>
                <span className="muted">Joined {joinedDate}</span>
              </div>
            </>
          )}
        </section>

        <section className="profile-section profile-metrics-grid">
          <div className="metric-card">
            <p className="metric-emoji">⏱</p>
            <p className="metric-label">Time on Ascent</p>
            <p className="metric-value">{daysOnAscent}</p>
          </div>
          <div className="metric-card">
            <p className="metric-emoji">🏋️</p>
            <p className="metric-label">Workouts</p>
            <p className="metric-value">{activityStats.workouts}</p>
          </div>
          <div className="metric-card">
            <p className="metric-emoji">🔥</p>
            <p className="metric-label">Habits done</p>
            <p className="metric-value">{activityStats.habitsDone}</p>
          </div>
          <div className="metric-card">
            <p className="metric-emoji">💤</p>
            <p className="metric-label">Avg sleep (7d)</p>
            <p className="metric-value">{activityStats.avgSleep}</p>
          </div>
        </section>

        <section className="profile-section quick-links">
          <h2 className="section-title">Preferences</h2>
          <ul className="link-list">
            {quickLinks.map((link) => (
              <li key={link.label} className="link-item" role="button" tabIndex={0} onClick={link.action} onKeyDown={(e) => e.key === 'Enter' && link.action()}>
                <div>
                  <p className="link-label">{link.label}</p>
                  <p className="link-detail">{link.detail}</p>
                </div>
                <span className="link-chevron">›</span>
              </li>
            ))}
          </ul>
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
