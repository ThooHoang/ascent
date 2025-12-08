import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { Camera, X } from 'lucide-react'

export function WeightProgress() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const storageKey = user?.id ? `progress-${user.id}` : 'progress-guest'

  const [entries, setEntries] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [weight, setWeight] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)

  useEffect(() => {
    loadEntries()
  }, [storageKey])

  const loadEntries = () => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setEntries(parsed)
        const today = new Date().toISOString().split('T')[0]
        const todayEntry = parsed.find(e => e.date === today)
        if (todayEntry?.weight) {
          setWeight(todayEntry.weight.toString())
          setPhotoPreview(todayEntry.photo || '')
        }
      } catch {
        setEntries([])
      }
    }
  }

  const handlePhotoChange = (file) => {
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    if (!weight) return
    const today = new Date().toISOString().split('T')[0]
    const filtered = entries.filter(e => e.date !== today)
    const updated = [
      {
        date: today,
        weight: parseFloat(weight),
        photo: photoPreview || '',
        photoName: photoFile?.name || '',
      },
      ...filtered,
    ]
    setEntries(updated)
    localStorage.setItem(storageKey, JSON.stringify(updated))
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setWeight('')
    setPhotoPreview('')
    setPhotoFile(null)
  }

  const weights = useMemo(() => entries.filter(e => e.weight).map(e => e.weight), [entries])
  const minWeight = weights.length ? Math.min(...weights) - 2 : 80
  const maxWeight = weights.length ? Math.max(...weights) + 2 : 90

  const currentWeight = weights.length ? weights[weights.length - 1] : null
  const previousWeight = weights.length > 1 ? weights[weights.length - 2] : null
  const delta = currentWeight && previousWeight ? (currentWeight - previousWeight).toFixed(1) : null

  const getChartPoints = () => {
    if (!weights.length) return []
    const range = maxWeight - minWeight
    return weights.map((w, i) => ({
      index: i,
      weight: w,
      date: entries.filter(e => e.weight)[i]?.date,
      normalized: ((w - minWeight) / range) * 100,
    }))
  }

  const points = getChartPoints()

  if (isEditing) {
    return (
      <div className="weight-card">
        <div className="weight-form-header">
          <p className="section-title">Log Weight</p>
          <button className="close-btn" type="button" onClick={handleCancel} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="weight-form">
          <div className="form-group">
            <label className="input-label">Weight (kg)</label>
            <input
              type="number"
              className="input-field"
              min="20"
              max="400"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Enter weight"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="input-label">Photo</label>
            <div className="photo-upload-area">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handlePhotoChange(e.target.files?.[0])}
                id="weight-photo"
              />
              <label htmlFor="weight-photo" className="upload-label">
                <Camera size={20} />
                <span>Add photo</span>
              </label>
            </div>
            {photoPreview && (
              <div className="photo-preview-container">
                <img src={photoPreview} alt="Weight progress" className="photo-preview" />
                <button
                  className="remove-photo-btn"
                  type="button"
                  onClick={() => { setPhotoPreview(''); setPhotoFile(null); }}
                  aria-label="Remove photo"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          <div className="form-actions">
            <button className="btn" type="button" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-primary" type="button" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="weight-card">
      <div className="weight-header">
        <div>
          <p className="section-title">Weight</p>
          <div className="weight-display">
            <button 
              className="weight-value clickable" 
              type="button"
              onClick={() => setIsEditing(true)}
              title="Click to update weight"
            >
              {currentWeight ? `${currentWeight.toFixed(1)} kg` : '—'}
            </button>
            {delta && (
              <p className={`weight-delta ${Number(delta) > 0 ? 'delta-up' : 'delta-down'}`}>
                {Number(delta) > 0 ? '+' : ''}{delta} kg
              </p>
            )}
          </div>
        </div>
        <button className="text-link" type="button" onClick={() => navigate('/weight')}>
          View details
        </button>
      </div>
    </div>
  )
}


