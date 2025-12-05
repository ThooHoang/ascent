import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { AuthFormFields } from '../molecules/AuthFormFields'
import { AuthModeToggle } from '../molecules/AuthModeToggle'
import { WelcomeMessage } from '../molecules/WelcomeMessage'

export function AuthForm({ initialMode = false }) {
  const { signIn, signUp, user, signOut } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(initialMode)
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

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp)
    // Clear form when switching modes
    setEmail('')
    setPassword('')
  }

  if (user) {
    return <WelcomeMessage user={user} onSignOut={signOut} />
  }

  return (
    <div className="auth-form">
      <h2>{isSignUp ? 'Join Ascent' : 'Welcome Back'}</h2>
      <p className="auth-subtitle">
        {isSignUp 
          ? 'Start your holistic self-improvement journey' 
          : 'Continue your growth journey'
        }
      </p>
      
      <AuthFormFields
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        isSignUp={isSignUp}
        loading={loading}
        onSubmit={handleSubmit}
      />
      
      <AuthModeToggle 
        isSignUp={isSignUp} 
        onToggle={handleToggleMode}
      />
    </div>
  )
}