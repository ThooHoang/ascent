import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import SplashPage from './pages/SplashPage.jsx'
import OnboardingPage from './pages/OnboardingPage.jsx'
import { useAuth } from './hooks/useAuth.js'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div role="status" aria-label="Loading application">
          <div className="loading-icon">🌱</div>
          <div className="loading-text">Loading Ascent...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Routes>
        {/* Entry Flow */}
        <Route 
          path="/" 
          element={user ? <Navigate to="/dashboard" replace /> : <SplashPage />} 
        />
        <Route 
          path="/onboarding" 
          element={user ? <Navigate to="/dashboard" replace /> : <OnboardingPage />} 
        />
        <Route 
          path="/login" 
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={user ? <HomePage /> : <Navigate to="/" replace />} 
        />
        
        {/* Catch all - redirect based on auth status */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/"} replace />} 
        />
      </Routes>
    </div>
  )
}

export default App;