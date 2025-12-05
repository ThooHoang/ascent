import { Button } from '../atoms/Button'

export function AuthModeToggle({ isSignUp, onToggle }) {
  return (
    <Button 
      variant="secondary"
      onClick={onToggle}
      ariaDescribedBy="mode-switch-help"
    >
      {isSignUp ? 'Already have an account? Sign In' : 'New to Ascent? Join Now'}
      <div id="mode-switch-help" className="sr-only">
        Switch between creating a new account and signing into an existing account
      </div>
    </Button>
  )
}