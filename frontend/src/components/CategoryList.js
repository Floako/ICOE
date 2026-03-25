import React, { useState } from 'react';
import './CategoryList.css';

function CategoryList({ items, selectedItem, onSelectItem, onCreateItem, loading }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    contact_info: '',
    reference_number: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateItem(formData);
    setFormData({ title: '', description: '', contact_info: '', reference_number: '' });
    setShowForm(false);
  };

  return (
    <div className="category-list-container">
      <div className="items-panel">
        <div className="panel-header">
          <h3>Items</h3>
          <button onClick={() => setShowForm(!showForm)} className="add-btn">+ Add Item</button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="item-form">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
            <textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <input
              type="text"
              placeholder="Contact Info"
              value={formData.contact_info}
              onChange={(e) => setFormData({ ...formData, contact_info: e.target.value })}
            />
            <input
              type="text"
              placeholder="Reference Number"
              value={formData.reference_number}
              onChange={(e) => setFormData({ ...formData, reference_number: e.target.value })}
            />
            <button type="submit">Create Item</button>
            <button type="button" onClick={() => setShowForm(false)}>Cancel</button>
          </form>
        )}

        <div className="items-list">
          {loading ? (
            <p>Loading...</p>
          ) : items.length === 0 ? (
            <p className="empty">No items yet. Add one to get started!</p>
          ) : (
            items.map(item => (
              <div
                key={item.id}
                className={`item-card ${selectedItem?.id === item.id ? 'active' : ''}`}
                onClick={() => onSelectItem(item)}
              >
                <h4>{item.title}</h4>
                <p>{item.contact_info}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryList;
