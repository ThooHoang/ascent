import { Input } from '../atoms/Input'
import { Button } from '../atoms/Button'

export function AuthFormFields({ 
  email, 
  setEmail, 
  password, 
  setPassword, 
  isSignUp, 
  loading, 
  onSubmit 
}) {
  return (
    <form onSubmit={onSubmit}>
      <Input
        id="email"
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        ariaDescribedBy="email-help"
        label="Email Address"
      />
      
      <Input
        id="password"
        type="password"
        placeholder="Password (minimum 6 characters)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={6}
        ariaDescribedBy="password-help"
        label="Password"
      />
      
      <Button 
        type="submit" 
        disabled={loading}
        variant="primary"
        ariaDescribedBy="submit-status"
      >
        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
      </Button>
    </form>
  )
}