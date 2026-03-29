// src/components/Auth.js
import React, { useState, useEffect } from 'react';
import './Auth.css';

function Auth({ onLoginSuccess, onClearSavedSession, initialMode, invitedEmail = '', resetToken = '' }) {
  const [authView, setAuthView] = useState(initialMode || 'login');
  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const isLogin = authView === 'login';
  const isRegister = authView === 'register';
  const isForgot = authView === 'forgot';
  const isReset = authView === 'reset';

  // Clear form state on component mount or when initialMode/invitedEmail changes
  useEffect(() => {
    setAuthView(initialMode || 'login');
    setEmail(invitedEmail || '');
    setPassword('');
    setConfirmPassword('');
    setUsername('');
    setError('');
    setMessage('');
  }, [initialMode, invitedEmail, resetToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (isForgot) {
      if (!trimmedEmail) {
        setError('Email is required.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: trimmedEmail })
        });

        const raw = await response.text();
        let data = {};
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch (_) {
            data = { raw };
          }
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to request password reset');
        }

        setMessage(data.message || 'If this email exists, a reset link has been sent.');
        setError('');
      } catch (err) {
        setError(err.message || 'Failed to request password reset');
      } finally {
        setLoading(false);
      }

      return;
    }

    if (isReset) {
      if (!resetToken) {
        setError('Reset token is missing from the link.');
        setLoading(false);
        return;
      }

      if (password.length < 8) {
        setError('Password must be at least 8 characters.');
        setLoading(false);
        return;
      }

      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: resetToken, new_password: password })
        });

        const raw = await response.text();
        let data = {};
        if (raw) {
          try {
            data = JSON.parse(raw);
          } catch (_) {
            data = { raw };
          }
        }

        if (!response.ok) {
          throw new Error(data.error || 'Failed to reset password');
        }

        setMessage('Password reset successful. You can now sign in.');
        setPassword('');
        setConfirmPassword('');
        setAuthView('login');
        window.history.replaceState({}, document.title, '/');
      } catch (err) {
        setError(err.message || 'Failed to reset password');
      } finally {
        setLoading(false);
      }

      return;
    }

    if (isRegister && (!trimmedUsername || !trimmedEmail)) {
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

      const raw = await response.text();
      let data = {};

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch (_) {
          data = { raw };
        }
      }

      if (!response.ok) {
        const proxyLikeError = typeof data.raw === 'string' && data.raw.toLowerCase().includes('proxy error');
        if (proxyLikeError) {
          throw new Error('Cannot reach backend API. Please restart backend server on port 5000 and try again.');
        }
        throw new Error(data.error || 'Authentication failed');
      }

      if (!data || typeof data !== 'object') {
        throw new Error('Unexpected server response. Please try again.');
      }

      if (isLogin) {
        onLoginSuccess(data.token, data.user);
      } else {
        setError('');
        setAuthView('login');
        const successMessage = invitedEmail
          ? 'Registration successful. Please log in. This account starts with view-only access to shared data. You can request your own vault after signing in.'
          : 'Registration successful! Please log in.';
        alert(successMessage);
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
        <h1>ICON</h1>
        <p className="subtitle">
          {isLogin
            ? 'In Case Of Need - Information Manager'
            : isRegister
              ? 'Create an account with your name, email and password'
              : isForgot
                ? 'Request a password reset link'
                : 'Set a new password'}
        </p>

        {invitedEmail && (
          <p className="subtitle" style={{ marginTop: '-6px', fontSize: '0.92rem' }}>
            This invitation gives you view access to shared records first. Your own private vault can be requested after you sign in.
          </p>
        )}
        
        <form onSubmit={handleSubmit} autoComplete="off">
          {error && <div className="error">{error}</div>}
          {message && <div className="success">{message}</div>}
          
          {isRegister && (
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </div>
          )}
          
          {!isReset && (
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
            </div>
          )}
          
          {!isForgot && (
            <div className="form-group">
              <label>{isReset ? 'New Password' : 'Password'}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
              />
            </div>
          )}

          {isReset && (
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          )}
          
          <button type="submit" disabled={loading}>
            {loading
              ? 'Loading...'
              : isLogin
                ? 'Log In'
                : isRegister
                  ? 'Register'
                  : isForgot
                    ? 'Send Reset Link'
                    : 'Reset Password'}
          </button>
        </form>

        {isLogin && (
          <p className="toggle-auth compact">
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                setError('');
                setMessage('');
                setAuthView('forgot');
              }}
            >
              Forgot password?
            </button>
          </p>
        )}

        {isForgot && (
          <p className="toggle-auth compact">
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                setError('');
                setMessage('');
                setAuthView('login');
              }}
            >
              Back to Log In
            </button>
          </p>
        )}
        
        {!isForgot && !isReset && (
          <p className="toggle-auth">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="toggle-btn"
              onClick={() => {
                setAuthView(isLogin ? 'register' : 'login');
                setPassword('');
                setConfirmPassword('');
                setUsername('');
                setError('');
                setMessage('');
              }}
            >
              {isLogin ? 'Register' : 'Log In'}
            </button>
          </p>
        )}

        <p className="toggle-auth">
          <button
            type="button"
            className="toggle-btn"
            onClick={() => {
              setError('');
              setMessage('');
              setPassword('');
              setConfirmPassword('');
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
