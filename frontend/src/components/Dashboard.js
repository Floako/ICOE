import React, { useState, useEffect } from 'react';
import './Dashboard.css';
import CategoryList from './CategoryList';
import ItemDetail from './ItemDetail';
import ShareData from './ShareData';
import ManageAccess from './ManageAccess';
import SharedWithMe from './SharedWithMe';
import PendingInvites from './PendingInvites';

const CATEGORIES = [
  'LEGAL',
  'HEALTH',
  'FINANCE',
  'SERVICES',
  'INSURANCE',
  'MEMBERSHIPS'
];

function Dashboard({ user, token, onLogout }) {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('my-data'); // my-data, share, manage, pending-invites, shared-with-me

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
    }
  };

  useEffect(() => {
    fetchCategories();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createCategory = async (categoryName) => {
    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ category_name: categoryName })
      });
      const data = await response.json();
      setCategories([...categories, data]);
    } catch (err) {
      setError('Failed to create category');
    }
  };

  const selectCategory = async (category) => {
    setSelectedCategory(category);
    setSelectedItem(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${category.id}/items`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setItems(data);
    } catch (err) {
      setError('Failed to load items');
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await fetch(`/api/categories/${selectedCategory.id}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });
      const data = await response.json();
      setItems([...items, { id: data.id, ...itemData }]);
      setSelectedItem({ id: data.id, ...itemData });
    } catch (err) {
      setError('Failed to create item');
    }
  };

  const updateItem = async (itemId, itemData) => {
    try {
      await fetch(`/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });
      setItems(items.map(item => item.id === itemId ? { ...item, ...itemData } : item));
      setSelectedItem({ ...selectedItem, ...itemData });
    } catch (err) {
      setError('Failed to update item');
    }
  };

  const deleteItem = async (itemId) => {
    try {
      await fetch(`/api/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setItems(items.filter(item => item.id !== itemId));
      setSelectedItem(null);
    } catch (err) {
      setError('Failed to delete item');
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>ICOE</h1>
        <div className="header-right">
          <span>Welcome, {user.username}</span>
          <button onClick={onLogout} className="logout-btn">Logout</button>
        </div>
      </header>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-container">
        <aside className="sidebar">
          <h3>Categories</h3>
          <div className="categories-buttons">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`category-btn ${selectedCategory?.category_name === cat ? 'active' : ''}`}
                onClick={() => {
                  let category = categories.find(c => c.category_name === cat);
                  if (!category) {
                    createCategory(cat);
                    category = { category_name: cat, id: Date.now() };
                  }
                  selectCategory(category);
                  setCurrentView('my-data');
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <main className="main-content">
          <div className="tabs">
            <button
              className={`tab-btn ${currentView === 'my-data' ? 'active' : ''}`}
              onClick={() => setCurrentView('my-data')}
            >
              My Data
            </button>
            <button
              className={`tab-btn ${currentView === 'share' ? 'active' : ''}`}
              onClick={() => setCurrentView('share')}
            >
              Share Data
            </button>
            <button
              className={`tab-btn ${currentView === 'manage' ? 'active' : ''}`}
              onClick={() => setCurrentView('manage')}
            >
              Manage Access
            </button>
            <button
              className={`tab-btn ${currentView === 'pending-invites' ? 'active' : ''}`}
              onClick={() => setCurrentView('pending-invites')}
            >
              Pending Invites
            </button>
            <button
              className={`tab-btn ${currentView === 'shared-with-me' ? 'active' : ''}`}
              onClick={() => setCurrentView('shared-with-me')}
            >
              Shared With Me
            </button>
          </div>

          {currentView === 'my-data' ? (
            !selectedCategory ? (
              <div className="welcome-message">
                <h2>Welcome to ICOE</h2>
                <p>Select a category on the left to get started</p>
              </div>
            ) : (
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
              currentView === 'pending-invites' ? (
            <PendingInvites />
          ) : </div>
            )
          ) : currentView === 'share' ? (
            <ShareData />
          ) : currentView === 'manage' ? (
            <ManageAccess />
          ) : (
            <SharedWithMe />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
