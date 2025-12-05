import { Button } from '../atoms/Button'

export function WelcomeMessage({ user, onSignOut }) {
  return (
    <div className="welcome-container">
      <h2>Welcome to Ascent!</h2>
      <p>Ready to track your holistic growth journey.</p>
      <p className="text-secondary">Logged in as: {user.email}</p>
      <Button onClick={onSignOut} variant="danger">
        Sign Out
      </Button>
    </div>
  )
}