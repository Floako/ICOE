import React from 'react';
import './About.css';

const TICKER_ITEMS = [
  '🔒 Bank-grade encryption',
  '📋 Store legal documents',
  '🏥 Health & medical records',
  '💰 Financial accounts',
  '🛡️ Insurance policies',
  '📞 Emergency contacts',
  '🔑 Account credentials',
  '✈️ Travel & passports',
  '🚗 Vehicle information',
  '🤝 Share with trusted people',
  '📎 Attach files to records',
  '🔔 Expiry date tracking',
  '🏠 Property & utilities',
  '🪪 Memberships & subscriptions',
  '🎟️ Tickets & events',
];

function About({ onBack, onGetStarted }) {
  return (
    <div className="about-page">

      {/* ── Hero video ── */}
      <div className="about-hero">
        <video
          className="about-hero-video"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="/media/about-video.mp4" type="video/mp4" />
        </video>
        <div className="about-hero-overlay" />
        <div className="about-hero-content">
          <div className="about-logo">ICOE</div>
          <h1>In Case of Emergency</h1>
          <p className="about-tagline">Your digital black box. Always ready. Always secure.</p>
        </div>
      </div>

      {/* ── Ticker tape ── */}
      <div className="ticker-wrapper" aria-hidden="true">
        <div className="ticker-track">
          {/* Duplicate for seamless loop */}
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
            <span key={i} className="ticker-item">{item}</span>
          ))}
        </div>
      </div>

      {/* ── What is ICOE ── */}
      <section className="about-section">
        <h2>What is ICOE?</h2>
        <p>
          ICOE is a private, secure vault for the information that matters most. Store
          everything in one place so that you — or someone you trust — can find it
          instantly when it counts.
        </p>
        <p>
          Whether it's a medical emergency, a legal situation, or simply helping a
          family member manage your affairs, ICOE gives you peace of mind that
          your critical records are always accessible.
        </p>
      </section>

      {/* ── Feature cards ── */}
      <section className="about-features">
        <div className="about-feature-card">
          <div className="about-feature-icon">🔒</div>
          <h3>Secure Storage</h3>
          <p>All your records are protected with industry-standard encryption and JWT authentication. Nobody sees your data without your permission.</p>
        </div>
        <div className="about-feature-card">
          <div className="about-feature-icon">📂</div>
          <h3>Organised Records</h3>
          <p>Nine categories — Legal, Health, Finance, Insurance, Transport and more — keep everything tidy and instantly searchable.</p>
        </div>
        <div className="about-feature-card">
          <div className="about-feature-icon">🤝</div>
          <h3>Trusted Sharing</h3>
          <p>Invite family members or trusted contacts via email. Grant or revoke access at any time. You stay in full control.</p>
        </div>
        <div className="about-feature-card">
          <div className="about-feature-icon">📎</div>
          <h3>File Attachments</h3>
          <p>Attach scans, photos, and documents directly to records. Everything lives together — no hunting across folders and emails.</p>
        </div>
        <div className="about-feature-card">
          <div className="about-feature-icon">🔔</div>
          <h3>Expiry Tracking</h3>
          <p>Set start and renewal dates on records like insurance policies and passports so you're never caught out by an expiry.</p>
        </div>
        <div className="about-feature-card">
          <div className="about-feature-icon">📱</div>
          <h3>Access Anywhere</h3>
          <p>ICOE runs in your browser on any device. Your information is in the cloud, ready when you need it, from wherever you are.</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="about-cta">
        <h2>Ready to get started?</h2>
        <p>It takes less than a minute to create your account and start building your vault.</p>
        <div className="about-cta-buttons">
          <button className="about-cta-primary" onClick={onGetStarted}>
            Create Free Account
          </button>
          <button className="about-cta-secondary" onClick={onBack}>
            Back to Home
          </button>
        </div>
      </section>

    </div>
  );
}

export default About;
