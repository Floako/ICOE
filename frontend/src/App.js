import React, { useState } from 'react';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Welcome from './components/Welcome';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);
  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('token'));
  const [authMode, setAuthMode] = useState('login');

  const handleLoginSuccess = (token, user) => {
    setToken(token);
    setUser(user);
    setShowWelcome(false);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setShowWelcome(true);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (showWelcome && !token) {
    return (
      <Welcome
        onGetStarted={() => { setAuthMode('register'); setShowWelcome(false); }}
        onSignIn={() => { setAuthMode('login'); setShowWelcome(false); }}
      />
    );
  }

  return (
    <div className="App">
      {!token ? (
        <Auth onLoginSuccess={handleLoginSuccess} initialMode={authMode} />
      ) : (
        <Dashboard user={user} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
