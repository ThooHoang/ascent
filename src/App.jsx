import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import { AuthForm } from './components/organisms/AuthForm.jsx';
import { useAuth } from './hooks/useAuth.js';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="app-shell">
      <Routes>
        <Route path="/" element={<HomePage />} />
      </Routes>
    </div>
  );
}

export default App;