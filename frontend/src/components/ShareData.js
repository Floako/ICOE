import React, { useState, useEffect } from 'react';
import Icon from './Icons';
import './ShareData.css';

function ShareData() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [sharedList, setSharedList] = useState([]);
  const [listLoading, setListLoading] = useState(true);

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api';

  const fetchSharedList = async () => {
    setListLoading(true);
    try {
      const res = await fetch(`${API_URL}/my-access-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setSharedList(data || []);
    } catch {
      // non-critical — list just stays empty
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const revokeAccess = async (userId) => {
    if (!window.confirm('Revoke access for this person?')) return;
    try {
      const res = await fetch(`${API_URL}/share/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to revoke');
      setSharedList(prev => prev.filter(i => !(i.id === userId && i.type === 'active')));
      setMessage('Access revoked');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Failed to revoke access');
    }
  };

  const cancelInvite = async (invitationId) => {
    if (!window.confirm('Cancel this invitation?')) return;
    try {
      const res = await fetch(`${API_URL}/invitation/${invitationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to cancel');
      setSharedList(prev => prev.filter(i => !(i.id === invitationId && i.type === 'invited')));
      setMessage('Invitation cancelled');
      setTimeout(() => setMessage(''), 3000);
    } catch {
      setError('Failed to cancel invitation');
    }
  };

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
      fetchSharedList();
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
      fetchSharedList();
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

      {/* Currently sharing with */}
      <div className="shared-with-section">
        <div className="shared-with-header">
          <span className="shared-with-icon"><Icon name="users" size={15} strokeWidth={1.6} /></span>
          <h4>Currently sharing with</h4>
          {sharedList.length > 0 && (
            <span className="shared-count">{sharedList.length}</span>
          )}
        </div>

        {listLoading ? (
          <p className="loading">Loading...</p>
        ) : sharedList.length === 0 ? (
          <div className="shared-empty">
            <Icon name="users" size={28} color="#c8cfde" strokeWidth={1.25} />
            <p>You haven't shared your data with anyone yet</p>
          </div>
        ) : (
          <div className="shared-list">
            {sharedList.map(item => (
              <div key={`${item.type}-${item.id}`} className={`shared-row ${item.type}`}>
                <div className="shared-avatar">
                  <Icon name="account" size={15} color="currentColor" strokeWidth={1.6} />
                </div>
                <div className="shared-info">
                  <div className="shared-name">{item.username || item.email}</div>
                  <div className="shared-email">{item.email}</div>
                </div>
                <div className="shared-meta">
                  {item.type === 'active' ? (
                    <span className="shared-badge active">Active</span>
                  ) : (
                    <span className="shared-badge pending">Pending</span>
                  )}
                </div>
                <button
                  className={`shared-remove-btn ${item.type}`}
                  onClick={() => item.type === 'active' ? revokeAccess(item.id) : cancelInvite(item.id)}
                  title={item.type === 'active' ? 'Revoke access' : 'Cancel invite'}
                >
                  <Icon name="trash" size={13} strokeWidth={1.6} />
                  {item.type === 'active' ? 'Revoke' : 'Cancel'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ShareData;
