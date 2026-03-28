import React, { useState } from 'react';
import './CategoryList.css';
import Icon from './Icons';

const ITEM_TYPES = [
  { value: 'document',  label: 'Document',  desc: 'Scans, letters or key reference information' },
  { value: 'contact',   label: 'Contact',   desc: 'Person, clinic, provider or service details' },
  { value: 'account',   label: 'Account',   desc: 'Membership, utility or customer record' },
  { value: 'policy',    label: 'Policy',    desc: 'Cover, warranty or renewal record' },
];

const ITEM_TYPE_CONFIG = {
  document: {
    introTitle: 'Document record',
    introText: 'Start with the kind of record, then give the document a clear name so it is easy to recognise later.',
    primaryLabel: 'Document Title',
    primaryPlaceholder: 'e.g. Will & Testament, Passport, Birth Certificate',
    notesLabel: 'Notes / Description',
    notesPlaceholder: 'Add anything useful about where it is stored, what it relates to, or what someone should know.',
    contactSectionLabel: 'Related Contact Details',
    contactNameLabel: 'Person or organisation',
    contactNamePlaceholder: 'Solicitor, registrar, embassy, provider',
    referenceLabel: 'Document / Reference No.',
    referencePlaceholder: 'Certificate, file or case reference',
    startDateLabel: 'Issue / Start Date',
    expiryDateLabel: 'Expiry / Renewal Date',
    addressLabel: 'Relevant Address',
    addressPlaceholder: 'Street, City, Postcode',
    attachmentText: 'Click to add scanned documents or images',
  },
  contact: {
    introTitle: 'Contact record',
    introText: 'Choose contact when the main thing you are storing is a person or organisation and how to reach them.',
    primaryLabel: 'Contact or Organisation Name',
    primaryPlaceholder: 'e.g. Family GP, Mum, Home Insurance Helpline',
    notesLabel: 'Notes',
    notesPlaceholder: 'Add relationship, instructions, opening hours, or when this contact should be used.',
    contactSectionLabel: 'Contact Details',
    referenceLabel: 'Role / Reference',
    referencePlaceholder: 'Relationship, department or client number',
    startDateLabel: 'Start Date',
    expiryDateLabel: 'Review Date',
    addressLabel: 'Address',
    addressPlaceholder: 'Street, City, Postcode',
    attachmentText: 'Click to add business cards, letters or supporting files',
  },
  account: {
    introTitle: 'Account record',
    introText: 'Use account for memberships, utilities, bank accounts, subscriptions or online services.',
    primaryLabel: 'Account Title',
    primaryPlaceholder: 'e.g. Halifax Current Account, AA Membership, British Gas',
    notesLabel: 'Notes / Description',
    notesPlaceholder: 'Add useful context, what the account is for, or anything someone may need to know.',
    contactSectionLabel: 'Provider Details',
    contactNameLabel: 'Provider or contact name',
    contactNamePlaceholder: 'Bank, utility, support contact',
    referenceLabel: 'Account / Membership No.',
    referencePlaceholder: 'Account, membership or customer number',
    startDateLabel: 'Start Date',
    expiryDateLabel: 'Renewal Date',
    addressLabel: 'Provider Address',
    addressPlaceholder: 'Street, City, Postcode',
    attachmentText: 'Click to add statements, screenshots or account documents',
  },
  policy: {
    introTitle: 'Policy record',
    introText: 'Use policy for insurance, service plans, warranties or any record with cover and renewal dates.',
    primaryLabel: 'Policy Title',
    primaryPlaceholder: 'e.g. Home Insurance, Life Cover, Boiler Care Plan',
    notesLabel: 'Notes / Description',
    notesPlaceholder: 'Add the cover details, provider instructions, claim notes, or anything important to know.',
    contactSectionLabel: 'Provider Details',
    contactNameLabel: 'Provider or adviser',
    contactNamePlaceholder: 'Insurer, broker or support contact',
    referenceLabel: 'Policy Number',
    referencePlaceholder: 'Policy, claim or member number',
    startDateLabel: 'Policy Start Date',
    expiryDateLabel: 'Renewal Date',
    addressLabel: 'Provider Address',
    addressPlaceholder: 'Street, City, Postcode',
    attachmentText: 'Click to add policy documents, schedules or images',
  },
};

