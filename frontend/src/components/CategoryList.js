import React, { useState } from 'react';
import './CategoryList.css';

const ITEM_TYPES = [
  { value: 'document',  label: '📄 Document',  desc: 'Certificates, wills, policies' },
  { value: 'contact',   label: '👤 Contact',   desc: 'Person or organisation details' },
  { value: 'account',   label: '🏦 Account',   desc: 'Bank, login or membership account' },
  { value: 'policy',    label: '🛡️ Policy',    desc: 'Insurance or coverage record' },
];

const PRIORITY_LEVELS = [
  { value: 'normal',    label: 'Normal',    color: '#52c41a' },
  { value: 'important', label: 'Important', color: '#faad14' },
  { value: 'critical',  label: 'Critical',  color: '#e94560' },
];

const EMPTY_FORM = {
  title: '',
  item_type: 'document',
  priority: 'normal',
  description: '',
  contact_name: '',
  contact_phone: '',
  contact_address: '',
  contact_email: '',
  reference_number: '',
};

const PRIORITY_BADGE = { normal: '🟢', important: '🟡', critical: '🔴' };
const TYPE_BADGE     = { document: '📄', contact: '👤', account: '🏦', policy: '🛡️' };

function CategoryList({ items, selectedItem, onSelectItem, onCreateItem, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateItem(formData);
    setFormData(EMPTY_FORM);
    setShowForm(false);
  };

  const handleCancel = () => {
    setFormData(EMPTY_FORM);
    setShowForm(false);
  };

  return (
    <div className="category-list-container">
      <div className="items-panel">

        {/* ── Panel Header ───────────────────────────────── */}
        <div className="panel-header">
          <h3>Records</h3>
          {!showForm && (
            <button onClick={() => setShowForm(true)} className="add-btn">
              + Add Record
            </button>
          )}
        </div>

        {/* ── Add Item Form ───────────────────────────────── */}
        {showForm && (
          <form onSubmit={handleSubmit} className="item-form">

            {/* Title */}
            <div className="form-section">
              <label className="field-label">Record Title <span className="required">*</span></label>
              <input
                type="text"
                className="field-input"
                placeholder="e.g. Life Insurance Policy, NHS Number, Will & Testament…"
                value={formData.title}
                onChange={(e) => set('title', e.target.value)}
                required
              />
            </div>

            {/* Type — radio cards */}
            <div className="form-section">
              <label className="field-label">Record Type</label>
              <div className="radio-card-group">
                {ITEM_TYPES.map(t => (
                  <label
                    key={t.value}
                    className={`radio-card ${formData.item_type === t.value ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="item_type"
                      value={t.value}
                      checked={formData.item_type === t.value}
                      onChange={() => set('item_type', t.value)}
                    />
                    <span className="rc-label">{t.label}</span>
                    <span className="rc-desc">{t.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Priority — radio pills */}
            <div className="form-section">
              <label className="field-label">Priority</label>
              <div className="priority-group">
                {PRIORITY_LEVELS.map(p => (
                  <label
                    key={p.value}
                    className={`priority-pill ${formData.priority === p.value ? 'selected' : ''}`}
                    style={formData.priority === p.value ? { borderColor: p.color, color: p.color, background: p.color + '18' } : {}}
                  >
                    <input
                      type="radio"
                      name="priority"
                      value={p.value}
                      checked={formData.priority === p.value}
                      onChange={() => set('priority', p.value)}
                    />
                    {p.label}
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-section">
              <label className="field-label">Notes / Description</label>
              <textarea
                className="field-input"
                rows={3}
                placeholder="Any important details, instructions or notes…"
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            {/* Contact section */}
            <div className="form-section">
              <div className="section-divider">
                <span>Contact Details <em>(optional)</em></span>
              </div>
              <div className="field-grid">
                <div className="field-group">
                  <label className="field-label">Full Name</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Contact or organisation name"
                    value={formData.contact_name}
                    onChange={(e) => set('contact_name', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Phone Number</label>
                  <input
                    type="tel"
                    className="field-input"
                    placeholder="+44 7700 900000"
                    value={formData.contact_phone}
                    onChange={(e) => set('contact_phone', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Email Address</label>
                  <input
                    type="email"
                    className="field-input"
                    placeholder="contact@example.com"
                    value={formData.contact_email}
                    onChange={(e) => set('contact_email', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">Reference / Policy No.</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Account or reference number"
                    value={formData.reference_number}
                    onChange={(e) => set('reference_number', e.target.value)}
                  />
                </div>
                <div className="field-group full-width">
                  <label className="field-label">Address</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder="Street, City, Postcode"
                    value={formData.contact_address}
                    onChange={(e) => set('contact_address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="form-actions">
              <button type="button" className="btn-secondary" onClick={handleCancel}>Cancel</button>
              <button type="submit" className="btn-primary">Save Record</button>
            </div>
          </form>
        )}

        {/* ── Items List ───────────────────────────────────── */}
        <div className="items-list">
          {loading ? (
            <div className="state-msg">
              <span className="spinner">⟳</span> Loading records…
            </div>
          ) : items.length === 0 ? (
            <div className="state-msg empty">
              <div className="state-icon">📂</div>
              <p>No records yet</p>
              <small>Click <strong>+ Add Record</strong> to store your first entry</small>
            </div>
          ) : (
            items.map(item => {
              const contactLine = [item.contact_name, item.contact_phone, item.contact_email]
                .filter(Boolean).join(' · ');

              return (
                <div
                  key={item.id}
                  className={`item-card ${selectedItem?.id === item.id ? 'active' : ''}`}
                  onClick={() => onSelectItem(item)}
                >
                  <div className="item-card-top">
                    <span className="item-type-badge">{TYPE_BADGE[item.item_type] || '📄'}</span>
                    <h4 className="item-title">{item.title}</h4>
                    <span className="item-priority">{PRIORITY_BADGE[item.priority] || '🟢'}</span>
                  </div>
                  {contactLine && <p className="item-contact">{contactLine}</p>}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}

export default CategoryList;

