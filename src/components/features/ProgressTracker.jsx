import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

const formatDisplayDate = (value) => {
  const date = new Date(value)
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const todayString = () => new Date().toISOString().split('T')[0]

export function ProgressTracker() {
  const { user } = useAuth()
  const storageKey = user?.id ? `progress-${user.id}` : 'progress-guest'

  const [entries, setEntries] = useState([])
  const [selectedDate, setSelectedDate] = useState(todayString())
  const [weight, setWeight] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFileName, setPhotoFileName] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setEntries(parsed)
      } catch (err) {
        console.error('Error parsing progress storage:', err)
      }
    }
  }, [storageKey])

  useEffect(() => {
    const existing = entries.find(entry => entry.date === selectedDate)
    setWeight(existing?.weight?.toString() || '')
    setPhotoPreview(existing?.photo || '')
    setPhotoFileName(existing?.photoName || '')
  }, [entries, selectedDate])

  const persistEntries = (updated) => {
    localStorage.setItem(storageKey, JSON.stringify(updated))
  }

  const handlePhotoChange = (file) => {
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result.toString())
      setPhotoFileName(file.name)
    }
    reader.readAsDataURL(file)
  }

  const saveProgress = () => {
    const cleanedWeight = weight ? Number(weight) : null
    const filtered = entries.filter(entry => entry.date !== selectedDate)
    const updated = [
      {
        date: selectedDate,
        weight: cleanedWeight,
        photo: photoPreview,
        photoName: photoFileName,
      },
      ...filtered,
    ].sort((a, b) => (a.date < b.date ? 1 : -1))

    setEntries(updated)
    persistEntries(updated)
  }

  const recentEntries = useMemo(() => entries.slice(0, 7), [entries])
  const lastWeight = recentEntries.find(entry => entry.date !== selectedDate && entry.weight !== null)?.weight
  const weightDelta = weight && lastWeight ? (Number(weight) - lastWeight).toFixed(1) : null

  return (
    <article className="progress-card">
      <div className="progress-header">
        <div>
          <p className="card-label">Progress</p>
          <p className="card-value">Daily check-ins</p>
        </div>
        <div className="date-select">
          <label className="input-label" htmlFor="progress-date">Day</label>
          <input
            id="progress-date"
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div className="progress-grid">
        <div className="progress-input">
          <label className="input-label" htmlFor="weight-input">Weight (kg)</label>
          <input
            id="weight-input"
            className="input-field"
            type="number"
            min="20"
            max="400"
            step="0.1"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder="Enter weight"
          />
          {weightDelta && (
            <p className={`progress-delta ${Number(weightDelta) >= 0 ? 'delta-up' : 'delta-down'}`}>
              {Number(weightDelta) >= 0 ? '+' : ''}{weightDelta} kg vs last entry
            </p>
          )}
        </div>

        <div className="progress-input">
          <label className="input-label" htmlFor="progress-photo">Progress photo</label>
          <div className="photo-upload">
            <input
              id="progress-photo"
              type="file"
              accept="image/*"
              onChange={(e) => handlePhotoChange(e.target.files?.[0])}
            />
            {photoFileName ? <span className="photo-name">{photoFileName}</span> : <span className="photo-name">Upload image</span>}
          </div>
          {photoPreview && (
            <div className="photo-preview">
              <img src={photoPreview} alt="Progress preview" />
            </div>
          )}
        </div>
      </div>

      <div className="progress-actions">
        <button type="button" className="btn btn-primary w-full" onClick={saveProgress}>
          Save check-in
        </button>
      </div>

      <div className="progress-history">
        <p className="section-title">Recent days</p>
        {recentEntries.length === 0 ? (
          <p className="habits-empty">No entries yet. Add weight or a photo.</p>
        ) : (
          <div className="history-list">
            {recentEntries.map(entry => (
              <div key={entry.date} className="history-item">
                <div>
                  <p className="history-date">{formatDisplayDate(entry.date)}</p>
                  <p className="history-weight">{entry.weight ? `${entry.weight} kg` : 'No weight logged'}</p>
                </div>
                {entry.photo && <span className="history-tag">Photo</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </article>
  )
}
