import React, { useState } from 'react';
import './ShareData.css';

function ShareData() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api';

  // Search for users
  const searchUsers = async (e) => {
    const query = e.target.value;
    setSearchTerm(query);

    if (query.length < 2) {
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/users?search=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data || []);
    } catch (err) {
      setError('Failed to search users');
    } finally {
      setLoading(false);
    }
  };

  // Share data with registered user
  const shareWith = async (userId) => {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ viewer_id: userId })
      });

      if (!response.ok) {
        throw new Error('Failed to share');
      }

      setMessage('Access granted successfully!');
      setSearchTerm('');
      setUsers([]);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to share data');
    }
  };

  // Send invite to unregistered user
  const sendInvite = async (email) => {
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${API_URL}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ invited_email: email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send invite');
      }

      setMessage('Invitation sent! They will have access when they register.');
      setSearchTerm('');
      setUsers([]);
      setTimeout(() => setMessage(''), 5000);
    } catch (err) {
      setError(err.message || 'Failed to send invitation');
    }
  };

  return (
    <div className="share-data">
      <h3>Share Your Data</h3>
      <p className="subtitle">Grant access to registered users or invite new ones</p>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search by username or email (or email to invite)..."
          value={searchTerm}
          onChange={searchUsers}
          className="search-input"
        />
      </div>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {loading && <p className="loading">Searching...</p>}

      <div className="users-list">
        {users.length === 0 && searchTerm && !loading && (
          <div className="no-results">
            <p>No registered users found</p>
            {searchTerm.includes('@') && (
              <button
                className="invite-btn"
                onClick={() => sendInvite(searchTerm)}
              >
                Send Invite to {searchTerm}
              </button>
            )}
          </div>
        )}
        {users.map(user => (
          <div key={user.email} className="user-card">
            <div className="user-info">
              <div className="username">{user.username}</div>
              <div className="email">{user.email}</div>
              {user.status === 'invited' && (
                <div className="status-badge invited">Invitation pending</div>
              )}
            </div>
            <button
              className={`share-btn ${user.status === 'invited' ? 'disabled' : ''}`}
              onClick={() => shareWith(user.id)}
              disabled={user.status === 'invited'}
            >
              {user.status === 'invited' ? 'Invite Sent' : 'Grant Access'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShareData;
