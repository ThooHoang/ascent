import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import { useSelectedDate } from '../../contexts/DateContext'
import { Camera, X } from 'lucide-react'

export function WeightProgress() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { selectedDate } = useSelectedDate()
  const storageKey = user?.id ? `progress-${user.id}` : 'progress-guest'

  const [entries, setEntries] = useState([])
  const [isEditing, setIsEditing] = useState(false)
  const [weight, setWeight] = useState('')
  const [photoPreview, setPhotoPreview] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadEntries()
  }, [user?.id, storageKey, selectedDate])

  const loadEntries = async () => {
    try {
      setLoading(true)
      if (user?.id) {
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .order('date', { ascending: false })

        if (!error && data) {
          setEntries(data)
          const todayEntry = data.find(e => e.date === selectedDate)
          if (todayEntry?.weight) {
            setWeight(todayEntry.weight.toString())
            setPhotoPreview(todayEntry.photo_url || '')
          } else {
            setWeight('')
            setPhotoPreview('')
          }
        }
      } else {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setEntries(parsed)
            const todayEntry = parsed.find(e => e.date === selectedDate)
            if (todayEntry?.weight) {
              setWeight(todayEntry.weight.toString())
              setPhotoPreview(todayEntry.photo || '')
            } else {
              setWeight('')
              setPhotoPreview('')
            }
          } catch {
            setEntries([])
          }
        }
      }
    } finally {
      setLoading(false)
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

  const handleSave = async () => {
    if (!weight) return
    try {
      if (user?.id) {
        const { error } = await supabase
          .from('weight_logs')
          .upsert(
            {
              user_id: user.id,
              date: selectedDate,
              weight: parseFloat(weight),
              photo_url: photoPreview || '',
            },
            { onConflict: 'user_id,date' }
          )
        if (!error) {
          await loadEntries()
          setIsEditing(false)
        }
      } else {
        const filtered = entries.filter(e => e.date !== selectedDate)
        const updated = [
          {
            date: selectedDate,
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
    } catch (err) {
      // ignore error
    }
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

  // Show weight only for selected date
  const currentWeight = useMemo(() => 
    entries.find(e => e.date === selectedDate && e.weight)?.weight || null,
    [entries, selectedDate]
  )
  const previousWeight = weights.length > 1 ? weights[1] : null
  const delta = null // delta display removed per request

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
          <p className="section-title">Today's Weight</p>
          <div className="weight-display">
            <button 
              className="weight-value clickable" 
              type="button"
              onClick={() => setIsEditing(true)}
              title="Click to update weight"
            >
              {currentWeight ? `${currentWeight.toFixed(1)} kg` : '—'}
            </button>
          </div>
        </div>
        <div className="weight-actions">
          <button className="btn-link-secondary" type="button" onClick={() => navigate('/weight')}>
            View history →
          </button>
          <button className="btn btn-sm" type="button" onClick={() => setIsEditing(true)}>
            Add weight
          </button>
        </div>
      </div>
    </div>
  )
}


