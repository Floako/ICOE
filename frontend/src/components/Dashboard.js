import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import CategoryList from './CategoryList';
import ItemDetail from './ItemDetail';
import ShareData from './ShareData';
import ManageAccess from './ManageAccess';
import SharedWithMe from './SharedWithMe';
import PendingInvites from './PendingInvites';

const CATEGORIES = [
  { name: 'LEGAL',               icon: '⚖️' },
  { name: 'HEALTH',              icon: '🏥' },
  { name: 'FINANCE',             icon: '💰' },
  { name: 'SERVICES',            icon: '🔧' },
  { name: 'INSURANCE/ASSURANCE', icon: '🛡️' },
  { name: 'MEMBERSHIPS',         icon: '🪪' },
  { name: 'TRANSPORT',           icon: '🚗' },
  { name: 'TRAVEL',              icon: '✈️' },
  { name: 'TICKETS & EVENTS',    icon: '🎟️' },
];

const TYPE_BADGE     = { document: '📄', contact: '👤', account: '🏦', policy: '🛡️' };
const PRIORITY_BADGE = { normal: '🟢', important: '🟡', critical: '🔴' };

function Dashboard({ user, token, onLogout }) {
  const [categories, setCategories]       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem]   = useState(null);
  const [items, setItems]                 = useState([]);
  const [allItems, setAllItems]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [currentView, setCurrentView]     = useState('my-data');

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  /* ── Fetch all items (powers overview + badges) ─────── */
  const fetchAllItems = useCallback(async () => {
    try {
      const res  = await fetch('/api/items/all', { headers: authHeaders });
      const data = await res.json();
      setAllItems(Array.isArray(data) ? data : []);
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const fetchCategories = useCallback(async () => {
    try {
      const res  = await fetch('/api/categories', { headers: authHeaders });
      const data = await res.json();
      setCategories(data);
    } catch (_) {
      setError('Failed to load categories');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    fetchCategories();
    fetchAllItems();
  }, [fetchCategories, fetchAllItems]);

  /* ── Category helpers ───────────────────────────────── */
  const createCategory = async (categoryName) => {
    try {
      const res  = await fetch('/api/categories', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body:    JSON.stringify({ category_name: categoryName }),
      });
      const data = await res.json();
      setCategories(prev => [...prev, data]);
      return data;
    } catch (_) {
      setError('Failed to create category');
    }
  };

  const selectCategory = async (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setLoading(true);
    try {
      const res  = await fetch(`/api/categories/${category.id}/items`, { headers: authHeaders });
      const data = await res.json();
      setItems(data);
    } catch (_) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const openCategory = async (catName) => {
    let category = categories.find(c => c.category_name === catName);
    if (!category) category = await createCategory(catName);
    if (category) {
      selectCategory(category);
      setCurrentView('my-data');
    }
  };

  /* ── Item CRUD ──────────────────────────────────────── */
  const createItem = async (itemData, files = []) => {
    try {
      const res  = await fetch(`/api/categories/${selectedCategory.id}/items`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body:    JSON.stringify(itemData),
      });
      const data = await res.json();
      const newItem = { id: data.id, ...itemData };
      setItems(prev => [...prev, newItem]);
      setSelectedItem(newItem);

      // Upload files if provided
      if (files.length > 0) {
        for (const file of files) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          try {
            await fetch(`/api/items/${data.id}/upload`, {
              method: 'POST',
              headers: { 'Authorization': `Bearer ${token}` },
              body: uploadFormData
            });
          } catch (uploadErr) {
            console.error(`Failed to upload file: ${file.name}`);
          }
        }
      }

      fetchAllItems();
    } catch (_) {
      setError('Failed to create item');
    }
  };

  const updateItem = async (itemId, itemData) => {
    try {
      await fetch(`/api/items/${itemId}`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body:    JSON.stringify(itemData),
      });
      setItems(items.map(i => i.id === itemId ? { ...i, ...itemData } : i));
      setSelectedItem({ ...selectedItem, ...itemData });
      fetchAllItems();
    } catch (_) {
      setError('Failed to update item');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await fetch(`/api/items/${itemId}`, {
        method: 'DELETE', headers: authHeaders,
      });
      setItems(items.filter(i => i.id !== itemId));
      setSelectedItem(null);
      fetchAllItems();
    } catch (_) {
      setError('Failed to delete item');
    }
  };

  /* ── Sidebar badge count — from categories query (always accurate) ── */
  const itemCountFor    = (catName) => {
    const cat = categories.find(c => c.category_name === catName);
    return cat ? (cat.item_count || 0) : 0;
  };

  /* ── Overview preview titles — from allItems join ─────────────────── */
  const previewItemsFor = (catName) => allItems.filter(i => i.category_name === catName);

  /* ── Overview panel ─────────────────────────────────── */
  const renderOverview = () => {
    const total    = categories.reduce((sum, c) => sum + (c.item_count || 0), 0);
    const critical = allItems.filter(i => i.priority === 'critical');

    return (
      <div className="overview-panel">
        <div className="overview-header">
          <h2 className="overview-title">Welcome back, {user.username}</h2>
          <p className="overview-subtitle">
            {total === 0
              ? 'No records yet — select a category below to add your first entry'
              : `${total} record${total !== 1 ? 's' : ''} stored across your categories`}
          </p>
        </div>

        {critical.length > 0 && (
          <div className="critical-alert">
            <span>🔴</span>
            <div>
              <strong>Critical records: </strong>
              {critical.map(i => i.title).join(', ')}
            </div>
          </div>
        )}

        <div className="overview-grid">
          {CATEGORIES.map(cat => {
            const catItems = previewItemsFor(cat.name);
            const count    = itemCountFor(cat.name);
            return (
              <div
                key={cat.name}
                className={`overview-card ${count === 0 ? 'empty' : ''}`}
                onClick={() => openCategory(cat.name)}
              >
                <div className="ov-card-top">
                  <span className="ov-icon">{cat.icon}</span>
                  <span className="ov-count">{count}</span>
                </div>
                <div className="ov-name">{cat.name}</div>
                <div className="ov-items">
                  {count === 0 ? (
                    <span className="ov-empty-hint">No records — click to add</span>
                  ) : (
                    catItems.slice(0, 3).map(item => (
                      <div key={item.id} className="ov-item-row">
                        <span className="ov-item-icon">{TYPE_BADGE[item.item_type] || '📄'}</span>
                        <span className="ov-item-title">{item.title}</span>
                        <span className="ov-item-priority">{PRIORITY_BADGE[item.priority] || '🟢'}</span>
                      </div>
                    ))
                  )}
                  {count > 3 && (
                    <span className="ov-more">+{count - 3} more</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ICOE</h1>
        <div className="header-right">
          <div className="header-user">
            <div className="user-avatar">{user.username ? user.username[0].toUpperCase() : 'U'}</div>
            <span>{user.username}</span>
          </div>
          <button onClick={onLogout} className="logout-btn">Sign Out</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-container">
        <aside className="sidebar">
          <button
            className={`sidebar-home-btn ${!selectedCategory && currentView === 'my-data' ? 'active' : ''}`}
            onClick={() => { setSelectedCategory(null); setCurrentView('my-data'); }}
          >
            🏠 <span>Overview</span>
          </button>

          <div className="sidebar-label">Categories</div>
          <div className="categories-buttons">
            {CATEGORIES.map(cat => {
              const count = itemCountFor(cat.name);
              return (
                <button
                  key={cat.name}
                  className={`category-btn ${selectedCategory?.category_name === cat.name ? 'active' : ''}`}
                  onClick={() => openCategory(cat.name)}
                >
                  <span className="cat-icon">{cat.icon}</span>
                  <span className="cat-label">{cat.name}</span>
                  {count > 0 && <span className="cat-badge">{count}</span>}
                </button>
              );
            })}
          </div>
        </aside>

        <main className="main-content">
          <div className="tabs">
            <button className={`tab-btn ${currentView === 'my-data' ? 'active' : ''}`} onClick={() => setCurrentView('my-data')}>My Data</button>
            <button className={`tab-btn ${currentView === 'share' ? 'active' : ''}`} onClick={() => setCurrentView('share')}>Share Data</button>
            <button className={`tab-btn ${currentView === 'manage' ? 'active' : ''}`} onClick={() => setCurrentView('manage')}>Manage Access</button>
            <button className={`tab-btn ${currentView === 'pending-invites' ? 'active' : ''}`} onClick={() => setCurrentView('pending-invites')}>Pending Invites</button>
            <button className={`tab-btn ${currentView === 'shared-with-me' ? 'active' : ''}`} onClick={() => setCurrentView('shared-with-me')}>Shared With Me</button>
          </div>

          {currentView === 'my-data' ? (
            selectedCategory ? (
              <div>
                <CategoryList
                  items={items}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  onCreateItem={createItem}
                  loading={loading}
                />
                {selectedItem && (
                  <ItemDetail
                    item={selectedItem}
                    token={token}
                    onUpdate={updateItem}
                    onDelete={deleteItem}
                  />
                )}
              </div>
            ) : renderOverview()
          ) : currentView === 'share' ? (
            <ShareData />
          ) : currentView === 'manage' ? (
            <ManageAccess />
          ) : currentView === 'pending-invites' ? (
            <PendingInvites />
          ) : (
            <SharedWithMe />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
