import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'

export function AuthForm() {
  const { signIn, signUp, user, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = isSignUp 
      ? await signUp(email, password)
      : await signIn(email, password)
    
    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  if (user) {
    return (
      <div>
        <h2>Welcome to Ascent!</h2>
        <p>Logged in as: {user.email}</p>
        <button onClick={signOut}>Sign Out</button>
      </div>
    )
  }

  return (
    <div>
      <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
      
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div>
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <button type="submit" disabled={loading}>
          {loading ? 'Loading...' : (isSignUp ? 'Create Account' : 'Sign In')}
        </button>
      </form>
      
      <button onClick={() => setIsSignUp(!isSignUp)}>
        {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
      </button>
    </div>
  )
}