const CATEGORY_GUIDES = {
  default: {
    title: 'Common ways to add information',
    text: 'Choose the format that matches what you have: a contact, a document or scan, a short key fact, or a date-based record you want to revisit later.',
    actions: [
      { key: 'contact-general', label: 'Add Contact', itemType: 'contact' },
      { key: 'document-general', label: 'Add Document', itemType: 'document' },
      { key: 'key-info', label: 'Add Key Info', itemType: 'document' },
      { key: 'reminder', label: 'Add Reminder', itemType: 'document' },
    ],
  },
  HEALTH: {
    title: 'Common health records',
    text: 'Health information often mixes people, documents, key facts and dates. Add the doctor as a contact, a prescription or letter as a document, and use dates for visits or renewals.',
    actions: [
      { key: 'health-doctor', label: 'Add Doctor Contact', itemType: 'contact' },
      { key: 'health-document', label: 'Add Prescription or Scan', itemType: 'document' },
      { key: 'health-key-info', label: 'Add Key Health Info', itemType: 'document' },
      { key: 'health-reminder', label: 'Add Visit or Renewal', itemType: 'document' },
    ],
  },
  LEGAL: {
    title: 'Common legal records',
    text: 'Legal information usually works best as separate contacts and documents, so you can store the adviser details apart from the will, deed or letter itself.',
    actions: [
      { key: 'legal-solicitor', label: 'Add Solicitor Contact', itemType: 'contact' },
      { key: 'legal-will', label: 'Add Will Record', itemType: 'document' },
      { key: 'key-info', label: 'Add Key Legal Info', itemType: 'document' },
      { key: 'reminder', label: 'Add Review Reminder', itemType: 'document' },
    ],
  },
};

