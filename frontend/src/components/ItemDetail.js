import React, { useState, useEffect } from 'react';
import './ItemDetail.css';

function ItemDetail({ item, token, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(item);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [item.id]);

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/items/${item.id}/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Failed to load files');
    }
  };

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
            <label>Description</label>
            <textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Contact Info</label>
            <input
              type="text"
              value={formData.contact_info || ''}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label>Reference Number</label>
            <input
              type="text"
              value={formData.reference_number || ''}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleUpdate}>Save</button>
            <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
          </div>
        </form>
      ) : (
        <div className="detail-info">
          {formData.description && (
            <div className="info-item">
              <strong>Description:</strong>
              <p>{formData.description}</p>
            </div>
          )}
          {formData.contact_info && (
            <div className="info-item">
              <strong>Contact Info:</strong>
              <p>{formData.contact_info}</p>
            </div>
          )}
          {formData.reference_number && (
            <div className="info-item">
              <strong>Reference:</strong>
              <p>{formData.reference_number}</p>
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
                <a href={file.url} target="_blank" rel="noopener noreferrer">
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
