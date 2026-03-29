import React, { useEffect, useState } from 'react';
import './App.css';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import Welcome from './components/Welcome';
import About from './components/About';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null);

  // Parse invitation link: /register?invited_email=someone@example.com
  const urlParams = new URLSearchParams(window.location.search);
  const invitedEmail = urlParams.get('invited_email') || '';
  const resetToken = urlParams.get('token') || '';
  const isResetPath = window.location.pathname.toLowerCase().includes('/reset-password');
  const initialMode = isResetPath && resetToken ? 'reset' : (invitedEmail ? 'register' : 'login');

  const [showWelcome, setShowWelcome] = useState(!localStorage.getItem('token') && !invitedEmail && !(isResetPath && resetToken));
  const [showAbout, setShowAbout] = useState(false);
  const [authMode, setAuthMode] = useState(initialMode);

  // Clear session data on app mount if no token
  useEffect(() => {
    if (!token) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, []);

  useEffect(() => {
    if (isResetPath && resetToken) {
      setToken(null);
      setUser(null);
      setShowWelcome(false);
      setAuthMode('reset');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return;
    }

    if (!invitedEmail) {
      return;
    }

    // Invitation links must open the auth flow, not the current signed-in session.
    setToken(null);
    setUser(null);
    setShowWelcome(false);
    setAuthMode('register');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, [invitedEmail, isResetPath, resetToken]);

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
    setAuthMode('login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.history.replaceState({}, document.title, window.location.pathname);
  };

  const handleClearSavedSession = () => {
    setToken(null);
    setUser(null);
    setShowWelcome(false);
    setAuthMode(invitedEmail ? 'register' : 'login');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (showAbout && !token) {
    return (
      <About
        onBack={() => { setShowAbout(false); setShowWelcome(true); }}
        onGetStarted={() => { setShowAbout(false); setShowWelcome(false); setAuthMode('register'); }}
      />
    );
  }

  if (showWelcome && !token) {
    return (
      <Welcome
        onGetStarted={() => { setAuthMode('register'); setShowWelcome(false); }}
        onSignIn={() => { setAuthMode('login'); setShowWelcome(false); }}
        onAbout={() => { setShowAbout(true); setShowWelcome(false); }}
      />
    );
  }

  return (
    <div className="App">
      {!token ? (
        <Auth
          onLoginSuccess={handleLoginSuccess}
          onClearSavedSession={handleClearSavedSession}
          initialMode={authMode}
          invitedEmail={invitedEmail}
          resetToken={isResetPath ? resetToken : ''}
        />
      ) : (
        <Dashboard user={user} token={token} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
