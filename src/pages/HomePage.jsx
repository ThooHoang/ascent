import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

function HomePage() {
  const [message, setMessage] = useState('Testing connection...')

  useEffect(() => {
    const testConnection = async () => {
      try {
        await supabase.auth.getSession()
        setMessage('✅ Supabase connected successfully!')
      } catch (error) {
        setMessage(`❌ Connection failed: ${error.message}`)
      }
    }
    
    testConnection()
  }, [])

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-4">Ascent</h1>
      <div className="bg-gray-100 p-4 rounded">
        <strong>Connection Status:</strong> {message}
      </div>
    </main>
  )
}

export default HomePage