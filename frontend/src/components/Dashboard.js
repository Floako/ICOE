import React, { useState, useEffect, useCallback } from 'react';
import './Dashboard.css';
import CategoryList from './CategoryList';
import ItemDetail from './ItemDetail';
import ShareData from './ShareData';
import ManageAccess from './ManageAccess';
import SharedWithMe from './SharedWithMe';
import PendingInvites from './PendingInvites';
import Icon from './Icons';

const CATEGORIES = [
  { name: 'LEGAL',               icon: 'legal' },
  { name: 'HEALTH',              icon: 'health' },
  { name: 'HOME & PROPERTY',     icon: 'homeProperty' },
  { name: 'FINANCE',             icon: 'finance' },
  { name: 'INSURANCE/ASSURANCE', icon: 'insurance' },
  { name: 'SERVICES',            icon: 'services' },
  { name: 'EMPLOYMENT',          icon: 'employment' },
  { name: 'FAMILY & DEPENDANTS', icon: 'family' },
  { name: 'TRANSPORT',           icon: 'transport' },
  { name: 'TRAVEL',              icon: 'travel' },
  { name: 'TICKETS & EVENTS',    icon: 'tickets' },
  { name: 'PETS',                icon: 'pets' },
  { name: 'EDUCATION',           icon: 'education' },
  { name: 'DIGITAL ACCOUNTS',    icon: 'digital' },
  { name: 'MEMBERSHIPS',         icon: 'memberships' },
];

const PRIORITY_COLORS = { normal: '#52c41a', important: '#e67e00', critical: '#e94560' };
const QUICK_ENTRY_EMPTY = {
  category_name: '',
  title: '',
  item_type: 'document',
  priority: 'normal',
  description: '',
  contact_name: '',
  contact_phone: '',
  contact_email: '',
  reference_number: '',
  start_date: '',
  expiry_date: '',
};

