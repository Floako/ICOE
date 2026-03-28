import React, { useState, useEffect } from 'react';
import './SharedWithMe.css';

function SharedWithMe() {
  const [sharedData, setSharedData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOwnerId, setExpandedOwnerId] = useState(null);
  const [selectedItems, setSelectedItems] = useState({});

  const token = localStorage.getItem('token');
  const API_URL = 'http://localhost:5000/api';

  const fetchSharedData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${API_URL}/shared-with-me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Failed to load shared data');
      }
      const data = await response.json();
      setSharedData(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load shared data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSharedData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleOwner = (ownerId) => {
    if (expandedOwnerId === ownerId) {
      setExpandedOwnerId(null);
    } else {
      setExpandedOwnerId(ownerId);
      fetchCategoryItems(ownerId);
    }
  };

  const fetchCategoryItems = async (ownerId) => {
    const owner = sharedData.find(o => o.owner_id === ownerId);
    if (!owner || !owner.categories) return;

    // Mark that items are loading
    setSelectedItems(prev => ({
      ...prev,
      [ownerId]: 'loading'
    }));

    try {
      const itemsData = {};
      for (const category of owner.categories) {
        const response = await fetch(
          `${API_URL}/shared/${ownerId}/categories/${category.id}/items`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!response.ok) {
          const payload = await response.json().catch(() => ({}));
          throw new Error(payload.error || `Failed to load items for ${category.category_name}`);
        }
        const items = await response.json();
        itemsData[category.id] = items || [];
      }
      setSelectedItems(prev => ({
        ...prev,
        [ownerId]: itemsData
      }));
    } catch (err) {
      const message = err.message || 'Failed to load items';
      setError(message);
      setSelectedItems(prev => ({
        ...prev,
        [ownerId]: { __error: message }
      }));
    }
  };

  return (
    <div className="shared-with-me">
      <h3>Data Shared With Me</h3>
      <p className="subtitle">View information others have shared</p>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p className="loading">Loading...</p>
      ) : sharedData.length === 0 ? (
        <div className="no-shared">
          <p>No one has shared their data with you yet</p>
        </div>
      ) : (
        <div className="shared-owners">
          {sharedData.map(owner => (
            <div key={owner.owner_id} className="owner-section">
              <div
                className="owner-header"
                onClick={() => toggleOwner(owner.owner_id)}
              >
                <div className="owner-info">
                  <div className="owner-name">{owner.owner_username}</div>
                  <div className="owner-email">{owner.owner_email}</div>
                </div>
                <span className="toggle-icon">
                  {expandedOwnerId === owner.owner_id ? '−' : '+'}
                </span>
              </div>

              {expandedOwnerId === owner.owner_id && (
                <div className="owner-content">
                  {selectedItems[owner.owner_id] === 'loading' ? (
                    <p className="loading-items">Loading items...</p>
                  ) : selectedItems[owner.owner_id] && selectedItems[owner.owner_id].__error ? (
                    <p className="no-items">{selectedItems[owner.owner_id].__error}</p>
                  ) : owner.categories && owner.categories.length > 0 ? (
                    <div className="categories-list">
                      {owner.categories.map(category => (
                        <div key={category.id} className="category-section">
                          <div className="category-name">{category.category_name}</div>
                          <div className="items-list">
                            {selectedItems[owner.owner_id] &&
                            selectedItems[owner.owner_id][category.id] ? (
                              selectedItems[owner.owner_id][category.id].length > 0 ? (
                                selectedItems[owner.owner_id][category.id].map(item => {
                                  const hasContact = item.contact_name || item.contact_phone || 
                                                    item.contact_address || item.contact_email;
                                  return (
                                    <div key={item.id} className="item">
                                      <div className="item-title">{item.title}</div>
                                      {item.description && (
                                        <p className="item-desc">{item.description}</p>
                                      )}
                                      {hasContact && (
                                        <div className="item-contact">
                                          <strong>Contact:</strong>
                                          <div className="contact-details">
                                            {item.contact_name && <p>Name: {item.contact_name}</p>}
                                            {item.contact_phone && <p>Phone: {item.contact_phone}</p>}
                                            {item.contact_address && <p>Address: {item.contact_address}</p>}
                                            {item.contact_email && <p>Email: {item.contact_email}</p>}
                                          </div>
                                        </div>
                                      )}
                                      {item.reference_number && (
                                        <p className="item-ref">
                                          <strong>Ref:</strong> {item.reference_number}
                                        </p>
                                      )}
                                      {item.files && item.files.length > 0 && (
                                        <div className="item-files">
                                          <strong>Documents:</strong>
                                          <div className="file-links">
                                            {item.files.map(file => (
                                              <a
                                                key={file.id}
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="file-link"
                                              >
                                                {file.original_filename || file.filename}
                                              </a>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })
                              ) : (
                                <p className="no-items">No items in this category</p>
                              )
                            ) : (
                              <p className="no-items">No items</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-categories">No categories shared</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SharedWithMe;
