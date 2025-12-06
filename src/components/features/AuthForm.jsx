import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

export function AuthForm({ initialMode = 'signin' }) {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const { error } = isSignUp 
      ? await signUp(email, password, name)
      : await signIn(email, password)
    
    if (error) {
      alert(error.message)
    }
    setLoading(false)
  }

  const toggleMode = () => {
    setIsSignUp(!isSignUp)
    setEmail('')
    setPassword('')
    setName('')
  }

  return (
    <>
      {/* Header */}
      <header className="auth-header">
        <h1 className="auth-title">
          {isSignUp ? 'Start Your Ascent' : 'Welcome Back'}
        </h1>
        <p className="auth-subtitle">
          Enter your details below
        </p>
      </header>

      {/* Form */}
      <main className="auth-main">
        <div className="auth-card">
          <form onSubmit={handleSubmit} className="auth-form-clean">
            {isSignUp && (
              <Input
                id="name"
                type="text"
                label="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
              />
            )}

            <Input
              id="email"
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
            />

            <Input
              id="password"
              type="password" 
              label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              minLength={6}
            />

            <Button 
              type="submit" 
              disabled={loading}
              size="large"
              className="w-full"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          {/* Toggle Mode */}
          <div className="auth-toggle">
            <span className="toggle-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button 
              type="button" 
              onClick={toggleMode}
              className="toggle-link"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>
        </div>
      </main>
    </>
  )
}