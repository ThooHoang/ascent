import { useSearchParams } from 'react-router-dom'
import { AuthForm } from '../components/features/AuthForm'

function LoginPage() {
  const [searchParams] = useSearchParams()
  const isSignupMode = searchParams.get('mode') === 'signup'

  return (
    <div className="auth-screen">
      <AuthForm initialMode={isSignupMode ? 'signup' : 'signin'} />
    </div>
  )
}

export default LoginPage