function getTypeConfig(categoryName, itemType, presetKey) {
  const config = ITEM_TYPE_CONFIG[itemType] || ITEM_TYPE_CONFIG.document;

  if (presetKey === 'key-info' || presetKey === 'health-key-info') {
    return {
      ...ITEM_TYPE_CONFIG.document,
      introTitle: categoryName === 'HEALTH' ? 'Key health information' : 'Key information record',
      introText: 'Use this when the important thing is a short fact that should be easy to find fast, even if there is no file to upload.',
      primaryLabel: 'Information Title',
      primaryPlaceholder: categoryName === 'HEALTH'
        ? 'e.g. Blood Type, Allergy Note, NHS Number'
        : 'e.g. Blood Type, National Insurance Number, Gate Code',
      notesLabel: 'Key Details',
      notesPlaceholder: 'Enter the important information clearly and directly.',
      contactSectionLabel: categoryName === 'HEALTH' ? 'Related Clinician Details' : 'Related Contact Details',
      contactNameLabel: categoryName === 'HEALTH' ? 'Clinician or clinic' : 'Person or organisation',
      contactNamePlaceholder: categoryName === 'HEALTH' ? 'GP, consultant, clinic or pharmacy' : 'Relevant contact or provider',
      referenceLabel: 'Reference / Identifier',
      referencePlaceholder: categoryName === 'HEALTH' ? 'Hospital, patient or prescription reference' : 'Record or reference number',
      startDateLabel: 'Recorded / Effective Date',
      expiryDateLabel: 'Review Date',
      attachmentText: 'Click to add a photo, screenshot or supporting document',
    };
  }

  if (presetKey === 'reminder' || presetKey === 'health-reminder') {
    return {
      ...ITEM_TYPE_CONFIG.document,
      introTitle: 'Date-based record',
      introText: 'Use this when the main thing to remember is a date, such as a clinic visit, renewal, follow-up or prescription review.',
      primaryLabel: 'Event or Reminder Title',
      primaryPlaceholder: categoryName === 'HEALTH'
        ? 'e.g. Clinic Visit, Prescription Renewal'
        : 'e.g. Passport Renewal, MOT Test, Follow-up Call',
      notesLabel: 'Reminder Notes',
      notesPlaceholder: 'Add what is happening, where it is, and what someone should remember nearer the time.',
      contactSectionLabel: categoryName === 'HEALTH' ? 'Related Clinician Details' : 'Related Contact Details',
      contactNameLabel: categoryName === 'HEALTH' ? 'Doctor, clinic or pharmacy' : 'Relevant person or organisation',
      contactNamePlaceholder: categoryName === 'HEALTH' ? 'Consultant, GP, clinic or pharmacy' : 'Contact or provider name',
      referenceLabel: 'Reference / Booking No.',
      referencePlaceholder: categoryName === 'HEALTH' ? 'Clinic, prescription or patient reference' : 'Reference, booking or case number',
      startDateLabel: 'Event / Issue Date',
      expiryDateLabel: 'Reminder / Renewal Date',
      attachmentText: 'Click to add appointment letters, screenshots or related files',
    };
  }

  if (categoryName === 'HEALTH' && itemType === 'contact') {
    return {
      ...config,
      primaryPlaceholder: presetKey === 'health-doctor'
        ? 'e.g. Dr Patel or Greenbank Clinic'
        : 'e.g. GP, dentist, consultant or pharmacy',
      notesPlaceholder: 'Add what this person or service handles, when to contact them, and any useful instructions.',
      referenceLabel: 'Role / Patient Reference',
      referencePlaceholder: 'GP, consultant, patient or clinic reference',
      startDateLabel: 'Date Added',
      expiryDateLabel: 'Review Date',
    };
  }

  if (categoryName === 'HEALTH' && itemType === 'document') {
    return {
      ...config,
      introText: 'Use a separate document record for prescriptions, clinic letters, results, scans or other health paperwork.',
      primaryPlaceholder: presetKey === 'health-document'
        ? 'e.g. Prescription Scan, Clinic Letter, Test Result'
        : 'e.g. Prescription, Clinic Letter, Vaccination Record',
      notesPlaceholder: 'Add what the document is, what it says, where the original is, or what someone should do with it.',
      contactSectionLabel: 'Related Clinician Details',
      contactNameLabel: 'Doctor, clinic or pharmacy',
      contactNamePlaceholder: 'GP, consultant, clinic or pharmacy',
      referenceLabel: 'Prescription / Patient Reference',
      referencePlaceholder: 'Prescription number, NHS number or hospital ref',
      startDateLabel: 'Issue / Visit Date',
      expiryDateLabel: 'Review / Renewal Date',
      attachmentText: 'Click to add a prescription scan, screenshot or medical document',
    };
  }

  if (categoryName === 'LEGAL' && itemType === 'contact') {
    return {
      ...config,
      primaryPlaceholder: presetKey === 'legal-solicitor'
        ? 'e.g. Smith & Co Solicitors or Jane Smith'
        : 'e.g. Solicitor, executor, next of kin, adviser',
      notesPlaceholder: 'Add what this person or firm handles, when to contact them, and anything important to remember.',
      referenceLabel: 'Role / Client Reference',
      referencePlaceholder: 'Solicitor, executor, case or client reference',
      startDateLabel: 'Date Added',
      expiryDateLabel: 'Review Date',
    };
  }

  if (categoryName === 'LEGAL' && itemType === 'document') {
    return {
      ...config,
      introText: 'Use a separate document record for each legal document so location, update date, related contact and attachments stay clear.',
      primaryPlaceholder: presetKey === 'legal-will'
        ? 'e.g. Will & Testament'
        : 'e.g. Will, Power of Attorney, Title Deeds',
      notesPlaceholder: 'Record where the original is kept, what the document covers, and any instructions someone may need.',
      contactSectionLabel: 'Related Professional Details',
      contactNameLabel: 'Solicitor or adviser',
      contactNamePlaceholder: 'Solicitor, firm or executor',
      referenceLabel: 'Document / Case Reference',
      referencePlaceholder: 'Will reference, file number or deed reference',
      startDateLabel: 'Last Updated / Signed Date',
      expiryDateLabel: 'Review Date',
      attachmentText: 'Click to add a screenshot, scanned page or supporting legal document',
    };
  }

  return config;
}

const PRIORITY_LEVELS = [
  { value: 'normal',    label: 'Normal',    color: '#52c41a' },
  { value: 'important', label: 'Important', color: '#e67e00' },
  { value: 'critical',  label: 'Critical',  color: '#e94560' },
];

const PRIORITY_COLORS = { normal: '#52c41a', important: '#e67e00', critical: '#e94560' };

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
  start_date: '',
  expiry_date: '',
};

