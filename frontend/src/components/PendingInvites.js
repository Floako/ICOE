import React, { useState, useEffect } from 'react';
import './PendingInvites.css';

function PendingInvites() {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api';

  // Fetch pending invitations
  const fetchInvitations = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/my-invitations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await response.json();
      setInvitations(data || []);
    } catch (err) {
      setError('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvitations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calculate time until expiration
  const getTimeRemaining = (expiresAt) => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diffMs = expiration - now;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

    if (diffHours > 0) {
      return `${diffHours}h ${diffMins}m remaining`;
    } else if (diffMins > 0) {
      return `${diffMins}m remaining`;
    } else {
      return 'Expired';
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
      setInvitations(invitations.filter(i => i.id !== invitationId));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel invitation');
    }
  };

  return (
    <div className="pending-invites">
      <h3>Pending Invitations</h3>
      <p className="subtitle">Invitations awaiting acceptance (auto-grant when they register)</p>

      {error && <div className="error-message">{error}</div>}
      {message && <div className="success-message">{message}</div>}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : invitations.length === 0 ? (
        <div className="no-invites">
          <p>No pending invitations</p>
        </div>
      ) : (
        <div className="invites-list">
          {invitations.map(invite => (
            <div key={invite.id} className="invite-card">
              <div className="invite-info">
                <div className="email">{invite.invited_email}</div>
                <div className="status">
                  {invite.status === 'accepted' ? (
                    <span className="badge accepted">Accepted</span>
                  ) : (
                    <>
                      <span className="badge pending">Pending</span>
                      <span className="expiration">
                        {getTimeRemaining(invite.expires_at)}
                      </span>
                    </>
                  )}
                </div>
                <div className="sent-date">
                  Sent on {new Date(invite.created_at).toLocaleDateString()}
                </div>
              </div>
              {invite.status !== 'accepted' && (
                <button
                  className="cancel-btn"
                  onClick={() => cancelInvite(invite.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PendingInvites;
