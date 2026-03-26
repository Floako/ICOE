import React, { useState, useEffect, useCallback } from 'react';
import './ItemDetail.css';

const ITEM_TYPES = [
  { value: 'document',  label: '📄 Document' },
  { value: 'contact',   label: '👤 Contact' },
  { value: 'account',   label: '🏦 Account' },
  { value: 'policy',    label: '🛡️ Policy' },
];

const PRIORITY_LEVELS = [
  { value: 'normal',    label: 'Normal',    color: '#52c41a' },
  { value: 'important', label: 'Important', color: '#faad14' },
  { value: 'critical',  label: 'Critical',  color: '#e94560' },
];

function ItemDetail({ item, token, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(`/api/items/${item.id}/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files');
    }
  }, [item.id, token]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleUpdate = () => {
    onUpdate(item.id, formData);
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure?')) {
      onDelete(item.id);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    try {
      const response = await fetch(`/api/items/${item.id}/upload`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataUpload
      });
      const data = await response.json();
      setFiles([...files, data]);
    } catch (err) {
      console.error('Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    try {
      await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setFiles(files.filter(f => f.id !== fileId));
    } catch (err) {
      console.error('Delete failed');
    }
  };

  return (
    <div className="item-detail">
      <div className="detail-header">
        <h2>{item.title}</h2>
        <div className="detail-actions">
          {!isEditing && (
            <>
              <button onClick={() => setIsEditing(true)} className="edit-btn">Edit</button>
              <button onClick={handleDelete} className="delete-btn">Delete</button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form className="edit-form">
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Record Type</label>
            <div className="edit-radio-group">
              {ITEM_TYPES.map(t => (
                <label
                  key={t.value}
                  className={`edit-radio-pill ${formData.item_type === t.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="item_type"
                    value={t.value}
                    checked={formData.item_type === t.value}
                    onChange={() => setFormData({ ...formData, item_type: t.value })}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="edit-radio-group">
              {PRIORITY_LEVELS.map(p => (
                <label
                  key={p.value}
                  className={`edit-radio-pill ${formData.priority === p.value ? 'selected' : ''}`}
                  style={formData.priority === p.value ? { borderColor: p.color, color: p.color, background: p.color + '18' } : {}}
                >
                  <input
                    type="radio"
                    name="priority"
                    value={p.value}
                    checked={formData.priority === p.value}
                    onChange={() => setFormData({ ...formData, priority: p.value })}
                  />
                  {p.label}
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="contact-section">
            <h4>Contact Information (optional)</h4>
            <div className="form-group">
              <label>Name</label>
              <input
                type="text"
                value={formData.contact_name || ''}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                value={formData.contact_phone || ''}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Address</label>
              <input
                type="text"
                value={formData.contact_address || ''}
                onChange={(e) => setFormData({ ...formData, contact_address: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.contact_email || ''}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
              />
            </div>
          </div>
          
          <div className="form-group">
            <label>Reference Number</label>
            <input
              type="text"
              value={formData.reference_number || ''}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Start Date</label>
            <input
              type="date"
              value={formData.start_date ? formData.start_date.substring(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Expiry / Renewal Date</label>
            <input
              type="date"
              value={formData.expiry_date ? formData.expiry_date.substring(0, 10) : ''}
              onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleUpdate}>Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="detail-info">
          <div className="info-badges">
            {(() => {
              const t = ITEM_TYPES.find(x => x.value === formData.item_type);
              const p = PRIORITY_LEVELS.find(x => x.value === formData.priority);
              return (
                <>
                  {t && <span className="badge-type">{t.label}</span>}
                  {p && <span className="badge-priority" style={{ borderColor: p.color, color: p.color, background: p.color + '18' }}>{p.label}</span>}
                </>
              );
            })()}
          </div>
          {formData.description && (
            <div className="info-item">
              <strong>Description:</strong>
              <p>{formData.description}</p>
            </div>
          )}
          
          {(formData.contact_name || formData.contact_phone || formData.contact_address || formData.contact_email) && (
            <div className="info-item">
              <strong>Contact Information:</strong>
              <div className="contact-details">
                {formData.contact_name && <p><strong>Name:</strong> {formData.contact_name}</p>}
                {formData.contact_phone && <p><strong>Phone:</strong> {formData.contact_phone}</p>}
                {formData.contact_address && <p><strong>Address:</strong> {formData.contact_address}</p>}
                {formData.contact_email && <p><strong>Email:</strong> {formData.contact_email}</p>}
              </div>
            </div>
          )}
          
          {formData.reference_number && (
            <div className="info-item">
              <strong>Reference:</strong>
              <p>{formData.reference_number}</p>
            </div>
          )}
          {(formData.start_date || formData.expiry_date) && (
            <div className="info-item">
              <strong>Dates:</strong>
              <div className="contact-details">
                {formData.start_date && <p><strong>Start:</strong> {new Date(formData.start_date).toLocaleDateString()}</p>}
                {formData.expiry_date && <p><strong>Expiry / Renewal:</strong> {new Date(formData.expiry_date).toLocaleDateString()}</p>}
              </div>
            </div>
          )}
        </div>
      )}

      <div className="files-section">
        <h3>Documents</h3>
        <div className="file-upload">
          <input
            type="file"
            id="file-input"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-input">
            {uploading ? 'Uploading...' : 'Upload Scan/Document'}
          </label>
        </div>
        
        {files.length > 0 && (
          <div className="files-list">
            {files.map(file => (
              <div key={file.id} className="file-item">
                <a href={file.url ? (file.url.startsWith('/uploads/') ? `http://localhost:5000${file.url}` : file.url) : '#'} target="_blank" rel="noopener noreferrer">
                  {file.original_filename}
                </a>
                <button onClick={() => handleDeleteFile(file.id)} className="delete-file-btn">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ItemDetail;