function CategoryList({ items, selectedItem, onSelectItem, onCreateItem, onOpenAddRecord, loading, categoryName }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedPreset, setSelectedPreset] = useState('');
  const typeConfig = getTypeConfig(categoryName, formData.item_type, selectedPreset);
  const categoryGuide = CATEGORY_GUIDES[categoryName] || CATEGORY_GUIDES.default;

  const set = (field, value) => setFormData(prev => ({ ...prev, [field]: value }));

  const handleTypeChange = (value) => {
    setSelectedPreset('');
    setFormData(prev => {
      const next = { ...prev, item_type: value };

      if (value === 'contact' && !prev.contact_name && prev.title) {
        next.contact_name = prev.title;
      }

      if (value !== 'contact' && !prev.title && prev.contact_name) {
        next.title = prev.contact_name;
      }

      return next;
    });
  };

  const handlePrimaryChange = (value) => {
    if (formData.item_type === 'contact') {
      setFormData(prev => ({
        ...prev,
        contact_name: value,
        title: value,
      }));
      return;
    }

    set('title', value);
  };

  const applyPreset = (preset) => {
    setSelectedPreset(preset.key);
    setFormData(prev => {
      const next = { ...prev, item_type: preset.itemType };

      if (preset.key === 'contact-general') {
        next.priority = 'normal';
      }

      if (preset.key === 'document-general') {
        next.priority = 'normal';
      }

      if (preset.key === 'key-info' || preset.key === 'health-key-info') {
        next.priority = 'important';
      }

      if (preset.key === 'reminder' || preset.key === 'health-reminder') {
        next.priority = 'important';
      }

      if (preset.key === 'health-doctor') {
        next.priority = 'important';
      }

      if (preset.key === 'health-reminder' && !prev.title && !prev.contact_name) {
        next.title = 'Clinic Visit';
      }

      if (preset.key === 'health-key-info' && !prev.title && !prev.contact_name) {
        next.title = 'Blood Type';
      }

      if (preset.key === 'reminder' && !prev.title && !prev.contact_name) {
        next.title = 'Reminder';
      }

      if (preset.key === 'legal-solicitor') {
        next.priority = 'important';
      }

      if (preset.key === 'legal-will') {
        next.priority = 'critical';
        if (!prev.title && !prev.contact_name) {
          next.title = 'Will & Testament';
        }
      }

      return next;
    });
  };

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files || []));
  };

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const normalizedFormData = {
      ...formData,
      title: formData.item_type === 'contact'
        ? (formData.contact_name || '').trim()
        : (formData.title || '').trim(),
      contact_name: (formData.contact_name || '').trim(),
      contact_phone: (formData.contact_phone || '').trim(),
      contact_address: (formData.contact_address || '').trim(),
      contact_email: (formData.contact_email || '').trim(),
      reference_number: (formData.reference_number || '').trim(),
      description: (formData.description || '').trim(),
    };

    onCreateItem(normalizedFormData, selectedFiles);
    setFormData(EMPTY_FORM);
    setSelectedFiles([]);
    setSelectedPreset('');
    setShowForm(false);
  };

  const handleCancel = () => {
    setFormData(EMPTY_FORM);
    setSelectedFiles([]);
    setSelectedPreset('');
    setShowForm(false);
  };

  return (
    <div className="category-list-container">
      <div className="items-panel">

        {/* ── Panel Header ───────────────────────────────── */}
        <div className="panel-header">
          <h3>Records</h3>
          {!showForm && (
            <button
              onClick={() => {
                if (onOpenAddRecord) {
                  onOpenAddRecord(categoryName);
                  return;
                }
                setShowForm(true);
              }}
              className="add-btn"
            >
              + Add Record
            </button>
          )}
        </div>

        {/* ── Add Item Form ───────────────────────────────── */}
        {showForm && (
          <form onSubmit={handleSubmit} className="item-form">
            {categoryGuide && (
              <div className="category-guide">
                <div className="category-guide-copy">
                  <strong>{categoryGuide.title}</strong>
                  <p>{categoryGuide.text}</p>
                </div>
                <div className="category-guide-actions">
                  {categoryGuide.actions.map(action => (
                    <button
                      key={action.key}
                      type="button"
                      className={`guide-action ${selectedPreset === action.key ? 'active' : ''}`}
                      onClick={() => applyPreset(action)}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Type — radio cards */}
            <div className="form-section">
              <label className="field-label">1. Choose Record Type</label>
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
                      onChange={() => handleTypeChange(t.value)}
                    />
                    <span className="rc-icon"><Icon name={t.value} size={16} strokeWidth={1.6} /></span>
                    <span className="rc-label">{t.label}</span>
                    <span className="rc-desc">{t.desc}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="type-intro">
              <div className="type-intro-icon">
                <Icon name={formData.item_type} size={18} strokeWidth={1.7} />
              </div>
              <div>
                <strong>{typeConfig.introTitle}</strong>
                <p>{typeConfig.introText}</p>
              </div>
            </div>

            <div className="form-section">
              <label className="field-label">2. {typeConfig.primaryLabel} <span className="required">*</span></label>
              <input
                type="text"
                className="field-input"
                placeholder={typeConfig.primaryPlaceholder}
                value={formData.item_type === 'contact' ? formData.contact_name : formData.title}
                onChange={(e) => handlePrimaryChange(e.target.value)}
                required
              />
            </div>

            {/* Priority — radio pills */}
            <div className="form-section">
              <label className="field-label">3. Priority</label>
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
              <label className="field-label">4. {typeConfig.notesLabel}</label>
              <textarea
                className="field-input"
                rows={3}
                placeholder={typeConfig.notesPlaceholder}
                value={formData.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>

            {/* Contact section */}
            <div className="form-section">
              <div className="section-divider">
                <span>{typeConfig.contactSectionLabel} <em>(optional)</em></span>
              </div>
              <div className="field-grid">
                {formData.item_type !== 'contact' && (
                  <div className="field-group">
                    <label className="field-label">{typeConfig.contactNameLabel}</label>
                    <input
                      type="text"
                      className="field-input"
                      placeholder={typeConfig.contactNamePlaceholder}
                      value={formData.contact_name}
                      onChange={(e) => set('contact_name', e.target.value)}
                    />
                  </div>
                )}
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
                  <label className="field-label">{typeConfig.referenceLabel}</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder={typeConfig.referencePlaceholder}
                    value={formData.reference_number}
                    onChange={(e) => set('reference_number', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">{typeConfig.startDateLabel} <em>(optional)</em></label>
                  <input
                    type="date"
                    className="field-input"
                    value={formData.start_date}
                    onChange={(e) => set('start_date', e.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label className="field-label">{typeConfig.expiryDateLabel} <em>(optional)</em></label>
                  <input
                    type="date"
                    className="field-input"
                    value={formData.expiry_date}
                    onChange={(e) => set('expiry_date', e.target.value)}
                  />
                </div>
                <div className="field-group full-width">
                  <label className="field-label">{typeConfig.addressLabel}</label>
                  <input
                    type="text"
                    className="field-input"
                    placeholder={typeConfig.addressPlaceholder}
                    value={formData.contact_address}
                    onChange={(e) => set('contact_address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="form-section">
              <div className="section-divider">
                <span>Attachments <em>(optional)</em></span>
              </div>
              <div className="file-upload-area">
                <label htmlFor="file-input" className="file-upload-label">
                  <span className="upload-icon"><Icon name="paperclip" size={15} /></span>
                  <span className="upload-text">{typeConfig.attachmentText}</span>
                </label>
                <input
                  id="file-input"
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="selected-files">
                  <p className="files-label">{selectedFiles.length} file(s) selected:</p>
                  <div className="files-preview">
                    {selectedFiles.map((file, idx) => (
                      <div key={idx} className="file-tag">
                        <span className="file-name">{file.name}</span>
                        <button
                          type="button"
                          className="file-remove"
                          onClick={() => removeFile(idx)}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
            <div className="state-msg">Loading records…</div>
          ) : items.length === 0 ? (
            <div className="state-msg empty">
              <div className="state-icon"><Icon name="folder-plus" size={36} color="#c8cfde" strokeWidth={1.25} /></div>
              <p>No records yet</p>
              <small>Click <strong>+ Add Record</strong> to store your first entry</small>
            </div>
          ) : (
            items.map(item => {
              const contactLine = [item.contact_name, item.contact_phone, item.contact_email]
                .filter(Boolean).join(' · ');

              return (
                <div key={item.id}
                  className={`item-card ${selectedItem?.id === item.id ? 'active' : ''}`}
                  onClick={() => onSelectItem(item)}
                >
                  <div className="item-card-top">
                    <span className="item-type-badge"><Icon name={item.item_type || 'document'} size={14} strokeWidth={1.6} /></span>
                    <h4 className="item-title">{item.title}</h4>
                    <span className="priority-dot" style={{ background: PRIORITY_COLORS[item.priority] || '#52c41a' }} />
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

