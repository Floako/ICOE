// src/components/Auth.js
import React, { useState, useEffect } from 'react';
import './Auth.css';

function Auth({ onLoginSuccess, onClearSavedSession, initialMode, invitedEmail = '' }) {
  const [isLogin, setIsLogin] = useState(initialMode !== 'register');
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear form state on component mount or when initialMode/invitedEmail changes
  useEffect(() => {
    setEmail(invitedEmail || '');
    setPassword('');
    setUsername('');
    setError('');
  }, [initialMode, invitedEmail]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (!isLogin && (!trimmedUsername || !trimmedEmail)) {
      setError('Name and email are required to register.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const body = isLogin 
        ? { email: trimmedEmail, password }
        : { username: trimmedUsername, email: trimmedEmail, password };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      if (isLogin) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError('');
        setIsLogin(true);
        alert('Registration successful! Please log in.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>ICOE</h1>
        <p className="subtitle">
          {isLogin
            ? 'In Case Of Emergency - Information Manager'
            : 'Create an account with your name, email and password'}
        </p>
        
        <form onSubmit={handleSubmit}>
          {error && <div className="error">{error}</div>}
          
          {!isLogin && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your full name"
                required
              />
            </div>
          )}
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isLogin ? 'Log In' : 'Register')}
          </button>
        </form>
        
        <p className="toggle-auth">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            className="toggle-btn"
            onClick={() => { 
              setIsLogin(!isLogin); 
              setPassword('');
              setUsername('');
              setError(''); 
            }}
          >
            {isLogin ? 'Register' : 'Log In'}
          </button>
        </p>

        <p className="toggle-auth">
          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setError('');
              setPassword('');
              if (!invitedEmail) {
                setEmail('');
              }
              setUsername('');
              onClearSavedSession();
            }}
          >
            Clear saved session
          </button>
        </p>
      </div>
    </div>
  );
}

export default Auth;
