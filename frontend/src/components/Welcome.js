import React from 'react';
import './Welcome.css';

function Welcome({ onGetStarted, onSignIn }) {
  return (
    <div className="welcome-page">
      <div className="welcome-logo">
        <h1>ICOE</h1>
        <p>In Case of Emergency</p>
      </div>

      <p className="welcome-tagline">
        The one place you need when it matters most.
      </p>
      <p className="welcome-sub">
        ICOE helps you securely store your critical information — legal, financial, medical and more —
        so you and the people you trust can find exactly what they need, exactly when they need it.
        <br /><br />
        Your data stays under your control. Always.
      </p>

      <div className="welcome-features">
        <div className="welcome-feature-card">
          <div className="icon">🔒</div>
          <h3>Private & Secure</h3>
          <p>Your information is protected. Only you decide who sees what.</p>
        </div>
        <div className="welcome-feature-card">
          <div className="icon">👨‍👩‍👧</div>
          <h3>Your Circle</h3>
          <p>Share controlled access with the people you trust most.</p>
        </div>
        <div className="welcome-feature-card">
          <div className="icon">📁</div>
          <h3>Everything in One Place</h3>
          <p>Legal, health, finance, property and more — all organised.</p>
        </div>
        <div className="welcome-feature-card">
          <div className="icon">⚡</div>
          <h3>Ready in Seconds</h3>
          <p>Built for emergencies — fast to find, easy to update.</p>
        </div>
      </div>

      <div className="welcome-actions">
        <button className="btn-primary-welcome" onClick={onGetStarted}>
          Get Started
        </button>
        <button className="btn-secondary-welcome" onClick={onSignIn}>
          Sign In
        </button>
      </div>

      <p className="welcome-footer">
        Your information is never shared without your permission.
      </p>
    </div>
  );
}

export default Welcome;
