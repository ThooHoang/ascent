import { Routes, Route, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import { useAuth } from './hooks/useAuth.js'

// Route-level code-splitting to keep initial bundle small for Lighthouse/real users
const HomePage = lazy(() => import('./pages/HomePage.jsx'))
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'))
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'))
const SplashPage = lazy(() => import('./pages/SplashPage.jsx'))
const OnboardingPage = lazy(() => import('./pages/OnboardingPage.jsx'))
const SleepPage = lazy(() => import('./pages/SleepPage.jsx'))
const HabitsPage = lazy(() => import('./pages/HabitsPage.jsx'))
const WorkoutsPage = lazy(() => import('./pages/WorkoutsPage.jsx'))
const WeightOverviewPage = lazy(() => import('./pages/WeightOverviewPage.jsx'))

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-screen">
        <div role="status" aria-label="Loading application">
          <div className="loading-icon">Ascent</div>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <Suspense fallback={
        <div className="loading-screen">
          <div role="status" aria-label="Loading page">
            <div className="loading-icon">Ascent</div>
          </div>
        </div>
      }>
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
        <Route 
          path="/sleep" 
          element={user ? <SleepPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/habits" 
          element={user ? <HabitsPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/workouts" 
          element={user ? <WorkoutsPage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/profile" 
          element={user ? <ProfilePage /> : <Navigate to="/" replace />} 
        />
        <Route 
          path="/weight" 
          element={user ? <WeightOverviewPage /> : <Navigate to="/" replace />} 
        />
        
        {/* Catch all - redirect based on auth status */}
        <Route 
          path="*" 
          element={<Navigate to={user ? "/dashboard" : "/"} replace />} 
        />
      </Routes>
      </Suspense>
    </div>
  )
}

export default App;