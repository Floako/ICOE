import React, { useState, useEffect } from 'react';
import './ManageAccess.css';

function ManageAccess() {
  const [accessList, setAccessList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api';

  // Fetch combined access list
  const fetchAccessList = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/my-access-list`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setAccessList(data || []);
    } catch (err) {
      setError('Failed to load access list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccessList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Revoke access from a viewer
  const revokeAccess = async (userId) => {
    if (!window.confirm('Are you sure you want to revoke access?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/share/${userId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to revoke access');
      }

      setMessage('Access revoked');
      setAccessList(accessList.filter(item => item.id !== userId || item.type === 'invited'));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to revoke access');
    }
  };

  // Cancel invitation
  const cancelInvite = async (invitationId) => {
    if (!window.confirm('Cancel this invitation?')) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/invitation/${invitationId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.ok) {
        throw new Error('Failed to cancel invitation');
      }

      setMessage('Invitation cancelled');
      setAccessList(accessList.filter(item => item.id !== invitationId));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel invitation');
    }
  };

  return (
    <div className="manage-access">
      <h3>Manage Access</h3>
      <p className="subtitle">People who can view your information (active & pending invites)</p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : accessList.length === 0 ? (
        <div className="no-access">
          <p>You haven't shared your data with anyone yet</p>
        </div>
      ) : (
        <div className="access-list">
          {accessList.map((item, idx) => (
            <div key={`${item.type}-${item.id}`} className={`access-card ${item.type}`}>
              <div className="access-info">
                <div className="username">{item.username || item.email}</div>
                <div className="email">{item.email}</div>
                <div className="meta">
                  {item.type === 'active' ? (
                    <span className="type-badge active">Active Access</span>
                  ) : (
                    <>
                      <span className="type-badge invited">Invitation Pending</span>
                      {item.expires_at && (
                        <span className="expiry">
                          Expires {new Date(item.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </>
                  )}
                </div>
                <div className="date">
                  {item.type === 'active' ? 'Granted' : 'Invited'} on{' '}
                  {new Date(item.date_granted).toLocaleDateString()}
                </div>
              </div>
              <button
                className={`remove-btn ${item.type}`}
                onClick={() =>
                  item.type === 'active'
                    ? revokeAccess(item.id)
                    : cancelInvite(item.id)
                }
              >
                {item.type === 'active' ? 'Revoke' : 'Cancel'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ManageAccess;
