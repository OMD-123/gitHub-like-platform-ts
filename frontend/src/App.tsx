import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import { useAuth } from './contexts/AuthContext';

function App() {
  const { user, loading } = useAuth();
  if (loading) return <div>Loading...</div>;
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-left">
            <h1>GitPlatform</h1>
          </div>
          <div className="nav-right">
            {user ? (
              <>
                <span>Welcome, {user.username}</span>
                <button onClick={() => {/* logout logic */}}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
              </>
            )}
          </div>
        </nav>
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" replace />} />
          <Route path="/register" element={!user ? <Register /> : <Navigate to="/" replace />} />
          {/* Add more routes for repositories, etc. */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
