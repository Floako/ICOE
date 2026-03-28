import React, { useState } from 'react';
import './Welcome.css';
import Icon from './Icons';

// ── Use-case ticker rows — add/remove items freely ──────────────────────────
const TICKER_ROWS = [
  // Row 1 — everyday life & household
  [
    'Broadband Provider', 'Valuable Receipt', 'Parking Permit', 'School Run Contact',
    'Grocery Loyalty Card', 'Boiler Service Date', 'Vet Details', 'Pet Microchip Number',
    'Recurring Subscriptions', 'Landlord Contact', 'Meter Readings', 'Key Safe Code',
    'Password Reminder', 'Council Tax Reference', 'Window Cleaner Contact', 'Recycling Schedule',
  ],
  // Row 2 — travel, events & leisure
  [
    'Boarding Card', 'Concert Ticket', 'Hotel Booking', 'Festival Wristband Code',
    'Rail Card Number', 'Car Hire Confirmation', 'Airport Lounge Pass', 'Travel Adapter Notes',
    'Holiday Insurance', 'Frequent Flyer Number', 'Passport Expiry Date', 'Visa Requirements',
    'Favourite Restaurants Abroad', 'Embassy Contacts', 'Currency Exchange Notes', 'Cruise Details',
  ],
  // Row 3 — health, finance & identity
  [
    'Blood Type', 'Known Allergies', 'NHS Number', 'GP Contact',
    'Current Medication', 'Dentist Details', 'Optician Prescription', 'Vaccination Record',
    'Bank Sort Code', 'National Insurance Number', 'Tax Reference', 'Pension Details',
    'Life Insurance Policy', 'Solicitor Details', 'Power of Attorney', 'Will & Testament',
  ],
];

function Welcome({ onGetStarted, onSignIn }) {
  const [hasEntered, setHasEntered] = useState(false);

  if (!hasEntered) {
    return (
      <div className="welcome-page home-entry">
        <div className="welcome-logo">
          <h1>ICOE</h1>
          <p>In Case of Emergency</p>
        </div>

        <p className="welcome-tagline">The one place you need when it matters most.</p>

        <div className="ticker-section">
          <p className="ticker-label">What people store in ICOE</p>
          <div className="ticker-rows">
            {TICKER_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="ticker-row">
                <div
                  className={`ticker-track${rowIndex === 1 ? ' reverse' : ''}`}
                  style={{ animationDuration: `${[55, 72, 62][rowIndex]}s` }}
                >
                  {[...row, ...row].map((item, i) => (
                    <span key={i} className="ticker-tag">{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="btn-primary-welcome enter-btn" onClick={() => setHasEntered(true)}>
          Enter
        </button>
      </div>
    );
  }

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

      <div className="ticker-section">
        <p className="ticker-label">What people store in ICOE</p>
        <div className="ticker-rows">
          {TICKER_ROWS.map((row, rowIndex) => (
            <div key={rowIndex} className="ticker-row">
              <div
                className={`ticker-track${rowIndex === 1 ? ' reverse' : ''}`}
                style={{ animationDuration: `${[55, 72, 62][rowIndex]}s` }}
              >
                {[...row, ...row].map((item, i) => (
                  <span key={i} className="ticker-tag">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="welcome-features">
        <div className="wf-item">
          <div className="wf-icon"><Icon name="lock" size={20} color="currentColor" strokeWidth={1.7} /></div>
          <div className="wf-text">
            <h3>Private &amp; Secure</h3>
            <p>Your information is protected. Only you decide who sees what.</p>
          </div>
        </div>
        <div className="wf-item">
          <div className="wf-icon"><Icon name="users" size={20} color="currentColor" strokeWidth={1.7} /></div>
          <div className="wf-text">
            <h3>Your Circle</h3>
            <p>Share controlled access with the people you trust most.</p>
          </div>
        </div>
        <div className="wf-item">
          <div className="wf-icon"><Icon name="folder" size={20} color="currentColor" strokeWidth={1.7} /></div>
          <div className="wf-text">
            <h3>Everything in One Place</h3>
            <p>Legal, health, finance, property and more — all organised.</p>
          </div>
        </div>
        <div className="wf-item">
          <div className="wf-icon"><Icon name="zap" size={20} color="currentColor" strokeWidth={1.7} /></div>
          <div className="wf-text">
            <h3>Always at Hand</h3>
            <p>At home, travelling or on the go — find what you need in seconds.</p>
          </div>
        </div>
      </div>

      <div className="welcome-actions">
        <button className="btn-primary-welcome" onClick={onGetStarted}>
          Create Account
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