function Dashboard({ user, token, onLogout }) {
  const hasVaultAccess = user?.vault_access !== 'view_only';
  const [categories, setCategories]       = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedItem, setSelectedItem]   = useState(null);
  const [items, setItems]                 = useState([]);
  const [allItems, setAllItems]           = useState([]);
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState('');
  const [currentView, setCurrentView]     = useState(hasVaultAccess ? 'my-data' : 'shared-with-me');
  const [accessRequestStatus, setAccessRequestStatus] = useState(hasVaultAccess ? 'approved' : 'not_requested');
  const [accessRequestMessage, setAccessRequestMessage] = useState('');
  const [requestingAccess, setRequestingAccess] = useState(false);
  const [quickEntry, setQuickEntry] = useState(QUICK_ENTRY_EMPTY);
  const [quickFiles, setQuickFiles] = useState([]);
  const [quickSaving, setQuickSaving] = useState(false);
  const [quickMessage, setQuickMessage] = useState('');

  const authHeaders = { 'Authorization': `Bearer ${token}` };

  /* ── Fetch all items (powers overview + badges) ─────── */
  const fetchAllItems = useCallback(async () => {
    if (!hasVaultAccess) {
      setAllItems([]);
      return;
    }

    try {
      const res  = await fetch('/api/items/all', { headers: authHeaders });
      const data = await res.json();
      setAllItems(Array.isArray(data) ? data : []);
    } catch (_) {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVaultAccess, token]);

  const fetchCategories = useCallback(async () => {
    if (!hasVaultAccess) {
      setCategories([]);
      return;
    }

    try {
      const res  = await fetch('/api/categories', { headers: authHeaders });
      const data = await res.json();
      setCategories(data);
    } catch (_) {
      setError('Failed to load categories');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasVaultAccess, token]);

  const fetchAccessRequestStatus = useCallback(async () => {
    if (hasVaultAccess) {
      setAccessRequestStatus('approved');
      return;
    }

    try {
      const res = await fetch('/api/account-access/status', { headers: authHeaders });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to load account access status');
      }

      setAccessRequestStatus(data.request_status || 'not_requested');
    } catch (err) {
      setError(err.message || 'Failed to load account access status');
    }
  }, [authHeaders, hasVaultAccess]);

  useEffect(() => {
    if (hasVaultAccess) {
      fetchCategories();
      fetchAllItems();
      return;
    }

    setSelectedCategory(null);
    setSelectedItem(null);
    setItems([]);
    setCategories([]);
    setAllItems([]);
    setCurrentView(prev => (prev === 'request-access' ? prev : 'shared-with-me'));
    fetchAccessRequestStatus();
  }, [fetchCategories, fetchAllItems, fetchAccessRequestStatus, hasVaultAccess]);

  /* ── Fetch with timeout (10 s) to prevent indefinite hangs ── */
  const fetchWithTimeout = (url, options = {}, ms = 10000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), ms);
    return fetch(url, { ...options, signal: controller.signal })
      .finally(() => clearTimeout(id));
  };

  /* ── Category helpers ───────────────────────────────── */
  const createCategory = async (categoryName) => {
    try {
      const res  = await fetchWithTimeout('/api/categories', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body:    JSON.stringify({ category_name: categoryName }),
      });
      const data = await res.json();
      setCategories(prev => [...prev, data]);
      return data;
    } catch (err) {
      const msg = err.name === 'AbortError' ? 'Request timed out. Is the backend running?' : 'Failed to create category';
      setError(msg);
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

  const openQuickAddForCategory = (categoryName) => {
    setSelectedCategory(null);
    setCurrentView('add-record');
    setQuickMessage('');
    setQuickEntry(prev => ({ ...prev, category_name: categoryName }));
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

  const createItemInCategory = async (categoryName, itemData, files = []) => {
    try {
      let category = categories.find(c => c.category_name === categoryName);
      if (!category) {
        category = await createCategory(categoryName);
      }
      if (!category) {
        throw new Error('Failed to find or create category');
      }

      const res = await fetchWithTimeout(`/api/categories/${category.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders },
        body: JSON.stringify(itemData),
      });
      if (res.status === 0 || !res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to create record');
      }
      const data = await res.json();

      if (files.length > 0) {
        for (const file of files) {
          const uploadFormData = new FormData();
          uploadFormData.append('file', file);
          await fetch(`/api/items/${data.id}/upload`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: uploadFormData,
          });
        }
      }

      // Refresh data in background — don't await so a slow network can't stall the UI
      fetchCategories();
      fetchAllItems();
      return { ok: true };
    } catch (err) {
      return { ok: false, error: err.message || 'Failed to create record' };
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

  const requestVaultAccess = async () => {
    setAccessRequestMessage('');
    setRequestingAccess(true);

    try {
      const res = await fetch('/api/account-access/request', {
        method: 'POST',
        headers: authHeaders,
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to request vault access');
      }

      setAccessRequestStatus(data.request_status || 'pending');
      setAccessRequestMessage(data.message || 'Vault access request submitted.');
    } catch (err) {
      setError(err.message || 'Failed to request vault access');
    } finally {
      setRequestingAccess(false);
    }
  };

  const setQuickField = (field, value) => {
    setQuickEntry(prev => ({ ...prev, [field]: value }));
  };

  const handleQuickFileSelect = (e) => {
    setQuickFiles(Array.from(e.target.files || []));
  };

  const removeQuickFile = (index) => {
    setQuickFiles(prev => prev.filter((_, i) => i !== index));
  };

  const submitQuickEntry = async (e) => {
    e.preventDefault();
    setError('');
    setQuickMessage('');

    const categoryName = quickEntry.category_name;
    const title = (quickEntry.title || '').trim();
    if (!categoryName || !title) {
      setError('Category and title are required.');
      return;
    }

    setQuickSaving(true);
    const payload = {
      ...quickEntry,
      category_name: categoryName,
      title,
      description: (quickEntry.description || '').trim(),
      contact_name: (quickEntry.contact_name || '').trim(),
      contact_phone: (quickEntry.contact_phone || '').trim(),
      contact_email: (quickEntry.contact_email || '').trim(),
      reference_number: (quickEntry.reference_number || '').trim(),
    };

    let result;
    try {
      result = await createItemInCategory(categoryName, payload, quickFiles);
    } catch (err) {
      setError(err.message || 'Failed to create record');
      setQuickSaving(false);
      return;
    } finally {
      setQuickSaving(false);
    }

    if (!result.ok) {
      setError(result.error || 'Failed to create record');
      return;
    }

    setQuickMessage(`Saved to ${categoryName}.`);
    setQuickEntry(QUICK_ENTRY_EMPTY);
    setQuickFiles([]);
  };

  const cancelQuickEntry = () => {
    setError('');
    setQuickMessage('');
    setQuickFiles([]);
    setQuickEntry(QUICK_ENTRY_EMPTY);
    setSelectedCategory(null);
    setCurrentView('my-data');
  };

  /* ── Sidebar badge count — from categories query (always accurate) ── */
  const itemCountFor    = (catName) => {
    const cat = categories.find(c => c.category_name === catName);
    return cat ? (cat.item_count || 0) : 0;
  };

  /* ── Overview preview titles — from allItems join ─────────────────── */
  const previewItemsFor = (catName) => allItems.filter(i => i.category_name === catName);

  /* ── Overview panel ─────────────────────────────────── */
  const renderQuickEntryPanel = () => (
    <div className="quick-entry-panel">
      <div className="quick-entry-header">
        <h3>Quick Add Entry</h3>
        <p>Use one form for all records. Choose the category and save.</p>
      </div>

      <form className="quick-entry-form" onSubmit={submitQuickEntry}>
        <div className="quick-grid quick-grid-main">
          <div className="quick-field">
            <label>Category</label>
            <select
              value={quickEntry.category_name}
              onChange={(e) => setQuickField('category_name', e.target.value)}
              required
            >
              <option value="" disabled>Select a category</option>
              {CATEGORIES.map(cat => (
                <option key={cat.name} value={cat.name}>{cat.name}</option>
              ))}
              <option value="OTHER">OTHER</option>
            </select>
          </div>

          <div className="quick-field">
            <label>Record Type</label>
            <select
              value={quickEntry.item_type}
              onChange={(e) => setQuickField('item_type', e.target.value)}
            >
              <option value="document">Document</option>
              <option value="contact">Contact</option>
              <option value="account">Account</option>
              <option value="policy">Policy</option>
            </select>
          </div>

          <div className="quick-field">
            <label>Priority</label>
            <select
              value={quickEntry.priority}
              onChange={(e) => setQuickField('priority', e.target.value)}
            >
              <option value="normal">Normal</option>
              <option value="important">Important</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div className="quick-field quick-field-wide">
            <label>Title</label>
            <input
              type="text"
              value={quickEntry.title}
              onChange={(e) => setQuickField('title', e.target.value)}
              placeholder="e.g. Dr Murphy Contact, Prescription Scan, Blood Type"
              required
            />
          </div>
        </div>

        <div className="quick-grid">
          <div className="quick-field quick-field-wide">
            <label>Description</label>
            <textarea
              rows={2}
              value={quickEntry.description}
              onChange={(e) => setQuickField('description', e.target.value)}
              placeholder="Notes, instructions, location, or key details"
            />
          </div>

          <div className="quick-field">
            <label>Contact Name</label>
            <input
              type="text"
              value={quickEntry.contact_name}
              onChange={(e) => setQuickField('contact_name', e.target.value)}
              placeholder="Doctor, solicitor, provider"
            />
          </div>

          <div className="quick-field">
            <label>Contact Phone</label>
            <input
              type="tel"
              value={quickEntry.contact_phone}
              onChange={(e) => setQuickField('contact_phone', e.target.value)}
              placeholder="+44 7700 900000"
            />
          </div>

          <div className="quick-field">
            <label>Contact Email</label>
            <input
              type="email"
              value={quickEntry.contact_email}
              onChange={(e) => setQuickField('contact_email', e.target.value)}
              placeholder="contact@example.com"
            />
          </div>

          <div className="quick-field">
            <label>Reference</label>
            <input
              type="text"
              value={quickEntry.reference_number}
              onChange={(e) => setQuickField('reference_number', e.target.value)}
              placeholder="Policy / account / case number"
            />
          </div>

          <div className="quick-field">
            <label>Start Date</label>
            <input
              type="date"
              value={quickEntry.start_date}
              onChange={(e) => setQuickField('start_date', e.target.value)}
            />
          </div>

          <div className="quick-field">
            <label>Expiry / Renewal Date</label>
            <input
              type="date"
              value={quickEntry.expiry_date}
              onChange={(e) => setQuickField('expiry_date', e.target.value)}
            />
          </div>
        </div>

        <div className="quick-files">
          <label htmlFor="quick-entry-files" className="quick-file-label">Add attachments</label>
          <input
            id="quick-entry-files"
            type="file"
            multiple
            onChange={handleQuickFileSelect}
          />
          {quickFiles.length > 0 && (
            <div className="quick-file-list">
              {quickFiles.map((file, idx) => (
                <div key={`${file.name}-${idx}`} className="quick-file-item">
                  <span>{file.name}</span>
                  <button type="button" onClick={() => removeQuickFile(idx)}>Remove</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="quick-actions">
          {quickMessage && <span className="quick-success">{quickMessage}</span>}
          <div className="quick-actions-buttons">
            <button type="button" className="quick-cancel-btn" onClick={cancelQuickEntry} disabled={quickSaving}>
              Cancel
            </button>
            <button type="submit" disabled={quickSaving}>
              {quickSaving ? 'Saving...' : 'Save Entry'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderOverview = () => {
    const total    = categories.reduce((sum, c) => sum + (c.item_count || 0), 0);
    const critical = allItems.filter(i => i.priority === 'critical');

    return (
      <div className="overview-panel">
        <div className="overview-header">
          <h2 className="overview-title">Welcome back, {user.username}</h2>
          <p className="overview-subtitle">
            {total === 0
              ? 'No records yet — choose Add Record to save your first entry'
              : `${total} record${total !== 1 ? 's' : ''} stored across your categories`}
          </p>
        </div>

        {critical.length > 0 && (
          <div className="critical-alert">
            <span className="critical-dot" />
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
                onClick={() => (count === 0 ? openQuickAddForCategory(cat.name) : openCategory(cat.name))}
              >
                <div className="ov-card-top">
                  <span className="ov-icon"><Icon name={cat.icon} size={20} /></span>
                  <span className="ov-count">{count}</span>
                </div>
                <div className="ov-name">{cat.name}</div>
                <div className="ov-items">
                  {count === 0 ? (
                    <button
                      type="button"
                      className="ov-empty-hint"
                      onClick={(e) => {
                        e.stopPropagation();
                        openQuickAddForCategory(cat.name);
                      }}
                    >
                      No records - Add record
                    </button>
                  ) : (
                    catItems.slice(0, 3).map(item => (
                      <div key={item.id} className="ov-item-row">
                        <span className="ov-item-icon"><Icon name={item.item_type || 'document'} size={13} strokeWidth={1.5} /></span>
                        <span className="ov-item-title">{item.title}</span>
                        <span className="priority-dot" style={{ background: PRIORITY_COLORS[item.priority] || '#52c41a' }} />
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

  const renderRequestAccessPanel = () => {
    const statusLabel = accessRequestStatus === 'pending'
      ? 'Access request pending'
      : accessRequestStatus === 'approved'
        ? 'Vault access approved'
        : 'Request your own vault';

    return (
      <div className="access-panel">
        <div className="access-panel-card">
          <div className="access-panel-badge">View Only</div>
          <h2>{statusLabel}</h2>
          <p>
            This account can currently view data shared with you, but cannot create or manage a personal vault yet.
            If you want your own private data store inside ICOE, submit a request below.
          </p>

          {accessRequestMessage && <div className="access-panel-message">{accessRequestMessage}</div>}

          {accessRequestStatus === 'pending' ? (
            <div className="access-panel-status">
              Your request has been submitted and is waiting for approval.
            </div>
          ) : (
            <button
              className="access-panel-btn"
              onClick={requestVaultAccess}
              disabled={requestingAccess}
            >
              {requestingAccess ? 'Submitting...' : 'Request Own Vault Access'}
            </button>
          )}
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
          {hasVaultAccess ? (
            <>
              <button
                className={`sidebar-home-btn ${!selectedCategory && currentView === 'my-data' ? 'active' : ''}`}
                onClick={() => { setSelectedCategory(null); setCurrentView('my-data'); }}
              >
                <Icon name="home" size={15} /><span>Overview</span>
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
                      <span className="cat-icon"><Icon name={cat.icon} size={15} /></span>
                      <span className="cat-label">{cat.name}</span>
                      {count > 0 && <span className="cat-badge">{count}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="sidebar-view-only">
              <div className="sidebar-label">Account Access</div>
              <div className="view-only-card">
                <strong>Shared Data Viewer</strong>
                <p>You can view information shared with you. Your own vault stays locked until access is approved.</p>
              </div>
            </div>
          )}
        </aside>

        <main className="main-content">
          <div className="tabs">
            {hasVaultAccess && <button className={`tab-btn ${currentView === 'my-data' ? 'active' : ''}`} onClick={() => setCurrentView('my-data')}>My Data</button>}
            {hasVaultAccess && <button className={`tab-btn ${currentView === 'add-record' ? 'active' : ''}`} onClick={() => setCurrentView('add-record')}>Add Record</button>}
            {hasVaultAccess && <button className={`tab-btn ${currentView === 'share' ? 'active' : ''}`} onClick={() => setCurrentView('share')}>Share Data</button>}
            {hasVaultAccess && <button className={`tab-btn ${currentView === 'manage' ? 'active' : ''}`} onClick={() => setCurrentView('manage')}>Manage Access</button>}
            {hasVaultAccess && <button className={`tab-btn ${currentView === 'pending-invites' ? 'active' : ''}`} onClick={() => setCurrentView('pending-invites')}>Pending Invites</button>}
            <button className={`tab-btn ${currentView === 'shared-with-me' ? 'active' : ''}`} onClick={() => setCurrentView('shared-with-me')}>Shared With Me</button>
            {!hasVaultAccess && <button className={`tab-btn ${currentView === 'request-access' ? 'active' : ''}`} onClick={() => setCurrentView('request-access')}>Own Vault Access</button>}
          </div>

          {hasVaultAccess && currentView === 'my-data' ? (
            selectedCategory ? (
              <div>
                <CategoryList
                  items={items}
                  selectedItem={selectedItem}
                  onSelectItem={setSelectedItem}
                  onCreateItem={createItem}
                  onOpenAddRecord={openQuickAddForCategory}
                  loading={loading}
                  categoryName={selectedCategory?.category_name}
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
          ) : hasVaultAccess && currentView === 'add-record' ? (
            renderQuickEntryPanel()
          ) : currentView === 'share' ? (
            <ShareData />
          ) : currentView === 'manage' ? (
            <ManageAccess />
          ) : currentView === 'pending-invites' ? (
            <PendingInvites />
          ) : currentView === 'request-access' ? (
            renderRequestAccessPanel()
          ) : (
            <SharedWithMe />
          )}
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
